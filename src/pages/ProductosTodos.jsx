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
    <div className="">
      <h1 className="titulo-categoria">Todos los Productos</h1>
      
      <div className="">
        {productos.map((producto) => (
          <TarjetaProducto key={producto.id} producto={producto} />
        ))}
      </div>
    </div>
  );
}

export default ProductosTodos;
