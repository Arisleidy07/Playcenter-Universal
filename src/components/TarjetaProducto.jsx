import React from "react";
import { FaHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";

function TarjetaProducto({ producto }) {
  const {
    agregarAlCarrito,
    favoritos,
    carrito,
    agregarAFavoritos,
    eliminarDeFavoritos,
  } = useCarrito();

  const navigate = useNavigate();
  const esFavorito = favoritos.some((p) => p.id === producto.id);
  const enCarrito = carrito.some((p) => p.id === producto.id);

  const toggleFavorito = (e) => {
    e.stopPropagation();
    esFavorito
      ? eliminarDeFavoritos(producto.id)
      : agregarAFavoritos(producto);
  };

  const handleAgregarAlCarrito = (e) => {
    e.stopPropagation();
    agregarAlCarrito(producto);
  };

  const handleIrADetalle = () => {
    navigate(`/producto/${producto.id}`, { state: { producto } });
  };

  return (
    <div
      onClick={handleIrADetalle}
      className="card"
      title={producto.nombre}
    >
      {/* Imagen */}
      <div className="flex justify-center items-center h-40 bg-gray-900 rounded-xl mb-4">
        <img
          src={producto.imagen}
          alt={producto.nombre}
          className="w-40 h-40 object-contain rounded-lg shadow-lg"
        />
      </div>

      {/* Info */}
      <h2>{producto.nombre}</h2>
      <p>${producto.precio.toFixed(2)}</p>

      {/* Botones */}
      <div className="actions">
        {/* Botón Favorito */}
        <button
          onClick={toggleFavorito}
          className="p-2 rounded-full bg-gray-800 shadow hover:scale-110 transition"
          aria-label={esFavorito ? "Eliminar de favoritos" : "Agregar a favoritos"}
        >
          <FaHeart
            className={`text-xl ${
              esFavorito ? "text-red-500 animate-pulse" : "text-gray-400 hover:text-red-400"
            }`}
          />
        </button>

        {/* Botón Carrito */}
        <button
          onClick={handleAgregarAlCarrito}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors duration-300 shadow ${
            enCarrito
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-pink-600 text-white hover:bg-pink-700"
          }`}
        >
          🛒 {enCarrito ? "Agregado" : "Agregar"}
        </button>
      </div>
    </div>
  );
}

export default TarjetaProducto;
