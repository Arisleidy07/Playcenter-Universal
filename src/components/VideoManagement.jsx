/**
 * VideoManagement.jsx — CMS de video-tutoriales (rediseño completo)
 * Modal fullscreen, auto-slug, auto-publish, categorías dinámicas desde Firestore,
 * RTE para descripción larga, slider de timeline para miniatura.
 */
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { db, storage } from "../firebase";
import { useAuth } from "../context/AuthContext";
import RichTextEditor from "./RichTextEditor";

/* ─── helpers ─────────────────────────────────────────────── */
const slugify = (str) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

function dataURLtoBlob(dataURL) {
  const [header, data] = dataURL.split(",");
  const mime = header.match(/:(.*?);/)[1];
  const binary = atob(data);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

/* Extraer N fotogramas de un File de video */
function extractFrames(videoFile, count = 20) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(videoFile);
    const video = document.createElement("video");
    video.src = url;
    video.muted = true;
    video.crossOrigin = "anonymous";
    video.onloadedmetadata = () => {
      const duration = video.duration;
      const frames = [];
      const times = Array.from(
        { length: count },
        (_, i) => Math.round((i / (count - 1)) * duration * 10) / 10,
      );
      const captureAt = (time) =>
        new Promise((res) => {
          video.currentTime = time;
          video.onseeked = () => {
            const canvas = document.createElement("canvas");
            canvas.width = 480;
            canvas.height =
              Math.round(
                (canvas.width * video.videoHeight) / video.videoWidth,
              ) || 270;
            canvas
              .getContext("2d")
              .drawImage(video, 0, 0, canvas.width, canvas.height);
            res({ dataURL: canvas.toDataURL("image/jpeg", 0.75), time });
          };
        });
      const next = async (i) => {
        if (i >= times.length) {
          URL.revokeObjectURL(url);
          resolve(frames);
          return;
        }
        frames.push(await captureAt(times[i]));
        next(i + 1);
      };
      next(0);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve([]);
    };
  });
}

const EMPTY_FORM = {
  titulo: "",
  descripcionCorta: "",
  contenido: "",
  categoria: "",
  thumbnailUrl: "",
  videoUrl: "",
  videoEsExterno: false,
  videoUrlExterno: "",
  slug: "",
  estado: "publicado",
};

