// src/pages/ProductosTodos.jsx
import React from "react";
import productosAll from "../data/productosAll";

function ProductosTodos() {
  const productos = productosAll.flatMap((cat) =>
    cat.productos.map((prod) => ({
      ...prod,
      categoria: cat.categoria,
    }))
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {productos.map((producto) => (
        <div key={producto.id} className="p-4 bg-white rounded-xl shadow hover:shadow-lg transition-all">
          <img
            src={producto.imagen}
            alt={producto.nombre}
            className="w-full h-40 object-contain mb-2"
          />
          <h2 className="font-semibold text-gray-800">{producto.nombre}</h2>
          <p className="text-pink-600 font-bold">${producto.precio}</p>
        </div>
      ))}
    </div>
  );
}

export default ProductosTodos;
