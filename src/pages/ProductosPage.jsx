import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SidebarCategorias from "../components/SidebarCategorias";
import SidebarFiltros from "../components/SidebarFiltros";
import FiltroDrawer from "../components/FiltroDrawer";
import BotonFiltro from "../components/BotonFiltro";
import TarjetaProducto from "../components/TarjetaProducto";
import { useCategories, useProductsByCategory } from "../hooks/useProducts";
import { normalizar } from "../utils/normalizarCategoria";
import "../styles/productosGrid.css";

function ProductosPage() {
  const { categoria } = useParams();
  const navigate = useNavigate();

  // Get categories and products from database
  const { categories, loading: categoriesLoading } = useCategories();
  const categoryId = categoria && categoria !== "todos" ? categoria : "";
  const { products, loading: productsLoading } =
    useProductsByCategory(categoryId);

  const [filtros, setFiltros] = useState({
    precio: { min: 0, max: 10000 },
    estado: { nuevo: false, usado: false },
  });

  const [brandFilter, setBrandFilter] = useState({ norm: "", display: "" });
  const [filtrosVisible, setFiltrosVisible] = useState(false);
  const [mostrarCategorias, setMostrarCategorias] = useState(false);
  const [categoriaActiva, setCategoriaActiva] = useState("Todos");
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
    if (categoriaActiva === "Todos") {
      return products;
    }
    return products.filter((p) => p?.id);
  }, [products, categoriaActiva]);

  const productosFiltrados = useMemo(() => {
    return (productosOriginales || []).filter((p) => {
      const cumpleMin = p.precio >= filtros.precio.min;
      const cumpleMax = p.precio <= filtros.precio.max;
      const cumpleEstado =
        (!filtros.estado.nuevo && !filtros.estado.usado) ||
        (filtros.estado.nuevo && p.estado === "Nuevo") ||
        (filtros.estado.usado && p.estado === "Usado");

      const prodEmpresaNorm =
        p.empresaNorm || (p.empresa || "").toString().trim().toLowerCase();
      const cumpleEmpresa =
        !brandFilter.norm || prodEmpresaNorm === brandFilter.norm;

      return cumpleMin && cumpleMax && cumpleEstado && cumpleEmpresa;
    });
  }, [productosOriginales, filtros, brandFilter]);

  const handleCategoriaChange = (nombre, ruta) => {
    navigate(`/productos/${ruta}`);
    setFiltrosVisible(false);
    setMostrarCategorias(false);
    setBrandFilter({ norm: "", display: "" });
  };

  const handleResetFiltros = () => {
    setFiltros({
      precio: { min: 0, max: 10000 },
      estado: { nuevo: false, usado: false },
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
      className="flex flex-col min-h-screen bg-white pb-[96px]"
      style={{
        position: "relative",
        marginTop: 0,
        paddingTop: `${topbarHeight}px`,
        transition: "padding-top 0.2s",
        boxSizing: "border-box",
      }}
    >
      <div className="flex-1 flex flex-col xl:flex-row w-full">
        <SidebarCategorias
          categoriaActiva={categoriaActiva}
          onCategoriaClick={handleCategoriaChange}
          className="bg-transparent border-none shadow-none"
        />

        <main className="flex-1 p-0 xl:p-4 relative pb-32">
          <div className="flex justify-between items-center mb-4 px-2 xl:hidden">
            <button
              onClick={() => setMostrarCategorias(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
            >
              📂 Categorías
            </button>
            <BotonFiltro onClick={() => setFiltrosVisible(true)} />
          </div>

          <div className="px-4 xl:px-0 mb-6 animate-fadeIn">
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold text-gradient bg-gradient-to-r from-blue-700 via-purple-600 to-pink-500 text-transparent bg-clip-text drop-shadow-md">
              {categoriaActiva === "Todos"
                ? "Todos los productos"
                : categoriaActiva}
            </h1>
            {categoriaActiva !== "Todos" && (
              <p className="text-gray-500 text-base sm:text-lg mt-2">
                Encuentra lo mejor en{" "}
                <span className="font-semibold text-blue-700">
                  {categoriaActiva}
                </span>
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-4 sm:gap-5 px-4 xl:px-0 mb-10 justify-center sm:justify-start">
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
                  className={`group relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white border-4 flex items-center justify-center shadow-xl hover:scale-110 transition-all duration-300 ${
                    isActive
                      ? "border-blue-700 ring-4 ring-offset-2 ring-blue-500 animate-spin-slow"
                      : "border-gray-300 hover:border-blue-400"
                  }`}
                  title={empresa.nombre}
                >
                  <img
                    src={empresa.imagen}
                    alt={empresa.nombre}
                    className="w-8 h-8 sm:w-10 sm:h-10 object-contain z-10"
                  />
                  {isActive && (
                    <span className="absolute inset-0 rounded-full border-4 border-blue-500 animate-pulse z-0"></span>
                  )}
                </button>
              );
            })}

            <button
              onClick={() => setBrandFilter({ norm: "", display: "" })}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 flex items-center justify-center text-lg sm:text-xl font-bold bg-gradient-to-br from-red-100 to-red-300 text-red-700 border-red-600 shadow-lg hover:scale-110 transition-all duration-300"
              title="Quitar filtro"
            >
              ❌
            </button>
          </div>

          {isLoading ? null : (
            productosFiltrados.length === 0 ? (
              <p className="text-center text-gray-600 mt-10">
                No hay productos que coincidan con tus filtros.
              </p>
            ) : (
              <div className="productos-grid px-4 xl:px-0">
                {productosFiltrados.map((producto) => (
                  <TarjetaProducto key={producto.id} producto={producto} />
                ))}
              </div>
            )
          )}
        </main>

        <SidebarFiltros
          filtros={filtros}
          setFiltros={setFiltros}
          productosOriginales={productosOriginales}
          className="bg-transparent border-none shadow-none"
        />
      </div>

      {mostrarCategorias && (
        <SidebarCategorias
          categoriaActiva={categoriaActiva}
          onCategoriaClick={handleCategoriaChange}
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

export default ProductosPage;
