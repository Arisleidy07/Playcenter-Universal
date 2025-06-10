// src/pages/Carrito.jsx
import React from "react";

// Simulación de productos en el carrito
const carrito = [
    {
    id: 1,
    nombre: "Audífonos Bluetooth",
    precio: 25.0,
    cantidad: 1,
    imagen: "/img/audifonos.jpg",
    },
    {
    id: 2,
    nombre: "Teclado RGB",
    precio: 29.0,
    cantidad: 2,
    imagen: "/img/teclado.jpg",
    },
];

function Carrito() {
  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

    return (
    <main className="pt-24 px-4 sm:px-6 lg:px-12 pb-16 bg-white min-h-screen">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-10">Mi Carrito</h1>

        {carrito.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">Tu carrito está vacío.</p>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {carrito.map((item) => (
            <div key={item.id} className="flex gap-4 p-4 rounded-xl shadow border border-gray-100 hover:shadow-lg transition-all">
                <img
                src={item.imagen}
                alt={item.nombre}
                className="w-24 h-24 object-cover rounded"
                />
                <div className="flex flex-col justify-between">
                <h2 className="text-base sm:text-lg font-semibold">{item.nombre}</h2>
                <p className="text-gray-600">Cantidad: {item.cantidad}</p>
                <p className="text-pink-600 font-bold">${(item.precio * item.cantidad).toFixed(2)}</p>
                </div>
            </div>
            ))}
        </div>
        )}

      {/* Total */}
        {carrito.length > 0 && (
        <div className="mt-10 text-center">
        <button className="mt-4 bg-green-500 hover:bg-green-600 text-white font-medium px-6 py-3 rounded-lg transition-all">
            Finalizar compra
            </button>
        </div>
        )}
    </main>
    );
}

export default Carrito;
