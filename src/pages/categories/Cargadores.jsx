import React from "react";
import TarjetaProducto from "../../components/TarjetaProducto";

function Cargadores() {
    const productos = [
    {
        id: 401,
        nombre: "Cargador Rápido USB-C",
        imagen: "/products/cargador-usbc.jpg",
        precio: 24.99,
    },
    {
        id: 402,
        nombre: "Cargador Inalámbrico Qi",
        imagen: "/products/cargador-inalambrico.jpg",
        precio: 29.99,
    },
    ];

    return (
    <div className="p-6 pt-28 bg-white min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Cargadores</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {productos.map((producto) => (
            <TarjetaProducto key={producto.id} producto={producto} />
        ))}
        </div>
    </div>
    );
}

export default Cargadores;
