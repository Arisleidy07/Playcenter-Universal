import React, { useState } from "react";
import { motion } from "framer-motion";

/**
 * ReviewsSummary - NIVEL 1 (ESTRUCTURA EXACTA AMAZON)
 *
 * Muestra únicamente:
 * - ⭐ Promedio grande
 * - Total de reseñas
 * - Distribución por estrellas
 * - Botón: "Ver todas las reseñas"
 *
 * SIN IMÁGENES AQUÍ
 */
const ReviewsSummary = ({
  ratingAverage = 0,
  ratingCount = 0,
  ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  onScrollToReviews,
  loading = false,
}) => {
  const [hoverBars, setHoverBars] = useState(false);
  if (ratingCount === 0 && !loading) {
    return (
      <div className="border-b border-gray-200 dark:border-gray-700 py-6">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p className="text-sm">Sin reseñas todavía</p>
          <p className="text-xs mt-1">
            Sé el primero en opinar sobre este producto
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="border-b border-gray-200 dark:border-gray-700 py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto mb-6"></div>
          <div className="space-y-2 max-w-md mx-auto">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-3 bg-gray-200 dark:bg-gray-700 rounded"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Calcular porcentajes para distribución
  const totalReviews = ratingCount;
  const breakdownWithPercentage = Object.entries(ratingBreakdown)
    .reverse() // 5 estrellas primero
    .map(([stars, count]) => ({
      stars: Number(stars),
      count,
      percentage:
        totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0,
    }));

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 py-6">
      {/* PROMEDIO GRANDE Y TOTAL */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-3xl font-bold text-gray-900 dark:text-white">
            {ratingAverage.toFixed(1)}
          </span>
          <div className="flex text-2xl">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={
                  i < Math.round(ratingAverage)
                    ? "text-amber-400"
                    : "text-gray-300"
                }
              >
                ★
              </span>
            ))}
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {totalReviews.toLocaleString("es-DO")}{" "}
          {totalReviews === 1 ? "reseña" : "reseñas"}
        </p>
      </div>

      {/* DISTRIBUCIÓN POR ESTRELLAS */}
      <div
        className="max-w-md mx-auto mb-6"
        onMouseEnter={() => setHoverBars(true)}
        onMouseLeave={() => setHoverBars(false)}
      >
        {breakdownWithPercentage.map(({ stars, count, percentage }) => (
          <div key={stars} className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-1 w-20">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {stars}
              </span>
              <span className="text-amber-400 text-sm">★</span>
            </div>
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div className="relative w-full h-full">
                {/* Base visible siempre */}
                <div
                  className="absolute inset-y-0 left-0 bg-amber-400/70 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
                {/* Capa animada en hover */}
                <motion.div
                  className="absolute inset-y-0 left-0 bg-amber-500 rounded-full"
                  style={{ width: `${percentage}%` }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: hoverBars ? 1 : 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
              {percentage}%
            </div>
          </div>
        ))}
      </div>

      {/* Botón removido: el diseño solicitado no muestra CTA aquí */}
    </div>
  );
};

export default ReviewsSummary;
