import React from "react";
import TarjetaProducto from "../../components/TarjetaProducto";

function Mouses() {
    const productos = [
    {
        id: 220,
        nombre: "Mouse Logitech Inalámbrico",
        imagen: "/products/mouse-logitech.jpg",
        precio: 19.99,
    },
    {
        id: 221,
        nombre: "Mouse Gamer RGB",
        imagen: "/products/mouse-gamer.jpg",
        precio: 29.99,
    },
    ];

    return (
    <div className="p-6 pt-28 bg-white min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Mouses</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {productos.map((producto) => (
            <TarjetaProducto key={producto.id} producto={producto} />
        ))}
        </div>
    </div>
    );
}

export default Mouses;
