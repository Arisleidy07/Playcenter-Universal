import React from "react";
import TarjetaProducto from "../../components/TarjetaProducto";

function OfertasEspeciales() {
    const productos = [
    {
        id: 240,
        nombre: "Combo Gamer: Teclado + Mouse + Audífonos",
        imagen: "/products/combo-gamer.jpg",
        precio: 59.99,
    },
    {
        id: 241,
        nombre: "TV 4K con Descuento",
        imagen: "/products/tv-4k-descuento.jpg",
        precio: 299.99,
    },
    ];

    return (
    <div className="p-6 pt-28 bg-white min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Ofertas Especiales</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {productos.map((producto) => (
            <TarjetaProducto key={producto.id} producto={producto} />
        ))}
        </div>
    </div>
    );
}

export default OfertasEspeciales;
