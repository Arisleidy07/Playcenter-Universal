import React from "react";

function FiltroDrawer({ filtros, setFiltros, onReset, visible, onClose }) {
  return (
    <div
      className={`fixed inset-0 z-50 flex ${
        visible ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {/* Fondo oscuro */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 transition-opacity ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      ></div>

      {/* Panel lateral */}
      <div
        className={`relative bg-white w-64 max-w-full h-full shadow-lg transform transition-transform duration-300 ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="font-semibold text-lg">Filtros</h2>
          <button
            onClick={onClose}
            aria-label="Cerrar filtros"
            className="text-2xl font-bold text-gray-600 hover:text-gray-900"
          >
            ×
          </button>
        </div>

        <div className="p-4 flex flex-col gap-4 overflow-y-auto h-[calc(100%-56px)]">
          {/* Estado */}
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
              />
              Usado
            </label>
          </div>

          {/* Precio */}
          <div>
            <h3 className="font-semibold mb-2">Precio</h3>
            <div className="flex gap-2">
              <input
                type="number"
                value={filtros.precio.min}
                onChange={(e) =>
                  setFiltros((f) => ({
                    ...f,
                    precio: { ...f.precio, min: e.target.value },
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
                    precio: { ...f.precio, max: e.target.value },
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
    </div>
  );
}

export default FiltroDrawer;
