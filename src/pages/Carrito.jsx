import React, { useEffect, useMemo, useState } from "react";
import { useCarrito } from "../context/CarritoContext";
import { useNavigate } from "react-router-dom";
import { FaTrashAlt } from "react-icons/fa";
import BotonCardnet from "../components/BotonCardnet";
import "../styles/Carrito.css";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

function formatPriceRD(value) {
  const pesos = Math.round(Number(value) || 0);
  return new Intl.NumberFormat("es-DO").format(pesos);
}

// Obtiene stock máximo según el producto en Firestore y el color (si aplica)
function getLiveMaxStock(item, productDoc) {
  if (!productDoc) return getStockMaximo(item);
  // Si hay variantes y color seleccionado, buscar esa variante
  if (Array.isArray(productDoc.variantes) && item.colorSeleccionado) {
    const v = productDoc.variantes.find(
      (va) => va.color === item.colorSeleccionado
    );
    if (v && v.cantidad !== undefined) return Number(v.cantidad) || 0;
  }
  // Si el producto tiene cantidad global
  if (productDoc.cantidad !== undefined)
    return Number(productDoc.cantidad) || 0;
  return getStockMaximo(item);
}

function getStockMaximo(itemCarrito) {
  // Preferimos el maxStock calculado y guardado al momento de agregar al carrito
  if (itemCarrito.maxStock !== undefined && itemCarrito.maxStock !== null) {
    const val = Number(itemCarrito.maxStock);
    if (!Number.isNaN(val)) return val;
  }
  // Si no existe maxStock, intentar por variante seleccionada
  if (Array.isArray(itemCarrito.variantes) && itemCarrito.colorSeleccionado) {
    const v = itemCarrito.variantes.find(
      (va) => va.color === itemCarrito.colorSeleccionado
    );
    if (v && v.cantidad !== undefined) return Number(v.cantidad) || 0;
  }
  // Como fallback, usar cantidad del producto si existe
  if (itemCarrito.cantidadProducto !== undefined) {
    const val = Number(itemCarrito.cantidadProducto);
    if (!Number.isNaN(val)) return val;
  }
  if (
    itemCarrito.cantidad !== undefined &&
    typeof itemCarrito.cantidad === "number"
  ) {
    // OJO: en el carrito "cantidad" es cantidad en carrito, no stock; evitar si es posible
  }
  return Number.POSITIVE_INFINITY;
}

