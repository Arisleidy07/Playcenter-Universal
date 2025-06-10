import React, { useState } from 'react';

// Productos simulados
const productos = [
    {
    id: 1,
    nombre: 'Auriculares inalámbricos',
    precio: 29.99,
    imagen: 'https://via.placeholder.com/200x200?text=Auriculares',
    categoria: 'Accesorios'
    },
    {
    id: 2,
    nombre: 'Mouse Gamer RGB',
    precio: 19.99,
    imagen: 'https://via.placeholder.com/200x200?text=Mouse+Gamer',
    categoria: 'Gaming'
    },
    {
    id: 3,
    nombre: 'Cargador rápido USB-C',
    precio: 14.99,
    imagen: 'https://via.placeholder.com/200x200?text=Cargador+USB-C',
    categoria: 'Cargadores'
    },
    {
    id: 4,
    nombre: 'Teclado Mecánico',
    precio: 49.99,
    imagen: 'https://via.placeholder.com/200x200?text=Teclado',
    categoria: 'Gaming'
    },
    {
    id: 5,
    nombre: 'Pulsera Inteligente',
    precio: 24.99,
    imagen: 'https://via.placeholder.com/200x200?text=Pulsera',
    categoria: 'Accesorios'
    },
    {
    id: 6,
    nombre: 'Consola Retro Portátil',
    precio: 39.99,
    imagen: 'https://via.placeholder.com/200x200?text=Consola+Retro',
    categoria: 'Videojuegos'
    }
];

const categorias = ['Todos', 'Accesorios', 'Gaming', 'Cargadores', 'Videojuegos'];

function Productos() {
    const [categoriaActiva, setCategoriaActiva] = useState('Todos');

    const productosFiltrados = categoriaActiva === 'Todos'
    ? productos
    : productos.filter((p) => p.categoria === categoriaActiva);

    return (
    <div className="flex flex-col md:flex-row px-4 md:px-10 pt-28 gap-6">
      {/* BARRA LATERAL */}
        <aside className="w-full md:w-60 md:sticky top-28 bg-white border border-gray-200 p-4 rounded-lg shadow-md animate-fade-in">
        <h2 className="text-lg font-bold mb-3">Categorías</h2>
        <ul className="flex md:flex-col flex-wrap gap-2 md:gap-3">
            {categorias.map((cat) => (
            <li
                key={cat}
                onClick={() => setCategoriaActiva(cat)}
                className={`cursor-pointer px-3 py-1 rounded-full border text-sm hover:bg-pink-100 transition-all duration-200 ${
                categoriaActiva === cat ? 'bg-pink-500 text-white' : 'text-gray-700'
                }`}
            >
                {cat}
            </li>
            ))}
        </ul>
        </aside>

      {/* PRODUCTOS */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 flex-1">
        {productosFiltrados.map((prod) => (
            <div key={prod.id} className="bg-white rounded-xl shadow-lg p-4 hover:scale-[1.02] transition-all duration-300 flex flex-col items-center text-center">
            <img src={prod.imagen} alt={prod.nombre} className="w-32 h-32 object-cover mb-2" />
            <h3 className="font-semibold">{prod.nombre}</h3>
            <p className="text-pink-600 font-bold mb-2">${prod.precio}</p>
            <div className="flex gap-3">
                <button className="bg-pink-500 text-white px-3 py-1 rounded-full text-sm hover:bg-pink-600">
                🛒 Agregar
            </button>
                <button className="border border-pink-500 text-pink-500 px-3 py-1 rounded-full text-sm hover:bg-pink-100">
                ❤️
                </button>
            </div>
            </div>
        ))}
        </section>
    </div>
    );
}

export default Productos;
