// src/components/TarjetaProducto.jsx
import React from "react";
import BotonFavorito from "./BotonFavorito"; // ⬅️ Importamos el nuevo botón ❤️

function TarjetaProducto({ producto }) {
  return (
    <div className="card relative">
      <div className="bg"></div>
      <div className="blob"></div>

      {/* Ícono de favorito arriba a la derecha */}
      <div className="absolute top-2 right-2 z-20">
        <BotonFavorito producto={producto} />
      </div>

      <img
        src={producto.imagen}
        alt={producto.nombre}
        className="relative w-32 h-32 object-contain z-10"
      />
      <h3 className="relative z-10 mt-4 text-center font-semibold text-gray-900">
        {producto.nombre}
      </h3>
      <p className="relative z-10 text-center text-indigo-600 font-bold">
        ${producto.precio.toFixed(2)}
      </p>
    </div>
  );
}

export default TarjetaProducto;
