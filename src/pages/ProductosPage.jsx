import React, { useState, useMemo, useEffect } from "react";
import { FaThList } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import SidebarCategorias from "../components/SidebarCategorias";
import FiltroDrawerNuevo from "../components/FiltroDrawerNuevo";
import BotonFiltro from "../components/BotonFiltro";
import TarjetaProducto from "../components/TarjetaProducto";
import { useCategories, useProductsByCategory } from "../hooks/useProducts";
import { normalizar } from "../utils/normalizarCategoria";
import "../styles/productosGrid.css";
import "../styles/ModernButtons.css";

function ProductosPage() {
  const { categoria = "Todos" } = useParams();
  const navigate = useNavigate();

  // Get categories and products from database
  const { categories, loading: categoriesLoading } = useCategories();
  // Normalizar para comparación case-insensitive
  const categoriaLower = (categoria || "").toLowerCase();
  const categoryId = categoriaLower !== "todos" && categoria ? categoria : "";
  const { products, loading: productsLoading } =
    useProductsByCategory(categoryId);

  const [filtros, setFiltros] = useState({
    precio: { min: 0, max: 1000000 },
    estado: {
      nuevo: false,
      usado: false,
      usadoComoNuevo: false,
      reacondicionado: false,
      reparado: false,
    },
  });

  const [brandFilter, setBrandFilter] = useState({ norm: "", display: "" });
  const [filtrosVisible, setFiltrosVisible] = useState(false);
  const [mostrarCategorias, setMostrarCategorias] = useState(false);
  const [categoriaActiva, setCategoriaActiva] = useState("Todos");
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

  // Detectar scroll para animar botones
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const threshold = 50; // Umbral más bajo para activar la animación más rápido
      setIsScrolled(scrollY > threshold);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!categoria || categoria === "todos") {
      setCategoriaActiva("Todos");
    } else {
      const encontrada = categories.find(
        (cat) => normalizar(cat.ruta) === normalizar(categoria)
      );
      setCategoriaActiva(encontrada ? encontrada.nombre : "Todos");
    }
  }, [categoria, categories]);

  const productosOriginales = useMemo(() => {
    if (!products || products.length === 0) {
      return [];
    }

    // Si es "Todos" o la categoría es vacía, devolver todos los productos sin filtrar
    const categoriaLower = (categoria || "").toLowerCase();
    if (
      categoriaActiva === "Todos" ||
      !categoria ||
      categoriaLower === "todos"
    ) {
      return products;
    }

    // Para categorías específicas, filtrar por categoría
    return products.filter((p) => {
      const categoriaProducto = p.categoria || p.categoriaId || "";
      // Comparar con categoriaActiva o con el parámetro categoria
      return (
        categoriaProducto === categoriaActiva || categoriaProducto === categoria
      );
    });
  }, [products, categoriaActiva, categoria]);

  const productosFiltrados = useMemo(() => {
    if (!productosOriginales || productosOriginales.length === 0) {
      return [];
    }

    const filtered = productosOriginales.filter((p) => {
      // Validar precio correctamente
      const precio = Number(p.precio);
      const precioValido = Number.isFinite(precio) && precio > 0 ? precio : 0;

      // Solo filtrar por precio si el producto tiene un precio válido
      const cumpleMin =
        precioValido === 0 || precioValido >= (filtros.precio.min || 0);
      const cumpleMax =
        precioValido === 0 || precioValido <= (filtros.precio.max || 1000000);

      // Validar estado - si ninguno está seleccionado, mostrar todos
      const cumpleEstado =
        (!filtros.estado.nuevo &&
          !filtros.estado.usado &&
          !filtros.estado.usadoComoNuevo &&
          !filtros.estado.reacondicionado &&
          !filtros.estado.reparado) ||
        (filtros.estado.nuevo && p.estado === "Nuevo") ||
        (filtros.estado.usado && p.estado === "Usado") ||
        (filtros.estado.usadoComoNuevo && p.estado === "Usado como nuevo") ||
        (filtros.estado.reacondicionado && p.estado === "Reacondicionado") ||
        (filtros.estado.reparado && p.estado === "Reparado");

      // Validar empresa
      const prodEmpresaNorm =
        p.empresaNorm || (p.empresa || "").toString().trim().toLowerCase();
      const cumpleEmpresa =
        !brandFilter.norm || prodEmpresaNorm === brandFilter.norm;

      return cumpleMin && cumpleMax && cumpleEstado && cumpleEmpresa;
    });

    return filtered;
  }, [productosOriginales, filtros, brandFilter]);

  const handleCategoriaChange = (nombre, ruta) => {
    navigate(`/productos/${ruta}`);
    setFiltrosVisible(false);
    setMostrarCategorias(false);
    setBrandFilter({ norm: "", display: "" });
  };

  const handleResetFiltros = () => {
    setFiltros({
      precio: { min: 0, max: 1000000 },
      estado: {
        nuevo: false,
        usado: false,
        usadoComoNuevo: false,
        reacondicionado: false,
        reparado: false,
      },
    });
    setBrandFilter({ norm: "", display: "" });
  };

  // Marcas fijas: PlayStation, Xbox, Nintendo
  const logosEmpresa = [
    {
      nombre: "PlayStation",
      norm: "playstation",
      imagen: "/logos/PlayStation_logo.svg.png",
    },
    { nombre: "Xbox", norm: "xbox", imagen: "/logos/xbox-logo.png" },
    {
      nombre: "Nintendo",
      norm: "nintendo",
      imagen: "/logos/nintendo-logo.png",
    },
  ];

  // Loading state (sin animación)
  const isLoading = categoriesLoading || productsLoading;

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
          {/* Botones categorías / filtros - barra compacta móvil */}
          <div
            className={`category-toolbar sticky top-0 flex justify-between items-center px-3 sm:px-4 py-1 z-[850] transition-all duration-300 ease-in-out ${
              isScrolled
                ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-md"
                : ""
            }`}
          >
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setMostrarCategorias(true);
                  setFiltrosVisible(false);
                }}
                className={`modern-btn modern-btn-categories`}
                aria-label="Abrir categorías"
              >
                <FaThList className="modern-icon" />
                <span className="font-semibold tracking-wide">Categorías</span>
              </button>

              {/* Título a la derecha del botón */}
              <h1 className="text-sm sm:text-base md:text-lg xl:text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight leading-tight max-w-[52vw] sm:max-w-none overflow-hidden text-ellipsis whitespace-nowrap">
                {categoriaActiva === "Todos"
                  ? "Todos los productos"
                  : categoriaActiva}
              </h1>
            </div>

            <BotonFiltro
              onClick={() => {
                setFiltrosVisible(true);
                setMostrarCategorias(false);
              }}
              className=""
            />
          </div>

          {/* Descripción debajo si no es "Todos" */}
          {categoriaActiva !== "Todos" && (
            <div className="px-4 sm:px-6 mb-2">
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
                Encuentra lo mejor en{" "}
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {categoriaActiva}
                </span>
              </p>
            </div>
          )}

          {/* Circulitos de marcas debajo */}
          <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 px-4 sm:px-6 mb-4 justify-start">
            {logosEmpresa.map((empresa) => {
              const isActive = brandFilter.norm === empresa.norm;
              return (
                <button
                  key={empresa.norm}
                  onClick={() =>
                    setBrandFilter({
                      norm: empresa.norm,
                      display: empresa.nombre,
                    })
                  }
                  className={`group relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-white dark:bg-gray-800 border-2 sm:border-4 flex items-center justify-center shadow-xl hover:scale-110 transition-all duration-300 ${
                    isActive
                      ? "border-blue-700 ring-2 sm:ring-4 ring-offset-1 sm:ring-offset-2 ring-blue-500 animate-spin-slow"
                      : "border-gray-300 hover:border-blue-400"
                  }`}
                  title={empresa.nombre}
                >
                  <img
                    src={empresa.imagen}
                    alt={empresa.nombre}
                    className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 object-contain z-10"
                  />
                  {isActive && (
                    <span className="absolute inset-0 rounded-full border-4 border-blue-500 animate-pulse z-0"></span>
                  )}
                </button>
              );
            })}

            <button
              onClick={() => setBrandFilter({ norm: "", display: "" })}
              type="button"
              aria-label="Quitar filtro"
              className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full border-2 sm:border-4 flex items-center justify-center bg-gradient-to-br from-red-100 to-red-300 border-red-600 shadow-lg hover:scale-110 transition-all duration-300"
              title="Quitar filtro"
            >
              <div className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-red-600 shadow-sm">
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M6 6l12 12M6 18L18 6" />
                </svg>
              </div>
            </button>
          </div>

          {isLoading ? null : productosFiltrados.length === 0 ? (
            <p className="text-center text-gray-600 dark:text-gray-400 mt-10">
              No hay productos que coincidan con tus filtros.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 lg:gap-4 px-2 sm:px-4 xl:px-6">
              {productosFiltrados.map((producto) => (
                <TarjetaProducto key={producto.id} producto={producto} />
              ))}
            </div>
          )}
        </main>
      </div>

      <SidebarCategorias
        categoriaActiva={categoriaActiva}
        mostrarEnMovil={mostrarCategorias}
        setMostrarEnMovil={setMostrarCategorias}
      />

      <FiltroDrawerNuevo
        filtros={filtros}
        setFiltros={setFiltros}
        onReset={() =>
          setFiltros({ estado: {}, precio: { min: 0, max: 1000000 } })
        }
        visible={filtrosVisible}
        onClose={() => setFiltrosVisible(false)}
        productosOriginales={products}
      />
    </div>
  );
}

export default ProductosPage;
