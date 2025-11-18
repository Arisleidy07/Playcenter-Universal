import React, { useState, useEffect } from "react";
import { FaShoppingCart, FaTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";
import { useAuth } from "../context/AuthContext";
import ModalLoginAlert from "./ModalLoginAlert";
import { useAuthModal } from "../context/AuthModalContext";
import { useTheme } from "../context/ThemeContext";
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
  const { isDark } = useTheme();
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
        className="card h-100 border-2 shadow-sm hover-lift hover-shadow"
        style={{
          backgroundColor: isDark ? "#1f2937" : "#ffffff",
          borderColor: isDark ? "#374151" : "#e5e7eb",
        }}
      >
        {/* Imagen a la izquierda (móvil/tablet pequeño) o arriba (tablet grande/desktop) */}
        <div
          onClick={irADetalle}
          className="d-flex d-lg-block position-relative overflow-hidden"
          style={{
            cursor: "pointer",
            minHeight: "128px",
            width: "128px",
          }}
        >
          <div
            className="d-flex align-items-center justify-content-center w-100 h-100"
            style={{ backgroundColor: isDark ? "#374151" : "#ffffff" }}
          >
            {imagen ? (
              <img
                src={imagen}
                alt={producto.nombre}
                className="w-100 h-100"
                style={{ objectFit: "contain" }}
                loading="lazy"
              />
            ) : (
              <div
                className="small"
                style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
              >
                Sin imagen
              </div>
            )}
          </div>
        </div>

        {/* Información a la derecha (móvil/tablet pequeño) o abajo (tablet grande/desktop) */}
        <div className="card-body d-flex flex-column justify-content-between flex-grow-1 p-3">
          <div>
            <h3
              onClick={irADetalle}
              className="card-title fw-semibold mb-2"
              style={{
                cursor: "pointer",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                lineHeight: "1.3em",
                maxHeight: "2.6em",
                fontSize: "clamp(0.875rem, 2vw, 1.125rem)",
                color: isDark ? "#f9fafb" : "#111827",
              }}
            >
              {producto.nombre}
            </h3>

            <div className="d-flex align-items-baseline gap-1 mb-2">
              <span
                className="small"
                style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
              >
                RD$
              </span>
              <span
                className="h5 fw-bold mb-0"
                style={{ color: isDark ? "#f3f4f6" : "#111827" }}
              >
                {Number(producto.precio).toFixed(2)}
              </span>
            </div>
          </div>

          {enCarrito ? (
            <div className="d-flex align-items-center justify-content-between gap-2">
              <button
                onClick={handleDecremento}
                className="btn btn-outline-secondary btn-sm rounded-3 fw-semibold"
              >
                −
              </button>
              <span className="fw-semibold">{cantidadEnCarrito}</span>
              <button
                onClick={handleIncremento}
                className="btn btn-outline-secondary btn-sm rounded-3 fw-semibold"
              >
                +
              </button>
              <button
                onClick={handleQuitar}
                className="btn btn-danger btn-sm rounded-3"
              >
                <FaTrashAlt />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAgregar}
              className="btn btn-primary w-100 rounded-3 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow"
              disabled={!disponible}
            >
              <FaShoppingCart />
              <span className="d-none d-sm-inline d-lg-none">Agregar</span>
              <span className="d-none d-lg-inline">Agregar al Carrito</span>
              <span className="d-sm-none">+</span>
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
