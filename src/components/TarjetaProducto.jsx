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
        className="flex flex-col sm:flex-row items-center sm:items-start gap-3 bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer w-full p-4 sm:p-5"
      >
        {/* Imagen */}
        <img
          src={producto.imagen || producto.imagenes?.[0]}
          alt={producto.nombre}
          className="w-24 h-24 sm:w-28 sm:h-28 object-contain rounded bg-white flex-shrink-0"
        />

        {/* Contenido */}
        <div className="flex flex-col justify-between flex-1 w-full overflow-hidden">
          <div className="mb-3">
            <h2 className="font-semibold text-base text-gray-800 leading-tight line-clamp-2">
              {producto.nombre}
            </h2>
            <p className="text-sm text-gray-500 line-clamp-2 mt-1">
              {producto.descripcion || "Descripción del producto."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
            <p className="text-lg font-bold text-gray-900">
              ${producto.precio.toFixed(2)}
            </p>

            <button
              onClick={handleBoton}
              className={`text-sm w-full sm:w-auto px-4 py-2 rounded-md font-semibold transition flex items-center justify-center gap-2 ${
                estaEnCarrito
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-yellow-400 hover:bg-yellow-500 text-black"
              }`}
            >
              {estaEnCarrito ? (
                <>
                  <FaTrash size={14} /> Quitar
                </>
              ) : (
                <>
                  <FaShoppingCart size={14} /> Agregar
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
