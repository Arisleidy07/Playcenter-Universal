import React from "react";
import { useCarrito } from "../context/CarritoContext";
import { useNavigate } from "react-router-dom";
import productosAll from "../data/productosAll";
import { FaTrashAlt } from "react-icons/fa";
import BotonCardnet from "../components/BotonCardnet"; // 👈 NEW
import "../styles/Carrito.css";

function formatPriceRD(value) {
  const pesos = Math.round(Number(value) || 0);
  return new Intl.NumberFormat("es-DO").format(pesos);
}

// Stock real desde productosAll (root cantidad o primera variante)
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
  if (real.variantes?.[0]?.cantidad !== undefined) return real.variantes[0].cantidad;
  return Number.POSITIVE_INFINITY;
}

export default function Carrito() {
  const { carrito, agregarAlCarrito, eliminarUnidadDelCarrito, quitarDelCarrito } = useCarrito();
  const navigate = useNavigate();

  const total = carrito.reduce(
    (acc, item) => acc + (Number(item.precio) || 0) * item.cantidad,
    0
  );

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
                  {/* Imagen */}
                  <img
                    src={item.imagen || item.imagenes?.[0]}
                    alt={item.nombre}
                    className="carrito-img"
                  />

                  {/* Info */}
                  <div className="carrito-info">
                    <h2 className="carrito-nombre">{item.nombre}</h2>

                    <p
                      className={`carrito-stock ${
                        stock === 0 ? "stock-out" : stock <= 2 ? "stock-low" : "stock-ok"
                      }`}
                    >
                      {stock === 0
                        ? "No disponible"
                        : stock <= 2
                        ? `Casi agotado (${stock})`
                        : `Disponible (${stock})`}
                    </p>

                    {/* Cantidad */}
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
                            if (productoReal) {
                              agregarAlCarrito(productoReal);
                            }
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

                  {/* Subtotal */}
                  <div className="carrito-subtotal">
                    DOP {formatPriceRD((Number(item.precio) || 0) * item.cantidad)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Botón pagar con CardNet */}
          <div className="carrito-footer">
          <BotonCardnet
            className="carrito-pay-btn"
            label={`Proceder al pago — DOP ${formatPriceRD(total)}`}
            total={total * 100}
          />

          </div>
        </>
      )}
    </main>
  );
}
