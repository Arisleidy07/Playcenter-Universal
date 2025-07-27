import React from "react";
import productosAl from "./productosAl"; // Tu archivo con productos
import TarjetaProducto from "./TarjetaProducto";

function ListaConsolas() {
  const categoria = productosAl.find((c) => c.categoria === "Consolas");

  if (!categoria) return <p>No hay productos en esta categoría.</p>;

  return (
    <div className="flex flex-wrap gap-6 justify-center p-8 bg-gray-50 min-h-screen">
      {categoria.productos.map((producto) => (
        <TarjetaProducto key={producto.id} producto={producto} />
      ))}
    </div>
  );
}

export default ListaConsolas;
