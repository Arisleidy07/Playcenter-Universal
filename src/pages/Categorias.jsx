import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import TarjetaProducto from "../components/TarjetaProducto";
import SidebarCategorias from "../components/SidebarCategorias";
import productos from "../data/productosAll";
import { FaThList } from "react-icons/fa";

function Categorias() {
  const navigate = useNavigate();
  const { categoriaURL } = useParams();
  const [mostrarCategorias, setMostrarCategorias] = React.useState(false);

  const todas = productos.flatMap((cat) => cat.productos);

  const productosFiltrados = React.useMemo(() => {
    if (!categoriaURL || categoriaURL === "") return todas;
    const match = productos.find(
      (cat) =>
        cat.categoria
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\s/g, "-") === categoriaURL
    );
    return match ? match.productos : [];
  }, [categoriaURL, todas]);

  const categoriaActiva = React.useMemo(() => {
    if (!categoriaURL || categoriaURL === "") return "Todos";
    const match = productos.find(
      (cat) =>
        cat.categoria
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\s/g, "-") === categoriaURL
    );
    return match ? match.categoria : "Todos";
  }, [categoriaURL]);

  const handleSeleccion = (nombre) => {
    const ruta = nombre
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s/g, "-");
    navigate(`/productos/${ruta}`);
    setMostrarCategorias(false);
    document.getElementById("productos-seccion")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <main className="pt-6 sm:pt-8 px-3 sm:px-6 lg:px-10 pb-8 bg-white min-h-screen">
      <section className="pt-20 sm:pt-0">
        {!mostrarCategorias && (
          <div className="sm:hidden fixed top-[76px] left-4 z-[9999]">
            <button
              onClick={() => setMostrarCategorias(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#4FC3F7] text-white rounded-full shadow-lg font-semibold text-sm"
              aria-expanded={mostrarCategorias}
              aria-controls="sidebar-categorias"
            >
              <FaThList />
              Categorías
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 mt-2">
          <SidebarCategorias
            categoriaActiva={categoriaActiva}
            setCategoriaActiva={handleSeleccion}
            mostrarEnMovil={mostrarCategorias}
            setMostrarEnMovil={setMostrarCategorias}
          />

<section
  id="productos-seccion"
  className="productos-grid"
>
  {productosFiltrados.length === 0 ? (
    <p className="text-center text-gray-500 col-span-full mt-10">
      No hay productos en esta categoría.
    </p>
  ) : (
    productosFiltrados.map((prod) => (
      <TarjetaProducto key={prod.id} producto={prod} />
    ))
  )}
</section>


        </div>
      </section>
    </main>
  );
}

export default Categorias;
