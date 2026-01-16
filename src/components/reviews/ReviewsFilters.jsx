import React, { useState } from "react";
import { FaFilter, FaSortAmountDown } from "react-icons/fa";

/**
 * ReviewsFilters - FILTROS Y ORDENAMIENTO (ESTRUCTURA EXACTA AMAZON)
 *
 * Opciones de filtro:
 * - Por estrellas (1-5)
 * - Con imágenes/videos
 * - Compra verificada
 *
 * Ordenamiento:
 * - Más recientes primero (por defecto)
 * - Más antiguos primero
 * - Mejor calificadas
 * - Peor calificadas
 */
const ReviewsFilters = ({ filters, onFiltersChange, totalReviews }) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleStarFilter = (rating) => {
    onFiltersChange({
      ...filters,
      stars: filters.stars === rating ? null : rating,
    });
  };

  const handleMediaFilter = () => {
    onFiltersChange({
      ...filters,
      hasMedia: !filters.hasMedia,
    });
  };

  const handleVerifiedFilter = () => {
    onFiltersChange({
      ...filters,
      verifiedOnly: !filters.verifiedOnly,
    });
  };

  const handleSortChange = (sortBy) => {
    onFiltersChange({
      ...filters,
      sortBy,
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      stars: null,
      hasMedia: false,
      verifiedOnly: false,
      sortBy: "newest",
    });
  };

  const hasActiveFilters =
    filters.stars ||
    filters.hasMedia ||
    filters.verifiedOnly ||
    filters.sortBy !== "newest";

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 py-4">
      {/* Header con toggle de filtros */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Opiniones de clientes
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {totalReviews.toLocaleString("es-DO")}{" "}
            {totalReviews === 1 ? "reseña" : "reseñas"}
          </span>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
        >
          <FaFilter size={14} />
          <span>Filtros</span>
          {hasActiveFilters && (
            <span className="ml-1 px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full">
              {
                [
                  filters.stars,
                  filters.hasMedia,
                  filters.verifiedOnly,
                  filters.sortBy !== "newest",
                ].filter(Boolean).length
              }
            </span>
          )}
        </button>
      </div>

      {/* Panel de filtros */}
      {showFilters && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filtro por estrellas */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Calificación
              </h4>
              <div className="space-y-1">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleStarFilter(rating)}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
                      filters.stars === rating
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-600"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-blue-500">★</span>
                      <span>{rating}</span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      (
                      {rating === 5
                        ? "excelente"
                        : rating === 4
                        ? "muy buena"
                        : rating === 3
                        ? "regular"
                        : rating === 2
                        ? "mala"
                        : "muy mala"}
                      )
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Filtros adicionales */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Características
              </h4>
              <div className="space-y-2">
                <button
                  onClick={handleMediaFilter}
                  className={`flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
                    filters.hasMedia
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-600"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <span>📷</span>
                  <span>Con imágenes o videos</span>
                </button>

                <button
                  onClick={handleVerifiedFilter}
                  className={`flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
                    filters.verifiedOnly
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-600"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <span>✓</span>
                  <span>Compra verificada</span>
                </button>
              </div>
            </div>

            {/* Ordenamiento */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Ordenar por
              </h4>
              <div className="space-y-1">
                {[
                  { value: "newest", label: "Más recientes primero" },
                  { value: "oldest", label: "Más antiguas primero" },
                  { value: "highest", label: "Mejor calificadas" },
                  { value: "lowest", label: "Peor calificadas" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
                      filters.sortBy === option.value
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-600"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <FaSortAmountDown size={12} />
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Limpiar filtros */}
            <div className="flex flex-col justify-end">
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                >
                  Limpiar todos los filtros
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Resumen de filtros activos */}
      {hasActiveFilters && !showFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.stars && (
            <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
              <span className="text-blue-500">★</span>
              {filters.stars} estrellas
            </span>
          )}
          {filters.hasMedia && (
            <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
              📷 Con medios
            </span>
          )}
          {filters.verifiedOnly && (
            <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
              ✓ Verificadas
            </span>
          )}
          {filters.sortBy !== "newest" && (
            <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
              {filters.sortBy === "oldest"
                ? "Más antiguas"
                : filters.sortBy === "highest"
                ? "Mejor calificadas"
                : "Peor calificadas"}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewsFilters;
