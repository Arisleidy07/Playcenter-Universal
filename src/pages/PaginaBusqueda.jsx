import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import productosAll from "../data/productosAll";
import { normalizarTexto } from "../utils/normalizarTexto";
import TarjetaProducto from "../components/TarjetaProducto";
import SidebarCategorias from "../components/SidebarCategorias";
import SidebarFiltros from "../components/SidebarFiltros";
import FiltroDrawer from "../components/FiltroDrawer";
import BotonFiltro from "../components/BotonFiltro";

function PaginaBusqueda() {
  const location = useLocation();

  const [filtros, setFiltros] = useState({
    precio: { min: "", max: "" },
    estado: { nuevo: false, usado: false },
  });

  const [filtrosVisible, setFiltrosVisible] = useState(false);
  const [mostrarCategorias, setMostrarCategorias] = useState(false);

  // TODOS los productos
  const todosLosProductos = productosAll.flatMap((cat) => cat.productos);

  // Búsqueda
  const queryParams = new URLSearchParams(location.search);
  const queryOriginal = queryParams.get("q") || "";
  const query = normalizarTexto(queryOriginal);
  const palabras = query.split(" ").filter(Boolean);

  // Resultados sin filtros
  const resultadosOriginales = todosLosProductos.filter((prod) => {
    const texto = normalizarTexto(`${prod.nombre} ${prod.descripcion}`);
    return palabras.every((palabra) => texto.includes(palabra));
  });

  // Resultados con filtros
  const resultadosFiltrados = resultadosOriginales.filter((p) => {
    const cumpleMin =
      filtros.precio.min === "" || p.precio >= Number(filtros.precio.min);
    const cumpleMax =
      filtros.precio.max === "" || p.precio <= Number(filtros.precio.max);
    const cumpleEstado =
      (!filtros.estado.nuevo && !filtros.estado.usado) ||
      (filtros.estado.nuevo && p.estado === "Nuevo") ||
      (filtros.estado.usado && p.estado === "Usado");
    return cumpleMin && cumpleMax && cumpleEstado;
  });

  const handleResetFiltros = () => {
    setFiltros({
      precio: { min: "", max: "" },
      estado: { nuevo: false, usado: false },
    });
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white pt-0">
      {/* Sidebar categorías escritorio */}
      <aside className="hidden lg:block w-64 border-r border-gray-200 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto">
        <SidebarCategorias
          categoriaActiva={null}
          setMostrarEnMovil={setMostrarCategorias}
        />
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-4 overflow-y-auto relative">
        {/* Botones Categorías y Filtros en móvil y tablet */}
        <div className="flex justify-between items-center mb-4 px-2 lg:hidden">
          <button
            onClick={() => setMostrarCategorias(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
          >
            📂 Categorías
          </button>
          <BotonFiltro onClick={() => setFiltrosVisible(true)} />
        </div>

        <h2 className="text-2xl font-bold mb-4 text-blue-800">
          Resultados de búsqueda
        </h2>

        {resultadosFiltrados.length === 0 ? (
          <p className="text-gray-600">
            No se encontraron productos relacionados.
          </p>
        ) : (
          <div className="productos-grid">
            {resultadosFiltrados.map((producto) => (
              <TarjetaProducto key={producto.id} producto={producto} />
            ))}
          </div>
        )}
      </main>

      {/* Sidebar filtros escritorio */}
      <aside className="hidden lg:block w-64 border-l border-gray-200 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto px-4 py-4">
        <SidebarFiltros
          filtros={filtros}
          setFiltros={setFiltros}
          productosOriginales={resultadosOriginales}
        />
      </aside>

      {/* Sidebar categorías móvil */}
      {mostrarCategorias && (
        <SidebarCategorias
          categoriaActiva={null}
          mostrarEnMovil={mostrarCategorias}
          setMostrarEnMovil={setMostrarCategorias}
        />
      )}

      {/* Drawer filtros móvil */}
      <div className="lg:hidden">
        <FiltroDrawer
          filtros={filtros}
          setFiltros={setFiltros}
          visible={filtrosVisible}
          onClose={() => setFiltrosVisible(false)}
          onReset={handleResetFiltros}
        />
      </div>
    </div>
  );
}

export default PaginaBusqueda;
