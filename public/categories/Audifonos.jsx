import React from "react";
import { useNavigate } from "react-router-dom";

function Audifonos() {
    const navigate = useNavigate();

    const productos = [
        {
            id: 1,
            nombre: "Audífonos Sony WH-1000XM5",
            imagen: "/products/sony-wh1000xm5.png",
            precio: "$349.99",
        },
        {
            id: 2,
            nombre: "AirPods Pro 2da Gen",
            imagen: "/products/airpods-pro-2.png",
            precio: "$249.99",
        },
        {
            id: 3,
            nombre: "Beats Studio3 Wireless",
            imagen: "/products/beats-studio3.png",
            precio: "$299.99",
        },
    ];

    const verDetalle = (producto) => {
        navigate(`/producto/${producto.id}`, { state: { producto } });
    };

    return (
        <div className="p-6 pt-28">
            <h1 className="text-3xl font-bold mb-6 text-rose-600">Audífonos</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {productos.map((producto) => (
                    <div
                        key={producto.id}
                        onClick={() => verDetalle(producto)}
                        className="card cursor-pointer"
                    >
                        <div className="bg z-10 flex flex-col items-center justify-center p-3">
                            <img src={producto.imagen} alt={producto.nombre} className="w-28 h-28 object-contain" />
                            <h2 className="text-center font-semibold mt-3">{producto.nombre}</h2>
                            <p className="text-rose-500 font-bold">{producto.precio}</p>
                        </div>
                        <div className="blob"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Audifonos;

