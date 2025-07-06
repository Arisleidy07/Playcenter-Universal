    import React from "react";
    import TarjetaProducto from "../../components/TarjetaProducto";
    import productosAll from "../../data/productosAll";
    import { normalizar } from "../../utils/normalizarCategoria";
    import "../../styles/productosGrid.css";


    function AccesoriosVideojuegos() {
    const categoria = productosAll.find(
        (cat) => normalizar(cat.categoria) === normalizar("AccesoriosVideojuegos")
    );
    const productos = categoria ? categoria.productos : [];

    return (
        <div className="px-4 sm:px-6 lg:px-10 pt-6 pb-10 bg-white min-h-screen">
        <h1 className="titulo-categoria">Accesorios Videojuegos</h1>

        <div className="productos-grid">
            {productos.map((producto) => (
            <TarjetaProducto key={producto.id} producto={producto} />
            ))}
        </div>
        </div>
    );
    }

    export default AccesoriosVideojuegos;
    // This component displays a list of video game accessories