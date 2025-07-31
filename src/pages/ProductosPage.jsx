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
      return productosAll.flatMap((cat) => cat.productos);
    }
    const categoriaEncontrada = productosAll.find(
      (cat) => normalizar(cat.categoria) === normalizar(categoriaActiva)
    );
    return categoriaEncontrada ? categoriaEncontrada.productos : [];
  }, [categoriaActiva]);

  const productosFiltrados = useMemo(() => {
    return productosOriginales.filter((p) => {
      const cumpleMin =
        filtros.precio.min === "" || p.precio >= Number(filtros.precio.min);
      const cumpleMax =
        filtros.precio.max === "" || p.precio <= Number(filtros.precio.max);
      const cumpleEstado =
        (!filtros.estado.nuevo && !filtros.estado.usado) ||
        (filtros.estado.nuevo && p.estado === "Nuevo") ||
        (filtros.estado.usado && p.estado === "Usado");
      const cumpleEmpresa = !filtroEmpresa || p.empresa === filtroEmpresa;
      return cumpleMin && cumpleMax && cumpleEstado && cumpleEmpresa;
    });
  }, [productosOriginales, filtros, filtroEmpresa]);

  const handleCategoriaChange = (nombre, ruta) => {
    navigate(`/productos/${ruta}`);
    setFiltrosVisible(false);
    setMostrarCategorias(false);
    setFiltroEmpresa(""); // Reinicia filtro empresa al cambiar categoría
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
    { nombre: "Nintendo", imagen: "/logos/ns-logo.png" },
    { nombre: "Wii", imagen: "/logos/wii-logo.png" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white pt-1 pb-[96px]">
      <div className="flex-1 flex flex-col lg:flex-row w-full">
        {/* Sidebar categorías SOLO en escritorio grande */}
        <SidebarCategorias
          categoriaActiva={categoriaActiva}
          onCategoriaClick={handleCategoriaChange}
        />

        {/* Contenido principal */}
        <main className="flex-1 p-0 lg:p-4 relative pb-32">
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

          {/* Título de categoría */}
          <h1 className="text-2xl font-semibold mb-2 text-blue-800 px-4 lg:px-0">
            {categoriaActiva === "Todos" ? "Todos los productos" : categoriaActiva}
          </h1>

          {/* Circulitos con logos de empresa */}
          <div className="flex flex-wrap gap-3 px-4 lg:px-0 mb-6">
            {logosEmpresa.map((empresa) => (
              <button
                key={empresa.nombre}
                onClick={() => setFiltroEmpresa(empresa.nombre)}
                className={`w-14 h-14 rounded-full border-4 overflow-hidden flex items-center justify-center transition-all duration-200 hover:scale-110 hover:ring-2 ${
                  filtroEmpresa === empresa.nombre
                    ? "border-blue-800 ring-4 ring-blue-700"
                    : "border-gray-300 hover:border-blue-500"
                }`}
                title={empresa.nombre}
              >
                <img
                  src={empresa.imagen}
                  alt={empresa.nombre}
                  className="w-10 h-10 object-contain"
                />
              </button>
            ))}

            {/* Botón para quitar filtro */}
            <button
              onClick={() => setFiltroEmpresa("")}
              className="w-14 h-14 rounded-full border-4 flex items-center justify-center text-xl font-bold bg-red-100 text-red-600 border-red-600 transition-all duration-200 hover:scale-110 hover:ring-2 hover:ring-red-400"
              title="Quitar filtro"
            >
              ❌
            </button>
          </div>


          {/* Resultado */}
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

        {/* Sidebar filtros SOLO en escritorio grande */}
        <SidebarFiltros
          filtros={filtros}
          setFiltros={setFiltros}
          productosOriginales={productosOriginales}
        />
      </div>

      {/* Sidebar categorías SOLO en móvil/tablet (modal/drawer) */}
      {mostrarCategorias && (
        <SidebarCategorias
          categoriaActiva={categoriaActiva}
          onCategoriaClick={handleCategoriaChange}
          mostrarEnMovil={mostrarCategorias}
          setMostrarEnMovil={setMostrarCategorias}
        />
      )}

      {/* Drawer filtros SOLO en móvil/tablet */}
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
