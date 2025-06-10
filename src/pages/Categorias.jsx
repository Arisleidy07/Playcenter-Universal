// src/pages/Categorias.jsx
import React from "react";

// Simulación de categorías
const categorias = [
    { nombre: "Videojuegos", color: "from-pink-400 to-pink-600" },
    { nombre: "Ropa", color: "from-blue-400 to-blue-600" },
    { nombre: "Accesorios", color: "from-green-400 to-green-600" },
    { nombre: "Tecnología", color: "from-purple-400 to-purple-600" },
    { nombre: "Hogar", color: "from-yellow-400 to-yellow-600" },
    { nombre: "Juguetes", color: "from-red-400 to-red-600" },
    { nombre: "Belleza", color: "from-rose-400 to-rose-600" },
    { nombre: "Zapatos", color: "from-teal-400 to-teal-600" },
    { nombre: "Móviles", color: "from-indigo-400 to-indigo-600" },
    { nombre: "Cargadores", color: "from-orange-400 to-orange-600" },
    { nombre: "Audífonos", color: "from-cyan-400 to-cyan-600" },
    { nombre: "Tablets", color: "from-emerald-400 to-emerald-600" },
];

function Categorias() {
    return (
    <main className="pt-24 px-4 sm:px-6 lg:px-12 pb-16 bg-white min-h-screen">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-10">
        Explora nuestras Categorías
        </h1>

        <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
        {categorias.map((cat, idx) => (
            <div
            key={idx}
            className={`rounded-xl p-6 text-white font-semibold text-center text-sm sm:text-base shadow-md bg-gradient-to-br ${cat.color} hover:scale-[1.03] transition-all cursor-pointer`}
            >
            {cat.nombre}
            </div>
        ))}
        </section>
    </main>
    );
}

export default Categorias;
