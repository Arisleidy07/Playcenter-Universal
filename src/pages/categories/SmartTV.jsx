    import React from "react";
    import TarjetaProducto from "../../components/TarjetaProducto";
    import productosAll from "../../data/productosAll";
    import { normalizar } from "../../utils/normalizarCategoria";

    function SmartTV() {
const categoria = productosAll.find(
    (cat) => normalizar(cat.categoria) === normalizar("SmartTV")
);
    const productos = categoria ? categoria.productos : [];

    return (
        <div className="pt-[0px] sm:pt-[0px] px-4 pb-10 bg-white min-h-screen">
        <h1 className="titulo-categoria">Smart TV</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            {productos.map((producto) => (
            <TarjetaProducto key={producto.id} producto={producto} />
            ))}
        </div>
        </div>
    );
    }

    export default SmartTV;
