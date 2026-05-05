import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FaTrash,
  FaImage,
  FaVideo,
  FaRegThumbsUp,
  FaThumbsUp,
  FaShieldAlt,
} from "react-icons/fa";
import {
  doc,
  runTransaction,
  arrayUnion,
  arrayRemove,
  increment,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";

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
  const { usuario } = useAuth() || {};
  const alreadyVoted = !!(
    usuario?.uid && (review.helpfulBy || []).includes(usuario.uid)
  );
  const [helpfulBusy, setHelpfulBusy] = useState(false);
  const [localVoted, setLocalVoted] = useState(alreadyVoted);
  const [localCount, setLocalCount] = useState(
    Number(review.helpfulCount) || 0,
  );

  const toggleHelpful = async () => {
    if (!usuario) return;
    if (!review?.productId || !review?.id) return;
    if (helpfulBusy) return;
    setHelpfulBusy(true);
    const nextVoted = !localVoted;
    // Optimistic
    setLocalVoted(nextVoted);
    setLocalCount((c) => Math.max(0, c + (nextVoted ? 1 : -1)));
    try {
      const rRef = doc(db, "productos", review.productId, "reviews", review.id);
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(rRef);
        if (!snap.exists()) return;
        const data = snap.data();
        const voters = Array.isArray(data.helpfulBy) ? data.helpfulBy : [];
        const has = voters.includes(usuario.uid);
        if (nextVoted && !has) {
          tx.update(rRef, {
            helpfulCount: increment(1),
            helpfulBy: arrayUnion(usuario.uid),
          });
        } else if (!nextVoted && has) {
          tx.update(rRef, {
            helpfulCount: increment(-1),
            helpfulBy: arrayRemove(usuario.uid),
          });
        }
      });
    } catch (e) {
      // Rollback
      setLocalVoted(!nextVoted);
      setLocalCount((c) => Math.max(0, c + (nextVoted ? -1 : 1)));
    } finally {
      setHelpfulBusy(false);
    }
  };

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
                  i < review.rating ? "text-amber-400" : "text-gray-300"
                }`}
              >
                ★
              </span>
            ))}
            {review.verifiedPurchase && (
              <span className="ml-2 inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-full px-2 py-0.5 font-semibold">
                <FaShieldAlt size={10} /> Compra verificada
              </span>
            )}
            {review.recommend === true && (
              <span className="ml-2 inline-flex items-center gap-1 text-[11px] text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-full px-2 py-0.5 font-semibold">
                <FaRegThumbsUp size={10} /> Lo recomienda
              </span>
            )}
          </div>

          {/* Título (opcional) */}
          {review.title && (
            <h4 className="text-[15px] font-semibold text-gray-900 dark:text-white mb-1 leading-snug">
              {review.title}
            </h4>
          )}
        </div>

        {/* Botón eliminar (solo si es autor) */}
        {canDelete && (
          <button
            onClick={() => onDelete(review)}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-red-600 hover:text-white border border-red-200 dark:border-red-800/60 hover:bg-red-600 hover:border-red-600 transition-colors disabled:opacity-50"
            title="Eliminar tu opinión"
            aria-label="Eliminar opinión"
          >
            <FaTrash size={11} />
            <span className="hidden sm:inline">
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </span>
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
        <div className="flex items-center gap-3 flex-wrap mb-3">
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

      {/* ACCIONES: Útil */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={toggleHelpful}
          disabled={!usuario || helpfulBusy}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
            localVoted
              ? "bg-blue-600 text-white border-blue-600 shadow"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:text-blue-600"
          } ${!usuario ? "opacity-60 cursor-not-allowed" : ""}`}
          title={
            usuario
              ? localVoted
                ? "Quitar voto"
                : "¿Te resultó útil?"
              : "Inicia sesión para votar"
          }
        >
          {localVoted ? <FaThumbsUp size={12} /> : <FaRegThumbsUp size={12} />}
          {localVoted ? "Útil" : "Me resultó útil"}
          {localCount > 0 && (
            <span
              className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${
                localVoted
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
              }`}
            >
              {localCount}
            </span>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default ReviewCard;
