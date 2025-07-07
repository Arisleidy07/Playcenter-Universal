import React from "react";
import productosAll from "../data/productosAll";
import TarjetaProducto from "../components/TarjetaProducto";

function ProductosTodos() {
  const productos = productosAll.flatMap((cat) =>
    cat.productos.map((prod) => ({
      ...prod,
      categoria: cat.categoria,
    }))
  );

    return (
    <div className="px-4 sm:px-6 lg:px-10 pt-6 pb-10 bg-white min-h-screen">
        <h1 className="titulo-categoria">
        Todos nuestros productos
        </h1>

        <div className="productos-grid mt-6">
        {productos.map((producto) => (
            <TarjetaProducto key={producto.id} producto={producto} />
        ))}
        </div>
    </div>
    );
}

export default ProductosTodos;
