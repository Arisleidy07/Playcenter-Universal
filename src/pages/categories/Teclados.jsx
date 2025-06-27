    import React from "react";
    import TarjetaProducto from "../../components/TarjetaProducto";
    import productosAll from "../../data/productosAll";

    function Teclados() {
    const productos = productosAll.teclados;

    return (
        <div className="p-6 pt-28 bg-white min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Teclados</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {productos.map((producto) => (
            <TarjetaProducto key={producto.id} producto={producto} />
            ))}
        </div>
        </div>
    );
    }

    export default Teclados;
