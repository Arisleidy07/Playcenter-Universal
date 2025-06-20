import React from "react";
import { Link } from "react-router-dom";
import "../../styles/blobCard.css";
import BotonFavorito from "../../components/BotonFavorito";
import { useNavigate } from "react-router-dom";
import { useCarrito } from "../../context/CarritoContext";



function NuevosLanzamientos() {
    const navigate = useNavigate();
    const { agregarAlCarrito } = useCarrito();

    const productos = [
    {
        id: 230,
        nombre: "Tablet Galaxy S9 Ultra",
        imagen: "/products/galaxy-s9-ultra.jpg",
        precio: 999.99,
    },
    {
        id: 231,
        nombre: "PlayStation 6 - Próximamente",
        imagen: "/products/ps6.jpg",
        precio: 799.99,
    },
    ];

    return (
    <div className="p-6 pt-28 bg-white min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Nuevos Lanzamientos</h1>
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

export default NuevosLanzamientos;
