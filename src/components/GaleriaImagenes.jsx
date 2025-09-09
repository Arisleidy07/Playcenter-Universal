import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

function GaleriaImagenes({ imagenes, onImageClick }) {
  const [imagenActiva, setImagenActiva] = useState(0);
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
              onImageClick(imagenActiva);
            } else if (isMobile) {
              setModalAbierto(true);
            }
          }}
          onMouseMove={!isMobile ? handleMouseMove : null}
          onMouseEnter={!isMobile ? handleMouseEnter : null}
          onMouseLeave={!isMobile ? handleMouseLeave : null}
        >
          <img
            src={imagenes[imagenActiva]}
            alt={`Imagen ${imagenActiva + 1}`}
            className="w-full h-[400px] lg:h-[450px] object-contain cursor-zoom-in"
          />

          {/* Imagen de zoom flotante (solo visible en hover en escritorio) */}
          {!isMobile && zoomVisible && (
            <div className="absolute top-0 left-full ml-4 w-[500px] h-[500px] border rounded-xl overflow-hidden shadow-lg z-50 bg-white hidden lg:block">
              <div
                className="w-full h-full bg-no-repeat bg-center bg-contain"
                style={{
                  backgroundImage: `url(${imagenes[imagenActiva]})`,
                  backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  backgroundSize: "200%",
                }}
              ></div>
            </div>
          )}
        </div>

        {/* Miniaturas */}
        <div className="overflow-x-auto mt-4">
          <div className="flex gap-4 justify-center lg:justify-start w-max mx-auto lg:mx-0 px-2">
            {imagenes.map((img, idx) => (
              <motion.div
                key={img}
                className={`relative w-20 h-20 rounded-lg overflow-hidden cursor-pointer ${
                  idx === imagenActiva 
                    ? "opacity-100" 
                    : "opacity-70 hover:opacity-90"
                }`}
                onClick={() => setImagenActiva(idx)}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <img
                  src={img}
                  alt={`Miniatura ${idx + 1}`}
                  className="w-full h-full object-contain"
                />
              </motion.div>
            ))}
          </div>
        </div>
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
            <motion.img
              src={imagenes[imagenActiva]}
              alt="Imagen ampliada"
              className="max-w-full max-h-full object-contain"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default GaleriaImagenes;
