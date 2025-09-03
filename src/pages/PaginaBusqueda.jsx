import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import productosAll from "../data/productosAll.js";
import { normalizarTexto } from "../utils/normalizarTexto";
import TarjetaProducto from "../components/TarjetaProducto";
import SidebarCategorias from "../components/SidebarCategorias";
import SidebarFiltros from "../components/SidebarFiltros";
import FiltroDrawer from "../components/FiltroDrawer";
import BotonFiltro from "../components/BotonFiltro";

// Levenshtein distance function
function distanciaLevenshtein(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  let matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// ¿Son similares? (máximo 2 letras distintas)
function esSimilar(a, b) {
  if (!a || !b) return false;
  const dist = distanciaLevenshtein(a, b);
  return dist <= 2 || a.includes(b) || b.includes(a);
}

const TOPBAR_HEIGHT = 56; // Ajusta según tu Top Bar

function PaginaBusqueda() {
  const location = useLocation();

  const [filtros, setFiltros] = useState({
    precio: { min: "", max: "" },
    estado: { nuevo: false, usado: false },
  });

  const [filtrosVisible, setFiltrosVisible] = useState(false);
  const [mostrarCategorias, setMostrarCategorias] = useState(false);

  const todosLosProductos = productosAll.flatMap((cat) => cat.productos);

  const queryParams = new URLSearchParams(location.search);
  const queryOriginal = queryParams.get("q") || "";
  const queryNorm = normalizarTexto(queryOriginal);

  // Filtra por nombre o empresa, tolerando errores de escritura
  const productosFiltrados = todosLosProductos.filter((prod) => {
    const nombreNorm = normalizarTexto(prod.nombre);
    const empresaNorm = normalizarTexto(prod.empresa || "");

    // Checa cada palabra del query
    const palabrasQuery = queryNorm.split(" ").filter(Boolean);
    // Si alguna palabra es similar al nombre o empresa, lo incluye
    return palabrasQuery.some((palabra) =>
      esSimilar(nombreNorm, palabra) ||
      esSimilar(empresaNorm, palabra)
    ) ||
    esSimilar(nombreNorm, queryNorm) ||
    esSimilar(empresaNorm, queryNorm);
  });

  // Aplica filtros extra
  const resultadosFiltrados = productosFiltrados.filter((p) => {
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
    <div
      className="flex flex-col lg:flex-row min-h-screen bg-white pt-0"
      style={{ paddingTop: TOPBAR_HEIGHT }}
    >
      <aside className="hidden lg:block w-64 border-r border-gray-200 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto">
        <SidebarCategorias
          categoriaActiva={null}
          setMostrarEnMovil={setMostrarCategorias}
        />
      </aside>

      <main className="flex-1 p-4 overflow-y-auto relative">
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
            No se encontraron productos relacionados con <span className="font-bold">{queryOriginal}</span>.
          </p>
        ) : (
          <div className="productos-grid">
            {resultadosFiltrados.map((producto) => (
              <TarjetaProducto key={producto.id} producto={producto} />
            ))}
          </div>
        )}
      </main>

      <aside className="hidden lg:block w-64 border-l border-gray-200 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto px-4 py-4">
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