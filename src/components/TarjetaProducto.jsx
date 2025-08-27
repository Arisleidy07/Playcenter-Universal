import React, { useState } from "react";
import { FaShoppingCart, FaTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";
import { useAuth } from "../context/AuthContext";
import ModalLoginAlert from "./ModalLoginAlert";
import { useAuthModal } from "../context/AuthModalContext";

/**
 * Formatea precio en PESOS RD: sin decimales y con separador de miles.
 * Ej: 12000 -> "12,000"
 */
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
  const [animacionFlecha, setAnimacionFlecha] = useState(null);

  const enCarrito = carrito.find((p) => p.id === producto.id);

  const handleAgregar = (e) => {
    e.stopPropagation();
    if (!usuario) {
      setModalAlertaAbierto(true);
      return;
    }
    agregarAlCarrito(producto);
    setAnimacionFlecha("subir");
    setTimeout(() => setAnimacionFlecha(null), 500);
  };

  const handleEliminarUnidad = (e) => {
    e.stopPropagation();
    eliminarUnidadDelCarrito(producto.id);
    setAnimacionFlecha("bajar");
    setTimeout(() => setAnimacionFlecha(null), 500);
  };

  const handleQuitar = (e) => {
    e.stopPropagation();
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
        className="group flex flex-col lg:flex-col bg-white rounded-lg shadow-md hover:shadow-xl transition cursor-pointer p-4 h-full w-full"
      >
        <div className="flex flex-row lg:flex-col items-center lg:items-start gap-4 w-full">
          <div className="flex-shrink-0 w-24 h-24 lg:w-full lg:h-48 flex items-center justify-center relative">
            <img
              src={producto.imagen || producto.imagenes?.[0]}
              alt={producto.nombre}
              className="object-contain max-h-full"
            />
          </div>

          <div className="flex flex-col flex-1 w-full overflow-hidden gap-1">
            <h2 className="font-semibold text-base text-gray-900 leading-tight line-clamp-2">
              {producto.nombre}
            </h2>
            <p className="text-sm text-gray-600 line-clamp-2">
              {producto.descripcion || "Descripción del producto."}
            </p>
            {/* MOSTRAR SOLO PESOS ENTEROS CON SEPARADOR DE MILES */}
            <p className="text-lg font-bold text-gray-900 mt-1">
              {formatPriceRD(producto.precio)} DOP
            </p>
          </div>
        </div>

        {enCarrito ? (
          <div className="flex items-center gap-2 mt-3 relative">
            <button
              onClick={handleEliminarUnidad}
              className="px-3 py-1 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white rounded-lg text-lg font-bold transition relative overflow-hidden"
            >
              -
              {animacionFlecha === "bajar" && (
                <span className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-white font-bold animate-bounce">↓</span>
              )}
            </button>
            <span className="font-semibold text-lg">{enCarrito.cantidad}</span>
            <button
              onClick={handleAgregar}
              className="px-3 py-1 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white rounded-lg text-lg font-bold transition relative overflow-hidden"
            >
              +
              {animacionFlecha === "subir" && (
                <span className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-white font-bold animate-bounce">↑</span>
              )}
            </button>
            <button
              onClick={handleQuitar}
              className="ml-2 text-red-600 hover:text-red-700 font-semibold transition"
            >
              <FaTrashAlt />
            </button>
          </div>
        ) : (
          <button
            onClick={handleAgregar}
            className="mt-3 Btn w-full flex items-center justify-center gap-2"
          >
            <FaShoppingCart size={16} /> Agregar
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

      <style>{`
        .Btn {
          position: relative;
          width: 100%;
          height: 55px;
          border-radius: 45px;
          border: none;
          background: linear-gradient(to right, #22c55e, #3b82f6);
          color: white;
          box-shadow: 0px 10px 10px rgba(59, 130, 246, 0.3) inset,
                      0px 5px 10px rgba(0,0,0,0.2),
                      0px -10px 10px rgba(30, 64, 175, 0.3) inset;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 600;
          overflow: hidden;
        }

        .Btn::before {
          width: 70%;
          height: 2px;
          position: absolute;
          background-color: rgba(255, 255, 255, 0.6);
          content: "";
          filter: blur(1px);
          top: 7px;
          border-radius: 50%;
        }

        .Btn::after {
          width: 70%;
          height: 2px;
          position: absolute;
          background-color: rgba(255, 255, 255, 0.15);
          content: "";
          filter: blur(1px);
          bottom: 7px;
          border-radius: 50%;
        }

        .Btn:hover {
          animation: jello-horizontal 0.9s both;
        }

        @keyframes jello-horizontal {
          0% { transform: scale3d(1, 1, 1); }
          30% { transform: scale3d(1.25, 0.75, 1); }
          40% { transform: scale3d(0.75, 1.25, 1); }
          50% { transform: scale3d(1.15, 0.85, 1); }
          65% { transform: scale3d(0.95, 1.05, 1); }
          75% { transform: scale3d(1.05, 0.95, 1); }
          100% { transform: scale3d(1, 1, 1); }
        }

        .animate-bounce {
          animation: bounce 0.5s ease-out;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
      `}</style>
    </>
  );
}

export default TarjetaProducto;
