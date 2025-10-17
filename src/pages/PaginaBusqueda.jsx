import React, { useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import TarjetaProducto from "../components/TarjetaProducto";
import SidebarCategorias from "../components/SidebarCategorias";
import SidebarFiltros from "../components/SidebarFiltros";
import FiltroDrawer from "../components/FiltroDrawer";
import BotonFiltro from "../components/BotonFiltro";
import { useProducts } from "../hooks/useProducts";

function PaginaBusqueda() {
  const location = useLocation();
  const { products: productosActivos, loading } = useProducts();

  const [filtros, setFiltros] = useState({
    precio: { min: "", max: "" },
    estado: { nuevo: false, usado: false },
  });

  const [filtrosVisible, setFiltrosVisible] = useState(false);
  const [mostrarCategorias, setMostrarCategorias] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const queryOriginal = queryParams.get("q") || "";

  // Filtra por nombre o empresa, tolerando errores de escritura
  const productosFiltrados = useMemo(
    () =>
      (productosActivos || []).filter((prod) => {
        const nombreNorm = normalizarTexto(prod.nombre);
        const empresaNorm = normalizarTexto(prod.empresa || "");

        // Checa cada palabra del query
        const palabrasQuery = queryNorm.split(" ").filter(Boolean);
        // Si alguna palabra es similar al nombre o empresa, lo incluye
        return (
          palabrasQuery.some(
            (palabra) =>
              esSimilar(nombreNorm, palabra) || esSimilar(empresaNorm, palabra)
          ) ||
          esSimilar(nombreNorm, queryNorm) ||
          esSimilar(empresaNorm, queryNorm)
        );
      }),
    [productosActivos, queryNorm]
  );

  // Aplica filtros extra
  const resultadosFiltrados = useMemo(
    () =>
      productosFiltrados.filter((p) => {
        const cumpleMin =
          filtros.precio.min === "" || p.precio >= Number(filtros.precio.min);
        const cumpleMax =
          filtros.precio.max === "" || p.precio <= Number(filtros.precio.max);
        const cumpleEstado =
          (!filtros.estado.nuevo && !filtros.estado.usado) ||
          (filtros.estado.nuevo && p.estado === "Nuevo") ||
          (filtros.estado.usado && p.estado === "Usado");
        return cumpleMin && cumpleMax && cumpleEstado;
      }),
    [productosFiltrados, filtros]
  );

  const handleResetFiltros = () => {
    setFiltros({
      precio: { min: "", max: "" },
      estado: { nuevo: false, usado: false },
    });
  };

  return (
    <div
      className="flex flex-col xl:flex-row min-h-screen bg-white dark:bg-gray-900 pt-0"
      style={{ paddingTop: "var(--content-offset, 100px)" }}
    >
      <aside className="hidden xl:block w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 sticky h-screen overflow-y-auto">
        <SidebarCategorias
          categoriaActiva={null}
          setMostrarEnMovil={setMostrarCategorias}
        />
      </aside>

      <main className="flex-1 p-4">
        <div className="flex justify-between items-center mb-4 px-2 xl:hidden">
          <button
            onClick={() => setMostrarCategorias(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 dark:bg-slate-800 dark:text-blue-300 rounded-full text-sm font-medium"
          >
            📂 Categorías
          </button>
          <BotonFiltro onClick={() => setFiltrosVisible(true)} />
        </div>

        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
          Resultados de búsqueda
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700"></div>
          </div>
        ) : resultadosFiltrados.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">
            No se encontraron productos relacionados con{" "}
            <span className="font-bold">{queryOriginal}</span>.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-0">
            {resultadosFiltrados.map((producto) => (
              <TarjetaProducto key={producto.id} producto={producto} />
            ))}
          </div>
        )}
      </main>

      <aside className="hidden xl:block w-64 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 sticky h-screen overflow-y-auto">
        <SidebarFiltros
          filtros={filtros}
          setFiltros={setFiltros}
          productosOriginales={productosFiltrados}
        />
      </aside>

      {mostrarCategorias && (
        <SidebarCategorias
          categoriaActiva={null}
          mostrarEnMovil={mostrarCategorias}
          setMostrarEnMovil={setMostrarCategorias}
        />
      )}

      <div className="xl:hidden">
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
