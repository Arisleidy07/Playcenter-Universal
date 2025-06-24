import React from "react";
import TarjetaProducto from "../../components/TarjetaProducto";

function Camaras() {
    const productos = [
    {
        id: 301,
        nombre: "Cámara DSLR Canon EOS",
        imagen: "/products/camara-canon.jpg",
        precio: 499.99,
    },
    {
        id: 302,
        nombre: "Cámara de Seguridad Wifi",
        imagen: "/products/camara-seguridad.jpg",
        precio: 89.99,
    },
    ];

    return (
    <div className="p-6 pt-28 bg-white min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Cámaras</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {productos.map((producto) => (
            <TarjetaProducto key={producto.id} producto={producto} />
        ))}
        </div>
    </div>
    );
}

export default Camaras;
