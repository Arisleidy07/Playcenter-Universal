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
      className="card cursor-pointer flex flex-col sm:flex-row items-center sm:items-start bg-white shadow-md hover:shadow-xl rounded-xl p-4 transition duration-300"
      title={producto.nombre}
    >
      <img
        src={producto.imagen}
        alt={producto.nombre}
        className="w-32 h-32 sm:w-40 sm:h-40 object-contain rounded-lg shadow-sm bg-white mb-4 sm:mb-0"
      />
      <div className="flex flex-col flex-grow sm:ml-6 text-center sm:text-left w-full">
        <h2 className="font-semibold text-lg mb-1 text-[#1e293b] leading-tight">
          {producto.nombre}
        </h2>
        <p className="font-medium text-base text-[#2563eb] mb-2 line-clamp-3">
          {producto.descripcion || "Descripción breve del producto."}
        </p>
        <p className="text-2xl font-bold text-gray-900 mb-3">${producto.precio.toFixed(2)}</p>
        <div className="mt-auto">
          <button
            onClick={handleBoton}
            className={`w-full sm:w-auto flex justify-center items-center gap-2 px-4 py-2 rounded-full font-semibold transition ${
              estaEnCarrito
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-yellow-400 hover:bg-yellow-500 text-black"
            }`}
          >
            {estaEnCarrito ? <FaTrash /> : <FaShoppingCart />}
            {estaEnCarrito ? "Quitar del carrito" : "Agregar al carrito"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TarjetaProducto;
