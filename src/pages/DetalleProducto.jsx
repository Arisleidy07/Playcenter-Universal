// src/pages/DetalleProducto.jsx
import React from "react";
import { useParams } from "react-router-dom";

const productosMock = [
    {
    id: 1,
    nombre: "Audífonos Sony WH-1000XM5",
    imagen: "/products/sony-wh1000xm5.png",
    precio: 349.99,
    descripcion: "Cancelación de ruido líder, hasta 30h de batería, diseño premium.",
    },
    {
    id: 2,
    nombre: "AirPods Pro 2da Gen",
    imagen: "/products/airpods-pro-2.png",
    precio: 249.99,
    descripcion: "Audio espacial personalizado, chip H2 de Apple, resistente al agua.",
    },
];

function DetalleProducto() {
    const { id } = useParams();
    const producto = productosMock.find((p) => p.id === parseInt(id));

    if (!producto) {
    return (
        <div className="pt-24 text-center text-red-600 font-semibold">
        Producto no encontrado
        </div>
    );
    }

    return (
    <div className="pt-24 px-4 lg:px-20 py-10 bg-white min-h-screen flex flex-col lg:flex-row gap-10 items-start">
      {/* Imagen del producto */}
        <div className="w-full lg:w-1/2 flex justify-center">
        <img
            src={producto.imagen}
            alt={producto.nombre}
            className="w-[300px] sm:w-[400px] lg:w-[500px] object-contain border p-4 rounded-lg shadow"
        />
        </div>

      {/* Info del producto */}
        <div className="w-full lg:w-1/2 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">{producto.nombre}</h1>
        <p className="text-gray-700 text-lg">{producto.descripcion}</p>
        <p className="text-2xl font-bold text-pink-600">${producto.precio}</p>

        <div className="flex gap-4 mt-6">
            <button className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2 rounded shadow">
            Agregar al carrito
            </button>
            <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded shadow">
            Añadir a favoritos ❤️
            </button>
        </div>
        </div>
    </div>
    );
}

export default DetalleProducto;
