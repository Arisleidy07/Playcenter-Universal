// src/pages/Favoritos.jsx
import React from "react";
import { useCarrito } from "../context/CarritoContext";

function Favoritos() {
    const { favoritos, eliminarDeFavoritos } = useCarrito();

    return (
    <main className="pt-24 px-4 sm:px-6 lg:px-12 pb-16 bg-white min-h-screen">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-10 text-rose-600">Favoritos</h1>

        {favoritos.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">No tienes productos favoritos.</p>
        ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
            {favoritos.map((item) => (
            <div
                key={item.id}
                className="bg-white rounded-xl shadow hover:shadow-xl transition-all hover:scale-[1.02] p-3 border border-gray-100"
            >
                <img
                src={item.imagen}
                alt={item.nombre}
                className="w-full h-40 object-cover rounded-md mb-3"
                />
                <h2 className="text-sm sm:text-base font-semibold truncate">{item.nombre}</h2>
                <p className="text-pink-600 font-bold">${item.precio}</p>
                <button
                onClick={() => eliminarDeFavoritos(item.id)}
                className="mt-2 w-full bg-rose-500 hover:bg-rose-600 text-white font-medium py-2 rounded-lg transition-all"
                >
                Quitar de favoritos
                </button>
            </div>
            ))}
        </div>
        )}
    </main>
    );
}

export default Favoritos;
