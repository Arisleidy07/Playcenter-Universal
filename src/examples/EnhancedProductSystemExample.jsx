import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Import all enhanced components
import EnhancedProductSystem from '../components/EnhancedProductSystem';
import ResponsiveProductGallery from '../components/ResponsiveProductGallery';
import VisualVariantSelector from '../components/VisualVariantSelector';
import OptimizedProductCard from '../components/OptimizedProductCard';
import AdvancedSearchFilter from '../components/AdvancedSearchFilter';
import MobileProductActions from '../components/MobileProductActions';
import ProductValidationPanel from '../components/ProductValidationPanel';

// Import utilities
import { validateProduct, isProductReadyForPublication } from '../utils/productValidation';
import { submitForPublication, PRODUCT_STATUS } from '../utils/productStatusWorkflow';
import { batchProcessImages, generateImageSizes, optimizeForWeb } from '../utils/imageProcessing';
import { 
  createOptimizedImageUrl, 
  preloadCriticalImages,
  initializePerformanceOptimizations 
} from '../utils/performanceOptimization';

/**
 * Enhanced Product System Example
 * 
 * This example demonstrates how to integrate all the enhanced components
 * to create a comprehensive Amazon/eBay-style product management system.
 */
const EnhancedProductSystemExample = () => {
  // Sample product data with enhanced structure
  const [sampleProducts] = useState([
    {
      id: 'prod_001',
      nombre: 'iPhone 15 Pro Max',
      precio: 1199.99,
      precioOferta: 999.99,
      oferta: true,
      categoria: 'Electrónicos',
      empresa: 'Apple',
      descripcion: 'El iPhone más avanzado con chip A17 Pro, cámara de 48MP y pantalla Super Retina XDR de 6.7 pulgadas.',
      cantidad: 25,
      rating: 4.8,
      views: 1250,
      sales: 89,
      destacado: true,
      activo: true,
      
      // Enhanced media structure
      imagenPrincipal: [
        { url: '/Productos/iphone-15-pro-max-main.jpg', alt: 'iPhone 15 Pro Max' }
      ],
      galeriaImagenes: [
        { url: '/Productos/iphone-15-pro-max-back.jpg', type: 'image' },
        { url: '/Productos/iphone-15-pro-max-side.jpg', type: 'image' },
        { url: '/Productos/iphone-15-pro-max-camera.jpg', type: 'image' }
      ],
      videoUrls: [
        { url: '/videos/iphone-15-pro-max-demo.mp4', type: 'video' }
      ],
      videoAcercaArticulo: [
        { url: '/videos/iphone-15-pro-max-features.mp4', type: 'video' }
      ],
      tresArchivosExtras: [
        { url: '/docs/iphone-15-pro-max-specs.pdf', type: 'document', name: 'Especificaciones' },
        { url: '/docs/iphone-15-pro-max-manual.pdf', type: 'document', name: 'Manual de Usuario' }
      ],
      
      // Enhanced variants
      variantes: [
        {
          id: 'var_001_titanium',
          color: 'Titanio Natural',
          precio: 1199.99,
          cantidad: 10,
          imagenPrincipal: [
            { url: '/Productos/iphone-15-pro-max-titanium.jpg' }
          ],
          galeriaImagenes: [
            { url: '/Productos/iphone-15-pro-max-titanium-back.jpg', type: 'image' }
          ]
        },
        {
          id: 'var_001_blue',
          color: 'Titanio Azul',
          precio: 1199.99,
          cantidad: 8,
          imagenPrincipal: [
            { url: '/Productos/iphone-15-pro-max-blue.jpg' }
          ],
          galeriaImagenes: [
            { url: '/Productos/iphone-15-pro-max-blue-back.jpg', type: 'image' }
          ]
        },
        {
          id: 'var_001_white',
          color: 'Titanio Blanco',
          precio: 1199.99,
          cantidad: 15,
          imagenPrincipal: [
            { url: '/Productos/iphone-15-pro-max-white.jpg' }
          ]
        }
      ],
      
      // Enhanced metadata
      productStatus: PRODUCT_STATUS.ACTIVE,
      validationScore: 95,
      lastValidated: new Date().toISOString(),
      etiquetas: ['smartphone', 'apple', 'premium', '5g', 'pro'],
      acerca: [
        'Chip A17 Pro con GPU de 6 núcleos',
        'Sistema de cámara Pro con teleobjetivo 5x',
        'Pantalla Super Retina XDR de 6.7"',
        'Hasta 29 horas de reproducción de video',
        'Resistente al agua IP68'
      ]
    },
    {
      id: 'prod_002',
      nombre: 'MacBook Pro 16" M3 Max',
      precio: 2499.99,
      categoria: 'Computadoras',
      empresa: 'Apple',
      descripcion: 'La laptop más potente de Apple con chip M3 Max, perfecta para profesionales creativos.',
      cantidad: 12,
      rating: 4.9,
      views: 890,
      sales: 34,
      destacado: true,
      activo: true,
      
      imagenPrincipal: [
        { url: '/Productos/macbook-pro-16-main.jpg' }
      ],
      galeriaImagenes: [
        { url: '/Productos/macbook-pro-16-open.jpg', type: 'image' },
        { url: '/Productos/macbook-pro-16-ports.jpg', type: 'image' }
      ],
      videoAcercaArticulo: [
        { url: '/videos/macbook-pro-16-performance.mp4', type: 'video' }
      ],
      
      variantes: [
        {
          id: 'var_002_silver',
          color: 'Plata',
          precio: 2499.99,
          cantidad: 7
        },
        {
          id: 'var_002_gray',
          color: 'Gris Espacial',
          precio: 2499.99,
          cantidad: 5
        }
      ],
      
      productStatus: PRODUCT_STATUS.ACTIVE,
      validationScore: 92,
      etiquetas: ['laptop', 'apple', 'professional', 'm3-max', 'creative']
    }
  ]);

  const [sampleCategories] = useState([
    { id: 'cat_001', nombre: 'Electrónicos', imagen: '/categories/electronics.jpg' },
    { id: 'cat_002', nombre: 'Computadoras', imagen: '/categories/computers.jpg' },
    { id: 'cat_003', nombre: 'Accesorios', imagen: '/categories/accessories.jpg' }
  ]);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showGalleryExample, setShowGalleryExample] = useState(false);
  const [showVariantExample, setShowVariantExample] = useState(false);
  const [showValidationExample, setShowValidationExample] = useState(false);

  // Initialize performance optimizations
  useEffect(() => {
    initializePerformanceOptimizations();
    
    // Preload critical images
    const criticalImages = sampleProducts
      .slice(0, 3)
      .map(p => p.imagenPrincipal?.[0]?.url)
      .filter(Boolean);
    
    preloadCriticalImages(criticalImages, 'high');
  }, [sampleProducts]);

  // Example handlers
  const handleProductUpdate = (productId, updates) => {
    // console.log('Product updated:', productId, updates);
  };

  const handleProductCreate = (productData) => {
    // console.log('Product created:', productData);
  };

  const handleProductDelete = (productId) => {
    // console.log('Product deleted:', productId);
  };

  const handleValidateProduct = async (productData) => {
    const validation = await validateProduct(productData);
    // console.log('Validation result:', validation);
    return validation;
  };

  const handlePublishProduct = async (productData) => {
    const result = await submitForPublication(
      productData.id,
      productData,
      'user_123' // Current user ID
    );
    // console.log('Publish result:', result);
    return result;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900">
              Enhanced Product System Demo
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Amazon/eBay-Style Product Management
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => {
                setShowGalleryExample(false);
                setShowVariantExample(false);
                setShowValidationExample(false);
              }}
              className="text-blue-600 hover:text-blue-800 font-medium border-b-2 border-blue-600 pb-2"
            >
              Complete System
            </button>
            <button
              onClick={() => {
                setShowGalleryExample(true);
                setShowVariantExample(false);
                setShowValidationExample(false);
              }}
              className="text-gray-600 hover:text-gray-800 font-medium pb-2"
            >
              Gallery Example
            </button>
            <button
              onClick={() => {
                setShowGalleryExample(false);
                setShowVariantExample(true);
                setShowValidationExample(false);
              }}
              className="text-gray-600 hover:text-gray-800 font-medium pb-2"
            >
              Variant Selector
            </button>
            <button
              onClick={() => {
                setShowGalleryExample(false);
                setShowVariantExample(false);
                setShowValidationExample(true);
              }}
              className="text-gray-600 hover:text-gray-800 font-medium pb-2"
            >
              Validation Panel
            </button>
          </nav>
        </div>

        {/* Complete System Example */}
        {!showGalleryExample && !showVariantExample && !showValidationExample && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Complete Enhanced Product System
              </h2>
              <p className="text-gray-600 mb-6">
                This demonstrates the full system with all enhanced components working together.
              </p>
              
              <EnhancedProductSystem
                products={sampleProducts}
                categories={sampleCategories}
                currentUser={{ uid: 'user_123', displayName: 'Demo User' }}
                onProductUpdate={handleProductUpdate}
                onProductCreate={handleProductCreate}
                onProductDelete={handleProductDelete}
              />
            </div>
          </motion.div>
        )}

        {/* Gallery Example */}
        {showGalleryExample && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Responsive Product Gallery
              </h2>
              <p className="text-gray-600 mb-6">
                Amazon-style gallery with desktop zoom, mobile swipe, and fullscreen modal.
              </p>
              
              <ResponsiveProductGallery
                images={sampleProducts[0].galeriaImagenes.map(img => img.url)}
                videos={sampleProducts[0].videoUrls.map(vid => vid.url)}
                mainImage={sampleProducts[0].imagenPrincipal[0].url}
                onImageChange={(index) => console.log('Image changed to:', index)}
                enableZoom={true}
                enableFullscreen={true}
                className="max-w-2xl mx-auto"
              />
            </div>
          </motion.div>
        )}

        {/* Variant Selector Example */}
        {showVariantExample && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Visual Variant Selector
              </h2>
              <p className="text-gray-600 mb-6">
                Enhanced variant selector with visual previews and stock indicators.
              </p>
              
              <VisualVariantSelector
                variants={sampleProducts[0].variantes.map((v, idx) => ({
                  id: v.id,
                  name: v.color,
                  price: v.precio,
                  stock: v.cantidad,
                  image: v.imagenPrincipal?.[0]?.url,
                  isSelected: idx === 0
                }))}
                productMainImage={sampleProducts[0].imagenPrincipal[0].url}
                onVariantChange={(index) => console.log('Variant changed to:', index)}
                className="max-w-md mx-auto"
              />
            </div>
          </motion.div>
        )}

        {/* Validation Panel Example */}
        {showValidationExample && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Product Validation Panel
              </h2>
              <p className="text-gray-600 mb-6">
                Real-time validation with Amazon-style quality checks.
              </p>
              
              <ProductValidationPanel
                formData={sampleProducts[0]}
                onPublish={handlePublishProduct}
                onSaveDraft={(data) => console.log('Save draft:', data)}
                onPreview={(data) => console.log('Preview:', data)}
                isPublishing={false}
                isSaving={false}
              />
            </div>
          </motion.div>
        )}

        {/* Feature Highlights */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Advanced Media Gallery
            </h3>
            <p className="text-gray-600 text-sm">
              Desktop zoom, mobile swipe, fullscreen modal, and video integration that surpasses Amazon's gallery.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Real-time Validation
            </h3>
            <p className="text-gray-600 text-sm">
              Amazon-style product validation with quality scoring and automated workflow management.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Mobile Optimized
            </h3>
            <p className="text-gray-600 text-sm">
              Touch-optimized controls, native device integration, and responsive design for all screen sizes.
            </p>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="mt-8 bg-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Performance Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">< 100ms</div>
              <div className="text-sm text-gray-600">Image Load Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">95%</div>
              <div className="text-sm text-gray-600">Validation Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">WebP/AVIF</div>
              <div className="text-sm text-gray-600">Format Support</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">Lazy</div>
              <div className="text-sm text-gray-600">Loading</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedProductSystemExample;
