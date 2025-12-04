import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Slider from "@mui/material/Slider";
import Box from "@mui/material/Box";
import WaveBackground from "./WaveBackground"; // Fondo animado
import "../index.css";

const buttonVariants = {
  initial: { scale: 1, boxShadow: "none" },
  hover: {
    scale: 1.04,
    boxShadow: "0 4px 8px rgba(60, 80, 120, 0.3)",
    transition: { type: "spring", stiffness: 200, damping: 20 },
  },
  tap: {
    scale: 0.97,
    boxShadow: "0 0 6px rgba(60, 80, 120, 0.5)",
  },
};

const titleVariants = {
  animate: {
    textShadow: [
      "0 0 4px rgba(80, 100, 140, 0.6)",
      "0 0 10px rgba(80, 100, 140, 0.9)",
      "0 0 4px rgba(80, 100, 140, 0.6)",
    ],
    transition: {
      repeat: Infinity,
      repeatType: "mirror",
      duration: 3,
      ease: "easeInOut",
    },
  },
};

function SidebarFiltros({ filtros, setFiltros, productosOriginales }) {
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
    const max =
      filtros.precio.max !== "" ? Number(filtros.precio.max) : Infinity;
    filtrados = filtrados.filter((p) => p.precio >= min && p.precio <= max);

    setProductosFiltrados(filtrados);
  }, [filtros, productosOriginales]);

  const handleMinPrecioChange = (e) => {
    const value = e.target.value.replace(/,/g, "");
    if (value === "" || /^\d+$/.test(value)) {
      setFiltros((prev) => ({
        ...prev,
        precio: { ...prev.precio, min: value === "" ? 0 : Number(value) },
      }));
    }
  };

  const handleMaxPrecioChange = (e) => {
    const value = e.target.value.replace(/,/g, "");
    if (value === "" || /^\d+$/.test(value)) {
      setFiltros((prev) => ({
        ...prev,
        precio: { ...prev.precio, max: value === "" ? 1000000 : Number(value) },
      }));
    }
  };

  const onReset = () => {
    setFiltros({
      estado: { nuevo: false, usado: false },
      precio: { min: 0, max: 1000000 },
    });
  };

  return (
    <aside
      className="hidden xl:block w-56 max-w-[240px] relative z-40"
      style={{
        height: "100vh",
        paddingTop: "60px",
        overflow: "hidden",
        backgroundColor: "transparent",
        border: "none",
        boxShadow: "none",
      }}
      aria-label="Filtros"
    >
      <WaveBackground />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          height: "100%",
          overflowY: "auto",
          padding: "1rem",
          backgroundColor: "transparent",
          border: "none",
          boxShadow: "none",
        }}
      >
        <motion.h2
          className="text-lg font-semibold mb-4 text-blue-800 dark:text-blue-400"
          variants={titleVariants}
          animate="animate"
        >
          Filtros
        </motion.h2>

        <div className="mb-6">
          <h3 className="font-medium mb-2 text-gray-800 dark:text-gray-200">
            Estado
          </h3>
          <label className="switch-container">
            <input
              type="checkbox"
              className="checkbox"
              checked={filtros.estado?.nuevo}
              onChange={() =>
                setFiltros((f) => ({
                  ...f,
                  estado: { ...f.estado, nuevo: !f.estado?.nuevo },
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
              checked={filtros.estado?.usado}
              onChange={() =>
                setFiltros((f) => ({
                  ...f,
                  estado: { ...f.estado, usado: !f.estado?.usado },
                }))
              }
            />
            <div className="slider"></div>
            <span className="ml-2">Usado</span>
          </label>

          <label className="switch-container mt-2">
            <input
              type="checkbox"
              className="checkbox"
              checked={filtros.estado?.usadoComoNuevo}
              onChange={() =>
                setFiltros((f) => ({
                  ...f,
                  estado: {
                    ...f.estado,
                    usadoComoNuevo: !f.estado?.usadoComoNuevo,
                  },
                }))
              }
            />
            <div className="slider"></div>
            <span className="ml-2">Usado como nuevo</span>
          </label>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Rango de precio
          </h3>

          {/* Inputs numéricos */}
          <div className="space-y-2 mb-4">
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-xs font-medium">
                RD$
              </span>
              <input
                type="text"
                value={
                  filtros.precio.min === 0
                    ? ""
                    : filtros.precio.min.toLocaleString("es-DO")
                }
                onChange={handleMinPrecioChange}
                placeholder="Mín"
                className="w-full pl-8 pr-2 py-2 text-xs font-medium border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-blue-500 focus:ring-0 dark:bg-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors hover:border-gray-300 dark:hover:border-gray-600"
              />
            </div>
            <div className="text-center text-gray-400 dark:text-gray-500 text-xs font-medium">
              —
            </div>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-xs font-medium">
                RD$
              </span>
              <input
                type="text"
                value={
                  filtros.precio.max >= 1000000
                    ? ""
                    : filtros.precio.max.toLocaleString("es-DO")
                }
                onChange={handleMaxPrecioChange}
                placeholder="Máx"
                className="w-full pl-8 pr-2 py-2 text-xs font-medium border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-blue-500 focus:ring-0 dark:bg-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors hover:border-gray-300 dark:hover:border-gray-600"
              />
            </div>
          </div>

          {/* Slider arrastrando */}
          <Box
            sx={{
              px: 1,
              "& .MuiSlider-thumb": {
                width: 14,
                height: 14,
                bgcolor: "#1976d2",
                border: "2px solid white",
                "&:focus, &:hover, &.Mui-active": {
                  boxShadow: "0 0 0 8px rgba(25, 118, 210, 0.16)",
                },
              },
              "& .MuiSlider-rail": {
                height: 6,
                opacity: 0.5,
                bgcolor: "#bfbfbf",
                borderRadius: 3,
              },
              "& .MuiSlider-track": {
                height: 6,
                borderRadius: 3,
              },
              "& .MuiSlider-root": {
                padding: "15px 0",
              },
            }}
          >
            <Slider
              value={[
                typeof filtros.precio.min === "number" ? filtros.precio.min : 0,
                typeof filtros.precio.max === "number" &&
                filtros.precio.max < 1000000
                  ? filtros.precio.max
                  : 1000000,
              ]}
              onChange={(e, newValue) => {
                setFiltros((prev) => ({
                  ...prev,
                  precio: { min: newValue[0], max: newValue[1] },
                }));
              }}
              valueLabelDisplay="auto"
              min={0}
              max={1000000}
            />
          </Box>
          <div className="flex justify-between text-sm mt-2 text-gray-700 dark:text-gray-300">
            <span>RD${filtros.precio.min.toLocaleString("es-DO")}</span>
            <span>
              RD$
              {filtros.precio.max >= 1000000
                ? "1M+"
                : filtros.precio.max.toLocaleString("es-DO")}
            </span>
          </div>
        </div>

        <motion.button
          onClick={onReset}
          variants={buttonVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-sm px-3 py-2 rounded w-full"
        >
          Restablecer filtros
        </motion.button>

        <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
          {productosFiltrados.length === 0
            ? "No hay productos que coincidan con los filtros."
            : `Mostrando ${productosFiltrados.length} producto${
                productosFiltrados.length > 1 ? "s" : ""
              }`}
        </p>
      </div>
    </aside>
  );
}

export default SidebarFiltros;
