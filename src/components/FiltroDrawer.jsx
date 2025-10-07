import React, { useState, useEffect } from "react";
import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import "../index.css";

function FiltroDrawer({ filtros, setFiltros, onReset, visible, onClose }) {
  const [tempFiltros, setTempFiltros] = useState(filtros);

  useEffect(() => {
    // Ensure precio values are always valid numbers to prevent slider errors
    const safeFiltros = {
      ...filtros,
      precio: {
        min: filtros.precio?.min ?? 0,
        max: filtros.precio?.max ?? 1000,
      },
    };
    setTempFiltros(safeFiltros);
  }, [filtros, visible]);

  const handlePrecioChange = (event, newValue) => {
    setTempFiltros((prev) => ({
      ...prev,
      precio: { min: newValue[0], max: newValue[1] },
    }));
  };

  // Asegurar que siempre sea un array de dos números válidos
  const min = Number.isFinite(tempFiltros.precio?.min) ? tempFiltros.precio.min : 0;
  const max = Number.isFinite(tempFiltros.precio?.max) ? tempFiltros.precio.max : 10000;
  const precioValido = [min, max];

  return (
    <div
      className={`fixed top-0 right-0 h-full w-72 bg-white border-l shadow-lg z-[9999] transform transition-transform duration-300 ${
        visible ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-4 border-b border-gray-300">
        <h2 className="text-lg font-semibold text-indigo-700">Filtros</h2>
        <button
          onClick={onClose}
          className="text-indigo-600 font-extrabold text-xl hover:text-indigo-800 transition-colors"
          aria-label="Cerrar filtro"
        >
          ✕
        </button>
      </div>

      {/* Contenido */}
      <div className="p-4 pt-6 flex flex-col gap-6 overflow-y-auto">
        {/* Estado */}
        <div>
          <h3 className="font-medium mb-3 text-indigo-700">Estado</h3>
          <label className="switch-container mb-2">
            <input
              type="checkbox"
              className="checkbox"
              checked={tempFiltros.estado.nuevo}
              onChange={() =>
                setTempFiltros((f) => ({
                  ...f,
                  estado: { ...f.estado, nuevo: !f.estado.nuevo },
                }))
              }
            />
            <div className="slider"></div>
            <span className="ml-2 text-gray-800 font-medium">Nuevo</span>
          </label>
          <label className="switch-container">
            <input
              type="checkbox"
              className="checkbox"
              checked={tempFiltros.estado.usado}
              onChange={() =>
                setTempFiltros((f) => ({
                  ...f,
                  estado: { ...f.estado, usado: !f.estado.usado },
                }))
              }
            />
            <div className="slider"></div>
            <span className="ml-2 text-gray-800 font-medium">Usado</span>
          </label>
        </div>

        {/* Precio */}
        <div>
          <Typography
            gutterBottom
            className="text-sm font-semibold text-indigo-700"
          >
            Precio (RD$)
          </Typography>
          <Box
            sx={{
              px: 1,
              "& .MuiSlider-thumb": {
                width: 16,
                height: 16,
                bgcolor: "#5a67d8", // indigo 600
                border: "2px solid white",
                "&:focus, &:hover, &.Mui-active": {
                  boxShadow: "0 0 0 10px rgba(90, 103, 216, 0.2)",
                },
              },
              "& .MuiSlider-rail": {
                height: 8,
                opacity: 0.3,
                bgcolor: "#cbd5e1", // slate 300
                borderRadius: 4,
              },
              "& .MuiSlider-track": {
                height: 8,
                borderRadius: 4,
                bgcolor: "#5a67d8", // indigo 600
              },
              "& .MuiSlider-root": {
                padding: "20px 0",
              },
            }}
          >
            <Slider
              value={precioValido}
              onChange={handlePrecioChange}
              valueLabelDisplay="auto"
              min={0}
              max={10000}
            />
          </Box>
          <div className="flex justify-between text-xs text-indigo-700 mt-1 font-semibold">
            <span>RD${precioValido[0]}</span>
            <span>RD${precioValido[1]}</span>
          </div>
        </div>
      </div>

      {/* Botones abajo */}
      <div className="flex justify-between gap-3 border-t border-gray-300 p-4 mt-4">
        <button
          onClick={() => {
            onReset();
            onClose();
          }}
          className="w-1/2 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 font-semibold text-sm py-2 rounded transition-colors"
        >
          Restablecer
        </button>
        <button
          onClick={() => {
            setFiltros(tempFiltros);
            onClose();
          }}
          className="w-1/2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm py-2 rounded transition-colors"
        >
          Aplicar filtros
        </button>
      </div>
    </div>
  );
}

export default FiltroDrawer;
