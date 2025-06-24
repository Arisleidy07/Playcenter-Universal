import React from "react";
import TarjetaProducto from "../../components/TarjetaProducto";

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
        precio: 45.0,
    },
    {
        id: 173,
        nombre: "Controlador de voz Alexa",
        imagen: "/products/control-voz-alexa.jpg",
        precio: 32.0,
    },
    ];

    return (
    <div className="p-6 pt-28 bg-white min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Hogar Inteligente</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {productos.map((producto) => (
            <TarjetaProducto key={producto.id} producto={producto} />
        ))}
        </div>
    </div>
    );
}

export default HogarInteligente;
