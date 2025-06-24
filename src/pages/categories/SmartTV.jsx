import React from "react";
import TarjetaProducto from "../../components/TarjetaProducto";

function SmartTV() {
    const productos = [
    {
        id: 260,
        nombre: "Smart TV LG 55'' 4K UHD",
        imagen: "/products/smarttv-lg.jpg",
        precio: 479.99,
    },
    {
        id: 261,
        nombre: "Smart TV Samsung QLED",
        imagen: "/products/smarttv-samsung.jpg",
        precio: 599.99,
    },
    ];

    return (
    <div className="p-6 pt-28 bg-white min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Smart TV</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {productos.map((producto) => (
            <TarjetaProducto key={producto.id} producto={producto} />
        ))}
        </div>
    </div>
    );
}

export default SmartTV;
