import React, { useState, useEffect } from "react";
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

function stripHtmlToText(html, maxLen = 140) {
  try {
    if (!html) return "Descripción del producto.";
    const tmp = document.createElement("div");
    tmp.innerHTML = String(html);
    const text = (tmp.textContent || tmp.innerText || "").replace(/\s+/g, " ").trim();
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
  const { usuario } = useAuth();
  const { abrirModal } = useAuthModal();
  const navigate = useNavigate();

  const [modalAlertaAbierto, setModalAlertaAbierto] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  // Si cambia el producto o su imagen principal, reintentar mostrar imagen
  useEffect(() => {
    setImageFailed(false);
  }, [producto?.id, producto?.imagen, producto?.imagenPrincipal]);

  // Derivados de UI
  const hasOffer = Boolean(producto?.oferta && producto?.precioOferta);
  const precioFinal = hasOffer
    ? Number(producto?.precioOferta) || Number(producto?.precio) || 0
    : Number(producto?.precio) || 0;

  // stock y estado
  const activo = producto?.activo !== false;
  const disponible =
    activo && (producto.cantidad === undefined || producto.cantidad > 0);

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
    if (
      producto.cantidad === undefined ||
      cantidadEnCarrito < producto.cantidad
    ) {
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

  return (
    <>
      <div
        onClick={(e) => {
          if (!e.target.closest("button")) irADetalle();
        }}
        className="tarjeta-producto group"
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
              } catch { return ""; }
            };
            const getProductImage = () => {
              // 1) Imagen principal nueva
              const principalNueva = pickUrl(producto?.imagenPrincipal?.[0]);
              if (principalNueva) return principalNueva;
              // 2) Legacy principal
              const principalLegacy = pickUrl(producto?.imagen);
              if (principalLegacy) return principalLegacy;
              // 3) Media (buscar una imagen)
              const mediaArr = Array.isArray(producto?.media) ? producto.media : [];
              const mediaImg = mediaArr.find((m) => {
                const t = (m?.type || "").toLowerCase();
                return pickUrl(m) && (!t || t.includes("image") || t === "img" || t === "photo");
              });
              if (mediaImg) return pickUrl(mediaImg);
              // 4) Galería (primera imagen)
              const galArr = Array.isArray(producto?.galeriaImagenes) ? producto.galeriaImagenes : [];
              const galImg = galArr.find((g) => {
                const t = (g?.type || "").toLowerCase();
                return pickUrl(g) && (!t || t.includes("image") || t === "img" || t === "photo");
              });
              if (galImg) return pickUrl(galImg);
              // 5) Legacy imagenes[] (string)
              const imgsLegacy = Array.isArray(producto?.imagenes) ? producto.imagenes : [];
              if (imgsLegacy.length > 0) return pickUrl(imgsLegacy[0]);
              // 6) Variantes: intentar imagen principal/legacy/media de la primera variante con contenido
              const vars = Array.isArray(producto?.variantes) ? producto.variantes : [];
              for (const v of vars) {
                const vPrincipal = pickUrl(v?.imagenPrincipal?.[0]);
                if (vPrincipal) return vPrincipal;
                const vLegacy = pickUrl(v?.imagen);
                if (vLegacy) return vLegacy;
                const vMediaArr = Array.isArray(v?.media) ? v.media : [];
                const vMediaImg = vMediaArr.find((mm) => {
                  const t = (mm?.type || "").toLowerCase();
                  return pickUrl(mm) && (!t || t.includes("image") || t === "img" || t === "photo");
                });
                if (vMediaImg) return pickUrl(vMediaImg);
                const vGalArr = Array.isArray(v?.galeriaImagenes) ? v.galeriaImagenes : [];
                const vGalImg = vGalArr.find((gg) => {
                  const t = (gg?.type || "").toLowerCase();
                  return pickUrl(gg) && (!t || t.includes("image") || t === "img" || t === "photo");
                });
                if (vGalImg) return pickUrl(vGalImg);
              }
              return null;
            };

            const mainImage = getProductImage();

            const Placeholder = () => (
              <div
                className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200"
                aria-label="Imagen no disponible"
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
                  <rect x="3" y="5" width="18" height="14" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="10.5" r="1.5"></circle>
                  <path d="M21 19l-5.5-5.5a2 2 0 00-2.9 0L7 19"></path>
                </svg>
              </div>
            );

            // Mostrar imagen si existe y no falló, en caso contrario mostrar placeholder
            if (mainImage && !imageFailed) {
              return (
                <div className="relative w-full h-full">
                  <img
                    key={mainImage}
                    src={mainImage}
                    alt={producto.nombre}
                    className="tarjeta-img object-contain"
                    style={{ objectFit: "contain" }}
                    onError={() => {
                      setImageFailed(true);
                    }}
                  />
                </div>
              );
            }
            return <Placeholder />;
          })()}
        </div>
        <div className="tarjeta-info-zone">
          <h2 className="tarjeta-nombre">{producto.nombre}</h2>
          <p className="tarjeta-descripcion">
            {stripHtmlToText(producto.descripcion)}
          </p>
          <div className="tarjeta-price-row">
            <span className="tarjeta-precio">DOP {formatPriceRD(precioFinal)}</span>
            {hasOffer && (
              <span className="tarjeta-precio-old">DOP {formatPriceRD(producto.precio)}</span>
            )}
          </div>
          <div className="botones-wrapper">
            {enCarrito ? (
              <div className="flex items-center gap-2 justify-center w-full">
                <button onClick={handleDecremento} className="carrito-btn">
                  −
                </button>
                <span className="font-semibold text-lg">
                  {cantidadEnCarrito}
                </span>
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
                  type="button"
                  className="p-0 text-red-600 hover:text-red-700 bg-transparent rounded-none shadow-none focus:outline-none focus:ring-0"
                  title="Quitar del carrito"
                  aria-label="Quitar del carrito"
                >
                  <FaTrashAlt />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAgregar}
                className={`w-full flex items-center justify-center gap-2 carrito-main-btn ${
                  !disponible
                    ? "opacity-60 cursor-not-allowed bg-gray-300 text-gray-600 hover:bg-gray-300"
                    : ""
                }`}
                disabled={!disponible}
                title={
                  !disponible ? "No quedan productos" : "Agregar al carrito"
                }
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