/* ══════════════════════════════════════════════════════════════
   TIMELINE THUMBNAIL SLIDER
═══════════════════════════════════════════════════════════════ */
function ThumbnailTimelineSlider({ frames, selectedIndex, onChange }) {
  if (!frames || frames.length === 0) return null;
  const idx = selectedIndex ?? 0;
  return (
    <div className="mt-3">
      {/* Preview grande del frame seleccionado */}
      <div
        className="rounded-lg overflow-hidden mb-3 flex items-center justify-center"
        style={{ background: "#000", aspectRatio: "16/9", maxHeight: 200 }}
      >
        <img
          src={frames[idx]?.dataURL}
          alt="Miniatura seleccionada"
          className="max-w-full max-h-full object-contain"
        />
      </div>
      {/* Tiempo */}
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-2">
        Fotograma {idx + 1} de {frames.length} — {frames[idx]?.time}s
      </p>
      {/* Slider */}
      <input
        type="range"
        min={0}
        max={frames.length - 1}
        value={idx}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-blue-600"
        style={{ cursor: "pointer" }}
      />
      {/* Strip de thumbnails clickeables */}
      <div className="flex gap-1 mt-2 overflow-x-auto pb-1">
        {frames.map((f, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            className="flex-shrink-0 rounded overflow-hidden transition-all"
            style={{
              width: 56,
              height: 36,
              outline:
                i === idx ? "2px solid #2563eb" : "2px solid transparent",
              outlineOffset: 1,
            }}
          >
            <img
              src={f.dataURL}
              alt=""
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   FORMULARIO DE VIDEO (modal fullscreen)
═══════════════════════════════════════════════════════════════ */
function VideoForm({ initial, categorias, onSave, onClose }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initial });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(
    initial?.thumbnailUrl || "",
  );
  const [frames, setFrames] = useState([]);
  const [frameIdx, setFrameIdx] = useState(0);
  const [extracting, setExtracting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ video: 0, thumb: 0 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [newCat, setNewCat] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  /* Auto-slug from title */
  const handleTitulo = (v) => {
    set("titulo", v);
    if (!initial?.id) set("slug", slugify(v));
  };

  /* Video file selected → extract frames */
  const handleVideoFile = async (file) => {
    if (!file) return;
    setVideoFile(file);
    setFrames([]);
    setFrameIdx(0);
    setExtracting(true);
    const f = await extractFrames(file, 20);
    setFrames(f);
    if (f.length > 0) {
      setFrameIdx(0);
      setThumbnailPreview(f[0].dataURL);
    }
    setExtracting(false);
  };

  /* Frame selection via slider */
  const handleFrameChange = (i) => {
    setFrameIdx(i);
    if (frames[i]) setThumbnailPreview(frames[i].dataURL);
  };

  /* Manual thumbnail image */
  const handleThumbFile = (file) => {
    if (!file) return;
    setThumbFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  /* Upload a file to Storage, returns download URL */
  const uploadFile = (file, path, onProgress) =>
    new Promise((resolve, reject) => {
      const ref = storageRef(storage, path);
      const task = uploadBytesResumable(ref, file);
      task.on(
        "state_changed",
        (snap) =>
          onProgress(
            Math.round((snap.bytesTransferred / snap.totalBytes) * 100),
          ),
        reject,
        async () => resolve(await getDownloadURL(task.snapshot.ref)),
      );
    });

  /* Save handler */
  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.titulo.trim()) {
      setError("El título es requerido.");
      return;
    }
    if (!form.videoEsExterno && !videoFile && !form.videoUrl) {
      setError("Sube un video o proporciona una URL externa.");
      return;
    }
    if (form.videoEsExterno && !form.videoUrlExterno.trim()) {
      setError("Ingresa la URL del video externo.");
      return;
    }
    setSaving(true);
    try {
      const docId = initial?.id || doc(collection(db, "videosTutoriales")).id;

      /* Video */
      let finalVideoUrl = form.videoUrl;
      if (form.videoEsExterno) {
        finalVideoUrl = form.videoUrlExterno.trim();
      } else if (videoFile) {
        finalVideoUrl = await uploadFile(
          videoFile,
          `videos-tutoriales/${docId}/video`,
          (p) => setUploadProgress((u) => ({ ...u, video: p })),
        );
      }

      /* Thumbnail */
      let finalThumbnailUrl = form.thumbnailUrl;
      if (thumbFile) {
        finalThumbnailUrl = await uploadFile(
          thumbFile,
          `videos-tutoriales/${docId}/thumbnail`,
          (p) => setUploadProgress((u) => ({ ...u, thumb: p })),
        );
      } else if (thumbnailPreview && thumbnailPreview.startsWith("data:")) {
        /* frame from video */
        const blob = dataURLtoBlob(thumbnailPreview);
        finalThumbnailUrl = await uploadFile(
          blob,
          `videos-tutoriales/${docId}/thumbnail`,
          (p) => setUploadProgress((u) => ({ ...u, thumb: p })),
        );
      }

      const slug = form.slug || slugify(form.titulo);
      const payload = {
        titulo: form.titulo.trim(),
        descripcionCorta: form.descripcionCorta.trim(),
        contenido: form.contenido,
        categoria: form.categoria,
        slug,
        estado: "publicado",
        videoUrl: finalVideoUrl,
        videoEsExterno: form.videoEsExterno,
        thumbnailUrl: finalThumbnailUrl,
        updatedAt: serverTimestamp(),
      };

      if (initial?.id) {
        await updateDoc(doc(db, "videosTutoriales", initial.id), payload);
      } else {
        await addDoc(collection(db, "videosTutoriales"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }
      onSave();
    } catch (err) {
      console.error(err);
      setError("Error al guardar: " + (err.message || "intenta de nuevo."));
    } finally {
      setSaving(false);
      setUploadProgress({ video: 0, thumb: 0 });
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col"
      style={{ background: "rgba(0,0,0,0.65)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="m-auto w-full bg-white dark:bg-gray-900 shadow-2xl flex flex-col"
        style={{
          maxWidth: 860,
          maxHeight: "96vh",
          borderRadius: 16,
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            {initial?.id ? "Editar video" : "Agregar video"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
          >
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body — scrollable */}
        <form
          onSubmit={handleSave}
          className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5"
          style={{ minHeight: 0 }}
        >
          {/* Título */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => handleTitulo(e.target.value)}
              placeholder="Ej. Cómo configurar tu router Wi-Fi"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {form.slug && (
              <p className="text-[11px] text-gray-400 mt-1">
                Slug: <span className="font-mono">{form.slug}</span>
              </p>
            )}
          </div>

          {/* Descripción corta */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Descripción corta
            </label>
            <textarea
              value={form.descripcionCorta}
              onChange={(e) => set("descripcionCorta", e.target.value)}
              rows={2}
              placeholder="Resumen breve que aparece en la tarjeta del video"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Categoría
            </label>
            {categorias.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {categorias.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => set("categoria", c)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                    style={{
                      background:
                        form.categoria === c ? "#2563eb" : "rgba(0,0,0,0.05)",
                      color: form.categoria === c ? "#fff" : "#374151",
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">
                Sin categorías creadas. Escribe una nueva abajo.
              </p>
            )}

            {/* Nueva categoría inline */}
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
                placeholder="Nueva categoría..."
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (newCat.trim()) {
                      set("categoria", newCat.trim());
                      setNewCat("");
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (newCat.trim()) {
                    set("categoria", newCat.trim());
                    setNewCat("");
                  }
                }}
                className="px-3 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ background: "#2563eb" }}
              >
                + Agregar
              </button>
            </div>
            {form.categoria && (
              <p className="text-xs text-blue-600 mt-1">
                Categoría seleccionada: <strong>{form.categoria}</strong>
              </p>
            )}
          </div>

          {/* Video — upload o URL externa */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Video <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => set("videoEsExterno", false)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: !form.videoEsExterno
                    ? "#2563eb"
                    : "rgba(0,0,0,0.05)",
                  color: !form.videoEsExterno ? "#fff" : "#374151",
                }}
              >
                Subir archivo
              </button>
              <button
                type="button"
                onClick={() => set("videoEsExterno", true)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: form.videoEsExterno
                    ? "#2563eb"
                    : "rgba(0,0,0,0.05)",
                  color: form.videoEsExterno ? "#fff" : "#374151",
                }}
              >
                URL externa
              </button>
            </div>

            {form.videoEsExterno ? (
              <input
                type="url"
                value={form.videoUrlExterno}
                onChange={(e) => set("videoUrlExterno", e.target.value)}
                placeholder="https://www.youtube.com/embed/..."
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <div>
                <label className="flex items-center justify-center gap-2 w-full py-8 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:border-blue-500 transition-colors text-sm text-gray-500 dark:text-gray-400">
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  {videoFile
                    ? videoFile.name
                    : form.videoUrl
                      ? "Video actual (cargado)"
                      : "Seleccionar video"}
                  <input
                    type="file"
                    accept="video/*"
                    capture={undefined}
                    className="sr-only"
                    onChange={(e) => handleVideoFile(e.target.files?.[0])}
                  />
                </label>
                {uploadProgress.video > 0 && uploadProgress.video < 100 && (
                  <div className="mt-2 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all"
                      style={{ width: uploadProgress.video + "%" }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Miniatura — timeline slider */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Miniatura (portada)
            </label>

            {extracting && (
              <div className="flex items-center gap-2 text-xs text-blue-600 mb-2">
                <svg
                  className="animate-spin w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Extrayendo fotogramas...
              </div>
            )}

            {frames.length > 0 && !thumbFile && (
              <>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Arrastra el slider para elegir el fotograma de portada:
                </p>
                <ThumbnailTimelineSlider
                  frames={frames}
                  selectedIndex={frameIdx}
                  onChange={handleFrameChange}
                />
              </>
            )}

            {/* Manual thumbnail upload */}
            <div className="mt-3">
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-blue-600 hover:text-blue-700 font-medium">
                <svg
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Subir imagen personalizada
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => handleThumbFile(e.target.files?.[0])}
                />
              </label>
            </div>

            {thumbnailPreview &&
              !thumbnailPreview.startsWith("data:") &&
              !thumbFile && (
                <div
                  className="mt-2 rounded-lg overflow-hidden"
                  style={{ maxWidth: 200, background: "#f1f5f9" }}
                >
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail actual"
                    className="w-full object-contain"
                  />
                </div>
              )}

            {uploadProgress.thumb > 0 && uploadProgress.thumb < 100 && (
              <div className="mt-2 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all"
                  style={{ width: uploadProgress.thumb + "%" }}
                />
              </div>
            )}
          </div>

          {/* Descripción larga (RTE) */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Descripción larga
            </label>
            <RichTextEditor
              value={form.contenido}
              onChange={(v) => set("contenido", v)}
              placeholder="Escribe una descripción detallada del video..."
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 font-medium bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="videoForm"
            disabled={saving}
            onClick={handleSave}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60 transition-all"
            style={{
              background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
            }}
          >
            {saving
              ? "Guardando..."
              : initial?.id
                ? "Actualizar"
                : "Publicar video"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
═══════════════════════════════════════════════════════════════ */
export default function VideoManagement() {
  const { usuarioInfo } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [categoriasFire, setCategoriasFire] = useState([]);

  /* Todos los videos */
  useEffect(() => {
    const q = query(
      collection(db, "videosTutoriales"),
      orderBy("createdAt", "desc"),
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setVideos(lista);
        /* Extraer categorías únicas dinámicamente */
        const cats = Array.from(
          new Set(lista.map((v) => v.categoria).filter(Boolean)),
        );
        setCategoriasFire(cats);
        setLoading(false);
      },
      () => setLoading(false),
    );
    return unsub;
  }, []);

  const handleEdit = (video) => {
    setEditTarget(video);
    setShowForm(true);
  };
  const handleNew = () => {
    setEditTarget(null);
    setShowForm(true);
  };
  const handleClose = () => {
    setShowForm(false);
    setEditTarget(null);
  };
  const handleSaved = () => {
    setShowForm(false);
    setEditTarget(null);
  };

  const confirmarEliminar = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "videosTutoriales", deleteTarget.id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const copyLink = (video) => {
    const url = `${window.location.origin}/videos-soporte/${video.slug}`;
    navigator.clipboard.writeText(url).catch(() => {});
  };

  const toggleEstado = async (video) => {
    const nuevoEstado = video.estado === "publicado" ? "borrador" : "publicado";
    await updateDoc(doc(db, "videosTutoriales", video.id), {
      estado: nuevoEstado,
    });
  };

  if (!usuarioInfo?.isAdmin && usuarioInfo?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-sm text-gray-400">
        Acceso restringido.
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Videos de soporte
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {videos.length} video{videos.length !== 1 ? "s" : ""} en total
          </p>
        </div>
        <button
          type="button"
          onClick={handleNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
          style={{
            background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
            boxShadow: "0 2px 8px rgba(37,99,235,0.35)",
          }}
        >
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Agregar video
        </button>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="flex justify-center py-16">
          <svg
            className="animate-spin w-7 h-7 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-16 text-sm text-gray-400">
          No hay videos. Agrega el primero.
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Miniatura
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Título
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">
                    Categoría
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {videos.map((v) => (
                  <tr
                    key={v.id}
                    className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div
                        className="rounded-lg overflow-hidden flex-shrink-0"
                        style={{ width: 72, height: 46, background: "#0f172a" }}
                      >
                        {v.thumbnailUrl ? (
                          <img
                            src={v.thumbnailUrl}
                            alt={v.titulo}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600">
                            <svg
                              width="20"
                              height="20"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M15 10l4.553-2.069A1 1 0 0121 8.868v6.264a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 dark:text-white line-clamp-1">
                        {v.titulo}
                      </p>
                      {v.slug && (
                        <p className="text-xs text-gray-400 font-mono mt-0.5">
                          {v.slug}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {v.categoria && (
                        <span
                          className="text-xs font-medium px-2.5 py-1 rounded-full"
                          style={{
                            background: "rgba(219,234,254,1)",
                            color: "#1d4ed8",
                          }}
                        >
                          {v.categoria}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleEstado(v)}
                        className="text-xs font-semibold px-2.5 py-1 rounded-full transition-all"
                        style={{
                          background:
                            v.estado === "publicado"
                              ? "rgba(220,252,231,1)"
                              : "rgba(243,244,246,1)",
                          color:
                            v.estado === "publicado" ? "#16a34a" : "#9ca3af",
                        }}
                      >
                        {v.estado === "publicado" ? "Publicado" : "Borrador"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleEdit(v)}
                          title="Editar"
                          className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 transition-colors"
                        >
                          <svg
                            width="15"
                            height="15"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => copyLink(v)}
                          title="Copiar enlace"
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                        >
                          <svg
                            width="15"
                            height="15"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(v)}
                          title="Eliminar"
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                        >
                          <svg
                            width="15"
                            height="15"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal VideoForm */}
      <AnimatePresence>
        {showForm && (
          <VideoForm
            key="video-form"
            initial={editTarget}
            categorias={categoriasFire}
            onSave={handleSaved}
            onClose={handleClose}
          />
        )}
      </AnimatePresence>

      {/* Modal Confirmar Eliminación */}
      <AnimatePresence>
        {deleteTarget && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.6)" }}
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                ¿Eliminar video?
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                Esta acción es permanente. Se eliminará «{deleteTarget.titulo}».
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmarEliminar}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-60"
                  style={{ background: "#ef4444" }}
                >
                  {deleting ? "Eliminando..." : "Sí, eliminar"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
