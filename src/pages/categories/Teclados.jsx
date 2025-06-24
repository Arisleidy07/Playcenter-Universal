import React from "react";
import TarjetaProducto from "../../components/TarjetaProducto";

function Teclados() {
    const productos = [
    {
        id: 280,
        nombre: "Teclado Mecánico RGB",
        imagen: "/products/teclado-rgb.jpg",
        precio: 89.99,
    },
    {
        id: 281,
        nombre: "Teclado Inalámbrico",
        imagen: "/products/teclado-wireless.jpg",
        precio: 49.99,
    },
    ];

    return (
    <div className="p-6 pt-28 bg-white min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Teclados</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {productos.map((producto) => (
            <TarjetaProducto key={producto.id} producto={producto} />
        ))}
        </div>
    </div>
    );
}

export default Teclados;
