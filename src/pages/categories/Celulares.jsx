import React from "react";
import TarjetaProducto from "../../components/TarjetaProducto";

function Celulares() {
    const productos = [
    {
        id: 501,
        nombre: "iPhone 14 Pro Max",
        imagen: "/products/iphone14.jpg",
        precio: 1199.99,
    },
    {
        id: 502,
        nombre: "Samsung Galaxy S23",
        imagen: "/products/samsung-s23.jpg",
        precio: 1099.99,
    },
    ];

    return (
    <div className="p-6 pt-28 bg-white min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Celulares</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {productos.map((producto) => (
            <TarjetaProducto key={producto.id} producto={producto} />
        ))}
        </div>
    </div>
    );
}

export default Celulares;
