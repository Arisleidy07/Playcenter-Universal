import React from "react";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";

function TarjetaProducto({ producto }) {
  const {
    agregarAlCarrito,
    favoritos,
    carrito, // 💥 FALTABA ESTO
    agregarAFavoritos,
    eliminarDeFavoritos,
  } = useCarrito();

  const navigate = useNavigate();
  const esFavorito = favoritos.some((p) => p.id === producto.id);
  const enCarrito = carrito.some((p) => p.id === producto.id); // más legible

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
      className="relative bg-white rounded-2xl shadow group overflow-hidden transition-all hover:shadow-xl hover:scale-[1.015] duration-300 border border-gray-200 cursor-pointer flex flex-col justify-between"
    >
      {/* Imagen */}
      <div className="flex justify-center items-center h-40 bg-gray-50 group-hover:bg-pink-50 transition">
        <img
          src={producto.imagen}
          alt={producto.nombre}
          className="h-28 w-28 object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Info */}
      <div className="p-4 text-center flex-1">
        <h3 className="text-base font-semibold text-gray-800 truncate">
          {producto.nombre}
        </h3>
        <p className="text-pink-600 font-bold text-lg">
          ${producto.precio.toFixed(2)}
        </p>
      </div>

      {/* Botones al fondo */}
      <div
        className="flex justify-between items-center border-t px-4 py-2 z-20 bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ❤️ Favorito */}
        <button
          onClick={toggleFavorito}
          className="p-2 rounded-full bg-white shadow hover:scale-110 transition"
        >
          <FaHeart
            className={`text-xl transition-colors duration-300 ${
              esFavorito
                ? "text-red-500 animate-pulse"
                : "text-gray-400 hover:text-red-400"
            }`}
          />
        </button>

        {/* 🛒 Carrito */}
        <button
          onClick={handleAgregarAlCarrito}
          className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors duration-300 shadow ${
            enCarrito
              ? "bg-green-500 text-white hover:bg-green-600"
              : "bg-pink-500 text-white hover:bg-pink-600"
          }`}
        >
          🛒 {enCarrito ? "Agregado" : "Agregar"}
        </button>
      </div>
    </div>
  );
}

export default TarjetaProducto;
