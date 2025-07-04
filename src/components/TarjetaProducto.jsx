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
      className="tarjeta-amazon"
    >
      <div className="imagen">
        <img
          src={producto.imagen || producto.imagenes?.[0]}
          alt={producto.nombre}
        />
      </div>
      <div className="contenido">
        <h2>{producto.nombre}</h2>
        <p>{producto.descripcion || "Descripción del producto."}</p>
        <p className="precio">${producto.precio.toFixed(2)}</p>
        <button
          onClick={(e) => {
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
          }}
          className={estaEnCarrito ? "btn-quitar" : "btn-agregar"}
        >
          {estaEnCarrito ? "Quitar del carrito" : "Agregar al carrito"}
        </button>
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
