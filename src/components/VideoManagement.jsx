/**
 * VideoManagement.jsx
 * CMS de video-tutoriales para el panel de administración.
 * Colección Firestore: "videosTutoriales"
 * Storage: videos-tutoriales/{id}/video   |   videos-tutoriales/{id}/thumbnail
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
import {
  FiEdit2,
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiCopy,
  FiPlus,
  FiX,
  FiVideo,
  FiImage,
  FiUpload,
  FiFilm,
} from "react-icons/fi";

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

const CATEGORIAS = [
  "Internet",
  "Cámaras",
  "Computadoras",
  "Impresoras",
  "Celulares",
  "Redes y Conectividad",
  "Software",
  "Periféricos",
  "Mantenimiento",
  "Seguridad Digital",
  "General",
];

const ESTADOS = [
  {
    value: "publicado",
    label: "Publicado",
    color: "#16a34a",
    bg: "rgba(220,252,231,1)",
  },
  {
    value: "borrador",
    label: "Borrador",
    color: "#9ca3af",
    bg: "rgba(243,244,246,1)",
  },
];

const EMPTY_FORM = {
  titulo: "",
  descripcionCorta: "",
  contenido: "",
  categoria: "General",
  slug: "",
  estado: "borrador",
  thumbnailUrl: "",
  videoUrl: "",
  videoEsExterno: false,
  videoUrlExterno: "",
};

/* ─── extrae fotogramas de un video local ──────────────────── */
function extractFrames(videoFile, count = 8) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(videoFile);
    const video = document.createElement("video");
    video.src = url;
    video.muted = true;
    video.crossOrigin = "anonymous";

    video.onloadedmetadata = () => {
      const duration = video.duration;
      const frames = [];

      const captureAt = (time) =>
        new Promise((res) => {
          video.currentTime = time;
          video.onseeked = () => {
            const canvas = document.createElement("canvas");
            canvas.width = 320;
            canvas.height = Math.round(
              (canvas.width * video.videoHeight) / video.videoWidth,
            );
            const ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            res({ dataURL: canvas.toDataURL("image/jpeg", 0.7), time });
          };
        });

      const times = Array.from(
        { length: count },
        (_, i) => Math.round(((i + 0.5) / count) * duration * 10) / 10,
      );

      const next = async (i) => {
        if (i >= times.length) {
          URL.revokeObjectURL(url);
          resolve(frames);
          return;
        }
        const frame = await captureAt(times[i]);
        frames.push(frame);
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

/* ─── dataURL → Blob ───────────────────────────────────────── */
function dataURLtoBlob(dataURL) {
  const [header, data] = dataURL.split(",");
  const mime = header.match(/:(.*?);/)[1];
  const binary = atob(data);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

/* ══════════════════════════════════════════════════════════════
   MODAL SELECTOR DE MINIATURA (estilo TikTok)
═══════════════════════════════════════════════════════════════ */
function ThumbnailPickerModal({ frames, onSelect, onClose }) {
  const [selected, setSelected] = useState(null);

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <FiFilm className="text-blue-600" size={20} />
            <h3 className="font-bold text-gray-900 dark:text-white text-base">
              Seleccionar miniatura del video
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Grid de fotogramas */}
        <div className="p-5">
          {frames.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              No se pudieron extraer fotogramas del video.
            </div>
          ) : (
            <>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Haz clic en el fotograma que quieres usar como portada.
              </p>
              <div className="grid grid-cols-4 gap-2 max-h-72 overflow-y-auto pr-1">
                {frames.map((frame, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setSelected(i)}
                    className="relative rounded-lg overflow-hidden border-2 transition-all duration-150 focus:outline-none"
                    style={{
                      borderColor: selected === i ? "#2563eb" : "transparent",
                      boxShadow:
                        selected === i
                          ? "0 0 0 3px rgba(37,99,235,0.3)"
                          : "none",
                    }}
                  >
                    <img
                      src={frame.dataURL}
                      alt={`Fotograma ${i + 1}`}
                      className="w-full aspect-video object-cover"
                    />
                    {selected === i && (
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ background: "rgba(37,99,235,0.25)" }}
                      >
                        <div
                          className="rounded-full flex items-center justify-center"
                          style={{
                            width: 28,
                            height: 28,
                            background: "#2563eb",
                          }}
                        >
                          <svg
                            width="14"
                            height="14"
                            fill="none"
                            stroke="#fff"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                    <span
                      className="absolute bottom-1 right-1 text-white text-[10px] px-1 rounded"
                      style={{ background: "rgba(0,0,0,0.6)" }}
                    >
                      {frame.time}s
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={selected === null}
            onClick={() =>
              selected !== null && onSelect(frames[selected].dataURL)
            }
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-150 disabled:opacity-40"
            style={{
              background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
              boxShadow: "0 2px 8px rgba(59,130,246,0.4)",
            }}
          >
            Usar este fotograma
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   FORMULARIO AGREGAR / EDITAR VIDEO
═══════════════════════════════════════════════════════════════ */
function VideoForm({ videoInicial, onClose, onSaved }) {
  const { usuario } = useAuth();
  const [form, setForm] = useState({ ...EMPTY_FORM, ...(videoInicial || {}) });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(
    videoInicial?.thumbnailUrl || "",
  );
  const [videoPreview, setVideoPreview] = useState(
    videoInicial?.videoUrl || "",
  );
  const [frames, setFrames] = useState([]);
  const [showFramePicker, setShowFramePicker] = useState(false);
  const [extractingFrames, setExtractingFrames] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    video: null,
    thumb: null,
  });
  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  /* Auto-slug desde título */
  const handleTitulo = (val) => {
    set("titulo", val);
    if (!videoInicial?.slug || form.slug === slugify(form.titulo)) {
      set("slug", slugify(val));
    }
  };

  /* Carga video local */
  const handleVideoFile = async (file) => {
    if (!file) return;
    setVideoFile(file);
    const blobUrl = URL.createObjectURL(file);
    setVideoPreview(blobUrl);
    setFrames([]);
    set("videoEsExterno", false);
    set("videoUrlExterno", "");
  };

  /* Extrae fotogramas del video local */
  const handleExtractFrames = async () => {
    if (!videoFile) return;
    setExtractingFrames(true);
    const extracted = await extractFrames(videoFile, 8);
    setFrames(extracted);
    setExtractingFrames(false);
    setShowFramePicker(true);
  };

  /* Se seleccionó un fotograma como miniatura */
  const handleFrameSelected = (dataURL) => {
    setThumbnailPreview(dataURL);
    const blob = dataURLtoBlob(dataURL);
    setThumbnailFile(new File([blob], "thumbnail.jpg", { type: "image/jpeg" }));
    setShowFramePicker(false);
  };

  /* Carga imagen personalizada como miniatura */
  const handleThumbnailFile = (file) => {
    if (!file) return;
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  /* Sube archivo a Storage con progreso */
  const uploadFile = (file, path, onProgress) =>
    new Promise((resolve, reject) => {
      const fileRef = storageRef(storage, path);
      const task = uploadBytesResumable(fileRef, file);
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

  /* Guardar */
  const handleSave = async () => {
    if (!form.titulo.trim()) {
      alert("El título es obligatorio.");
      return;
    }
    if (!form.slug.trim()) {
      alert("El slug es obligatorio.");
      return;
    }
    if (form.videoEsExterno && !form.videoUrlExterno.trim()) {
      alert("Ingresa la URL externa del video.");
      return;
    }
    if (!form.videoEsExterno && !videoFile && !videoInicial?.videoUrl) {
      alert("Debes subir un video o ingresar una URL externa.");
      return;
    }

    setSaving(true);
    try {
      const docId = videoInicial?.id || `vid_${Date.now()}`;
      let finalVideoUrl = form.videoEsExterno
        ? form.videoUrlExterno.trim()
        : videoInicial?.videoUrl || "";
      let finalThumbnailUrl =
        thumbnailPreview && thumbnailPreview.startsWith("data:")
          ? ""
          : thumbnailPreview || videoInicial?.thumbnailUrl || "";

      /* Subir video local */
      if (videoFile) {
        finalVideoUrl = await uploadFile(
          videoFile,
          `videos-tutoriales/${docId}/video_${Date.now()}`,
          (p) => setUploadProgress((u) => ({ ...u, video: p })),
        );
      }

      /* Subir thumbnail */
      if (thumbnailFile) {
        finalThumbnailUrl = await uploadFile(
          thumbnailFile,
          `videos-tutoriales/${docId}/thumbnail_${Date.now()}`,
          (p) => setUploadProgress((u) => ({ ...u, thumb: p })),
        );
      }

      const payload = {
        titulo: form.titulo.trim(),
        descripcionCorta: form.descripcionCorta.trim(),
        contenido: form.contenido.trim(),
        categoria: form.categoria,
        slug: form.slug.trim(),
        estado: form.estado,
        videoUrl: finalVideoUrl,
        thumbnailUrl: finalThumbnailUrl,
        videoEsExterno: form.videoEsExterno,
        updatedAt: serverTimestamp(),
      };

      if (videoInicial?.id) {
        await updateDoc(doc(db, "videosTutoriales", videoInicial.id), payload);
      } else {
        await addDoc(collection(db, "videosTutoriales"), {
          ...payload,
          createdAt: serverTimestamp(),
          creadoPor: usuario?.uid || "admin",
        });
      }

      onSaved();
    } catch (err) {
      alert("Error al guardar: " + err.message);
    } finally {
      setSaving(false);
      setUploadProgress({ video: null, thumb: null });
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto py-6 px-4"
        style={{ background: "rgba(0,0,0,0.65)" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 32 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2.5">
              <div
                className="flex items-center justify-center rounded-lg"
                style={{
                  width: 36,
                  height: 36,
                  background: "linear-gradient(135deg,#3b82f6,#2563eb)",
                }}
              >
                <FiVideo size={17} color="#fff" />
              </div>
              <h2 className="font-bold text-gray-900 dark:text-white text-lg">
                {videoInicial ? "Editar video" : "Nuevo video tutorial"}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
            >
              <FiX size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-5">
            {/* Título */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Título <span className="text-blue-500">*</span>
              </label>
              <input
                type="text"
                value={form.titulo}
                onChange={(e) => handleTitulo(e.target.value)}
                placeholder="Ej: ¿Cómo instalar una impresora en Windows?"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Slug (URL)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                  /videos-soporte/
                </span>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => set("slug", slugify(e.target.value))}
                  className="flex-1 px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Descripción corta */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Descripción corta
              </label>
              <textarea
                rows={2}
                value={form.descripcionCorta}
                onChange={(e) => set("descripcionCorta", e.target.value)}
                placeholder="Resumen breve visible en la lista de videos (SEO)"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Contenido detallado */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Contenido / Descripción detallada
              </label>
              <textarea
                rows={5}
                value={form.contenido}
                onChange={(e) => set("contenido", e.target.value)}
                placeholder="Explicación completa del video. Puedes escribir párrafos separados con líneas en blanco."
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              />
            </div>

            {/* Categoría y Estado */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Categoría
                </label>
                <select
                  value={form.categoria}
                  onChange={(e) => set("categoria", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CATEGORIAS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Estado de publicación
                </label>
                <select
                  value={form.estado}
                  onChange={(e) => set("estado", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {ESTADOS.map((e) => (
                    <option key={e.value} value={e.value}>
                      {e.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ── VIDEO ── */}
            <div
              className="rounded-xl p-4"
              style={{
                border: "1px solid rgba(59,130,246,0.3)",
                background: "rgba(239,246,255,0.5)",
              }}
            >
              <label className="block text-sm font-semibold text-blue-700 dark:text-blue-300 mb-3 inline-flex items-center gap-2">
                <FiVideo size={15} /> Video{" "}
                <span className="text-blue-500">*</span>
              </label>

              {/* Toggle Local / URL externa */}
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => {
                    set("videoEsExterno", false);
                    set("videoUrlExterno", "");
                  }}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: !form.videoEsExterno
                      ? "linear-gradient(135deg,#3b82f6,#2563eb)"
                      : "rgba(229,231,235,0.8)",
                    color: !form.videoEsExterno ? "#fff" : "#374151",
                  }}
                >
                  📁 Subir archivo
                </button>
                <button
                  type="button"
                  onClick={() => set("videoEsExterno", true)}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: form.videoEsExterno
                      ? "linear-gradient(135deg,#3b82f6,#2563eb)"
                      : "rgba(229,231,235,0.8)",
                    color: form.videoEsExterno ? "#fff" : "#374151",
                  }}
                >
                  🔗 URL externa
                </button>
              </div>

              {form.videoEsExterno ? (
                <input
                  type="url"
                  value={form.videoUrlExterno}
                  onChange={(e) => set("videoUrlExterno", e.target.value)}
                  placeholder="https://www.youtube.com/embed/..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div>
                  <label
                    className="flex items-center justify-center gap-2 py-3 rounded-lg cursor-pointer text-sm font-medium text-blue-700 border-2 border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-50 transition-all"
                    htmlFor="input-video-file"
                  >
                    <FiUpload size={16} />
                    {videoFile
                      ? videoFile.name
                      : videoInicial?.videoUrl
                        ? "Cambiar video"
                        : "Seleccionar video (mp4, mov, webm)"}
                  </label>
                  <input
                    id="input-video-file"
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) =>
                      e.target.files[0] && handleVideoFile(e.target.files[0])
                    }
                  />
                  {uploadProgress.video !== null && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-blue-600 mb-1">
                        <span>Subiendo video...</span>
                        <span>{uploadProgress.video}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-blue-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{ width: `${uploadProgress.video}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {videoPreview && (
                    <div
                      className="mt-3 rounded-lg overflow-hidden"
                      style={{ maxHeight: 160 }}
                    >
                      <video
                        src={videoPreview}
                        controls
                        className="w-full rounded-lg"
                        style={{ maxHeight: 160 }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── MINIATURA ── */}
            <div
              className="rounded-xl p-4"
              style={{
                border: "1px solid rgba(139,92,246,0.3)",
                background: "rgba(245,243,255,0.5)",
              }}
            >
              <label
                className="block text-sm font-semibold mb-3 inline-flex items-center gap-2"
                style={{ color: "#7c3aed" }}
              >
                <FiImage size={15} /> Miniatura (portada)
              </label>

              <div className="flex gap-2 flex-wrap">
                {/* Botón extraer fotogramas */}
                {videoFile && (
                  <button
                    type="button"
                    onClick={handleExtractFrames}
                    disabled={extractingFrames}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white transition-all disabled:opacity-60"
                    style={{
                      background: "linear-gradient(135deg,#8b5cf6,#7c3aed)",
                    }}
                  >
                    <FiFilm size={13} />
                    {extractingFrames ? "Extrayendo..." : "Capturar fotograma"}
                  </button>
                )}

                {/* Subir imagen personalizada */}
                <label
                  htmlFor="input-thumbnail-file"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all"
                  style={{
                    background: "rgba(229,231,235,0.9)",
                    color: "#374151",
                  }}
                >
                  <FiUpload size={13} /> Subir imagen
                </label>
                <input
                  id="input-thumbnail-file"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files[0] && handleThumbnailFile(e.target.files[0])
                  }
                />
              </div>

              {uploadProgress.thumb !== null && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-purple-600 mb-1">
                    <span>Subiendo miniatura...</span>
                    <span>{uploadProgress.thumb}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-purple-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full transition-all"
                      style={{ width: `${uploadProgress.thumb}%` }}
                    />
                  </div>
                </div>
              )}

              {thumbnailPreview ? (
                <div className="mt-3 relative inline-block">
                  <img
                    src={thumbnailPreview}
                    alt="Miniatura"
                    className="rounded-lg object-cover"
                    style={{ width: 180, height: 101 }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setThumbnailPreview("");
                      setThumbnailFile(null);
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gray-800 text-white text-xs flex items-center justify-center"
                  >
                    <FiX size={11} />
                  </button>
                </div>
              ) : (
                <div
                  className="mt-3 rounded-lg flex items-center justify-center text-xs text-gray-400"
                  style={{
                    width: 180,
                    height: 101,
                    border: "2px dashed rgba(139,92,246,0.3)",
                    background: "rgba(245,243,255,0.6)",
                  }}
                >
                  Sin miniatura
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-60 flex items-center gap-2"
              style={{
                background: "linear-gradient(135deg,#3b82f6,#2563eb)",
                boxShadow: "0 2px 8px rgba(59,130,246,0.4)",
              }}
            >
              {saving ? (
                <>
                  <svg
                    className="animate-spin"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
                    />
                  </svg>
                  Guardando...
                </>
              ) : videoInicial ? (
                "Guardar cambios"
              ) : (
                "Publicar video"
              )}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Modal de fotogramas */}
      <AnimatePresence>
        {showFramePicker && (
          <ThumbnailPickerModal
            frames={frames}
            onSelect={handleFrameSelected}
            onClose={() => setShowFramePicker(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL: VideoManagement
═══════════════════════════════════════════════════════════════ */
export default function VideoManagement() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  /* Listener en tiempo real */
  useEffect(() => {
    const q = query(
      collection(db, "videosTutoriales"),
      orderBy("createdAt", "desc"),
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setVideos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      () => setLoading(false),
    );
    return unsub;
  }, []);

  /* Toggle publicado/borrador */
  const toggleEstado = async (video) => {
    const nuevoEstado = video.estado === "publicado" ? "borrador" : "publicado";
    await updateDoc(doc(db, "videosTutoriales", video.id), {
      estado: nuevoEstado,
      updatedAt: serverTimestamp(),
    });
  };

  /* Eliminar */
  const confirmarEliminar = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "videosTutoriales", deleteTarget.id));
    } catch (err) {
      alert("Error al eliminar: " + err.message);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  /* Copiar enlace */
  const copyLink = (slug) => {
    const url = `${window.location.origin}/videos-soporte/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      const t = document.createElement("div");
      t.textContent = "✅ Enlace copiado";
      t.style.cssText =
        "position:fixed;top:20px;right:20px;background:#2563eb;color:#fff;padding:12px 20px;border-radius:10px;font-weight:600;z-index:100000;box-shadow:0 4px 12px rgba(0,0,0,0.2)";
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 2500);
    });
  };

  /* Filtrado */
  const filtered = videos.filter((v) => {
    const matchSearch =
      !search || (v.titulo || "").toLowerCase().includes(search.toLowerCase());
    const matchCat = !catFilter || v.categoria === catFilter;
    const matchEst = !estadoFilter || v.estado === estadoFilter;
    return matchSearch && matchCat && matchEst;
  });

  const formatFecha = (ts) => {
    if (!ts) return "—";
    const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
    return d.toLocaleDateString("es-DO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-blue-900 dark:text-blue-200">
            Gestión de Videos Tutoriales
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {filtered.length} de {videos.length} videos
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingVideo(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all"
          style={{
            background: "linear-gradient(135deg,#3b82f6,#2563eb)",
            boxShadow: "0 2px 8px rgba(59,130,246,0.35)",
          }}
        >
          <FiPlus size={16} /> Agregar video
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Buscar por título..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3.5 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="px-3.5 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas las categorías</option>
          {CATEGORIAS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={estadoFilter}
          onChange={(e) => setEstadoFilter(e.target.value)}
          className="px-3.5 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los estados</option>
          <option value="publicado">Publicado</option>
          <option value="borrador">Borrador</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <svg
              className="animate-spin w-8 h-8 text-blue-600"
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
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <FiVideo
              size={40}
              className="mx-auto mb-3 text-gray-300 dark:text-gray-600"
            />
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              {videos.length === 0
                ? "Aún no hay videos. ¡Agrega el primero!"
                : "No hay videos que coincidan con los filtros."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/60">
                <tr>
                  {[
                    "Miniatura",
                    "Título",
                    "Categoría",
                    "Estado",
                    "Fecha",
                    "Acciones",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <AnimatePresence>
                  {filtered.map((video) => {
                    const estado =
                      ESTADOS.find((e) => e.value === video.estado) ||
                      ESTADOS[1];
                    return (
                      <motion.tr
                        key={video.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                      >
                        {/* Miniatura */}
                        <td className="px-4 py-3">
                          <div
                            className="rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700"
                            style={{ width: 72, height: 40 }}
                          >
                            {video.thumbnailUrl ? (
                              <img
                                src={video.thumbnailUrl}
                                alt={video.titulo}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FiVideo size={18} className="text-gray-400" />
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Título */}
                        <td className="px-4 py-3 max-w-[220px]">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                            {video.titulo}
                          </p>
                          {video.descripcionCorta && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-1 mt-0.5">
                              {video.descripcionCorta}
                            </p>
                          )}
                        </td>

                        {/* Categoría */}
                        <td className="px-4 py-3">
                          <span
                            className="inline-block text-xs px-2.5 py-1 rounded-full font-medium"
                            style={{
                              background: "rgba(219,234,254,1)",
                              color: "#1d4ed8",
                            }}
                          >
                            {video.categoria || "—"}
                          </span>
                        </td>

                        {/* Estado */}
                        <td className="px-4 py-3">
                          <span
                            className="inline-block text-xs px-2.5 py-1 rounded-full font-semibold"
                            style={{
                              background: estado.bg,
                              color: estado.color,
                            }}
                          >
                            {estado.label}
                          </span>
                        </td>

                        {/* Fecha */}
                        <td className="px-4 py-3">
                          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {formatFecha(video.createdAt)}
                          </span>
                        </td>

                        {/* Acciones */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            {/* Editar */}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingVideo(video);
                                setShowForm(true);
                              }}
                              className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 transition-colors"
                              title="Editar"
                            >
                              <FiEdit2 size={15} />
                            </button>

                            {/* Toggle publicado/borrador */}
                            <button
                              type="button"
                              onClick={() => toggleEstado(video)}
                              className="p-1.5 rounded-lg transition-colors"
                              style={{
                                color:
                                  video.estado === "publicado"
                                    ? "#16a34a"
                                    : "#9ca3af",
                              }}
                              title={
                                video.estado === "publicado"
                                  ? "Pasar a borrador"
                                  : "Publicar"
                              }
                            >
                              {video.estado === "publicado" ? (
                                <FiEye size={15} />
                              ) : (
                                <FiEyeOff size={15} />
                              )}
                            </button>

                            {/* Previsualizar */}
                            <a
                              href={`/videos-soporte/${video.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                              title="Previsualizar"
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
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                            </a>

                            {/* Copiar enlace */}
                            <button
                              type="button"
                              onClick={() => copyLink(video.slug)}
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                              title="Copiar enlace"
                            >
                              <FiCopy size={14} />
                            </button>

                            {/* Eliminar */}
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(video)}
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              style={{ color: "#6b7280" }}
                              title="Eliminar"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Formulario */}
      <AnimatePresence>
        {showForm && (
          <VideoForm
            videoInicial={editingVideo}
            onClose={() => {
              setShowForm(false);
              setEditingVideo(null);
            }}
            onSaved={() => {
              setShowForm(false);
              setEditingVideo(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Modal Confirmar Eliminar */}
      <AnimatePresence>
        {deleteTarget && (
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.65)" }}
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ background: "rgba(239,68,68,0.1)" }}
                >
                  <FiTrash2 size={24} style={{ color: "#ef4444" }} />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  ¿Eliminar video?
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                  "{deleteTarget.titulo}"
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  Esta acción no se puede deshacer.
                </p>
              </div>
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
                  style={{ background: "#2563eb" }}
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
