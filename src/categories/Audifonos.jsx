import React from "react";

function Audifonos() {
    const productos = [
    {
        id: 1,
        nombre: "Audífonos Sony WH-1000XM5",
        imagen: "/products/sony-wh1000xm5.png",
        precio: "$349.99",
    },
    {
        id: 2,
        nombre: "AirPods Pro 2da Gen",
        imagen: "/products/airpods-pro-2.png",
        precio: "$249.99",
    },
    {
        id: 3,
        nombre: "Beats Studio3 Wireless",
        imagen: "/products/beats-studio3.png",
        precio: "$299.99",
    },
    ];

    return (
    <div className="p-6 pt-28">
        <h1 className="text-3xl font-bold mb-6 text-purple-700">Audífonos</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {productos.map((producto) => (
            <div
            key={producto.id}
            className="border rounded-lg p-4 shadow-lg hover:scale-105 transition-transform duration-300 bg-white"
            >
            <img
                src={producto.imagen}
                alt={producto.nombre}
                className="w-full h-48 object-contain"
            />
            <h2 className="mt-4 text-lg font-semibold">{producto.nombre}</h2>
            <p className="text-purple-600 font-bold">{producto.precio}</p>
            <button className="mt-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
                Agregar al carrito
            </button>
            </div>
        ))}
        </div>
    </div>
    );
}

export default Audifonos;
