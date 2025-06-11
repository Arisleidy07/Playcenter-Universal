import React from "react";

function DiscosDuros() {
    const productos = [
        {
            id: 1,
            nombre: "Disco Duro Externo 1TB - WD",
            imagen: "/products/disco-externo-1tb.png",
            precio: "$59.99",
        },
        {
            id: 2,
            nombre: "SSD Interno 500GB - Kingston",
            imagen: "/products/ssd-500gb.png",
            precio: "$79.99",
        },
        {
            id: 3,
            nombre: "HDD Interno 2TB - Seagate",
            imagen: "/products/hdd-2tb.png",
            precio: "$89.99",
        },
    ];

    return (
        <div className="p-6 pt-28 bg-white min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-purple-700">Discos Duros</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {productos.map((producto) => (
                    <div
                        key={producto.id}
                        className="card relative cursor-pointer"
                    >
                        <div className="bg"></div>
                        <div className="blob"></div>
                        <div className="z-10 text-center p-4">
                            <img
                                src={producto.imagen}
                                alt={producto.nombre}
                                className="w-full h-40 object-contain mx-auto mb-3"
                            />
                            <h2 className="text-lg font-semibold">{producto.nombre}</h2>
                            <p className="text-pink-600 font-bold">{producto.precio}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default DiscosDuros;
