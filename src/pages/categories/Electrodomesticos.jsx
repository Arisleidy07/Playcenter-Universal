import React from "react";
import { Link } from "react-router-dom";

function Electrodomesticos() {
    const productos = [
        {
            id: 1,
            nombre: "Freidora de Aire Digital 4L",
            imagen: "/products/freidora.png",
            precio: "$79.99",
        },
        {
            id: 2,
            nombre: "Licuadora Oster 10 velocidades",
            imagen: "/products/licuadora.png",
            precio: "$49.99",
        },
        {
            id: 3,
            nombre: "Microondas Panasonic 1200W",
            imagen: "/products/microondas.png",
            precio: "$129.99",
        },
    ];

    return (
        <div className="p-6 pt-28 bg-white min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Electrodomésticos</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {productos.map((producto) => (
                    <Link to={`/producto/${producto.id}`} key={producto.id}>
                        <div className="card transform transition-transform hover:scale-[1.02]">
                            <div className="bg flex flex-col items-center justify-center text-center p-4">
                                <img
                                    src={producto.imagen}
                                    alt={producto.nombre}
                                    className="w-24 h-24 object-contain mb-3"
                                />
                                <h2 className="font-semibold text-gray-700">{producto.nombre}</h2>
                                <p className="text-pink-600 font-bold">{producto.precio}</p>
                            </div>
                            <div className="blob"></div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default Electrodomesticos;
