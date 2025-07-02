import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TarjetaProducto from "../components/TarjetaProducto";
import SidebarCategorias from "../components/SidebarCategorias";
import productos from "../data/productosAll";
import { FaThList } from "react-icons/fa";

function Categorias() {
  const navigate = useNavigate();
  const { categoriaURL } = useParams();
  const [categoriaActiva, setCategoriaActiva] = useState("Todos");
  const [mostrarCategorias, setMostrarCategorias] = useState(false);

  const todas = productos.flatMap((cat) => cat.productos);

  const productosFiltrados =
    categoriaActiva === "Todos"
      ? todas
      : todas.filter(
          (p) =>
            p.categoria.toLowerCase().replace(/\s/g, "-") === categoriaURL
        );

  useEffect(() => {
    if (categoriaURL) {
      const nombreMatch = productos.find(
        (cat) =>
          cat.nombre.toLowerCase().replace(/\s/g, "-") === categoriaURL
      );
      setCategoriaActiva(nombreMatch ? nombreMatch.nombre : "Todos");
    } else {
      setCategoriaActiva("Todos");
    }
  }, [categoriaURL]);

  const handleSeleccion = (nombre) => {
    const ruta = nombre.toLowerCase().replace(/\s/g, "-");
    navigate(`/productos/${ruta}`);
    setMostrarCategorias(false);
    setTimeout(() => {
      document.getElementById("productos-seccion")?.scrollIntoView({
        behavior: "smooth",
      });
    }, 200);
  };

  return (
    <main className="pt-6 sm:pt-8 px-3 sm:px-6 lg:px-10 pb-8 bg-white min-h-screen">
      {/* Aquí: solo mostrar botón si NO está abierto el sidebar */}
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

      <div className="flex flex-col sm:flex-row gap-4">
        <SidebarCategorias
          categoriaActiva={categoriaActiva}
          setCategoriaActiva={handleSeleccion}
          mostrarEnMovil={mostrarCategorias}
          setMostrarEnMovil={setMostrarCategorias}
        />

        <section
          id="productos-seccion"
          className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 max-w-6xl mx-auto px-2 sm:px-4"
        >
          {productosFiltrados.map((prod) => (
            <div key={prod.id} className="w-full">
              <TarjetaProducto producto={prod} />
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}

export default Categorias;
