import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  setDoc,
  onSnapshot,
} from "firebase/firestore";
import {
  ref,
  getDownloadURL,
  deleteObject,
  uploadBytesResumable,
} from "firebase/storage";
import { db, storage } from "../firebase";
import VistaProductoMini from "./VistaProductoMini";
import RichTextEditor from "./RichTextEditor";

import UniversalFileUploader from "./UniversalFileUploader";

const ProductForm = ({ product, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    empresa: "",
    precio: "",
    cantidad: 0,
    descripcion: "",
    categoria: "",
    nuevaCategoria: "",
    imagen: "",
    imagenes: [],
    imagenesExtra: [],
    videoUrl: "",
    videoUrls: [],
    videoAcercaArticulo: [],
    oferta: false,
    precioOferta: "",
    estado: "Nuevo",
    acerca: [""],
    variantes: [
      {
        color: "",
        imagen: "",
        imagenes: [],
        cantidad: 0,
        descripcion: "",
        precio: "",
      },
    ],
    etiquetas: [""],
    activo: true,
    fechaPublicacion: new Date().toISOString().split("T")[0],
    sku: "",
    peso: "",
    dimensiones: "",
  });

  const [categorias, setCategorias] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  // ID actual del producto (existe si estamos editando o si creamos un borrador)
  const [currentId, setCurrentId] = useState(product?.id || null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null); // 0-100 for videos/images
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  // Previews locales (no se guardan en Firestore)
  const [tempPreviews, setTempPreviews] = useState({
    imagen: "",
    imagenes: [],
    productVideos: [],
    acercaVideos: [],
    variantes: {}, // index -> { imagen: '', imagenes: [], videos: [] }
    extras: [],
  });
  // Cola de subidas por archivo (con progreso/cancelar/reintentar)
  const [uploadQueue, setUploadQueue] = useState([]); // {id,name,file,type:'image'|'video',progress,status:'uploading'|'done'|'error'|'canceled', target:{level:'product'|'variant', field, variantIndex|null}, task}

  useEffect(() => {
    loadCategorias();
    loadBrands();
    if (product) {
      setFormData({
        ...product,
        precio: product.precio?.toString() || "",
        fechaPublicacion:
          product.fechaPublicacion || new Date().toISOString().split("T")[0],
        acerca: product.acerca || [""],
        etiquetas: product.etiquetas || [""],
        variantes: product.variantes || [
          { color: "", imagen: "", imagenes: [], cantidad: 0 },
        ],
        videoUrl: product.videoUrl || "",
        videoUrls: product.videoUrls || [],
        videoAcercaArticulo: product.videoAcercaArticulo || [],
      });
    }
  }, [product]);

  // Sincronizar currentId cuando product.id llegue de forma asíncrona (evita crear borradores al editar)
  useEffect(() => {
    if (product?.id && currentId !== product.id) {
      setCurrentId(product.id);
    }
  }, [product?.id]);

  // Advertir si hay subidas en progreso al cerrar/recargar
  useEffect(() => {
    const handler = (e) => {
      const hasUploading = uploadQueue?.some?.(
        (q) => q?.status === "uploading"
      );
      if (hasUploading) {
        e.preventDefault();
        e.returnValue = ""; // Requerido por algunos navegadores
        return "";
      }
      return undefined;
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [uploadQueue]);

  // Suscripción en tiempo real al producto/draft para mantener sincronizado el formulario
  useEffect(() => {
    const id = currentId || product?.id;
    if (!id) return;
    const unsub = onSnapshot(doc(db, "productos", id), (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      // Merge no destructivo: priorizar lo que está en Firestore para medios y campos base,
      // pero no sobreescribir previews locales temporales
      setFormData((prev) => ({
        ...prev,
        id: data.id || id,
        nombre: data.nombre ?? prev.nombre,
        descripcion: data.descripcion ?? prev.descripcion,
        empresa: data.empresa ?? prev.empresa,
        categoria: data.categoria ?? prev.categoria,
        precio:
          (data.precio ?? prev.precio)?.toString?.() ||
          String(data.precio ?? prev.precio ?? ""),
        cantidad: data.cantidad ?? prev.cantidad,
        etiquetas: Array.isArray(data.etiquetas)
          ? data.etiquetas
          : prev.etiquetas || [],
        acerca: Array.isArray(data.acerca) ? data.acerca : prev.acerca || [],
        imagen: data.imagen ?? prev.imagen,
        imagenes: Array.isArray(data.imagenes)
          ? data.imagenes
          : prev.imagenes || [],
        videoUrl: data.videoUrl ?? prev.videoUrl,
        videoUrls: Array.isArray(data.videoUrls)
          ? data.videoUrls
          : prev.videoUrls || [],
        videoAcercaArticulo: Array.isArray(data.videoAcercaArticulo)
          ? data.videoAcercaArticulo
          : prev.videoAcercaArticulo || [],
        variantes: Array.isArray(data.variantes)
          ? data.variantes
          : prev.variantes || [],
        activo: data.activo ?? prev.activo,
      }));

      // Normalizar URLs legacy (paths de Storage o URLs sin alt=media) y arrays de objetos {url}
      (async () => {
        // Convierte una URL HTTPS de Firebase Storage en un StorageReference compatible
        const refFromUrlish = (s) => {
          try {
            if (!s) return null;
            const url = String(s);
            if (url.includes("firebasestorage.googleapis.com")) {
              const m = url.match(/\/o\/([^?]+)/);
              if (m && m[1]) {
                const objectPath = decodeURIComponent(m[1]);
                return ref(storage, objectPath);
              }
            }
            // Si no es una URL de Firebase o no pudimos extraer el path, asumir que es un path de Storage
            return ref(storage, url);
          } catch {
            return null;
          }
        };

        // Múltiples videos handler moved to top-level: handleAcercaVideosUFU

        // Extraer URL desde string u objeto {url}
        const pickUrl = (u) => {
          try {
            if (!u) return "";
            if (typeof u === "string") return u;
            if (typeof u === "object" && u !== null) {
              if (typeof u.url === "string") return u.url;
            }
            return String(u || "").trim();
          } catch {
            return "";
          }
        };

        const normalizeOne = async (u) => {
          try {
            if (!u) return u;
            const raw = pickUrl(u);
            const s = String(raw).trim();
            if (s.startsWith("blob:")) return s;
            if (/^https?:\/\//i.test(s)) {
              // Si es URL de Firebase Storage, obtener un downloadURL válido (con token)
              if (s.includes("firebasestorage.googleapis.com")) {
                const r = refFromUrlish(s);
                if (r) {
                  try {
                    return await getDownloadURL(r);
                  } catch {
                    /* fallthrough */
                  }
                }
                return s;
              }
              return s;
            }
            // Paths tipo 'Productos/archivo.jpg' o 'products/...'
            const r = ref(storage, s);
            return await getDownloadURL(r);
          } catch {
            return u;
          }
        };

        const mapList = async (arr) =>
          Array.isArray(arr) ? Promise.all(arr.map(normalizeOne)) : [];

        const [
          imgNorm,
          imgsNorm,
          vidSingleNorm,
          vidsNorm,
          extrasNorm,
          acercaVidsNorm,
        ] = await Promise.all([
          normalizeOne(data.imagen ?? data.imagenPrincipal?.[0]?.url),
          mapList(data.imagenes ?? data.galeriaImagenes),
          normalizeOne(
            data.videoUrl ?? data.videoAcercaArticulo?.[0]?.url ?? data.video
          ),
          mapList(data.videoUrls),
          mapList(data.imagenesExtra ?? data.tresArchivosExtras),
          mapList(data.videoAcercaArticulo),
        ]);

        // Normalizar variantes (soportar {url} y nombres legacy)
        const normalizeVariant = (v) => {
          const imagenVar = v?.imagen ?? v?.imagenPrincipal?.[0]?.url ?? "";
          const imagenesVar = Array.isArray(v?.imagenes)
            ? v.imagenes
            : Array.isArray(v?.galeriaImagenes)
            ? v.galeriaImagenes
            : [];
          const videoUrlsVar = Array.isArray(v?.videoUrls) ? v.videoUrls : [];
          const toStr = (x) => pickUrl(x);
          return {
            ...v,
            imagen: toStr(imagenVar),
            imagenes: imagenesVar.map(toStr).filter(Boolean),
            videoUrls: videoUrlsVar.map(toStr).filter(Boolean),
          };
        };
        const variantesNorm = Array.isArray(data.variantes)
          ? data.variantes.map(normalizeVariant)
          : prev.variantes || [];

        setFormData((prev) => ({
          ...prev,
          imagen: imgNorm || prev.imagen,
          imagenes: imgsNorm?.length ? imgsNorm : prev.imagenes,
          videoUrl: vidSingleNorm || prev.videoUrl,
          videoUrls: vidsNorm?.length ? vidsNorm : prev.videoUrls,
          imagenesExtra: extrasNorm?.length ? extrasNorm : prev.imagenesExtra,
          videoAcercaArticulo: acercaVidsNorm?.length
            ? acercaVidsNorm
            : prev.videoAcercaArticulo,
          variantes: variantesNorm,
        }));
      })();
    });
    return () => unsub();
  }, [currentId, product?.id]);

  // Limpieza: eliminar cualquier inyección previa del video de ejemplo (flower.mp4)
  const defaultsAppliedRef = useRef(false);
  useEffect(() => {
    if (defaultsAppliedRef.current) return;
    try {
      const defaultVideo =
        "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";
      const list = Array.isArray(formData.videoAcercaArticulo)
        ? formData.videoAcercaArticulo
        : [];
      const hasDefault = list.some((u) => String(u).trim() === defaultVideo);
      if (hasDefault) {
        const cleaned = list.filter((u) => String(u).trim() !== defaultVideo);
        setFormData((prev) => ({ ...prev, videoAcercaArticulo: cleaned }));
        const targetId = currentId || product?.id;
        if (targetId) {
          updateDoc(doc(db, "productos", targetId), {
            videoAcercaArticulo: cleaned,
            fechaActualizacion: new Date(),
          }).catch(() => {});
        }
      }
    } catch {}
    defaultsAppliedRef.current = true;
  }, [formData.videoAcercaArticulo, currentId, product?.id]);

  // Auto-guardado desactivado para evitar guardados ocultos de campos de texto/base.

  // Datos para Vista Previa Mini: combinar formData + tempPreviews para feedback instantáneo
  const productIdForPreview = currentId || product?.id || null;
  const miniDraft = useMemo(() => {
    const draft = {};
    draft.id = productIdForPreview || "draft";
    draft.name = formData.nombre || "";
    draft.price = parseFloat(formData.precio) || 0;
    draft.stock = Number(formData.cantidad) || 0;
    draft.mainImage = (tempPreviews.imagen || formData.imagen || "").trim();
    draft.gallery = [
      ...(Array.isArray(tempPreviews.imagenes) ? tempPreviews.imagenes : []),
      ...(Array.isArray(formData.imagenes) ? formData.imagenes : []),
    ];
    // Videos de galería (se muestran en la galería principal)
    draft.productVideos = [
      ...(Array.isArray(tempPreviews.productVideos)
        ? tempPreviews.productVideos
        : []),
      ...(Array.isArray(formData.videoUrls) ? formData.videoUrls : []),
    ];
    // Videos de "Acerca de este artículo" (carrusel independiente)
    draft.videoAcercaArticulo = [
      ...(Array.isArray(tempPreviews.acercaVideos)
        ? tempPreviews.acercaVideos
        : []),
      ...(Array.isArray(formData.videoAcercaArticulo)
        ? formData.videoAcercaArticulo
        : formData.videoUrl
        ? [formData.videoUrl]
        : []),
    ];
    draft.extraMedia = [
      ...(Array.isArray(tempPreviews.extras) ? tempPreviews.extras : []),
      ...(Array.isArray(formData.imagenesExtra) ? formData.imagenesExtra : []),
    ];
    draft.variants = (
      Array.isArray(formData.variantes) ? formData.variantes : []
    ).map((v, idx) => ({
      id: v.id || `var_${idx}`,
      name: v.name || v.color || `Variante ${idx + 1}`,
      price: v.precio ?? v.price ?? null,
      stock: v.cantidad ?? v.stock ?? null,
      mainImage: (
        tempPreviews.variantes?.[idx]?.imagen ||
        v.imagen ||
        ""
      ).trim(),
      gallery: [
        ...(tempPreviews.variantes?.[idx]?.imagenes || []),
        ...(Array.isArray(v.imagenes) ? v.imagenes : []),
      ],
      videos: [
        ...(tempPreviews.variantes?.[idx]?.videos || []),
        ...(Array.isArray(v.videoUrls) ? v.videoUrls : []),
      ],
    }));
    return draft;
  }, [productIdForPreview, formData, tempPreviews]);

  // Obtener ID del producto actual. No crear borradores automáticamente para evitar duplicados.
  const ensureCurrentId = async () => {
    if (product?.id) return product.id;
    if (formData?.id) return formData.id;
    if (currentId) return currentId;
    // No auto-crear: los handlers deben abortar subida si no hay ID todavía
    return null;
  };

  // Persistir un campo específico de inmediato (safe, solo actualiza ese campo)
  const persistFieldImmediate = async (field, value) => {
    // Evitar guardar campos transitorios del formulario
    if (["nuevaCategoria", "_tempVideoUrl"].includes(field)) return;
    try {
      const existingId = product?.id || formData?.id || currentId;
      const isEditing = Boolean(existingId);
      let targetId = existingId;
      // Si estamos editando y aún no tenemos ID, NO crear borradores: esperar
      if (!targetId) {
        if (isEditing) return;
        targetId = await ensureCurrentId();
        if (!targetId) return;
      }
      await updateDoc(doc(db, "productos", targetId), {
        [field]: value,
        fechaActualizacion: new Date(),
      });
    } catch (e) {
      // silencioso: no bloquear la UI
    }
  };

  // -------- Helpers de rutas y IDs estables --------
  const makeUniqueName = (file) => {
    const base = (file?.name || "file").replace(/[^a-zA-Z0-9_.-]/g, "_");
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${base}`;
  };

  const buildStoragePath = ({ productId, section, file, variantId = null }) => {
    const fname = makeUniqueName(file);
    if (variantId) {
      if (section === "main")
        return `products/${productId}/variants/${variantId}/main/${fname}`;
      if (section === "gallery")
        return `products/${productId}/variants/${variantId}/gallery/${fname}`;
    } else {
      if (section === "main") return `products/${productId}/main/${fname}`;
      if (section === "gallery")
        return `products/${productId}/gallery/${fname}`;
      if (section === "videos") return `products/${productId}/videos/${fname}`;
      if (section === "extras") return `products/${productId}/extras/${fname}`;
    }
    return `products/${productId}/misc/${fname}`;
  };

  const getOrCreateVariantId = (variantIndex) => {
    const v = (formData.variantes || [])[variantIndex] || {};
    if (v.id) return v.id;
    const newId = `var_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    // persistir inmediatamente en estado y Firestore si hay doc
    setFormData((prev) => {
      const variantes = [...(prev.variantes || [])];
      variantes[variantIndex] = {
        ...(variantes[variantIndex] || {}),
        id: newId,
      };
      const next = { ...prev, variantes };
      const targetId = currentId || product?.id;
      if (targetId)
        updateDoc(doc(db, "productos", targetId), {
          variantes,
          fechaActualizacion: new Date(),
        }).catch(() => {});
      return next;
    });
    return newId;
  };

  // Guardar borrador explícitamente y cerrar el formulario
  const handleSaveDraft = async () => {
    const draft = { ...formData };
    // Normalizar listas
    draft.acerca = (draft.acerca || []).filter((x) => (x || "").trim());
    draft.etiquetas = (draft.etiquetas || []).filter((x) => (x || "").trim());
    draft.activo = false; // siempre como borrador
    draft.fechaActualizacion = new Date();
    delete draft.nuevaCategoria;
    delete draft._tempVideoUrl;

    try {
      let id = product?.id || currentId;
      if (!id) {
        id = `prod_${Date.now()}`;
        draft.id = id;
        draft.fechaCreacion = new Date();
        await setDoc(doc(db, "productos", id), draft);
        setCurrentId(id);
      } else {
        await updateDoc(doc(db, "productos", id), draft);
      }
      if (onClose) onClose();
    } catch (e) {
      console.error("Error al guardar borrador:", e);
      alert(
        "No se pudo guardar el borrador. Revisa tu conexión e intenta nuevamente."
      );
    }
  };

  // Helpers para reordenar videos del producto (persistencia inmediata)
  const moveProductVideo = (fromIndex, direction) => {
    setFormData((prev) => {
      const vids = Array.isArray(prev.videoUrls) ? [...prev.videoUrls] : [];
      const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
      if (toIndex < 0 || toIndex >= vids.length) return prev;
      const [m] = vids.splice(fromIndex, 1);
      vids.splice(toIndex, 0, m);
      const next = { ...prev, videoUrls: vids };
      const targetId = currentId || product?.id;
      if (targetId)
        updateDoc(doc(db, "productos", targetId), {
          videoUrls: vids,
          fechaActualizacion: new Date(),
        }).catch(() => {});
      return next;
    });
  };

  // Helpers para reordenar videos de una variante (persistencia inmediata)
  const moveVariantVideo = (variantIndex, fromIndex, direction) => {
    setFormData((prev) => {
      const variantes = [...prev.variantes];
      const vids = Array.isArray(variantes[variantIndex]?.videoUrls)
        ? [...variantes[variantIndex].videoUrls]
        : [];
      const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
      if (toIndex < 0 || toIndex >= vids.length) return prev;
      const [m] = vids.splice(fromIndex, 1);
      vids.splice(toIndex, 0, m);
      variantes[variantIndex] = { ...variantes[variantIndex], videoUrls: vids };
      const next = { ...prev, variantes };
      const targetId = currentId || product?.id;
      if (targetId)
        updateDoc(doc(db, "productos", targetId), {
          variantes,
          fechaActualizacion: new Date(),
        }).catch(() => {});
      return next;
    });
  };

  const loadCategorias = async () => {
    try {
      const categoriasSnap = await getDocs(collection(db, "categorias"));
      const categoriasData = categoriasSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCategorias(categoriasData);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const handleVariantVideoUpload = async (files, variantIndex) => {
    if (!files?.length) return;
    // asegurar IDs
    let targetId = currentId || product?.id;
    if (!targetId) targetId = await ensureCurrentId();
    const variantId = getOrCreateVariantId(variantIndex);
    setUploadingImages(true);
    const tasks = Array.from(files).map(async (file) => {
      const id = `${Date.now()}_${file.name}_${Math.random()
        .toString(36)
        .slice(2, 7)}`;
      setUploadQueue((prev) => [
        ...prev,
        {
          id,
          name: file.name,
          file,
          type: "video",
          progress: 0,
          status: "uploading",
          target: { level: "variant", field: "videoUrls", variantIndex },
          task: null,
        },
      ]);
      try {
        const destPath = buildStoragePath({
          productId: targetId,
          section: "gallery",
          file,
          variantId,
        });
        const url = await uploadWithRetry(uploadVideo, file, destPath, id);
        // Update local + Firestore (when editing) using functional state to avoid races
        setFormData((prev) => {
          const current = Array.isArray(prev.variantes[variantIndex]?.videoUrls)
            ? prev.variantes[variantIndex].videoUrls
            : [];
          const newVariants = prev.variantes.map((v, i) =>
            i === variantIndex ? { ...v, videoUrls: [...current, url] } : v
          );
          updateDoc(doc(db, "productos", targetId), {
            variantes: newVariants,
            fechaActualizacion: new Date(),
          }).catch(() => {});
          return { ...prev, variantes: newVariants };
        });
      } catch (e) {
        console.error("Variant video upload failed for file", file?.name, e);
      }
    });
    try {
      await Promise.allSettled(tasks);
    } finally {
      setUploadingImages(false);
      setUploadProgress(null);
    }
  };

  const loadBrands = async () => {
    try {
      const snap = await getDocs(collection(db, "productos"));
      const all = snap.docs.map((d) => d.data()?.empresa).filter(Boolean);
      const unique = Array.from(new Set(all)).sort((a, b) =>
        a.localeCompare(b)
      );
      setBrands(unique);
    } catch (e) {
      // silently ignore
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Persistir inmediatamente cualquier cambio de campo (safe por campo)
    persistFieldImmediate(field, value);
  };

  const handleArrayChange = (field, index, value) => {
    setFormData((prev) => {
      const nextArr = prev[field].map((item, i) =>
        i === index ? value : item
      );
      const next = { ...prev, [field]: nextArr };
      // Persistir arreglo actualizado
      persistFieldImmediate(field, nextArr);
      return next;
    });
  };

  const addArrayItem = (field) => {
    setFormData((prev) => {
      const appended = [
        ...prev[field],
        field === "variantes"
          ? {
              color: "",
              imagen: "",
              imagenes: [],
              cantidad: 0,
              descripcion: "",
              precio: "",
            }
          : "",
      ];
      const next = { ...prev, [field]: appended };
      persistFieldImmediate(field, appended);
      return next;
    });
  };

  const removeArrayItem = (field, index) => {
    setFormData((prev) => {
      const filtered = prev[field].filter((_, i) => i !== index);
      const next = { ...prev, [field]: filtered };
      persistFieldImmediate(field, filtered);
      return next;
    });
  };

  const handleVariantChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      variantes: prev.variantes.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant
      ),
    }));
    // Persistir variantes inmediatamente si hay doc
    const targetId = currentId || product?.id;
    if (targetId) {
      try {
        // Construir el nuevo array en base al estado más reciente conocido
        setFormData((prev) => {
          const nuevas = prev.variantes.map((v, i) =>
            i === index ? { ...v, [field]: value } : v
          );
          updateDoc(doc(db, "productos", targetId), {
            variantes: nuevas,
            fechaActualizacion: new Date(),
          }).catch(() => {});
          return { ...prev, variantes: nuevas };
        });
      } catch {}
    }
  };

  const uploadImage = async (file, destPath, queueId) => {
    return new Promise((resolve, reject) => {
      try {
        const imageRef = ref(storage, destPath);
        const task = uploadBytesResumable(imageRef, file);
        // attach task to queue item
        setUploadQueue((prev) =>
          prev.map((q) => (q.id === queueId ? { ...q, task } : q))
        );
        task.on(
          "state_changed",
          (snap) => {
            const pct = Math.round(
              (snap.bytesTransferred / snap.totalBytes) * 100
            );
            setUploadProgress(pct);
            setUploadQueue((prev) =>
              prev.map((q) => (q.id === queueId ? { ...q, progress: pct } : q))
            );
            // Watchdog: si sigue en 0% tras 6s, cancelar para reintentar
            setTimeout(() => {
              setUploadQueue((prev) => {
                const item = prev.find((q) => q.id === queueId);
                if (
                  item &&
                  item.status === "uploading" &&
                  (!item.progress || item.progress === 0) &&
                  item.task
                ) {
                  try {
                    item.task.cancel();
                  } catch {}
                  return prev.map((q) =>
                    q.id === queueId ? { ...q, status: "error" } : q
                  );
                }
                return prev;
              });
            }, 6000);
          },
          (err) => {
            setUploadQueue((prev) =>
              prev.map((q) =>
                q.id === queueId ? { ...q, status: "error" } : q
              )
            );
            reject(err);
          },
          async () => {
            const url = await getDownloadURL(task.snapshot.ref);
            setUploadQueue((prev) =>
              prev.map((q) => (q.id === queueId ? { ...q, status: "done" } : q))
            );
            resolve(url);
          }
        );
      } catch (e) {
        setUploadQueue((prev) =>
          prev.map((q) => (q.id === queueId ? { ...q, status: "error" } : q))
        );
        reject(e);
      }
    });
  };

  const uploadVideo = async (file, destPath, queueId) => {
    return new Promise((resolve, reject) => {
      try {
        const videoRef = ref(storage, destPath);
        const task = uploadBytesResumable(videoRef, file);
        setUploadQueue((prev) =>
          prev.map((q) => (q.id === queueId ? { ...q, task } : q))
        );
        task.on(
          "state_changed",
          (snap) => {
            const pct = Math.round(
              (snap.bytesTransferred / snap.totalBytes) * 100
            );
            setUploadProgress(pct);
            setUploadQueue((prev) =>
              prev.map((q) => (q.id === queueId ? { ...q, progress: pct } : q))
            );
          },
          (err) => {
            setUploadQueue((prev) =>
              prev.map((q) =>
                q.id === queueId ? { ...q, status: "error" } : q
              )
            );
            reject(err);
          },
          async () => {
            const url = await getDownloadURL(task.snapshot.ref);
            setUploadQueue((prev) =>
              prev.map((q) => (q.id === queueId ? { ...q, status: "done" } : q))
            );
            resolve(url);
          }
        );
      } catch (e) {
        setUploadQueue((prev) =>
          prev.map((q) => (q.id === queueId ? { ...q, status: "error" } : q))
        );
        reject(e);
      }
    });
  };

  // Helper con reintentos y backoff simple
  const uploadWithRetry = async (
    fn,
    file,
    pathKey,
    queueId,
    maxRetries = 2
  ) => {
    let lastErr;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const url = await fn(file, pathKey, queueId);
        return url;
      } catch (e) {
        lastErr = e;
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
      }
    }
    throw lastErr;
  };

  // Borrar un archivo de Firebase Storage a partir de su URL pública (si aplica)
  const deleteFromStorageByUrl = async (url) => {
    if (!url) return;
    try {
      const toRef = (s) => {
        try {
          const u = String(s);
          if (u.startsWith("gs://")) return ref(storage, u);
          if (u.includes("firebasestorage.googleapis.com")) {
            const m = u.match(/\/o\/([^?]+)/);
            if (m && m[1]) {
              const objectPath = decodeURIComponent(m[1]);
              return ref(storage, objectPath);
            }
          }
          return ref(storage, u);
        } catch {
          return null;
        }
      };
      const r = toRef(url);
      if (r) await deleteObject(r);
    } catch (e) {
      // Ignorar errores (URLs externas o falta de permisos)
    }
  };

  // Detectar tipo a partir de la URL (para extras guardados)
  const detectTypeFromUrl = (url) => {
    try {
      const clean = String(url).split("?")[0].split("#")[0].toLowerCase();
      const ext = clean.split(".").pop() || "";
      if (["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(ext))
        return "image";
      if (["mp4", "mov", "avi", "mkv", "webm", "m4v"].includes(ext))
        return "video";
      return "document";
    } catch {
      return "document";
    }
  };

  const handleVideoFilesUpload = async (files) => {
    if (!files?.length) return;
    // asegurar ID de producto para rutas estables y Firestore inmediato
    let targetId = currentId || product?.id;
    if (!targetId) targetId = await ensureCurrentId();
    setUploadingImages(true);
    const tasks = Array.from(files).map(async (file) => {
      const id = `${Date.now()}_${file.name}_${Math.random()
        .toString(36)
        .slice(2, 7)}`;
      setUploadQueue((prev) => [
        ...prev,
        {
          id,
          name: file.name,
          file,
          type: "video",
          progress: 0,
          status: "uploading",
          target: { level: "product", field: "videoUrls", variantIndex: null },
          task: null,
        },
      ]);
      try {
        const destPath = buildStoragePath({
          productId: targetId,
          section: "videos",
          file,
        });
        const url = await uploadWithRetry(uploadVideo, file, destPath, id);
        // Update local state immediately
        setFormData((prev) => {
          const next = { ...prev, videoUrls: [...(prev.videoUrls || []), url] };
          // Instant Firestore propagation when editing existing product
          updateDoc(doc(db, "productos", targetId), {
            videoUrls: next.videoUrls,
            fechaActualizacion: new Date(),
          }).catch(() => {});
          return next;
        });
      } catch (e) {
        console.error("Video upload failed for file", file?.name, e);
      }
    });
    try {
      await Promise.allSettled(tasks);
    } finally {
      setUploadingImages(false);
      setUploadProgress(null);
    }
  };

  const handleImageUpload = async (files, field, variantIndex = null) => {
    // Crear previews locales inmediatas
    const localUrls = Array.from(files).map((f) => URL.createObjectURL(f));
    if (variantIndex !== null) {
      setTempPreviews((prev) => {
        const actual = prev.variantes[variantIndex] || {
          imagen: "",
          imagenes: [],
        };
        if (field === "imagen") {
          return {
            ...prev,
            variantes: {
              ...prev.variantes,
              [variantIndex]: { ...actual, imagen: localUrls[0] },
            },
          };
        }
        if (field === "imagenes") {
          return {
            ...prev,
            variantes: {
              ...prev.variantes,
              [variantIndex]: {
                ...actual,
                imagenes: [...actual.imagenes, ...localUrls],
              },
            },
          };
        }
        return prev;
      });
    } else if (field === "imagen") {
      setTempPreviews((prev) => ({ ...prev, imagen: localUrls[0] }));
    } else if (field === "imagenes") {
      setTempPreviews((prev) => ({
        ...prev,
        imagenes: [...prev.imagenes, ...localUrls],
      }));
    }

    // asegurar ID antes de subir para rutas y preview en tiempo real
    let targetId = currentId || product?.id;
    if (!targetId) targetId = await ensureCurrentId();
    setUploadingImages(true);
    const filesArr = Array.from(files);
    const tasks = filesArr.map(async (file) => {
      const id = `${Date.now()}_${file.name}_${Math.random()
        .toString(36)
        .slice(2, 7)}`;
      setUploadQueue((prev) => [
        ...prev,
        {
          id,
          name: file.name,
          file,
          type: "image",
          progress: 0,
          status: "uploading",
          target: {
            level: variantIndex !== null ? "variant" : "product",
            field,
            variantIndex,
          },
          task: null,
        },
      ]);
      try {
        // decidir sección y ruta de Storage
        let destPath;
        if (variantIndex !== null) {
          const variantId = getOrCreateVariantId(variantIndex);
          destPath = buildStoragePath({
            productId: targetId,
            section: field === "imagen" ? "main" : "gallery",
            file,
            variantId,
          });
        } else {
          destPath = buildStoragePath({
            productId: targetId,
            section: field === "imagen" ? "main" : "gallery",
            file,
          });
        }
        const url = await uploadWithRetry(uploadImage, file, destPath, id);
        if (variantIndex !== null) {
          // Functional set to avoid races and also update Firestore immediately when editing
          setFormData((prev) => {
            if (field === "imagen") {
              const newVariants = prev.variantes.map((v, i) =>
                i === variantIndex ? { ...v, imagen: url } : v
              );
              updateDoc(doc(db, "productos", targetId), {
                variantes: newVariants,
                fechaActualizacion: new Date(),
              }).catch(() => {});
              return { ...prev, variantes: newVariants };
            } else if (field === "imagenes") {
              const current = Array.isArray(
                prev.variantes[variantIndex]?.imagenes
              )
                ? prev.variantes[variantIndex].imagenes
                : [];
              const newVariants = prev.variantes.map((v, i) =>
                i === variantIndex ? { ...v, imagenes: [...current, url] } : v
              );
              updateDoc(doc(db, "productos", targetId), {
                variantes: newVariants,
                fechaActualizacion: new Date(),
              }).catch(() => {});
              return { ...prev, variantes: newVariants };
            } else {
              const current = Array.isArray(
                prev.variantes[variantIndex]?.[field]
              )
                ? prev.variantes[variantIndex][field]
                : [];
              const newVariants = prev.variantes.map((v, i) =>
                i === variantIndex ? { ...v, [field]: [...current, url] } : v
              );
              updateDoc(doc(db, "productos", targetId), {
                variantes: newVariants,
                fechaActualizacion: new Date(),
              }).catch(() => {});
              return { ...prev, variantes: newVariants };
            }
          });
        } else if (field === "imagen") {
          setFormData((prev) => {
            const next = { ...prev, imagen: url };
            updateDoc(doc(db, "productos", targetId), {
              imagen: url,
              fechaActualizacion: new Date(),
            }).catch(() => {});
            return next;
          });
        } else {
          setFormData((prev) => {
            const next = { ...prev, [field]: [...prev[field], url] };
            updateDoc(doc(db, "productos", targetId), {
              [field]: next[field],
              fechaActualizacion: new Date(),
            }).catch(() => {});
            return next;
          });
        }
      } catch (e) {
        console.error("Image upload failed for file", file?.name, e);
      }
    });
    try {
      await Promise.allSettled(tasks);
    } catch {}
    setUploadingImages(false);
    setUploadProgress(null);
    // Limpiar previews locales usadas para esta carga
    if (variantIndex !== null) {
      setTempPreviews((prev) => {
        const copy = { ...prev.variantes[variantIndex] };
        if (field === "imagen") copy.imagen = "";
        if (field === "imagenes") copy.imagenes = [];
        return {
          ...prev,
          variantes: { ...prev.variantes, [variantIndex]: copy },
        };
      });
    } else if (field === "imagen") {
      setTempPreviews((prev) => ({ ...prev, imagen: "" }));
    } else if (field === "imagenes") {
      setTempPreviews((prev) => ({ ...prev, imagenes: [] }));
    }
  };

  // ---- Extras (Tres archivos) ----
  const handleExtrasUpload = async (files) => {
    if (!files?.length) return;
    const remaining = Math.max(0, 3 - (formData.imagenesExtra?.length || 0));
    const toAdd = Array.from(files).slice(0, remaining);
    // previews locales
    const localUrls = toAdd.map((f) => URL.createObjectURL(f));
    setTempPreviews((prev) => ({
      ...prev,
      extras: [...(prev.extras || []), ...localUrls],
    }));
    // asegurar ID antes de subir
    let targetId = currentId || product?.id;
    if (!targetId) targetId = await ensureCurrentId();
    setUploadingImages(true);
    const tasks = toAdd.map(async (file) => {
      const id = `${Date.now()}_${file.name}_${Math.random()
        .toString(36)
        .slice(2, 7)}`;
      setUploadQueue((prev) => [
        ...prev,
        {
          id,
          name: file.name,
          file,
          type: "file",
          progress: 0,
          status: "uploading",
          target: {
            level: "product",
            field: "imagenesExtra",
            variantIndex: null,
          },
          task: null,
        },
      ]);
      try {
        const destPath = buildStoragePath({
          productId: targetId,
          section: "extras",
          file,
        });
        const url = await uploadWithRetry(uploadImage, file, destPath, id);
        setFormData((prev) => {
          const next = {
            ...prev,
            imagenesExtra: [...(prev.imagenesExtra || []), url],
          };
          updateDoc(doc(db, "productos", targetId), {
            imagenesExtra: next.imagenesExtra,
            fechaActualizacion: new Date(),
          }).catch(() => {});
          return next;
        });
      } catch (e) {
        console.error("Extras upload failed for file", file?.name, e);
      }
    });
    try {
      await Promise.allSettled(tasks);
    } finally {
      setUploadingImages(false);
      setUploadProgress(null);
      setTempPreviews((prev) => ({ ...prev, extras: [] }));
    }
  };

  const moveExtraFile = (fromIndex, direction) => {
    setFormData((prev) => {
      const arr = Array.isArray(prev.imagenesExtra)
        ? [...prev.imagenesExtra]
        : [];
      const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
      if (toIndex < 0 || toIndex >= arr.length) return prev;
      const [m] = arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, m);
      const next = { ...prev, imagenesExtra: arr };
      const targetId = currentId || product?.id;
      if (targetId)
        updateDoc(doc(db, "productos", targetId), {
          imagenesExtra: arr,
          fechaActualizacion: new Date(),
        }).catch(() => {});
      return next;
    });
  };

  const removeExtraFile = async (index) => {
    const url = formData.imagenesExtra?.[index];
    if (url) await deleteFromStorageByUrl(url);
    const updated = (formData.imagenesExtra || []).filter(
      (_, i) => i !== index
    );
    handleInputChange("imagenesExtra", updated);
  };

  // Borrado helpers para otras secciones
  const removeProductVideo = async (index) => {
    const url = formData.videoUrls?.[index];
    if (url) await deleteFromStorageByUrl(url);
    const updated = (formData.videoUrls || []).filter((_, i) => i !== index);
    handleInputChange("videoUrls", updated);
  };

  const removeProductImage = async (index) => {
    const url = formData.imagenes?.[index];
    if (url) await deleteFromStorageByUrl(url);
    const updated = (formData.imagenes || []).filter((_, i) => i !== index);
    handleInputChange("imagenes", updated);
  };

  const removeVariantImage = async (variantIndex, index) => {
    const url = formData.variantes?.[variantIndex]?.imagenes?.[index];
    if (url) await deleteFromStorageByUrl(url);
    const updated = (formData.variantes?.[variantIndex]?.imagenes || []).filter(
      (_, i) => i !== index
    );
    handleVariantChange(variantIndex, "imagenes", updated);
  };

  const removeVariantVideo = async (variantIndex, index) => {
    const url = formData.variantes?.[variantIndex]?.videoUrls?.[index];
    if (url) await deleteFromStorageByUrl(url);
    const updated = (
      formData.variantes?.[variantIndex]?.videoUrls || []
    ).filter((_, i) => i !== index);
    handleVariantChange(variantIndex, "videoUrls", updated);
  };

  const removeMainImage = async () => {
    if (formData.imagen) await deleteFromStorageByUrl(formData.imagen);
    // Limpiar tanto legacy como nuevo formato
    handleInputChange("imagen", "");
    handleInputChange("imagenPrincipal", []);
  };

  // removed legacy single additional video handler in favor of multi 'videoAcercaArticulo'

  // ====== UniversalFileUploader Handlers (instant preview + background upload) ======
  const handleMainImageUFU = async (filesList) => {
    try {
      setUploadingImages(true);
      const arr = Array.isArray(filesList) ? filesList : [];
      if (arr.length === 0) {
        setTempPreviews((prev) => ({ ...prev, imagen: "" }));
        await removeMainImage();
        return;
      }
      const first = arr[0];
      const url0 = first?.url || "";
      if (first?.file) {
        // show local preview immediately
        setTempPreviews((prev) => ({ ...prev, imagen: url0 }));
        let targetId = currentId || product?.id;
        if (!targetId) targetId = await ensureCurrentId();
        if (!targetId) return; // aún sin ID: mantener preview y abortar subida
        const queueId = `${Date.now()}_${first.file.name}_${Math.random()
          .toString(36)
          .slice(2, 7)}`;
        const destPath = buildStoragePath({
          productId: targetId,
          section: "main",
          file: first.file,
        });
        const remoteUrl = await uploadWithRetry(
          uploadImage,
          first.file,
          destPath,
          queueId
        );
        setFormData((prev) => {
          const imgs = Array.isArray(prev.imagenes) ? [...prev.imagenes] : [];
          // Asegurar que la imagen principal también esté en la galería (al inicio)
          if (!imgs.includes(remoteUrl)) imgs.unshift(remoteUrl);
          const imagenPrincipal = [{ url: remoteUrl }];
          const next = {
            ...prev,
            imagen: remoteUrl,
            imagenPrincipal,
            imagenes: imgs,
          };
          updateDoc(doc(db, "productos", targetId), {
            imagen: remoteUrl,
            imagenPrincipal,
            imagenes: imgs,
            fechaActualizacion: new Date(),
          }).catch(() => {});
          return next;
        });
      } else if (url0 && !url0.startsWith("blob:")) {
        // existing remote URL
        handleInputChange("imagen", url0);
        handleInputChange("imagenPrincipal", [{ url: url0 }]);
        setTempPreviews((prev) => ({ ...prev, imagen: "" }));
      }
    } catch (e) {
      console.error("handleMainImageUFU error", e);
    } finally {
      setUploadingImages(false);
      setUploadProgress(null);
    }
  };

  const handleGalleryUFU = async (filesList) => {
    try {
      setUploadingImages(true);
      const arr = Array.isArray(filesList) ? filesList : [];

      // Previews locales separadas por tipo
      const localImagePreviews = arr
        .filter((f) => f?.file && f.file.type?.startsWith?.("image/"))
        .map((f) => f.url)
        .filter(Boolean);
      const localVideoPreviews = arr
        .filter((f) => f?.file && f.file.type?.startsWith?.("video/"))
        .map((f) => f.url)
        .filter(Boolean);
      setTempPreviews((prev) => ({
        ...prev,
        imagenes: localImagePreviews,
        productVideos: localVideoPreviews,
      }));

      // Separar remotos existentes (sin blob:) por tipo usando extensión
      const savedExisting = arr
        .filter((f) => !f?.file && f?.url && !f.url.startsWith("blob:"))
        .map((f) => f.url);
      const savedNewImages = savedExisting.filter(
        (u) => detectTypeFromUrl(u) === "image"
      );
      const savedNewVideos = savedExisting.filter(
        (u) => detectTypeFromUrl(u) === "video"
      );

      const savedOldImages = Array.isArray(formData.imagenes)
        ? formData.imagenes
        : [];
      const savedOldVideos = Array.isArray(formData.videoUrls)
        ? formData.videoUrls
        : [];

      // Detectar y borrar eliminados por tipo
      const removedImages = savedOldImages.filter(
        (u) => !savedNewImages.includes(u)
      );
      const removedVideos = savedOldVideos.filter(
        (u) => !savedNewVideos.includes(u)
      );
      for (const r of removedImages) await deleteFromStorageByUrl(r);
      for (const r of removedVideos) await deleteFromStorageByUrl(r);

      // Persistir órdenes existentes (si cambiaron)
      if (JSON.stringify(savedNewImages) !== JSON.stringify(savedOldImages)) {
        const targetId = currentId || product?.id;
        setFormData((prev) => {
          const next = { ...prev, imagenes: savedNewImages };
          if (targetId)
            updateDoc(doc(db, "productos", targetId), {
              imagenes: savedNewImages,
              fechaActualizacion: new Date(),
            }).catch(() => {});
          return next;
        });
      }
      if (JSON.stringify(savedNewVideos) !== JSON.stringify(savedOldVideos)) {
        const targetId = currentId || product?.id;
        setFormData((prev) => {
          const next = { ...prev, videoUrls: savedNewVideos };
          if (targetId)
            updateDoc(doc(db, "productos", targetId), {
              videoUrls: savedNewVideos,
              fechaActualizacion: new Date(),
            }).catch(() => {});
          return next;
        });
      }

      // Asegurar que si la primera del arreglo visible es imagen, actúe como principal
      const firstImage = arr.find(
        (f) =>
          (f?.file && f.file.type?.startsWith?.("image/")) ||
          (!f?.file && f?.url && detectTypeFromUrl(f.url) === "image")
      );
      if (firstImage) {
        if (firstImage.file)
          setTempPreviews((prev) => ({ ...prev, imagen: firstImage.url }));
        else if (firstImage.url && !firstImage.url.startsWith("blob:"))
          handleInputChange("imagen", firstImage.url);
      }

      // Subir nuevos archivos en background por tipo
      let targetId = currentId || product?.id;
      if (!targetId) targetId = await ensureCurrentId();
      if (!targetId) return; // sin ID: no subir aún
      for (const item of arr) {
        if (item?.file && item.file.type?.startsWith?.("image/")) {
          const queueId = `${Date.now()}_${item.file.name}_${Math.random()
            .toString(36)
            .slice(2, 7)}`;
          const destPath = buildStoragePath({
            productId: targetId,
            section: "gallery",
            file: item.file,
          });
          try {
            const remoteUrl = await uploadWithRetry(
              uploadImage,
              item.file,
              destPath,
              queueId
            );
            setFormData((prev) => {
              const imgs = Array.isArray(prev.imagenes)
                ? [...prev.imagenes, remoteUrl]
                : [remoteUrl];
              const shouldSetMain =
                !prev.imagen &&
                (!Array.isArray(prev.imagenPrincipal) ||
                  prev.imagenPrincipal.length === 0);
              const next = {
                ...prev,
                imagenes: imgs,
                ...(shouldSetMain
                  ? { imagen: remoteUrl, imagenPrincipal: [{ url: remoteUrl }] }
                  : {}),
              };
              const updatePayload = shouldSetMain
                ? {
                    imagenes: imgs,
                    imagen: remoteUrl,
                    imagenPrincipal: [{ url: remoteUrl }],
                    fechaActualizacion: new Date(),
                  }
                : {
                    imagenes: imgs,
                    fechaActualizacion: new Date(),
                  };
              updateDoc(doc(db, "productos", targetId), updatePayload).catch(
                () => {}
              );
              return next;
            });
          } catch (e) {
            console.error("Gallery image upload error", e);
          }
        } else if (item?.file && item.file.type?.startsWith?.("video/")) {
          const queueId = `${Date.now()}_${item.file.name}_${Math.random()
            .toString(36)
            .slice(2, 7)}`;
          const destPath = buildStoragePath({
            productId: targetId,
            section: "videos",
            file: item.file,
          });
          try {
            const remoteUrl = await uploadWithRetry(
              uploadVideo,
              item.file,
              destPath,
              queueId
            );
            setFormData((prev) => {
              const vids = Array.isArray(prev.videoUrls)
                ? [...prev.videoUrls, remoteUrl]
                : [remoteUrl];
              const next = { ...prev, videoUrls: vids };
              updateDoc(doc(db, "productos", targetId), {
                videoUrls: vids,
                fechaActualizacion: new Date(),
              }).catch(() => {});
              return next;
            });
          } catch (e) {
            console.error("Gallery video upload error", e);
          }
        }
      }
    } catch (e) {
      console.error("handleGalleryUFU error", e);
    } finally {
      setUploadingImages(false);
      setUploadProgress(null);
    }
  };

  const handleProductVideosUFU = async (filesList) => {
    try {
      setUploadingImages(true);
      const arr = Array.isArray(filesList) ? filesList : [];
      const localPreviews = arr
        .filter((f) => f?.file)
        .map((f) => f.url)
        .filter(Boolean);
      setTempPreviews((prev) => ({ ...prev, productVideos: localPreviews }));

      const savedNew = arr
        .filter((f) => !f?.file && f?.url && !f.url.startsWith("blob:"))
        .map((f) => f.url);
      const savedOld = Array.isArray(formData.videoUrls)
        ? formData.videoUrls
        : [];

      // deletions
      const removed = savedOld.filter((u) => !savedNew.includes(u));
      for (const r of removed) {
        await deleteFromStorageByUrl(r);
      }
      if (JSON.stringify(savedNew) !== JSON.stringify(savedOld)) {
        setFormData((prev) => {
          const next = { ...prev, videoUrls: savedNew };
          const targetId = currentId || product?.id;
          if (targetId)
            updateDoc(doc(db, "productos", targetId), {
              videoUrls: savedNew,
              fechaActualizacion: new Date(),
            }).catch(() => {});
          return next;
        });
      }

      // uploads
      let targetId = currentId || product?.id;
      if (!targetId) targetId = await ensureCurrentId();
      if (!targetId) return; // sin ID: no subir aún
      for (const item of arr) {
        if (item?.file && item.file.type?.startsWith?.("video/")) {
          const queueId = `${Date.now()}_${item.file.name}_${Math.random()
            .toString(36)
            .slice(2, 7)}`;
          const destPath = buildStoragePath({
            productId: targetId,
            section: "videos",
            file: item.file,
          });
          try {
            const remoteUrl = await uploadWithRetry(
              uploadVideo,
              item.file,
              destPath,
              queueId
            );
            setFormData((prev) => {
              const vids = Array.isArray(prev.videoUrls)
                ? [...prev.videoUrls, remoteUrl]
                : [remoteUrl];
              const next = { ...prev, videoUrls: vids };
              updateDoc(doc(db, "productos", targetId), {
                videoUrls: vids,
                fechaActualizacion: new Date(),
              }).catch(() => {});
              return next;
            });
          } catch (e) {
            console.error("Product video upload error", e);
          }
        }
      }
    } catch (e) {
      console.error("handleProductVideosUFU error", e);
    } finally {
      setUploadingImages(false);
      setUploadProgress(null);
    }
  };

  // Múltiples videos para "Acerca de este artículo"
  const handleAcercaVideosUFU = async (filesList) => {
    try {
      setUploadingImages(true);
      const arr = Array.isArray(filesList) ? filesList : [];
      const localPreviews = arr
        .filter((f) => f?.file)
        .map((f) => f.url)
        .filter(Boolean);
      setTempPreviews((prev) => ({ ...prev, acercaVideos: localPreviews }));

      const savedNew = arr
        .filter((f) => !f?.file && f?.url && !f.url.startsWith("blob:"))
        .map((f) => f.url);
      const savedOld = Array.isArray(formData.videoAcercaArticulo)
        ? formData.videoAcercaArticulo
        : [];

      // eliminaciones
      const removed = savedOld.filter((u) => !savedNew.includes(u));
      for (const r of removed) {
        await deleteFromStorageByUrl(r);
      }
      if (JSON.stringify(savedNew) !== JSON.stringify(savedOld)) {
        setFormData((prev) => {
          const next = { ...prev, videoAcercaArticulo: savedNew };
          const targetId = currentId || product?.id;
          if (targetId)
            updateDoc(doc(db, "productos", targetId), {
              videoAcercaArticulo: savedNew,
              fechaActualizacion: new Date(),
            }).catch(() => {});
          return next;
        });
      }

      // subidas
      let targetId = currentId || product?.id;
      if (!targetId) targetId = await ensureCurrentId();
      if (!targetId) return; // sin ID: no subir aún
      for (const item of arr) {
        if (item?.file && item.file.type?.startsWith?.("video/")) {
          const queueId = `${Date.now()}_${item.file.name}_${Math.random()
            .toString(36)
            .slice(2, 7)}`;
          const destPath = buildStoragePath({
            productId: targetId,
            section: "videos",
            file: item.file,
          });
          try {
            const remoteUrl = await uploadWithRetry(
              uploadVideo,
              item.file,
              destPath,
              queueId
            );
            setFormData((prev) => {
              const vids = Array.isArray(prev.videoAcercaArticulo)
                ? [...prev.videoAcercaArticulo, remoteUrl]
                : [remoteUrl];
              const next = { ...prev, videoAcercaArticulo: vids };
              updateDoc(doc(db, "productos", targetId), {
                videoAcercaArticulo: vids,
                fechaActualizacion: new Date(),
              }).catch(() => {});
              return next;
            });
          } catch (e) {
            console.error("Acerca video upload error", e);
          }
        }
      }
    } catch (e) {
      console.error("handleAcercaVideosUFU error", e);
    } finally {
      setUploadingImages(false);
      setUploadProgress(null);
    }
  };

  // removed legacy single additional video uploader; superseded by handleAcercaVideosUFU

  const handleExtrasUFU = async (filesList) => {
    try {
      setUploadingImages(true);
      const arr = Array.isArray(filesList) ? filesList.slice(0, 3) : [];
      const localPreviews = arr
        .filter((f) => f?.file)
        .map((f) => f.url)
        .filter(Boolean);
      setTempPreviews((prev) => ({ ...prev, extras: localPreviews }));

      const savedNew = arr
        .filter((f) => !f?.file && f?.url && !f.url.startsWith("blob:"))
        .map((f) => f.url);
      const savedOld = Array.isArray(formData.imagenesExtra)
        ? formData.imagenesExtra
        : [];
      // deletions
      const removed = savedOld.filter((u) => !savedNew.includes(u));
      for (const r of removed) {
        await deleteFromStorageByUrl(r);
      }
      if (JSON.stringify(savedNew) !== JSON.stringify(savedOld)) {
        setFormData((prev) => {
          const next = { ...prev, imagenesExtra: savedNew };
          const targetId = currentId || product?.id;
          if (targetId)
            updateDoc(doc(db, "productos", targetId), {
              imagenesExtra: savedNew,
              fechaActualizacion: new Date(),
            }).catch(() => {});
          return next;
        });
      }

      // uploads (any type to extras path)
      let targetId = currentId || product?.id;
      if (!targetId) targetId = await ensureCurrentId();
      if (!targetId) return; // sin ID: no subir aún
      for (const item of arr) {
        if (item?.file) {
          const queueId = `${Date.now()}_${item.file.name}_${Math.random()
            .toString(36)
            .slice(2, 7)}`;
          const destPath = buildStoragePath({
            productId: targetId,
            section: "extras",
            file: item.file,
          });
          try {
            const remoteUrl = await uploadWithRetry(
              uploadImage,
              item.file,
              destPath,
              queueId
            );
            setFormData((prev) => {
              const extras = Array.isArray(prev.imagenesExtra)
                ? [...prev.imagenesExtra, remoteUrl]
                : [remoteUrl];
              const next = { ...prev, imagenesExtra: extras };
              updateDoc(doc(db, "productos", targetId), {
                imagenesExtra: extras,
                fechaActualizacion: new Date(),
              }).catch(() => {});
              return next;
            });
          } catch (e) {
            console.error("Extra file upload error", e);
          }
        }
      }
    } catch (e) {
      console.error("handleExtrasUFU error", e);
    } finally {
      setUploadingImages(false);
      setUploadProgress(null);
    }
  };

  const handleVariantMainUFU = async (filesList, variantIndex) => {
    try {
      setUploadingImages(true);
      const arr = Array.isArray(filesList) ? filesList : [];
      if (arr.length === 0) {
        setTempPreviews((prev) => ({
          ...prev,
          variantes: {
            ...prev.variantes,
            [variantIndex]: {
              ...(prev.variantes?.[variantIndex] || {}),
              imagen: "",
            },
          },
        }));
        handleVariantChange(variantIndex, "imagen", "");
        return;
      }
      const first = arr[0];
      if (first?.file) {
        // preview
        setTempPreviews((prev) => ({
          ...prev,
          variantes: {
            ...prev.variantes,
            [variantIndex]: {
              ...(prev.variantes?.[variantIndex] || {}),
              imagen: first.url,
            },
          },
        }));
        let targetId = currentId || product?.id;
        if (!targetId) targetId = await ensureCurrentId();
        if (!targetId) return; // sin ID: no subir aún
        const variantId = getOrCreateVariantId(variantIndex);
        const queueId = `${Date.now()}_${first.file.name}_${Math.random()
          .toString(36)
          .slice(2, 7)}`;
        const destPath = buildStoragePath({
          productId: targetId,
          section: "main",
          file: first.file,
          variantId,
        });
        const remoteUrl = await uploadWithRetry(
          uploadImage,
          first.file,
          destPath,
          queueId
        );
        handleVariantChange(variantIndex, "imagen", remoteUrl);
      } else if (first?.url && !first.url.startsWith("blob:")) {
        handleVariantChange(variantIndex, "imagen", first.url);
        // clear preview temp
        setTempPreviews((prev) => ({
          ...prev,
          variantes: {
            ...prev.variantes,
            [variantIndex]: {
              ...(prev.variantes?.[variantIndex] || {}),
              imagen: "",
            },
          },
        }));
      }
    } catch (e) {
      console.error("handleVariantMainUFU error", e);
    } finally {
      setUploadingImages(false);
      setUploadProgress(null);
    }
  };

  const handleVariantGalleryUFU = async (filesList, variantIndex) => {
    try {
      setUploadingImages(true);
      const arr = Array.isArray(filesList) ? filesList : [];
      const localPreviews = arr
        .filter((f) => f?.file)
        .map((f) => f.url)
        .filter(Boolean);
      setTempPreviews((prev) => ({
        ...prev,
        variantes: {
          ...prev.variantes,
          [variantIndex]: {
            ...(prev.variantes?.[variantIndex] || {}),
            imagenes: localPreviews,
          },
        },
      }));

      const savedNew = arr
        .filter((f) => !f?.file && f?.url && !f.url.startsWith("blob:"))
        .map((f) => f.url);
      const savedOld = Array.isArray(
        formData.variantes?.[variantIndex]?.imagenes
      )
        ? formData.variantes[variantIndex].imagenes
        : [];
      const removed = savedOld.filter((u) => !savedNew.includes(u));
      for (const r of removed) await deleteFromStorageByUrl(r);

      // persist order
      if (JSON.stringify(savedNew) !== JSON.stringify(savedOld)) {
        handleVariantChange(variantIndex, "imagenes", savedNew);
      }

      // uploads
      let targetId = currentId || product?.id;
      if (!targetId) targetId = await ensureCurrentId();
      if (!targetId) return; // sin ID: no subir aún
      const variantId = getOrCreateVariantId(variantIndex);
      for (const item of arr) {
        if (item?.file && item.file.type?.startsWith?.("image/")) {
          const queueId = `${Date.now()}_${item.file.name}_${Math.random()
            .toString(36)
            .slice(2, 7)}`;
          const destPath = buildStoragePath({
            productId: targetId,
            section: "gallery",
            file: item.file,
            variantId,
          });
          try {
            const remoteUrl = await uploadWithRetry(
              uploadImage,
              item.file,
              destPath,
              queueId
            );
            // append
            setFormData((prev) => {
              const variantes = [...(prev.variantes || [])];
              const curr = Array.isArray(variantes[variantIndex]?.imagenes)
                ? variantes[variantIndex].imagenes
                : [];
              variantes[variantIndex] = {
                ...(variantes[variantIndex] || {}),
                imagenes: [...curr, remoteUrl],
              };
              const next = { ...prev, variantes };
              const id = currentId || product?.id;
              if (id)
                updateDoc(doc(db, "productos", id), {
                  variantes,
                  fechaActualizacion: new Date(),
                }).catch(() => {});
              return next;
            });
          } catch (e) {
            console.error("Variant gallery upload error", e);
          }
        }
      }
    } catch (e) {
      console.error("handleVariantGalleryUFU error", e);
    } finally {
      setUploadingImages(false);
      setUploadProgress(null);
    }
  };

  const handleVariantVideosUFU = async (filesList, variantIndex) => {
    try {
      const arr = Array.isArray(filesList) ? filesList : [];
      const localPreviews = arr
        .filter((f) => f?.file)
        .map((f) => f.url)
        .filter(Boolean);
      setTempPreviews((prev) => ({
        ...prev,
        variantes: {
          ...prev.variantes,
          [variantIndex]: {
            ...(prev.variantes?.[variantIndex] || {}),
            videos: localPreviews,
          },
        },
      }));

      const savedNew = arr
        .filter((f) => !f?.file && f?.url && !f.url.startsWith("blob:"))
        .map((f) => f.url);
      const savedOld = Array.isArray(
        formData.variantes?.[variantIndex]?.videoUrls
      )
        ? formData.variantes[variantIndex].videoUrls
        : [];
      const removed = savedOld.filter((u) => !savedNew.includes(u));
      for (const r of removed) await deleteFromStorageByUrl(r);
      if (JSON.stringify(savedNew) !== JSON.stringify(savedOld)) {
        handleVariantChange(variantIndex, "videoUrls", savedNew);
      }

      // uploads
      let targetId = currentId || product?.id;
      if (!targetId) targetId = await ensureCurrentId();
      if (!targetId) return; // sin ID: no subir aún
      const variantId = getOrCreateVariantId(variantIndex);
      for (const item of arr) {
        if (item?.file && item.file.type?.startsWith?.("video/")) {
          const queueId = `${Date.now()}_${item.file.name}_${Math.random()
            .toString(36)
            .slice(2, 7)}`;
          // mantener mismo folder 'gallery' para compatibilidad con código previo
          const destPath = buildStoragePath({
            productId: targetId,
            section: "gallery",
            file: item.file,
            variantId,
          });
          try {
            const remoteUrl = await uploadWithRetry(
              uploadVideo,
              item.file,
              destPath,
              queueId
            );
            setFormData((prev) => {
              const variantes = [...(prev.variantes || [])];
              const curr = Array.isArray(variantes[variantIndex]?.videoUrls)
                ? variantes[variantIndex].videoUrls
                : [];
              variantes[variantIndex] = {
                ...(variantes[variantIndex] || {}),
                videoUrls: [...curr, remoteUrl],
              };
              const next = { ...prev, variantes };
              const id = currentId || product?.id;
              if (id)
                updateDoc(doc(db, "productos", id), {
                  variantes,
                  fechaActualizacion: new Date(),
                }).catch(() => {});
              return next;
            });
          } catch (e) {
            console.error("Variant video upload error", e);
          }
        }
      }
    } catch (e) {
      console.error("handleVariantVideosUFU error", e);
    }
  };

  // Cancelar una subida en curso
  const cancelUpload = (id) => {
    setUploadQueue((prev) => {
      const item = prev.find((q) => q.id === id);
      if (item?.task) {
        try {
          item.task.cancel();
        } catch {}
      }
      return prev.map((q) => (q.id === id ? { ...q, status: "canceled" } : q));
    });
  };

  // Reintentar subida fallida (vuelve a encolar con mismo target)
  const retryUpload = async (id) => {
    const item = uploadQueue.find((q) => q.id === id);
    if (!item) return;
    const file = item.file;
    const newId = `${Date.now()}_${file?.name || "file"}_${Math.random()
      .toString(36)
      .slice(2, 7)}`;
    setUploadQueue((prev) =>
      prev.map((q) =>
        q.id === id
          ? { ...q, id: newId, progress: 0, status: "uploading", task: null }
          : q
      )
    );
    const path = formData.nombre || "temp";
    try {
      if (item.type === "image") {
        const url = await uploadWithRetry(uploadImage, file, path, newId);
        if (item.target.level === "variant") {
          const idx = item.target.variantIndex;
          if (item.target.field === "imagen") {
            handleVariantChange(idx, "imagen", url);
          } else {
            const current = Array.isArray(formData.variantes[idx]?.imagenes)
              ? formData.variantes[idx].imagenes
              : [];
            handleVariantChange(idx, "imagenes", [...current, url]);
          }
        } else {
          if (item.target.field === "imagen") handleInputChange("imagen", url);
          else handleInputChange("imagenes", [...formData.imagenes, url]);
        }
      } else if (item.type === "video") {
        const url = await uploadWithRetry(uploadVideo, file, path, newId);
        if (item.target.level === "variant") {
          const idx = item.target.variantIndex;
          const current = Array.isArray(formData.variantes[idx]?.videoUrls)
            ? formData.variantes[idx].videoUrls
            : [];
          handleVariantChange(idx, "videoUrls", [...current, url]);
        } else {
          handleInputChange("videoUrls", [...(formData.videoUrls || []), url]);
        }
      }
    } catch (e) {
      setUploadQueue((prev) =>
        prev.map((q) => (q.id === newId ? { ...q, status: "error" } : q))
      );
    }
  };

  // Helpers para reordenar imágenes adicionales del producto (persistencia inmediata)
  const moveProductImage = (fromIndex, direction) => {
    setFormData((prev) => {
      const imgs = [...prev.imagenes];
      const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
      if (toIndex < 0 || toIndex >= imgs.length) return prev;
      const [m] = imgs.splice(fromIndex, 1);
      imgs.splice(toIndex, 0, m);
      const next = { ...prev, imagenes: imgs };
      const targetId = currentId || product?.id;
      if (targetId)
        updateDoc(doc(db, "productos", targetId), {
          imagenes: imgs,
          fechaActualizacion: new Date(),
        }).catch(() => {});
      return next;
    });
  };

  // Helpers para reordenar imágenes adicionales de una variante (persistencia inmediata)
  const moveVariantImage = (variantIndex, fromIndex, direction) => {
    setFormData((prev) => {
      const variantes = [...prev.variantes];
      const imgs = Array.isArray(variantes[variantIndex]?.imagenes)
        ? [...variantes[variantIndex].imagenes]
        : [];
      const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
      if (toIndex < 0 || toIndex >= imgs.length) return prev;
      const [m] = imgs.splice(fromIndex, 1);
      imgs.splice(toIndex, 0, m);
      variantes[variantIndex] = { ...variantes[variantIndex], imagenes: imgs };
      const next = { ...prev, variantes };
      const targetId = currentId || product?.id;
      if (targetId)
        updateDoc(doc(db, "productos", targetId), {
          variantes,
          fechaActualizacion: new Date(),
        }).catch(() => {});
      return next;
    });
  };

  const createNewCategory = async (categoryName) => {
    try {
      const categoryData = {
        nombre: categoryName,
        ruta: categoryName.toLowerCase().replace(/\s+/g, "-"),
        activa: true,
        fechaCreacion: new Date(),
        productCount: 0,
      };

      await setDoc(doc(db, "categorias", categoryData.ruta), categoryData);
      setCategorias((prev) => [
        ...prev,
        { id: categoryData.ruta, ...categoryData },
      ]);
      return categoryData.ruta;
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalCategoryId = formData.categoria;

      // Create new category if needed
      if (showNewCategoryInput && formData.nuevaCategoria.trim()) {
        finalCategoryId = await createNewCategory(
          formData.nuevaCategoria.trim()
        );
      }

      let productData = {
        ...formData,
        categoria: finalCategoryId,
        precio: parseFloat(formData.precio) || 0,
        fechaActualizacion: new Date(),
        acerca: (Array.isArray(formData.acerca) ? formData.acerca : []).filter((item) => String(item || "").trim()),
        etiquetas: (Array.isArray(formData.etiquetas) ? formData.etiquetas : []).filter((item) => String(item || "").trim()),
        // Mantener TODAS las variantes tal cual para no perder medios ni IDs
        variantes: Array.isArray(formData.variantes) ? formData.variantes : [],
      };

      // Publicar el producto al guardar: marcar activo=true para que aparezca en categorías
      productData.activo = true;

      delete productData.nuevaCategoria;
      delete productData._tempVideoUrl;

      // Evitar sobreescribir campos de medios si hay subidas en progreso
      if (uploadingImages) {
        const MEDIA_KEYS = [
          "imagen",
          "imagenPrincipal",
          "imagenes",
          "media",
          "videoAcercaArticulo",
          "video",
          "videoUrls",
          "imagenesExtra",
          "tresArchivosExtras",
        ];
        for (const k of MEDIA_KEYS) delete productData[k];
        if (Array.isArray(productData.variantes)) {
          productData.variantes = productData.variantes.map((v) => {
            const nv = { ...v };
            delete nv.media;
            delete nv.videoUrls;
            delete nv.imagenes;
            delete nv.imagen;
            delete nv.imagenPrincipal;
            return nv;
          });
        }
      }

      // Normalización de marca para filtros insensibles a mayúsculas
      if (productData.empresa) {
        productData.empresa = productData.empresa.trim();
        productData.empresaNorm = productData.empresa.toLowerCase();
      }

      // Determinar modo: edición vs creación (a prueba de duplicados)
      // En edición, exigir SIEMPRE product.id; si falta, abortar para no crear copias
      const editingId = product?.id || null;
      if (product && !editingId) {
        throw new Error("Producto en edición sin ID válido. No se guardó para evitar duplicados.");
      }
      const targetId = editingId || formData?.id || currentId || `prod_${Date.now()}`;
      productData.id = targetId;
      const isNew = !editingId && !formData?.id && !currentId;
      if (isNew) {
        productData.fechaCreacion = new Date();
      }
      // Usar setDoc con merge para crear o actualizar sin fallar
      await setDoc(
        doc(db, "productos", targetId),
        { ...productData, fechaActualizacion: new Date() },
        { merge: true }
      );
      if (isNew) setCurrentId(targetId);

      if (typeof onSave === "function") onSave();
      if (typeof onClose === "function") onClose();
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Error al guardar el producto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-stretch justify-stretch"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white w-screen h-screen overflow-hidden flex flex-col"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* Header */}
        <div className="bg-blue-700 text-white p-4 md:p-6 flex justify-between items-center sticky top-0 z-10 shadow">
          <h2 className="text-2xl font-bold">
            {product ? "Editar Producto" : "Agregar Producto"}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-4 md:p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-900 border-b pb-2">
                Información Básica
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => handleInputChange("nombre", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marca / Empresa
                </label>
                <input
                  type="text"
                  list="brands-list"
                  value={formData.empresa || ""}
                  onChange={(e) => handleInputChange("empresa", e.target.value)}
                  placeholder="Ej. Xbox, PlayStation, Nintendo... (puedes escribir una nueva)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <datalist id="brands-list">
                  {brands.map((b) => (
                    <option key={b} value={b} />
                  ))}
                </datalist>
                <p className="text-xs text-gray-500 mt-1">
                  Sugerencias basadas en tus marcas guardadas. Se guardará sin
                  importar mayúsculas/minúsculas.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.precio}
                    onChange={(e) =>
                      handleInputChange("precio", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cantidad en Stock *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.cantidad}
                    onChange={(e) =>
                      handleInputChange(
                        "cantidad",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código de inventario (SKU) — opcional
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => handleInputChange("sku", e.target.value)}
                  placeholder="Ej. NIN-SWITCH-NEON-01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  El SKU es un identificador interno para gestionar tu
                  inventario.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <RichTextEditor
                  value={formData.descripcion}
                  onChange={(html) => handleInputChange("descripcion", html)}
                  placeholder="Describe el producto (negrita, listas, imágenes, enlaces)"
                />
              </div>
            </div>

            {/* Category and Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-900 border-b pb-2">
                Categoría y Estado
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría *
                </label>
                <div className="space-y-2">
                  <select
                    value={showNewCategoryInput ? "" : formData.categoria}
                    onChange={(e) => {
                      if (e.target.value === "nueva") {
                        setShowNewCategoryInput(true);
                      } else {
                        setShowNewCategoryInput(false);
                        handleInputChange("categoria", e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required={!showNewCategoryInput}
                  >
                    <option value="">Seleccionar categoría</option>
                    {categorias.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </option>
                    ))}
                    <option value="nueva">+ Crear nueva categoría</option>
                  </select>

                  {showNewCategoryInput && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nombre de la nueva categoría"
                        value={formData.nuevaCategoria}
                        onChange={(e) =>
                          handleInputChange("nuevaCategoria", e.target.value)
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewCategoryInput(false);
                          handleInputChange("nuevaCategoria", "");
                        }}
                        className="px-3 py-2 text-gray-500 hover:text-gray-700"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    value={formData.estado}
                    onChange={(e) =>
                      handleInputChange("estado", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Nuevo">Nuevo</option>
                    <option value="Usado">Usado</option>
                    <option value="Reacondicionado">Reacondicionado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Publicación
                  </label>
                  <input
                    type="date"
                    value={formData.fechaPublicacion}
                    onChange={(e) =>
                      handleInputChange("fechaPublicacion", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.oferta}
                      onChange={(e) =>
                        handleInputChange("oferta", e.target.checked)
                      }
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    En oferta
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.activo}
                      onChange={(e) =>
                        handleInputChange("activo", e.target.checked)
                      }
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    Producto activo
                  </label>
                </div>

                {formData.oferta && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Precio de Oferta
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.precioOferta}
                      onChange={(e) =>
                        handleInputChange("precioOferta", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Precio con descuento"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Peso (opcional)
                    </label>
                    <input
                      type="text"
                      value={formData.peso}
                      onChange={(e) =>
                        handleInputChange("peso", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="ej: 1.5 kg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dimensiones (opcional)
                    </label>
                    <input
                      type="text"
                      value={formData.dimensiones}
                      onChange={(e) =>
                        handleInputChange("dimensiones", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="ej: 30x20x10 cm"
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Vista Previa Mini (derecha en desktop, abajo en móvil) */}
            <div className="xl:col-span-1">
              <VistaProductoMini
                productId={currentId || product?.id || null}
                draftData={miniDraft}
                className="sticky top-20"
              />
            </div>
          </div>

          {/* Images Section */}
          <div className="mt-8 space-y-4">
            <h3 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 via-pink-600 to-rose-600 border-b-4 border-rose-200 pb-2">
              Imágenes y Multimedia
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl border-2 border-rose-200/70 bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 p-4 shadow-sm">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagen Principal *
                </label>
                <UniversalFileUploader
                  files={[
                    ...(tempPreviews.imagen
                      ? [
                          {
                            id: "temp-main",
                            url: tempPreviews.imagen,
                            type: "image",
                            name: "imagen-principal",
                            size: 0,
                            isUploaded: false,
                          },
                        ]
                      : []),
                    ...(formData.imagen ? [formData.imagen] : []),
                  ]}
                  onFilesChange={handleMainImageUFU}
                  acceptedTypes="image/*"
                  multiple={false}
                  maxFiles={1}
                  label="Imagen Principal"
                  placeholder="Arrastra o selecciona una imagen principal"
                  allowReorder={false}
                  allowSetMain={false}
                />
              </div>

              <div className="rounded-2xl border-2 border-pink-200/70 bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50 p-4 shadow-sm">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Galería (Imágenes y Videos)
                </label>
                <UniversalFileUploader
                  files={[
                    ...(Array.isArray(formData.imagenes)
                      ? formData.imagenes
                      : []),
                    ...(Array.isArray(formData.videoUrls)
                      ? formData.videoUrls
                      : []),
                    ...(Array.isArray(tempPreviews.imagenes)
                      ? tempPreviews.imagenes.map((u, i) => ({
                          id: `temp-gallery-img-${i}`,
                          url: u,
                          type: "image",
                          name: `imagen-${i + 1}`,
                          size: 0,
                          isUploaded: false,
                        }))
                      : []),
                    ...(Array.isArray(tempPreviews.productVideos)
                      ? tempPreviews.productVideos.map((u, i) => ({
                          id: `temp-gallery-vid-${i}`,
                          url: u,
                          type: "video",
                          name: `video-${i + 1}`,
                          size: 0,
                          isUploaded: false,
                        }))
                      : []),
                  ]}
                  onFilesChange={handleGalleryUFU}
                  acceptedTypes="image/*,video/*"
                  multiple={true}
                  label="Galería (Imágenes y Videos)"
                  placeholder="Arrastra o selecciona imágenes o videos"
                  allowReorder={true}
                  allowSetMain={true}
                />
              </div>
            </div>

            {/* Sección de videos del producto removida; la galería ya acepta videos */}
          </div>

          {/* Details Section */}
          <div className="mt-8 space-y-4">
            <h3 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 border-b-4 border-blue-200 pb-2">
              Detalles del Producto
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Características (Acerca de)
              </label>
              {formData.acerca.map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) =>
                      handleArrayChange("acerca", index, e.target.value)
                    }
                    placeholder="Característica del producto"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem("acerca", index)}
                    className="px-3 py-2 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem("acerca")}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                + Agregar característica
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Etiquetas (para búsqueda)
              </label>
              {formData.etiquetas.map((tag, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) =>
                      handleArrayChange("etiquetas", index, e.target.value)
                    }
                    placeholder="Etiqueta"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem("etiquetas", index)}
                    className="px-3 py-2 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem("etiquetas")}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                + Agregar etiqueta
              </button>
            </div>
          </div>

          {/* Variants Section */}
          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-semibold text-blue-900 border-b pb-2">
              Variantes del Producto
            </h3>

            {formData.variantes.map((variant, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 space-y-3"
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Variante {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeArrayItem("variantes", index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Eliminar
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color/Tipo
                    </label>
                    <input
                      type="text"
                      value={variant.color}
                      onChange={(e) =>
                        handleVariantChange(index, "color", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cantidad
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={variant.cantidad}
                      onChange={(e) =>
                        handleVariantChange(
                          index,
                          "cantidad",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción de la variante
                    </label>
                    <textarea
                      rows={2}
                      value={variant.descripcion || ""}
                      onChange={(e) =>
                        handleVariantChange(
                          index,
                          "descripcion",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej. Color neón, control edición especial, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio de la variante (opcional)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={variant.precio ?? ""}
                      onChange={(e) =>
                        handleVariantChange(index, "precio", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej. 1999.99"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Imagen de Variante
                    </label>
                    <UniversalFileUploader
                      files={[
                        ...(tempPreviews.variantes?.[index]?.imagen
                          ? [
                              {
                                id: `temp-var${index}-main`,
                                url: tempPreviews.variantes[index].imagen,
                                type: "image",
                                name: `var${index}-imagen`,
                                size: 0,
                                isUploaded: false,
                              },
                            ]
                          : []),
                        ...(variant.imagen ? [variant.imagen] : []),
                      ]}
                      onFilesChange={(files) =>
                        handleVariantMainUFU(files, index)
                      }
                      acceptedTypes="image/*"
                      multiple={false}
                      maxFiles={1}
                      label="Imagen de Variante"
                      placeholder="Arrastra o selecciona una imagen"
                      allowReorder={false}
                      allowSetMain={false}
                    />
                  </div>
                </div>

                {/* Imágenes adicionales de la variante */}
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Imágenes adicionales de la variante
                  </label>
                  <UniversalFileUploader
                    files={[
                      ...(variant.imagenes || []),
                      ...(tempPreviews.variantes?.[index]?.imagenes || []).map(
                        (u, i) => ({
                          id: `temp-var${index}-img-${i}`,
                          url: u,
                          type: "image",
                          name: `var${index}-img-${i + 1}`,
                          size: 0,
                          isUploaded: false,
                        })
                      ),
                    ]}
                    onFilesChange={(files) =>
                      handleVariantGalleryUFU(files, index)
                    }
                    acceptedTypes="image/*"
                    multiple={true}
                    label="Imágenes adicionales de la variante"
                    placeholder="Arrastra o selecciona imágenes"
                    allowReorder={true}
                    allowSetMain={true}
                  />
                </div>

                {/* Videos de la variante */}
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Videos de la variante
                  </label>
                  <UniversalFileUploader
                    files={[
                      ...(variant.videoUrls || []),
                      ...(tempPreviews.variantes?.[index]?.videos || []).map(
                        (u, i) => ({
                          id: `temp-var${index}-video-${i}`,
                          url: u,
                          type: "video",
                          name: `video-${i + 1}`,
                          size: 0,
                          isUploaded: false,
                        })
                      ),
                    ]}
                    onFilesChange={(files) =>
                      handleVariantVideosUFU(files, index)
                    }
                    acceptedTypes="video/*"
                    multiple={true}
                    label="Videos de la variante"
                    placeholder="Arrastra o selecciona videos"
                    allowReorder={true}
                    allowSetMain={true}
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => addArrayItem("variantes")}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              + Agregar variante
            </button>
          </div>

          {/* Video principal (Acerca de este artículo) */}
          <div className="mt-8 space-y-4 rounded-2xl border-2 border-rose-200/70 bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 p-4 shadow-sm">
            <h3 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 border-b-4 border-rose-200 pb-2">
              Video principal (Acerca de este artículo)
            </h3>
            <UniversalFileUploader
              files={[
                ...(Array.isArray(formData.videoAcercaArticulo)
                  ? formData.videoAcercaArticulo
                  : []),
                ...(Array.isArray(tempPreviews.acercaVideos)
                  ? tempPreviews.acercaVideos.map((u, i) => ({
                      id: `temp-acerca-video-${i}`,
                      url: u,
                      type: "video",
                      name: `acerca-${i + 1}`,
                      size: 0,
                      isUploaded: false,
                    }))
                  : []),
              ]}
              onFilesChange={handleAcercaVideosUFU}
              acceptedTypes="video/*"
              multiple={true}
              label="Videos de 'Acerca de este artículo'"
              placeholder="Arrastra o selecciona videos para 'Acerca de este artículo'"
              allowReorder={true}
              allowSetMain={false}
            />
          </div>

          {/* Upload queue UI removido: el uploader maneja previews y acciones inline */}

          {/* Tres Archivos Extras */}
          <div className="mt-8 space-y-4 rounded-2xl border-2 border-violet-200/70 bg-gradient-to-br from-violet-50 via-indigo-50 to-fuchsia-50 p-4 shadow-sm">
            <h3 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-600 border-b-4 border-violet-200 pb-2">
              Tres Archivos Extras
            </h3>
            <UniversalFileUploader
              files={[
                ...(formData.imagenesExtra || []).map((u, i) => ({
                  id: `saved-extra-${i}`,
                  url: u,
                  type: detectTypeFromUrl(u),
                  name: (String(u).split("/").pop() || `extra-${i + 1}`).split(
                    "?"
                  )[0],
                  size: 0,
                  isUploaded: true,
                })),
                ...(tempPreviews.extras || []).map((u, i) => ({
                  id: `temp-extra-${i}`,
                  url: u,
                  type: "document",
                  name: `extra-${i + 1}`,
                  size: 0,
                  isUploaded: false,
                })),
              ]}
              onFilesChange={handleExtrasUFU}
              acceptedTypes="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/zip,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain"
              multiple={true}
              maxFiles={3}
              label="Tres Archivos Extras"
              placeholder="Sube hasta 3 archivos (imágenes, videos, documentos)"
              allowReorder={true}
              allowSetMain={false}
            />
          </div>

          {/* Submit Buttons */}
          <div className="mt-8 flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={async () => {
                try {
                  await handleSaveDraft();
                } catch (e) {}
              }}
              className="px-6 py-2 border border-amber-300 rounded-lg text-amber-700 hover:bg-amber-50"
              title="Guardar para más tarde"
            >
              Guardar para más tarde
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Guardando..." : "Guardar Producto"}
            </button>
          </div>

          {/* Mensaje de subida en segundo plano removido para evitar estados de carga visibles */}
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ProductForm;
