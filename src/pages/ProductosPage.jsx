import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SidebarCategorias from "../components/SidebarCategorias";
import SidebarFiltros from "../components/SidebarFiltros";
import FiltroDrawer from "../components/FiltroDrawer";
import BotonFiltro from "../components/BotonFiltro";
import TarjetaProducto from "../components/TarjetaProducto";
import productosAll from "../data/productosAll";
import { normalizar } from "../utils/normalizarCategoria";
import "../styles/productosGrid.css";

function ProductosPage() {
  const { categoria } = useParams();
  const navigate = useNavigate();

  const [filtros, setFiltros] = useState({
    precio: { min: "", max: "" },
    estado: { nuevo: false, usado: false },
  });

  const [filtroEmpresa, setFiltroEmpresa] = useState("");
  const [filtrosVisible, setFiltrosVisible] = useState(false);
  const [mostrarCategorias, setMostrarCategorias] = useState(false);
  const [categoriaActiva, setCategoriaActiva] = useState("Todos");

  useEffect(() => {
    if (!categoria || categoria === "todos") {
      setCategoriaActiva("Todos");
    } else {
      const encontrada = productosAll.find(
        (cat) => normalizar(cat.categoria) === normalizar(categoria)
      );
      setCategoriaActiva(encontrada ? encontrada.categoria : "Todos");
    }
  }, [categoria]);

  const productosOriginales = useMemo(() => {
    if (categoriaActiva === "Todos") {
      return productosAll.flatMap((cat) => cat.productos).filter((p) => p?.id);
    }
    const categoriaEncontrada = productosAll.find(
      (cat) => normalizar(cat.categoria) === normalizar(categoriaActiva)
    );
    return (categoriaEncontrada?.productos ?? []).filter((p) => p?.id);
  }, [categoriaActiva]);

  const productosFiltrados = useMemo(() => {
    return productosOriginales.filter((p) => {
      const cumpleMin = filtros.precio.min === "" || p.precio >= Number(filtros.precio.min);
      const cumpleMax = filtros.precio.max === "" || p.precio <= Number(filtros.precio.max);
      const cumpleEstado =
        (!filtros.estado.nuevo && !filtros.estado.usado) ||
        (filtros.estado.nuevo && p.estado === "Nuevo") ||
        (filtros.estado.usado && p.estado === "Usado");

      const cumpleEmpresa =
        !filtroEmpresa ||
        (typeof p.empresa === "string" && p.empresa === filtroEmpresa) ||
        (Array.isArray(p.empresa) && p.empresa.includes(filtroEmpresa));

      return cumpleMin && cumpleMax && cumpleEstado && cumpleEmpresa;
    });
  }, [productosOriginales, filtros, filtroEmpresa]);

  // Cambio de categoría (desktop y móvil)
  const handleCategoriaChange = (nombre, ruta) => {
    navigate(`/productos/${ruta}`);
    setFiltrosVisible(false);
    setMostrarCategorias(false);
    setFiltroEmpresa("");
  };

  const handleResetFiltros = () => {
    setFiltros({
      precio: { min: "", max: "" },
      estado: { nuevo: false, usado: false },
    });
    setFiltroEmpresa("");
  };

  const logosEmpresa = [
    { nombre: "PlayStation", imagen: "/logos/PlayStation_logo.svg.png" },
    { nombre: "Xbox", imagen: "/logos/xbox-logo.png" },
    { nombre: "Nintendo", imagen: "/logos/nintendo-logo.png" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white pt-1 pb-[96px]">
      <div className="flex-1 flex flex-col lg:flex-row w-full">
        {/* Sidebar de categorías (desktop) */}
        <SidebarCategorias
          categoriaActiva={categoriaActiva}
          onCategoriaClick={handleCategoriaChange}
          className="bg-transparent border-none shadow-none"
        />

        <main className="flex-1 p-0 lg:p-4 relative pb-32">
          {/* Botones móviles: categorías y filtros */}
          <div className="flex justify-between items-center mb-4 px-2 lg:hidden">
            <button
              onClick={() => setMostrarCategorias(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
            >
              📂 Categorías
            </button>
            <BotonFiltro onClick={() => setFiltrosVisible(true)} />
          </div>

          {/* Título animado */}
          <div className="px-4 lg:px-0 mb-6 animate-fadeIn">
            <h1 className="text-5xl lg:text-6xl font-extrabold text-gradient bg-gradient-to-r from-blue-700 via-purple-600 to-pink-500 text-transparent bg-clip-text drop-shadow-md">
              {categoriaActiva === "Todos" ? "Todos los productos" : categoriaActiva}
            </h1>
            {categoriaActiva !== "Todos" && (
              <p className="text-gray-500 text-lg mt-2">
                Encuentra lo mejor en <span className="font-semibold text-blue-700">{categoriaActiva}</span>
              </p>
            )}
          </div>

          {/* Filtro por empresa */}
          <div className="flex flex-wrap gap-5 px-4 lg:px-0 mb-10">
            {logosEmpresa.map((empresa) => (
              <button
                key={empresa.nombre}
                onClick={() => setFiltroEmpresa(empresa.nombre)}
                className={`group relative w-20 h-20 rounded-full bg-white border-4 flex items-center justify-center shadow-xl hover:scale-110 transition-all duration-300 ${
                  filtroEmpresa === empresa.nombre
                    ? "border-blue-700 ring-4 ring-offset-2 ring-blue-500 animate-spin-slow"
                    : "border-gray-300 hover:border-blue-400"
                }`}
                title={empresa.nombre}
              >
                <img
                  src={empresa.imagen}
                  alt={empresa.nombre}
                  className="w-10 h-10 object-contain z-10"
                />
                {filtroEmpresa === empresa.nombre && (
                  <span className="absolute inset-0 rounded-full border-4 border-blue-500 animate-pulse z-0"></span>
                )}
              </button>
            ))}

            <button
              onClick={() => setFiltroEmpresa("")}
              className="w-20 h-20 rounded-full border-4 flex items-center justify-center text-xl font-bold bg-gradient-to-br from-red-100 to-red-300 text-red-700 border-red-600 shadow-lg hover:scale-110 transition-all duration-300"
              title="Quitar filtro"
            >
              ❌
            </button>
          </div>

          {/* Productos */}
          {productosFiltrados.length === 0 ? (
            <p className="text-center text-gray-600 mt-10">
              No hay productos que coincidan con tus filtros.
            </p>
          ) : (
            <div className="productos-grid px-4 lg:px-0">
              {productosFiltrados.map((producto) => (
                <TarjetaProducto key={producto.id} producto={producto} />
              ))}
            </div>
          )}
        </main>

        {/* Sidebar filtros (desktop) */}
        <SidebarFiltros
          filtros={filtros}
          setFiltros={setFiltros}
          productosOriginales={productosOriginales}
          className="bg-transparent border-none shadow-none"
        />
      </div>

      {/* Sidebar categorías (solo móvil) */}
      {mostrarCategorias && (
        <SidebarCategorias
          categoriaActiva={categoriaActiva}
          onCategoriaClick={handleCategoriaChange}
          mostrarEnMovil={mostrarCategorias}
          setMostrarEnMovil={setMostrarCategorias}
          className="bg-transparent border-none shadow-none"
        />
      )}

      {/* Drawer de filtros (móvil) */}
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
