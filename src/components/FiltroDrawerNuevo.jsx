import React, { useState, useEffect } from "react";
import Slider from "@mui/material/Slider";
import Box from "@mui/material/Box";
import "../index.css";

function FiltroDrawerNuevo({
  filtros,
  setFiltros,
  onReset,
  visible,
  onClose,
  productosOriginales,
}) {
  const [tempFiltros, setTempFiltros] = useState(filtros);
  const [productosFiltrados, setProductosFiltrados] = useState([]);

  useEffect(() => {
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

    const algunEstadoSeleccionado =
      tempFiltros.estado?.nuevo ||
      tempFiltros.estado?.usado ||
      tempFiltros.estado?.usadoComoNuevo;

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
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[9998] transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{
          background: "rgba(0, 0, 0, 0.3)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onClose}
      />

      {/* Centered modal for phone and tablet (xl:hidden) */}
      <div
        className={`xl:hidden fixed inset-0 z-[9999] flex items-start justify-end p-0 transition-opacity duration-200 ${
          visible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        role="dialog"
        aria-modal="true"
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`absolute right-0 top-0 bottom-0 z-10 w-72 sm:w-80 max-w-[85vw] bg-white dark:bg-gray-900 rounded-l-2xl shadow-2xl flex flex-col h-full overflow-hidden transform transition-transform duration-300 relative ${
            visible ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Header compacto */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
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
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Filtros
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
              aria-label="Cerrar"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content compacto y uniforme */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4 pb-20 bg-white dark:bg-gray-900">
            {/* Estado del producto */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Estado
              </h3>

              {/* Nuevo */}
              <div
                className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                  tempFiltros.estado?.nuevo
                    ? "bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
                onClick={() =>
                  setTempFiltros((f) => ({
                    ...f,
                    estado: { ...f.estado, nuevo: !f.estado?.nuevo },
                  }))
                }
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      tempFiltros.estado?.nuevo
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    {tempFiltros.estado?.nuevo && (
                      <svg
                        className="w-2.5 h-2.5 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      tempFiltros.estado?.nuevo
                        ? "text-blue-700 dark:text-blue-300"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    Nuevo
                  </span>
                </div>
              </div>

              {/* Usado */}
              <div
                className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                  tempFiltros.estado?.usado
                    ? "bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
                onClick={() =>
                  setTempFiltros((f) => ({
                    ...f,
                    estado: { ...f.estado, usado: !f.estado?.usado },
                  }))
                }
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      tempFiltros.estado?.usado
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    {tempFiltros.estado?.usado && (
                      <svg
                        className="w-2.5 h-2.5 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      tempFiltros.estado?.usado
                        ? "text-blue-700 dark:text-blue-300"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    Usado
                  </span>
                </div>
              </div>

              {/* Usado como nuevo */}
              <div
                className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                  tempFiltros.estado?.usadoComoNuevo
                    ? "bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
                onClick={() =>
                  setTempFiltros((f) => ({
                    ...f,
                    estado: {
                      ...f.estado,
                      usadoComoNuevo: !f.estado?.usadoComoNuevo,
                    },
                  }))
                }
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      tempFiltros.estado?.usadoComoNuevo
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    {tempFiltros.estado?.usadoComoNuevo && (
                      <svg
                        className="w-2.5 h-2.5 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      tempFiltros.estado?.usadoComoNuevo
                        ? "text-blue-700 dark:text-blue-300"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    Usado como nuevo
                  </span>
                </div>
              </div>
            </div>

            {/* Rango de precio compacto */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Precio
              </h3>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Mín
                    </label>
                    <input
                      type="text"
                      value={min === 0 ? "" : min.toLocaleString("es-DO")}
                      onChange={handleMinPrecioChange}
                      placeholder="0"
                      className="w-full px-2.5 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Máx
                    </label>
                    <input
                      type="text"
                      value={max >= 1000000 ? "" : max.toLocaleString("es-DO")}
                      onChange={handleMaxPrecioChange}
                      placeholder="Sin lím"
                      className="w-full px-2.5 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white text-sm"
                    />
                  </div>
                </div>
              </div>

              <Box sx={{ px: 0.5 }}>
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
                  sx={{
                    color: "#3b82f6",
                    height: 4,
                    "& .MuiSlider-thumb": {
                      backgroundColor: "#3b82f6",
                      width: 16,
                      height: 16,
                    },
                    "& .MuiSlider-track": {
                      backgroundColor: "#3b82f6",
                      height: 4,
                    },
                    "& .MuiSlider-rail": {
                      backgroundColor: "#e5e7eb",
                      height: 4,
                    },
                  }}
                />
              </Box>

              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>RD${min.toLocaleString("es-DO")}</span>
                <span>
                  {max >= 50000
                    ? "RD$50,000+"
                    : `RD$${max.toLocaleString("es-DO")}`}
                </span>
              </div>
            </div>

            {/* Contador compacto */}
            <div className="py-1">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                {productosFiltrados.length === 0
                  ? "Sin resultados"
                  : `${productosFiltrados.length} producto${
                      productosFiltrados.length !== 1 ? "s" : ""
                    }`}
              </p>
            </div>
          </div>

          {/* Botones compactos */}
          <div className="absolute bottom-0 left-0 right-0 p-3 pb-[env(safe-area-inset-bottom)] border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="mx-auto w-full max-w-[280px] flex gap-2 justify-center">
              <button
                onClick={() => {
                  setTempFiltros({
                    estado: {},
                    precio: { min: 0, max: 1000000 },
                  });
                }}
                className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Limpiar
              </button>
              <button
                onClick={() => {
                  setFiltros(tempFiltros);
                  onClose();
                }}
                className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      </div>
      <div
        className={`hidden xl:flex fixed top-0 right-0 h-full w-full max-w-xs xl:max-w-sm bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 z-[9999] flex-col shadow-2xl transform transition-all duration-300 ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600"
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
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              Filtros
            </h2>
          </div>
          <button
            onClick={onClose}
            className="ml-auto p-1.5 sm:p-2 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all duration-200 hover:scale-105"
            aria-label="Cerrar"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
          <div className="space-y-3">
            <h3 className="text-base font-medium text-gray-900 dark:text-white">
              Estado del Producto
            </h3>
            <div
              className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                tempFiltros.estado?.nuevo
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
              onClick={() =>
                setTempFiltros((f) => ({
                  ...f,
                  estado: { ...f.estado, nuevo: !f.estado?.nuevo },
                }))
              }
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    tempFiltros.estado?.nuevo
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  {tempFiltros.estado?.nuevo && (
                    <svg
                      className="w-2.5 h-2.5 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <span
                  className={`text-sm font-medium ${
                    tempFiltros.estado?.nuevo
                      ? "text-blue-700 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Nuevo
                </span>
              </div>
              <div className="hidden"></div>
            </div>

            <div
              className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                tempFiltros.estado?.usado
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
              onClick={() =>
                setTempFiltros((f) => ({
                  ...f,
                  estado: { ...f.estado, usado: !f.estado?.usado },
                }))
              }
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    tempFiltros.estado?.usado
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  {tempFiltros.estado?.usado && (
                    <svg
                      className="w-2.5 h-2.5 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <span
                  className={`text-sm font-medium ${
                    tempFiltros.estado?.usado
                      ? "text-blue-700 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Usado
                </span>
              </div>
              <div className="hidden"></div>
            </div>

            <div
              className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                tempFiltros.estado?.usadoComoNuevo
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
              onClick={() =>
                setTempFiltros((f) => ({
                  ...f,
                  estado: {
                    ...f.estado,
                    usadoComoNuevo: !f.estado?.usadoComoNuevo,
                  },
                }))
              }
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    tempFiltros.estado?.usadoComoNuevo
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  {tempFiltros.estado?.usadoComoNuevo && (
                    <svg
                      className="w-2.5 h-2.5 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <span
                  className={`text-sm font-medium ${
                    tempFiltros.estado?.usadoComoNuevo
                      ? "text-blue-700 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Usado como nuevo
                </span>
              </div>
              <div className="hidden"></div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-medium text-gray-900 dark:text-white">
              Rango de Precio
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mínimo
                </label>
                <input
                  type="text"
                  value={min === 0 ? "" : min.toLocaleString("es-DO")}
                  onChange={handleMinPrecioChange}
                  placeholder="0"
                  className="w-full px-2.5 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Máximo
                </label>
                <input
                  type="text"
                  value={max >= 1000000 ? "" : max.toLocaleString("es-DO")}
                  onChange={handleMaxPrecioChange}
                  placeholder="Sin límite"
                  className="w-full px-2.5 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white text-sm"
                />
              </div>
            </div>
            <Box sx={{ px: 1 }}>
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
                sx={{
                  color: "#3b82f6",
                  "& .MuiSlider-thumb": { backgroundColor: "#3b82f6" },
                  "& .MuiSlider-track": { backgroundColor: "#3b82f6" },
                  "& .MuiSlider-rail": { backgroundColor: "#e5e7eb" },
                }}
              />
            </Box>
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>RD${min.toLocaleString("es-DO")}</span>
              <span>
                {max >= 50000
                  ? "RD$50,000+"
                  : `RD$${max.toLocaleString("es-DO")}`}
              </span>
            </div>
          </div>

          <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 text-center">
              {productosFiltrados.length === 0
                ? "No hay productos que coincidan"
                : `${productosFiltrados.length} producto${
                    productosFiltrados.length !== 1 ? "s" : ""
                  } encontrado${productosFiltrados.length !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setTempFiltros({
                  estado: {},
                  precio: { min: 0, max: 1000000 },
                });
              }}
              className="flex-1 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              Limpiar
            </button>
            <button
              onClick={() => {
                setFiltros(tempFiltros);
                onClose();
              }}
              className="flex-1 px-3 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium"
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default FiltroDrawerNuevo;
