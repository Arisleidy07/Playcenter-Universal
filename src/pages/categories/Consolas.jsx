    import React from "react";
    import TarjetaProducto from "../../components/TarjetaProducto";
    import productosAll from "../../data/productosAll";
    import { normalizar } from "../../utils/normalizarCategoria";
        import "../../styles/productosGrid.css";

    function Consolas() {
    const categoria = productosAll.find(
        (cat) => normalizar(cat.categoria) === normalizar("Consolas")
    );
    const productos = categoria ? categoria.productos : [];

    return (
    <div className="px-4 sm:px-6 lg:px-10 pt-6 pb-10 bg-white min-h-screen">
        <h1 className="titulo-categoria">
        Consolas
        </h1>

        <div className="productos-grid mt-6">
        {productos.map((producto) => (
            <TarjetaProducto key={producto.id} producto={producto} />
        ))}
        </div>
    </div>
    );

    }

    export default Consolas;
