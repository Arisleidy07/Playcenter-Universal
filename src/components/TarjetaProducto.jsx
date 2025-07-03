import React, { useState } from "react";
import { FaShoppingCart, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";
import { useAuth } from "../context/AuthContext";
import ModalLoginAlert from "./ModalLoginAlert";
import { useAuthModal } from "../context/AuthModalContext";

function TarjetaProducto({ producto }) {
  const { carrito, agregarAlCarrito, quitarDelCarrito } = useCarrito();
  const { usuario } = useAuth();
  const { abrirModal } = useAuthModal();
  const navigate = useNavigate();

  const [modalAlertaAbierto, setModalAlertaAbierto] = useState(false);

  const estaEnCarrito = carrito.some((p) => p.id === producto.id);

  const handleBoton = (e) => {
    e.stopPropagation();
    if (!usuario) {
      setModalAlertaAbierto(true);
      return;
    }
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
    <>
      <div
        onClick={irADetalle}
        className="flex items-start gap-3 sm:gap-4 bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer w-full p-2 sm:p-3"
      >
        <img
          src={producto.imagen || producto.imagenes?.[0]}
          alt={producto.nombre}
          className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded bg-white flex-shrink-0"
        />
        <div className="flex flex-col justify-between flex-1 overflow-hidden">
          <div>
            <h2 className="font-medium text-xs sm:text-sm text-gray-800 leading-tight line-clamp-2">
              {producto.nombre}
            </h2>
            <p className="text-xs text-gray-500 line-clamp-2 mt-1">
              {producto.descripcion || "Descripción del producto."}
            </p>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm font-bold text-gray-900">
              ${producto.precio.toFixed(2)}
            </p>
            <button
              onClick={handleBoton}
              className={`text-xs px-2 py-1 rounded font-semibold transition flex items-center gap-1 ${
                estaEnCarrito
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-yellow-400 hover:bg-yellow-500 text-black"
              }`}
            >
              {estaEnCarrito ? (
                <>
                  <FaTrash size={12} /> Quitar
                </>
              ) : (
                <>
                  <FaShoppingCart size={12} /> Agregar
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <ModalLoginAlert
        isOpen={modalAlertaAbierto}
        onClose={() => setModalAlertaAbierto(false)}
        onIniciarSesion={() => {
          setModalAlertaAbierto(false);
          abrirModal();
        }}
      />
    </>
  );
}

export default TarjetaProducto;
