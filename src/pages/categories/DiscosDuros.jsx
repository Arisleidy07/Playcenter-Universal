import React from "react";
import TarjetaProducto from "../../components/TarjetaProducto";

function DiscosDuros() {
    const productos = [
    {
        id: 601,
        nombre: "Disco Duro Externo 1TB",
        imagen: "/products/disco-1tb.jpg",
        precio: 1899,
    },
    {
        id: 602,
        nombre: "SSD Interno 500GB",
        imagen: "/products/ssd-500gb.jpg",
        precio: 1499,
    },
    ];

    return (
    <div className="p-6 pt-28 bg-white min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Discos Duros</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {productos.map((producto) => (
            <TarjetaProducto key={producto.id} producto={producto} />
        ))}
        </div>
    </div>
    );
}

export default DiscosDuros;
