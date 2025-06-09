import React from "react";

function Videojuegos() {
    const productos = [
    {
        id: 1,
        nombre: "PlayStation 5",
        imagen: "/products/ps5.png",
        precio: "$499.99",
    },
    {
        id: 2,
        nombre: "Xbox Series X",
        imagen: "/products/xbox.png",
        precio: "$499.99",
    },
    {
        id: 3,
        nombre: "Nintendo Switch",
        imagen: "/products/switch.png",
        precio: "$299.99",
    },
    ];

    return (
    <div className="p-6 pt-28">
        <h1 className="text-3xl font-bold mb-6 text-purple-700">Videojuegos</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {productos.map((producto) => (
            <div
            key={producto.id}
            className="border rounded-lg p-4 shadow-lg hover:scale-105 transition-transform duration-300 bg-white"
            >
            <img src={producto.imagen} alt={producto.nombre} className="w-full h-48 object-contain" />
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

export default Videojuegos;
