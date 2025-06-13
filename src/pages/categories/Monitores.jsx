import React from "react";
import { Link } from "react-router-dom";

function Monitores() {
    const productos = [
    {
        id: 1201,
        nombre: "Monitor LG 24'' FHD",
        imagen: "/products/monitor-lg.jpg",
        precio: 169.99,
    },
    {
        id: 1202,
        nombre: "Monitor Samsung Curvo 27''",
        imagen: "/products/monitor-samsung.jpg",
        precio: 219.99,
    },
    ];

    return (
    <div className="p-6 pt-28 bg-white min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Monitores</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {productos.map((producto) => (
            <Link to={`/producto/${producto.id}`} key={producto.id}>
            <div className="bg-white p-4 shadow hover:shadow-lg rounded transition duration-300">
                <img
                src={producto.imagen}
                alt={producto.nombre}
                className="w-full h-40 object-contain mb-2"
                />
                <h2 className="font-semibold">{producto.nombre}</h2>
                <p className="text-pink-600 font-bold">${producto.precio}</p>
            </div>
            </Link>
        ))}
        </div>
    </div>
    );
}

export default Monitores;
