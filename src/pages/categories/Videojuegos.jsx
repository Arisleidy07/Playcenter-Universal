import React from "react";
import TarjetaProducto from "../../components/TarjetaProducto";

function Videojuegos() {
    const productos = [
    {
        id: 290,
        nombre: "FIFA 24 - PS5",
        imagen: "/products/fifa24.jpg",
        precio: 69.99,
    },
    {
        id: 291,
        nombre: "The Legend of Zelda: TOTK - Switch",
        imagen: "/products/zelda.jpg",
        precio: 59.99,
    },
    ];

    return (
    <div className="p-6 pt-28 bg-white min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Videojuegos</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {productos.map((producto) => (
            <TarjetaProducto key={producto.id} producto={producto} />
        ))}
        </div>
    </div>
    );
}

export default Videojuegos;
