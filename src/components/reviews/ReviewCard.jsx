import React from "react";
import { motion } from "framer-motion";
import { FaTrash, FaImage, FaVideo } from "react-icons/fa";

/**
 * ReviewCard - BLOQUE INDEPENDIENTE (ESTRUCTURA EXACTA AMAZON)
 *
 * Cada reseña muestra:
 * - Nombre del usuario
 * - Fecha (ej. "Reseñado el 12 de enero de 2026")
 * - ⭐ Estrellas
 * - Texto del comentario
 * - Miniaturas (máx. 4 visibles, "+X" si hay más)
 */
const ReviewCard = ({
  review,
  canDelete = false,
  onDelete,
  onImageClick,
  isDeleting = false,
}) => {
  // Formato exacto de fecha como Amazon
  const formatDate = (timestamp) => {
    if (!timestamp) return "";

    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const options = {
        day: "numeric",
        month: "long",
        year: "numeric",
      };
      return `Reseñado el ${date.toLocaleDateString("es-DO", options)}`;
    } catch (error) {
      return "Fecha no disponible";
    }
  };

  // Combinar imágenes y videos para miniaturas
  const allMedia = [
    ...(review.images || []).map((url) => ({ type: "image", url })),
    ...(review.videos || []).map((url) => ({ type: "video", url })),
  ];

  // Mostrar máximo 4 miniaturas
  const visibleMedia = allMedia.slice(0, 4);
  const hasMoreMedia = allMedia.length > 4;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="border-b border-gray-200 dark:border-gray-700 py-3 last:border-b-0"
    >
      {/* CABECERA: NOMBRE, FECHA, ESTRELLAS, ELIMINAR */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {/* Avatar y nombre */}
            <div className="flex items-center gap-2">
              {review.userPhoto ? (
                <img
                  src={review.userPhoto}
                  alt={review.userName}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                  <span className="text-xs text-gray-600 dark:text-gray-300">
                    {(review.userName || "U").charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="font-medium text-gray-900 dark:text-white">
                {review.userName || "Usuario"}
              </span>
            </div>

            {/* Fecha */}
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {formatDate(review.createdAt)}
            </span>
          </div>

          {/* Estrellas */}
          <div className="flex items-center gap-1 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={`text-lg ${
                  i < review.rating ? "text-blue-500" : "text-gray-300"
                }`}
              >
                ★
              </span>
            ))}
            {review.verifiedPurchase && (
              <span className="ml-2 text-xs text-green-600 dark:text-green-400 font-medium">
                ✓ Compra verificada
              </span>
            )}
          </div>
        </div>

        {/* Botón eliminar (solo si es autor) */}
        {canDelete && (
          <button
            onClick={() => onDelete(review)}
            disabled={isDeleting}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200 disabled:opacity-50"
            title="Eliminar reseña"
          >
            <FaTrash size={14} />
          </button>
        )}
      </div>

      {/* TEXTO DEL COMENTARIO */}
      <div className="mb-3">
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
          {review.comment}
        </p>
      </div>

      {/* MINIATURAS (MÁX. 4 VISIBLES) */}
      {allMedia.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          {visibleMedia.map((media, index) => (
            <button
              key={`${media.type}-${index}`}
              onClick={() => onImageClick(review, index)}
              className="relative group border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md hover:border-blue-400 bg-gray-50 dark:bg-gray-800 transition-transform hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-zoom-in"
              style={{ width: "128px", height: "128px" }}
            >
              {media.type === "image" ? (
                <img
                  src={media.url}
                  alt={`Imagen ${index + 1}`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <FaVideo
                    className="text-gray-400 dark:text-gray-500"
                    size={20}
                  />
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gray-900/0 group-hover:bg-gray-900/10 transition-all duration-200 flex items-center justify-center">
                <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Ver
                </span>
              </div>
            </button>
          ))}

          {/* Indicador "+X" si hay más */}
          {hasMoreMedia && (
            <button
              onClick={() => onImageClick(review, 4)}
              className="border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 flex items-center justify-center"
              style={{ width: "128px", height: "128px" }}
            >
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                +{allMedia.length - 4}
              </span>
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default ReviewCard;
