import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  ZoomIn, 
  ZoomOut, 
  Play,
  Maximize,
  RotateCcw,
  Share2
} from 'lucide-react';

const ResponsiveProductGallery = ({ 
  images = [], 
  videos = [], 
  mainImage = null,
  onImageChange,
  className = '',
  enableZoom = true,
  enableFullscreen = true,
  autoplay = false
}) => {
  // Combine all media with proper typing
  const allMedia = [
    ...(mainImage ? [{ url: mainImage, type: 'image', isMain: true }] : []),
    ...images.map(img => ({ url: img, type: 'image', isMain: false })),
    ...videos.map(video => ({ url: video, type: 'video', isMain: false }))
  ].filter(item => item.url);

  // State management
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isZooming, setIsZooming] = useState(false);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Refs
  const mainImageRef = useRef(null);
  const zoomContainerRef = useRef(null);
  const thumbnailsRef = useRef(null);

  // Get current media item
  const currentMedia = allMedia[currentIndex] || null;
  const isCurrentVideo = currentMedia?.type === 'video';

  // Navigation functions
  const goToNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % allMedia.length);
    setZoomLevel(1);
    setZoomPosition({ x: 50, y: 50 });
  }, [allMedia.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + allMedia.length) % allMedia.length);
    setZoomLevel(1);
    setZoomPosition({ x: 50, y: 50 });
  }, [allMedia.length]);

  const goToIndex = useCallback((index) => {
    setCurrentIndex(index);
    setZoomLevel(1);
    setZoomPosition({ x: 50, y: 50 });
    if (onImageChange) onImageChange(index);
  }, [onImageChange]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isFullscreen) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNext();
          break;
        case 'Escape':
          e.preventDefault();
          setIsFullscreen(false);
          break;
        case '+':
        case '=':
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
          e.preventDefault();
          handleZoomOut();
          break;
        case '0':
          e.preventDefault();
          resetZoom();
          break;
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen, goToNext, goToPrevious]);

  // Touch handling for mobile swipe
  const handleTouchStart = (e) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
  };

  const handleTouchMove = (e) => {
    setTouchEnd({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
  };

  const handleTouchEnd = () => {
    if (!touchStart.x || !touchEnd.x) return;
    
    const distance = touchStart.x - touchEnd.x;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  // Zoom functions
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.5, 4));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev / 1.5, 1));
  };

  const resetZoom = () => {
    setZoomLevel(1);
    setZoomPosition({ x: 50, y: 50 });
  };

  // Mouse hover zoom for desktop
  const handleMouseMove = (e) => {
    if (!enableZoom || isCurrentVideo || window.innerWidth < 1280) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setZoomPosition({ x, y });
    setIsZooming(true);
  };

  const handleMouseLeave = () => {
    setIsZooming(false);
  };

  // Auto-scroll thumbnails to show active item
  useEffect(() => {
    if (thumbnailsRef.current) {
      const activeThumb = thumbnailsRef.current.children[currentIndex];
      if (activeThumb) {
        activeThumb.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest'
        });
      }
    }
  }, [currentIndex]);

  if (!allMedia.length) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-300 rounded-lg flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-500">No hay imágenes disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Main Gallery Container */}
      <div className="grid grid-cols-1 xl:grid-cols-[120px_1fr] gap-4">
        {/* Desktop Vertical Thumbnails */}
        <div className="hidden xl:block">
          <div 
            ref={thumbnailsRef}
            className="flex flex-col space-y-2 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300"
          >
            {allMedia.map((media, index) => (
              <button
                key={index}
                onClick={() => goToIndex(index)}
                className={`relative w-full aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentIndex 
                    ? 'border-blue-500 ring-2 ring-blue-200' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {media.type === 'video' ? (
                  <div className="relative w-full h-full bg-black flex items-center justify-center">
                    <Play className="w-6 h-6 text-white" />
                    <video
                      src={media.url}
                      className="absolute inset-0 w-full h-full object-cover"
                      muted
                      preload="metadata"
                    />
                  </div>
                ) : (
                  <img
                    src={media.url}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-contain bg-white"
                    loading="lazy"
                  />
                )}
                {media.isMain && (
                  <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-1 rounded">
                    Principal
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main Media Display */}
        <div className="relative">
          {/* Main Image/Video Container */}
          <div 
            className="relative aspect-square bg-white rounded-lg overflow-hidden border border-gray-200 group"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {currentMedia && (
              <>
                {isCurrentVideo ? (
                  <video
                    ref={mainImageRef}
                    src={currentMedia.url}
                    className="w-full h-full object-contain"
                    controls
                    preload="metadata"
                    autoPlay={autoplay}
                  />
                ) : (
                  <img
                    ref={mainImageRef}
                    src={currentMedia.url}
                    alt={`Product image ${currentIndex + 1}`}
                    className="w-full h-full object-contain cursor-zoom-in"
                    onClick={() => enableFullscreen && setIsFullscreen(true)}
                    style={{
                      transform: isZooming && window.innerWidth >= 1280 ? 'scale(1.1)' : 'scale(1)',
                      transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      transition: 'transform 0.2s ease-out'
                    }}
                  />
                )}

                {/* Navigation Arrows */}
                {allMedia.length > 1 && (
                  <>
                    <button
                      onClick={goToPrevious}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={goToNext}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Fullscreen Button */}
                {enableFullscreen && (
                  <button
                    onClick={() => setIsFullscreen(true)}
                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Maximize className="w-4 h-4" />
                  </button>
                )}

                {/* Media Counter */}
                {allMedia.length > 1 && (
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                    {currentIndex + 1} / {allMedia.length}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Desktop Zoom Panel */}
          {isZooming && !isCurrentVideo && window.innerWidth >= 1280 && (
            <div className="absolute top-0 left-full ml-4 w-80 h-80 border border-gray-200 rounded-lg overflow-hidden bg-white shadow-lg">
              <div
                className="w-full h-full bg-no-repeat"
                style={{
                  backgroundImage: `url(${currentMedia?.url})`,
                  backgroundSize: '400%',
                  backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`
                }}
              />
            </div>
          )}

          {/* Mobile/Tablet Horizontal Thumbnails */}
          <div className="xl:hidden mt-4">
            <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
              {allMedia.map((media, index) => (
                <button
                  key={index}
                  onClick={() => goToIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentIndex 
                      ? 'border-blue-500 ring-2 ring-blue-200' 
                      : 'border-gray-200'
                  }`}
                >
                  {media.type === 'video' ? (
                    <div className="relative w-full h-full bg-black flex items-center justify-center">
                      <Play className="w-4 h-4 text-white" />
                      <video
                        src={media.url}
                        className="absolute inset-0 w-full h-full object-cover"
                        muted
                        preload="metadata"
                      />
                    </div>
                  ) : (
                    <img
                      src={media.url}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-contain bg-white"
                      loading="lazy"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black"
            onClick={(e) => e.target === e.currentTarget && setIsFullscreen(false)}
          >
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-4">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center space-x-4">
                  <span className="text-lg font-medium">
                    {currentIndex + 1} de {allMedia.length}
                  </span>
                  {!isCurrentVideo && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleZoomOut}
                        disabled={zoomLevel <= 1}
                        className="p-2 rounded-full bg-black/50 hover:bg-black/70 disabled:opacity-50"
                      >
                        <ZoomOut className="w-4 h-4" />
                      </button>
                      <span className="text-sm">{Math.round(zoomLevel * 100)}%</span>
                      <button
                        onClick={handleZoomIn}
                        disabled={zoomLevel >= 4}
                        className="p-2 rounded-full bg-black/50 hover:bg-black/70 disabled:opacity-50"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>
                      <button
                        onClick={resetZoom}
                        className="p-2 rounded-full bg-black/50 hover:bg-black/70"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setIsFullscreen(false)}
                  className="p-2 rounded-full bg-black/50 hover:bg-black/70"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex items-center justify-center w-full h-full p-4 pt-20 pb-20">
              {currentMedia && (
                <>
                  {isCurrentVideo ? (
                    <video
                      src={currentMedia.url}
                      className="max-w-full max-h-full object-contain"
                      controls
                      autoPlay
                    />
                  ) : (
                    <motion.img
                      key={currentIndex}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: zoomLevel }}
                      transition={{ duration: 0.3 }}
                      src={currentMedia.url}
                      alt={`Product image ${currentIndex + 1}`}
                      className="max-w-full max-h-full object-contain cursor-grab active:cursor-grabbing"
                      style={{
                        transformOrigin: 'center center'
                      }}
                      draggable={false}
                    />
                  )}

                  {/* Navigation Arrows */}
                  {allMedia.length > 1 && (
                    <>
                      <button
                        onClick={goToPrevious}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={goToNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Bottom Thumbnails */}
            {allMedia.length > 1 && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
                <div className="flex justify-center space-x-2 overflow-x-auto max-w-full">
                  {allMedia.map((media, index) => (
                    <button
                      key={index}
                      onClick={() => goToIndex(index)}
                      className={`flex-shrink-0 w-12 h-12 rounded overflow-hidden border-2 transition-all ${
                        index === currentIndex 
                          ? 'border-white' 
                          : 'border-transparent opacity-60 hover:opacity-80'
                      }`}
                    >
                      {media.type === 'video' ? (
                        <div className="relative w-full h-full bg-black flex items-center justify-center">
                          <Play className="w-3 h-3 text-white" />
                          <video
                            src={media.url}
                            className="absolute inset-0 w-full h-full object-cover"
                            muted
                            preload="metadata"
                          />
                        </div>
                      ) : (
                        <img
                          src={media.url}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResponsiveProductGallery;
