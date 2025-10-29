import React, { useState, useEffect } from "react";
import { FaShoppingCart, FaTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";
import { useAuth } from "../context/AuthContext";
import ModalLoginAlert from "./ModalLoginAlert";
import { useAuthModal } from "../context/AuthModalContext";
import "../styles/TarjetaProducto.css";
// (sin imports extra)

function formatPriceRD(value) {
  const pesos = Math.round(Number(value) || 0);
  return new Intl.NumberFormat("es-DO").format(pesos);
}

// Descompone el precio en partes estilo Amazon: moneda, enteros y decimales
function getPriceParts(num) {
  const n = Number(num) || 0;
  const fixed = n.toFixed(2);
  const [wholeStr, fraction] = fixed.split(".");
  const whole = Number(wholeStr);
  return { wholeFormatted: formatPriceRD(whole), fraction };
}

function stripHtmlToText(html, maxLen = 140) {
  try {
    if (!html) return "Descripción del producto.";
    const tmp = document.createElement("div");
    tmp.innerHTML = String(html);
    const text = (tmp.textContent || tmp.innerText || "")
      .replace(/\s+/g, " ")
      .trim();
    if (text.length <= maxLen) return text;
    return text.slice(0, maxLen - 1) + "…";
  } catch {
    return typeof html === "string" ? html : "Descripción del producto.";
  }
}

function TarjetaProducto({ producto }) {
  const {
    carrito,
    agregarAlCarrito,
    eliminarUnidadDelCarrito,
    quitarDelCarrito,
  } = useCarrito();
  const { usuario, usuarioInfo } = useAuth();
  const { abrirModal } = useAuthModal();
  const navigate = useNavigate();

  const [modalAlertaAbierto, setModalAlertaAbierto] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  // (sin permisos especiales de eliminación ni overlays en la tarjeta)

  useEffect(() => {
    setImageFailed(false);
  }, [producto?.id, producto?.imagen, producto?.imagenPrincipal]);

  // Derivados de UI
  const hasOffer = Boolean(producto?.oferta && producto?.precioOferta);
  const precioFinal = hasOffer
    ? Number(producto?.precioOferta) || Number(producto?.precio) || 0
    : Number(producto?.precio) || 0;

  // Partes del precio para estilo Amazon
  const priceParts = getPriceParts(precioFinal);
  // stock y estado
  const activo = producto?.activo !== false;
  const disponible =
    activo && (producto.cantidad === undefined || producto.cantidad > 0);

  // producto en carrito
  const enCarrito = carrito.find((p) => p.id === producto.id);
  const cantidadEnCarrito = enCarrito?.cantidad || 0;

  // Stock visible y restante conectado con el carrito
  const stockDisponible =
    producto.cantidad !== undefined ? Number(producto.cantidad) || 0 : Infinity;
  const restante = Number.isFinite(stockDisponible)
    ? Math.max(0, stockDisponible - cantidadEnCarrito)
    : Infinity;

  const handleAgregar = (e) => {
    e.stopPropagation();
    if (!usuario) {
      setModalAlertaAbierto(true);
      return;
    }
    if (!enCarrito) {
      const payload = {
        ...producto,
        cantidad: 1,
        // ayudar al contexto a conocer el stock máximo si no existe cantidad global
        cantidadProducto: Number.isFinite(stockDisponible)
          ? stockDisponible
          : undefined,
      };
      agregarAlCarrito(payload);
    }
  };

  const handleIncremento = (e) => {
    e.stopPropagation();
    if (!usuario) {
      setModalAlertaAbierto(true);
      return;
    }
    const max = Number.isFinite(stockDisponible) ? stockDisponible : Infinity;
    if (cantidadEnCarrito < max) {
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
    const targetId = producto.slug || producto.id;
    navigate(`/producto/${targetId}`);
  };

  // (sin acciones de compartir ni eliminar desde la tarjeta)

  // Obtener imagen del producto
  const pickUrl = (u) => {
    try {
      if (!u) return "";
      if (typeof u === "string") return u;
      if (typeof u === "object" && u !== null) return u.url || "";
      return String(u || "");
    } catch {
      return "";
    }
  };

  const getProductImage = () => {
    const principalNueva = pickUrl(producto?.imagenPrincipal?.[0]);
    if (principalNueva) return principalNueva;
    const principalLegacy = pickUrl(producto?.imagen);
    if (principalLegacy) return principalLegacy;
    const imgsLegacy = Array.isArray(producto?.imagenes)
      ? producto.imagenes
      : [];
    if (imgsLegacy.length > 0) return pickUrl(imgsLegacy[0]);
    return null;
  };

  const imagen = getProductImage();

  return (
    <>
      {/* HORIZONTAL en móvil/tablet pequeño, VERTICAL en tablet grande/desktop */}
      <article
        className="flex flex-row lg:flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 w-full h-full"
      >
        {/* Imagen a la izquierda (móvil/tablet pequeño) o arriba (tablet grande/desktop) */}
        <div
          onClick={irADetalle}
          className="flex-shrink-0 w-32 sm:w-36 lg:w-full lg:aspect-square flex items-center justify-center overflow-hidden cursor-pointer bg-white dark:bg-gray-900"
          style={{
            minHeight: "128px", // Imagen más compacta en móvil
          }}
        >
          {imagen ? (
            <img
              src={imagen}
              alt={producto.nombre}
              className="w-full h-full object-contain"
              loading="lazy"
            />
          ) : (
            <div className="text-gray-400 text-sm">Sin imagen</div>
          )}
        </div>

        {/* Información a la derecha (móvil/tablet pequeño) o abajo (tablet grande/desktop) */}
        <div className="flex flex-col justify-between p-2.5 sm:p-3 lg:p-4 flex-1">
          <div>
            <h3
              onClick={irADetalle}
              className="text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 mb-1.5 sm:mb-2 cursor-pointer text-sm sm:text-base lg:text-lg font-semibold"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                lineHeight: "1.3em",
                maxHeight: "2.6em",
              }}
            >
              {producto.nombre}
            </h3>

            <div className="flex items-baseline gap-1 mb-1.5 sm:mb-2">
              <span className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400">RD$</span>
              <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100">
                {Number(producto.precio).toFixed(2)}
              </span>
            </div>
          </div>

          {enCarrito ? (
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={handleDecremento}
                className="px-3 sm:px-3 lg:px-3.5 py-1.5 sm:py-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-base sm:text-base font-semibold transition-all hover:scale-105 active:scale-95"
              >
                −
              </button>
              <span className="font-semibold text-base sm:text-base lg:text-lg">{cantidadEnCarrito}</span>
              <button
                onClick={handleIncremento}
                className="px-3 sm:px-3 lg:px-3.5 py-1.5 sm:py-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-base sm:text-base font-semibold transition-all hover:scale-105 active:scale-95"
              >
                +
              </button>
              <button
                onClick={handleQuitar}
                className="px-2.5 sm:px-2.5 py-1.5 sm:py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 text-base sm:text-base transition-all hover:scale-105 active:scale-95"
              >
                <FaTrashAlt />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAgregar}
              className="w-full py-2.5 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm lg:text-base font-semibold transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
              style={{
                backgroundColor: "#0066C0",
                color: "#FFFFFF",
                border: "1px solid #0066C0",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#004F9A")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#0066C0")
              }
              disabled={!disponible}
            >
              <FaShoppingCart className="text-lg sm:text-base lg:text-base" />
              <span className="hidden sm:inline lg:hidden">Agregar</span>
              <span className="hidden lg:inline">Agregar al Carrito</span>
            </button>
          )}
        </div>
      </article>

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
