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

  return (
    <>
      <div
        onClick={(e) => {
          if (!e.target.closest("button")) irADetalle();
        }}
        className="tarjeta-producto group bg-white dark:bg-gray-900 shadow-md rounded-lg transition-transform transform hover:scale-105"
      >
        {/* Imagen + Info */}
        <div className="tarjeta-img-zone relative">
          {(() => {
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
              // 1) Imagen principal nueva
              const principalNueva = pickUrl(producto?.imagenPrincipal?.[0]);
              if (principalNueva) return principalNueva;
              // 2) Legacy principal
              const principalLegacy = pickUrl(producto?.imagen);
              if (principalLegacy) return principalLegacy;
              // 3) Media (buscar una imagen)
              const mediaArr = Array.isArray(producto?.media)
                ? producto.media
                : [];
              const mediaImg = mediaArr.find((m) => {
                const t = (m?.type || "").toLowerCase();
                return (
                  pickUrl(m) &&
                  (!t || t.includes("image") || t === "img" || t === "photo")
                );
              });
              if (mediaImg) return pickUrl(mediaImg);
              // 4) Galería (primera imagen)
              const galArr = Array.isArray(producto?.galeriaImagenes)
                ? producto.galeriaImagenes
                : [];
              const galImg = galArr.find((g) => {
                const t = (g?.type || "").toLowerCase();
                return (
                  pickUrl(g) &&
                  (!t || t.includes("image") || t === "img" || t === "photo")
                );
              });
              if (galImg) return pickUrl(galImg);
              // 5) Legacy imagenes[] (string)
              const imgsLegacy = Array.isArray(producto?.imagenes)
                ? producto.imagenes
                : [];
              if (imgsLegacy.length > 0) return pickUrl(imgsLegacy[0]);
              // 6) Variantes: intentar imagen principal/legacy/media de la primera variante con contenido
              const vars = Array.isArray(producto?.variantes)
                ? producto.variantes
                : [];
              for (const v of vars) {
                const vPrincipal = pickUrl(v?.imagenPrincipal?.[0]);
                if (vPrincipal) return vPrincipal;
                const vLegacy = pickUrl(v?.imagen);
                if (vLegacy) return vLegacy;
                const vMediaArr = Array.isArray(v?.media) ? v.media : [];
                const vMediaImg = vMediaArr.find((mm) => {
                  const t = (mm?.type || "").toLowerCase();
                  return (
                    pickUrl(mm) &&
                    (!t || t.includes("image") || t === "img" || t === "photo")
                  );
                });
                if (vMediaImg) return pickUrl(vMediaImg);
                const vGalArr = Array.isArray(v?.galeriaImagenes)
                  ? v.galeriaImagenes
                  : [];
                const vGalImg = vGalArr.find((gg) => {
                  const t = (gg?.type || "").toLowerCase();
                  return (
                    pickUrl(gg) &&
                    (!t || t.includes("image") || t === "img" || t === "photo")
                  );
                });
                if (vGalImg) return pickUrl(vGalImg);
              }
              return null;
            };

            const mainImage = getProductImage();

            const Placeholder = () => (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%)",
                }}
                aria-label="Imagen no disponible"
              >
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  style={{ color: "#9ca3af" }}
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="10.5" r="1.5"></circle>
                  <path d="M21 19l-5.5-5.5a2 2 0 00-2.9 0L7 19"></path>
                </svg>
              </div>
            );

            // Mostrar imagen si existe y no falló, en caso contrario mostrar placeholder
            if (mainImage && !imageFailed) {
              return (
                <img
                  key={mainImage}
                  src={mainImage}
                  alt={producto.nombre}
                  className="tarjeta-img"
                  onError={() => {
                    setImageFailed(true);
                  }}
                />
              );
            }
            return <Placeholder />;
          })()}
        </div>
        <div className="tarjeta-info-zone">
          <h2 className="tarjeta-nombre">{producto.nombre}</h2>
          {/* Stock disponible */}
          {Number.isFinite(restante) && restante > 0 && restante <= 10 && (
            <div className="tarjeta-stock-info">
              {restante <= 3 ? (
                <span className="stock-bajo">
                  Solo quedan {restante} unidades
                </span>
              ) : (
                <span className="stock-medio">Quedan {restante} unidades</span>
              )}
            </div>
          )}
          {Number.isFinite(restante) && restante > 10 && (
            <div className="tarjeta-stock-info">
              <span className="stock-alto">Disponible</span>
            </div>
          )}
          <div className="tarjeta-price-row">
            {hasOffer && (
              <span className="descuento-badge">
                {Math.round(
                  (1 -
                    Number(producto?.precioOferta) / Number(producto?.precio)) *
                    100
                )}
                % OFF
              </span>
            )}
            <div className="tarjeta-precio">
              <span className="currency">RD$</span>
              <span className="whole">{priceParts.wholeFormatted}</span>
            </div>
          </div>
          {hasOffer && (
            <div className="precio-original">
              RD$ {formatPriceRD(producto.precio)}
            </div>
          )}
          <div className="botones-wrapper">
            {enCarrito ? (
              <>
                <button onClick={handleDecremento} className="carrito-btn">
                  −
                </button>
                <span className="font-semibold">{cantidadEnCarrito}</span>
                <button
                  onClick={handleIncremento}
                  className="carrito-btn"
                  disabled={
                    Number.isFinite(stockDisponible) &&
                    cantidadEnCarrito >= stockDisponible
                  }
                  title={
                    Number.isFinite(stockDisponible) &&
                    cantidadEnCarrito >= stockDisponible
                      ? "Has alcanzado el máximo disponible"
                      : "Agregar una unidad"
                  }
                >
                  +
                </button>
                <button
                  onClick={handleQuitar}
                  type="button"
                  className="carrito-quitar"
                  title="Quitar del carrito"
                  aria-label="Quitar del carrito"
                >
                  <FaTrashAlt />
                </button>
              </>
            ) : (
              <button
                onClick={handleAgregar}
                className={`carrito-main-btn ${
                  !disponible
                    ? "opacity-60 cursor-not-allowed bg-gray-300 text-gray-600 hover:bg-gray-300"
                    : ""
                }`}
                disabled={!disponible}
                title={
                  !disponible ? "No quedan productos" : "Agregar al carrito"
                }
                aria-label="Agregar al carrito"
              >
                <FaShoppingCart aria-hidden="true" />
                <span>Agregar al carrito</span>
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
