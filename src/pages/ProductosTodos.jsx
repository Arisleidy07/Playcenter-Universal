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
    <div className="p-6 bg-white min-h-screen max-w-7xl mx-auto">
      <h1 className="titulo-categoria">Todos los Productos</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {productos.map((producto) => (
          <TarjetaProducto key={producto.id} producto={producto} />
        ))}
      </div>
    </div>
  );
}

export default ProductosTodos;
