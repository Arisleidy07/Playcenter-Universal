import React from "react";
import TarjetaProducto from "../../components/TarjetaProducto";

function NuevosLanzamientos() {
    const productos = [
    {
        id: 230,
        nombre: "Tablet Galaxy S9 Ultra",
        imagen: "/products/galaxy-s9-ultra.jpg",
        precio: 999.99,
    },
    {
        id: 231,
        nombre: "PlayStation 6 - Próximamente",
        imagen: "/products/ps6.jpg",
        precio: 799.99,
    },
    ];

    return (
    <div className="p-6 pt-28 bg-white min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Nuevos Lanzamientos</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {productos.map(producto => (
            <TarjetaProducto key={producto.id} producto={producto} />
        ))}
        </div>
    </div>
    );
}

export default NuevosLanzamientos;
