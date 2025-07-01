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
      className="flex items-start gap-3 bg-white rounded-lg shadow hover:shadow-md transition cursor-pointer w-full max-w-full p-3"
    >
      <img
        src={producto.imagen}
        alt={producto.nombre}
        className="w-20 h-20 object-contain rounded-md bg-white flex-shrink-0"
      />

      <div className="flex flex-col justify-between flex-1 overflow-hidden">
        <div>
          <h2 className="font-semibold text-sm text-gray-800 leading-tight truncate">
            {producto.nombre}
          </h2>
          <p className="text-xs text-gray-500 line-clamp-2">
            {producto.descripcion || "Descripción del producto."}
          </p>
        </div>

        <div className="flex items-center justify-between mt-1">
          <p className="text-sm sm:text-base font-bold text-gray-900">
            ${producto.precio.toFixed(2)}
          </p>
          <button
            onClick={handleBoton}
            className={`text-xs sm:text-sm px-3 py-1.5 rounded-full font-semibold transition ${
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
