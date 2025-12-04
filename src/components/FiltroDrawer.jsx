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
      {/* Overlay oscuro */}
      <div
        className={`fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm z-[9998] transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 z-[9999] flex flex-col shadow-2xl transform transition-all duration-300 ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-4 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800">
          <h2 className="text-lg font-bold text-white tracking-wide select-none flex items-center gap-2">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
            Filtros
          </h2>
          <button
            onClick={onClose}
            className="text-white font-bold text-2xl hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200"
            aria-label="Cerrar filtros"
          >
            ✕
          </button>
        </div>

        {/* Contenido */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50 dark:bg-gray-800">
          {/* Estado */}
          <div className="mb-6">
            <h3 className="font-medium mb-2 text-gray-800 dark:text-gray-200">
              Estado
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

          {/* Precio */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Rango de precio
            </h3>

            {/* Inputs numéricos */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 font-medium">
                    RD$
                  </span>
                  <input
                    type="text"
                    value={min === 0 ? "" : min.toLocaleString("es-DO")}
                    onChange={handleMinPrecioChange}
                    placeholder="Mín"
                    className="w-full pl-9 pr-3 py-2.5 text-sm font-medium border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-blue-500 focus:ring-0 dark:bg-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors hover:border-gray-300 dark:hover:border-gray-600"
                  />
                </div>
              </div>
              <div className="text-gray-400 dark:text-gray-500 font-medium pb-0.5">
                —
              </div>
              <div className="flex-1">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 font-medium">
                    RD$
                  </span>
                  <input
                    type="text"
                    value={max >= 1000000 ? "" : max.toLocaleString("es-DO")}
                    onChange={handleMaxPrecioChange}
                    placeholder="Máx"
                    className="w-full pl-9 pr-3 py-2.5 text-sm font-medium border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-blue-500 focus:ring-0 dark:bg-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors hover:border-gray-300 dark:hover:border-gray-600"
                  />
                </div>
              </div>
            </div>

            {/* Slider arrastrando */}
            <Box
              sx={{
                px: 1,
                "& .MuiSlider-thumb": {
                  width: 16,
                  height: 16,
                  bgcolor: "#1d4ed8",
                  border: "2px solid white",
                  "&:focus, &:hover, &.Mui-active": {
                    boxShadow: "0 0 0 10px rgba(29, 78, 216, 0.2)",
                  },
                },
                "& .MuiSlider-rail": {
                  height: 8,
                  opacity: 0.3,
                  bgcolor: "#cbd5e1",
                  borderRadius: 4,
                },
                "& .MuiSlider-track": {
                  height: 8,
                  borderRadius: 4,
                  bgcolor: "#1d4ed8",
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
            <div className="flex justify-between text-xs text-blue-700 dark:text-blue-300 mt-1 font-semibold">
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
                  productosFiltrados.length > 1 ? "s" : ""
                }`}
          </p>
        </nav>

        {/* Botones abajo - más arriba con menos padding */}
        <div className="flex justify-between gap-3 px-4 py-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg">
          <button
            onClick={() => {
              onReset();
              onClose();
            }}
            className="w-1/2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold text-sm py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Restablecer
          </button>
          <button
            onClick={() => {
              setFiltros(tempFiltros);
              onClose();
            }}
            className="w-1/2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold text-sm py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Aplicar filtros
          </button>
        </div>
      </div>
    </>
  );
}

export default FiltroDrawer;
