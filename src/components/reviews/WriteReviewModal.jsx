import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes,
  FaStar,
  FaRegStar,
  FaImage,
  FaVideo,
  FaCloudUploadAlt,
  FaTrashAlt,
  FaCheckCircle,
  FaRegThumbsUp,
  FaRegThumbsDown,
  FaShieldAlt,
} from "react-icons/fa";

/**
 * WriteReviewModal - Modal premium para escribir opiniones, inspirado en
 * Amazon / eBay. Totalmente accesible, responsive y compatible con dark mode.
 *
 * Props:
 *  - isOpen
 *  - onClose()
 *  - onSubmit({ rating, title, comment, recommend, files }) => Promise
 *  - submitting (bool)
 *  - productName (string opcional)
 *  - productImage (string opcional)
 *  - verifiedPurchase (bool opcional) - muestra badge "Compra verificada"
 *  - user { displayName, photoURL } opcional
 */

const RATING_LABELS = {
  1: { label: "No me gustó", color: "text-gray-500" },
  2: { label: "Regular", color: "text-gray-500" },
  3: { label: "Bueno", color: "text-amber-500" },
  4: { label: "Muy bueno", color: "text-amber-600" },
  5: { label: "Excelente", color: "text-amber-600" },
};

const MAX_TITLE = 80;
const MIN_COMMENT = 10;
const MAX_COMMENT = 2000;
const MAX_FILES = 8;
const MAX_FILE_MB = 50;

