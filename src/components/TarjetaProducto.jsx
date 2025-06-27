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
    eliminarDelCarrito,
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

  const handleToggleCarrito = (e) => {
    e.stopPropagation();
    if (enCarrito) {
      eliminarDelCarrito(producto.id);
    } else {
      agregarAlCarrito(producto);
    }
  };

  const handleIrADetalle = () => {
    navigate(`/producto/${producto.id}`, { state: { producto } });
  };

  return (
    <div
      onClick={handleIrADetalle}
      className="card bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition duration-300 cursor-pointer"
      title={producto.nombre}
    >
      {/* Imagen */}
      <div className="flex justify-center items-center h-40 bg-gray-100 rounded-xl mb-4">
        <img
          src={producto.imagen}
          alt={producto.nombre}
          className="w-40 h-40 object-contain rounded-lg shadow"
        />
      </div>

      {/* Info */}
      <h2 className="text-gray-800 font-bold text-base">{producto.nombre}</h2>
      <p className="text-gray-600 font-semibold mb-3">${producto.precio.toFixed(2)}</p>

      {/* Botones */}
      <div className="actions flex justify-between items-center">
        {/* Botón Favorito */}
        <button
          onClick={toggleFavorito}
          className="p-2 rounded-full bg-gray-200 shadow hover:scale-110 transition"
          aria-label={esFavorito ? "Eliminar de favoritos" : "Agregar a favoritos"}
        >
          <FaHeart
            className={`text-xl ${
              esFavorito ? "text-red-500 animate-pulse" : "text-gray-500 hover:text-red-400"
            }`}
          />
        </button>

        {/* Botón Carrito */}
        <button
          onClick={handleToggleCarrito}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors duration-300 shadow ${
            enCarrito
              ? "bg-green-500 text-white hover:bg-green-600"
              : "bg-pink-500 text-white hover:bg-pink-600"
          }`}
        >
          🛒 {enCarrito ? "Quitar" : "Agregar"}
        </button>
      </div>
    </div>
  );
}

export default TarjetaProducto;
