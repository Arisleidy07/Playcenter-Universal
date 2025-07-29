import React, { useState, useEffect } from "react";
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import "../index.css";

function SidebarFiltros({
  filtros,
  setFiltros,
  productosOriginales,
}) {
  const [productosFiltrados, setProductosFiltrados] = useState([]);

  useEffect(() => {
    let filtrados = productosOriginales;

    if (filtros.estado.nuevo || filtros.estado.usado) {
      filtrados = filtrados.filter((p) => {
        if (filtros.estado.nuevo && filtros.estado.usado) return true;
        if (filtros.estado.nuevo) return p.estado === "Nuevo";
        if (filtros.estado.usado) return p.estado === "Usado";
        return true;
      });
    }

    const min = filtros.precio.min !== "" ? Number(filtros.precio.min) : 0;
    const max = filtros.precio.max !== "" ? Number(filtros.precio.max) : Infinity;
    filtrados = filtrados.filter((p) => p.precio >= min && p.precio <= max);

    setProductosFiltrados(filtrados);
  }, [filtros, productosOriginales]);

  const handlePrecioChange = (event, newValue) => {
    setFiltros((prev) => ({
      ...prev,
      precio: { min: newValue[0], max: newValue[1] },
    }));
  };

  const onReset = () => {
    setFiltros({
      estado: { nuevo: false, usado: false },
      precio: { min: 0, max: 1000 },
    });
  };

  // ALTURA HEADER: AJUSTA este valor si tu header es más alto o más bajo
  const HEADER_HEIGHT = 76;

  return (
    <aside
      className="hidden lg:block w-56 max-w-[240px] p-4 border-l border-gray-200 bg-white shadow z-40"
      style={{
        height: `calc(100vh - ${HEADER_HEIGHT}px)`,
        overflow: "hidden",
      }}
      aria-label="Filtros"
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          maxHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
          overflowY: "auto",
        }}
      >
        <h2 className="text-lg font-semibold mb-4 text-blue-800">Filtros</h2>
        {/* ...resto igual... */}
        {/* Estado y filtro precio... */}
        <div className="mb-6">
          <h3 className="font-medium mb-2">Estado</h3>
          <label className="switch-container">
            <input
              type="checkbox"
              className="checkbox"
              checked={filtros.estado.nuevo}
              onChange={() =>
                setFiltros((f) => ({
                  ...f,
                  estado: { ...f.estado, nuevo: !f.estado.nuevo },
                }))
              }
            />
            <div className="slider"></div>
            <span className="ml-2">Nuevo</span>
          </label>

          <label className="switch-container mt-2">
            <input
              type="checkbox"
              className="checkbox"
              checked={filtros.estado.usado}
              onChange={() =>
                setFiltros((f) => ({
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
        <div className="mb-6">
          <Typography gutterBottom>Precio (RD$)</Typography>
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
              value={[filtros.precio.min, filtros.precio.max]}
              onChange={handlePrecioChange}
              valueLabelDisplay="auto"
              min={0}
              max={1000}
            />
          </Box>
          <div className="flex justify-between text-sm mt-2 text-gray-700">
            <span>RD${filtros.precio.min}</span>
            <span>RD${filtros.precio.max}</span>
          </div>
        </div>
        <button
          onClick={onReset}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded transition w-full"
        >
          Restablecer filtros
        </button>
        <p className="mt-4 text-sm text-gray-600">
          {productosFiltrados.length === 0
            ? "No hay productos que coincidan con los filtros."
            : `Mostrando ${productosFiltrados.length} producto${productosFiltrados.length > 1 ? "s" : ""}`}
        </p>
      </div>
    </aside>
  );
}

export default SidebarFiltros;