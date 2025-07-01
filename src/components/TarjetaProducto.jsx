import React from "react";
import { FaShoppingCart, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";

function TarjetaProducto({ producto }) {
  const { carrito, agregarAlCarrito, quitarDelCarrito } = useCarrito();
  const navigate = useNavigate();

  const estaEnCarrito = carrito.some((p) => p.id === producto.id);

  const handleBoton = (e) => {
    e.stopPropagation();
    if (estaEnCarrito) {
      quitarDelCarrito(producto.id);
    } else {
      agregarAlCarrito(producto);
    }
  };

  const irADetalle = () => {
    navigate(`/producto/${producto.id}`, { state: { producto } });
  };

  return (
    <div
      onClick={irADetalle}
      className="flex items-start gap-5 bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer w-full p-5 sm:p-6"
    >
      <img
        src={producto.imagen}
        alt={producto.nombre}
        className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 object-contain rounded-lg bg-white flex-shrink-0"
      />

      <div className="flex flex-col justify-between flex-1 overflow-hidden">
        <div>
          <h2 className="font-semibold text-base sm:text-lg md:text-xl text-gray-800 leading-tight line-clamp-2">
            {producto.nombre}
          </h2>
          <p className="text-sm sm:text-base text-gray-500 line-clamp-2">
            {producto.descripcion || "Descripción del producto."}
          </p>
        </div>

        <div className="flex items-center justify-between mt-3">
          <p className="text-base sm:text-lg font-bold text-gray-900">
            ${producto.precio.toFixed(2)}
          </p>
          <button
            onClick={handleBoton}
            className={`text-sm sm:text-base px-4 py-2 rounded-full font-semibold transition ${
              estaEnCarrito
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-yellow-400 hover:bg-yellow-500 text-black"
            }`}
          >
            {estaEnCarrito ? (
              <span className="flex items-center gap-1">
                <FaTrash /> Quitar
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <FaShoppingCart /> Agregar
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TarjetaProducto;
