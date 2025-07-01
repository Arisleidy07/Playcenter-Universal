    import React, { useState } from 'react';
    import TarjetaProducto from "../components/TarjetaProducto";
    import SidebarCategorias from '../components/SidebarCategorias';
    import productos from "../data/productosAll"; // asegúrate de importar tu lista de productos reales

    function Categorias() {
    const [categoriaActiva, setCategoriaActiva] = useState('Todos');

    const productosTodos = productos.flatMap((cat) => cat.productos);

    const productosFiltrados =
        categoriaActiva === 'Todos'
        ? productosTodos
        : productosTodos.filter((p) => p.categoria === categoriaActiva);

    return (
        <main className="pt-24 px-3 sm:px-6 lg:px-12 pb-16 bg-white min-h-screen flex flex-col sm:flex-row gap-6">
        {/* Sidebar fijo a la izquierda, responsivo */}
        <SidebarCategorias
            categoriaActiva={categoriaActiva}
            setCategoriaActiva={setCategoriaActiva}
        />

        {/* Contenido de productos */}
        <section className="flex flex-col gap-4 flex-1">
            {productosFiltrados.map((prod) => (
            <div key={prod.id} className="w-full">
                <TarjetaProducto producto={prod} />
            </div>
            ))}
        </section>
        </main>
    );
    }

    export default Categorias;
