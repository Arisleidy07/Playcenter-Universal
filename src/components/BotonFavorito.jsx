// src/components/BotonFavorito.jsx
import React from "react";
import { useCarrito } from "../context/CarritoContext";

function BotonFavorito({ producto }) {
  const { favoritos, agregarAFavoritos, eliminarDeFavoritos } = useCarrito();
  const esFavorito = favoritos.some((p) => p.id === producto.id);

  const toggle = () => {
    esFavorito ? eliminarDeFavoritos(producto.id) : agregarAFavoritos(producto);
  };

  return (
    <button
      onClick={toggle}
      className={`px-3 py-1 rounded-full text-sm border transition-all ${
        esFavorito
          ? "bg-rose-500 text-white border-rose-500 hover:bg-rose-600"
          : "border-rose-500 text-rose-500 hover:bg-rose-100"
      }`}
      title={esFavorito ? "Quitar de favoritos" : "Agregar a favoritos"}
    >
      {esFavorito ? "❤️" : "🤍"}
    </button>

  );
}

export default BotonFavorito;
