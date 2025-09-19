import React, { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowLeft, FaTimes, FaTrash } from "react-icons/fa";
import GaleriaImagenes from "../components/GaleriaImagenes";
import { useProduct } from "../hooks/useProducts";
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
  } catch {
    /* ignore */
  }
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
  const [imagenModalAbierta, setImagenModalAbierta] = useState(false);
  const [imagenActualIndex, setImagenActualIndex] = useState(0);
  const [videoActualIndex, setVideoActualIndex] = useState(0);

  // refs/estado para swipe en modal
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);

  // ---------- ZOOM (desktop) ----------
  const imgWrapRef = useRef(null);
  const mainImgRef = useRef(null);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomBg, setZoomBg] = useState("");
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [zoomBgSize, setZoomBgSize] = useState({ w: 200, h: 200 }); // % tamaño fondo

  const { product: producto, loading, error } = useProduct(id);

  const onBack = () => {
    if (window.history && window.history.length > 1) navigate(-1);
    else navigate("/productos");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-700 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-700 mx-auto mb-4"></div>
          <p className="text-lg">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-700 p-4">
        <div className="text-center">
          <p className="text-lg sm:text-xl font-semibold mb-2">
            Producto no encontrado.
          </p>
          <button
            onClick={onBack}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  const varianteActiva =
    producto.variantes?.find((v) => v.color === colorSeleccionado) ||
    producto.variantes?.[0];

  const enCarrito = carrito.find(
    (item) => item.id === producto.id && (item.colorSeleccionado ?? null) === (colorSeleccionado ?? null)
  );
  const cantidadEnCarrito = enCarrito?.cantidad || 0;

  const handleAgregar = () => {
    if (!usuario) {
      setModalAbierto(true);
      return;
    }
    if (!enCarrito) agregarAlCarrito({ ...producto, cantidad: 1 }, colorSeleccionado);
  };
  const handleIncremento = () => {
    if (!usuario) {
      setModalAbierto(true);
      return;
    }
    agregarAlCarrito(producto, colorSeleccionado);
  };
  const handleDecremento = () => {
    if (!usuario) {
      setModalAbierto(true);
      return;
    }
    eliminarUnidadDelCarrito(producto.id, colorSeleccionado);
  };
  const handleQuitar = () => {
    if (!usuario) {
      setModalAbierto(true);
      return;
    }
    quitarDelCarrito(producto.id, colorSeleccionado);
  };

  const variantesConColor = producto.variantes?.filter(
    (v) => v.color && v.color.trim() !== ""
  );
  const stockDisponible =
    varianteActiva?.cantidad !== undefined
      ? Number(varianteActiva.cantidad) || 0
      : (producto.cantidad !== undefined ? Number(producto.cantidad) || 0 : Infinity);
  const disponible = stockDisponible > 0;
  const restante = Number.isFinite(stockDisponible)
    ? Math.max(0, stockDisponible - (enCarrito?.cantidad || 0))
    : Infinity;

  const precioProducto = Number(producto.precio) || 0;
  const itemsBuyNow = [
    {
      id: producto.id,
      nombre: producto.nombre,
      precio: precioProducto,
      cantidad: 1,
    },
  ];

  // Media unificada (tipo Amazon): imágenes + videos (variante primero), sin duplicados
  const imagenesVariante = varianteActiva?.imagenes || [];
  const imagenPrincipalVariante = varianteActiva?.imagen ? [varianteActiva.imagen] : [];
  const imagenesProducto = producto.imagenes || [];
  const imagenPrincipalProducto = producto.imagen ? [producto.imagen] : [];
  const videosVariante = Array.isArray(varianteActiva?.videoUrls) ? varianteActiva.videoUrls : [];
  const videosProducto = Array.isArray(producto.videoUrls) ? producto.videoUrls : [];

  // Preferencia: imágenes de la variante (principal + extra), si no hay, usar las del producto
  const imagenesPreferidasRaw = (imagenesVariante.length || imagenPrincipalVariante.length)
    ? [...imagenPrincipalVariante, ...imagenesVariante]
    : [...imagenPrincipalProducto, ...imagenesProducto];

  const unique = (arr) => {
    const seen = new Set();
    return arr.filter((u) => {
      if (!u) return false;
      if (seen.has(u)) return false;
      seen.add(u);
      return true;
    });
  };
  const imagenesPreferidas = unique(imagenesPreferidasRaw);
  const videosPreferidos = unique(videosVariante.length ? videosVariante : videosProducto);

  // Construir lista de medios: primero imágenes, luego videos
  const mediaGaleria = [
    ...imagenesPreferidas.map((url) => ({ tipo: 'imagen', url })),
    ...videosPreferidos.map((url) => ({ tipo: 'video', url }))
  ].filter((m) => !!m.url);

  const abrirImagenModal = (index) => {
    setImagenActualIndex(index);
    setImagenModalAbierta(true);
  };

  const cerrarImagenModal = () => {
    setImagenModalAbierta(false);
  };

  const siguienteImagen = () => {
    setImagenActualIndex((prev) =>
      prev === mediaGaleria.length - 1 ? 0 : prev + 1
    );
  };

  const anteriorImagen = () => {
    setImagenActualIndex((prev) =>
      prev === 0 ? mediaGaleria.length - 1 : prev - 1
    );
  };

  // Handlers de swipe en el modal (sin flechas)
  const onTouchStartModal = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };
  const onTouchMoveModal = (e) => {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };
  const onTouchEndModal = () => {
    const threshold = 40; // sensibilidad swipe
    if (touchDeltaX.current > threshold) {
      anteriorImagen();
    } else if (touchDeltaX.current < -threshold) {
      siguienteImagen();
    }
    touchStartX.current = 0;
    touchDeltaX.current = 0;
  };

  // ---------- Handlers ZOOM (desktop) ----------
  const handleMouseEnter = () => {
    if (window.innerWidth < 1024) return; // solo desktop
    if (mediaGaleria[imagenActualIndex]?.tipo === 'video') return; // no zoom en video
    const url = mediaGaleria[imagenActualIndex]?.url;
    setZoomBg(url);
    // intenta estimar el tamaño de fondo para mayor detalle:
    const imgEl = mainImgRef.current;
    if (imgEl && imgEl.naturalWidth && imgEl.clientWidth) {
      const scale = Math.max(
        2,
        Math.min(4, imgEl.naturalWidth / imgEl.clientWidth)
      );
      setZoomBgSize({ w: scale * 100, h: scale * 100 });
    } else {
      setZoomBgSize({ w: 200, h: 200 });
    }
    setIsZooming(true);
  };

  const handleMouseMove = (e) => {
    if (!isZooming || window.innerWidth < 1024) return;
    if (mediaGaleria[imagenActualIndex]?.tipo === 'video') return;
    const wrap = imgWrapRef.current;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  const handleMouseLeave = () => {
    setIsZooming(false);
  };

  return (
    <>
      {/* Barra superior */}
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

      {/* ↑ En móvil ahora dejamos espacio suficiente para que nada quede bajo el TopBar */}
      <main className="min-h-screen bg-white px-3 sm:px-4 pb-16 pt-[30px] lg:pt-20 text-gray-800 flex flex-col items-center overflow-visible">
        <section className="max-w-7xl w-full flex flex-col lg:flex-row gap-8 lg:gap-12 overflow-visible">
          {/* Columna Izquierda */}
          <motion.div className="relative flex flex-col items-center w-full lg:w-1/2 overflow-visible">
            {/* Botón de regreso para desktop y móvil */}
            <button
              className="vp-back-fab"
              onClick={onBack}
              aria-label="Volver"
            >
              <FaArrowLeft size={18} />
            </button>

            {/* Imagen grande + contenedor con soporte de zoom (desktop) */}
            <div
              className="vp-image-container vp-image-zoom-wrap"
              ref={imgWrapRef}
              onMouseEnter={handleMouseEnter}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {mediaGaleria[imagenActualIndex]?.tipo === 'video' ? (
                <video
                  src={mediaGaleria[imagenActualIndex].url}
                  controls
                  className="vp-main-image"
                  onClick={() => abrirImagenModal(imagenActualIndex)}
                />
              ) : (
                <img
                  ref={mainImgRef}
                  src={mediaGaleria[imagenActualIndex]?.url}
                  alt={producto.nombre}
                  className="vp-main-image"
                  onClick={() => abrirImagenModal(imagenActualIndex)}
                />
              )}

              {/* Recuadro de zoom a la derecha (solo desktop) */}
              {isZooming && (
                <div
                  className="vp-zoom-pane"
                  style={{
                    backgroundImage: `url(${zoomBg})`,
                    backgroundSize: `${zoomBgSize.w}% ${zoomBgSize.h}%`,
                    backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                  }}
                />
              )}
            </div>

            {/* Miniaturas debajo */}
            {mediaGaleria.length > 1 && (
              <div className="vp-gallery-thumbs">
                {mediaGaleria.map((m, index) => (
                  <button
                    key={index}
                    className={`vp-thumb-btn ${
                      index === imagenActualIndex ? "active" : ""
                    }`}
                    onClick={() => setImagenActualIndex(index)}
                  >
                    {m.tipo === 'video' ? (
                      <div className="relative">
                        <video src={m.url} className="vp-thumb-video" />
                        <span className="vp-badge-video">Video</span>
                      </div>
                    ) : (
                      <img src={m.url} alt={`${producto.nombre} ${index + 1}`} />
                    )}
                  </button>
                ))}
              </div>
            )}

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
                      className={`vp-variant-chip ${activa ? "is-active" : ""}`}
                    >
                      <img
                        src={variante.imagen}
                        alt={variante.color}
                        className="vp-variant-thumb"
                      />
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
            <p className="vp-desc">
              {producto.descripcion || "Contáctanos para más detalles."}
            </p>
            <p className="vp-price">DOP {formatPriceRD(precioProducto)}</p>

            {/* DISPONIBILIDAD + BOTONES SOLO EN MÓVIL */}
            <div className="lg:hidden flex flex-col gap-3 overflow-visible">
              <div
                className={`vp-stock ${
                  restante === 0
                    ? "vp-stock-out"
                    : restante <= 2
                    ? "vp-stock-low"
                    : "vp-stock-ok"
                }`}
              >
                {restante === 0
                  ? "No disponible"
                  : Number.isFinite(restante)
                  ? `Quedan ${restante} disponibles`
                  : "Disponible"}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 overflow-visible">
                {enCarrito ? (
                  <div className="vp-qty-row w-full sm:w-1/2">
                    <button onClick={handleDecremento} className="vp-qty-btn">
                      −
                    </button>
                    <span className="vp-qty">{cantidadEnCarrito}</span>
                    <button
                      onClick={handleIncremento}
                      className="vp-qty-btn"
                      disabled={cantidadEnCarrito >= stockDisponible}
                      title={cantidadEnCarrito >= stockDisponible ? 'Has alcanzado el máximo disponible' : 'Agregar una unidad'}
                    >
                      +
                    </button>
                    <button onClick={handleQuitar} className="vp-remove">
                      <FaTrash />
                    </button>
                  </div>
                ) : (
                  <button
                    className={`button w-full sm:w-1/2 ${!disponible ? 'opacity-60 cursor-not-allowed' : ''}`}
                    onClick={handleAgregar}
                    disabled={!disponible}
                    title={!disponible ? 'No disponible' : 'Agregar al carrito'}
                  >
                    Agregar al carrito
                  </button>
                )}

                {/* 👇 “Comprar ahora” SOLO este producto */}
                <div
                  className="w-full sm:w-1/2"
                  onClick={() =>
                    setCheckoutPayload("single", itemsBuyNow, precioProducto)
                  }
                >
                  <BotonCardnet
                    className="w-full"
                    total={precioProducto * 100}
                    label="Comprar ahora"
                  />
                </div>
              </div>
            </div>

            {producto.acerca && (
              <div>
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
          <aside className="vp-buy-card w-full lg:w-[360px] hidden lg:block">
            <div className="vp-buy-inner">
              <div className="vp-buy-price">
                DOP {formatPriceRD(precioProducto)}
              </div>

              <div
                className={`vp-stock ${
                  restante === 0
                    ? "vp-stock-out"
                    : restante <= 2
                    ? "vp-stock-low"
                    : "vp-stock-ok"
                }`}
              >
                {restante === 0
                  ? "No disponible"
                  : Number.isFinite(restante)
                  ? `Quedan ${restante} disponibles`
                  : "Disponible"}
              </div>

              <div className="flex flex-col gap-3">
                {enCarrito ? (
                  <div className="vp-qty-row">
                    <button onClick={handleDecremento} className="vp-qty-btn">
                      −
                    </button>
                    <span className="vp-qty">{cantidadEnCarrito}</span>
                    <button
                      onClick={handleIncremento}
                      className="vp-qty-btn"
                      disabled={cantidadEnCarrito >= stockDisponible}
                      title={cantidadEnCarrito >= stockDisponible ? 'Has alcanzado el máximo disponible' : 'Agregar una unidad'}
                    >
                      +
                    </button>
                    <button onClick={handleQuitar} className="vp-remove">
                      <FaTrash />
                    </button>
                  </div>
                ) : (
                  <button
                    className={`button w-full ${!disponible ? 'opacity-60 cursor-not-allowed' : ''}`}
                    onClick={handleAgregar}
                    disabled={!disponible}
                    title={!disponible ? 'No disponible' : 'Agregar al carrito'}
                  >
                    Agregar al carrito
                  </button>
                )}

                {/* “Comprar ahora” */}
                <div
                  onClick={() =>
                    setCheckoutPayload("single", itemsBuyNow, precioProducto)
                  }
                >
                  <BotonCardnet
                    className="w-full"
                    total={precioProducto * 100}
                    label="Comprar ahora"
                  />
                </div>
              </div>
            </div>
          </aside>
        </section>

        {/* Productos relacionados */}
        <div className="max-w-7xl w-full mt-10">
          <ProductosRelacionados
            productoActual={producto}
            onProductoClick={(pid) => navigate(`/producto/${pid}`)}
          />
        </div>

        {/* Videos + extras (SIEMPRE visibles) */}
        <section className="max-w-7xl w-full mt-12 px-1 sm:px-2">
          <h2 className="vp-section-title">Más Información del Producto</h2>

          {(varianteActiva?.videoUrls?.length || producto.videoUrls?.length) > 0 && (
            <div className="vp-video-carousel relative">
              <div className="vp-video-card">
                <video
                  src={(varianteActiva?.videoUrls || producto.videoUrls)[videoActualIndex]}
                  controls
                  className="vp-video"
                  preload="metadata"
                />
              </div>
              {((varianteActiva?.videoUrls || producto.videoUrls)?.length || 0) > 1 && (
                <>
                  <button
                    className="vp-arrow left"
                    aria-label="Video anterior"
                    onClick={() => setVideoActualIndex((prev) => {
                      const total = (varianteActiva?.videoUrls || producto.videoUrls).length;
                      return prev === 0 ? total - 1 : prev - 1;
                    })}
                  >
                    ‹
                  </button>
                  <button
                    className="vp-arrow right"
                    aria-label="Siguiente video"
                    onClick={() => setVideoActualIndex((prev) => {
                      const total = (varianteActiva?.videoUrls || producto.videoUrls).length;
                      return prev === total - 1 ? 0 : prev + 1;
                    })}
                  >
                    ›
                  </button>
                </>
              )}
              {((varianteActiva?.videoUrls || producto.videoUrls)?.length || 0) > 1 && (
                <div className="vp-video-dots">
                  {(varianteActiva?.videoUrls || producto.videoUrls).map((_, idx) => (
                    <button
                      key={idx}
                      className={`vp-dot ${idx === videoActualIndex ? 'active' : ''}`}
                      aria-label={`Ir al video ${idx + 1}`}
                      onClick={() => setVideoActualIndex(idx)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
          {producto.videoUrl && (
            <div className="vp-video-single">
              <video
                src={producto.videoUrl}
                controls
                className="vp-video"
                preload="metadata"
              />
            </div>
          )}

          {producto.imagenesExtra?.length > 0 && (
            <div className="vp-extras-grid">
              {producto.imagenesExtra.slice(0, 3).map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`Vista extra ${i + 1}`}
                  className="vp-extra-img"
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <ModalLoginAlert
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
      />

      {/* Modal de imagen fullscreen */}
      {imagenModalAbierta && (
        <div className="imagen-modal-overlay" onClick={cerrarImagenModal}>
          <div className="imagen-modal-container">
            {/* Botón cerrar */}
            <button
              className="imagen-modal-close"
              onClick={cerrarImagenModal}
              aria-label="Cerrar"
            >
              <FaTimes size={24} />
            </button>

            {/* Miniaturas arriba del modal */}
            {mediaGaleria.length > 1 && (
              <div className="imagen-modal-thumbnails">
                {mediaGaleria.map((m, index) => (
                  <button
                    key={index}
                    className={`thumbnail-btn ${
                      index === imagenActualIndex ? "active" : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setImagenActualIndex(index);
                    }}
                  >
                    {m.tipo === 'video' ? (
                      <div className="relative">
                        <video src={m.url} className="thumbnail-video" />
                        <span className="vp-badge-video">Video</span>
                      </div>
                    ) : (
                      <img src={m.url} alt={`${producto.nombre} ${index + 1}`} />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Imagen principal */}
            <div
              className="imagen-modal-main"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={onTouchStartModal}
              onTouchMove={onTouchMoveModal}
              onTouchEnd={onTouchEndModal}
            >
              {mediaGaleria[imagenActualIndex]?.tipo === 'video' ? (
                <video src={mediaGaleria[imagenActualIndex].url} controls className="imagen-modal-video" />
              ) : (
                <img
                  src={mediaGaleria[imagenActualIndex]?.url}
                  alt={producto.nombre}
                  className="imagen-modal-img"
                  draggable={false}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default VistaProducto;
