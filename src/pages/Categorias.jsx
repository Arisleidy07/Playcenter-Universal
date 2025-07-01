    import React, { useState } from "react";
    import TarjetaProducto from "../components/TarjetaProducto";
    import SidebarCategorias from "../components/SidebarCategorias";
    import productos from "../data/productosAll";
    import { FaThList } from "react-icons/fa";

    function Categorias() {
    const [categoriaActiva, setCategoriaActiva] = useState("Todos");
    const [mostrarCategorias, setMostrarCategorias] = useState(false);

    const productosTodos = productos.flatMap((cat) => cat.productos);

    const productosFiltrados =
        categoriaActiva === "Todos"
        ? productosTodos
        : productosTodos.filter((p) => p.categoria === categoriaActiva);

    const handleSeleccion = (nuevaCategoria) => {
        setCategoriaActiva(nuevaCategoria);
        setMostrarCategorias(false);

        setTimeout(() => {
        document.getElementById("productos-seccion")?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    return (
        <main className="pt-24 px-3 sm:px-6 lg:px-12 pb-16 bg-white min-h-screen">
        {/* Botón de Categorías en móvil */}
        <div className="sm:hidden mb-4 flex justify-center">
            <button
            onClick={() => setMostrarCategorias(!mostrarCategorias)}
            className="flex items-center gap-2 px-4 py-2 bg-[#4FC3F7] text-white rounded-full shadow font-semibold text-sm"
            >
            <FaThList />
            Categorías
            </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-6">
            {/* Sidebar / Panel de Categorías */}
            <SidebarCategorias
            categoriaActiva={categoriaActiva}
            setCategoriaActiva={handleSeleccion}
            mostrarEnMovil={mostrarCategorias}
            />

            {/* Productos */}
            <section
            id="productos-seccion"
            className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 max-w-6xl mx-auto px-1 sm:px-4"
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
