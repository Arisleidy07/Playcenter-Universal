import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Star, 
  Heart, 
  ShoppingCart, 
  Eye, 
  Play, 
  Image as ImageIcon,
  Truck,
  Clock,
  Tag,
  Zap
} from 'lucide-react';

const OptimizedProductCard = ({
  product,
  layout = 'grid', // 'grid' | 'horizontal' | 'compact'
  showQuickActions = true,
  showRating = true,
  showBadges = true,
  onAddToCart,
  onToggleFavorite,
  onQuickView,
  className = ''
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const imageRef = useRef(null);

  // Get main image with fallbacks
  const getMainImage = () => {
    if (product.imagen) return product.imagen;
    if (product.imagenPrincipal && product.imagenPrincipal[0]?.url) return product.imagenPrincipal[0].url;
    if (product.imagenes && product.imagenes[0]) return product.imagenes[0];
    if (product.media && product.media[0]?.url) return product.media[0].url;
    return null;
  };

  // Get additional media count
  const getMediaCount = () => {
    let count = 0;
    if (product.imagenes) count += product.imagenes.length;
    if (product.videoUrls) count += product.videoUrls.length;
    if (product.videoAcercaArticulo) count += product.videoAcercaArticulo.length;
    if (product.imagenesExtra) count += product.imagenesExtra.length;
    return count;
  };

  // Check if product has video
  const hasVideo = () => {
    return !!(
      product.videoUrl ||
      (product.videoUrls && product.videoUrls.length > 0) ||
      (product.videoAcercaArticulo && product.videoAcercaArticulo.length > 0)
    );
  };

  // Format price
  const formatPrice = (price) => {
    const numPrice = parseFloat(price) || 0;
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(numPrice);
  };

  // Calculate discount percentage
  const getDiscountPercentage = () => {
    if (!product.oferta || !product.precioOferta) return 0;
    const originalPrice = parseFloat(product.precio) || 0;
    const salePrice = parseFloat(product.precioOferta) || 0;
    if (originalPrice <= 0 || salePrice <= 0) return 0;
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  };

  // Get stock status
  const getStockStatus = () => {
    const stock = parseInt(product.cantidad || 0);
    if (stock <= 0) return { status: 'out', label: 'Agotado', color: 'text-red-600' };
    if (stock <= 5) return { status: 'low', label: 'Últimas unidades', color: 'text-yellow-600' };
    return { status: 'available', label: 'Disponible', color: 'text-green-600' };
  };

  // Get rating display
  const getRating = () => {
    const rating = parseFloat(product.rating || product.calificacion || 0);
    const reviews = parseInt(product.reviews || product.resenas || 0);
    return { rating, reviews };
  };

  const mainImage = getMainImage();
  const mediaCount = getMediaCount();
  const discountPercentage = getDiscountPercentage();
  const stockStatus = getStockStatus();
  const { rating, reviews } = getRating();

  // Responsive classes based on layout
  const getLayoutClasses = () => {
    switch (layout) {
      case 'horizontal':
        return 'flex flex-row space-x-4 p-4';
      case 'compact':
        return 'flex flex-col space-y-2 p-3';
      default: // grid
        return 'flex flex-col space-y-3 p-4';
    }
  };

  const getImageClasses = () => {
    switch (layout) {
      case 'horizontal':
        return 'w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0';
      case 'compact':
        return 'w-full aspect-square';
      default: // grid
        return 'w-full aspect-square';
    }
  };

  return (
    <motion.div
      className={`
        bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-300
        hover:shadow-lg hover:border-gray-300 group
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -2 }}
      layout
    >
      <div className={getLayoutClasses()}>
        {/* Product Image */}
        <div className={`relative ${getImageClasses()}`}>
          <Link to={`/producto/${product.id}`} className="block w-full h-full">
            <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
              {mainImage && !imageError ? (
                <>
                  <img
                    ref={imageRef}
                    src={mainImage}
                    alt={product.nombre || 'Producto'}
                    className={`
                      w-full h-full object-contain transition-all duration-300
                      ${imageLoaded ? 'opacity-100' : 'opacity-0'}
                      ${isHovered ? 'scale-105' : 'scale-100'}
                    `}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                    loading="lazy"
                  />
                  {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}

              {/* Badges */}
              {showBadges && (
                <div className="absolute top-2 left-2 flex flex-col space-y-1">
                  {discountPercentage > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      -{discountPercentage}%
                    </span>
                  )}
                  {product.nuevo && (
                    <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      Nuevo
                    </span>
                  )}
                  {product.destacado && (
                    <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center space-x-1">
                      <Zap className="w-3 h-3" />
                      <span>Top</span>
                    </span>
                  )}
                </div>
              )}

              {/* Media Indicators */}
              <div className="absolute top-2 right-2 flex flex-col space-y-1">
                {hasVideo() && (
                  <div className="bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                    <Play className="w-3 h-3" />
                    <span>Video</span>
                  </div>
                )}
                {mediaCount > 1 && (
                  <div className="bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                    <ImageIcon className="w-3 h-3" />
                    <span>+{mediaCount - 1}</span>
                  </div>
                )}
              </div>

              {/* Quick Actions Overlay */}
              {showQuickActions && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isHovered ? 1 : 0 }}
                  className="absolute inset-0 bg-black/20 flex items-center justify-center space-x-2"
                >
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      onQuickView?.(product);
                    }}
                    className="bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full transition-colors"
                    title="Vista rápida"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      onToggleFavorite?.(product);
                    }}
                    className="bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full transition-colors"
                    title="Agregar a favoritos"
                  >
                    <Heart className="w-4 h-4" />
                  </button>
                  {stockStatus.status !== 'out' && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        onAddToCart?.(product);
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-colors"
                      title="Agregar al carrito"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              )}
            </div>
          </Link>
        </div>

        {/* Product Info */}
        <div className={`flex-1 ${layout === 'horizontal' ? 'min-w-0' : ''}`}>
          {/* Brand */}
          {product.empresa && (
            <p className="text-xs text-gray-500 mb-1 truncate">{product.empresa}</p>
          )}

          {/* Title */}
          <Link to={`/producto/${product.id}`}>
            <h3 className={`
              font-medium text-gray-900 hover:text-blue-600 transition-colors
              ${layout === 'horizontal' ? 'text-sm line-clamp-2' : 'text-sm line-clamp-2 sm:text-base'}
            `}>
              {product.nombre || 'Producto sin nombre'}
            </h3>
          </Link>

          {/* Rating */}
          {showRating && rating > 0 && (
            <div className="flex items-center space-x-1 mt-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(rating) 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">
                {rating.toFixed(1)} {reviews > 0 && `(${reviews})`}
              </span>
            </div>
          )}

          {/* Price */}
          <div className="mt-2">
            {product.oferta && product.precioOferta ? (
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-red-600">
                  {formatPrice(product.precioOferta)}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.precio)}
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(product.precio)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className={`text-xs mt-1 ${stockStatus.color}`}>
            {stockStatus.label}
          </div>

          {/* Shipping Info */}
          {stockStatus.status !== 'out' && (
            <div className="flex items-center space-x-1 mt-2 text-xs text-gray-600">
              <Truck className="w-3 h-3" />
              <span>Envío disponible</span>
            </div>
          )}

          {/* Tags */}
          {product.etiquetas && product.etiquetas.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {product.etiquetas.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center space-x-1 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full"
                >
                  <Tag className="w-2 h-2" />
                  <span>{tag}</span>
                </span>
              ))}
              {product.etiquetas.length > 2 && (
                <span className="text-xs text-gray-500">
                  +{product.etiquetas.length - 2} más
                </span>
              )}
            </div>
          )}

          {/* Mobile Quick Actions */}
          {layout !== 'horizontal' && (
            <div className="flex items-center justify-between mt-3 sm:hidden">
              <button
                onClick={() => onToggleFavorite?.(product)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Heart className="w-5 h-5" />
              </button>
              {stockStatus.status !== 'out' && (
                <button
                  onClick={() => onAddToCart?.(product)}
                  className="flex-1 ml-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                  Agregar al carrito
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default OptimizedProductCard;
