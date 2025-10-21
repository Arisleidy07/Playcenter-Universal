import React from "react";
import { motion } from "framer-motion";

/**
 * VisualVariantSelector - Selector visual de variantes con imágenes
 * Muestra las variantes del producto con sus imágenes, stock y precios
 */
const VisualVariantSelector = ({
  variantes = [],
  varianteSeleccionada = 0,
  onVarianteChange,
  showStock = true,
  showPrice = true,
  className = "",
}) => {
  if (!variantes || variantes.length === 0) {
    return null;
  }

  // Filtrar variantes que tienen color definido
  const variantesConColor = variantes.filter(
    (v) => v && typeof v.color === "string" && v.color.trim()
  );

  if (variantesConColor.length === 0) {
    return null;
  }

  const handleVariantClick = (index) => {
    if (onVarianteChange) {
      onVarianteChange(index);
    }
  };

  return (
    <div className={`visual-variant-selector ${className}`}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {variantesConColor.map((variante, index) => {
          const isSelected = index === varianteSeleccionada;
          const isOutOfStock = variante.cantidad <= 0;
          
          // Obtener imagen de la variante
          const imagenVariante =
            variante.imagenPrincipal?.[0]?.url ||
            variante.imagen ||
            variante.imagenes?.[0] ||
            null;

          return (
            <motion.button
              key={index}
              type="button"
              onClick={() => !isOutOfStock && handleVariantClick(index)}
              disabled={isOutOfStock}
              whileHover={!isOutOfStock ? { scale: 1.05 } : {}}
              whileTap={!isOutOfStock ? { scale: 0.95 } : {}}
              className={`
                relative p-3 rounded-lg border-2 transition-all duration-200
                ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                }
                ${
                  isOutOfStock
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer"
                }
              `}
            >
              {/* Imagen de la variante */}
              {imagenVariante && (
                <div className="aspect-square mb-2 rounded overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <img
                    src={imagenVariante}
                    alt={variante.color}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {/* Color */}
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                {variante.color}
              </div>

              {/* Stock */}
              {showStock && (
                <div
                  className={`text-xs ${
                    isOutOfStock
                      ? "text-red-600 dark:text-red-400"
                      : variante.cantidad < 5
                      ? "text-orange-600 dark:text-orange-400"
                      : "text-green-600 dark:text-green-400"
                  }`}
                >
                  {isOutOfStock
                    ? "Agotado"
                    : `${variante.cantidad} disponibles`}
                </div>
              )}

              {/* Precio específico de variante */}
              {showPrice && variante.precio && (
                <div className="text-sm font-semibold text-green-600 dark:text-green-400 mt-1">
                  RD$ {Number(variante.precio).toFixed(2)}
                </div>
              )}

              {/* Indicador de selección */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                >
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </motion.div>
              )}

              {/* Overlay de agotado */}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-gray-900/50 rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    Agotado
                  </span>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default VisualVariantSelector;
