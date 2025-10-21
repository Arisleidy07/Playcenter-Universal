import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaChevronLeft, FaChevronRight, FaChevronDown, FaChevronUp, FaPlay, FaSearchPlus } from 'react-icons/fa';

/**
 * ProductGallery - Galería estilo Amazon con especificaciones exactas
 * 
 * @param {Array} items - Array de objetos {url, type: 'image'|'video', poster}
 * @param {string} productId - ID del producto para telemetría
 * @param {Function} onThumbClick - Callback cuando se hace click en miniatura
 * @param {Function} onLightboxOpen - Callback cuando se abre lightbox
 * @param {Function} onVideoPlay - Callback cuando se reproduce video
 */
const ProductGallery = ({ 
  items = [], 
  productId,
  onThumbClick,
  onLightboxOpen,
  onVideoPlay
}) => {
  const [heroIndex, setHeroIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const [lightboxPan, setLightboxPan] = useState({ x: 0, y: 0 });
  
  const heroRef = useRef(null);
  const videoRefs = useRef({});
  const touchStartRef = useRef({ x: 0, y: 0 });
  const lastZoomRef = useRef(1);
  const lastDistanceRef = useRef(0);
  
  const currentItem = items[heroIndex] || items[0];
  const isVideo = currentItem?.type === 'video';
  
  // Emitir evento de telemetría
  const emitEvent = useCallback((eventName, data = {}) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, {
        product_id: productId,
        ...data
      });
    }
    console.log(`[Gallery Event] ${eventName}`, { productId, ...data });
  }, [productId]);
  
  // Emitir gallery_view cuando la galería entra en viewport
  useEffect(() => {
    if (typeof window === 'undefined' || !heroRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            emitEvent('gallery_view');
            observer.disconnect();
          }
        });
      },
      { threshold: 0.5 }
    );
    
    observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, [emitEvent]);
  
  // Prefetch de imagen al hover/click
  const prefetchImage = useCallback((url) => {
    if (!url) return;
    const img = new Image();
    img.src = url;
  }, []);
  
  // Handle thumb click con prefetch y telemetría
  const handleThumbClick = useCallback((index) => {
    const item = items[index];
    if (!item) return;
    
    // Prefetch de la versión large
    if (item.type === 'image') {
      prefetchImage(item.url);
    }
    
    // Swap del hero
    setHeroIndex(index);
    
    // Telemetría
    emitEvent('gallery_thumb_click', {
      idx: index,
      type: item.type,
      timestamp: Date.now()
    });
    
    // Callback externo
    if (onThumbClick) {
      onThumbClick(index, item);
    }
  }, [items, emitEvent, prefetchImage, onThumbClick]);
  
  // Toggle expand/collapse
  const handleToggle = useCallback(() => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    
    emitEvent('gallery_toggle', {
      expanded: newExpanded
    });
  }, [isExpanded, emitEvent]);
  
  // Abrir lightbox
  const openLightbox = useCallback((index = heroIndex) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
    setLightboxZoom(1);
    setLightboxPan({ x: 0, y: 0 });
    
    emitEvent('gallery_lightbox_open', {
      idx: index
    });
    
    if (onLightboxOpen) {
      onLightboxOpen(index);
    }
  }, [heroIndex, emitEvent, onLightboxOpen]);
  
  // Cerrar lightbox
  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
    setLightboxZoom(1);
    setLightboxPan({ x: 0, y: 0 });
  }, []);
  
  // Navegación en lightbox
  const lightboxPrev = useCallback(() => {
    setLightboxIndex(prev => (prev > 0 ? prev - 1 : items.length - 1));
    setLightboxZoom(1);
    setLightboxPan({ x: 0, y: 0 });
  }, [items.length]);
  
  const lightboxNext = useCallback(() => {
    setLightboxIndex(prev => (prev < items.length - 1 ? prev + 1 : 0));
    setLightboxZoom(1);
    setLightboxPan({ x: 0, y: 0 });
  }, [items.length]);
  
  // Zoom en hero (desktop only)
  const handleHeroMouseEnter = useCallback(() => {
    if (window.innerWidth < 640 || isVideo) return;
    setIsZooming(true);
  }, [isVideo]);
  
  const handleHeroMouseMove = useCallback((e) => {
    if (!isZooming || window.innerWidth < 640) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setZoomPosition({ x, y });
  }, [isZooming]);
  
  const handleHeroMouseLeave = useCallback(() => {
    setIsZooming(false);
  }, []);
  
  // Video play con telemetría
  const handleVideoPlay = useCallback((videoId) => {
    emitEvent('gallery_video_play', {
      videoId
    });
    
    if (onVideoPlay) {
      onVideoPlay(videoId);
    }
  }, [emitEvent, onVideoPlay]);
  
  // Keyboard navigation
  useEffect(() => {
    if (!isLightboxOpen) return;
    
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          lightboxPrev();
          break;
        case 'ArrowRight':
          lightboxNext();
          break;
        case 'Escape':
          closeLightbox();
          break;
        case '+':
        case '=':
          setLightboxZoom(z => Math.min(z + 0.5, 4));
          break;
        case '-':
          setLightboxZoom(z => Math.max(z - 0.5, 1));
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, lightboxPrev, lightboxNext, closeLightbox]);
  
  // Touch/swipe en lightbox
  const handleLightboxTouchStart = useCallback((e) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    } else if (e.touches.length === 2) {
      const dx = e.touches[1].clientX - e.touches[0].clientX;
      const dy = e.touches[1].clientY - e.touches[0].clientY;
      lastDistanceRef.current = Math.sqrt(dx * dx + dy * dy);
      lastZoomRef.current = lightboxZoom;
    }
  }, [lightboxZoom]);
  
  const handleLightboxTouchMove = useCallback((e) => {
    if (e.touches.length === 2 && lightboxZoom >= 1) {
      // Pinch zoom
      const dx = e.touches[1].clientX - e.touches[0].clientX;
      const dy = e.touches[1].clientY - e.touches[0].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      const scale = distance / lastDistanceRef.current;
      const newZoom = Math.min(Math.max(lastZoomRef.current * scale, 1), 4);
      setLightboxZoom(newZoom);
    }
  }, [lightboxZoom]);
  
  const handleLightboxTouchEnd = useCallback((e) => {
    if (e.changedTouches.length === 1 && lightboxZoom === 1) {
      const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
      
      if (Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          lightboxPrev();
        } else {
          lightboxNext();
        }
      }
    }
  }, [lightboxZoom, lightboxPrev, lightboxNext]);
  
  // Calcular miniaturas visibles
  const visibleThumbs = isExpanded ? 8 : 4;
  const showToggle = items.length > 4;
  
  // Renderizar miniatura
  const renderThumb = (item, index) => {
    const isActive = index === heroIndex;
    const isVideoThumb = item?.type === 'video';
    
    return (
      <button
        key={`thumb-${index}`}
        type="button"
        onClick={() => handleThumbClick(index)}
        onMouseEnter={() => prefetchImage(item?.url)}
        onFocus={() => prefetchImage(item?.url)}
        aria-pressed={isActive}
        aria-label={`${isVideoThumb ? 'Video' : 'Imagen'} ${index + 1} de ${items.length}`}
        className={`
          gallery-thumb relative flex-shrink-0 overflow-hidden
          transition-all duration-200 cursor-pointer
          ${isActive ? 'ring-3 ring-[#007185] border-[#007185]' : 'border-gray-300 hover:border-[#007185]/50'}
          border-2 rounded
        `}
        style={{
          width: window.innerWidth >= 1024 ? '120px' : window.innerWidth >= 640 ? '100px' : '80px',
          height: window.innerWidth >= 1024 ? '120px' : window.innerWidth >= 640 ? '100px' : '80px',
        }}
      >
        {isVideoThumb ? (
          <>
            <video
              src={item.url}
              poster={item.poster}
              className="w-full h-full object-cover"
              preload="metadata"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                <FaPlay className="text-[#007185] text-sm ml-0.5" />
              </div>
            </div>
          </>
        ) : (
          <img
            src={item?.url}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '/placeholder.png';
              emitEvent('gallery_error', { idx: index, type: 'image_load_error' });
            }}
          />
        )}
      </button>
    );
  };
  
  if (!items || items.length === 0) {
    return (
      <div className="w-full aspect-square bg-gray-100 flex items-center justify-center rounded-lg">
        <p className="text-gray-400">No hay imágenes disponibles</p>
      </div>
    );
  }
  
  return (
    <>
      {/* Layout responsivo de galería */}
      <div className="product-gallery w-full">
        {/* Desktop/Tablet: Miniaturas verticales a la izquierda */}
        <div className="hidden sm:flex gap-4">
          {/* Columna de miniaturas verticales */}
          <div className="flex flex-col gap-2 items-center">
            <div className="flex flex-col gap-2 overflow-hidden">
              {items.slice(0, visibleThumbs).map((item, index) => renderThumb(item, index))}
            </div>
            
            {showToggle && (
              <button
                type="button"
                onClick={handleToggle}
                aria-expanded={isExpanded}
                aria-label={isExpanded ? 'Mostrar menos miniaturas' : 'Mostrar más miniaturas'}
                className="flex items-center justify-center w-full py-2 text-[#007185] hover:text-[#005a6f] transition-colors"
              >
                {isExpanded ? (
                  <>
                    <FaChevronUp className="mr-1" />
                    <span className="text-sm">Menos</span>
                  </>
                ) : (
                  <>
                    <FaChevronDown className="mr-1" />
                    <span className="text-sm">+{items.length - 4} más</span>
                  </>
                )}
              </button>
            )}
          </div>
          
          {/* Hero - Imagen/Video principal */}
          <div className="flex-1 relative">
            <div
              ref={heroRef}
              className="hero-container relative w-full aspect-square bg-white rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => !isVideo && openLightbox(heroIndex)}
              onMouseEnter={handleHeroMouseEnter}
              onMouseMove={handleHeroMouseMove}
              onMouseLeave={handleHeroMouseLeave}
            >
              {isVideo ? (
                <div className="relative w-full h-full">
                  <video
                    ref={(el) => videoRefs.current[heroIndex] = el}
                    src={currentItem.url}
                    poster={currentItem.poster}
                    controls
                    preload="metadata"
                    className="w-full h-full object-contain"
                    onPlay={() => handleVideoPlay(currentItem.url)}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openLightbox(heroIndex);
                    }}
                    className="absolute top-4 right-4 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                    aria-label="Abrir en vista completa"
                  >
                    <FaSearchPlus className="text-[#007185]" />
                  </button>
                </div>
              ) : (
                <>
                  <img
                    src={currentItem?.url}
                    alt={`Vista del producto ${heroIndex + 1}`}
                    className="w-full h-full object-contain"
                    sizes="(min-width: 1024px) 500px, (min-width: 640px) 400px, 300px"
                    srcSet={`${currentItem?.url}?w=400 400w, ${currentItem?.url}?w=800 800w, ${currentItem?.url}?w=1600 1600w`}
                  />
                  
                  {/* Magnifier overlay (desktop only) */}
                  {isZooming && window.innerWidth >= 640 && (
                    <div
                      className="absolute inset-0 hidden sm:block pointer-events-none"
                      style={{
                        backgroundImage: `url(${currentItem?.url})`,
                        backgroundSize: '250%',
                        backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                        backgroundRepeat: 'no-repeat',
                      }}
                    />
                  )}
                  
                  {/* Icono de zoom */}
                  <div className="absolute bottom-4 right-4 bg-white/90 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <FaSearchPlus className="text-[#007185]" />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Móvil: Hero arriba, miniaturas horizontales debajo */}
        <div className="sm:hidden flex flex-col gap-3">
          {/* Hero móvil */}
          <div
            ref={heroRef}
            className="hero-container relative w-full aspect-square bg-white rounded-lg overflow-hidden"
            onClick={() => !isVideo && openLightbox(heroIndex)}
          >
            {isVideo ? (
              <video
                ref={(el) => videoRefs.current[heroIndex] = el}
                src={currentItem.url}
                poster={currentItem.poster}
                controls
                preload="metadata"
                className="w-full h-full object-contain"
                onPlay={() => handleVideoPlay(currentItem.url)}
              />
            ) : (
              <img
                src={currentItem?.url}
                alt={`Vista del producto ${heroIndex + 1}`}
                className="w-full h-full object-contain"
              />
            )}
          </div>
          
          {/* Miniaturas horizontales con scroll snap */}
          <div
            className="flex gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {items.map((item, index) => (
              <div key={`mobile-thumb-${index}`} className="snap-start">
                {renderThumb(item, index)}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Lightbox/Vista Completa */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-[9999] flex flex-col"
            onTouchStart={handleLightboxTouchStart}
            onTouchMove={handleLightboxTouchMove}
            onTouchEnd={handleLightboxTouchEnd}
          >
            {/* Header con cerrar */}
            <div className="flex items-center justify-between p-4 border-b">
              <span className="text-sm text-gray-600">
                {lightboxIndex + 1} de {items.length}
              </span>
              <button
                type="button"
                onClick={closeLightbox}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Cerrar vista completa"
              >
                <FaTimes className="text-gray-600" size={20} />
              </button>
            </div>
            
            {/* Contenedor principal */}
            <div className="flex-1 flex items-center justify-center relative overflow-hidden">
              {/* Imagen/Video principal */}
              <div 
                className="relative max-w-full max-h-full"
                style={{
                  transform: `scale(${lightboxZoom}) translate(${lightboxPan.x}px, ${lightboxPan.y}px)`,
                  transition: lightboxZoom === 1 ? 'transform 0.3s ease' : 'none'
                }}
              >
                {items[lightboxIndex]?.type === 'video' ? (
                  <video
                    src={items[lightboxIndex].url}
                    poster={items[lightboxIndex].poster}
                    controls
                    autoPlay={false}
                    className="max-w-full max-h-[80vh] object-contain"
                    onPlay={() => handleVideoPlay(items[lightboxIndex].url)}
                  />
                ) : (
                  <img
                    src={items[lightboxIndex]?.url}
                    alt={`Vista ${lightboxIndex + 1}`}
                    className="max-w-full max-h-[80vh] object-contain"
                  />
                )}
              </div>
              
              {/* Flechas de navegación (pegadas al hero, no a los extremos) */}
              <button
                type="button"
                onClick={lightboxPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-colors"
                aria-label="Imagen anterior"
              >
                <FaChevronLeft className="text-[#007185]" size={20} />
              </button>
              
              <button
                type="button"
                onClick={lightboxNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-colors"
                aria-label="Imagen siguiente"
              >
                <FaChevronRight className="text-[#007185]" size={20} />
              </button>
            </div>
            
            {/* Miniaturas inferiores */}
            <div className="p-4 border-t bg-white">
              <div className="flex gap-2 overflow-x-auto justify-center scrollbar-hide">
                {items.map((item, index) => (
                  <button
                    key={`lightbox-thumb-${index}`}
                    type="button"
                    onClick={() => {
                      setLightboxIndex(index);
                      setLightboxZoom(1);
                      setLightboxPan({ x: 0, y: 0 });
                    }}
                    className={`
                      flex-shrink-0 w-16 h-16 rounded overflow-hidden
                      border-2 transition-all
                      ${index === lightboxIndex ? 'ring-2 ring-[#007185] border-[#007185]' : 'border-gray-300 hover:border-[#007185]/50'}
                    `}
                  >
                    {item?.type === 'video' ? (
                      <video
                        src={item.url}
                        poster={item.poster}
                        className="w-full h-full object-cover"
                        preload="metadata"
                      />
                    ) : (
                      <img
                        src={item?.url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Estilos */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .ring-3 {
          --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
          --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(3px + var(--tw-ring-offset-width)) var(--tw-ring-color);
          box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
        }
      `}</style>
    </>
  );
};

export default ProductGallery;
