import React from "react";
import "../../styles/blobCard.css";
import { useNavigate } from "react-router-dom";
import BotonFavorito from "../../components/BotonFavorito";
import { useCarrito } from "../../context/CarritoContext";

function AccesoriosVideojuegos() {
    const navigate = useNavigate();
    const { agregarAlCarrito } = useCarrito();

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

    const handleClick = (producto) => {
    navigate(`/producto/${producto.id}`, {
        state: { producto },
    });
    };

    return (
    <div className="p-6 pt-28 bg-white min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Accesorios para Videojuegos</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {productos.map((producto) => (
            <div
                key={producto.id}
                className="card relative transform transition-transform duration-300 hover:scale-105 cursor-pointer"
                onClick={() => navigate(`/producto/${producto.id}`, { state: { producto } })}
                >
            <div className="bg"></div>
            <div className="blob"></div>

            <div className="z-10 text-center p-4">
                <img
                src={producto.imagen}
                alt={producto.nombre}
                className="w-32 h-32 object-contain mx-auto mb-2"
                />
                <h2 className="font-semibold text-gray-800">{producto.nombre}</h2>
                <p className="text-pink-600 font-bold">${producto.precio}</p>
            </div>

            <div
                className="z-20 relative flex justify-between items-center px-4 py-2 border-t"
                onClick={(e) => e.stopPropagation()}
            >
                <BotonFavorito producto={producto} />
                <button
                onClick={() => agregarAlCarrito(producto)}
                className="bg-pink-500 text-white px-3 py-1 rounded-full text-sm hover:bg-pink-600"
                >
                🛒 Agregar
                </button>
            </div>
            </div>
        ))}
        </div>
    </div>
    );
}

export default AccesoriosVideojuegos;
