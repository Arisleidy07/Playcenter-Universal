import React from "react";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";

function TarjetaProducto({ producto }) {
  const {
    agregarAlCarrito,
    favoritos,
    agregarAFavoritos,
    eliminarDeFavoritos,
  } = useCarrito();

  const navigate = useNavigate();
  const esFavorito = favoritos.some((p) => p.id === producto.id);

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
    <div onClick={handleIrADetalle} className="card cursor-pointer">
      {/* BLOBS Y FONDO */}
      <div className="blob"></div>
      <div className="bg"></div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-3">
        {/* Imagen */}
        <img
          src={producto.imagen}
          alt={producto.nombre}
          className="h-24 w-24 object-contain mb-2"
        />

        {/* Nombre y precio */}
        <h3 className="text-center text-gray-800 font-semibold text-sm truncate w-full">
          {producto.nombre}
        </h3>
        <p className="text-pink-600 font-bold text-base mt-1">
          ${producto.precio.toFixed(2)}
        </p>

        {/* BOTONES */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
          <button
            onClick={toggleFavorito}
            className="p-2 rounded-full bg-white shadow hover:scale-110 transition"
            title={esFavorito ? "Quitar de favoritos" : "Agregar a favoritos"}
          >
            <FaHeart
              className={`text-lg ${
                esFavorito
                  ? "text-red-500 animate-pulse"
                  : "text-gray-400 hover:text-red-400"
              }`}
            />
          </button>

          <button
            onClick={handleAgregarAlCarrito}
            className="p-2 rounded-full bg-white shadow hover:scale-110 transition"
            title="Agregar al carrito"
          >
            <FaShoppingCart className="text-lg text-gray-400 hover:text-pink-500" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default TarjetaProducto;
