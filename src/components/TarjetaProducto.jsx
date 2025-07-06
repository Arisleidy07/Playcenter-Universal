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
        className="flex flex-col bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer p-4 h-full"
      >
        {/* Imagen */}
        <div className="w-full h-48 flex items-center justify-center mb-3">
          <img
            src={producto.imagen || producto.imagenes?.[0]}
            alt={producto.nombre}
            className="max-h-full object-contain"
          />
        </div>

        {/* Contenido */}
        <div className="flex flex-col flex-1 w-full overflow-hidden gap-1">
          <h2 className="font-semibold text-base text-gray-800 leading-tight line-clamp-2">
            {producto.nombre}
          </h2>
          <p className="text-sm text-gray-500 line-clamp-2">
            {producto.descripcion || "Descripción del producto."}
          </p>
          <p className="text-lg font-bold text-gray-900 mt-1">
            ${producto.precio.toFixed(2)}
          </p>
        </div>

        {/* Botón */}
        <button
          onClick={handleBoton}
          className={`mt-3 text-sm w-full px-4 py-2 rounded-md font-semibold transition flex items-center justify-center gap-2 ${
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
