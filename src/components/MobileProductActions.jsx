import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  MessageCircle, 
  Phone,
  Plus,
  Minus,
  Check,
  X,
  Truck,
  Shield,
  Clock,
  Star
} from 'lucide-react';

const MobileProductActions = ({
  product,
  selectedVariant = null,
  cartQuantity = 0,
  isFavorite = false,
  isInStock = true,
  onAddToCart,
  onRemoveFromCart,
  onToggleFavorite,
  onShare,
  onContact,
  onBuyNow,
  className = ''
}) => {
  const [showQuantitySelector, setShowQuantitySelector] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showAddedFeedback, setShowAddedFeedback] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Auto-hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Get effective price (variant or product)
  const getEffectivePrice = () => {
    if (selectedVariant && selectedVariant.precio) {
      return parseFloat(selectedVariant.precio);
    }
    return parseFloat(product.precio) || 0;
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  };

  // Handle add to cart with feedback
  const handleAddToCart = () => {
    onAddToCart?.(product, selectedVariant, quantity);
    setShowAddedFeedback(true);
    setTimeout(() => setShowAddedFeedback(false), 2000);
    setShowQuantitySelector(false);
  };

  // Handle quantity changes
  const incrementQuantity = () => {
    const maxStock = selectedVariant?.cantidad || product.cantidad || 99;
    setQuantity(prev => Math.min(prev + 1, maxStock));
  };

  const decrementQuantity = () => {
    setQuantity(prev => Math.max(prev - 1, 1));
  };

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.nombre,
          text: `Mira este producto: ${product.nombre}`,
          url: window.location.href
        });
      } catch (error) {
        onShare?.(product);
      }
    } else {
      onShare?.(product);
    }
  };

  const effectivePrice = getEffectivePrice();
  const hasDiscount = product.oferta && product.precioOferta;
  const discountPrice = hasDiscount ? parseFloat(product.precioOferta) : null;

  return (
    <>
      {/* Fixed Bottom Actions Bar */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className={`
              fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 
              shadow-lg safe-area-pb ${className}
            `}
          >
            {/* Price Bar */}
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {hasDiscount ? (
                    <>
                      <span className="text-lg font-bold text-red-600">
                        {formatPrice(discountPrice)}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(effectivePrice)}
                      </span>
                      <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-medium">
                        -{Math.round(((effectivePrice - discountPrice) / effectivePrice) * 100)}%
                      </span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-gray-900">
                      {formatPrice(effectivePrice)}
                    </span>
                  )}
                </div>
                
                {/* Stock Status */}
                <div className="flex items-center space-x-1 text-xs">
                  {isInStock ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-600">En stock</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-red-600">Agotado</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-4 py-3">
              <div className="flex items-center space-x-3">
                {/* Secondary Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onToggleFavorite?.(product)}
                    className={`
                      p-3 rounded-full border-2 transition-all
                      ${isFavorite 
                        ? 'border-red-500 bg-red-50 text-red-500' 
                        : 'border-gray-300 bg-white text-gray-600 hover:border-red-300 hover:text-red-500'
                      }
                    `}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                  
                  <button
                    onClick={handleShare}
                    className="p-3 rounded-full border-2 border-gray-300 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-500 transition-all"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => onContact?.(product)}
                    className="p-3 rounded-full border-2 border-gray-300 bg-white text-gray-600 hover:border-green-300 hover:text-green-500 transition-all"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </button>
                </div>

                {/* Primary Actions */}
                <div className="flex-1 flex space-x-2">
                  {cartQuantity > 0 ? (
                    <div className="flex-1 flex items-center bg-gray-100 rounded-lg">
                      <button
                        onClick={() => onRemoveFromCart?.(product, selectedVariant)}
                        className="p-3 text-gray-600 hover:text-red-500 transition-colors"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <span className="flex-1 text-center font-medium text-gray-900">
                        {cartQuantity}
                      </span>
                      <button
                        onClick={() => onAddToCart?.(product, selectedVariant, 1)}
                        className="p-3 text-gray-600 hover:text-blue-500 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowQuantitySelector(true)}
                      disabled={!isInStock}
                      className={`
                        flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all
                        ${isInStock
                          ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }
                      `}
                    >
                      <ShoppingCart className="w-5 h-5" />
                      <span>{isInStock ? 'Agregar' : 'Agotado'}</span>
                    </button>
                  )}
                  
                  {isInStock && (
                    <button
                      onClick={() => onBuyNow?.(product, selectedVariant, 1)}
                      className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                    >
                      Comprar
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="px-4 pb-2">
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-600">
                <div className="flex items-center space-x-1">
                  <Truck className="w-3 h-3" />
                  <span>Envío gratis</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Shield className="w-3 h-3" />
                  <span>Compra segura</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>Entrega rápida</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quantity Selector Modal */}
      <AnimatePresence>
        {showQuantitySelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end"
            onClick={() => setShowQuantitySelector(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="w-full bg-white rounded-t-2xl p-6 safe-area-pb"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Seleccionar cantidad
                </h3>
                <button
                  onClick={() => setShowQuantitySelector(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Product Info */}
              <div className="flex items-center space-x-3 mb-6 p-3 bg-gray-50 rounded-lg">
                <img
                  src={product.imagen || '/placeholder.jpg'}
                  alt={product.nombre}
                  className="w-12 h-12 object-contain rounded-lg bg-white"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                    {product.nombre}
                  </h4>
                  {selectedVariant && (
                    <p className="text-xs text-gray-600">
                      {selectedVariant.color || selectedVariant.name}
                    </p>
                  )}
                  <p className="text-sm font-medium text-gray-900">
                    {formatPrice(effectivePrice)}
                  </p>
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center justify-center space-x-4 mb-6">
                <button
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:border-blue-500 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Minus className="w-5 h-5" />
                </button>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {quantity}
                  </div>
                  <div className="text-xs text-gray-500">
                    {quantity === 1 ? 'unidad' : 'unidades'}
                  </div>
                </div>
                
                <button
                  onClick={incrementQuantity}
                  className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-all"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Total Price */}
              <div className="text-center mb-6">
                <div className="text-sm text-gray-600 mb-1">Total</div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatPrice(effectivePrice * quantity)}
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-lg font-medium text-lg transition-all shadow-md hover:shadow-lg"
              >
                Agregar al carrito
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Added to Cart Feedback */}
      <AnimatePresence>
        {showAddedFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-4 right-4 z-50 bg-green-500 text-white p-4 rounded-lg shadow-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-medium">¡Agregado al carrito!</div>
                <div className="text-sm opacity-90">
                  {quantity} {quantity === 1 ? 'unidad' : 'unidades'} de {product.nombre}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Safe area padding for devices with home indicator */}
      <style jsx>{`
        .safe-area-pb {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </>
  );
};

export default MobileProductActions;
