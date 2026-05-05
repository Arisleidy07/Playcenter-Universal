import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { fixBucket } from "../../utils/imageUtils";
import {
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaPlay,
  FaImage,
} from "react-icons/fa";

/**
 * ReviewMediaModal - NIVEL 3 (ESTRUCTURA EXACTA AMAZON)
 *
 * DESKTOP (60/40):
 * - Izquierda (60%): Imagen grande centrada, fondo oscuro, flechas fuera
 * - Derecha (40%): Info reseña, scroll si texto largo
 *
 * MOBILE:
 * - Imagen ocupa casi toda pantalla
 * - Swipe izquierda/derecha
 * - Debajo: estrellas, nombre, fecha, texto
 *
 * TABLET: Híbrido (imagen arriba, comentario debajo)
 */
const ReviewMediaModal = ({
  isOpen,
  onClose,
  reviews,
  initialReviewIndex = 0,
  initialMediaIndex = 0,
}) => {
  const [currentReviewIndex, setCurrentReviewIndex] =
    useState(initialReviewIndex);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(initialMediaIndex);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const modalRef = useRef(null);
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);

  // Filtrar solo reseñas con imágenes/videos
  const reviewsWithMedia = reviews.filter(
    (review) => review.images?.length > 0 || review.videos?.length > 0,
  );

  const currentReview = reviewsWithMedia[currentReviewIndex];

  // Combinar imágenes y videos de la reseña actual
  const currentMedia = [
    ...(currentReview?.images || []).map((url) => ({
      type: "image",
      url: fixBucket(url),
    })),
    ...(currentReview?.videos || []).map((url) => ({
      type: "video",
      url: fixBucket(url),
    })),
  ];

  const currentMediaItem = currentMedia[currentMediaIndex];

  // Navegación por reseñas (no por imágenes individuales)
  const goToPreviousReview = useCallback(() => {
    if (currentReviewIndex > 0) {
      setCurrentReviewIndex((prev) => prev - 1);
      setCurrentMediaIndex(0); // Resetear al primera imagen de la reseña anterior
    }
  }, [currentReviewIndex]);

  const goToNextReview = useCallback(() => {
    if (currentReviewIndex < reviewsWithMedia.length - 1) {
      setCurrentReviewIndex((prev) => prev + 1);
      setCurrentMediaIndex(0); // Resetear al primera imagen de la siguiente reseña
    }
  }, [currentReviewIndex, reviewsWithMedia.length]);

  // Cerrar con Escape + preservar scroll SOLO cuando el modal está abierto
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);

    // Guardar scroll actual y fijar body sin perder posición
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      // Restaurar estilos y scroll a la posición previa
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      window.scrollTo(0, scrollY);
    };
  }, [isOpen, onClose]);

  // Touch gestures para móvil
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };

  const handleTouchEnd = () => {
    const threshold = 50;
    if (Math.abs(touchDeltaX.current) > threshold) {
      if (touchDeltaX.current > 0) {
        goToPreviousReview();
      } else {
        goToNextReview();
      }
    }
    touchDeltaX.current = 0;
  };

  // Formato de fecha como Amazon
  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const options = { day: "numeric", month: "long", year: "numeric" };
      return `Reseñado el ${date.toLocaleDateString("es-DO", options)}`;
    } catch (error) {
      return "Fecha no disponible";
    }
  };

  if (!isOpen || !currentReview || !currentMediaItem) return null;

  const renderDesktop = () => (
    <div className="flex h-full">
      {/* IZQUIERDA (60%) - Imagen grande */}
      <div className="w-[60%] bg-gray-50 dark:bg-gray-800 flex items-center justify-center relative">
        {/* Flechas fuera de la imagen */}
        {reviewsWithMedia.length > 1 && (
          <>
            <button
              onClick={goToPreviousReview}
              disabled={currentReviewIndex === 0}
              className="absolute left-4 z-20 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <FaChevronLeft size={20} />
            </button>
            <button
              onClick={goToNextReview}
              disabled={currentReviewIndex === reviewsWithMedia.length - 1}
              className="absolute right-4 z-20 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <FaChevronRight size={20} />
            </button>
          </>
        )}

        {/* Imagen/Video centrado - se adapta al contenedor */}
        <div className="absolute inset-0 flex items-center justify-center p-8">
          {currentMediaItem.type === "image" ? (
            <img
              src={fixBucket(currentMediaItem.url)}
              alt="Imagen de reseña"
              className="w-full h-full object-contain"
              onLoad={() => setIsImageLoading(false)}
              onError={() => setIsImageLoading(false)}
            />
          ) : (
            <video
              src={fixBucket(currentMediaItem.url)}
              controls
              className="w-full h-full object-contain"
              autoPlay
            />
          )}
        </div>

        {/* Indicador: "Imagen X de Y" */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-gray-900/60 px-3 py-1 rounded-full">
          Imagen {currentMediaIndex + 1} de {currentMedia.length}
        </div>
      </div>

      {/* DERECHA (40%) - Información de la reseña */}
      <div className="w-[40%] bg-white dark:bg-gray-900 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6">
          {/* Nombre y avatar */}
          <div className="flex items-center gap-3 mb-4">
            {currentReview.userPhoto ? (
              <img
                src={fixBucket(currentReview.userPhoto)}
                alt={currentReview.userName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {(currentReview.userName || "U").charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {currentReview.userName || "Usuario"}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(currentReview.createdAt)}
              </p>
            </div>
          </div>

          {/* Estrellas */}
          <div className="flex items-center gap-1 mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={`text-lg ${
                  i < currentReview.rating ? "text-blue-500" : "text-gray-300"
                }`}
              >
                ★
              </span>
            ))}
            {currentReview.verifiedPurchase && (
              <span className="ml-2 text-sm text-green-600 dark:text-green-400 font-medium">
                ✓ Compra verificada
              </span>
            )}
          </div>

          {/* Texto completo con scroll */}
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {currentReview.comment}
          </div>
        </div>
      </div>
    </div>
  );

  const renderMobile = () => (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400 text-sm">
          Imagen {currentMediaIndex + 1} de {currentMedia.length}
        </div>
      </div>

      {/* Imagen/Video principal */}
      <div
        className="flex-1 flex items-center justify-center relative bg-white dark:bg-gray-900 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {currentMediaItem.type === "image" ? (
          <img
            src={fixBucket(currentMediaItem.url)}
            alt="Imagen de reseña"
            className="w-full h-full object-contain p-2"
          />
        ) : (
          <video
            src={fixBucket(currentMediaItem.url)}
            controls
            className="w-full h-full object-contain p-2"
          />
        )}

        {/* Flechas laterales */}
        {reviewsWithMedia.length > 1 && (
          <>
            <button
              onClick={goToPreviousReview}
              disabled={currentReviewIndex === 0}
              className="absolute left-4 p-3 bg-gray-900/10 hover:bg-gray-900/20 text-gray-700 dark:text-white rounded-full transition-all duration-200 disabled:opacity-30"
            >
              <FaChevronLeft size={18} />
            </button>
            <button
              onClick={goToNextReview}
              disabled={currentReviewIndex === reviewsWithMedia.length - 1}
              className="absolute right-4 p-3 bg-gray-900/10 hover:bg-gray-900/20 text-gray-700 dark:text-white rounded-full transition-all duration-200 disabled:opacity-30"
            >
              <FaChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {/* Información debajo */}
      <div className="bg-white dark:bg-gray-900 p-4">
        {/* Estrellas y nombre */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={`text-sm ${
                  i < currentReview.rating ? "text-blue-500" : "text-gray-300"
                }`}
              >
                ★
              </span>
            ))}
          </div>
          <span className="font-medium text-gray-900 dark:text-white text-sm">
            {currentReview.userName || "Usuario"}
          </span>
        </div>

        {/* Fecha */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          {formatDate(currentReview.createdAt)}
        </p>

        {/* Texto */}
        <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed max-h-32 overflow-y-auto">
          {currentReview.comment}
        </div>
      </div>
    </div>
  );

  const renderTablet = () => (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="text-gray-600 dark:text-gray-400 text-sm">
          Imagen {currentMediaIndex + 1} de {currentMedia.length}
        </div>
      </div>

      {/* Imagen arriba */}
      <div
        className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-800 relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {currentMediaItem.type === "image" ? (
          <img
            src={fixBucket(currentMediaItem.url)}
            alt="Imagen de reseña"
            className="w-full h-full object-contain p-4"
          />
        ) : (
          <video
            src={fixBucket(currentMediaItem.url)}
            controls
            className="w-full h-full object-contain p-4"
          />
        )}

        {/* Flechas */}
        {reviewsWithMedia.length > 1 && (
          <>
            <button
              onClick={goToPreviousReview}
              disabled={currentReviewIndex === 0}
              className="absolute left-4 p-3 bg-gray-900/10 hover:bg-gray-900/20 text-gray-700 dark:text-white rounded-full transition-all duration-200 disabled:opacity-30"
            >
              <FaChevronLeft size={18} />
            </button>
            <button
              onClick={goToNextReview}
              disabled={currentReviewIndex === reviewsWithMedia.length - 1}
              className="absolute right-4 p-3 bg-gray-900/10 hover:bg-gray-900/20 text-gray-700 dark:text-white rounded-full transition-all duration-200 disabled:opacity-30"
            >
              <FaChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {/* Comentario debajo */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          {currentReview.userPhoto ? (
            <img
              src={fixBucket(currentReview.userPhoto)}
              alt={currentReview.userName}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
              <span className="text-xs text-gray-600 dark:text-gray-300">
                {(currentReview.userName || "U").charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              {currentReview.userName || "Usuario"}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatDate(currentReview.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={`text-base ${
                i < currentReview.rating ? "text-blue-500" : "text-gray-300"
              }`}
            >
              ★
            </span>
          ))}
        </div>

        <div className="text-gray-700 dark:text-gray-300 leading-relaxed max-h-40 overflow-y-auto">
          {currentReview.comment}
        </div>
      </div>
    </div>
  );

  // Detectar dispositivo
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const isTablet =
    typeof window !== "undefined" &&
    window.innerWidth >= 768 &&
    window.innerWidth < 1280;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={modalRef}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full h-full max-w-7xl max-h-[90vh] bg-white dark:bg-gray-900 overflow-hidden relative rounded-2xl"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón cerrar siempre visible (esquina superior derecha) */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/90 hover:bg-white text-gray-700 dark:bg-gray-800/90 dark:hover:bg-gray-800 dark:text-gray-200 shadow"
              aria-label="Cerrar"
            >
              <FaTimes size={18} />
            </button>
            {isMobile && renderMobile()}
            {isTablet && renderTablet()}
            {!isMobile && !isTablet && renderDesktop()}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default ReviewMediaModal;
