import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

function GaleriaImagenes({ imagenes, imagenPrincipal, videos, nombreProducto, onImageClick }) {
  // Combinar imágenes y videos en un solo array
  const todosLosMedias = [
    ...(imagenes || []).map(img => ({ url: img, type: 'image' })),
    ...(videos || []).map(vid => ({ url: vid, type: 'video' }))
  ];
  
  const [mediaActivo, setMediaActivo] = useState(0);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [zoomVisible, setZoomVisible] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isMobile, setIsMobile] = useState(false);
  const zoomRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMouseMove = (e) => {
    const bounds = zoomRef.current.getBoundingClientRect();
    const x = ((e.clientX - bounds.left) / bounds.width) * 100;
    const y = ((e.clientY - bounds.top) / bounds.height) * 100;
    setZoomPosition({ x, y });
  };

  const handleMouseEnter = () => setZoomVisible(true);
  const handleMouseLeave = () => setZoomVisible(false);

  return (
    <>
      <div className="w-full flex flex-col gap-6 relative">
        {/* Imagen principal */}
        <div
          className="relative w-full"
          ref={zoomRef}
          onClick={() => {
            if (onImageClick) {
              onImageClick(mediaActivo);
            } else if (isMobile) {
              setModalAbierto(true);
            }
          }}
          onMouseMove={!isMobile ? handleMouseMove : null}
          onMouseEnter={!isMobile ? handleMouseEnter : null}
          onMouseLeave={!isMobile ? handleMouseLeave : null}
        >
          {/* Mostrar imagen o video */}
          {todosLosMedias[mediaActivo]?.type === 'image' ? (
            <img
              src={todosLosMedias[mediaActivo].url}
              alt={`${nombreProducto} - Media ${mediaActivo + 1}`}
              className="w-full h-auto object-contain aspect-square bg-white rounded-lg"
              style={{ minHeight: '400px' }}
            />
          ) : (
            <div className="w-full aspect-square bg-black rounded-lg flex items-center justify-center" style={{ minHeight: '400px' }}>
              <video
                controls
                className="max-w-full max-h-full rounded-lg"
                preload="metadata"
                poster={imagenPrincipal}
              >
                <source src={todosLosMedias[mediaActivo]?.url} type="video/mp4" />
                Tu navegador no soporta el elemento de video.
              </video>
            </div>
          )}

          {/* Zoom overlay (solo desktop y solo para imágenes) */}
          {zoomVisible && !isMobile && todosLosMedias[mediaActivo]?.type === 'image' && (
            <div
              className="absolute inset-0 bg-white/10 cursor-zoom-in"
              style={{
                backgroundImage: `url(${todosLosMedias[mediaActivo].url})`,
                backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                backgroundSize: "200%",
                backgroundRepeat: "no-repeat",
              }}
            />
          )}
          
        </div>

        {/* Miniaturas */}
        {todosLosMedias.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {todosLosMedias.map((media, index) => (
              <button
                key={index}
                onClick={() => setMediaActivo(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  index === mediaActivo
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                {media.type === 'video' ? (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center relative">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    <div className="absolute bottom-0 right-0 bg-black/70 text-white text-xs px-1 rounded-tl">
                      VIDEO
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
        )}

      </div>

      {/* Modal en móvil */}
      <AnimatePresence>
        {modalAbierto && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalAbierto(false)}
          >
            {todosLosMedias[mediaActivo]?.type === 'image' ? (
              <motion.img
                src={todosLosMedias[mediaActivo].url}
                alt="Imagen ampliada"
                className="max-w-full max-h-full object-contain"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
              />
            ) : (
              <motion.div
                className="max-w-full max-h-full"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
              >
                <video
                  controls
                  autoPlay
                  className="max-w-full max-h-full"
                  preload="metadata"
                >
                  <source src={todosLosMedias[mediaActivo]?.url} type="video/mp4" />
                  Tu navegador no soporta el elemento de video.
                </video>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default GaleriaImagenes;
