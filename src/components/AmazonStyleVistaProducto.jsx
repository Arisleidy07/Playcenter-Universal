import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { motion } from "framer-motion";

// Hooks y contextos
import { useProduct } from "../hooks/useProducts";
import useDeviceDetection from "../hooks/useDeviceDetection";

// Componentes
import AmazonStyleGallery from "./AmazonStyleGallery";
import EbayStyleVistaCompleta from "./EbayStyleVistaCompleta";
import ProductInfo from "./ProductInfo";
import ProductDescription from "./ProductDescription";
import EnhancedRelatedProducts from "./EnhancedRelatedProducts";

const AmazonStyleVistaProducto = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDesktop, isTablet, isMobile } = useDeviceDetection();
  
  // Estados
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [vistaCompletaOpen, setVistaCompletaOpen] = useState(false);
  const [vistaCompletaIndex, setVistaCompletaIndex] = useState(0);

  // Cargar producto
  const { product: producto, loading, error } = useProduct(id);

  // Procesar medios del producto
  const getProductMedia = () => {
    if (!producto) return { images: [], videos: [] };

    const currentVariant = selectedVariant || (producto.variantes && producto.variantes[selectedVariantIndex]);
    
    // Obtener imágenes
    let images = [];
    
    // Imagen principal
    if (currentVariant?.imagen) {
      images.push(currentVariant.imagen);
    } else if (producto.imagen) {
      images.push(producto.imagen);
    }
    
    // Imágenes adicionales de la variante o del producto
    const additionalImages = currentVariant?.imagenes || producto.imagenes || [];
    images = [...images, ...additionalImages];
    
    // Imágenes de galería
    const galleryImages = currentVariant?.galeriaImagenes || producto.galeriaImagenes || [];
    const galleryImageUrls = galleryImages
      .filter(item => item && (item.type === 'image' || !item.type))
      .map(item => item.url || item);
    images = [...images, ...galleryImageUrls];
    
    // Filtrar duplicados y URLs válidas
    images = [...new Set(images)].filter(Boolean);

    // Obtener videos
    let videos = [];
    
    // Videos de galería
    const galleryVideos = galleryImages
      .filter(item => item && item.type === 'video')
      .map(item => item.url || item);
    videos = [...videos, ...galleryVideos];
    
    // Video principal
    if (producto.video) {
      videos.push(producto.video);
    }
    
    // Videos adicionales
    const additionalVideos = producto.videos || [];
    videos = [...videos, ...additionalVideos];
    
    // Filtrar duplicados y URLs válidas
    videos = [...new Set(videos)].filter(Boolean);

    return { images, videos };
  };

  const { images, videos } = getProductMedia();

  // Manejar cambio de variante
  const handleVariantChange = (variant, index) => {
    setSelectedVariant(variant);
    setSelectedVariantIndex(index);
    setQuantity(1); // Reset quantity when variant changes
  };

  // Manejar cambio de cantidad
  const handleQuantityChange = (newQuantity) => {
    const maxStock = selectedVariant?.cantidad || producto?.cantidad || 0;
    setQuantity(Math.min(Math.max(1, newQuantity), maxStock));
  };

  // Manejar clic en imagen para vista completa
  const handleImageClick = (index, allImages) => {
    setVistaCompletaIndex(index);
    setVistaCompletaOpen(true);
  };

  // Manejar clic en video
  const handleVideoClick = (index, videoUrl) => {
    // Aquí podrías abrir un modal de video o reproducir el video
    console.log('Video clicked:', videoUrl);
  };

  // Manejar botón atrás
  const handleGoBack = () => {
    if (window.history && window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/productos");
    }
  };

  // Estados de carga y error
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-700 p-4">
        <div className="text-center max-w-md">
          <div className="mb-4">
            <svg
              className="mx-auto h-16 w-16 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Producto no encontrado</h2>
          <p className="text-gray-600 mb-4">
            El producto que buscas no existe o ha sido eliminado.
          </p>
          <button
            onClick={handleGoBack}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <FaArrowLeft className="w-4 h-4" />
            Volver
          </button>
        </div>
      </div>
    );
  }

  // Layout para Desktop
  if (isDesktop) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-white"
      >
        {/* Botón volver */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4" />
            Volver a productos
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-12 gap-8">
            {/* Columna izquierda: Galería */}
            <div className="col-span-7">
              <AmazonStyleGallery
                images={images}
                videos={videos}
                onImageClick={handleImageClick}
                onVideoClick={handleVideoClick}
              />
            </div>

            {/* Columna derecha: Información del producto */}
            <div className="col-span-5">
              <ProductInfo
                producto={producto}
                selectedVariant={selectedVariant}
                onVariantChange={handleVariantChange}
                quantity={quantity}
                onQuantityChange={handleQuantityChange}
              />
            </div>
          </div>

          {/* Descripción completa y especificaciones */}
          <div className="mt-12">
            <ProductDescription producto={producto} />
          </div>

          {/* Productos relacionados */}
          <div className="mt-12">
            <EnhancedRelatedProducts 
              productoActual={producto}
              className="bg-gray-50 -mx-6 px-6 py-8"
            />
          </div>
        </div>

        {/* Vista completa */}
        <EbayStyleVistaCompleta
          isOpen={vistaCompletaOpen}
          onClose={() => setVistaCompletaOpen(false)}
          images={images}
          videos={videos}
          initialIndex={vistaCompletaIndex}
          productName={producto.nombre}
        />
      </motion.div>
    );
  }

  // Layout para Tablet
  if (isTablet) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-white"
      >
        {/* Botón volver */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4" />
            Volver
          </button>
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* Imagen principal arriba */}
          <AmazonStyleGallery
            images={images}
            videos={videos}
            onImageClick={handleImageClick}
            onVideoClick={handleVideoClick}
          />

          {/* Información del producto */}
          <ProductInfo
            producto={producto}
            selectedVariant={selectedVariant}
            onVariantChange={handleVariantChange}
            quantity={quantity}
            onQuantityChange={handleQuantityChange}
          />

          {/* Descripción en pestañas */}
          <ProductDescription producto={producto} />

          {/* Productos relacionados */}
          <EnhancedRelatedProducts 
            productoActual={producto}
            className="bg-gray-50 -mx-4 px-4 py-6"
          />
        </div>

        {/* Vista completa */}
        <EbayStyleVistaCompleta
          isOpen={vistaCompletaOpen}
          onClose={() => setVistaCompletaOpen(false)}
          images={images}
          videos={videos}
          initialIndex={vistaCompletaIndex}
          productName={producto.nombre}
        />
      </motion.div>
    );
  }

  // Layout para Móvil
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-white"
    >
      {/* Botón volver */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
        >
          <FaArrowLeft className="w-4 h-4" />
          Volver
        </button>
      </div>

      <div className="space-y-4">
        {/* Imagen principal arriba */}
        <AmazonStyleGallery
          images={images}
          videos={videos}
          onImageClick={handleImageClick}
          onVideoClick={handleVideoClick}
        />

        {/* Información del producto */}
        <div className="px-4">
          <ProductInfo
            producto={producto}
            selectedVariant={selectedVariant}
            onVariantChange={handleVariantChange}
            quantity={quantity}
            onQuantityChange={handleQuantityChange}
          />
        </div>

        {/* Descripción y especificaciones */}
        <ProductDescription producto={producto} />

        {/* Productos relacionados */}
        <EnhancedRelatedProducts 
          productoActual={producto}
          className="bg-gray-50 py-6"
        />

        {/* Espacio para botones móviles fijos si los hay */}
        <div className="h-20"></div>
      </div>

      {/* Vista completa */}
      <EbayStyleVistaCompleta
        isOpen={vistaCompletaOpen}
        onClose={() => setVistaCompletaOpen(false)}
        images={images}
        videos={videos}
        initialIndex={vistaCompletaIndex}
        productName={producto.nombre}
      />
    </motion.div>
  );
};

export default AmazonStyleVistaProducto;
