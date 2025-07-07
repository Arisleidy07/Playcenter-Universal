import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

function SidebarFiltros({
  mostrarEnMovil,
  setMostrarEnMovil,
  filtros,
  setFiltros,
  productosOriginales,
}) {
  const [productosFiltrados, setProductosFiltrados] = useState([]);

  const validarPrecio = () => {
    const min = Number(filtros.precio.min);
    const max = Number(filtros.precio.max);
    if (isNaN(min) || isNaN(max)) return false;
    if (min < 0 || max < 0) return false;
    if (min > max) return false;
    return true;
  };

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

    if (validarPrecio()) {
      const min = Number(filtros.precio.min);
      const max = Number(filtros.precio.max);
      filtrados = filtrados.filter((p) => p.precio >= min && p.precio <= max);
    }

    setProductosFiltrados(filtrados);
  }, [filtros, productosOriginales]);

  const onReset = () => {
    setFiltros({
      estado: { nuevo: false, usado: false },
      precio: { min: "", max: "" },
    });
  };

  return (
    <>
      <button
        className="flex lg:hidden items-center gap-1 px-3 py-2 rounded-md border text-sm font-medium bg-white shadow hover:bg-gray-100 fixed top-14 right-4 z-[1100]"
        onClick={() => setMostrarEnMovil(true)}
        aria-label="Abrir filtros"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M3 12h18M3 20h18" />
        </svg>
        Filtros
      </button>

      <aside
        className={`${
          mostrarEnMovil ? "fixed top-[80px] right-0 bottom-0 w-72 z-[1200]" : "hidden lg:block w-64"
        } bg-white border-l border-gray-200 shadow px-4 py-4 overflow-y-auto`}
        aria-label="Filtros"
        style={{ height: mostrarEnMovil ? "calc(100vh - 80px)" : "auto" }}
      >
        <FiltrosContenido filtros={filtros} setFiltros={setFiltros} onReset={onReset} productosFiltrados={productosFiltrados} setMostrarEnMovil={setMostrarEnMovil} />
      </aside>
    </>
  );
}

function FiltrosContenido({ filtros, setFiltros, onReset, productosFiltrados, setMostrarEnMovil }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-2">Estado</h3>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filtros.estado.nuevo}
            onChange={() =>
              setFiltros((f) => ({
                ...f,
                estado: { ...f.estado, nuevo: !f.estado.nuevo },
              }))
            }
            aria-checked={filtros.estado.nuevo}
            aria-label="Filtro estado nuevo"
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
                estado: { ...f.estado, usado: !f.estado.usado },
              }))
            }
            aria-checked={filtros.estado.usado}
            aria-label="Filtro estado usado"
          />
          Usado
        </label>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Precio</h3>
        <div className="flex gap-2">
          <input
            type="number"
            min={0}
            placeholder="Mín"
            className="border rounded px-2 py-1 w-1/2"
            value={filtros.precio.min}
            onChange={(e) =>
              setFiltros((f) => ({
                ...f,
                precio: { ...f.precio, min: e.target.value },
              }))
            }
            aria-label="Precio mínimo"
          />
          <input
            type="number"
            min={0}
            placeholder="Máx"
            className="border rounded px-2 py-1 w-1/2"
            value={filtros.precio.max}
            onChange={(e) =>
              setFiltros((f) => ({
                ...f,
                precio: { ...f.precio, max: e.target.value },
              }))
            }
            aria-label="Precio máximo"
          />
        </div>
      </div>

      <button onClick={onReset} className="text-sm text-blue-600 underline" aria-label="Restablecer filtros">
        Restablecer filtros
      </button>

      <p className="mt-4 text-sm text-gray-700">
        {productosFiltrados.length === 0
          ? "No hay productos que coincidan con los filtros."
          : `Mostrando ${productosFiltrados.length} producto${productosFiltrados.length > 1 ? "s" : ""}`}
      </p>

      {setMostrarEnMovil && (
        <button
          onClick={() => setMostrarEnMovil(false)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded w-full"
          aria-label="Cerrar filtros móvil"
        >
          Cerrar filtros
        </button>
      )}
    </div>
  );
}

export default SidebarFiltros;
