import React from "react";

function RelojesInteligentes() {
    const productos = [
        {
            id: 1,
            nombre: "Smartwatch Apple Watch Series 9",
            imagen: "/products/apple-watch.png",
            precio: "$429.99",
        },
        {
            id: 2,
            nombre: "Samsung Galaxy Watch 6",
            imagen: "/products/galaxy-watch.png",
            precio: "$349.99",
        },
        {
            id: 3,
            nombre: "Xiaomi Mi Band 8 Pro",
            imagen: "/products/mi-band.png",
            precio: "$59.99",
        },
    ];

    return (
        <div className="p-6 pt-28">
            <h1 className="text-3xl font-bold mb-6 text-indigo-600">🕒 Relojes Inteligentes</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {productos.map((producto) => (
                    <div
                        key={producto.id}
                        className="border rounded-lg p-4 shadow-lg hover:scale-105 transition-transform duration-300 bg-white"
                    >
                        <img
                            src={producto.imagen}
                            alt={producto.nombre}
                            className="w-full h-48 object-contain"
                        />
                        <h2 className="mt-4 text-lg font-semibold">{producto.nombre}</h2>
                        <p className="text-indigo-500 font-bold">{producto.precio}</p>
                        <button className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors">
                            Agregar al carrito
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default RelojesInteligentes;
