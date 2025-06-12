// src/components/SidebarCategorias.jsx
import React from 'react';

function SidebarCategorias({ categoriaActiva, setCategoriaActiva, categorias }) {
    return (
    <aside className="lg:w-1/4 w-full bg-gradient-to-br from-blue-100 to-white shadow-lg rounded-xl p-5 sticky top-24 h-fit animate-slide-in-left">
        <h2 className="text-lg font-bold text-blue-700 mb-4">Categorías</h2>
        <ul className="space-y-3">
        {categorias.map((cat, idx) => (
            <li
            key={idx}
            onClick={() => setCategoriaActiva(cat)}
            className={`text-sm cursor-pointer px-3 py-1 rounded-lg border border-blue-300 hover:bg-blue-200 transition-all duration-200 ${
                categoriaActiva === cat ? 'bg-blue-600 text-white' : 'text-gray-700'
            }`}
            >
            {cat}
            </li>
        ))}
        </ul>
    </aside>
    );
}

export default SidebarCategorias;
