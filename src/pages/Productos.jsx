import React from 'react';
import ProductCard from '../components/ProductCard';

const productos = [
    { nombre: 'Audífonos Bluetooth', precio: 999, imagen: 'https://via.placeholder.com/100' },
    { nombre: 'Cargador rápido', precio: 499, imagen: 'https://via.placeholder.com/100' },
    { nombre: 'Control Gamer', precio: 1199, imagen: 'https://via.placeholder.com/100' },
    { nombre: 'Lámpara LED', precio: 699, imagen: 'https://via.placeholder.com/100' },
];

const categorias = [
    'Tecnología',
    'Accesorios',
    'Cargadores',
    'Ropa',
    'Juguetes',
    'Belleza',
    'Celulares',
    'Consolas',
    'Decoración',
    'Gaming',
];

function Productos() {
    return (
    <div className="pt-24 px-4 sm:px-6 lg:px-12 pb-16 bg-white min-h-screen flex flex-col lg:flex-row gap-6">
        
      {/* Barra lateral */}
        <aside className="lg:w-1/4 w-full bg-gradient-to-br from-blue-100 to-white shadow-lg rounded-xl p-5 sticky top-24 h-fit animate-slide-in-left">
        <h2 className="text-lg font-bold text-blue-700 mb-4">Categorías</h2>
        <ul className="space-y-3">
            {categorias.map((cat, idx) => (
            <li key={idx} className="text-sm text-gray-700 hover:text-blue-500 transition cursor-pointer">
                {cat}
            </li>
            ))}
        </ul>
        </aside>

      {/* Productos */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 flex-1">
        {productos.map((prod, index) => (
            <ProductCard key={index} nombre={prod.nombre} precio={prod.precio} imagen={prod.imagen} />
        ))}
        </section>
    </div>
    );
}

export default Productos;
