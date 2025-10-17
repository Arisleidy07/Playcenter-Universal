import React, { useState, useRef, useEffect } from "react";
import { FaTimes, FaChevronLeft, FaChevronRight, FaPlay } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import useDeviceDetection from "../hooks/useDeviceDetection";

const EbayStyleVistaCompleta = ({ 
  isOpen, 
  onClose, 
  images = [], 
  videos = [], 
  initialIndex = 0,
  productName = ""
}) => {
  const { isDesktop, isTablet, isMobile } = useDeviceDetection();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  
  const mainMediaRef = useRef(null);
  const containerRef = useRef(null);

  // Combinar todos los medios
  const allMedia = [
    ...images.map(img => ({ type: 'image', url: img })),
    ...videos.map(video => ({ type: 'video', url: video }))
  ];

  // Touch handling para móvil
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Reset zoom cuando cambia la imagen
  useEffect(() => {
    setZoomLevel(1);
    setZoomPosition({ x: 0, y: 0 });
    setIsZooming(false);
  }, [currentIndex]);

  // Navegación con teclado
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          navigatePrevious();
          break;
        case 'ArrowRight':
          navigateNext();
          break;
        case '+':
        case '=':
          if (isDesktop) handleZoomIn();
          break;
        case '-':
          if (isDesktop) handleZoomOut();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex]);

  // Navegación
  const navigatePrevious = () => {
    setCurrentIndex(prev => prev === 0 ? allMedia.length - 1 : prev - 1);
  };

  const navigateNext = () => {
    setCurrentIndex(prev => prev === allMedia.length - 1 ? 0 : prev + 1);
  };

  // Zoom functions
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 1));
  };

  // Mouse zoom en desktop
  const handleMouseMove = (e) => {
    if (!isDesktop || !isZooming || !mainMediaRef.current) return;

    const rect = mainMediaRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setZoomPosition({ x, y });
  };

  const handleDoubleClick = () => {
    if (allMedia[currentIndex]?.type === 'image') {
      if (zoomLevel === 1) {
        setZoomLevel(2);
        setIsZooming(true);
      } else {
        setZoomLevel(1);
        setIsZooming(false);
      }
    }
  };

  // Touch handling
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      navigateNext();
    }
    if (isRightSwipe) {
      navigatePrevious();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/95 z-[9999] flex flex-col"
        onClick={onClose}
      >
        {/* Header con título y botón cerrar */}
        <div className="flex items-center justify-between p-4 text-white">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-medium truncate">{productName}</h2>
            <span className="text-sm text-gray-300">
              {currentIndex + 1} de {allMedia.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Cerrar"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 flex" onClick={(e) => e.stopPropagation()}>
          {/* Desktop: Miniaturas a la izquierda */}
          {isDesktop && allMedia.length > 1 && (
            <div className="w-24 p-4 overflow-y-auto">
              <div className="space-y-2">
                {allMedia.map((media, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentIndex 
                        ? 'border-white' 
                        : 'border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    {media.type === 'video' ? (
                      <div className="relative w-full h-full">
                        <video 
                          src={media.url} 
                          className="w-full h-full object-cover"
                          muted
                          preload="metadata"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <FaPlay className="text-white text-xs" />
                        </div>
                      </div>
                    ) : (
                      <img 
                        src={media.url} 
                        alt={`Miniatura ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Área principal del media */}
          <div className="flex-1 flex items-center justify-center relative p-4">
            {/* Flechas de navegación - Solo desktop */}
            {isDesktop && allMedia.length > 1 && (
              <>
                <button
                  onClick={navigatePrevious}
                  className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors z-10"
                  aria-label="Anterior"
                >
                  <FaChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={navigateNext}
                  className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors z-10"
                  aria-label="Siguiente"
                >
                  <FaChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Media principal */}
            <div 
              className="max-w-full max-h-full flex items-center justify-center"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {allMedia[currentIndex]?.type === 'video' ? (
                <video
                  src={allMedia[currentIndex].url}
                  className="max-w-full max-h-full object-contain"
                  controls
                  autoPlay
                  preload="metadata"
                />
              ) : (
                <img
                  ref={mainMediaRef}
                  src={allMedia[currentIndex]?.url}
                  alt={`${productName} - Imagen ${currentIndex + 1}`}
                  className="max-w-full max-h-full object-contain cursor-zoom-in select-none"
                  style={{
                    transform: `scale(${zoomLevel}) translate(${zoomPosition.x}px, ${zoomPosition.y}px)`,
                    transition: zoomLevel === 1 ? 'transform 0.3s ease' : 'none'
                  }}
                  onMouseMove={handleMouseMove}
                  onDoubleClick={handleDoubleClick}
                  draggable={false}
                />
              )}
            </div>
          </div>
        </div>

        {/* Miniaturas inferiores - Tablet y Móvil */}
        {(isTablet || isMobile) && allMedia.length > 1 && (
          <div className="p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex gap-2 overflow-x-auto pb-2 justify-center" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
              {allMedia.map((media, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`relative flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentIndex 
                      ? 'border-white' 
                      : 'border-gray-600'
                  }`}
                >
                  {media.type === 'video' ? (
                    <div className="relative w-full h-full">
                      <video 
                        src={media.url} 
                        className="w-full h-full object-cover"
                        muted
                        preload="metadata"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <FaPlay className="text-white text-xs" />
                      </div>
                    </div>
                  ) : (
                    <img 
                      src={media.url} 
                      alt={`Miniatura ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Controles de zoom - Solo desktop */}
        {isDesktop && allMedia[currentIndex]?.type === 'image' && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black/50 rounded-full p-2">
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= 1}
              className="text-white p-2 hover:bg-white/10 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
              title="Alejar"
            >
              -
            </button>
            <span className="text-white px-3 py-2 text-sm">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3}
              className="text-white p-2 hover:bg-white/10 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
              title="Acercar"
            >
              +
            </button>
          </div>
        )}

        {/* Indicador de swipe para móvil */}
        {isMobile && allMedia.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/70 text-sm">
            Desliza para navegar
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default EbayStyleVistaCompleta;
