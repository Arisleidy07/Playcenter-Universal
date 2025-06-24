import React from "react";
import TarjetaProducto from "../../components/TarjetaProducto";

function Laptops() {
    const productos = [
    {
        id: 170,
        nombre: "Laptop ASUS Gaming 16GB RAM",
        imagen: "/products/laptop-asus.jpg",
        precio: 849.99,
    },
    {
        id: 171,
        nombre: "MacBook Air M2",
        imagen: "/products/macbook-air.jpg",
        precio: 999.99,
    },
    ];

    return (
    <div className="p-6 pt-28 bg-white min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Laptops</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {productos.map((producto) => (
            <TarjetaProducto key={producto.id} producto={producto} />
        ))}
        </div>
    </div>
    );
}

export default Laptops;
