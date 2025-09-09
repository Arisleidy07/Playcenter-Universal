import React, { useState } from "react";
import { useCarrito } from "../context/CarritoContext";
import { useNavigate } from "react-router-dom";
import productosAll from "../data/productosAll";
import { FaTrashAlt } from "react-icons/fa";
import BotonCardnet from "../components/BotonCardnet";
import "../styles/Carrito.css";

function formatPriceRD(value) {
  const pesos = Math.round(Number(value) || 0);
  return new Intl.NumberFormat("es-DO").format(pesos);
}

function getStockDisponible(itemCarrito) {
  let real = null;
  for (const cat of productosAll) {
    const e = cat.productos.find((p) => p.id === itemCarrito.id);
    if (e) {
      real = e;
      break;
    }
  }
  if (!real) return Number.POSITIVE_INFINITY;
  if (typeof real.cantidad === "number") return real.cantidad;
  if (real.variantes?.[0]?.cantidad !== undefined)
    return real.variantes[0].cantidad;
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
  const [cargandoPago, setCargandoPago] = useState(false);

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
    <main className="carrito-page">
      <h1 className="carrito-title">Mi Carrito</h1>

      {carrito.length === 0 ? (
        <p className="carrito-empty">Tu carrito está vacío.</p>
      ) : (
        <>
          <div className="carrito-grid">
            {carrito.map((item) => {
              const stock = getStockDisponible(item);

              return (
                <div
                  key={item.id}
                  className="carrito-card"
                  onClick={() => navigate(`/producto/${item.id}`)}
                >
                  <img
                    src={item.imagen || item.imagenes?.[0]}
                    alt={item.nombre}
                    className="carrito-img"
                  />

                  <div className="carrito-info">
                    <h2 className="carrito-nombre">{item.nombre}</h2>

                    <p
                      className={`carrito-stock ${
                        stock === 0
                          ? "stock-out"
                          : stock <= 2
                          ? "stock-low"
                          : "stock-ok"
                      }`}
                    >
                      {stock === 0
                        ? "No disponible"
                        : stock <= 2
                        ? `Casi agotado (${stock})`
                        : `Disponible (${stock})`}
                    </p>

                    <div className="carrito-actions">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          eliminarUnidadDelCarrito(item.id);
                        }}
                        className="vp-qty-btn"
                      >
                        −
                      </button>

                      <span className="vp-qty">{item.cantidad}</span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.cantidad < stock) {
                            let productoReal = null;
                            for (const categoria of productosAll) {
                              const encontrado = categoria.productos.find(
                                (p) => p.id === item.id
                              );
                              if (encontrado) {
                                productoReal = encontrado;
                                break;
                              }
                            }
                            if (productoReal) agregarAlCarrito(productoReal);
                          }
                        }}
                        className="vp-qty-btn"
                        disabled={item.cantidad >= stock}
                      >
                        +
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          quitarDelCarrito(item.id);
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

          {/* Pagar carrito completo */}
          <div className="carrito-footer">
            <div
              className="carrito-pay-btn"
              onClick={() => {
                setCargandoPago(true);
                setCheckoutPayloadCart(cartItemsForPayload, total);
              }}
            >
              <span className="btn-text">Proceder al Pago</span>
              <BotonCardnet className="" total={total * 100} />
            </div>
          </div>
        </>
      )}
      {/* Loader de pantalla completa */}
      {cargandoPago && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm mx-4 text-center">
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Redirigiendo a CardNet
            </h3>
            <p className="text-gray-600 text-sm">
              Espera unos segundos mientras procesamos tu solicitud...
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
