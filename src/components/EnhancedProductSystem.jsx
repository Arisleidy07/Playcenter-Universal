import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Star,
  Heart,
  ShoppingCart,
  Eye,
  Zap,
  TrendingUp,
  Award,
  Clock
} from 'lucide-react';

// Import our enhanced components
import ResponsiveProductGallery from './ResponsiveProductGallery';
import VisualVariantSelector from './VisualVariantSelector';
import OptimizedProductCard from './OptimizedProductCard';
import AdvancedSearchFilter from './AdvancedSearchFilter';
import MobileProductActions from './MobileProductActions';
import ProductValidationPanel from './ProductValidationPanel';

// Import utilities
import { validateProduct, isProductReadyForPublication } from '../utils/productValidation';
import { submitForPublication, PRODUCT_STATUS } from '../utils/productStatusWorkflow';
import { createOptimizedImageUrl, lazyLoadManager } from '../utils/performanceOptimization';

const EnhancedProductSystem = ({
  products = [],
  categories = [],
  currentUser = null,
  onProductUpdate,
  onProductCreate,
  onProductDelete,
  className = ''
}) => {
  // State management
  const [viewMode, setViewMode] = useState('grid');
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Performance metrics
  const [performanceMetrics, setPerformanceMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    imageLoadTime: 0
  });

  // Initialize performance monitoring
  useEffect(() => {
    const startTime = performance.now();
    
    const handleLoad = () => {
      const loadTime = performance.now() - startTime;
      setPerformanceMetrics(prev => ({ ...prev, loadTime }));
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  // Memoized product statistics
  const productStats = useMemo(() => {
    const stats = {
      total: products.length,
      active: 0,
      draft: 0,
      outOfStock: 0,
      onSale: 0,
      avgRating: 0,
      totalValue: 0
    };

    let totalRating = 0;
    let ratedProducts = 0;

    products.forEach(product => {
      // Status counts
      if (product.activo !== false) stats.active++;
      if (product.estado === PRODUCT_STATUS.DRAFT) stats.draft++;
      if ((product.cantidad || 0) <= 0) stats.outOfStock++;
      if (product.oferta && product.precioOferta) stats.onSale++;

      // Rating calculation
      const rating = parseFloat(product.rating || product.calificacion || 0);
      if (rating > 0) {
        totalRating += rating;
        ratedProducts++;
      }

      // Total value
      const price = parseFloat(product.precio || 0);
      const quantity = parseInt(product.cantidad || 0);
      stats.totalValue += price * quantity;
    });

    stats.avgRating = ratedProducts > 0 ? totalRating / ratedProducts : 0;

    return stats;
  }, [products]);

  // Handle product actions
  const handleAddToCart = (product, variant = null, quantity = 1) => {
    const cartItem = {
      id: `${product.id}_${variant?.id || 'default'}`,
      productId: product.id,
      product,
      variant,
      quantity,
      addedAt: Date.now()
    };

    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.id === cartItem.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, cartItem];
    });

    // Show success feedback
    console.log('Added to cart:', cartItem);
  };

  const handleToggleFavorite = (product) => {
    setFavorites(prev => {
      const updated = new Set(prev);
      if (updated.has(product.id)) {
        updated.delete(product.id);
      } else {
        updated.add(product.id);
      }
      return updated;
    });
  };

  const handleQuickView = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleProductPublish = async (productData) => {
    setLoading(true);
    try {
      const result = await submitForPublication(
        productData.id,
        productData,
        currentUser?.uid
      );
      
      if (result.success) {
        onProductUpdate?.(productData.id, { 
          ...productData, 
          estado: result.status 
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error publishing product:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Get trending products
  const trendingProducts = useMemo(() => {
    return products
      .filter(p => p.activo !== false)
      .sort((a, b) => {
        const aScore = (parseFloat(a.rating || 0) * 0.4) + 
                      (parseInt(a.views || 0) * 0.3) + 
                      (parseInt(a.sales || 0) * 0.3);
        const bScore = (parseFloat(b.rating || 0) * 0.4) + 
                      (parseInt(b.views || 0) * 0.3) + 
                      (parseInt(b.sales || 0) * 0.3);
        return bScore - aScore;
      })
      .slice(0, 6);
  }, [products]);

  // Get featured products
  const featuredProducts = useMemo(() => {
    return products
      .filter(p => p.destacado && p.activo !== false)
      .slice(0, 4);
  }, [products]);

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Productos
              </h1>
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                <span>{productStats.total} productos</span>
                <span>•</span>
                <span>{productStats.active} activos</span>
                {productStats.avgRating > 0 && (
                  <>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span>{productStats.avgRating.toFixed(1)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Cart Summary */}
              <div className="relative">
                <button className="p-2 text-gray-600 hover:text-gray-900 relative">
                  <ShoppingCart className="w-6 h-6" />
                  {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Productos</p>
                <p className="text-2xl font-bold text-gray-900">{productStats.total}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Grid className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En Oferta</p>
                <p className="text-2xl font-bold text-green-600">{productStats.onSale}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Calificación</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {productStats.avgRating.toFixed(1)}
                </p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sin Stock</p>
                <p className="text-2xl font-bold text-red-600">{productStats.outOfStock}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Featured Products Section */}
        {featuredProducts.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <Award className="w-5 h-5 text-yellow-500" />
                <span>Productos Destacados</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <OptimizedProductCard
                  key={product.id}
                  product={product}
                  layout="grid"
                  onAddToCart={handleAddToCart}
                  onToggleFavorite={handleToggleFavorite}
                  onQuickView={handleQuickView}
                  className="transform hover:scale-105 transition-transform"
                />
              ))}
            </div>
          </div>
        )}

        {/* Trending Products Section */}
        {trendingProducts.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span>Tendencias</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {trendingProducts.map(product => (
                <OptimizedProductCard
                  key={product.id}
                  product={product}
                  layout="compact"
                  showQuickActions={false}
                  onAddToCart={handleAddToCart}
                  onToggleFavorite={handleToggleFavorite}
                  onQuickView={handleQuickView}
                />
              ))}
            </div>
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="mb-6">
          <AdvancedSearchFilter
            products={products}
            categories={categories}
            onFilteredResults={setFilteredProducts}
            onSearchChange={setSearchTerm}
          />
        </div>

        {/* Products Grid/List */}
        <div className="mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-4'
              }
            >
              {filteredProducts.map(product => (
                <OptimizedProductCard
                  key={product.id}
                  product={product}
                  layout={viewMode === 'grid' ? 'grid' : 'horizontal'}
                  onAddToCart={handleAddToCart}
                  onToggleFavorite={handleToggleFavorite}
                  onQuickView={handleQuickView}
                  className="animate-fade-in"
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron productos
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? `No hay productos que coincidan con "${searchTerm}"`
                  : 'Ajusta los filtros para ver más productos'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Product Quick View Modal */}
      <AnimatePresence>
        {showProductModal && selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowProductModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex h-full">
                {/* Product Gallery */}
                <div className="flex-1 p-6">
                  <ResponsiveProductGallery
                    images={selectedProduct.imagenes || []}
                    videos={selectedProduct.videoUrls || []}
                    mainImage={selectedProduct.imagen}
                    enableZoom={false}
                    className="h-96"
                  />
                </div>

                {/* Product Info */}
                <div className="w-96 p-6 border-l border-gray-200 overflow-y-auto">
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedProduct.nombre}
                    </h2>
                    <p className="text-gray-600 text-sm mb-4">
                      {selectedProduct.empresa}
                    </p>
                    
                    {/* Price */}
                    <div className="mb-4">
                      {selectedProduct.oferta && selectedProduct.precioOferta ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold text-red-600">
                            ${parseFloat(selectedProduct.precioOferta).toLocaleString()}
                          </span>
                          <span className="text-lg text-gray-500 line-through">
                            ${parseFloat(selectedProduct.precio).toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-2xl font-bold text-gray-900">
                          ${parseFloat(selectedProduct.precio || 0).toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Variants */}
                    {selectedProduct.variantes && selectedProduct.variantes.length > 0 && (
                      <div className="mb-6">
                        <VisualVariantSelector
                          variants={selectedProduct.variantes}
                          productMainImage={selectedProduct.imagen}
                          onVariantChange={(index) => {
                            console.log('Variant changed:', index);
                          }}
                        />
                      </div>
                    )}

                    {/* Description */}
                    <div className="mb-6">
                      <h3 className="font-medium text-gray-900 mb-2">Descripción</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {selectedProduct.descripcion || 'Sin descripción disponible.'}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          handleAddToCart(selectedProduct);
                          setShowProductModal(false);
                        }}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition-colors"
                      >
                        Agregar al Carrito
                      </button>
                      
                      <button
                        onClick={() => handleToggleFavorite(selectedProduct)}
                        className={`w-full border-2 py-3 rounded-lg font-medium transition-colors ${
                          favorites.has(selectedProduct.id)
                            ? 'border-red-500 text-red-500 bg-red-50'
                            : 'border-gray-300 text-gray-700 hover:border-red-300 hover:text-red-500'
                        }`}
                      >
                        <Heart className={`w-5 h-5 inline mr-2 ${
                          favorites.has(selectedProduct.id) ? 'fill-current' : ''
                        }`} />
                        {favorites.has(selectedProduct.id) ? 'En Favoritos' : 'Agregar a Favoritos'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Actions for selected product */}
      {selectedProduct && (
        <div className="sm:hidden">
          <MobileProductActions
            product={selectedProduct}
            cartQuantity={cart.find(item => item.productId === selectedProduct.id)?.quantity || 0}
            isFavorite={favorites.has(selectedProduct.id)}
            isInStock={(selectedProduct.cantidad || 0) > 0}
            onAddToCart={handleAddToCart}
            onToggleFavorite={handleToggleFavorite}
            onShare={(product) => {
              if (navigator.share) {
                navigator.share({
                  title: product.nombre,
                  url: window.location.href
                });
              }
            }}
          />
        </div>
      )}

      {/* Performance Debug Info (Development only) */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-2 rounded">
          <div>Load: {performanceMetrics.loadTime.toFixed(2)}ms</div>
          <div>Products: {filteredProducts.length}</div>
          <div>Cart: {cart.length} items</div>
        </div>
      )}
    </div>
  );
};

export default EnhancedProductSystem;
