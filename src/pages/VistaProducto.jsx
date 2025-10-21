import React, { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowLeft, FaTimes, FaTrash, FaShareSquare } from "react-icons/fa";
import { useProduct } from "../hooks/useProducts";
import { useCarrito } from "../context/CarritoContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import ModalLoginAlert from "../components/ModalLoginAlert";
import { useAuthModal } from "../context/AuthModalContext";
import BotonCardnet from "../components/BotonCardnet";

// Components necesarios
import VisualVariantSelector from "../components/VisualVariantSelector";
import EnhancedRelatedProducts from "../components/EnhancedRelatedProducts";
import ProductGallery from "../components/ProductGallery";

// Styles
import "../styles/VistaProducto.css";
import "../styles/VistaProducto-dark.css";
import "../styles/ProductGallery.css";

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
  const { theme, isDark } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [imagenActualIndex, setImagenActualIndex] = useState(0);
  // Índice para la galería de desktop (incluye imágenes y videos al estilo eBay)
  const [desktopMediaIndex, setDesktopMediaIndex] = useState(0);
  const [imagenModalAbierta, setImagenModalAbierta] = useState(false);
  const [varianteSeleccionada, setVarianteSeleccionada] = useState(0);

  // Enhanced state for new components
  const [isFavorite, setIsFavorite] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState(true);
  const [cartQuantity, setCartQuantity] = useState(0);
  const [modalAlertaAbierto, setModalAlertaAbierto] = useState(false);
  // compartir y overlay avanzado
  const [shareOpen, setShareOpen] = useState(false);
  const [mediaOverlayOpen, setMediaOverlayOpen] = useState(false);
  const [mediaOverlayTab, setMediaOverlayTab] = useState("images"); // 'images' | 'videos'
  const [mediaOverlayIndex, setMediaOverlayIndex] = useState(0);
  // Estados para pinch-to-zoom en vista completa
  const [fullscreenZoom, setFullscreenZoom] = useState(1);
  const [fullscreenPan, setFullscreenPan] = useState({ x: 0, y: 0 });
  const [initialDistance, setInitialDistance] = useState(0);
  const [initialZoom, setInitialZoom] = useState(1);

  // Estados para zoom en modal de imagen
  const [modalZoom, setModalZoom] = useState(1);
  const [modalPan, setModalPan] = useState({ x: 0, y: 0 });

  // Estados para modal de "Más información del producto" - Imágenes grandes
  const [productInfoModalOpen, setProductInfoModalOpen] = useState(false);
  const [productInfoImageIndex, setProductInfoImageIndex] = useState(0);
  const [productInfoZoom, setProductInfoZoom] = useState(1);
  const [productInfoPan, setProductInfoPan] = useState({ x: 0, y: 0 });

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

  // ALL useEffect hooks MUST be called consistently - BEFORE any early returns
  // Asegurar que el índice activo esté dentro de rango si cambia la lista de variantes con color
  useEffect(() => {
    if (producto) {
      const allVariantes = Array.isArray(producto?.variantes)
        ? producto.variantes
        : [];
      const variantesConColor = allVariantes.filter(
        (v) => v && typeof v.color === "string" && v.color.trim()
      );
      if (
        variantesConColor.length > 0 &&
        (varianteSeleccionada < 0 ||
          varianteSeleccionada >= variantesConColor.length)
      ) {
        setVarianteSeleccionada(0);
      }
    }
  }, [producto, varianteSeleccionada]);

  // Reset zoom when changing images
  useEffect(() => {
    setFullscreenZoom(1);
    setFullscreenPan({ x: 0, y: 0 });
  }, [mediaOverlayIndex, mediaOverlayTab]);

  // Reset zoom cuando cambia imagen de "Más información del producto"
  useEffect(() => {
    setProductInfoZoom(1);
    setProductInfoPan({ x: 0, y: 0 });
  }, [productInfoImageIndex]);

  // Auto-scroll thumbnails móvil/tablet (debajo de la imagen) cuando cambia el medio activo
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1280) {
      const cont = document.querySelector(".mobile-tablet-thumbs");
      const active = cont && cont.querySelector(".mt-thumb.active");
      if (cont && active && typeof active.scrollIntoView === "function") {
        active.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      }
    }
  }, [desktopMediaIndex]);

  // Handle scroll for mobile actions visibility
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowMobileActions(false);
      } else {
        setShowMobileActions(true);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Update cart quantity when carrito changes
  useEffect(() => {
    if (producto) {
      const allVariantes = Array.isArray(producto?.variantes)
        ? producto.variantes
        : [];
      const variantesConColor = allVariantes.filter(
        (v) => v && typeof v.color === "string" && v.color.trim()
      );
      const varianteActivaUI = variantesConColor[varianteSeleccionada] || null;

      const currentInCart = carrito.find(
        (item) =>
          item.id === producto.id &&
          (!varianteActivaUI ||
            item.variante?.color === varianteActivaUI?.color)
      );
      setCartQuantity(currentInCart?.cantidad || 0);
    }
  }, [carrito, producto, varianteSeleccionada]);

  // Early returns MUST happen AFTER all hooks to maintain consistent hook order
  if (loading) {
    return null; // sin animación ni texto durante la carga
  }

  if (error || !producto) {
    const onBack = () => {
      if (window.history && window.history.length > 1) navigate(-1);
      else navigate("/productos");
    };

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

  // Procesar variantes DESPUÉS de todos los hooks para mantener orden consistente
  const allVariantes = Array.isArray(producto?.variantes)
    ? producto.variantes
    : [];
  const variantesConColor = allVariantes.filter(
    (v) => v && typeof v.color === "string" && v.color.trim()
  );

  // Enhanced variant processing
  const varianteActivaUI = variantesConColor[varianteSeleccionada] || null;
  const varianteActiva = varianteActivaUI; // For compatibility with existing code

  // Enhanced media processing - NOW varianteActiva is defined
  const getMainImage = () => {
    if (varianteActiva?.imagenPrincipal?.[0]?.url)
      return varianteActiva.imagenPrincipal[0].url;
    if (producto.imagenPrincipal?.[0]?.url)
      return producto.imagenPrincipal[0].url;
    // Legacy fallback
    if (varianteActiva?.imagen) return varianteActiva.imagen;
    if (producto.imagen) return producto.imagen;
    return null;
  };

  const getGalleryMedia = () => {
    const sourceData =
      varianteActiva?.galeriaImagenes?.length > 0
        ? varianteActiva.galeriaImagenes
        : producto.galeriaImagenes || producto.imagenes || [];
    return sourceData
      .filter((item) => item?.url || typeof item === "string")
      .map((item) => (typeof item === "string" ? item : item.url));
  };

  const getMainVideo = () => {
    if (producto.videoAcercaArticulo?.[0]?.url)
      return producto.videoAcercaArticulo[0].url;
    if (producto.videoUrl) return producto.videoUrl; // Legacy
    return null;
  };

  const getExtraFiles = () => {
    const extraMedia =
      producto.tresArchivosExtras || producto.imagenesExtra || [];
    return extraMedia
      .filter((item) => item?.url || typeof item === "string")
      .slice(0, 3)
      .map((item) => (typeof item === "string" ? item : item.url));
  };

  const getGalleryVideos = () => {
    const sourceData =
      varianteActiva?.videoUrls?.length > 0
        ? varianteActiva.videoUrls
        : producto.videoUrls || [];
    return sourceData
      .filter((item) => item?.url || typeof item === "string")
      .map((item) => (typeof item === "string" ? item : item.url));
  };

  // All useEffect hooks have been moved above to maintain consistent hook order

  const onBack = () => {
    if (window.history && window.history.length > 1) navigate(-1);
    else navigate("/productos");
  };

  // Enhanced handlers for new components
  const handleAddToCart = (product, variant = null, quantity = 1) => {
    if (!usuario) {
      abrirModal();
      return;
    }

    const variantToUse = variant || varianteActivaUI;
    agregarAlCarrito(product, variantToUse, quantity);

    // Update cart quantity for mobile actions
    const currentInCart = carrito.find(
      (item) =>
        item.id === product.id &&
        (!variantToUse || item.variante?.color === variantToUse?.color)
    );
    setCartQuantity((currentInCart?.cantidad || 0) + quantity);
  };

  const handleToggleFavorite = (product) => {
    setIsFavorite(!isFavorite);
    // Here you would typically save to localStorage or backend
    console.log("Toggled favorite for:", product.nombre);
  };

  // handleShare already exists below, using that one

  const handleVariantChange = (variantIndex) => {
    setVarianteSeleccionada(variantIndex);
    // Reset media indexes when variant changes
    setImagenActualIndex(0);
    setDesktopMediaIndex(0);
  };

  // Enhanced variant processing - Already declared above
  // Variables varianteActivaUI and varianteActiva already declared above

  // useEffect hooks have been moved above to maintain consistent hook order
  // Selección robusta de variante para MEDIOS: usar la UI si existe; si no, tomar la primera que tenga medios; si no, null
  const variantHasMedia = (v) => {
    try {
      if (!v) return false;
      const hasMain =
        (Array.isArray(v.imagenPrincipal) && v.imagenPrincipal[0]?.url) ||
        v.imagen;
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

  // Normalizar color: tratar "" y null como lo mismo para evitar duplicados
  const normalizeColor = (c) => {
    try {
      const s = (c ?? "").toString().trim();
      return s ? s : null;
    } catch {
      return null;
    }
  };
  const colorKey = normalizeColor(varianteActivaUI?.color);

  const enCarrito = carrito.find(
    (item) =>
      item.id === producto.id &&
      normalizeColor(item.colorSeleccionado) === colorKey
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
      agregarAlCarrito(prodForCart, colorKey);
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
    agregarAlCarrito(prodForCart, colorKey);
  };
  const handleDecremento = () => {
    if (!usuario) {
      setModalAbierto(true);
      return;
    }
    eliminarUnidadDelCarrito(producto.id, colorKey);
  };
  const handleQuitar = () => {
    if (!usuario) {
      setModalAbierto(true);
      return;
    }
    quitarDelCarrito(producto.id, colorKey);
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

  // Removed duplicate function - using the one declared above

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
        if (typeof u === "string") {
          const s = String(u).trim();
          // mantener absolutas y blobs, y rutas ya absolutas
          if (/^(https?:|blob:|data:|\/)/i.test(s)) return s;
          // normalizar rutas locales guardadas sin '/'
          return `/${s}`;
        }
        if (typeof u === "object" && u !== null) {
          const s = String(u.url || "").trim();
          if (!s) return "";
          if (/^(https?:|blob:|data:|\/)/i.test(s)) return s;
          return `/${s}`;
        }
        const s = String(u || "").trim();
        if (/^(https?:|blob:|data:|\/)/i.test(s)) return s;
        return `/${s}`;
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
  const showLeftColumn = hasImageGallery;
  const isSingleImage = imagenes.length === 1;
  const compactMedia = isSingleImage && !hasVariantsUI;

  // Galería unificada: SOLO IMÁGENES (sin videos)
  const toMediaObj = (u) => {
    return { type: "image", url: u || "" };
  };

  const mediaItems = imagenes.filter(Boolean).map((u) => toMediaObj(u));

  // Dedupe por URL normalizada
  const seenGallery = new Set();
  const imageItemsMedia = mediaItems.filter((m) => {
    const key = (m.url || "").split("?")[0].split("#")[0].trim().toLowerCase();
    if (!key || seenGallery.has(key)) return false;
    seenGallery.add(key);
    return true;
  });
  // Índice seguro para compatibilidad con estados previos
  const mainIndex = Math.min(
    Math.max(imagenActualIndex, 0),
    Math.max(0, (imagenes.length || 1) - 1)
  );
  // NO mostrar archivos extras ni videos - SOLO IMÁGENES
  const imagenesModal = [...imagenes];
  const hasRowFiles = false;
  const rowFiles = [];

  // Lista para desktop: SOLO imágenes
  const desktopMediaItems = [...imageItemsMedia];
  // Índice seguro derivado (sin hooks) para evitar cambios en orden de hooks
  const safeDesktopIndex = Math.max(
    0,
    Math.min(desktopMediaIndex, Math.max(0, desktopMediaItems.length - 1))
  );

  // Preparar datos para ProductGallery - incluir videos de galería si existen
  const galleryItems = [];
  
  // Agregar imágenes de galería
  const galleryImages = getGalleryMedia();
  galleryImages.forEach(url => {
    if (url && !galleryItems.find(item => item.url === url)) {
      galleryItems.push({ url, type: 'image' });
    }
  });
  
  // Agregar videos de galería si existen
  const galleryVideos = getGalleryVideos();
  galleryVideos.forEach(url => {
    if (url && !galleryItems.find(item => item.url === url)) {
      galleryItems.push({ url, type: 'video', poster: url + '?poster' });
    }
  });

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

  // Funciones de touch simplificadas - se usan las más completas abajo

  // ---------- Handlers ZOOM (desktop) ----------
  const handleMouseEnter = () => {
    if (typeof window === "undefined" || window.innerWidth < 1280) return; // solo desktop (xl)
    const current =
      (desktopMediaItems && desktopMediaItems[safeDesktopIndex]) || null;
    if (!current) return; // zoom solo para imágenes

    const url = current.url;
    setZoomBg(url);

    const imgEl = mainImgRef.current;
    if (imgEl && imgEl.naturalWidth && imgEl.naturalHeight) {
      const imgRect = imgEl.getBoundingClientRect();
      const dispW = imgRect.width || imgEl.clientWidth || 0;
      const dispH = imgRect.height || imgEl.clientHeight || 0;
      const naturalW = imgEl.naturalWidth;
      const naturalH = imgEl.naturalHeight;
      const scaleX = naturalW / Math.max(1, dispW);
      const scaleY = naturalH / Math.max(1, dispH);
      // Zoom fuerte estilo Amazon/eBay, sin deformar
      const baseScale = Math.min(scaleX, scaleY);
      const finalScale = Math.min(4, Math.max(2, baseScale)); // entre 2x y 4x
      const factor = baseScale > 0 ? finalScale / baseScale : 2;
      setZoomBgSize({
        w: Math.round(naturalW * factor),
        h: Math.round(naturalH * factor),
      });
      zoomRectRef.current = imgRect;
    } else {
      setZoomBgSize({ w: 1000, h: 1000 }); // fallback
      zoomRectRef.current = imgWrapRef.current
        ? imgWrapRef.current.getBoundingClientRect()
        : null;
    }
    lastPosRef.current = { x: 50, y: 50 };
    setIsZooming(true);
    requestAnimationFrame(() => {
      const el = zoomOverlayRef.current;
      if (el) el.style.backgroundPosition = `50% 50%`;
    });
  };

  const handleMouseMove = (e) => {
    if (
      !isZooming ||
      (typeof window !== "undefined" && window.innerWidth < 1280)
    )
      return;
    const rect =
      zoomRectRef.current ||
      (mainImgRef.current && mainImgRef.current.getBoundingClientRect()) ||
      (imgWrapRef.current && imgWrapRef.current.getBoundingClientRect());
    if (!rect) return;

    const x = Math.max(
      0,
      Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)
    );
    const y = Math.max(
      0,
      Math.min(100, ((e.clientY - rect.top) / rect.height) * 100)
    );
    lastPosRef.current = { x, y };
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
  // ---------- TOUCH/SWIPE imagen principal (móvil) ----------
  const handleMainImageTouchStart = (e) => {
    if (window.innerWidth >= 1280) return; // Solo en móvil/tablet
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };

  const handleMainImageTouchMove = (e) => {
    if (window.innerWidth >= 1280) return; // Solo en móvil/tablet
    if (touchStartX.current === 0) return;

    const deltaX = e.touches[0].clientX - touchStartX.current;
    touchDeltaX.current = deltaX;

    // Detectar swipe horizontal (sin preventDefault para evitar warning)
  };

  const handleMainImageTouchEnd = (e) => {
    if (window.innerWidth >= 1280) return; // Solo en móvil/tablet
    const threshold = 50;

    if (Math.abs(touchDeltaX.current) > threshold) {
      if (touchDeltaX.current > 0 && imagenActualIndex > 0) {
        // Swipe derecha - imagen anterior
        setImagenActualIndex(imagenActualIndex - 1);
      } else if (
        touchDeltaX.current < 0 &&
        imagenActualIndex < imagenes.length - 1
      ) {
        // Swipe izquierda - imagen siguiente
        setImagenActualIndex(imagenActualIndex + 1);
      }
    }

    touchStartX.current = 0;
    touchDeltaX.current = 0;
  };

  // ---------- PINCH TO ZOOM (vista completa móvil) ----------

  const getDistance = (touch1, touch2) => {
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  const handleFullscreenTouchStart = (e) => {
    if (e.touches.length === 2) {
      // Pinch start
      const distance = getDistance(e.touches[0], e.touches[1]);
      setInitialDistance(distance);
      setInitialZoom(fullscreenZoom);
    } else if (e.touches.length === 1) {
      // Pan start
      touchStartX.current = e.touches[0].clientX;
      touchDeltaX.current = 0;
    }
  };

  const handleFullscreenTouchMove = (e) => {
    // Removido preventDefault para evitar warning

    if (e.touches.length === 2) {
      // Pinch zoom
      const distance = getDistance(e.touches[0], e.touches[1]);
      const scale = distance / initialDistance;
      const newZoom = Math.min(Math.max(initialZoom * scale, 1), 4);
      setFullscreenZoom(newZoom);
    } else if (e.touches.length === 1) {
      if (fullscreenZoom > 1) {
        // Pan when zoomed
        const deltaX = e.touches[0].clientX - touchStartX.current;
        const deltaY = e.touches[0].clientY - (touchStartX.current || 0);
        setFullscreenPan({ x: deltaX, y: deltaY });
      } else {
        // Track swipe for image navigation when not zoomed
        const deltaX = e.touches[0].clientX - touchStartX.current;
        touchDeltaX.current = deltaX;
      }
    }
  };

  const handleFullscreenTouchEnd = (e) => {
    if (e.touches.length === 0) {
      // Reset if zoom is too small
      if (fullscreenZoom < 1.1) {
        setFullscreenZoom(1);
        setFullscreenPan({ x: 0, y: 0 });
      }

      // Swipe navigation when not zoomed
      if (fullscreenZoom === 1) {
        const threshold = 50;
        const currentArray = desktopMediaItems;

        if (Math.abs(touchDeltaX.current) > threshold) {
          if (touchDeltaX.current > 0 && mediaOverlayIndex > 0) {
            // Swipe derecha - anterior
            setMediaOverlayIndex(mediaOverlayIndex - 1);
          } else if (
            touchDeltaX.current < 0 &&
            mediaOverlayIndex < currentArray.length - 1
          ) {
            // Swipe izquierda - siguiente
            setMediaOverlayIndex(mediaOverlayIndex + 1);
          }
        }

        touchStartX.current = 0;
        touchDeltaX.current = 0;
      }
    }
  };

  // --- Funciones de touch para modal de imagen ---
  const onTouchStartModal = (e) => {
    if (e.touches.length === 2) {
      // Pinch start
      const distance = getDistance(e.touches[0], e.touches[1]);
      setInitialDistance(distance);
      setInitialZoom(modalZoom);
    } else if (e.touches.length === 1) {
      // Pan start
      touchStartX.current = e.touches[0].clientX;
      touchDeltaX.current = 0;
    }
  };

  const onTouchMoveModal = (e) => {
    // Removido preventDefault para evitar warning

    if (e.touches.length === 2) {
      // Pinch zoom
      const distance = getDistance(e.touches[0], e.touches[1]);
      const scale = distance / initialDistance;
      const newZoom = Math.min(Math.max(initialZoom * scale, 1), 4);
      setModalZoom(newZoom);
    } else if (e.touches.length === 1) {
      if (modalZoom > 1) {
        // Pan when zoomed
        const deltaX = e.touches[0].clientX - touchStartX.current;
        const deltaY = e.touches[0].clientY - (touchStartX.current || 0);
        setModalPan({ x: deltaX, y: deltaY });
      } else {
        // Track swipe for image navigation when not zoomed
        const deltaX = e.touches[0].clientX - touchStartX.current;
        touchDeltaX.current = deltaX;
      }
    }
  };

  const onTouchEndModal = (e) => {
    if (e.touches.length === 0) {
      // Reset if zoom is too small
      if (modalZoom < 1.1) {
        setModalZoom(1);
        setModalPan({ x: 0, y: 0 });
      }

      // Swipe navigation when not zoomed
      if (modalZoom === 1) {
        const threshold = 50;

        if (Math.abs(touchDeltaX.current) > threshold) {
          if (touchDeltaX.current > 0 && imagenActualIndex > 0) {
            // Swipe derecha - anterior
            setImagenActualIndex(imagenActualIndex - 1);
          } else if (
            touchDeltaX.current < 0 &&
            imagenActualIndex < imagenesModal.length - 1
          ) {
            // Swipe izquierda - siguiente
            setImagenActualIndex(imagenActualIndex + 1);
          }
        }

        touchStartX.current = 0;
        touchDeltaX.current = 0;
      }
    }
  };

  // --- Compartir ---
  const handleShare = async () => {
    try {
      const shareUrl =
        typeof window !== "undefined" ? window.location.href : "";
      const data = {
        title: producto?.nombre || "Producto",
        text: `Mira este producto: ${producto?.nombre || ""}`,
        url: shareUrl,
      };

      if (navigator.share) {
        await navigator.share(data);
      } else {
        // Fallback: copiar al portapapeles
        await navigator.clipboard.writeText(shareUrl);
        alert("Enlace copiado al portapapeles");
      }
    } catch (error) {
      console.log("Error al compartir:", error);
    }
  };

  // Compartir dentro del overlay (usa Web Share si está disponible; si no, copia el enlace)
  const handleShareOverlay = async () => {
    try {
      const shareUrl =
        typeof window !== "undefined" ? window.location.href : "";
      const data = {
        title: producto?.nombre || document.title || "Producto",
        text: producto?.nombre || "",
        url: shareUrl,
      };
      if (navigator.share) {
        await navigator.share(data);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert("Enlace copiado");
      }
    } catch {}
  };

  // --- Overlay de medios (galería completa tipo Amazon) ---
  const openMediaOverlay = (tab, index = 0) => {
    setMediaOverlayTab(tab);
    setMediaOverlayIndex(Math.max(0, index || 0));
    setMediaOverlayOpen(true);
  };
  const closeMediaOverlay = () => setMediaOverlayOpen(false);

  return (
    <>
      {/* Sin topbar móvil: solo contenido */}
      <main className="vp-main min-h-screen bg-white px-4 sm:px-6 pb-16 text-gray-800 flex flex-col items-stretch overflow-visible">
        {/* Botón Volver circular (solo desktop) */}
        <div className="hidden xl:flex w-full mb-3">
          <button
            type="button"
            className="vp-back-top-btn"
            onClick={onBack}
            aria-label="Volver"
          >
            <FaArrowLeft size={16} />
          </button>
        </div>

        <section className="w-full xl:grid xl:grid-cols-12 xl:gap-6 flex flex-col gap-8 overflow-visible">
          {/* Columna Izquierda - Galería (6 columnas) */}
          {showLeftColumn && (
            <motion.div className="relative flex flex-col items-start w-full xl:col-span-6 overflow-visible">
              {/* Botón de volver móvil */}
              <button
                className="vp-back-fab xl:hidden absolute top-4 left-4 z-10"
                onClick={onBack}
                aria-label="Volver"
                type="button"
              >
                <FaArrowLeft size={18} />
              </button>
              
              {/* Nueva galería estilo Amazon */}
              <ProductGallery
                items={galleryItems}
                productId={producto.id}
                onThumbClick={(index, item) => {
                  console.log('Thumb clicked:', index, item);
                }}
                onLightboxOpen={(index) => {
                  console.log('Lightbox opened at index:', index);
                }}
                onVideoPlay={(videoId) => {
                  console.log('Video playing:', videoId);
                }}
              />
            </motion.div>
          )}

          {/* Columna Centro - Información del producto (4 columnas) */}
          <motion.div className="flex flex-col gap-4 sm:gap-5 w-full xl:col-span-4 overflow-visible">
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

            {/* Enhanced Visual Variant Selector - Always render to avoid hook order issues */}
            <div
              className={`vp-variants mt-6 ${
                !variantesConColor || variantesConColor.length <= 1
                  ? "hidden"
                  : ""
              }`}
            >
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Variantes disponibles:
              </h4>
              <VisualVariantSelector
                variants={
                  variantesConColor
                    ? variantesConColor.map((v, idx) => ({
                        id: v.id || `var_${idx}`,
                        name: v.color || `Variante ${idx + 1}`,
                        price: v.precio,
                        stock: v.cantidad || 0,
                        image: v.imagenPrincipal?.[0]?.url || v.imagen,
                        isSelected: varianteSeleccionada === idx,
                      }))
                    : []
                }
                productMainImage={getMainImage()}
                onVariantChange={handleVariantChange}
                className="w-full"
              />
              {/* Fallback to original selector if VisualVariantSelector fails */}
              <div className="flex flex-wrap gap-3 hidden">
                {variantesConColor.map((variante, index) => {
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
                    Array.isArray(variante?.media) && variante.media.length > 0
                      ? variante.media
                      : [];
                  const varianteImagen =
                    varianteMedia.find((m) => m?.type === "image" && m?.url)
                      ?.url ||
                    pickUrl(variante?.imagenPrincipal?.[0]) ||
                    variante?.imagen ||
                    (Array.isArray(variante?.imagenes) &&
                      variante.imagenes[0]) ||
                    (Array.isArray(producto?.media) &&
                      producto.media.find((m) => m?.type === "image")?.url) ||
                    pickUrl(producto?.imagenPrincipal?.[0]) ||
                    producto?.imagen ||
                    (Array.isArray(producto?.imagenes) &&
                      producto.imagenes[0]) ||
                    null;

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
                        {!tieneStock && (
                          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                            <span className="text-xs font-medium text-red-600">
                              Agotado
                            </span>
                          </div>
                        )}
                      </div>
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

            {/* Información del Vendedor */}
            {producto.sellerId && (
              <div className="vp-seller-info">
                <div className="seller-content">
                  <span className="seller-label">Vendido por:</span>
                  <button
                    className="seller-name"
                    onClick={() => navigate(`/tienda/${producto.sellerId}`)}
                  >
                    {producto.sellerName || "Ver Tienda"}
                  </button>
                </div>
              </div>
            )}

            {/* DISPONIBILIDAD + BOTONES SOLO EN MÓVIL/TABLET (restaurado) */}
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

                {/* “Comprar ahora” SOLO este producto */}
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
            {Array.isArray(producto.acerca) && producto.acerca.length > 0 && (
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

          {/* Columna Derecha - Tarjeta de compra (2 columnas) */}
          <aside className="vp-buy-card w-full xl:col-span-2 hidden xl:block">
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

        {/* Productos relacionados - ARRIBA */}
        {producto && (
          <section className="w-full mt-8 px-4 sm:px-6">
            <EnhancedRelatedProducts productoActual={producto} />
          </section>
        )}

        {/* Secciones de archivos extras eliminadas */}

        {/* 📸 MÁS INFORMACIÓN DEL PRODUCTO - Imágenes grandes estilo Amazon */}
        {(() => {
          const extraImages = getExtraFiles();
          if (!extraImages || extraImages.length === 0) return null;

          return (
            <section className="w-full mt-12 mb-8 px-4 sm:px-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">
                Más información del producto
              </h2>
              <div className="max-w-[1500px] mx-auto space-y-4">
                {extraImages.map((imageUrl, index) => (
                  <div
                    key={`product-info-${index}`}
                    className="relative w-full cursor-pointer group"
                    onClick={() => {
                      setProductInfoImageIndex(index);
                      setProductInfoModalOpen(true);
                    }}
                  >
                    <img
                      src={imageUrl}
                      alt={`${producto.nombre} - Información ${index + 1}`}
                      className="w-full h-auto object-contain bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                      style={{
                        maxWidth: "1500px",
                        margin: "0 auto",
                        display: "block",
                      }}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/Productos/N.jpg";
                      }}
                    />
                    {/* Overlay hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 rounded-lg flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-3 shadow-lg">
                        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })()}
      </main>

      {/* Modal de galería fullscreen - ESTILO AMAZON EXACTO */}
      {mediaOverlayOpen && (() => {
        // Obtener videos para las pestañas
        const galleryVideos = getGalleryVideos();
        const hasVideos = galleryVideos.length > 0;
        
        // Determinar qué contenido mostrar según la pestaña activa
        const currentMediaItems = mediaOverlayTab === 'videos' ? 
          galleryVideos.map(url => ({ type: 'video', url })) : 
          desktopMediaItems;
        
        // Asegurar que el índice esté dentro del rango
        const safeMediaIndex = Math.min(mediaOverlayIndex, Math.max(0, currentMediaItems.length - 1));
        
        return (
        <div className={`fixed inset-0 z-[9999] flex flex-col ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
          {/* Barra superior con pestañas y botón X */}
          <div className={`border-b px-4 py-3 flex items-center justify-between ${isDark ? 'border-gray-700 bg-gray-800' : 'border-[#DDD] bg-white'}`}>
            {/* Pestañas IMÁGENES / VIDEOS */}
            <div className="flex gap-1">
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium transition-all rounded-t ${
                  mediaOverlayTab === 'images'
                    ? isDark ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-700' : 'text-[#007185] border-b-2 border-[#007185] bg-gray-50'
                    : isDark ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                onClick={() => {
                  setMediaOverlayTab('images');
                  setMediaOverlayIndex(0);
                  setFullscreenZoom(1);
                  setFullscreenPan({ x: 0, y: 0 });
                }}
              >
                IMÁGENES
              </button>
              {hasVideos && (
                <button
                  type="button"
                  className={`px-4 py-2 text-sm font-medium transition-all rounded-t ${
                    mediaOverlayTab === 'videos'
                      ? isDark ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-700' : 'text-[#007185] border-b-2 border-[#007185] bg-gray-50'
                      : isDark ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setMediaOverlayTab('videos');
                    setMediaOverlayIndex(0);
                    setFullscreenZoom(1);
                    setFullscreenPan({ x: 0, y: 0 });
                  }}
                >
                  VIDEOS
                </button>
              )}
            </div>
            
            {/* Botón X a la derecha */}
            <button
              type="button"
              className={`transition-colors ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              aria-label="Cerrar"
              onClick={closeMediaOverlay}
            >
              <FaTimes className="text-2xl" />
            </button>
          </div>

          {/* Contenido - 2 columnas desktop (izq: imagen/video, der: miniaturas) */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Columna IZQUIERDA - Imagen/Video grande */}
            <div
              className={`flex-1 flex items-center justify-center p-4 md:p-8 relative ${isDark ? 'bg-gray-900' : 'bg-white'}`}
              onClick={(e) => e.stopPropagation()}
              onTouchStart={mediaOverlayTab === 'images' ? handleFullscreenTouchStart : undefined}
              onTouchMove={mediaOverlayTab === 'images' ? handleFullscreenTouchMove : undefined}
              onTouchEnd={mediaOverlayTab === 'images' ? handleFullscreenTouchEnd : undefined}
            >
              <div className="relative w-full h-full flex items-center justify-center max-w-[1500px]">
                {/* Flechas SOLO en desktop (≥1280px) - Móvil/tablet usan swipe */}
                {currentMediaItems.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 text-gray-700 hover:text-gray-900 transition-all hidden xl:flex items-center justify-center"
                      aria-label="Anterior"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMediaOverlayIndex(
                          (prev) =>
                            (prev - 1 + currentMediaItems.length) %
                            currentMediaItems.length
                        );
                      }}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 text-gray-700 hover:text-gray-900 transition-all hidden xl:flex items-center justify-center"
                      aria-label="Siguiente"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMediaOverlayIndex(
                          (prev) => (prev + 1) % currentMediaItems.length
                        );
                      }}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}

                {/* Contenido principal: Imagen o Video - Acoplado perfectamente */}
                <div className="w-full h-full flex items-center justify-center px-2 md:px-4">
                  {(() => {
                    const current = currentMediaItems[safeMediaIndex];
                    if (!current) return null;
                    
                    // Si es video, mostrar video player
                    if (mediaOverlayTab === 'videos') {
                      return (
                        <video
                          key={`video-${safeMediaIndex}`}
                          src={current.url}
                          controls
                          className="w-full h-full object-contain"
                          style={{
                            maxWidth: "min(100vw - 2rem, 1500px)",
                            maxHeight: "min(90vh, 100%)",
                          }}
                          onError={(e) => {
                            console.error('Error loading video:', current.url);
                          }}
                        />
                      );
                    }
                    
                    // Si es imagen, mostrar con zoom - Acoplado para vertical/horizontal
                    return (
                      <img
                        src={current.url}
                        alt={`${producto?.nombre || "Imagen"}`}
                        className="w-full h-full object-contain select-none"
                        style={{
                          maxWidth: "min(100vw - 2rem, 1500px)",
                          maxHeight: "min(90vh, 100%)",
                          transform: `scale(${fullscreenZoom}) translate(${fullscreenPan.x}px, ${fullscreenPan.y}px)`,
                          transition: fullscreenZoom === 1 ? "transform 0.3s ease" : "none",
                          cursor: fullscreenZoom > 1 ? 'grab' : 'zoom-in',
                        }}
                        draggable={false}
                        onDoubleClick={() => {
                          if (fullscreenZoom === 1) {
                            setFullscreenZoom(2);
                          } else {
                            setFullscreenZoom(1);
                            setFullscreenPan({ x: 0, y: 0 });
                          }
                        }}
                      />
                    );
                  })()}
                </div>
              </div>

              {/* Indicador móvil/tablet con hint de swipe */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 xl:hidden flex flex-col items-center gap-2">
                <div className={`px-4 py-2 rounded-full text-sm font-medium shadow-lg ${isDark ? 'bg-gray-800 text-white' : 'bg-white/95 text-gray-900'}`}>
                  {safeMediaIndex + 1} / {currentMediaItems.length}
                </div>
                {currentMediaItems.length > 1 && (
                  <div className={`text-xs px-3 py-1 rounded-full flex items-center gap-1 ${isDark ? 'bg-gray-800/90 text-gray-300' : 'bg-white/90 text-gray-600'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                    </svg>
                    <span>Desliza</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Columna DERECHA - Miniaturas verticales con scroll (Desktop 768px+) */}
            <div className={`hidden md:block w-64 lg:w-80 border-l overflow-y-auto p-4 ${isDark ? 'border-gray-700 bg-gray-800' : 'border-[#DDD] bg-gray-50'}`} onClick={(e) => e.stopPropagation()}>
              <div className="space-y-3">
                <h3 className={`text-sm font-semibold mb-4 uppercase ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {mediaOverlayTab === 'videos' ? 'Videos' : 'Imágenes'}
                </h3>
                {/* Grid de miniaturas 2 columnas - Desktop 120x120px con scroll vertical */}
                <div className="grid grid-cols-2 gap-3">
                  {currentMediaItems.map((item, i) => (
                    <button
                      key={`desktop-thumb-${i}`}
                      type="button"
                      className={`w-full aspect-square overflow-hidden rounded border-2 transition-all ${
                        i === safeMediaIndex
                          ? "border-blue-500 ring-2 ring-blue-500/30"
                          : "border-gray-300 hover:border-blue-500/50"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setMediaOverlayIndex(i);
                        setFullscreenZoom(1);
                        setFullscreenPan({ x: 0, y: 0 });
                      }}
                      aria-label={`Vista ${i + 1}`}
                    >
                      {mediaOverlayTab === 'videos' ? (
                        <div className="relative w-full h-full bg-black flex items-center justify-center">
                          <video
                            src={item.url}
                            className="w-full h-full object-contain"
                            muted
                          />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="bg-white/90 rounded-full p-2">
                              <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                              </svg>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={item.url}
                          alt={`Miniatura ${i + 1}`}
                          className="w-full h-full object-contain bg-white p-1"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Miniaturas horizontales (Móvil - debajo de la imagen/video) */}
            <div className={`md:hidden border-t p-4 overflow-x-auto ${isDark ? 'border-gray-700 bg-gray-800' : 'border-[#DDD] bg-gray-50'}`} onClick={(e) => e.stopPropagation()}>
              <div className="flex gap-3 min-w-min">
                {/* Móvil 80x80px con scroll horizontal */}
                {currentMediaItems.map((item, i) => (
                  <button
                    key={`mobile-thumb-${i}`}
                    type="button"
                    className={`flex-shrink-0 w-20 h-20 overflow-hidden rounded border-2 transition-all ${
                      i === safeMediaIndex
                        ? "border-blue-500 ring-2 ring-blue-500/30"
                        : "border-gray-300 hover:border-blue-500/50"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setMediaOverlayIndex(i);
                      setFullscreenZoom(1);
                      setFullscreenPan({ x: 0, y: 0 });
                    }}
                    aria-label={`Vista ${i + 1}`}
                  >
                    {mediaOverlayTab === 'videos' ? (
                      <div className="relative w-full h-full bg-black flex items-center justify-center">
                        <video
                          src={item.url}
                          className="w-full h-full object-contain"
                          muted
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="bg-white/90 rounded-full p-1.5">
                            <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={item.url}
                        alt={`Miniatura ${i + 1}`}
                        className="w-full h-full object-contain bg-white p-1"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        );
      })()}

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

      {/* Modal de imagen fullscreen - PERFECTO CON SWIPE Y ZOOM */}
      {imagenModalAbierta && (
        <div
          className="fixed inset-0 bg-black/95 z-[9999] flex flex-col"
          onClick={cerrarImagenModal}
        >
          {/* Solo botón X arriba a la derecha */}
          <div className="absolute top-4 right-4 z-20">
            <button
              className="bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
              onClick={cerrarImagenModal}
              aria-label="Cerrar"
            >
              <FaTimes size={20} />
            </button>
          </div>

          {/* Imagen principal CENTRADA CON SWIPE Y ZOOM */}
          <div
            className="flex-1 flex items-center justify-center p-4 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={onTouchStartModal}
            onTouchMove={onTouchMoveModal}
            onTouchEnd={onTouchEndModal}
          >
            <img
              src={imagenesModal[imagenActualIndex]}
              alt={`${producto?.nombre}`}
              className="max-w-full max-h-full object-contain select-none"
              style={{
                transform: `scale(${modalZoom || 1}) translate(${
                  modalPan?.x || 0
                }px, ${modalPan?.y || 0}px)`,
                transition:
                  (modalZoom || 1) === 1 ? "transform 0.3s ease" : "none",
              }}
              draggable={false}
              onDoubleClick={() => {
                if ((modalZoom || 1) === 1) {
                  setModalZoom && setModalZoom(2);
                } else {
                  setModalZoom && setModalZoom(1);
                  setModalPan && setModalPan({ x: 0, y: 0 });
                }
              }}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/Productos/N.jpg";
              }}
            />
          </div>

          {/* Thumbnails como slider horizontal abajo SOLO si hay más de 1 imagen */}
          {imagenesModal.length > 1 && (
            <div className="p-4" onClick={(e) => e.stopPropagation()}>
              <div
                className="flex gap-3 justify-center overflow-x-auto pb-2 scrollbar-hide"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {imagenesModal.map((img, index) => (
                  <button
                    key={index}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      index === imagenActualIndex
                        ? "border-white border-opacity-100"
                        : "border-gray-600 border-opacity-50"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setImagenActualIndex(index);
                      setModalZoom && setModalZoom(1);
                      setModalPan && setModalPan({ x: 0, y: 0 });
                    }}
                    aria-label={`Miniatura ${index + 1}`}
                  >
                    <img
                      src={img}
                      alt={`Miniatura ${index + 1}`}
                      className="w-full h-full object-contain"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/Productos/N.jpg";
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 🖼️ Modal de "Más información del producto" - Imágenes grandes fullscreen */}
      {productInfoModalOpen && (() => {
        const extraImages = getExtraFiles();
        if (!extraImages || extraImages.length === 0) return null;

        const currentImage = extraImages[productInfoImageIndex];
        const hasMultipleImages = extraImages.length > 1;

        return (
          <div className={`fixed inset-0 z-[9999] flex flex-col ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
            {/* Barra superior simple con X */}
            <div className={`border-b px-4 py-3 flex items-center justify-between ${isDark ? 'border-gray-700 bg-gray-800' : 'border-[#DDD] bg-white'}`}>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Información del producto ({productInfoImageIndex + 1} / {extraImages.length})
              </h2>
              <button
                type="button"
                className={`transition-colors ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                aria-label="Cerrar"
                onClick={() => setProductInfoModalOpen(false)}
              >
                <FaTimes className="text-2xl" />
              </button>
            </div>

            {/* Contenedor de imagen centrada */}
            <div className={`flex-1 flex items-center justify-center p-4 md:p-8 relative overflow-auto ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
              <div className="relative w-full h-full flex items-center justify-center max-w-[1500px]">
                {/* Flechas SOLO en desktop - Móvil/tablet usan swipe */}
                {hasMultipleImages && (
                  <>
                    <button
                      type="button"
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 text-gray-700 hover:text-gray-900 transition-all hidden xl:flex items-center justify-center"
                      aria-label="Anterior"
                      onClick={() => {
                        setProductInfoImageIndex(
                          (prev) => (prev - 1 + extraImages.length) % extraImages.length
                        );
                      }}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 text-gray-700 hover:text-gray-900 transition-all hidden xl:flex items-center justify-center"
                      aria-label="Siguiente"
                      onClick={() => {
                        setProductInfoImageIndex(
                          (prev) => (prev + 1) % extraImages.length
                        );
                      }}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}

                {/* Imagen principal con zoom - Acoplado perfectamente */}
                <div className="w-full h-full flex items-center justify-center overflow-hidden px-2 md:px-4">
                  <img
                    src={currentImage}
                    alt={`${producto?.nombre} - Información ${productInfoImageIndex + 1}`}
                    className="w-full h-full object-contain select-none"
                    style={{
                      maxWidth: "min(100vw - 2rem, 1500px)",
                      maxHeight: "min(90vh, 100%)",
                      transform: `scale(${productInfoZoom}) translate(${productInfoPan.x}px, ${productInfoPan.y}px)`,
                      transition: productInfoZoom === 1 ? "transform 0.3s ease" : "none",
                      cursor: productInfoZoom > 1 ? 'grab' : 'zoom-in',
                    }}
                    draggable={false}
                    onDoubleClick={() => {
                      if (productInfoZoom === 1) {
                        setProductInfoZoom(2);
                      } else {
                        setProductInfoZoom(1);
                        setProductInfoPan({ x: 0, y: 0 });
                      }
                    }}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/Productos/N.jpg";
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Miniaturas horizontales (solo si hay más de 1 imagen) */}
            {hasMultipleImages && (
              <div className={`border-t p-4 overflow-x-auto ${isDark ? 'border-gray-700 bg-gray-800' : 'border-[#DDD] bg-gray-50'}`}>
                <div className="flex gap-3 justify-center min-w-min">
                  {extraImages.map((imageUrl, i) => (
                    <button
                      key={`product-info-thumb-${i}`}
                      type="button"
                      className={`flex-shrink-0 w-20 h-20 overflow-hidden rounded border-2 transition-all ${
                        i === productInfoImageIndex
                          ? "border-blue-500 ring-2 ring-blue-500/30"
                          : "border-gray-300 hover:border-blue-500/50"
                      }`}
                      onClick={() => setProductInfoImageIndex(i)}
                      aria-label={`Vista ${i + 1}`}
                    >
                      <img
                        src={imageUrl}
                        alt={`Miniatura ${i + 1}`}
                        className="w-full h-full object-contain bg-white p-1"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/Productos/N.jpg";
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </>
  );
}

export default VistaProducto;
