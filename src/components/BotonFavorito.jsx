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
      className="text-2xl transition-transform hover:scale-110"
      title={esFavorito ? "Quitar de favoritos" : "Agregar a favoritos"}
    >
      {esFavorito ? "❤️" : "🤍"}
    </button>
  );
}

export default BotonFavorito;
