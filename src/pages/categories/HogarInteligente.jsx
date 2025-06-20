import React from "react";
import { Link } from "react-router-dom";
import "../../styles/blobCard.css";
import BotonFavorito from "../../components/BotonFavorito";


function HogarInteligente() {
    const productos = [
    {
        id: 170,
        nombre: "Bombillo Inteligente RGB",
        imagen: "/products/bombillo-inteligente.jpg",
        precio: 18.99,
    },
    {
        id: 171,
        nombre: "Enchufe WiFi con control remoto",
        imagen: "/products/enchufe-wifi.jpg",
        precio: 22.49,
    },
    {
        id: 172,
        nombre: "Cámara de seguridad inteligente",
        imagen: "/products/camara-inteligente.jpg",
        precio: 45.00,
    },
    {
        id: 173,
        nombre: "Controlador de voz Alexa",
        imagen: "/products/control-voz-alexa.jpg",
        precio: 32.00,
    },
    ];

    return (
    <div className="p-6 pt-28 bg-white min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Hogar Inteligente</h1>
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

export default HogarInteligente;
