import React from "react";
import TarjetaProducto from "../../components/TarjetaProducto";

function Tablets() {
    const productos = [
    {
        id: 270,
        nombre: "iPad 10ª Generación",
        imagen: "/products/ipad.jpg",
        precio: 429.99,
    },
    {
        id: 271,
        nombre: "Samsung Galaxy Tab S8",
        imagen: "/products/galaxy-tab.jpg",
        precio: 499.99,
    },
    ];

    return (
    <div className="p-6 pt-28 bg-white min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Tablets</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {productos.map((producto) => (
            <TarjetaProducto key={producto.id} producto={producto} />
        ))}
        </div>
    </div>
    );
}

export default Tablets;
