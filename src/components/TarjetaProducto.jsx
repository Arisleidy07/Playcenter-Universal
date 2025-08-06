import React, { useState } from "react";
import { FaShoppingCart, FaTrash, FaShareAlt } from "react-icons/fa";
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
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);

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

  // Compartir
  const handleShare = (e) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: producto.nombre,
        text: producto.descripcion || "",
        url: window.location.origin + `/producto/${producto.id}`,
      });
    } else {
      setShowShare(true);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(window.location.origin + `/producto/${producto.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <>
      <div
        onClick={irADetalle}
        className="group flex flex-col lg:flex-col bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer p-4 h-full w-full"
      >
        {/* Móvil / Tableta: fila */}
        <div className="flex flex-row lg:flex-col items-center lg:items-start gap-4 w-full">
          {/* Imagen */}
          <div className="flex-shrink-0 w-24 h-24 lg:w-full lg:h-48 flex items-center justify-center relative">
            <img
              src={producto.imagen || producto.imagenes?.[0]}
              alt={producto.nombre}
              className="object-contain max-h-full"
            />
<button
  className="absolute top-1 right-1.5 bg-blue hover:bg-blue-500 text-gray-900 rounded-full p-1.5 shadow-sm border border-blue-300 transition z-10 text-xs"
  onClick={handleShare}
  onMouseDown={(e) => e.stopPropagation()}
  aria-label="Compartir"
  type="button"
>
  <FaShareAlt className="w-2.5 h-2.5" />
</button>

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
              {producto.precio.toFixed(2)} DOP
            </p>
          </div>
        </div>

        {/* Botón agregar/quitar carrito */}
        <button
          onClick={handleBoton}
          className={`mt-3 text-sm w-full px-4 py-2 rounded-md font-semibold transition flex items-center justify-center gap-2 ${
            estaEnCarrito
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-yellow-400 hover:bg--500 text-black"
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

      {/* Modal compartir (solo si el navegador no soporta navigator.share) */}
      {showShare && (
        <div
          className="fixed inset-0 z-[9999] bg-black/30 flex items-center justify-center"
          onClick={() => setShowShare(false)}
        >
          <div
            className="bg-white p-5 rounded-xl shadow-2xl w-[95vw] max-w-xs flex flex-col gap-4 relative border border-gray-200"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-400 text-xl hover:text-red-400"
              onClick={() => setShowShare(false)}
              aria-label="Cerrar"
            >×</button>
            <h3 className="font-bold text-lg text-gray-900 mb-2 text-center">
              Compartir producto
            </h3>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `${producto.nombre} ${window.location.origin}/producto/${producto.id}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2 rounded-lg font-semibold transition border border-green-100 justify-center"
            >
              WhatsApp
            </a>
            <button
              className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold transition border border-gray-200 justify-center"
              onClick={handleCopy}
            >
              {copied ? "¡Copiado!" : "Copiar link"}
            </button>
          </div>
        </div>
      )}

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