import React from "react";
import TarjetaProducto from "../../components/TarjetaProducto";

function MemoriasUSB() {
    const productos = [
    {
        id: 180,
        nombre: "USB 3.0 Kingston 64GB",
        imagen: "/products/usb-kingston.jpg",
        precio: 14.99,
    },
    {
        id: 181,
        nombre: "USB SanDisk 128GB",
        imagen: "/products/usb-sandisk.jpg",
        precio: 22.99,
    },
    ];

    return (
    <div className="p-6 pt-28 bg-white min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Memorias USB</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {productos.map((producto) => (
            <TarjetaProducto key={producto.id} producto={producto} />
        ))}
        </div>
    </div>
    );
}

export default MemoriasUSB;
