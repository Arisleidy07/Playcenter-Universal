import React, { useState, useEffect } from "react";
import Slider from "@mui/material/Slider";
import Box from "@mui/material/Box";
import "../index.css";

function FiltroDrawer({
  filtros,
  setFiltros,
  onReset,
  visible,
  onClose,
  productosOriginales,
}) {
  const [tempFiltros, setTempFiltros] = useState(filtros);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [productosFiltrados, setProductosFiltrados] = useState([]);

  useEffect(() => {
    const checkTheme = () => {
      setIsDarkMode(
        document.documentElement.classList.contains("dark") ||
          document.documentElement.classList.contains("dark-theme")
      );
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Ensure precio values are always valid numbers to prevent slider errors
    const safeFiltros = {
      ...filtros,
      precio: {
        min: filtros.precio?.min ?? 0,
        max:
          filtros.precio?.max >= 1000000 ? 50000 : filtros.precio?.max ?? 50000,
      },
    };
    setTempFiltros(safeFiltros);
  }, [filtros, visible]);

  useEffect(() => {
    if (!productosOriginales || productosOriginales.length === 0) {
      setProductosFiltrados([]);
      return;
    }

    let filtrados = [...productosOriginales];

    // Filtrar por estado - SOLO si al menos uno está seleccionado
    const algunEstadoSeleccionado =
      tempFiltros.estado.nuevo ||
      tempFiltros.estado.usado ||
      tempFiltros.estado.usadoComoNuevo;

    if (algunEstadoSeleccionado) {
      filtrados = filtrados.filter((p) => {
        if (tempFiltros.estado.nuevo && p.estado === "Nuevo") return true;
        if (tempFiltros.estado.usado && p.estado === "Usado") return true;
        if (
          tempFiltros.estado.usadoComoNuevo &&
          p.estado === "Usado como nuevo"
        )
          return true;
        return false;
      });
    }

    // Filtrar por precio
    const min =
      tempFiltros.precio.min !== "" && Number.isFinite(tempFiltros.precio.min)
        ? Number(tempFiltros.precio.min)
        : 0;
    const max =
      tempFiltros.precio.max !== "" && Number.isFinite(tempFiltros.precio.max)
        ? Number(tempFiltros.precio.max)
        : 1000000;

    filtrados = filtrados.filter((p) => {
      const precio = Number(p.precio) || 0;
      // Si el max es muy alto (1 millón), no aplicar límite superior (cualquier precio mayor)
      if (max >= 1000000) {
        return precio >= min;
      }
      return precio >= min && precio <= max;
    });

    setProductosFiltrados(filtrados);
  }, [tempFiltros, productosOriginales]);

  const handleMinPrecioChange = (e) => {
    const value = e.target.value.replace(/,/g, "");
    if (value === "" || /^\d+$/.test(value)) {
      setTempFiltros((prev) => ({
        ...prev,
        precio: { ...prev.precio, min: value === "" ? 0 : Number(value) },
      }));
    }
  };

  const handleMaxPrecioChange = (e) => {
    const value = e.target.value.replace(/,/g, "");
    if (value === "" || /^\d+$/.test(value)) {
      setTempFiltros((prev) => ({
        ...prev,
        precio: { ...prev.precio, max: value === "" ? 1000000 : Number(value) },
      }));
    }
  };

  const min = Number.isFinite(tempFiltros.precio?.min)
    ? tempFiltros.precio.min
    : 0;
  const max = Number.isFinite(tempFiltros.precio?.max)
    ? tempFiltros.precio.max
    : 1000000;

  return (
    <>
      {/* Overlay ligeramente transparente */}
      <div
        className={`fixed inset-0 z-[9998] transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{
          background: isDarkMode ? "rgba(0, 0, 0, 0.4)" : "rgba(0, 0, 0, 0.2)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 z-[9999] flex flex-col shadow-2xl transform transition-all duration-300 ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header limpio */}
        <div className="flex justify-between items-center px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            >
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
            Filtros
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Cerrar filtros"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido limpio */}
        <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50 dark:bg-gray-900">
          {/* Estado del producto */}
          <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="font-medium mb-3 text-gray-900 dark:text-white text-sm">
              Estado del Producto
            </h3>
            <label className="switch-container mb-2">
              <input
                type="checkbox"
                className="checkbox"
                checked={tempFiltros.estado?.nuevo}
                onChange={() =>
                  setTempFiltros((f) => ({
                    ...f,
                    estado: { ...f.estado, nuevo: !f.estado?.nuevo },
                  }))
                }
              />
              <div className="slider"></div>
              <span className="ml-2 text-gray-800 dark:text-gray-200 font-medium">
                Nuevo
              </span>
            </label>
            <label className="switch-container mb-2">
              <input
                type="checkbox"
                className="checkbox"
                checked={tempFiltros.estado?.usado}
                onChange={() =>
                  setTempFiltros((f) => ({
                    ...f,
                    estado: { ...f.estado, usado: !f.estado?.usado },
                  }))
                }
              />
              <div className="slider"></div>
              <span className="ml-2 text-gray-800 dark:text-gray-200 font-medium">
                Usado
              </span>
            </label>
            <label className="switch-container">
              <input
                type="checkbox"
                className="checkbox"
                checked={tempFiltros.estado?.usadoComoNuevo}
                onChange={() =>
                  setTempFiltros((f) => ({
                    ...f,
                    estado: {
                      ...f.estado,
                      usadoComoNuevo: !f.estado?.usadoComoNuevo,
                    },
                  }))
                }
              />
              <div className="slider"></div>
              <span className="ml-2 text-gray-800 dark:text-gray-200 font-medium">
                Usado como nuevo
              </span>
            </label>
          </div>

          {/* Rango de precio */}
          <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="font-medium mb-3 text-gray-900 dark:text-white text-sm">
              Rango de Precio
            </h3>

            {/* Inputs de precio */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={min === 0 ? "" : min.toLocaleString("es-DO")}
                  onChange={handleMinPrecioChange}
                  placeholder="Mínimo"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <span className="text-gray-400 text-sm">a</span>
              <div className="flex-1">
                <input
                  type="text"
                  value={max >= 1000000 ? "" : max.toLocaleString("es-DO")}
                  onChange={handleMaxPrecioChange}
                  placeholder="Máximo"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Slider arrastrando */}
            <Box
              sx={{
                px: 1,
                "& .MuiSlider-thumb": {
                  width: 16,
                  height: 16,
                  bgcolor: "#3b82f6",
                  border: "2px solid white",
                  "&:focus, &:hover, &.Mui-active": {
                    boxShadow: "0 0 0 8px rgba(59, 130, 246, 0.16)",
                  },
                },
                "& .MuiSlider-rail": {
                  height: 4,
                  opacity: 0.3,
                  bgcolor: "#e5e7eb",
                  borderRadius: 2,
                },
                "& .MuiSlider-track": {
                  height: 4,
                  borderRadius: 2,
                  bgcolor: "#3b82f6",
                },
                "& .MuiSlider-root": {
                  padding: "20px 0",
                },
              }}
            >
              <Slider
                value={[min, max >= 1000000 ? 50000 : max]}
                onChange={(e, newValue) => {
                  setTempFiltros((prev) => ({
                    ...prev,
                    precio: {
                      min: newValue[0],
                      max: newValue[1] >= 50000 ? 1000000 : newValue[1],
                    },
                  }));
                }}
                valueLabelDisplay="auto"
                min={0}
                max={50000}
                step={500}
              />
            </Box>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
              <span>RD${min.toLocaleString("es-DO")}</span>
              <span>
                {max >= 50000
                  ? "RD$50,000+"
                  : `RD$${max.toLocaleString("es-DO")}`}
              </span>
            </div>
          </div>

          {/* Mensaje de productos filtrados */}
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-300 text-center">
            {productosFiltrados.length === 0
              ? "No hay productos que coincidan con los filtros."
              : `Mostrando ${productosFiltrados.length} producto${
        </div>
        <span className="text-gray-400 text-sm">a</span>
        <div className="flex-1">
          <input
            type="text"
            value={max >= 1000000 ? "" : max.toLocaleString("es-DO")}
            onChange={handleMaxPrecioChange}
            placeholder="Máximo"
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

export default FiltroDrawer;
