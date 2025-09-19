import React, { useState } from "react";
import { FaShoppingCart, FaTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";
import { useAuth } from "../context/AuthContext";
import ModalLoginAlert from "./ModalLoginAlert";
import { useAuthModal } from "../context/AuthModalContext";
import "../styles/TarjetaProducto.css";

function formatPriceRD(value) {
  const pesos = Math.round(Number(value) || 0);
  return new Intl.NumberFormat("es-DO").format(pesos);
}

function TarjetaProducto({ producto }) {
  const { carrito, agregarAlCarrito, eliminarUnidadDelCarrito, quitarDelCarrito } = useCarrito();
  const { usuario } = useAuth();
  const { abrirModal } = useAuthModal();
  const navigate = useNavigate();

  const [modalAlertaAbierto, setModalAlertaAbierto] = useState(false);

  // stock disponible
  const disponible = producto.cantidad === undefined || producto.cantidad > 0;

  // producto en carrito
  const enCarrito = carrito.find((p) => p.id === producto.id);
  const cantidadEnCarrito = enCarrito?.cantidad || 0;

  const handleAgregar = (e) => {
    e.stopPropagation();
    if (!usuario) {
      setModalAlertaAbierto(true);
      return;
    }
    if (!enCarrito) {
      agregarAlCarrito({ ...producto, cantidad: 1 });
    }
  };

  const handleIncremento = (e) => {
    e.stopPropagation();
    if (!usuario) {
      setModalAlertaAbierto(true);
      return;
    }
    if (producto.cantidad === undefined || cantidadEnCarrito < producto.cantidad) {
      agregarAlCarrito(producto);
    }
  };

  const handleDecremento = (e) => {
    e.stopPropagation();
    if (!usuario) {
      setModalAlertaAbierto(true);
      return;
    }
    eliminarUnidadDelCarrito(producto.id);
  };

  const handleQuitar = (e) => {
    e.stopPropagation();
    if (!usuario) {
      setModalAlertaAbierto(true);
      return;
    }
    quitarDelCarrito(producto.id);
  };

  const irADetalle = () => {
    navigate(`/producto/${producto.id}`, { state: { producto } });
  };

  return (
    <>
      <div
        onClick={(e) => {
          if (!e.target.closest("button")) irADetalle();
        }}
        className="tarjeta-producto group"
      >
        {/* Imagen + Info */}
        <div className="tarjeta-img-zone">
          <img
            src={producto.imagen || producto.imagenes?.[0]}
            alt={producto.nombre}
            className="tarjeta-img"
          />
        </div>
        <div className="tarjeta-info-zone">
          <h2 className="tarjeta-nombre">
            {producto.nombre}
          </h2>
          <p className="tarjeta-descripcion">
            {producto.descripcion || "Descripción del producto."}
          </p>
          <p className="tarjeta-precio">
            {formatPriceRD(producto.precio)} DOP
          </p>
          <div className="botones-wrapper">
            {enCarrito ? (
              <div className="flex items-center gap-2 justify-center w-full">
                <button
                  onClick={handleDecremento}
                  className="carrito-btn"
                >
                  −
                </button>
                <span className="font-semibold text-lg">{cantidadEnCarrito}</span>
                <button
                  onClick={handleIncremento}
                  className="carrito-btn"
                  disabled={
                    producto.cantidad !== undefined &&
                    cantidadEnCarrito >= producto.cantidad
                  }
                >
                  +
                </button>
                <button
                  onClick={handleQuitar}
                  className="ml-2 text-red-600 hover:text-red-700 font-semibold transition carrito-quitar"
                  title="Quitar"
                >
                  <FaTrashAlt />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAgregar}
                className={`w-full flex items-center justify-center gap-2 carrito-main-btn ${
                  !disponible ? 'opacity-60 cursor-not-allowed bg-gray-300 text-gray-600 hover:bg-gray-300' : ''
                }`}
                disabled={!disponible}
                title={!disponible ? 'No quedan productos' : 'Agregar al carrito'}
              >
                <FaShoppingCart size={16} /> Agregar al carrito
              </button>
            )}
          </div>
          <ModalLoginAlert
            isOpen={modalAlertaAbierto}
            onClose={() => setModalAlertaAbierto(false)}
            onIniciarSesion={() => {
              setModalAlertaAbierto(false);
              abrirModal();
            }}
          />
        </div>
      </div>
    </>
  );
}

export default TarjetaProducto;