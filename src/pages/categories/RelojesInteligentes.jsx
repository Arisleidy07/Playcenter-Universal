import React from "react";
import TarjetaProducto from "../../components/TarjetaProducto";

function RelojesInteligentes() {
    const productos = [
    {
        id: 250,
        nombre: "Apple Watch Series 8",
        imagen: "/products/apple-watch.jpg",
        precio: 399.99,
    },
    {
        id: 251,
        nombre: "Samsung Galaxy Watch 5",
        imagen: "/products/galaxy-watch.jpg",
        precio: 349.99,
    },
    ];

    return (
    <div className="p-6 pt-28 bg-white min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Relojes Inteligentes</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {productos.map((producto) => (
            <TarjetaProducto key={producto.id} producto={producto} />
        ))}
        </div>
    </div>
    );
}

export default RelojesInteligentes;
