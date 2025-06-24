import React from "react";
import TarjetaProducto from "../../components/TarjetaProducto";

function Electrodomesticos() {
    const productos = [
    {
        id: 701,
        nombre: "Microondas Digital",
        imagen: "/products/microondas.jpg",
        precio: 2499,
    },
    {
        id: 702,
        nombre: "Refrigerador 2 Puertas",
        imagen: "/products/refrigerador.jpg",
        precio: 7899,
    },
    ];

    return (
    <div className="p-6 pt-28 bg-white min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Electrodomésticos</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {productos.map((producto) => (
            <TarjetaProducto key={producto.id} producto={producto} />
        ))}
        </div>
    </div>
    );
}

export default Electrodomesticos;
