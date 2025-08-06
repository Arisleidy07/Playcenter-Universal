import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

function GaleriaImagenes({ imagenes }) {
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
      <div className="w-full flex flex-col lg:flex-col gap-6 relative">
        {/* Imagen principal */}
        <div
          className="relative w-full"
          ref={zoomRef}
          onClick={() => isMobile && setModalAbierto(true)}
          onMouseMove={!isMobile ? handleMouseMove : null}
          onMouseEnter={!isMobile ? handleMouseEnter : null}
          onMouseLeave={!isMobile ? handleMouseLeave : null}
        >
          <div className="overflow-hidden rounded-xl shadow-md bg-gray-100 cursor-zoom-in">
            <img
              src={imagenes[imagenActiva]}
              alt={`Imagen ${imagenActiva + 1}`}
              className="w-full h-[400px] object-contain"
            />
          </div>

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

        {/* Miniaturas con slider */}
        <div className="overflow-x-auto mt-4">
          <div className="flex gap-3 justify-start w-max px-1">
            {imagenes.map((img, idx) => (
              <motion.img
                key={img}
                src={img}
                alt={`Miniatura ${idx + 1}`}
                className={`w-16 h-16 object-contain rounded cursor-pointer border-2 ${
                  idx === imagenActiva ? "border-pink-500" : "border-transparent"
                }`}
                onClick={() => setImagenActiva(idx)}
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
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
