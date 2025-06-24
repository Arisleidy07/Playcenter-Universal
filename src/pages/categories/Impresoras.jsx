import React from "react";
import TarjetaProducto from "../../components/TarjetaProducto";

function Impresoras() {
    const productos = [
    {
        id: 160,
        nombre: "Impresora Multifuncional HP",
        imagen: "/products/impresora-hp.jpg",
        precio: 139.99,
    },
    {
        id: 161,
        nombre: "Impresora Canon WiFi",
        imagen: "/products/impresora-canon.jpg",
        precio: 159.99,
    },
    ];

    return (
    <div className="p-6 pt-28 bg-white min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Impresoras</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {productos.map((producto) => (
            <TarjetaProducto key={producto.id} producto={producto} />
        ))}
        </div>
    </div>
    );
}

export default Impresoras;
