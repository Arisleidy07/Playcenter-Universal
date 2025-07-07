import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import TarjetaProducto from "../components/TarjetaProducto";
import SidebarCategorias from "../components/SidebarCategorias";
import SidebarFiltros from "../components/SidebarFiltros";
import productosAll from "../data/productosAll";
import { normalizar } from "../utils/normalizarCategoria";
import { FiMenu, FiFilter } from "react-icons/fi";
import "../styles/productosGrid.css";

function Categorias() {
  const { categoria } = useParams();

  const [categoriaActiva, setCategoriaActiva] = useState("Todos");
  const [mostrarSidebarMovil, setMostrarSidebarMovil] = useState(false);
  const [mostrarFiltrosMovil, setMostrarFiltrosMovil] = useState(false);
  const [filtros, setFiltros] = useState({
    estado: { nuevo: false, usado: false },
    precio: { min: "", max: "" },
  });
  const [productosFiltrados, setProductosFiltrados] = useState([]);

  useEffect(() => {
    if (!categoria || categoria === "") {
      setCategoriaActiva("Todos");
    } else {
      const catOriginal = productosAll.find(
        (cat) => normalizar(cat.categoria) === normalizar(categoria)
      );
      setCategoriaActiva(catOriginal ? catOriginal.categoria : "Todos");
    }
  }, [categoria]);

  useEffect(() => {
    let productos = [];
    if (categoriaActiva === "Todos") {
      productos = productosAll.flatMap((cat) => cat.productos);
    } else {
      const cat = productosAll.find(
        (cat) => normalizar(cat.categoria) === normalizar(categoriaActiva)
      );
      productos = cat ? cat.productos : [];
    }

    const filtrados = productos.filter((p) => {
      const cumpleMin = !filtros.precio.min || p.precio >= Number(filtros.precio.min);
      const cumpleMax = !filtros.precio.max || p.precio <= Number(filtros.precio.max);
      const cumpleEstado =
        (!filtros.estado.nuevo && !filtros.estado.usado) ||
        (filtros.estado.nuevo && p.estado === "Nuevo") ||
        (filtros.estado.usado && p.estado === "Usado");
      return cumpleMin && cumpleMax && cumpleEstado;
    });

    setProductosFiltrados(filtrados);
  }, [categoriaActiva, filtros]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white shadow z-50 flex items-center justify-between px-4 sm:px-6 h-14">
        <button
          className="sm:hidden text-2xl text-blue-800"
          onClick={() => setMostrarSidebarMovil(true)}
          aria-label="Abrir categorías"
        >
          <FiMenu />
        </button>

        <h1 className="text-lg sm:text-xl font-bold text-blue-800 truncate">
          {categoriaActiva}
        </h1>

        <button
          className="sm:hidden text-2xl text-blue-800"
          onClick={() => setMostrarFiltrosMovil(true)}
          aria-label="Abrir filtros"
        >
          <FiFilter />
        </button>
      </header>

      <div className="pt-14 flex min-h-screen bg-white">
        <SidebarCategorias
          categoriaActiva={categoriaActiva}
          mostrarEnMovil={mostrarSidebarMovil}
          setMostrarEnMovil={setMostrarSidebarMovil}
          setCategoriaActiva={setCategoriaActiva}
        />

        <SidebarFiltros
          mostrarEnMovil={false}
          setMostrarEnMovil={() => {}}
          filtros={filtros}
          setFiltros={setFiltros}
          productosOriginales={
            categoriaActiva === "Todos"
              ? productosAll.flatMap((cat) => cat.productos)
              : productosAll.find((cat) => normalizar(cat.categoria) === normalizar(categoriaActiva))?.productos || []
          }
        />

        {mostrarFiltrosMovil && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-30 z-[1050]"
              onClick={() => setMostrarFiltrosMovil(false)}
            />
            <aside className="fixed top-14 right-0 bottom-0 w-72 bg-white z-[1051] shadow-lg overflow-y-auto">
              <SidebarFiltros
                mostrarEnMovil={true}
                setMostrarEnMovil={setMostrarFiltrosMovil}
                filtros={filtros}
                setFiltros={setFiltros}
                productosOriginales={
                  categoriaActiva === "Todos"
                    ? productosAll.flatMap((cat) => cat.productos)
                    : productosAll.find((cat) => normalizar(cat.categoria) === normalizar(categoriaActiva))?.productos || []
                }
              />
            </aside>
          </>
        )}

        <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6">
          {productosFiltrados.length === 0 ? (
            <p className="text-center text-gray-600 mt-10">
              No hay productos que coincidan con tus filtros.
            </p>
          ) : (
            <div className="productos-grid">
              {productosFiltrados.map((producto) => (
                <TarjetaProducto key={producto.id} producto={producto} />
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default Categorias;
