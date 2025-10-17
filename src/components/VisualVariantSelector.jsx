import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertTriangle, X, Package, Truck, Clock } from 'lucide-react';

const VisualVariantSelector = ({
  variants = [],
  selectedIndex = 0,
  onVariantChange,
  productMainImage = null,
  showPrices = true,
  showStock = true,
  className = ''
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Ensure selected index is valid
  useEffect(() => {
    if (selectedIndex >= variants.length || selectedIndex < 0) {
      onVariantChange?.(0);
    }
  }, [variants.length, selectedIndex, onVariantChange]);

  // Get variant image with fallbacks
  const getVariantImage = (variant) => {
    // Try variant-specific images first
    if (variant.imagen && variant.imagen.trim()) return variant.imagen;
    if (variant.imagenPrincipal && variant.imagenPrincipal[0]?.url) return variant.imagenPrincipal[0].url;
    if (variant.imagenes && variant.imagenes[0]) return variant.imagenes[0];
    if (variant.media && variant.media[0]?.url) return variant.media[0].url;
    
    // Fallback to product main image
    return productMainImage;
  };

  // Get stock status
  const getStockStatus = (variant) => {
    const stock = parseInt(variant.cantidad || variant.stock || 0);
    
    if (stock <= 0) {
      return { status: 'out_of_stock', label: 'Agotado', color: 'text-red-600', bgColor: 'bg-red-50', icon: X };
    } else if (stock <= 5) {
      return { status: 'low_stock', label: `Quedan ${stock}`, color: 'text-yellow-600', bgColor: 'bg-yellow-50', icon: AlertTriangle };
    } else if (stock <= 20) {
      return { status: 'medium_stock', label: `${stock} disponibles`, color: 'text-blue-600', bgColor: 'bg-blue-50', icon: Package };
    } else {
      return { status: 'in_stock', label: 'En stock', color: 'text-green-600', bgColor: 'bg-green-50', icon: Check };
    }
  };

  // Get variant price
  const getVariantPrice = (variant, basePrice = 0) => {
    const variantPrice = parseFloat(variant.precio || variant.price || 0);
    const productPrice = parseFloat(basePrice);
    
    if (variantPrice > 0) {
      const difference = variantPrice - productPrice;
      return {
        price: variantPrice,
        difference,
        hasCustomPrice: true
      };
    }
    
    return {
      price: productPrice,
      difference: 0,
      hasCustomPrice: false
    };
  };

  // Format price for display
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  };

  if (!variants.length) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Variantes disponibles
        </h3>
        <span className="text-sm text-gray-500">
          {variants.length} opcion{variants.length !== 1 ? 'es' : ''}
        </span>
      </div>

      {/* Variant Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3 gap-3">
        {variants.map((variant, index) => {
          const isSelected = index === selectedIndex;
          const isHovered = index === hoveredIndex;
          const stockInfo = getStockStatus(variant);
          const priceInfo = getVariantPrice(variant);
          const variantImage = getVariantImage(variant);
          const isOutOfStock = stockInfo.status === 'out_of_stock';
          
          return (
            <motion.button
              key={variant.id || index}
              onClick={() => !isOutOfStock && onVariantChange?.(index)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              disabled={isOutOfStock}
              className={`
                relative p-3 rounded-xl border-2 transition-all duration-200 text-left
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                  : isOutOfStock
                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }
                ${isHovered && !isSelected && !isOutOfStock ? 'transform scale-[1.02]' : ''}
              `}
              whileTap={!isOutOfStock ? { scale: 0.98 } : {}}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                >
                  <Check className="w-4 h-4 text-white" />
                </motion.div>
              )}

              {/* Out of Stock Overlay */}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-gray-900/20 rounded-xl flex items-center justify-center">
                  <div className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-600">
                    Agotado
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-3">
                {/* Variant Image */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                    {variantImage ? (
                      <img
                        src={variantImage}
                        alt={variant.color || variant.name || `Variante ${index + 1}`}
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Variant Info */}
                <div className="flex-1 min-w-0">
                  {/* Variant Name */}
                  <h4 className="font-medium text-gray-900 truncate">
                    {variant.color || variant.name || `Variante ${index + 1}`}
                  </h4>

                  {/* Description */}
                  {variant.descripcion && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {variant.descripcion}
                    </p>
                  )}

                  {/* Price */}
                  {showPrices && priceInfo.price > 0 && (
                    <div className="mt-2">
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(priceInfo.price)}
                      </span>
                      {priceInfo.hasCustomPrice && priceInfo.difference !== 0 && (
                        <span className={`ml-2 text-sm ${
                          priceInfo.difference > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          ({priceInfo.difference > 0 ? '+' : ''}{formatPrice(priceInfo.difference)})
                        </span>
                      )}
                    </div>
                  )}

                  {/* Stock Status */}
                  {showStock && (
                    <div className={`inline-flex items-center space-x-1 mt-2 px-2 py-1 rounded-full text-xs font-medium ${stockInfo.bgColor} ${stockInfo.color}`}>
                      <stockInfo.icon className="w-3 h-3" />
                      <span>{stockInfo.label}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Hover Effect */}
              <AnimatePresence>
                {isHovered && !isSelected && !isOutOfStock && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-blue-500/5 rounded-xl pointer-events-none"
                  />
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Selected Variant Summary */}
      <AnimatePresence>
        {variants[selectedIndex] && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-white border border-blue-200">
                  {getVariantImage(variants[selectedIndex]) ? (
                    <img
                      src={getVariantImage(variants[selectedIndex])}
                      alt="Variante seleccionada"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-blue-400" />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-blue-900">
                    {variants[selectedIndex].color || variants[selectedIndex].name || `Variante ${selectedIndex + 1}`}
                  </h4>
                  <p className="text-sm text-blue-700">Seleccionado actualmente</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center space-x-2 text-sm text-blue-600">
                {getStockStatus(variants[selectedIndex]).status === 'in_stock' && (
                  <div className="flex items-center space-x-1">
                    <Truck className="w-4 h-4" />
                    <span>Envío disponible</span>
                  </div>
                )}
                {getStockStatus(variants[selectedIndex]).status === 'low_stock' && (
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>¡Últimas unidades!</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stock Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-600">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="w-2 h-2 text-green-600" />
          </div>
          <span>En stock</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-yellow-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-2 h-2 text-yellow-600" />
          </div>
          <span>Pocas unidades</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-red-100 rounded-full flex items-center justify-center">
            <X className="w-2 h-2 text-red-600" />
          </div>
          <span>Agotado</span>
        </div>
      </div>
    </div>
  );
};

export default VisualVariantSelector;
