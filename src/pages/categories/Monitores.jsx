import React from "react";
import TarjetaProducto from "../../components/TarjetaProducto";

function Monitores() {
    const productos = [
    {
        id: 210,
        nombre: "Monitor LED Samsung 24''",
        imagen: "/products/monitor-samsung.jpg",
        precio: 149.99,
    },
    {
        id: 211,
        nombre: "Monitor Curvo LG UltraWide",
        imagen: "/products/monitor-lg.jpg",
        precio: 219.99,
    },
    ];

    return (
    <div className="p-6 pt-28 bg-white min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Monitores</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {productos.map((producto) => (
            <TarjetaProducto key={producto.id} producto={producto} />
        ))}
        </div>
    </div>
    );
}

export default Monitores;
