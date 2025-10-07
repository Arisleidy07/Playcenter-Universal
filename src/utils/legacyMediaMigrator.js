// src/utils/legacyMediaMigrator.js
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";

const HTTP_RE = /^https?:\/\//i;
const LOCAL_RE = /\/(Productos|productospcu)\//i;

function isHttpUrl(u) {
  return typeof u === "string" && HTTP_RE.test(u);
}
function isLocalUrl(u) {
  return typeof u === "string" && u.startsWith("/") && LOCAL_RE.test(u);
}
function basename(path = "") {
  try {
    const qPos = path.indexOf("?");
    const clean = qPos >= 0 ? path.slice(0, qPos) : path;
    const idx = clean.lastIndexOf("/");
    return idx >= 0 ? clean.slice(idx + 1) : clean;
  } catch {
    return String(path || "");
  }
}

async function fetchBlob(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`No se pudo leer ${url} (${res.status})`);
  return await res.blob();
}

async function uploadToStorage(productId, url) {
  const blob = await fetchBlob(url);
  const name = basename(url) || `file-${Date.now()}`;
  const storagePath = `productos/${productId}/${Date.now()}-${name}`;
  const r = ref(storage, storagePath);
  await uploadBytes(r, blob, { contentType: blob.type || undefined });
  return await getDownloadURL(r);
}

function clone(obj) {
  try { return structuredClone(obj); } catch {
    return JSON.parse(JSON.stringify(obj || null));
  }
}

async function migrateItem(productId, item) {
  if (!item) return item;
  if (typeof item === "string") {
    if (isLocalUrl(item)) return await uploadToStorage(productId, item);
    return item;
  }
  if (typeof item === "object") {
    if (item.url && isLocalUrl(item.url)) {
      const nu = await uploadToStorage(productId, item.url);
      return { ...item, url: nu };
    }
    return item;
  }
  return item;
}

async function migrateArray(productId, arr) {
  const src = Array.isArray(arr) ? arr : [];
  const out = [];
  for (const it of src) out.push(await migrateItem(productId, it));
  return out;
}

function hasLocalInArray(arr) {
  return (Array.isArray(arr) ? arr : []).some((it) => {
    if (typeof it === "string") return isLocalUrl(it);
    if (it && typeof it === "object") return isLocalUrl(it.url);
    return false;
  });
}

function needsMigration(p) {
  if (!p) return false;
  if (isLocalUrl(p.imagen)) return true;
  if (hasLocalInArray(p.imagenPrincipal)) return true;
  if (hasLocalInArray(p.imagenes)) return true;
  if (hasLocalInArray(p.media)) return true;
  if (hasLocalInArray(p.galeriaImagenes)) return true;
  if (hasLocalInArray(p.imagenesExtra)) return true;
  if (hasLocalInArray(p.tresArchivosExtras)) return true;
  if (hasLocalInArray(p.videoAcercaArticulo)) return true;
  if (Array.isArray(p.variantes)) {
    for (const v of p.variantes) {
      if (!v) continue;
      if (isLocalUrl(v.imagen)) return true;
      if (hasLocalInArray(v.imagenPrincipal)) return true;
      if (hasLocalInArray(v.imagenes)) return true;
      if (hasLocalInArray(v.media)) return true;
      if (hasLocalInArray(v.galeriaImagenes)) return true;
    }
  }
  return false;
}

export async function migrateAllLegacyProductMedia(onProgress) {
  const snap = await getDocs(collection(db, "productos"));
  const docs = snap.docs.map((d) => ({ id: d.id, data: d.data() }));
  let migratedCount = 0;
  let totalToProcess = docs.length;

  for (let i = 0; i < docs.length; i++) {
    const { id, data } = docs[i];
    if (!needsMigration(data)) {
      onProgress?.({ type: "skip", id, index: i + 1, total: totalToProcess });
      continue;
    }
    const updated = clone({});

    // Producto level
    if (isLocalUrl(data.imagen)) updated.imagen = await migrateItem(id, data.imagen);
    if (hasLocalInArray(data.imagenPrincipal)) updated.imagenPrincipal = await migrateArray(id, data.imagenPrincipal);
    if (hasLocalInArray(data.imagenes)) updated.imagenes = await migrateArray(id, data.imagenes);
    if (hasLocalInArray(data.media)) updated.media = await migrateArray(id, data.media);
    if (hasLocalInArray(data.galeriaImagenes)) updated.galeriaImagenes = await migrateArray(id, data.galeriaImagenes);
    if (hasLocalInArray(data.imagenesExtra)) updated.imagenesExtra = await migrateArray(id, data.imagenesExtra);
    if (hasLocalInArray(data.tresArchivosExtras)) updated.tresArchivosExtras = await migrateArray(id, data.tresArchivosExtras);
    if (hasLocalInArray(data.videoAcercaArticulo)) updated.videoAcercaArticulo = await migrateArray(id, data.videoAcercaArticulo);

    // Variantes
    if (Array.isArray(data.variantes)) {
      const newVars = [];
      for (const v of data.variantes) {
        const nv = clone(v) || {};
        if (isLocalUrl(nv.imagen)) nv.imagen = await migrateItem(id, nv.imagen);
        if (hasLocalInArray(nv.imagenPrincipal)) nv.imagenPrincipal = await migrateArray(id, nv.imagenPrincipal);
        if (hasLocalInArray(nv.imagenes)) nv.imagenes = await migrateArray(id, nv.imagenes);
        if (hasLocalInArray(nv.media)) nv.media = await migrateArray(id, nv.media);
        if (hasLocalInArray(nv.galeriaImagenes)) nv.galeriaImagenes = await migrateArray(id, nv.galeriaImagenes);
        newVars.push(nv);
      }
      updated.variantes = newVars;
    }

    updated.fechaActualizacion = new Date();
    await setDoc(doc(db, "productos", id), updated, { merge: true });
    migratedCount++;
    onProgress?.({ type: "migrated", id, index: i + 1, total: totalToProcess });
  }

  onProgress?.({ type: "done", migratedCount, total: totalToProcess });
  return { migratedCount, total: totalToProcess };
}
