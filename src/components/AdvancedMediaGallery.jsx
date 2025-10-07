import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaPlay,
  FaPause,
  FaExpand,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaImage,
  FaVideo,
  FaVolumeUp,
  FaVolumeMute,
  FaDownload,
  FaShare,
  FaHeart,
  FaSearchPlus,
  FaSearchMinus
} from 'react-icons/fa';
import '../styles/AdvancedMediaGallery.css';

const AdvancedMediaGallery = ({ 
  mediaItems = [], 
  productName = '',
  onMediaChange = null,
  className = "",
  showThumbnails = true,
  showControls = true,
  autoPlay = false,
  enableZoom = true,
  enableFullscreen = true
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const mainMediaRef = useRef(null);
  const containerRef = useRef(null);
  const thumbnailsRef = useRef(null);

  // Detectar swipe en móvil
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const currentMedia = mediaItems[currentIndex];

  // Navegación
  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % mediaItems.length);
    setIsZoomed(false);
    setZoomLevel(1);
  }, [mediaItems.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
    setIsZoomed(false);
    setZoomLevel(1);
  }, [mediaItems.length]);

  const goToIndex = useCallback((index) => {
    setCurrentIndex(index);
    setIsZoomed(false);
    setZoomLevel(1);
    if (onMediaChange) onMediaChange(index);
  }, [onMediaChange]);

  // Controles de video
  const togglePlay = () => {
    if (mainMediaRef.current && currentMedia?.type === 'video') {
      if (isPlaying) {
        mainMediaRef.current.pause();
      } else {
        mainMediaRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (mainMediaRef.current && currentMedia?.type === 'video') {
      mainMediaRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Zoom para imágenes
  const handleZoomIn = () => {
    if (currentMedia?.type === 'image' && enableZoom) {
      setZoomLevel(prev => Math.min(prev + 0.5, 3));
      setIsZoomed(true);
    }
  };

  const handleZoomOut = () => {
    if (currentMedia?.type === 'image' && enableZoom) {
      const newLevel = Math.max(zoomLevel - 0.5, 1);
      setZoomLevel(newLevel);
      if (newLevel === 1) {
        setIsZoomed(false);
        setZoomPosition({ x: 50, y: 50 });
      }
    }
  };

  const resetZoom = () => {
    setZoomLevel(1);
    setIsZoomed(false);
    setZoomPosition({ x: 50, y: 50 });
  };

  // Manejo de mouse para zoom
  const handleMouseMove = (e) => {
    if (isZoomed && currentMedia?.type === 'image') {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setZoomPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
    }
  };

  // Swipe en móvil
  const handleTouchStart = (e) => {
    setTouchEnd(null);
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

    if (isLeftSwipe && mediaItems.length > 1) goToNext();
    if (isRightSwipe && mediaItems.length > 1) goToPrevious();
  };

  // Teclado
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (isFullscreen) {
        switch (e.key) {
          case 'ArrowLeft':
            goToPrevious();
            break;
          case 'ArrowRight':
            goToNext();
            break;
          case 'Escape':
            setIsFullscreen(false);
            break;
          case ' ':
            e.preventDefault();
            if (currentMedia?.type === 'video') togglePlay();
            break;
          case '+':
          case '=':
            handleZoomIn();
            break;
          case '-':
            handleZoomOut();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFullscreen, currentMedia, goToNext, goToPrevious]);

  // Auto-scroll thumbnails
  useEffect(() => {
    if (thumbnailsRef.current && showThumbnails) {
      const thumbnail = thumbnailsRef.current.children[currentIndex];
      if (thumbnail) {
        thumbnail.scrollIntoView({ behavior: 'smooth', inline: 'center' });
      }
    }
  }, [currentIndex, showThumbnails]);

  if (!mediaItems.length) {
    return (
      <div className={`advanced-media-gallery ${className}`}>
        <div className="flex items-center justify-center h-96 bg-white rounded-lg">
          <div className="text-center text-gray-500">
            <FaImage className="mx-auto text-4xl mb-2" />
            <p>No hay medios disponibles</p>
          </div>
        </div>
      </div>
    );
  }

  const renderMainMedia = () => {
    if (!currentMedia) return null;

    if (currentMedia.type === 'video') {
      return (
        <div className="relative w-full h-full group">
          <video
            ref={mainMediaRef}
            src={currentMedia.url}
            className="w-full h-full object-contain"
            controls={isFullscreen}
            muted={isMuted}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onLoadedData={() => {
              if (autoPlay && mainMediaRef.current) {
                mainMediaRef.current.play();
              }
            }}
            preload="metadata"
          />
          
          {/* Controles de video personalizados */}
          {showControls && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-4 bg-black/50 rounded-lg p-4">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                  className="text-white hover:text-blue-400 transition-colors"
                  title={isPlaying ? 'Pausar' : 'Reproducir'}
                >
                  {isPlaying ? <FaPause size={24} /> : <FaPlay size={24} />}
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                  className="text-white hover:text-blue-400 transition-colors"
                  title={isMuted ? 'Activar sonido' : 'Silenciar'}
                >
                  {isMuted ? <FaVolumeMute size={20} /> : <FaVolumeUp size={20} />}
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div 
        className="relative w-full h-full cursor-pointer"
        onMouseMove={handleMouseMove}
        onClick={isZoomed ? resetZoom : undefined}
      >
        <img
          ref={mainMediaRef}
          src={currentMedia.url}
          alt={currentMedia.title || `${productName} - Imagen ${currentIndex + 1}`}
          className="w-full h-full object-contain transition-transform duration-300"
          style={{
            transform: isZoomed ? `scale(${zoomLevel})` : 'scale(1)',
            transformOrigin: isZoomed ? `${zoomPosition.x}% ${zoomPosition.y}%` : 'center'
          }}
          draggable={false}
        />
        
        {/* Zoom controls para imágenes */}
        {enableZoom && currentMedia.type === 'image' && showControls && (
          <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
              className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              title="Acercar"
              disabled={zoomLevel >= 3}
            >
              <FaSearchPlus />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
              className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              title="Alejar"
              disabled={zoomLevel <= 1}
            >
              <FaSearchMinus />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className={`advanced-media-gallery ${className}`} ref={containerRef}>
        {/* Contenedor principal */}
        <div className="relative bg-white rounded-lg overflow-hidden aspect-square md:aspect-video">
          <div
            className="w-full h-full group"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full"
              >
                {renderMainMedia()}
              </motion.div>
            </AnimatePresence>

            {/* Navegación */}
            {mediaItems.length > 1 && showControls && (
              <>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100"
                  title="Anterior"
                >
                  <FaChevronLeft />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); goToNext(); }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100"
                  title="Siguiente"
                >
                  <FaChevronRight />
                </button>
              </>
            )}

            {/* Indicador de posición */}
            {mediaItems.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {currentIndex + 1} / {mediaItems.length}
              </div>
            )}

            {/* Botón fullscreen */}
            {enableFullscreen && showControls && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setIsFullscreen(true); }}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                title="Pantalla completa"
              >
                <FaExpand />
              </button>
            )}

            {/* Badge de tipo de media */}
            <div className="absolute top-4 left-4 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
              {currentMedia?.type === 'video' ? <FaVideo /> : <FaImage />}
              {currentMedia?.type === 'video' ? 'Video' : 'Imagen'}
            </div>
          </div>
        </div>

        {/* Thumbnails */}
        {showThumbnails && mediaItems.length > 1 && (
          <div className="mt-4">
            <div 
              ref={thumbnailsRef}
              className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300"
            >
              {mediaItems.map((media, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); goToIndex(index); }}
                  className={`
                    relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all
                    ${index === currentIndex 
                      ? 'border-blue-500 ring-2 ring-blue-200' 
                      : 'border-gray-300 hover:border-gray-400'
                    }
                  `}
                >
                  {media.type === 'video' ? (
                    <div className="relative w-full h-full">
                      <video 
                        src={media.url} 
                        className="w-full h-full object-contain"
                        muted
                        preload="metadata"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <FaPlay className="text-white text-sm" />
                      </div>
                    </div>
                  ) : (
                    <img 
                      src={media.url} 
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                  )}
                  
                  {/* Indicador activo */}
                  {index === currentIndex && (
                    <div className="absolute inset-0 bg-blue-500/20 border border-blue-500 rounded-lg" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal Fullscreen */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black flex items-center justify-center"
            style={{ zIndex: 2147483647 }}
            onClick={() => setIsFullscreen(false)}
          >
            <div 
              className="relative w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Contenido fullscreen */}
              <div className="w-full h-full max-w-7xl max-h-full p-4">
                {renderMainMedia()}
              </div>

              {/* Controles fullscreen */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setIsFullscreen(false); }}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors z-10"
                title="Cerrar"
              >
                <FaTimes size={20} />
              </button>

              {/* Navegación fullscreen */}
              {mediaItems.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-4 rounded-full transition-colors"
                    title="Anterior"
                  >
                    <FaChevronLeft size={24} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); goToNext(); }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-4 rounded-full transition-colors"
                    title="Siguiente"
                  >
                    <FaChevronRight size={24} />
                  </button>
                </>
              )}

              {/* Thumbnails en fullscreen */}
              {mediaItems.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 max-w-4xl">
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {mediaItems.map((media, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={(e) => { e.stopPropagation(); goToIndex(index); }}
                        className={`
                          relative flex-shrink-0 w-12 h-12 rounded overflow-hidden border-2 transition-all
                          ${index === currentIndex ? 'border-white' : 'border-gray-500 hover:border-gray-300'}
                        `}
                      >
                        {media.type === 'video' ? (
                          <video 
                            src={media.url} 
                            className="w-full h-full object-contain"
                            muted
                            preload="metadata"
                          />
                        ) : (
                          <img 
                            src={media.url} 
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-contain"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Info en fullscreen */}
              <div className="absolute top-4 left-4 bg-black/50 text-white px-4 py-2 rounded-lg">
                <p className="text-sm font-medium">{productName}</p>
                <p className="text-xs opacity-75">
                  {currentIndex + 1} de {mediaItems.length} • {currentMedia?.type === 'video' ? 'Video' : 'Imagen'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdvancedMediaGallery;
