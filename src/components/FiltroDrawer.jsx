// src/components/FiltroDrawer.jsx
import React, { useState, useEffect } from "react";
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import "../index.css";

function FiltroDrawer({
  filtros,
  setFiltros,
  onReset,
  visible,
  onClose,
  onApply
}) {
  const [tempFiltros, setTempFiltros] = useState(filtros);

  useEffect(() => {
    setTempFiltros(filtros);
  }, [filtros, visible]);

  const handlePrecioChange = (event, newValue) => {
    setTempFiltros((prev) => ({
      ...prev,
      precio: { min: newValue[0], max: newValue[1] },
    }));
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-72 bg-white border-l shadow-lg z-[9999] transform transition-transform duration-300 ${
        visible ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-4 border-b">
        <h2 className="text-lg font-semibold text-blue-800">Filtros</h2>
        <button
          onClick={onClose}
          className="text-red-600 font-bold text-xl hover:text-red-800"
        >
          ✕
        </button>
      </div>

      {/* Contenido */}
      <div className="p-4 pt-6 flex flex-col gap-6 overflow-y-auto">
        {/* Estado */}
        <div>
          <h3 className="font-medium mb-3">Estado</h3>
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
            <span className="ml-2">Nuevo</span>
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
            <span className="ml-2">Usado</span>
          </label>
        </div>

        {/* Precio */}
        <div>
          <Typography gutterBottom className="text-sm font-medium">
            Precio (RD$)
          </Typography>
          <Box
            sx={{
              px: 1,
              '& .MuiSlider-thumb': {
                width: 14,
                height: 14,
                bgcolor: '#1976d2',
                border: '2px solid white',
                '&:focus, &:hover, &.Mui-active': {
                  boxShadow: '0 0 0 8px rgba(25, 118, 210, 0.16)',
                },
              },
              '& .MuiSlider-rail': {
                height: 6,
                opacity: 0.5,
                bgcolor: '#bfbfbf',
                borderRadius: 3,
              },
              '& .MuiSlider-track': {
                height: 6,
                borderRadius: 3,
              },
              '& .MuiSlider-root': {
                padding: '15px 0',
              },
            }}
          >
            <Slider
              value={[
                tempFiltros.precio.min,
                tempFiltros.precio.max,
              ]}
              onChange={handlePrecioChange}
              valueLabelDisplay="auto"
              min={0}
              max={1000}
            />
          </Box>
          <div className="flex justify-between text-xs text-gray-700 mt-1">
            <span>RD${tempFiltros.precio.min}</span>
            <span>RD${tempFiltros.precio.max}</span>
          </div>
        </div>
      </div>

      {/* Botones abajo */}
      <div className="flex justify-between gap-2 border-t p-4 mt-4">
        <button
          onClick={() => {
            onReset();
            onClose();
          }}
          className="w-1/2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm py-2 rounded"
        >
          Restablecer
        </button>
        <button
          onClick={() => {
            setFiltros(tempFiltros);
            onClose();
          }}
          className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded"
        >
          Aplicar filtros
        </button>
      </div>
    </div>
  );
}

export default FiltroDrawer;
