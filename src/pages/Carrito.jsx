import React from "react";
import { useCarrito } from "../context/CarritoContext";

function Carrito() {
    const { carrito, eliminarDelCarrito } = useCarrito();
  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

    return (
    <main className="pt-24 px-4 sm:px-6 lg:px-12 pb-16 min-h-screen bg-white text-[#1E2A47]">

      {/* TÍTULO ANIMADO */}
        <h1
        className="text-3xl sm:text-4xl font-bold text-center mb-10
                    bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 
                    bg-clip-text text-transparent animate-text-glow"
        >
        Mi Carrito
        </h1>

        {carrito.length === 0 ? (
        <p className="text-center text-[#4B5563] text-lg">Tu carrito está vacío.</p>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {carrito.map((item, index) => (
            <div
                key={index}
                className="flex gap-4 p-4 rounded-xl bg-white shadow-md
                            border border-[#3B82F6] hover:shadow-xl transition-all"
            >
                <img
                src={item.imagen}
                alt={item.nombre}
                className="w-24 h-24 object-cover rounded-md shadow-sm bg-[#F0F9FF]"
                />
                <div className="flex flex-col justify-between">
                <h2 className="text-base sm:text-lg font-semibold text-[#1E2A47]">
                    {item.nombre}
                </h2>
                <p className="text-[#2563EB]">Cantidad: {item.cantidad}</p>
                <p className="text-[#2563EB] font-bold">
                  ${(item.precio * item.cantidad).toFixed(2)}
                </p>
                <button
                    onClick={() => eliminarDelCarrito(item)}
                    className="text-sm text-[#EF4444] mt-2 hover:underline"
                >
                    Eliminar
                </button>
                </div>
            </div>
            ))}
        </div>
        )}

        {carrito.length > 0 && (
        <div className="mt-10 text-center">
            <p className="text-lg font-semibold mb-3 text-[#2563EB]">
            Total: ${total.toFixed(2)}
            </p>
            <button
            className="mt-4 bg-[#2563EB] hover:bg-[#1E40AF] text-white
                        font-medium px-6 py-3 rounded-lg transition-all"
            >
            Finalizar compra
            </button>
        </div>
        )}
    </main>
    );
}

export default Carrito;
