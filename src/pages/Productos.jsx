import React, { useState } from 'react';
import ProductCard from '../components/ProductCard';
import SidebarCategorias from '../components/SidebarCategorias';

const productos = [
    { nombre: 'Audífonos Bluetooth', precio: 999, imagen: 'https://via.placeholder.com/100', categoria: 'Audífonos' },
    { nombre: 'Cargador rápido', precio: 499, imagen: 'https://via.placeholder.com/100', categoria: 'Cargadores' },
    { nombre: 'Control Gamer', precio: 1199, imagen: 'https://via.placeholder.com/100', categoria: 'Gaming' },
    { nombre: 'Lámpara LED', precio: 699, imagen: 'https://via.placeholder.com/100', categoria: 'Hogar inteligente' },
  // Puedes añadir más productos aquí...
];

const categorias = [
    'Todos', 'Accesorios', 'Videojuegos', 'Audífonos', 'Cables', 'Cámaras', 'Cargadores',
    'Celulares', 'Consolas', 'Discos duros', 'Electrodomésticos', 'Gaming Chairs',
    'Hogar inteligente', 'Impresora', 'Laptops', 'Memoria USB', 'Monitores',
    'Mouse', 'Nuevo lanzamiento', 'Oferta de especiales', 'Relojes inteligentes',
    'Smart TV', 'Tablets', 'Teclados'
];

function Productos() {
    const [categoriaActiva, setCategoriaActiva] = useState('Todos');

    const productosFiltrados = categoriaActiva === 'Todos'
    ? productos
    : productos.filter(p => p.categoria === categoriaActiva);

    return (
    <div className="pt-24 px-4 sm:px-6 lg:px-12 pb-16 bg-white min-h-screen flex flex-col lg:flex-row gap-6">
        <SidebarCategorias
        categoriaActiva={categoriaActiva}
        setCategoriaActiva={setCategoriaActiva}
        categorias={categorias}
        />

        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 flex-1">
        {productosFiltrados.map((prod, index) => (
            <ProductCard
            key={index}
            nombre={prod.nombre}
            precio={prod.precio}
            imagen={prod.imagen}
            />
        ))}
        </section>
    </div>
    );
}

export default Productos;
