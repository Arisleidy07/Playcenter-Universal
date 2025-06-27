    import React from "react";
    import TarjetaProducto from "../../components/TarjetaProducto";
    import productosAll from "../../data/productosAll";

    function Impresoras() {
    const categoria = "Impresoras";
    const productos = productosAll.find(cat => cat.categoria === categoria)?.productos || [];

    return (
        <div className="p-6 pt-28 bg-white min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Impresoras</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productos.map(producto => (
            <TarjetaProducto key={producto.id} producto={producto} />
            ))}
        </div>
        </div>
    );
    }

    export default Impresoras;
