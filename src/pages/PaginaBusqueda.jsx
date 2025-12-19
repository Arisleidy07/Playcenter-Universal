import React, { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import TarjetaProducto from "../components/TarjetaProducto";
import SidebarCategorias from "../components/SidebarCategorias";
import SidebarFiltros from "../components/SidebarFiltros";
import FiltroDrawerNuevo from "../components/FiltroDrawerNuevo";
import BotonFiltro from "../components/BotonFiltro";
import { useProducts } from "../hooks/useProducts";
import "../styles/productosGrid.css";
import "../styles/ModernButtons.css";

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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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

  // Detectar scroll para animar botones
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const threshold = 50;
      setIsScrolled(scrollY > threshold);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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
        paddingTop: "10px",
        transition: "padding-top 0.2s",
        boxSizing: "border-box",
      }}
    >
      <div className="flex-1 flex flex-col w-full" style={{ margin: 0 }}>
        <main className="flex-1 p-0 relative pb-32">
          {/* Botones flotando solos */}
          <div
            className={`flex justify-between items-start px-4 sm:px-6 py-3 transition-all duration-500 ease-in-out ${
              isScrolled
                ? "sticky top-0 z-[850] bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-lg"
                : "relative z-[850]"
            }`}
          >
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMostrarCategorias(true)}
                className={`modern-btn modern-btn-categories ${
                  isScrolled ? "floating" : ""
                }`}
                aria-label="Abrir categorías"
              >
                {/* Ícono delgado y bonito de categorías */}
                <svg
                  className="modern-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                >
                  <path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span className="font-semibold tracking-wide">Categorías</span>
              </button>

              {/* Título a la derecha del botón */}
              <h1 className="text-xl sm:text-2xl md:text-3xl xl:text-4xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight leading-tight">
                Resultados de búsqueda
              </h1>
            </div>

            <BotonFiltro
              onClick={() => setFiltrosVisible(true)}
              className={isScrolled ? "floating" : ""}
            />
          </div>

          {/* Spacer para compensar cuando los botones están fixed */}
          {isScrolled && (
            <div
              style={{ height: "80px" }} // Altura ajustada para botones modernos
            />
          )}

          {/* Información de búsqueda debajo */}
          {queryOriginal && (
            <div className="px-4 sm:px-6 mb-4">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
                  Buscaste:{" "}
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {terminoBusqueda}
                  </span>
                </p>
                {categoriaFiltro && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                    📂 {categoriaFiltro}
                  </span>
                )}
              </div>
              {resultadosFiltrados.length > 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {resultadosFiltrados.length}{" "}
                  {resultadosFiltrados.length === 1
                    ? "producto encontrado"
                    : "productos encontrados"}
                </p>
              )}
            </div>
          )}

          {loading ? null : resultadosFiltrados.length === 0 ? (
            <p className="text-center text-gray-600 dark:text-gray-400 mt-10">
              No se encontraron productos relacionados con{" "}
              <span className="font-bold">{queryOriginal}</span>.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 lg:gap-4 px-2 sm:px-4 xl:px-6">
              {resultadosFiltrados.map((producto) => (
                <TarjetaProducto key={producto.id} producto={producto} />
              ))}
            </div>
          )}
        </main>
      </div>

      {mostrarCategorias && (
        <SidebarCategorias
          categoriaActiva={null}
          mostrarEnMovil={mostrarCategorias}
          setMostrarEnMovil={setMostrarCategorias}
          className="bg-transparent border-none shadow-none"
        />
      )}

      <FiltroDrawerNuevo
        filtros={filtros}
        setFiltros={setFiltros}
        onReset={() =>
          setFiltros({ estado: {}, precio: { min: 0, max: 1000000 } })
        }
        visible={filtrosVisible}
        onClose={() => setFiltrosVisible(false)}
        productosOriginales={productosActivos}
      />
    </div>
  );
}

export default PaginaBusqueda;
