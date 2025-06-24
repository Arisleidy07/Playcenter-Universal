import React from "react";
import TarjetaProducto from "../../components/TarjetaProducto";

function Audifonos() {
    const productos = [
    {
        id: 101,
        nombre: "Audífonos Bluetooth",
        imagen: "/products/audifonos-bluetooth.jpg",
        precio: 999,
    },
    {
        id: 102,
        nombre: "Audífonos Gamer RGB",
        imagen: "/products/audifonos-gamer.jpg",
        precio: 1299,
    },
    ];

    return (
    <div className="p-6 pt-28 bg-white min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Audífonos</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {productos.map((producto) => (
            <TarjetaProducto key={producto.id} producto={producto} />
        ))}
        </div>
    </div>
    );
}

export default Audifonos;
