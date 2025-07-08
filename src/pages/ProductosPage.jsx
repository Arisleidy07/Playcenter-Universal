import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SidebarCategorias from "../components/SidebarCategorias";
import SidebarFiltros from "../components/SidebarFiltros";
import TarjetaProducto from "../components/TarjetaProducto";
import productosAll from "../data/productosAll";
import { normalizar } from "../utils/normalizarCategoria";

function ProductosPage() {
  const { categoria } = useParams();
  const navigate = useNavigate();

  // Estado filtros
  const [filtros, setFiltros] = useState({
    precio: { min: "", max: "" },
    estado: { nuevo: false, usado: false },
  });

  // Estado para categoría activa local para el sidebar
  const [categoriaActiva, setCategoriaActiva] = useState("Todos");

  // Cuando cambie la URL, actualizamos la categoría activa para que sidebar se sincronice
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

  // Productos originales según categoría
  const productosOriginales = useMemo(() => {
    if (categoriaActiva === "Todos") {
      return productosAll.flatMap((cat) => cat.productos);
    }
    const categoriaEncontrada = productosAll.find(
      (cat) => normalizar(cat.categoria) === normalizar(categoriaActiva)
    );
    return categoriaEncontrada ? categoriaEncontrada.productos : [];
  }, [categoriaActiva]);

  // Productos filtrados según filtros
  const productosFiltrados = useMemo(() => {
    return productosOriginales.filter((p) => {
      const cumpleMin = filtros.precio.min === "" || p.precio >= Number(filtros.precio.min);
      const cumpleMax = filtros.precio.max === "" || p.precio <= Number(filtros.precio.max);
      const cumpleEstado =
        (!filtros.estado.nuevo && !filtros.estado.usado) ||
        (filtros.estado.nuevo && p.estado === "Nuevo") ||
        (filtros.estado.usado && p.estado === "Usado");
      return cumpleMin && cumpleMax && cumpleEstado;
    });
  }, [productosOriginales, filtros]);

  // Cuando hacen clic en una categoría del sidebar, navega a esa URL (que actualiza todo)
  const handleCategoriaChange = (nombre, ruta) => {
    // Aquí navegamos y la categoría cambia porque react-router detecta el cambio de URL
    navigate(`/productos/${ruta}`);
  };

  return (
    <div className="flex min-h-screen bg-white pt-1">
      {/* Sidebar Categorías */}
      <aside className="hidden lg:block w-64 border-r border-gray-200 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto">
        <SidebarCategorias
          categoriaActiva={categoriaActiva}
          onCategoriaClick={handleCategoriaChange}
        />
      </aside>

      {/* Productos */}
      <main className="flex-1 p-4 overflow-y-auto">
        <h1 className="text-2xl font-semibold mb-4 text-blue-800">
          {categoriaActiva === "Todos" ? "Todos los productos" : categoriaActiva}
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

      {/* Sidebar Filtros */}
      <aside className="hidden lg:block w-64 border-l border-gray-200 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto px-4 py-4">
        <SidebarFiltros
          filtros={filtros}
          setFiltros={setFiltros}
          productosOriginales={productosOriginales}
        />
      </aside>
    </div>
  );
}

export default ProductosPage;
