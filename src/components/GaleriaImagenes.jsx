import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function GaleriaImagenes({ imagenes }) {
  const [imagenActiva, setImagenActiva] = useState(0);

  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-xl shadow-md mb-4">
        <AnimatePresence mode="wait">
          <motion.img
            key={imagenes[imagenActiva]}
            src={imagenes[imagenActiva]}
            alt={`Imagen ${imagenActiva + 1}`}
            className="w-full h-[400px] object-contain bg-gray-100"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
          />
        </AnimatePresence>
      </div>

      <div className="flex gap-3 justify-center">
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
  );
}

export default GaleriaImagenes;
