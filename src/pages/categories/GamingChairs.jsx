import React from "react";
import TarjetaProducto from "../../components/TarjetaProducto";

function GamingChairs() {
    const productos = [
    {
        id: 801,
        nombre: "Silla Gamer Ergonómica",
        imagen: "/products/silla-gamer.jpg",
        precio: 3299,
    },
    {
        id: 802,
        nombre: "Silla Gamer con Luces LED",
        imagen: "/products/silla-led.jpg",
        precio: 3999,
    },
    ];

    return (
    <div className="p-6 pt-28 bg-white min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Sillas Gamer</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {productos.map((producto) => (
            <TarjetaProducto key={producto.id} producto={producto} />
        ))}
        </div>
    </div>
    );
}

export default GamingChairs;
