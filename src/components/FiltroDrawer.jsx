import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

function FiltroDrawer({
  filtros,
  setFiltros,
  onReset,
  visible,
  onClose
}) {
  const [rango, setRango] = useState([
    filtros.precio.min ? Number(filtros.precio.min) : 0,
    filtros.precio.max ? Number(filtros.precio.max) : 1000
  ]);

  const handleSliderChange = (values) => {
    setRango(values);
    setFiltros((f) => ({
      ...f,
      precio: { min: values[0], max: values[1] }
    }));
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Fondo difuminado */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-[1000]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 bottom-0 w-80 bg-white z-[1001] shadow-lg flex flex-col"
          >
            {/* Encabezado */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Filtros</h2>
              <button
                onClick={onClose}
                className="text-2xl font-bold text-gray-600"
              >
                ×
              </button>
            </div>

            {/* Contenido */}
            <div className="flex-1 p-4 flex flex-col gap-6 overflow-y-auto">
              {/* Estado */}
              <div>
                <h3 className="font-medium mb-2">Estado</h3>
                <label className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={filtros.estado.nuevo}
                    onChange={() =>
                      setFiltros((f) => ({
                        ...f,
                        estado: { ...f.estado, nuevo: !f.estado.nuevo }
                      }))
                    }
                  />
                  Nuevo
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filtros.estado.usado}
                    onChange={() =>
                      setFiltros((f) => ({
                        ...f,
                        estado: { ...f.estado, usado: !f.estado.usado }
                      }))
                    }
                  />
                  Usado
                </label>
              </div>

              {/* Precio */}
              <div>
                <h3 className="font-medium mb-2">Precio</h3>
                <Slider
                  range
                  min={0}
                  max={1000}
                  step={10}
                  value={rango}
                  onChange={handleSliderChange}
                />
                <div className="flex justify-between text-sm mt-2">
                  <span>${rango[0]}</span>
                  <span>${rango[1]}</span>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="p-4 border-t flex gap-2">
              <button
                onClick={onReset}
                className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm"
              >
                Restablecer
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
              >
                Aplicar filtros
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default FiltroDrawer;
