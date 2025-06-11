import React from "react";
import { useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";

function DetalleProducto() {
    const { id } = useParams();
    const location = useLocation();
    const producto = location.state?.producto;

    if (!producto) {
    return (
        <div className="pt-24 text-center text-gray-500 text-xl">
        Producto no encontrado.
        </div>
    );
    }

    return (
    <main className="pt-24 px-4 sm:px-6 lg:px-12 pb-16 bg-white min-h-screen flex flex-col lg:flex-row gap-10 items-center justify-center">
        <img
        src={producto.imagen}
        alt={producto.nombre}
        className="w-72 h-72 object-cover rounded-xl shadow-md"
        />
        <div className="max-w-xl">
        <h1 className="text-3xl font-bold mb-3 text-gray-800">{producto.nombre}</h1>
        <p className="text-pink-600 text-2xl font-bold mb-4">${producto.precio}</p>
        <p className="text-gray-600 mb-6">
            Este es un producto de alta calidad con las mejores prestaciones del mercado.
        </p>
        <div className="flex gap-4">
            <button className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2 rounded-lg transition">
            🛒 Agregar al carrito
            </button>
            <button className="border border-pink-500 text-pink-500 px-5 py-2 rounded-lg hover:bg-pink-100 transition">
            ❤️ Favorito
            </button>
        </div>
        </div>
    </main>
    );
}

export default DetalleProducto;
