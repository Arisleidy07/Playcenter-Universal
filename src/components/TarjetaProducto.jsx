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
      className="flex items-start gap-4 bg-white shadow-md hover:shadow-xl rounded-xl p-4 cursor-pointer transition duration-300 w-full"
    >
      <img
        src={producto.imagen}
        alt={producto.nombre}
        className="w-32 h-32 sm:w-36 sm:h-36 object-contain rounded-xl bg-white"
      />

      <div className="flex flex-col justify-between flex-1">
        <div>
          <h2 className="font-bold text-base sm:text-lg text-[#1e293b] mb-1 line-clamp-2">
            {producto.nombre}
          </h2>
          <p className="text-sm text-gray-600 mb-2 line-clamp-3">
            {producto.descripcion || "Descripción del producto."}
          </p>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-4 mt-2">
          <p className="text-xl font-extrabold text-gray-900">
            ${producto.precio.toFixed(2)}
          </p>
          <button
            onClick={handleBoton}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition ${
              estaEnCarrito
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-yellow-400 hover:bg-yellow-500 text-black"
            }`}
          >
            {estaEnCarrito ? <FaTrash /> : <FaShoppingCart />}
            {estaEnCarrito ? "Quitar" : "Agregar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TarjetaProducto;
