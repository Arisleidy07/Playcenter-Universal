import React, { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import TarjetaProducto from "../components/TarjetaProducto";
import SidebarCategorias from "../components/SidebarCategorias";
import SidebarFiltros from "../components/SidebarFiltros";
import FiltroDrawer from "../components/FiltroDrawer";
import BotonFiltro from "../components/BotonFiltro";
import { useProducts } from "../hooks/useProducts";
import "../styles/productosGrid.css";

// Función para normalizar texto (quitar acentos, minúsculas, etc.)
const normalizarTexto = (texto) => {
  if (!texto) return "";
  return texto
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};

// Buscar en producto de forma MUY PERMISIVA (1 letra funciona)
const buscarEnProducto = (producto, terminoOriginal) => {
  if (!terminoOriginal) return true;

  const terminoNorm = normalizarTexto(terminoOriginal);
  const palabrasBusqueda = terminoNorm.split(" ").filter(Boolean);

  const nombreNorm = normalizarTexto(producto.nombre || "");
  const descripcionNorm = normalizarTexto(producto.descripcion || "");
  const categoriaNorm = normalizarTexto(producto.categoria || "");
  const marcaNorm = normalizarTexto(producto.empresa || producto.marca || "");

  // PRIORIDAD 1: Coincidencia exacta completa
  if (nombreNorm === terminoNorm) return true;

  // PRIORIDAD 2: El nombre comienza con el término
  if (nombreNorm.startsWith(terminoNorm)) return true;

  // PRIORIDAD 3: El nombre contiene el término completo
  if (nombreNorm.includes(terminoNorm)) return true;

  // PRIORIDAD 4: Marca contiene el término completo
  if (marcaNorm.includes(terminoNorm)) return true;

  // PRIORIDAD 5: Categoría contiene el término completo
  if (categoriaNorm.includes(terminoNorm)) return true;

  // PRIORIDAD 6: Descripción contiene el término completo
  if (descripcionNorm.includes(terminoNorm)) return true;

  // PRIORIDAD 7: Buscar palabra por palabra (MUY PERMISIVO)
  let coincidencias = 0;

  palabrasBusqueda.forEach((palabra) => {
    if (nombreNorm.includes(palabra)) {
      coincidencias++;
    }
    if (marcaNorm.includes(palabra)) {
      coincidencias++;
    }
    if (categoriaNorm.includes(palabra)) {
      coincidencias++;
    }
    if (descripcionNorm.includes(palabra)) {
      coincidencias++;
    }
  });

  // MUY PERMISIVO: Si hay al menos 1 coincidencia, mostrar
  return coincidencias > 0;
};

function PaginaBusqueda() {
  const location = useLocation();
  const { products: productosActivos, loading } = useProducts();

  const [filtros, setFiltros] = useState({
    precio: { min: 0, max: 10000 },
    estado: { nuevo: false, usado: false },
  });

  const [filtrosVisible, setFiltrosVisible] = useState(false);
  const [mostrarCategorias, setMostrarCategorias] = useState(false);
  const [topbarHeight, setTopbarHeight] = useState(0);

  // SOLO usa la altura de la TopBar, NO sumes el top del header
  useEffect(() => {
    function measure() {
      const el = document.querySelector(
        ".shadow-md.px-4.py-2.flex.justify-between.items-center"
      );
      const h = el ? Math.ceil(el.getBoundingClientRect().height) : 0;
      setTopbarHeight(h);
      document.documentElement.style.setProperty("--topbar-height", `${h}px`);
    }
    measure();
    window.addEventListener("resize", measure);
    const observer = new MutationObserver(measure);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });
    return () => {
      window.removeEventListener("resize", measure);
      observer.disconnect();
    };
  }, []);

  const queryParams = new URLSearchParams(location.search);
  const queryOriginal = queryParams.get("q") || "";
  const queryNorm = normalizarTexto(queryOriginal);

  // Detectar si es búsqueda de categoría (formato: "término en Categoría")
  const esCategoria = queryOriginal.includes(" en ");
  let terminoBusqueda = queryOriginal;
  let categoriaFiltro = null;

  if (esCategoria) {
    const partes = queryOriginal.split(" en ");
    terminoBusqueda = partes[0].trim();
    categoriaFiltro = partes[1].trim();
  }

  // Filtra productos usando búsqueda ESTRICTA y PRECISA
  const productosFiltrados = useMemo(
    () =>
      (productosActivos || []).filter((prod) => {
        // Primero buscar por el término
        const coincideTermino = buscarEnProducto(prod, terminoBusqueda);

        // Si hay filtro de categoría, aplicarlo también
        if (categoriaFiltro) {
          const categoriaNorm = normalizarTexto(prod.categoria || "");
          const filtroNorm = normalizarTexto(categoriaFiltro);
          return coincideTermino && categoriaNorm === filtroNorm;
        }

        return coincideTermino;
      }),
    [productosActivos, terminoBusqueda, categoriaFiltro]
  );

  // Aplica filtros extra (IGUAL que ProductosPage)
  const resultadosFiltrados = useMemo(
    () =>
      productosFiltrados.filter((p) => {
        const cumpleMin = p.precio >= filtros.precio.min;
        const cumpleMax = p.precio <= filtros.precio.max;
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
      precio: { min: 0, max: 10000 },
      estado: { nuevo: false, usado: false },
    });
  };

  return (
    <div
      className="flex flex-col min-h-screen bg-white dark:bg-gray-900 pb-[96px] transition-colors duration-300"
      style={{
        position: "relative",
        margin: 0,
        paddingTop: "180px",
        transition: "padding-top 0.2s",
        boxSizing: "border-box",
      }}
    >
      <div
        className="flex-1 flex flex-col xl:grid xl:grid-cols-[auto_1fr_auto] w-full"
        style={{ margin: 0 }}
      >
        <SidebarCategorias
          categoriaActiva={null}
          setMostrarEnMovil={setMostrarCategorias}
          className="bg-transparent border-none shadow-none xl:row-span-2"
        />

        <main className="flex-1 p-0 xl:p-4 relative pb-32">
          <div
            className="flex justify-between items-center px-3 py-2 xl:hidden bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky transition-colors duration-300"
            style={{
              top: "var(--content-offset, 100px)",
              zIndex: 40,
              marginTop: 0,
              paddingTop: 0,
            }}
          >
            <button
              onClick={() => setMostrarCategorias(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white dark:from-indigo-600 dark:to-purple-700 dark:text-white rounded-full text-sm font-bold shadow-lg hover:shadow-xl hover:from-indigo-600 hover:to-purple-700 dark:hover:from-indigo-700 dark:hover:to-purple-800 transition-all duration-300 transform hover:scale-105 active:scale-95 border-2 border-indigo-600 dark:border-indigo-500"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              </svg>
              <span className="font-extrabold tracking-wide">Categorías</span>
            </button>
            <BotonFiltro onClick={() => setFiltrosVisible(true)} />
          </div>

          {/* TÍTULO CON MISMO ESTILO QUE ProductosPage */}
          <div className="mb-6 mt-4 px-4 xl:px-0">
            <h1 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold text-gray-900 dark:text-gray-100 mb-3 tracking-tight leading-tight">
              Resultados de búsqueda
            </h1>
            {queryOriginal && (
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
                  Buscaste:{" "}
                  <span className="font-bold text-blue-700 dark:text-blue-400">
                    {terminoBusqueda}
                  </span>
                </p>
                {categoriaFiltro && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                    📂 {categoriaFiltro}
                  </span>
                )}
              </div>
            )}
            {resultadosFiltrados.length > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {resultadosFiltrados.length}{" "}
                {resultadosFiltrados.length === 1
                  ? "producto encontrado"
                  : "productos encontrados"}
              </p>
            )}
          </div>

          {loading ? null : resultadosFiltrados.length === 0 ? (
            <p className="text-center text-gray-600 dark:text-gray-400 mt-10">
              No se encontraron productos relacionados con{" "}
              <span className="font-bold">{queryOriginal}</span>.
            </p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4 px-4 xl:px-0">
              {resultadosFiltrados.map((producto) => (
                <TarjetaProducto key={producto.id} producto={producto} />
              ))}
            </div>
          )}
        </main>

        <SidebarFiltros
          filtros={filtros}
          setFiltros={setFiltros}
          productosOriginales={productosFiltrados}
          className="bg-transparent border-none shadow-none xl:row-span-2"
        />
      </div>

      {mostrarCategorias && (
        <SidebarCategorias
          categoriaActiva={null}
          mostrarEnMovil={mostrarCategorias}
          setMostrarEnMovil={setMostrarCategorias}
          className="bg-transparent border-none shadow-none"
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
