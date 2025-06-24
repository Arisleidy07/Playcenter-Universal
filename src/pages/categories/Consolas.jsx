import React from "react";
import TarjetaProducto from "../../components/TarjetaProducto";

function Consolas() {
    const productos = [
    {
        id: 401,
        nombre: "PlayStation 5",
        imagen: "/products/ps5.jpg",
        precio: 599.99,
    },
    {
        id: 402,
        nombre: "Xbox Series X",
        imagen: "/products/xbox-series-x.jpg",
        precio: 549.99,
    },
    {
        id: 403,
        nombre: "Nintendo Switch OLED",
        imagen: "/products/nintendo-switch-oled.jpg",
        precio: 349.99,
    },
    ];

    return (
    <div className="p-6 pt-28 bg-white min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Consolas</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {productos.map((producto) => (
            <TarjetaProducto key={producto.id} producto={producto} />
        ))}
        </div>
    </div>
    );
}

export default Consolas;
