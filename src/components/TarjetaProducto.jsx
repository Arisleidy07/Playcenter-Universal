import React, { useContext } from "react";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import { useCarrito } from "../context/CarritoContext";

function TarjetaProducto({ producto }) {
  const {
    agregarAlCarrito,
    favoritos,
    agregarAFavoritos,
    eliminarDeFavoritos,
  } = useCarrito();

  const esFavorito = favoritos.some((p) => p.id === producto.id);

  const toggleFavorito = () => {
    esFavorito
      ? eliminarDeFavoritos(producto.id)
      : agregarAFavoritos(producto);
  };

  return (
    <div className="relative bg-white rounded-2xl shadow group overflow-hidden transition-all hover:shadow-xl hover:scale-[1.015] duration-300 border border-gray-200">
      {/* Íconos animados arriba a la derecha */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
        <button
          onClick={toggleFavorito}
          className="p-2 rounded-full bg-white shadow hover:scale-110 transform transition"
        >
          <FaHeart
            className={`text-xl transition-colors duration-300 ${
              esFavorito
                ? "text-red-500 animate-pulse"
                : "text-gray-400 group-hover:text-red-400"
            }`}
          />
        </button>

        <button
          onClick={() => agregarAlCarrito(producto)}
          className="p-2 rounded-full bg-white shadow hover:scale-110 transform transition"
        >
          <FaShoppingCart className="text-xl text-gray-400 group-hover:text-pink-500 transition-colors duration-300" />
        </button>
      </div>

      {/* Imagen */}
      <div className="flex justify-center items-center h-40 bg-gray-50 group-hover:bg-pink-50 transition">
        <img
          src={producto.imagen}
          alt={producto.nombre}
          className="h-28 w-28 object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Info del producto */}
      <div className="p-4 text-center">
        <h3 className="text-base font-semibold text-gray-800 truncate">{producto.nombre}</h3>
        <p className="text-pink-600 font-bold text-lg">${producto.precio.toFixed(2)}</p>
      </div>
    </div>
  );
}

export default TarjetaProducto;
