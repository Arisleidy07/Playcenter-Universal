// src/pages/Products.jsx
// src/pages/Productos.jsx
import React from "react";

// Array de productos falsos (puedes reemplazar luego)
const productos = [
    {
    id: 1,
    nombre: "Audífonos Bluetooth",
    precio: "$25.00",
    imagen: "/img/audifonos.jpg",
    },
    {
    id: 2,
    nombre: "Control PS5",
    precio: "$59.00",
    imagen: "/img/control.jpg",
    },
    {
    id: 3,
    nombre: "Cargador rápido",
    precio: "$12.00",
    imagen: "/img/cargador.jpg",
    },
    {
    id: 4,
    nombre: "Tablet escolar",
    precio: "$75.00",
    imagen: "/img/tablet.jpg",
    },
    {
    id: 5,
    nombre: "Mouse gamer",
    precio: "$18.00",
    imagen: "/img/mouse.jpg",
    },
    {
    id: 6,
    nombre: "Teclado RGB",
    precio: "$29.00",
    imagen: "/img/teclado.jpg",
    },
];

function Productos() {
    return (
    <main className="pt-24 px-4 sm:px-6 lg:px-12 pb-16 bg-white min-h-screen">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-10">
        Nuestros Productos
        </h1>

        <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
        {productos.map((producto) => (
            <div
            key={producto.id}
            className="bg-white rounded-xl shadow hover:shadow-xl transition-all hover:scale-[1.02] p-3 border border-gray-100"
            >
            <img
                src={producto.imagen}
                alt={producto.nombre}
                className="w-full h-40 object-cover rounded-md mb-3"
            />
            <h2 className="text-sm sm:text-base font-semibold truncate">
                {producto.nombre}
            </h2>
            <p className="text-pink-600 font-bold">{producto.precio}</p>
            <button className="mt-2 w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 rounded-lg transition-all">
                Agregar al carrito
            </button>
            </div>
        ))}
        </section>
    </main>
    );
}

export default Productos;
