// src/pages/Productos.jsx
import React, { useState } from 'react';
import SidebarCategorias from '../components/SidebarCategorias';

const productos = [
    { id: 1, nombre: 'Audífonos Bluetooth', precio: 999, imagen: 'https://via.placeholder.com/100', categoria: 'Audífonos' },
    { id: 2, nombre: 'Cargador rápido', precio: 499, imagen: 'https://via.placeholder.com/100', categoria: 'Cargadores' },
    { id: 3, nombre: 'Control Gamer', precio: 1199, imagen: 'https://via.placeholder.com/100', categoria: 'Gaming' },
    { id: 4, nombre: 'Lámpara LED', precio: 699, imagen: 'https://via.placeholder.com/100', categoria: 'Hogar inteligente' },
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
    : productos.filter((p) => p.categoria === categoriaActiva);

    return (
    <div className="pt-24 px-4 sm:px-6 lg:px-12 pb-16 bg-white min-h-screen flex flex-col lg:flex-row gap-6">
      {/* BARRA LATERAL */}
        <SidebarCategorias
        categoriaActiva={categoriaActiva}
        setCategoriaActiva={setCategoriaActiva}
        categorias={categorias}
        />

      {/* PRODUCTOS */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 flex-1">
        {productosFiltrados.map((prod) => (
            <div key={prod.id} className="card relative w-full h-64 rounded-xl z-10 overflow-hidden flex flex-col items-center justify-center shadow-lg">
            <div className="bg absolute top-[5px] left-[5px] w-[90%] h-[90%] z-20 backdrop-blur-2xl border-2 border-white rounded-lg"></div>
            <div className="blob"></div>
            <div className="z-30 text-center px-2">
                <img src={prod.imagen} alt={prod.nombre} className="w-20 h-20 mx-auto mb-2 rounded-full" />
                <h3 className="text-sm font-semibold">{prod.nombre}</h3>
                <p className="text-red-600 font-bold">${prod.precio}</p>
            </div>
            </div>
        ))}
        </section>
    </div>
    );
}

export default Productos;
