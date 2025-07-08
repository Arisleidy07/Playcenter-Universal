import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SidebarCategorias from "../components/SidebarCategorias";
import SidebarFiltros from "../components/SidebarFiltros";
import FiltroDrawer from "../components/FiltroDrawer";
import BotonFiltro from "../components/BotonFiltro";
import TarjetaProducto from "../components/TarjetaProducto";
import productosAll from "../data/productosAll";
import { normalizar } from "../utils/normalizarCategoria";

function ProductosPage() {
  const { categoria } = useParams();
  const navigate = useNavigate();

  const [filtros, setFiltros] = useState({
    precio: { min: "", max: "" },
    estado: { nuevo: false, usado: false },
  });

  const [filtrosVisible, setFiltrosVisible] = useState(false);

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
      return cumpleMin && cumpleMax && cumpleEstado;
    });
  }, [productosOriginales, filtros]);

  const handleCategoriaChange = (nombre, ruta) => {
    navigate(`/productos/${ruta}`);
    setFiltrosVisible(false);
  };

  const handleResetFiltros = () => {
    setFiltros({
      precio: { min: "", max: "" },
      estado: { nuevo: false, usado: false },
    });
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white pt-1">
      {/* Sidebar categorías */}
      <aside className="block w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-gray-200 lg:sticky lg:top-14 lg:h-[calc(100vh-56px)] overflow-x-auto lg:overflow-y-auto">
        <SidebarCategorias
          categoriaActiva={categoriaActiva}
          onCategoriaClick={handleCategoriaChange}
        />
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-4 overflow-y-auto relative">
        {/* Botón filtros solo en móvil */}
        <div className="sm:block lg:hidden mb-4">
          <BotonFiltro onClick={() => setFiltrosVisible(true)} />
        </div>

        <h1 className="text-2xl font-semibold mb-4 text-blue-800">
          {categoriaActiva === "Todos"
            ? "Todos los productos"
            : categoriaActiva}
        </h1>

        {productosFiltrados.length === 0 ? (
          <p className="text-center text-gray-600 mt-10">
            No hay productos que coincidan con tus filtros.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {productosFiltrados.map((producto) => (
              <TarjetaProducto key={producto.id} producto={producto} />
            ))}
          </div>
        )}
      </main>

      {/* Sidebar filtros SOLO en escritorio */}
      <aside className="hidden lg:block w-64 border-l border-gray-200 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto px-4 py-4">
        <SidebarFiltros
          filtros={filtros}
          setFiltros={setFiltros}
          productosOriginales={productosOriginales}
        />
      </aside>

      {/* Drawer filtros SOLO en móvil */}
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

export default ProductosPage;
