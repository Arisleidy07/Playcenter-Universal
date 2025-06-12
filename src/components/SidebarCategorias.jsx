import React from 'react';
import { Link } from 'react-router-dom';

function SidebarCategorias({ categoriaActiva, setCategoriaActiva, categorias }) {
    return (
        <aside className="w-full lg:w-full xl:w-64 bg-gradient-to-br from-blue-100 to-white shadow-md rounded-xl p-4 sticky top-24 h-fit animate-slide-in-left overflow-auto max-h-[80vh]">
        <h2 className="text-lg font-bold text-blue-700 mb-4">Categorías</h2>
        <ul className="space-y-3">
        {categorias.map((cat, idx) => (
            <li key={idx}>
            <Link
                to={
                cat === 'Todos'
                    ? '/productos'
                    : `/categoria/${cat.toLowerCase().replace(/\s/g, '-')}`
                }
                className={`text-xs md:text-sm cursor-pointer px-3 py-2 rounded-lg border border-blue-300 hover:bg-blue-200 transition-all duration-200 ${
                    categoriaActiva === cat ? 'bg-blue-600 text-white' : 'text-gray-700'
                }`}

                onClick={() => setCategoriaActiva(cat)}
            >
                {cat}
            </Link>
            </li>
        ))}
        </ul>
    </aside>
    );
}

export default SidebarCategorias;
