import React from "react";
import { FaShoppingCart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";

function TarjetaProducto({ producto }) {
  const {
    agregarAlCarrito,
    carrito,
    eliminarDelCarrito,
  } = useCarrito();

  const navigate = useNavigate();
  const enCarrito = carrito.some((p) => p.id === producto.id);

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
      className="flex bg-white rounded-lg shadow-md hover:shadow-lg transition cursor-pointer p-4"
      title={producto.nombre}
      style={{ minHeight: '140px' }}
    >
      {/* Imagen izquierda */}
      <div className="flex-shrink-0 w-40 h-40 bg-gray-100 rounded-lg overflow-hidden mr-6 flex items-center justify-center">
        <img
          src={producto.imagen}
          alt={producto.nombre}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Info derecha */}
      <div className="flex flex-col flex-grow">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">{producto.nombre}</h2>
        <p className="text-gray-600 mb-2 line-clamp-3">
          {producto.descripcion || "Descripción breve del producto."}
        </p>
        <p className="text-2xl font-bold text-gray-900 mb-3">${producto.precio.toFixed(2)}</p>

        <button
          onClick={handleToggleCarrito}
          className="mt-auto flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded-full transition"
          onMouseDown={(e) => e.stopPropagation()} // para que no dispare el click del div padre
        >
          <FaShoppingCart />
          {enCarrito ? "Quitar" : "Agregar al carrito"}
        </button>
      </div>
    </div>
  );
}

export default TarjetaProducto;
