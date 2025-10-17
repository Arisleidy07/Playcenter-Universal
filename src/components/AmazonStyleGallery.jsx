import React, { useState, useRef, useEffect } from "react";
import { FaPlay, FaExpand } from "react-icons/fa";
import useDeviceDetection from "../hooks/useDeviceDetection";

const AmazonStyleGallery = ({ 
  images = [], 
  videos = [], 
  onImageClick, 
  onVideoClick,
  className = "" 
}) => {
  const { isDesktop, isTablet, isMobile } = useDeviceDetection();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  
  const mainImageRef = useRef(null);
  const zoomRef = useRef(null);

  // Combinar imágenes y videos en un solo array
  const allMedia = [
    ...images.map(img => ({ type: 'image', url: img, thumbnail: img })),
    ...videos.map(video => ({ type: 'video', url: video, thumbnail: video }))
  ];

  // Manejar zoom en desktop
  const handleMouseMove = (e) => {
    if (!isDesktop || !mainImageRef.current || !zoomRef.current) return;

    const rect = mainImageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setZoomPosition({ x, y });
    
    // Actualizar posición del zoom
    const zoomImg = zoomRef.current.querySelector('img');
    if (zoomImg) {
      zoomImg.style.transformOrigin = `${x}% ${y}%`;
    }
  };

  const handleMouseEnter = () => {
    if (isDesktop && allMedia[activeIndex]?.type === 'image') {
      setIsZooming(true);
    }
  };

  const handleMouseLeave = () => {
    setIsZooming(false);
  };

  // Manejar clic en media
  const handleMediaClick = (index) => {
    const media = allMedia[index];
    if (media.type === 'image') {
      onImageClick && onImageClick(index, allMedia.filter(m => m.type === 'image'));
    } else if (media.type === 'video') {
      onVideoClick && onVideoClick(index, media.url);
    }
  };

  // Layout para Desktop
  if (isDesktop) {
    return (
      <div className={`flex gap-4 ${className}`}>
        {/* Miniaturas verticales a la izquierda */}
        <div className="flex flex-col gap-2 w-20">
          <div className="flex flex-col gap-2 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
            {allMedia.map((media, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  index === activeIndex 
                    ? 'border-blue-500 shadow-md' 
                    : 'border-gray-200 hover:border-gray-400'
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
                    loading="lazy"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Imagen principal */}
        <div className="flex-1 relative">
          <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden">
            {allMedia[activeIndex]?.type === 'video' ? (
              <div className="relative w-full h-full">
                <video 
                  src={allMedia[activeIndex].url}
                  className="w-full h-full object-contain"
                  controls
                  preload="metadata"
                />
                <button
                  onClick={() => handleMediaClick(activeIndex)}
                  className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                  title="Ver en pantalla completa"
                >
                  <FaExpand className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="relative w-full h-full">
                <img
                  ref={mainImageRef}
                  src={allMedia[activeIndex]?.url}
                  alt="Imagen principal"
                  className="w-full h-full object-contain cursor-zoom-in"
                  onMouseMove={handleMouseMove}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => handleMediaClick(activeIndex)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Panel de zoom a la derecha */}
        {isZooming && allMedia[activeIndex]?.type === 'image' && (
          <div className="w-80 h-80 border border-gray-200 rounded-lg overflow-hidden bg-white shadow-lg">
            <div ref={zoomRef} className="w-full h-full">
              <img
                src={allMedia[activeIndex].url}
                alt="Zoom"
                className="w-full h-full object-cover scale-150"
                style={{
                  transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Layout para Tablet
  if (isTablet) {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Imagen principal arriba */}
        <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden">
          {allMedia[activeIndex]?.type === 'video' ? (
            <div className="relative w-full h-full">
              <video 
                src={allMedia[activeIndex].url}
                className="w-full h-full object-contain"
                controls
                preload="metadata"
              />
              <button
                onClick={() => handleMediaClick(activeIndex)}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                title="Ver en pantalla completa"
              >
                <FaExpand className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <img
              src={allMedia[activeIndex]?.url}
              alt="Imagen principal"
              className="w-full h-full object-contain cursor-pointer"
              onClick={() => handleMediaClick(activeIndex)}
            />
          )}
        </div>

        {/* Miniaturas horizontales debajo */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
          {allMedia.map((media, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                index === activeIndex 
                  ? 'border-blue-500 shadow-md' 
                  : 'border-gray-200 hover:border-gray-400'
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
                  loading="lazy"
                />
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Layout para Móvil
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Imagen principal arriba */}
      <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden">
        {allMedia[activeIndex]?.type === 'video' ? (
          <div className="relative w-full h-full">
            <video 
              src={allMedia[activeIndex].url}
              className="w-full h-full object-contain"
              controls
              preload="metadata"
            />
            <button
              onClick={() => handleMediaClick(activeIndex)}
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              title="Ver en pantalla completa"
            >
              <FaExpand className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <img
            src={allMedia[activeIndex]?.url}
            alt="Imagen principal"
            className="w-full h-full object-contain cursor-pointer"
            onClick={() => handleMediaClick(activeIndex)}
          />
        )}
      </div>

      {/* Miniaturas horizontales debajo */}
      <div className="flex gap-2 overflow-x-auto pb-2 px-1" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
        {allMedia.map((media, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`relative flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
              index === activeIndex 
                ? 'border-blue-500 shadow-md' 
                : 'border-gray-200'
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
                loading="lazy"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AmazonStyleGallery;
