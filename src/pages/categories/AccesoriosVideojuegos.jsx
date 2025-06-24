import React from "react";
import TarjetaProducto from "../../components/TarjetaProducto";

function AccesoriosVideojuegos() {
    const productos = [
    {
        id: 1,
        nombre: "Soporte de control PS5 doble carga",
        imagen: "/products/soporte-controles.jpg",
        precio: 25.99,
    },
    {
        id: 2,
        nombre: "Base refrigeradora para consola Xbox",
        imagen: "/products/base-refrigeracion.jpg",
        precio: 34.99,
    },
    {
        id: 3,
        nombre: "Auriculares Gaming con micrófono",
        imagen: "/products/auriculares-gamer.jpg",
        precio: 44.99,
    },
    {
        id: 4,
        nombre: "Grip antideslizante para Nintendo Switch",
        imagen: "/products/grip-switch.jpg",
        precio: 14.99,
    },
    ];

    return (
    <div className="p-6 pt-28 bg-white min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">
        Accesorios para Videojuegos
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {productos.map((producto) => (
            <TarjetaProducto key={producto.id} producto={producto} />
        ))}
        </div>
    </div>
    );
}

export default AccesoriosVideojuegos;