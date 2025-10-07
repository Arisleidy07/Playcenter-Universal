import React, { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowLeft, FaTimes, FaTrash } from "react-icons/fa";
import { useProduct } from "../hooks/useProducts";
import { useCarrito } from "../context/CarritoContext";
import { useAuth } from "../context/AuthContext";
import ModalLoginAlert from "../components/ModalLoginAlert";
import { useAuthModal } from "../context/AuthModalContext";
import ProductosRelacionados from "../components/ProductosRelacionados";
import BotonCardnet from "../components/BotonCardnet";
import "../styles/VistaProducto.css";
import AdvancedMediaGallery from "../components/AdvancedMediaGallery";

function formatPriceRD(value) {
  const pesos = Math.round(Number(value) || 0);
  return new Intl.NumberFormat("es-DO").format(pesos);
}

// Sanitizer mínimo para descripción HTML proveniente del editor
function sanitizeBasic(html) {
  if (!html) return "";
  try {
    let out = String(html);
    out = out
      .replace(/<\/(?:script|style)>/gi, "")
      .replace(/<(?:script|style)[^>]*>[\s\S]*?<\/(?:script|style)>/gi, "");
    out = out.replace(/ on[a-z]+\s*=\s*"[^"]*"/gi, "");
    out = out.replace(/ on[a-z]+\s*=\s*'[^']*'/gi, "");
    out = out.replace(/ on[a-z]+\s*=\s*[^\s>]+/gi, "");
    out = out.replace(/javascript:\s*/gi, "");
    return out;
  } catch {
    return String(html);
  }
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
  // TODOS LOS HOOKS AL PRINCIPIO - NUNCA CONDICIONALES
  const {
    carrito,
    agregarAlCarrito,
    quitarDelCarrito,
    eliminarUnidadDelCarrito,
  } = useCarrito();
  const { usuario } = useAuth();
  const { abrirModal } = useAuthModal();
  const { id } = useParams();
  const navigate = useNavigate();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [imagenActualIndex, setImagenActualIndex] = useState(0);
  const [imagenModalAbierta, setImagenModalAbierta] = useState(false);
  const [varianteSeleccionada, setVarianteSeleccionada] = useState(0);
  const [modalAlertaAbierto, setModalAlertaAbierto] = useState(false);
  const [videoActualIndex, setVideoActualIndex] = useState(0);

  // refs/estado para swipe en modal
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);

  // ---------- ZOOM (desktop) ----------
  const imgWrapRef = useRef(null);
  const mainImgRef = useRef(null);
  const zoomOverlayRef = useRef(null);
  const zoomRectRef = useRef(null);
  const rafPendingRef = useRef(false);
  const lastPosRef = useRef({ x: 50, y: 50 });
  const [isZooming, setIsZooming] = useState(false);
  const [zoomBg, setZoomBg] = useState("");
  const [zoomBgSize, setZoomBgSize] = useState({ w: 200, h: 200 }); // % tamaño fondo

  const { product: producto, loading, error } = useProduct(id);

  const onBack = () => {
    if (window.history && window.history.length > 1) navigate(-1);
    else navigate("/productos");
  };

  if (loading) {
    return null; // sin animación ni texto durante la carga
  }

  if (error || !producto) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-700 p-4">
        <div className="text-center max-w-md">
          <div className="mb-4">
            <svg
              className="mx-auto h-16 w-16 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <p className="text-lg sm:text-xl font-semibold mb-2 text-red-600">
            {error ? "Error al cargar el producto" : "Producto no encontrado"}
          </p>
          <p className="text-sm text-gray-600 mb-4">
            {error
              ? `Error: ${error}`
              : `No se pudo encontrar el producto con ID: ${id}`}
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={onBack}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Volver
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Recargar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Procesar variantes
  const allVariantes = Array.isArray(producto.variantes)
    ? producto.variantes
    : [];
  const variantesConColor = allVariantes.filter(
    (v) => v && typeof v.color === "string" && v.color.trim()
  );
  // Asegurar que el índice activo esté dentro de rango si cambia la lista de variantes con color
  useEffect(() => {
    if (
      variantesConColor.length > 0 &&
      (varianteSeleccionada < 0 || varianteSeleccionada >= variantesConColor.length)
    ) {
      setVarianteSeleccionada(0);
    }
  }, [variantesConColor.length]);

  const varianteActivaUI = variantesConColor[varianteSeleccionada] || null;
  // Selección robusta de variante para MEDIOS: usar la UI si existe; si no, tomar la primera que tenga medios; si no, null
  const variantHasMedia = (v) => {
    try {
      if (!v) return false;
      const hasMain =
        (Array.isArray(v.imagenPrincipal) && v.imagenPrincipal[0]?.url) || v.imagen;
      const hasGallery =
        (Array.isArray(v.galeriaImagenes) && v.galeriaImagenes.length > 0) ||
        (Array.isArray(v.imagenes) && v.imagenes.length > 0);
      const hasMediaArr = Array.isArray(v.media)
        ? v.media.some((m) => m && m.type === "image" && m.url)
        : false;
      return Boolean(hasMain || hasGallery || hasMediaArr);
    } catch {
      return false;
    }
  };
  const varianteActivaParaMedios = variantHasMedia(varianteActivaUI)
    ? varianteActivaUI
    : null; // si no hay medios en la variante activa, usar solo medios del producto
  const colorSeleccionado = varianteActivaUI?.color || "";

  const enCarrito = carrito.find(
    (item) =>
      item.id === producto.id && item.colorSeleccionado === colorSeleccionado
  );
  const cantidadEnCarrito = enCarrito?.cantidad || 0;

  const handleAgregar = () => {
    if (!usuario) {
      setModalAbierto(true);
      return;
    }
    if (!enCarrito) {
      const prodForCart = {
        ...producto,
        cantidad: 1,
        // precio efectivo por variante si existe
        precio:
          varianteActivaUI && Number(varianteActivaUI.precio)
            ? Number(varianteActivaUI.precio)
            : Number(producto.precio) || 0,
        // stock actual evaluado para esta selección
        cantidadProducto: Number.isFinite(stockDisponible)
          ? stockDisponible
          : undefined,
      };
      agregarAlCarrito(prodForCart, colorSeleccionado);
    }
  };
  const handleIncremento = () => {
    if (!usuario) {
      setModalAbierto(true);
      return;
    }
    const prodForCart = {
      ...producto,
      precio:
        varianteActivaUI && Number(varianteActivaUI.precio)
          ? Number(varianteActivaUI.precio)
          : Number(producto.precio) || 0,
      cantidadProducto: Number.isFinite(stockDisponible)
        ? stockDisponible
        : undefined,
    };
    agregarAlCarrito(prodForCart, colorSeleccionado);
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

  const stockDisponible =
    varianteActivaUI?.cantidad !== undefined
      ? Number(varianteActivaUI.cantidad) || 0
      : producto.cantidad !== undefined
      ? Number(producto.cantidad) || 0
      : Infinity;
  const activo = producto?.activo !== false;
  const disponible = activo && stockDisponible > 0;
  const restante = Number.isFinite(stockDisponible)
    ? Math.max(0, stockDisponible - (enCarrito?.cantidad || 0))
    : Infinity;

  const precioVar =
    varianteActivaUI && varianteActivaUI.precio !== undefined
      ? Number(varianteActivaUI.precio)
      : NaN;
  const precioProducto =
    Number.isFinite(precioVar) && precioVar > 0
      ? precioVar
      : Number(producto.precio) || 0;
  const itemsBuyNow = [
    {
      id: producto.id,
      nombre: producto.nombre,
      precio: precioProducto,
      cantidad: 1,
    },
  ];

  // Manejar cambio de variante
  const handleVarianteChange = (index) => {
    setVarianteSeleccionada(index);
    setImagenActualIndex(0);
  };

  const abrirImagenModal = (index) => {
    setImagenActualIndex(index);
    setImagenModalAbierta(true);
  };

  const cerrarImagenModal = () => {
    setImagenModalAbierta(false);
  };

  // Construcción estricta de IMÁGENES (sin mezclar videos ni extras), soportando legacy y nuevo esquema
  const buildImageList = (prod, variante) => {
    const norm = (u) => (u ? String(u).split("?")[0].split("#")[0].trim() : "");
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
    const onlyImages = (arr) =>
      (Array.isArray(arr) ? arr : [])
        .map(pickUrl)
        .filter(Boolean)
        .filter(
          (url) => !/\.(mp4|mov|avi|mkv|webm|m4v)$/i.test(url.split("?")[0])
        )
        .map((u) => u);

    const images = [];

    // 1) Imagen principal: preferir variante, luego producto (soporta imagenPrincipal[0].url e imagen)
    const mainVarUrl =
      pickUrl(variante?.imagenPrincipal?.[0]) || pickUrl(variante?.imagen);
    const mainProdUrl = !mainVarUrl
      ? pickUrl(prod?.imagenPrincipal?.[0]) || pickUrl(prod?.imagen)
      : "";

    // 2) Galería: preferir galería de variante; si no, la del producto.
    // Soporta galeriaImagenes (array de strings u objetos {url}), media[] type==='image', e imagenes[] legacy
    const variantGallery = onlyImages(
      Array.isArray(variante?.galeriaImagenes) &&
        variante.galeriaImagenes.length
        ? variante.galeriaImagenes
        : Array.isArray(variante?.media) && variante.media.length
        ? variante.media.filter((m) => m?.type === "image")
        : variante?.imagenes
    );

    const productGallery = variantGallery.length
      ? []
      : onlyImages(
          Array.isArray(prod?.galeriaImagenes) && prod.galeriaImagenes.length
            ? prod.galeriaImagenes
            : Array.isArray(prod?.media) && prod.media.length
            ? prod.media.filter((m) => m?.type === "image")
            : prod?.imagenes
        );

    // Ensamblar en orden y deduplicar
    const ordered = [
      mainVarUrl,
      mainProdUrl,
      ...variantGallery,
      ...productGallery,
    ].filter(Boolean);
    const seen = new Set();
    for (const u of ordered) {
      const key = norm(u).toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      // Excluir videos por seguridad adicional
      if (/\.(mp4|mov|avi|mkv|webm|m4v)$/i.test(key)) continue;
      images.push(u);
    }
    return images;
  };

  // Lista de imágenes para la galería principal
  const imagenes = buildImageList(producto, varianteActivaParaMedios);
  // Estados derivados para layout compacto cuando no hay medios ni variantes
  const hasImageGallery = imagenes.length > 0;
  const hasVariantsUI = Boolean(
    variantesConColor && variantesConColor.length > 1
  );
  const showLeftColumn = hasImageGallery || hasVariantsUI;
  const isSingleImage = imagenes.length === 1;
  const compactMedia = isSingleImage && !hasVariantsUI;
  // Unificar galería: imágenes + videos (producto y variante) en una sola galería estilo Amazon
  const toMediaObj = (u, t = null) => {
    const url = u || "";
    const isVid = /(\.mp4|\.mov|\.avi|\.mkv|\.webm|\.m4v)$/i.test(
      url.split("?")[0]
    );
    return { type: t || (isVid ? "video" : "image"), url };
  };
  const variantVideos = [
    ...(Array.isArray(varianteActivaParaMedios?.videoUrls)
      ? varianteActivaParaMedios.videoUrls
      : []),
    ...(varianteActivaParaMedios?.media || [])
      .filter((m) => m && m.type === "video" && m.url)
      .map((m) => m.url),
  ];
  const productVideos = [
    ...(Array.isArray(producto?.videoUrls) ? producto.videoUrls : []),
    ...(producto?.media || [])
      .filter((m) => m && m.type === "video" && m.url)
      .map((m) => m.url),
  ];
  const combinedMedia = [
    ...imagenes.map((u) => toMediaObj(u, "image")),
    ...variantVideos.map((u) => toMediaObj(u, "video")),
    ...productVideos.map((u) => toMediaObj(u, "video")),
  ].filter((m) => m && m.url);
  // Dedupe por URL normalizada, mantener orden (imagen principal primero)
  const seenGallery = new Set();
  const mediaItems = combinedMedia.filter((m) => {
    const key = (m.url || "").split("?")[0].split("#")[0].trim().toLowerCase();
    if (!key || seenGallery.has(key)) return false;
    seenGallery.add(key);
    return true;
  });
  // Índice seguro para compatibilidad con estados previos (ya no usado para render)
  const mainIndex = Math.min(
    Math.max(imagenActualIndex, 0),
    Math.max(0, (imagenes.length || 1) - 1)
  );
  // Video principal único (archivo subido). Preferir el primer video subido.
  const mainVideoSrc =
    producto.videoUrl ||
    (Array.isArray(producto.videoAcercaArticulo) &&
      producto.videoAcercaArticulo[0]?.url) ||
    producto.video /* legacy */ ||
    null;
  const hasSingleVideo = Boolean(mainVideoSrc);
  // Videos "Acerca de este artículo" (preferir arreglo dedicado)
  const acercaList = Array.isArray(producto?.videoAcercaArticulo)
    ? producto.videoAcercaArticulo.filter(Boolean)
    : mainVideoSrc
    ? [mainVideoSrc]
    : [];
  const acercaItems = acercaList
    .map((u) => ({ type: "video", url: u }))
    .filter((m) => m && m.url);
  const hasAcerca = acercaItems.length > 0;
  // Filtrar imágenes extra que dupliquen la galería principal
  const normalize = (u) =>
    u ? String(u).split("?")[0].split("#")[0].trim().toLowerCase() : "";
  const imagenesSet = new Set(imagenes.map(normalize));
  // Solo usar los "Tres Archivos Extras" definidos explícitamente en el producto
  const rawExtra = Array.isArray(producto.imagenesExtra)
    ? producto.imagenesExtra
    : [];
  const combinedExtras = rawExtra
    .map((u) => (typeof u === "string" ? u : u && u.url ? u.url : ""))
    .filter(Boolean);
  // Dedupe y excluir los ya presentes en la galería principal (para que sean realmente "extras")
  const mainVideoKey = mainVideoSrc ? normalize(mainVideoSrc) : null;
  const seenExtra = new Set();
  const extraFiles = combinedExtras.filter(Boolean).filter((u) => {
    const key = normalize(u);
    if (imagenesSet.has(key)) return false; // no duplicar galería
    if (mainVideoKey && key === mainVideoKey) return false; // no duplicar video principal
    if (seenExtra.has(key)) return false; // no duplicar dentro de extras
    seenExtra.add(key);
    return true;
  });

  // Separar archivos extras por tipo
  const extraImages = extraFiles.filter((url) => {
    const ext = url.split(".").pop()?.toLowerCase() || "";
    return ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(ext);
  });
  const extraVideos = extraFiles.filter((url) => {
    const ext = url.split(".").pop()?.toLowerCase() || "";
    return ["mp4", "mov", "avi", "mkv", "webm", "m4v"].includes(ext);
  });
  const extraDocuments = extraFiles.filter((url) => {
    const ext = url.split(".").pop()?.toLowerCase() || "";
    return ![
      "jpg",
      "jpeg",
      "png",
      "gif",
      "webp",
      "bmp",
      "svg",
      "mp4",
      "mov",
      "avi",
      "mkv",
      "webm",
      "m4v",
    ].includes(ext);
  });

  const hasExtraFiles = extraFiles.length > 0;
  // Fila bajo el video: solo archivos reales, sin placeholders ni cajas vacías
  const rowFiles = extraFiles.slice(0, 3);
  const hasRowFiles = rowFiles.length > 0;
  // Modal: solo principal + galería (sin extras)
  // Modal: incluir también hasta 3 imágenes extras para que aparezcan como miniaturas abajo
  const imagenesModal = [...imagenes, ...extraImages.slice(0, 3)];

  // (debug removido para respetar el orden de hooks y evitar renderizaciones diferentes)

  const siguienteImagen = () => {
    setImagenActualIndex((prev) =>
      prev === imagenesModal.length - 1 ? 0 : prev + 1
    );
  };

  const anteriorImagen = () => {
    setImagenActualIndex((prev) =>
      prev === 0 ? imagenesModal.length - 1 : prev - 1
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
    if (window.innerWidth < 1280) return; // solo desktop (xl)
    if (!imagenes || !imagenes.length) return;
    const url = imagenes[mainIndex];
    setZoomBg(url);
    // calcular tamaño de fondo en px para NO deformar y mantener nitidez
    const imgEl = mainImgRef.current;
    if (imgEl && imgEl.naturalWidth && imgEl.naturalHeight) {
      const imgRect = imgEl.getBoundingClientRect();
      const dispW = imgRect.width || imgEl.clientWidth || 0;
      const dispH = imgRect.height || imgEl.clientHeight || 0;
      const naturalW = imgEl.naturalWidth;
      const naturalH = imgEl.naturalHeight;
      const scaleX = naturalW / Math.max(1, dispW);
      const scaleY = naturalH / Math.max(1, dispH);
      // zoom máximo 4x del tamaño mostrado, sin superar lo natural y SIN deformar (preservar aspecto)
      const baseScale = Math.min(scaleX, scaleY);
      const finalScale = Math.min(4, Math.max(1, baseScale));
      const factor = baseScale > 0 ? finalScale / baseScale : 1;
      setZoomBgSize({
        w: Math.round(naturalW * factor),
        h: Math.round(naturalH * factor),
      });
      // usar el rect REAL de la imagen para mapear el cursor
      zoomRectRef.current = imgRect;
    } else {
      setZoomBgSize({ w: 600, h: 600 });
      zoomRectRef.current = imgWrapRef.current
        ? imgWrapRef.current.getBoundingClientRect()
        : null;
    }
    lastPosRef.current = { x: 50, y: 50 };
    setIsZooming(true);
    // posición inicial centrada
    requestAnimationFrame(() => {
      const el = zoomOverlayRef.current;
      if (el) el.style.backgroundPosition = `50% 50%`;
    });
  };

  const handleMouseMove = (e) => {
    if (!isZooming || window.innerWidth < 1280) return;
    const rect =
      zoomRectRef.current ||
      (mainImgRef.current && mainImgRef.current.getBoundingClientRect()) ||
      (imgWrapRef.current && imgWrapRef.current.getBoundingClientRect());
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    lastPosRef.current = {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    };
    if (!rafPendingRef.current) {
      rafPendingRef.current = true;
      requestAnimationFrame(() => {
        rafPendingRef.current = false;
        const el = zoomOverlayRef.current;
        if (el) {
          el.style.backgroundPosition = `${lastPosRef.current.x}% ${lastPosRef.current.y}%`;
        }
      });
    }
  };

  const handleMouseLeave = () => {
    setIsZooming(false);
    zoomRectRef.current = null;
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
      <main className="min-h-screen bg-white px-3 sm:px-4 pb-16 pt-[30px] xl:pt-24 text-gray-800 flex flex-col items-center overflow-visible">
        <section className="max-w-7xl w-full flex flex-col xl:flex-row gap-8 xl:gap-12 overflow-visible">
          {/* Columna Izquierda */}
          {showLeftColumn && (
            <motion.div className="relative flex flex-col items-center w-full xl:flex-1 overflow-visible">
              {/* Botón de regreso para desktop y móvil */}
              <button
                className="vp-back-fab"
                onClick={onBack}
                aria-label="Volver"
              >
                <FaArrowLeft size={18} />
              </button>

              {/* Imagen principal grande con zoom hover y miniaturas */}
              {hasImageGallery && (
                <div
                  className={`w-full vp-zoom-stage relative ${
                    compactMedia ? "compact" : ""
                  }`}
                >
                  <div
                    ref={imgWrapRef}
                    className={`vp-main-stage vp-image-zoom-wrap ${
                      isZooming ? "zooming" : ""
                    } ${compactMedia ? "compact" : ""}`}
                    onMouseEnter={handleMouseEnter}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => abrirImagenModal(mainIndex)}
                    role="button"
                    aria-label="Ver imagen en pantalla completa"
                    tabIndex={0}
                  >
                    <img
                      ref={mainImgRef}
                      src={imagenes[mainIndex]}
                      alt={producto.nombre}
                      className="vp-main-image"
                      draggable={false}
                    />

                    {/* Panel de zoom flotante a la derecha */}
                    <div
                      ref={zoomOverlayRef}
                      className="vp-zoom-float vp-zoom-stage"
                      style={{
                        display: isZooming ? "block" : "none",
                        backgroundImage: zoomBg ? `url(${zoomBg})` : "none",
                        backgroundRepeat: "no-repeat",
                        backgroundSize: `${zoomBgSize.w}px ${zoomBgSize.h}px`,
                        backgroundPosition: `${lastPosRef.current.x}% ${lastPosRef.current.y}%`,
                      }}
                    />
                  </div>

                  {/* Miniaturas */}
                  {imagenes.length > 1 && (
                    <div className="vp-gallery-thumbs">
                      {imagenes.map((u, i) => (
                        <button
                          key={i}
                          className={`vp-thumb-btn ${
                            i === mainIndex ? "active" : ""
                          }`}
                          onClick={() => setImagenActualIndex(i)}
                          aria-label={`Imagen ${i + 1}`}
                          type="button"
                        >
                          <img src={u} alt={`Miniatura ${i + 1}`} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Selector de Variantes Visual Mejorado */}
              {variantesConColor && variantesConColor.length > 1 && (
                <div className="vp-variants mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Variantes disponibles:
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {variantesConColor.map((variante, index) => {
                      // Determinar la imagen principal de la variante para mostrarla como vista previa
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
                      const varianteMedia =
                        Array.isArray(variante?.media) &&
                        variante.media.length > 0
                          ? variante.media
                          : [];
                      const varianteImagen =
                        // new schema media image
                        varianteMedia.find((m) => m?.type === "image" && m?.url)
                          ?.url ||
                        // variante principal (nuevo/legacy)
                        pickUrl(variante?.imagenPrincipal?.[0]) ||
                        variante?.imagen ||
                        (Array.isArray(variante?.imagenes) &&
                          variante.imagenes[0]) ||
                        // fallback a imagen del producto (nuevo schema)
                        (Array.isArray(producto?.media) &&
                          producto.media.find((m) => m?.type === "image")
                            ?.url) ||
                        // producto principal (nuevo/legacy)
                        pickUrl(producto?.imagenPrincipal?.[0]) ||
                        producto?.imagen ||
                        (Array.isArray(producto?.imagenes) &&
                          producto.imagenes[0]) ||
                        null;

                      // Verificar si la variante tiene stock disponible
                      const tieneStock = variante.cantidad > 0;
                      const activa = varianteSeleccionada === index;

                      return (
                        <button
                          key={`${variante.color}-${index}`}
                          className={`relative flex items-center gap-3 p-2 rounded-lg border-2 transition-all ${
                            activa
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          } ${!tieneStock ? "opacity-70" : ""}`}
                          onClick={() => setVarianteSeleccionada(index)}
                          aria-label={`Seleccionar variante ${variante.color}${
                            !tieneStock ? " (Agotado)" : ""
                          }`}
                          disabled={!tieneStock && !activa}
                        >
                          {/* Vista previa de la variante */}
                          <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                            {varianteImagen ? (
                              <img
                                src={varianteImagen}
                                alt={`${variante.color}`}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src =
                                    "https://via.placeholder.com/50?text=No+imagen";
                                }}
                              />
                            ) : (
                              <div
                                className="w-full h-full"
                                style={{
                                  backgroundColor: variante.colorHex || "#ccc",
                                }}
                              />
                            )}

                            {/* Overlay para variantes agotadas */}
                            {!tieneStock && (
                              <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                                <span className="text-xs font-medium text-red-600">
                                  Agotado
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Info de variante */}
                          <div className="text-left">
                            <span className="block font-medium text-gray-900">
                              {variante.color}
                            </span>
                            {variante.cantidad !== undefined && (
                              <span
                                className={`text-xs ${
                                  variante.cantidad > 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {variante.cantidad > 0
                                  ? `${variante.cantidad} disponible${
                                      variante.cantidad !== 1 ? "s" : ""
                                    }`
                                  : "Agotado"}
                              </span>
                            )}
                          </div>

                          {/* Indicador activo */}
                          {activa && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-sm">
                              <svg
                                className="w-3 h-3 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Columna Centro */}
          <motion.div className="flex flex-col gap-4 sm:gap-5 w-full xl:flex-1 overflow-visible">
            <h1 className="vp-title">{producto.nombre}</h1>
            <div
              className="vp-desc prose max-w-none"
              dangerouslySetInnerHTML={{
                __html: sanitizeBasic(
                  producto.descripcion ||
                    "<p>Contáctanos para más detalles.</p>"
                ),
              }}
            />
            <p className="vp-price">DOP {formatPriceRD(precioProducto)}</p>

            {/* DISPONIBILIDAD + BOTONES SOLO EN MÓVIL/TABLET */}
            <div className="xl:hidden flex flex-col gap-3 overflow-visible">
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
                      title={
                        cantidadEnCarrito >= stockDisponible
                          ? "Has alcanzado el máximo disponible"
                          : "Agregar una unidad"
                      }
                    >
                      +
                    </button>
                    <button onClick={handleQuitar} className="vp-remove">
                      <FaTrash />
                    </button>
                  </div>
                ) : (
                  <button
                    className={`button w-full sm:w-1/2 ${
                      !disponible ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                    onClick={handleAgregar}
                    disabled={!disponible}
                    title={!disponible ? "No disponible" : "Agregar al carrito"}
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
          <aside className="vp-buy-card w-full xl:w-[360px] hidden xl:block">
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
                      title={
                        cantidadEnCarrito >= stockDisponible
                          ? "Has alcanzado el máximo disponible"
                          : "Agregar una unidad"
                      }
                    >
                      +
                    </button>
                    <button onClick={handleQuitar} className="vp-remove">
                      <FaTrash />
                    </button>
                  </div>
                ) : (
                  <button
                    className={`button w-full ${
                      !disponible ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                    onClick={handleAgregar}
                    disabled={!disponible}
                    title={!disponible ? "No disponible" : "Agregar al carrito"}
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

        {/* Secciones inferiores centradas a pantalla completa */}
        <section className="w-full max-w-7xl mx-auto mt-8 flex flex-col items-center">
          {/* Productos relacionados */}
          <div className="w-full">
            <ProductosRelacionados
              productoActual={producto}
              onProductoClick={(pid) => navigate(`/producto/${pid}`)}
            />
          </div>

          {/* Acerca de este artículo */}
          {hasAcerca && (
            <div className="vp-featured-section w-full mt-8">
              <h4 className="vp-featured-title text-center">
                Acerca de este artículo
              </h4>
              <div className="vp-featured-container">
                <AdvancedMediaGallery
                  mediaItems={acercaItems}
                  productName={producto.nombre}
                  className=""
                  showThumbnails={acercaItems.length > 1}
                  showControls={true}
                  autoPlay={false}
                  enableZoom={false}
                  enableFullscreen={true}
                />
              </div>
            </div>
          )}

          {/* Tres archivos extras */}
          {hasRowFiles && (
            <div className="vp-secondary-row mt-6 w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 justify-items-center">
                {rowFiles.map((file, i) => {
                  const fileName =
                    file.split("/").pop()?.split("?")[0] || `archivo-${i + 1}`;
                  const fileExtension =
                    fileName.split(".").pop()?.toLowerCase() || "";
                  const isImage = [
                    "jpg",
                    "jpeg",
                    "png",
                    "gif",
                    "webp",
                    "bmp",
                    "svg",
                  ].includes(fileExtension);
                  const isVideo = [
                    "mp4",
                    "mov",
                    "avi",
                    "mkv",
                    "webm",
                    "m4v",
                  ].includes(fileExtension);

                  if (isImage) {
                    const norm = normalize(file);
                    // índice dentro de las extras de imagen para abrir correctamente en el modal
                    const idxExtra = extraImages.findIndex(
                      (u) => normalize(u) === norm
                    );
                    return (
                      <button
                        key={i}
                        type="button"
                        className="vp-secondary-item"
                        aria-label={`Vista adicional ${i + 1}`}
                        onClick={() => {
                          const base = imagenes.length;
                          const idxModal =
                            idxExtra >= 0 ? base + Math.min(idxExtra, 2) : base;
                          abrirImagenModal(
                            Math.min(idxModal, imagenesModal.length - 1)
                          );
                        }}
                      >
                        <img
                          src={file}
                          alt={`Vista extra ${i + 1}`}
                          className="w-full h-full object-contain rounded"
                        />
                      </button>
                    );
                  } else if (isVideo) {
                    return (
                      <div key={i} className="vp-secondary-item">
                        <video
                          src={file}
                          controls
                          className="w-full h-full object-contain rounded"
                          preload="metadata"
                        />
                        <p className="text-xs text-gray-600 mt-1 truncate">
                          {fileName}
                        </p>
                      </div>
                    );
                  } else {
                    return (
                      <a
                        key={i}
                        href={file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="vp-secondary-item flex flex-col items-center justify-center p-4 bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        <div className="text-4xl mb-2">📄</div>
                        <p className="text-xs text-gray-700 text-center truncate w-full">
                          {fileName}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">Descargar</p>
                      </a>
                    );
                  }
                })}
              </div>
            </div>
          )}
        </section>
      </main>

      <ModalLoginAlert
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onIniciarSesion={() => {
          try {
            abrirModal();
          } catch {
            /* noop */
          }
        }}
      />

      {/* Modal de imagen fullscreen */}
      {imagenModalAbierta && (
        <div className="imagen-modal-overlay" onClick={cerrarImagenModal}>
          <div
            className="imagen-modal-container"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={onTouchStartModal}
            onTouchMove={onTouchMoveModal}
            onTouchEnd={onTouchEndModal}
          >
            {/* Botón cerrar (X) arriba derecha */}
            <button
              className="imagen-modal-close"
              onClick={cerrarImagenModal}
              aria-label="Cerrar"
            >
              <FaTimes size={22} />
            </button>

            {/* Imagen principal dentro del modal */}
            <div className="imagen-modal-main">
              <img
                src={imagenesModal[imagenActualIndex]}
                alt={`${producto?.nombre}`}
                className="imagen-modal-img"
                draggable={false}
              />
            </div>

            {/* Miniaturas centradas abajo */}
            {imagenesModal.length > 1 && (
              <div className="imagen-modal-thumbnails">
                {imagenesModal.map((img, index) => (
                  <button
                    key={index}
                    className={`thumbnail-btn ${
                      index === imagenActualIndex ? "active" : ""
                    }`}
                    onClick={() => setImagenActualIndex(index)}
                    aria-label={`Miniatura ${index + 1}`}
                  >
                    <img src={img} alt={`Miniatura ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}

            {/* Navegación con flechas dentro del modal */}
            {imagenesModal.length > 1 && (
              <>
                <button
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    anteriorImagen();
                  }}
                  aria-label="Imagen anterior"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    siguienteImagen();
                  }}
                  aria-label="Siguiente imagen"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default VistaProducto;
