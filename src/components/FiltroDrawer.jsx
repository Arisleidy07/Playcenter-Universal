import React from "react";

function FiltroDrawer({
  filtros,
  setFiltros,
  onReset,
  visible,
  onClose
}) {
  return (
    <div
      className={`fixed sm:static top-0 right-0 h-full w-64 bg-white border-l shadow-lg z-50 transform transition-transform duration-300 ${
        visible ? "translate-x-0" : "translate-x-full sm:translate-x-0"
      }`}
    >
      {/* Encabezado solo en móvil */}
      <div className="sm:hidden flex justify-between items-center p-4 border-b">
        <h2 className="font-semibold">Filtros</h2>
        <button onClick={onClose}>✕</button>
      </div>

      {/* Contenido */}
      <div className="p-4 flex flex-col gap-4">
        <div>
          <h3 className="font-semibold mb-2">Estado</h3>
          <label className="flex items-center gap-2">
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

        <div>
          <h3 className="font-semibold mb-2">Precio</h3>
          <div className="flex gap-2">
            <input
              type="number"
              value={filtros.precio.min}
              onChange={(e) =>
                setFiltros((f) => ({
                  ...f,
                  precio: { ...f.precio, min: e.target.value }
                }))
              }
              placeholder="Mín"
              className="border rounded p-1 w-1/2"
            />
            <input
              type="number"
              value={filtros.precio.max}
              onChange={(e) =>
                setFiltros((f) => ({
                  ...f,
                  precio: { ...f.precio, max: e.target.value }
                }))
              }
              placeholder="Máx"
              className="border rounded p-1 w-1/2"
            />
          </div>
        </div>

        <button
          onClick={onReset}
          className="mt-2 bg-gray-100 hover:bg-gray-200 rounded p-2 text-sm"
        >
          Restablecer filtros
        </button>
      </div>
    </div>
  );
}

export default FiltroDrawer;
