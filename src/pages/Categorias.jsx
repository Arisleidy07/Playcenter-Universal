import React, { useState } from 'react';
import TarjetaProducto from "../components/TarjetaProducto";
import SidebarCategorias from '../components/SidebarCategorias';

const categorias = [
    'Todos', 'Accesorios', 'Audífonos', 'Cables', 'Cámaras', 'Cargadores', 'Celulares',
    'Consolas', 'Discos duros', 'Electrodomésticos', 'Gaming Chairs', 'Hogar inteligente',
    'Impresoras', 'Laptops', 'Memorias USB', 'Monitores', 'Mouse', 'Nuevos lanzamientos',
    'Ofertas especiales', 'Relojes inteligentes', 'Smart TV', 'Tablets', 'Teclados', 'Videojuegos', 'Retro consolas', 'Retro juegos'
];


    function Categorias() {
        const [categoriaActiva, setCategoriaActiva] = useState('Todos');

        const productosFiltrados =
        categoriaActiva === 'Todos'
            ? productos
            : productos.filter((p) => p.categoria === categoriaActiva);

        return (
        <main className="pt-24 px-4 sm:px-6 lg:px-12 pb-16 bg-white min-h-screen flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <SidebarCategorias
            categoriaActiva={categoriaActiva}
            setCategoriaActiva={setCategoriaActiva}
            categorias={categorias}
            />

            {/* Productos */}
            <section className="flex flex-wrap gap-6 flex-1 justify-center">
            {productosFiltrados.map((prod) => (
                <div key={prod.id} className="w-full md:w-[48%]">
                <TarjetaProducto producto={prod} />
                </div>
            ))}
            </section>
        </main>
        );
    }

    export default Categorias;
