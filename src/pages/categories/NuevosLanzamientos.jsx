import React from "react";
import { Link } from "react-router-dom";
import "../../styles/blobCard.css";
import BotonFavorito from "../../components/BotonFavorito";


function NuevosLanzamientos() {
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
            <Link
            to={`/producto/${producto.id}`}
            key={producto.id}
            className="card transform transition-transform duration-300 hover:scale-105"
            >
            <div className="bg"></div>
            <div className="blob"></div>
            <div className="absolute top-2 right-2 z-20">
                <BotonFavorito producto={producto} />
            </div>

            <img
                src={producto.imagen}
                alt={producto.nombre}
                className="z-10 w-32 h-32 object-contain mx-auto"
            />
            <h2 className="z-10 mt-4 font-semibold text-gray-800 text-center">
                {producto.nombre}
            </h2>
            <p className="z-10 text-pink-600 font-bold text-center">
                ${producto.precio}
            </p>
            </Link>
        ))}
        </div>
    </div>
    );
}

export default NuevosLanzamientos;