export default function WriteReviewModal({
  isOpen,
  onClose,
  onSubmit,
  submitting = false,
  productName = "",
  productImage = "",
  verifiedPurchase = false,
  user = null,
}) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [recommend, setRecommend] = useState(null); // true | false | null
  const [files, setFiles] = useState([]); // { file, url, type }
  const [isDragging, setIsDragging] = useState(false);
  const [fieldError, setFieldError] = useState("");

  const fileInputRef = useRef(null);
  const firstFocusRef = useRef(null);

  // Reset on open/close
  useEffect(() => {
    if (!isOpen) {
      setRating(0);
      setHoverRating(0);
      setTitle("");
      setComment("");
      setRecommend(null);
      setFiles((prev) => {
        prev.forEach((f) => f.url && URL.revokeObjectURL(f.url));
        return [];
      });
      setIsDragging(false);
      setFieldError("");
    } else {
      // Focus first field
      setTimeout(() => firstFocusRef.current?.focus(), 80);
    }
  }, [isOpen]);

  // Scroll lock + ESC
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape" && !submitting) onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, submitting, onClose]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      files.forEach((f) => f.url && URL.revokeObjectURL(f.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addFiles = useCallback((list) => {
    const incoming = Array.from(list || []);
    if (!incoming.length) return;
    setFieldError("");
    setFiles((prev) => {
      const next = [...prev];
      for (const file of incoming) {
        if (next.length >= MAX_FILES) break;
        const isImg = file.type.startsWith("image/");
        const isVid = file.type.startsWith("video/");
        if (!isImg && !isVid) continue;
        if (file.size > MAX_FILE_MB * 1024 * 1024) {
          setFieldError(`Cada archivo debe pesar menos de ${MAX_FILE_MB} MB.`);
          continue;
        }
        next.push({
          file,
          url: URL.createObjectURL(file),
          type: isImg ? "image" : "video",
          id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
        });
      }
      return next;
    });
  }, []);

  const removeFile = (id) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target?.url) URL.revokeObjectURL(target.url);
      return prev.filter((f) => f.id !== id);
    });
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };
  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    addFiles(e.dataTransfer?.files);
  };

  const canSubmit = useMemo(() => {
    return (
      rating > 0 &&
      comment.trim().length >= MIN_COMMENT &&
      comment.length <= MAX_COMMENT &&
      title.length <= MAX_TITLE &&
      !submitting
    );
  }, [rating, comment, title, submitting]);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!canSubmit) {
      if (rating === 0) setFieldError("Elige una calificación en estrellas.");
      else if (comment.trim().length < MIN_COMMENT)
        setFieldError(
          `Tu opinión debe tener al menos ${MIN_COMMENT} caracteres.`,
        );
      return;
    }
    setFieldError("");
    try {
      await onSubmit?.({
        rating,
        title: title.trim(),
        comment: comment.trim(),
        recommend,
        files: files.map((f) => f.file),
      });
    } catch (err) {
      setFieldError(err?.message || "No se pudo publicar la opinión.");
    }
  };

  if (!isOpen || typeof document === "undefined") return null;

  const activeRating = hoverRating || rating;
  const ratingLabel = activeRating > 0 ? RATING_LABELS[activeRating] : null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="wr-backdrop"
        className="fixed inset-0 z-[9999] flex items-stretch justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wr-title"
      >
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
          onClick={() => !submitting && onClose?.()}
        />

        <motion.div
          key="wr-card"
          initial={{ scale: 0.98, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.98, opacity: 0, y: 10 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className="relative w-screen h-[100dvh] bg-white dark:bg-gray-900 overflow-hidden flex flex-col"
        >
          {/* HEADER */}
          <div className="px-5 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="flex items-start gap-4 max-w-3xl mx-auto w-full">
              {productImage ? (
                <img
                  src={productImage}
                  alt=""
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-contain bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex-shrink-0"
                />
              ) : null}
              <div className="flex-1 min-w-0">
                <h2
                  id="wr-title"
                  className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-tight truncate"
                >
                  Escribe tu opinión
                </h2>
                {productName ? (
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                    {productName}
                  </p>
                ) : (
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Ayuda a otros compradores con tu experiencia real.
                  </p>
                )}
                {verifiedPurchase && (
                  <span className="inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 text-[11px] font-semibold">
                    <FaShieldAlt size={10} /> Compra verificada
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => !submitting && onClose?.()}
                disabled={submitting}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-300 transition-colors disabled:opacity-50"
                aria-label="Cerrar"
              >
                <FaTimes size={16} />
              </button>
            </div>
          </div>

          {/* BODY - Estilo Amazon compacto */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto w-full px-5 sm:px-6 py-4 space-y-4">
              {/* RATING */}
              <section aria-label="Calificación">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  Calificación general <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <div
                    className="flex items-center"
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    {[1, 2, 3, 4, 5].map((n) => {
                      const filled = n <= activeRating;
                      return (
                        <button
                          key={n}
                          ref={n === 1 ? firstFocusRef : null}
                          type="button"
                          onMouseEnter={() => setHoverRating(n)}
                          onFocus={() => setHoverRating(n)}
                          onBlur={() => setHoverRating(0)}
                          onClick={() => setRating(n)}
                          className="p-0.5 rounded outline-none focus-visible:ring-2 focus-visible:ring-amber-400 transition-transform active:scale-95"
                          aria-label={`${n} ${n === 1 ? "estrella" : "estrellas"}`}
                          aria-pressed={rating === n}
                        >
                          {filled ? (
                            <FaStar className="text-amber-400" size={28} />
                          ) : (
                            <FaRegStar
                              className="text-gray-300 dark:text-gray-600"
                              size={28}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      ratingLabel?.color || "text-gray-400"
                    }`}
                  >
                    {ratingLabel?.label || "Selecciona una puntuación"}
                  </span>
                </div>
              </section>

              {/* TITLE */}
              <section aria-label="Título">
                <label
                  htmlFor="wr-title-input"
                  className="block text-sm font-semibold text-gray-900 dark:text-white mb-1"
                >
                  Agrega un título
                </label>
                <input
                  id="wr-title-input"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value.slice(0, MAX_TITLE))}
                  placeholder="¿Cuál es lo más importante que deben saber?"
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-colors"
                />
              </section>

              {/* COMMENT */}
              <section aria-label="Opinión">
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="wr-comment-input"
                    className="text-sm font-semibold text-gray-900 dark:text-white"
                  >
                    Agrega una opinión por escrito{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <span
                    className={`text-[11px] ${
                      comment.length > MAX_COMMENT
                        ? "text-red-500"
                        : "text-gray-400"
                    }`}
                  >
                    {comment.length}/{MAX_COMMENT}
                  </span>
                </div>
                <textarea
                  id="wr-comment-input"
                  value={comment}
                  onChange={(e) =>
                    setComment(e.target.value.slice(0, MAX_COMMENT))
                  }
                  rows={4}
                  placeholder="¿Qué te gustó o qué no te gustó? ¿Para qué lo usaste?"
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm leading-relaxed resize-none min-h-[100px] focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-colors"
                />
              </section>

              {/* MEDIA UPLOAD - Estilo Amazon: fila de slots compacta */}
              <section aria-label="Fotos y videos">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  Agrega una foto o un video{" "}
                  <span className="text-xs font-normal text-gray-400">
                    (opcional)
                  </span>
                </label>

                <div
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  className={`rounded-lg transition-all ${
                    isDragging
                      ? "ring-2 ring-amber-400 ring-offset-2 dark:ring-offset-gray-900"
                      : ""
                  }`}
                >
                  <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                    {files.map((f) => (
                      <div
                        key={f.id}
                        className="relative group aspect-square rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800"
                      >
                        {f.type === "image" ? (
                          <img
                            src={f.url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full relative">
                            <video
                              src={f.url}
                              className="w-full h-full object-cover"
                              muted
                              playsInline
                              preload="metadata"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <FaVideo className="text-white" size={16} />
                            </div>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(f.id);
                          }}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center opacity-100 transition-opacity"
                          aria-label="Eliminar archivo"
                        >
                          <FaTrashAlt size={10} />
                        </button>
                      </div>
                    ))}

                    {files.length < MAX_FILES && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square rounded-lg border border-dashed border-gray-300 dark:border-gray-600 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                        aria-label="Agregar archivo"
                      >
                        <FaCloudUploadAlt size={18} />
                        <span className="text-[10px] font-medium mt-0.5">
                          Agregar
                        </span>
                      </button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={(e) => {
                      addFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </div>
              </section>

              {fieldError && (
                <div
                  role="alert"
                  className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2"
                >
                  {fieldError}
                </div>
              )}
            </div>
          </form>

          {/* FOOTER estilo Amazon */}
          <div className="px-5 sm:px-6 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center justify-end gap-3 max-w-3xl mx-auto w-full">
              <button
                type="button"
                onClick={() => !submitting && onClose?.()}
                disabled={submitting}
                className="px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium text-sm transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-2 rounded-full text-gray-900 font-semibold text-sm shadow-sm transition-all bg-gradient-to-b from-amber-300 to-amber-400 hover:from-amber-400 hover:to-amber-500 active:scale-[0.98] border border-amber-500 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-gray-900/40 border-t-gray-900 rounded-full animate-spin" />
                    Publicando...
                  </>
                ) : (
                  <>Publicar</>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
