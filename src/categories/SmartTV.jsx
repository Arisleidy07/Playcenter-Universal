import React from "react";

function SmartTV() {
    const productos = [
        {
            id: 1,
            nombre: "Samsung Smart TV 55'' UHD 4K",
            imagen: "/products/samsung-tv.png",
            precio: "$799.99",
        },
        {
            id: 2,
            nombre: "LG OLED Smart TV 65''",
            imagen: "/products/lg-oled.png",
            precio: "$1299.99",
        },
        {
            id: 3,
            nombre: "TCL Roku Smart TV 50''",
            imagen: "/products/tcl-roku.png",
            precio: "$599.99",
        },
    ];

    return (
        <div className="p-6 pt-28">
            <h1 className="text-3xl font-bold mb-6 text-red-600">📺 Smart TVs</h1>
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
                        <p className="text-red-500 font-bold">{producto.precio}</p>
                        <button className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                            Agregar al carrito
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default SmartTV;
