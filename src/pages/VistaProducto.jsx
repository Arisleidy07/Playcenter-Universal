import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowLeft, FaTimes, FaTrash } from "react-icons/fa";
import GaleriaImagenes from "../components/GaleriaImagenes";
import productosAll from "../data/productosAll";
import { useCarrito } from "../context/CarritoContext";
import { useAuth } from "../context/AuthContext";
import ModalLoginAlert from "../components/ModalLoginAlert";
import ProductosRelacionados from "../components/ProductosRelacionados";
import BotonCardnet from "../components/BotonCardnet"; // se mantiene
import "../styles/VistaProducto.css";

function formatPriceRD(value) {
  const pesos = Math.round(Number(value) || 0);
  return new Intl.NumberFormat("es-DO").format(pesos);
}

// 👉 guarda en sessionStorage el payload de checkout (modo e items)
function setCheckoutPayload(mode, items, total) {
  try {
    const payload = { mode, items, total, at: Date.now() };
    sessionStorage.setItem("checkoutPayload", JSON.stringify(payload));
  } catch { /* ignore */ }
}

function VistaProducto() {
  const { carrito, agregarAlCarrito, quitarDelCarrito, eliminarUnidadDelCarrito } = useCarrito();
  const { usuario } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [colorSeleccionado, setColorSeleccionado] = useState(null);

  let producto = null;
  for (const categoria of productosAll) {
    const encontrado = categoria.productos.find((p) => p.id === id);
    if (encontrado) {
      producto = { ...encontrado, categoria: categoria.categoria };
      break;
    }
  }

  const onBack = () => {
    if (window.history && window.history.length > 1) navigate(-1);
    else navigate("/productos");
  };

  if (!producto) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-700 p-4">
        <p className="text-center text-lg sm:text-xl font-semibold">Producto no encontrado.</p>
      </div>
    );
  }

  const varianteActiva =
    producto.variantes?.find((v) => v.color === colorSeleccionado) ||
    producto.variantes?.[0];

  const enCarrito = carrito.find((item) => item.id === producto.id);
  const cantidadEnCarrito = enCarrito?.cantidad || 0;

  const handleAgregar = () => {
    if (!usuario) { setModalAbierto(true); return; }
    if (!enCarrito) agregarAlCarrito({ ...producto, cantidad: 1 });
  };
  const handleIncremento = () => {
    if (!usuario) { setModalAbierto(true); return; }
    agregarAlCarrito(producto);
  };
  const handleDecremento = () => {
    if (!usuario) { setModalAbierto(true); return; }
    eliminarUnidadDelCarrito(producto.id);
  };
  const handleQuitar = () => {
    if (!usuario) { setModalAbierto(true); return; }
    quitarDelCarrito(producto.id);
  };

  const variantesConColor = producto.variantes?.filter((v) => v.color && v.color.trim() !== "");
  const disponible =
    varianteActiva?.cantidad === undefined || varianteActiva?.cantidad > 0;

  const precioProducto = Number(producto.precio) || 0;
  const itemsBuyNow = [
    {
      id: producto.id,
      nombre: producto.nombre,
      precio: precioProducto,
      cantidad: 1,
    },
  ];

  return (
    <>
      {/* Barra superior */}
      <div className="vp-mobile-topbar">
        <button className="vp-icon-btn" onClick={onBack} aria-label="Volver"><FaArrowLeft /></button>
        <div className="vp-topbar-title" title={producto.nombre}>{producto.nombre}</div>
        <button className="vp-icon-btn" onClick={onBack} aria-label="Cerrar"><FaTimes /></button>
      </div>

      {/* Botón de regreso móvil debajo del topbar */}
      <div className="lg:hidden w-full px-4 pt-4 pb-2">
        <button 
          className="vp-icon-btn" 
          onClick={onBack} 
          aria-label="Volver"
        >
          <FaArrowLeft size={16} />
        </button>
      </div>

      <main className="min-h-screen bg-white px-3 sm:px-4 pb-16 pt-0 lg:pt-20 text-gray-800 flex flex-col items-center overflow-visible">
        <section className="max-w-7xl w-full flex flex-col lg:flex-row gap-8 lg:gap-12 overflow-visible">
          {/* Columna Izquierda */}
          <motion.div className="relative flex flex-col items-center w-full lg:w-1/2 overflow-visible">
            {/* Botón de regreso para desktop */}
            <button 
              className="vp-back-fab hidden lg:block" 
              onClick={onBack} 
              aria-label="Volver"
            >
              <FaArrowLeft size={16} />
            </button>
            <div className="absolute right-2 top-2 z-10">
              {/* comparte */}
            </div>


            <GaleriaImagenes
              imagenes={
                varianteActiva?.imagenes?.length
                  ? varianteActiva.imagenes
                  : producto.imagenes || [producto.imagen]
              }
              imagenPrincipalClassName="max-h-[420px] min-h-[260px] w-auto"
              miniaturaClassName="w-16 h-16 sm:w-20 sm:h-20"
            />

            {variantesConColor && variantesConColor.length > 1 && (
              <div className="vp-variants">
                {variantesConColor.map((variante, i) => {
                  const activa = colorSeleccionado ? colorSeleccionado === variante.color : i === 0;
                  return (
                    <button
                      key={i}
                      onClick={() => setColorSeleccionado(variante.color)}
                      className={`vp-variant-chip ${activa ? "is-active" : ""}`}
                    >
                      <img src={variante.imagen} alt={variante.color} className="vp-variant-thumb" />
                      <span className="vp-variant-label">{variante.color}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Columna Centro */}
          <motion.div className="flex flex-col gap-4 sm:gap-5 w-full lg:w-1/2 overflow-visible">
            <h1 className="vp-title">{producto.nombre}</h1>
            <p className="vp-desc">{producto.descripcion || "Contáctanos para más detalles."}</p>
            <p className="vp-price">DOP {formatPriceRD(precioProducto)}</p>

            {/* DISPONIBILIDAD + BOTONES SOLO EN MÓVIL */}
            <div className="lg:hidden flex flex-col gap-3 overflow-visible">
              {varianteActiva?.cantidad !== undefined && (
                <div className={`vp-stock ${varianteActiva.cantidad === 0 ? "vp-stock-out" : varianteActiva.cantidad <= 2 ? "vp-stock-low" : "vp-stock-ok"}`}>
                  {varianteActiva.cantidad === 0 ? "No disponible" : `Quedan ${varianteActiva.cantidad} disponibles`}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 overflow-visible">
                {enCarrito ? (
                  <div className="vp-qty-row w-full sm:w-1/2">
                    <button onClick={handleDecremento} className="vp-qty-btn">−</button>
                    <span className="vp-qty">{cantidadEnCarrito}</span>
                    <button onClick={handleIncremento} className="vp-qty-btn">+</button>
                    <button onClick={handleQuitar} className="vp-remove"><FaTrash /></button>
                  </div>
                ) : (
                  <button className="button w-full sm:w-1/2" onClick={handleAgregar} disabled={!disponible}>
                    Agregar al carrito
                  </button>
                )}

                {/* 👇 “Comprar ahora” SOLO este producto */}
                <div
                  className="w-full sm:w-1/2"
                  onClick={() => setCheckoutPayload("single", itemsBuyNow, precioProducto)}
                >
                  <BotonCardnet className="w-full" total={precioProducto * 100} label="Comprar ahora" />
                </div>
              </div>
            </div>

            {producto.acerca && (
              <div>
                <h3 className="vp-subtitle">Acerca de este artículo</h3>
                <ul className="vp-bullets">
                  {producto.acerca.map((detalle, i) => <li key={i}>{detalle}</li>)}
                </ul>
              </div>
            )}
          </motion.div>

          {/* Columna Derecha */}
          <aside className="vp-buy-card w-full lg:w-[360px] hidden lg:block">
            <div className="vp-buy-inner">
              <div className="vp-buy-price">DOP {formatPriceRD(precioProducto)}</div>

              {varianteActiva?.cantidad !== undefined && (
                <div className={`vp-stock ${varianteActiva.cantidad === 0 ? "vp-stock-out" : varianteActiva.cantidad <= 2 ? "vp-stock-low" : "vp-stock-ok"}`}>
                  {varianteActiva.cantidad === 0 ? "No disponible" : `Quedan ${varianteActiva.cantidad} disponibles`}
                </div>
              )}

              <div className="flex flex-col gap-3">
                {enCarrito ? (
                  <div className="vp-qty-row">
                    <button onClick={handleDecremento} className="vp-qty-btn">−</button>
                    <span className="vp-qty">{cantidadEnCarrito}</span>
                    <button onClick={handleIncremento} className="vp-qty-btn">+</button>
                    <button onClick={handleQuitar} className="vp-remove"><FaTrash /></button>
                  </div>
                ) : (
                  <button className="button w-full" onClick={handleAgregar} disabled={!disponible}>
                    Agregar al carrito
                  </button>
                )}

                {/* “Comprar ahora” */}
                <div
                  onClick={() => setCheckoutPayload("single", itemsBuyNow, precioProducto)}
                >
                  <BotonCardnet className="w-full" total={precioProducto * 100} label="Comprar ahora" />
                </div>
              </div>
            </div>
          </aside>
        </section>

        {/* Productos relacionados */}
        <div className="max-w-7xl w-full mt-10">
          <ProductosRelacionados
            productoActual={producto}
            productosPorCategoria={productosAll}
            onProductoClick={(pid) => navigate(`/producto/${pid}`)}
          />
        </div>

        {/* Videos + extras */}
        <section className="max-w-7xl w-full mt-12 px-1 sm:px-2">
          <h2 className="vp-section-title">Más Información del Producto</h2>

          {producto.videoUrls?.length > 0 ? (
            <div className="vp-video-carousel">
              {producto.videoUrls.map((url, i) => (
                <div key={i} className="vp-video-card">
                  <video src={url} controls className="vp-video" preload="metadata" />
                </div>
              ))}
            </div>
          ) : producto.videoUrl ? (
            <div className="vp-video-single">
              <video src={producto.videoUrl} controls className="vp-video" preload="metadata" />
            </div>
          ) : null}

          {producto.imagenesExtra?.length > 0 && (
            <div className="vp-extras-grid">
              {producto.imagenesExtra.slice(0, 3).map((img, i) => (
                <img key={i} src={img} alt={`Vista extra ${i + 1}`} className="vp-extra-img" />
              ))}
            </div>
          )}
        </section>
      </main>

      <ModalLoginAlert isOpen={modalAbierto} onClose={() => setModalAbierto(false)} />
    </>
  );
}

export default VistaProducto;