// 👉 helper: guardar payload de carrito
function setCheckoutPayloadCart(items, total) {
  try {
    const payload = { mode: "cart", items, total, at: Date.now() };
    sessionStorage.setItem("checkoutPayload", JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

export default function Carrito() {
  const {
    carrito,
    agregarAlCarrito,
    eliminarUnidadDelCarrito,
    quitarDelCarrito,
  } = useCarrito();
  const navigate = useNavigate();

  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [productosLive, setProductosLive] = useState({}); // id -> data

  // Suscribirse a Firestore para tener stock en vivo por cada item del carrito
  useEffect(() => {
    const unsubscribers = [];
    const seen = new Set();
    carrito.forEach((item) => {
      if (item?.id && !seen.has(item.id)) {
        seen.add(item.id);
        const ref = doc(db, "productos", item.id);
        const unsub = onSnapshot(ref, (snap) => {
          if (snap.exists()) {
            setProductosLive((prev) => ({ ...prev, [item.id]: snap.data() }));
          }
        });
        unsubscribers.push(unsub);
      }
    });
    return () => {
      unsubscribers.forEach((fn) => fn && fn());
    };
  }, [carrito]);

  const total = carrito.reduce(
    (acc, item) => acc + (Number(item.precio) || 0) * item.cantidad,
    0
  );

  const cartItemsForPayload = carrito.map((item) => ({
    id: item.id,
    nombre: item.nombre,
    precio: Number(item.precio) || 0,
    cantidad: item.cantidad,
  }));

  return (
    <main className="carrito-page" style={{ paddingTop: 'var(--content-offset, 100px)' }}>
      {carrito.length === 0 ? (
        <div className="carrito-empty-wrap">
          <div className="carrito-empty-box">
            <img
              src="/toy/asoma.png"
              alt="Explora nuestros productos"
              className="carrito-empty-figure"
              loading="lazy"
            />
            <div className="carrito-empty-glass">
              <div className="carrito-empty-icon" aria-hidden="true">🛒</div>
              <h2 className="carrito-empty-title">No hay nada en el carrito</h2>
              <p className="carrito-empty-sub">Explora nuestros productos</p>
              <button
                type="button"
                className="carrito-empty-cta"
                onClick={() => navigate('/categorias')}
              >
                Ver productos
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="carrito-grid">
            {carrito.map((item) => {
              const liveProd = productosLive[item.id];
              const maxStockFallback = getStockMaximo(item);
              const maxStock = getLiveMaxStock(item, liveProd);
              const restante = Number.isFinite(maxStock)
                ? Math.max(0, maxStock - (Number(item.cantidad) || 0))
                : maxStock;

              const itemKey = `${item.id}__${item.colorSeleccionado ?? ""}`;
              return (
                <div
                  key={itemKey}
                  className="carrito-card"
                  onClick={() => navigate(`/producto/${item.id}`)}
                >
                  {(() => {
                    const pickUrl = (u) => {
                      try {
                        if (!u) return "";
                        if (typeof u === "string") return u;
                        if (typeof u === "object" && u !== null)
                          return u.url || "";
                        return String(u || "");
                      } catch {
                        return "";
                      }
                    };
                    const p = productosLive[item.id] || item;
                    // Orden de prioridad: imagenPrincipal[0].url -> imagen -> media image -> galeriaImagenes[0] -> imagenes[0] -> variantes (principal/legacy)
                    const fromVariant = () => {
                      const vars = Array.isArray(p.variantes)
                        ? p.variantes
                        : [];
                      for (const v of vars) {
                        const vMain = pickUrl(v?.imagenPrincipal?.[0]);
                        if (vMain) return vMain;
                        if (v?.imagen) return v.imagen;
                        const vMediaArr = Array.isArray(v?.media)
                          ? v.media
                          : [];
                        const vMediaImg = vMediaArr.find((m) => {
                          const t = (m?.type || "").toLowerCase();
                          return (
                            pickUrl(m) &&
                            (!t ||
                              t.includes("image") ||
                              t === "img" ||
                              t === "photo")
                          );
                        });
                        if (vMediaImg) return pickUrl(vMediaImg);
                      }
                      return "";
                    };
                    const mediaArr = Array.isArray(p.media) ? p.media : [];
                    const mediaImg = mediaArr.find((m) => {
                      const t = (m?.type || "").toLowerCase();
                      return (
                        pickUrl(m) &&
                        (!t ||
                          t.includes("image") ||
                          t === "img" ||
                          t === "photo")
                      );
                    });
                    const displayImage =
                      pickUrl(p?.imagenPrincipal?.[0]) ||
                      p?.imagen ||
                      (mediaImg ? pickUrl(mediaImg) : "") ||
                      pickUrl(
                        Array.isArray(p?.galeriaImagenes) &&
                          p.galeriaImagenes[0]
                      ) ||
                      pickUrl(Array.isArray(p?.imagenes) && p.imagenes[0]) ||
                      fromVariant() ||
                      "";
                    return (
                      <img
                        src={displayImage}
                        alt={item.nombre}
                        className="carrito-img"
                      />
                    );
                  })()}

                  <div className="carrito-info">
                    <h2 className="carrito-nombre">{item.nombre}</h2>

                    <p
                      className={`carrito-stock ${
                        restante === 0
                          ? "stock-out"
                          : Number.isFinite(restante) && restante <= 2
                          ? "stock-low"
                          : "stock-ok"
                      }`}
                    >
                      {restante === 0
                        ? "No disponible"
                        : Number.isFinite(restante) && restante <= 2
                        ? `Casi agotado (${restante})`
                        : Number.isFinite(restante)
                        ? `Disponible (${restante})`
                        : "Disponible"}
                    </p>

                    <div className="carrito-actions">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          eliminarUnidadDelCarrito(
                            item.id,
                            item.colorSeleccionado ?? null
                          );
                        }}
                        className="vp-qty-btn"
                      >
                        −
                      </button>

                      <span className="vp-qty">{item.cantidad}</span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (
                            !Number.isFinite(maxStock) ||
                            item.cantidad < maxStock
                          ) {
                            agregarAlCarrito(
                              item,
                              item.colorSeleccionado ?? null
                            );
                          }
                        }}
                        className="vp-qty-btn"
                        disabled={
                          Number.isFinite(maxStock) && item.cantidad >= maxStock
                        }
                      >
                        +
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setProductoAEliminar(item); // abrir modal
                        }}
                        className="vp-remove"
                        title="Quitar"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </div>

                  <div className="carrito-subtotal">
                    DOP{" "}
                    {formatPriceRD((Number(item.precio) || 0) * item.cantidad)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagar carrito completo: SOLO el botón de CardNet (negro) */}
          <div className="carrito-footer">
            <div
              className="carrito-pay-wrap"
              onClick={() => setCheckoutPayloadCart(cartItemsForPayload, total)}
            >
              <BotonCardnet
                className="carrito-cardnet-btn w-full"
                total={total * 100}
              />
            </div>
          </div>
        </>
      )}

      {/* Modal de confirmación */}
      {productoAEliminar && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>¿Eliminar producto?</h2>
            <p>
              ¿Seguro que quieres quitar{" "}
              <strong>{productoAEliminar.nombre}</strong> del carrito?
            </p>
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setProductoAEliminar(null)}
              >
                Cancelar
              </button>
              <button
                className="btn-confirm"
                onClick={() => {
                  quitarDelCarrito(
                    productoAEliminar.id,
                    productoAEliminar.colorSeleccionado ?? null
                  );
                  setProductoAEliminar(null);
                }}
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
