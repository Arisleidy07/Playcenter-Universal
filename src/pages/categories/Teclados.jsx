    import React from "react";
    import TarjetaProducto from "../../components/TarjetaProducto";
    import productosAll from "../../data/productosAll";
    import { normalizar } from "../../utils/normalizarCategoria";

    function Teclados() {
    const categoria = productosAll.find(
        (cat) => cat.categoria === "Teclados"
    );
    const productos = categoria ? categoria.productos : [];

    return (
        <div className="p-6 pt-28 bg-white min-h-screen">
        <h1 className="titulo-categoria">Teclados</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            {productos.map((producto) => (
            <TarjetaProducto key={producto.id} producto={producto} />
            ))}
        </div>
        </div>
    );
    }

    export default Teclados;
