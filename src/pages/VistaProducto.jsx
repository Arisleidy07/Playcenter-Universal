import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaShoppingCart,
  FaArrowLeft,
  FaTimes,
} from "react-icons/fa";
import GaleriaImagenes from "../components/GaleriaImagenes";
import productosAll from "../data/productosAll";
import { useCarrito } from "../context/CarritoContext";
import { useAuth } from "../context/AuthContext";
import ModalLoginAlert from "../components/ModalLoginAlert";
import ProductosRelacionados from "../components/ProductosRelacionados";
import BotonCompartir from "../components/BotonCompartir";

import "../styles/VistaProducto.css";

function formatPriceRD(value) {
  const pesos = Math.round(Number(value) || 0);
  return new Intl.NumberFormat("es-DO").format(pesos);
}

function VistaProducto() {
  const {
    carrito,
    agregarAlCarrito,
    quitarDelCarrito,
    eliminarUnidadDelCarrito,
  } = useCarrito();
  const { usuario } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [colorSeleccionado, setColorSeleccionado] = useState(null);

  // Buscar producto
  let producto = null;
  for (const categoria of productosAll) {
    const encontrado = categoria.productos.find((p) => p.id === id);
    if (encontrado) {
      producto = { ...encontrado, categoria: categoria.categoria };
      break;
    }
  }

  const onBack = () => {
    if (window.history && window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/productos");
    }
  };

  if (!producto) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-700 p-4">
        <p className="text-center text-lg sm:text-xl font-semibold">
          Producto no encontrado.
          <button onClick={onBack} className="text-blue-500 underline ml-2">
            Volver
          </button>
        </p>
      </div>
    );
  }

  const varianteActiva =
    producto.variantes?.find((v) => v.color === colorSeleccionado) ||
    producto.variantes?.[0];

  const enCarrito = carrito.find((item) => item.id === producto.id);
  const cantidadEnCarrito = enCarrito?.cantidad || 0;

  // Acciones carrito
  const handleAgregar = () => {
    if (!usuario) {
      setModalAbierto(true);
      return;
    }
    if (!enCarrito) {
      agregarAlCarrito({ ...producto, cantidad: 1 });
    }
  };

  const handleIncremento = () => {
    if (!usuario) {
      setModalAbierto(true);
      return;
    }
    agregarAlCarrito(producto);
  };

  const handleDecremento = () => {
    if (!usuario) {
      setModalAbierto(true);
      return;
    }
    eliminarUnidadDelCarrito(producto.id);
  };

  const handleQuitar = () => {
    if (!usuario) {
      setModalAbierto(true);
      return;
    }
    quitarDelCarrito(producto.id);
  };

  const variantesConColor = producto.variantes?.filter(
    (v) => v.color && v.color.trim() !== ""
  );

  const disponible =
    varianteActiva?.cantidad === undefined || varianteActiva?.cantidad > 0;

  return (
    <>
      {/* Barra superior con flecha afuera de la imagen */}
      <div className="vp-mobile-topbar">
        <button className="vp-icon-btn" onClick={onBack} aria-label="Volver">
          <FaArrowLeft />
        </button>
        <div className="vp-topbar-title" title={producto.nombre}>
          {producto.nombre}
        </div>
        <button className="vp-icon-btn" onClick={onBack} aria-label="Cerrar">
          <FaTimes />
        </button>
      </div>

      <main className="min-h-screen bg-white px-3 sm:px-4 pb-28 lg:pb-16 pt-16 lg:pt-20 text-gray-800 flex flex-col items-center">
        <section className="max-w-7xl w-full flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Columna Izquierda */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
            className="relative flex flex-col items-center w-full lg:w-1/2"
          >
            {/* Botón de compartir */}
            <div className="absolute right-2 top-2 z-10">
              <BotonCompartir producto={producto} />
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

            {/* Variantes */}
            {variantesConColor && variantesConColor.length > 1 && (
              <div className="vp-variants">
                {variantesConColor.map((variante, i) => {
                  const activa = colorSeleccionado
                    ? colorSeleccionado === variante.color
                    : i === 0;
                  return (
                    <button
                      key={i}
                      onClick={() => setColorSeleccionado(variante.color)}
                      className={`vp-variant-chip ${
                        activa ? "is-active" : ""
                      }`}
                      title={`Color ${variante.color}`}
                    >
                      <img
                        src={variante.imagen}
                        alt={`Color ${variante.color}`}
                        className="vp-variant-thumb"
                      />
                      <span className="vp-variant-label">
                        {variante.color}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Columna Centro */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col gap-4 sm:gap-5 w-full lg:w-1/2"
          >
            <h1 className="vp-title">{producto.nombre}</h1>

            <p className="vp-desc">
              {producto.descripcion ||
                "Contáctanos para más detalles o para coordinar una compra en nuestra tienda física."}
            </p>

            <p className="vp-price">DOP {formatPriceRD(producto.precio)}</p>

            {producto.acerca && (
              <div className="mt-1">
                <h3 className="vp-subtitle">Acerca de este artículo</h3>
                <ul className="vp-bullets">
                  {producto.acerca.map((detalle, i) => (
                    <li key={i}>{detalle}</li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>

          {/* Columna Derecha */}
          <aside className="vp-buy-card w-full lg:w-[360px]">
            <div className="vp-buy-inner">
              <div className="vp-buy-price">
                DOP {formatPriceRD(producto.precio)}
              </div>

              {varianteActiva?.cantidad !== undefined && (
                <div
                  className={`vp-stock ${
                    varianteActiva.cantidad === 0
                      ? "vp-stock-out"
                      : varianteActiva.cantidad <= 2
                      ? "vp-stock-low"
                      : "vp-stock-ok"
                  }`}
                >
                  {varianteActiva.cantidad === 0
                    ? "No disponible"
                    : `Quedan ${varianteActiva.cantidad} disponibles`}
                </div>
              )}

              {enCarrito ? (
                <div className="vp-qty-row">
                  <button
                    onClick={handleDecremento}
                    className="vp-qty-btn"
                    aria-label="Disminuir"
                  >
                    −
                  </button>
                  <span className="vp-qty">{cantidadEnCarrito}</span>
                  <button
                    onClick={handleIncremento}
                    className="vp-qty-btn"
                    aria-label="Aumentar"
                    disabled={
                      varianteActiva?.cantidad !== undefined &&
                      cantidadEnCarrito >= varianteActiva.cantidad
                    }
                  >
                    +
                  </button>
                  <button
                    onClick={handleQuitar}
                    className="vp-remove"
                    aria-label="Quitar del carrito"
                  >
                    Quitar
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAgregar}
                  disabled={!disponible}
                  className={`vp-btn-primary ${!disponible ? "is-disabled" : ""}`}
                >
                  <FaShoppingCart className="text-base sm:text-lg" />
                  <span>Agregar al carrito</span>
                </button>
              )}
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

        {/* Sección Videos + Imágenes extra */}
        <section className="max-w-7xl w-full mt-12 px-1 sm:px-2">
          <h2 className="vp-section-title">Más Información del Producto</h2>

          {producto.videoUrls && producto.videoUrls.length > 0 ? (
            <div className="vp-video-carousel">
              {producto.videoUrls.map((url, i) => (
                <div className="vp-video-card" key={i}>
                  <video
                    src={url}
                    controls
                    className="vp-video"
                    preload="metadata"
                  />
                </div>
              ))}
            </div>
          ) : producto.videoUrl ? (
            <div className="vp-video-single">
              <video
                src={producto.videoUrl}
                controls
                className="vp-video"
                preload="metadata"
              />
            </div>
          ) : null}

          {producto.imagenesExtra && producto.imagenesExtra.length > 0 && (
            <div className="vp-extras-grid">
              {producto.imagenesExtra.slice(0, 3).map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`Vista extra ${i + 1} de ${producto.nombre}`}
                  className="vp-extra-img"
                  loading="lazy"
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* CTA móvil */}
      <div className="vp-sticky-cta lg:hidden">
        {enCarrito ? (
          <div className="vp-qty-row w-full">
            <button onClick={handleDecremento} className="vp-qty-btn">
              −
            </button>
            <span className="vp-qty">{cantidadEnCarrito}</span>
            <button
              onClick={handleIncremento}
              className="vp-qty-btn"
              disabled={
                varianteActiva?.cantidad !== undefined &&
                cantidadEnCarrito >= varianteActiva.cantidad
              }
            >
              +
            </button>
            <button onClick={handleQuitar} className="vp-remove">
              Quitar
            </button>
          </div>
        ) : (
          <button
            onClick={handleAgregar}
            disabled={!disponible}
            className={`vp-btn-primary w-full ${!disponible ? "is-disabled" : ""}`}
          >
            <FaShoppingCart className="text-base" />
            <span>Agregar</span>
          </button>
        )}
      </div>

      <ModalLoginAlert
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
      />
    </>
  );
}

export default VistaProducto;
