// src/pages/VistaProducto.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaTrash } from "react-icons/fa";
import { useCarrito } from "../context/CarritoContext";
import { useAuth } from "../context/AuthContext";
import ModalLoginAlert from "../components/ModalLoginAlert";
import { useAuthModal } from "../context/AuthModalContext";
import BotonPayPal from "../components/BotonPayPal";

function VistaProducto() {
  const { state } = useLocation();
  const producto = state?.producto;
  const navigate = useNavigate();

  const { carrito, agregarAlCarrito, quitarDelCarrito } = useCarrito();
  const { usuario } = useAuth();
  const { abrirModal } = useAuthModal();

  const [modalAlertaAbierto, setModalAlertaAbierto] = useState(false);

  if (!producto) {
    return <p>Producto no encontrado</p>;
  }

  const estaEnCarrito = carrito.some((p) => p.id === producto.id);

  const handleAgregarCarrito = () => {
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

  return (
    <>
      <div className="max-w-4xl mx-auto p-4">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-blue-600 hover:underline"
        >
          ← Volver
        </button>

        <div className="flex flex-col md:flex-row gap-6 bg-white rounded shadow p-6">
          {/* Imagen del producto */}
          <div className="md:w-1/2 flex justify-center items-center">
            <img
              src={producto.imagen || producto.imagenes?.[0]}
              alt={producto.nombre}
              className="max-h-96 object-contain"
            />
          </div>

          {/* Detalles y acciones */}
          <div className="md:w-1/2 flex flex-col justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">{producto.nombre}</h1>
              <p className="text-gray-700 mb-4">
                {producto.descripcion || "Descripción del producto."}
              </p>
              <p className="text-xl font-semibold mb-6">
                {producto.precio.toFixed(2)} DOP
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleAgregarCarrito}
                className={`inline-flex justify-center items-center gap-2 px-6 py-3 rounded font-semibold transition hover:scale-105 ${
                  estaEnCarrito
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-yellow-400 text-black hover:bg-yellow-500"
                }`}
              >
                {estaEnCarrito ? <FaTrash /> : <FaShoppingCart />}
                {estaEnCarrito ? " Quitar del carrito" : " Agregar al carrito"}
              </button>

              <div>
                <BotonPayPal nombre={producto.nombre} precio={producto.precio} />
              </div>
            </div>
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

export default VistaProducto;
