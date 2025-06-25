import React from "react";
import { useCarrito } from "../context/CarritoContext";

function Favoritos() {
    const { favoritos, eliminarDeFavoritos } = useCarrito();

    return (
    <main className="pt-24 px-4 sm:px-6 lg:px-12 pb-16 min-h-screen bg-white text-[#1E2A47]">

      {/* TÍTULO CON EFECTO */}
        <h1
        className="text-3xl sm:text-4xl font-bold text-center mb-10
                    bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 
                    bg-clip-text text-transparent animate-text-glow"
        >
        Favoritos
        </h1>

        {favoritos.length === 0 ? (
        <p className="text-center text-[#4B5563] text-lg">No tienes productos favoritos.</p>
        ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
            {favoritos.map((item) => (
            <div
                key={item.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all hover:scale-[1.03] p-3 border border-[#3B82F6]"
                >
                <img
                src={item.imagen}
                alt={item.nombre}
                className="w-full h-40 object-contain rounded-md mb-3 bg-[#F0F9FF]"
                />
                <h2 className="text-sm sm:text-base font-semibold truncate text-[#1E2A47]">
                {item.nombre}
                </h2>
                <p className="text-[#2563EB] font-bold">${item.precio}</p>
                <button
                onClick={() => eliminarDeFavoritos(item.id)}
                className="mt-2 w-full bg-[#2563EB] hover:bg-[#1E40AF] text-white font-medium py-2 rounded-lg transition-all"
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
