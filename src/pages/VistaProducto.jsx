import React, { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowLeft, FaTimes, FaTrash, FaShareSquare } from "react-icons/fa";
import { useProduct } from "../hooks/useProducts";
import { useCarrito } from "../context/CarritoContext";
import { useAuth } from "../context/AuthContext";
import ModalLoginAlert from "../components/ModalLoginAlert";
import { useAuthModal } from "../context/AuthModalContext";
import BotonCardnet from "../components/BotonCardnet";

// Components necesarios
import AdvancedMediaGallery from "../components/AdvancedMediaGallery";
import VisualVariantSelector from "../components/VisualVariantSelector";
import EnhancedRelatedProducts from "../components/EnhancedRelatedProducts";

// Styles
import "../styles/VistaProducto.css";
import "../styles/VistaProducto-dark.css";

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
      const allVariantes = Array.isArray(producto?.variantes) ? producto.variantes : [];
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

  // Auto-scroll thumbnails móvil/tablet (debajo de la imagen) cuando cambia el medio activo
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1280) {
      const cont = document.querySelector('.mobile-tablet-thumbs');
      const active = cont && cont.querySelector('.mt-thumb.active');
      if (cont && active && typeof active.scrollIntoView === 'function') {
        active.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
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

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update cart quantity when carrito changes
  useEffect(() => {
    if (producto) {
      const allVariantes = Array.isArray(producto?.variantes) ? producto.variantes : [];
      const variantesConColor = allVariantes.filter(
        (v) => v && typeof v.color === "string" && v.color.trim()
      );
      const varianteActivaUI = variantesConColor[varianteSeleccionada] || null;
      
      const currentInCart = carrito.find(item => 
        item.id === producto.id && 
        (!varianteActivaUI || item.variante?.color === varianteActivaUI?.color)
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
    if (varianteActiva?.imagenPrincipal?.[0]?.url) return varianteActiva.imagenPrincipal[0].url;
    if (producto.imagenPrincipal?.[0]?.url) return producto.imagenPrincipal[0].url;
    // Legacy fallback
    if (varianteActiva?.imagen) return varianteActiva.imagen;
    if (producto.imagen) return producto.imagen;
    return null;
  };

  const getGalleryMedia = () => {
    const sourceData = varianteActiva?.galeriaImagenes?.length > 0 
      ? varianteActiva.galeriaImagenes 
      : producto.galeriaImagenes || producto.imagenes || [];
    return sourceData.filter(item => item?.url || typeof item === 'string').map(item => 
      typeof item === 'string' ? item : item.url
    );
  };

  const getMainVideo = () => {
    if (producto.videoAcercaArticulo?.[0]?.url) return producto.videoAcercaArticulo[0].url;
    if (producto.videoUrl) return producto.videoUrl; // Legacy
    return null;
  };

  const getExtraFiles = () => {
    const extraMedia = producto.tresArchivosExtras || producto.imagenesExtra || [];
    return extraMedia.filter(item => item?.url || typeof item === 'string').slice(0, 3).map(item => 
      typeof item === 'string' ? item : item.url
    );
  };

  const getGalleryVideos = () => {
    const sourceData = varianteActiva?.videoUrls?.length > 0 
      ? varianteActiva.videoUrls 
      : producto.videoUrls || [];
    return sourceData.filter(item => item?.url || typeof item === 'string').map(item => 
      typeof item === 'string' ? item : item.url
    );
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
    const currentInCart = carrito.find(item => 
      item.id === product.id && 
      (!variantToUse || item.variante?.color === variantToUse?.color)
    );
    setCartQuantity((currentInCart?.cantidad || 0) + quantity);
  };

  const handleToggleFavorite = (product) => {
    setIsFavorite(!isFavorite);
    // Here you would typically save to localStorage or backend
    console.log('Toggled favorite for:', product.nombre);
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
  // Separación para overlay por tipo
  const imageItemsMedia = mediaItems.filter((m) => m.type === "image");
  const videoItemsMedia = mediaItems.filter((m) => m.type === "video");
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
    ? producto.videoAcercaArticulo
        .map((v) =>
          typeof v === "string" ? v : v && v.url ? v.url : ""
        )
        .filter(Boolean)
    : mainVideoSrc
    ? [mainVideoSrc]
    : [];
  const acercaItems = acercaList.map((u) => ({ type: "video", url: u }));
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

  // Videos para overlay (galería completa): incluir acercaItems
  const videoItemsOverlay = (() => {
    const seenV = new Set();
    const arr = [...videoItemsMedia, ...acercaItems];
    return arr.filter((m) => {
      const key = (m.url || "").split("?")[0].split("#")[0].trim().toLowerCase();
      if (!key || seenV.has(key)) return false;
      seenV.add(key);
      return true;
    });
  })();

  // Lista combinada para desktop y modal eBay (imágenes primero, luego videos)
  const desktopMediaItems = [
    ...imageItemsMedia,
    ...videoItemsOverlay,
  ];
  // Índice seguro derivado (sin hooks) para evitar cambios en orden de hooks
  const safeDesktopIndex = Math.max(
    0,
    Math.min(desktopMediaIndex, Math.max(0, desktopMediaItems.length - 1))
  );

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
    if (typeof window === 'undefined' || window.innerWidth < 1280) return; // solo desktop (xl)
    const current = (desktopMediaItems && desktopMediaItems[safeDesktopIndex]) || null;
    if (!current || current.type !== "image") return; // zoom solo para imágenes

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
    if (!isZooming || (typeof window !== 'undefined' && window.innerWidth < 1280)) return;
    const rect =
      zoomRectRef.current ||
      (mainImgRef.current && mainImgRef.current.getBoundingClientRect()) ||
      (imgWrapRef.current && imgWrapRef.current.getBoundingClientRect());
    if (!rect) return;

    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
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
      } else if (touchDeltaX.current < 0 && imagenActualIndex < imagenes.length - 1) {
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
          } else if (touchDeltaX.current < 0 && mediaOverlayIndex < currentArray.length - 1) {
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
          } else if (touchDeltaX.current < 0 && imagenActualIndex < imagenesModal.length - 1) {
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
      const shareUrl = typeof window !== "undefined" ? window.location.href : "";
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
      const shareUrl = typeof window !== "undefined" ? window.location.href : "";
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
        {/* Botón Volver (solo desktop) debajo del topbar y por ENCIMA del grid para alinear imagen y título */}
        <div className="hidden xl:flex w-full mb-3">
          <button
            type="button"
            className="vp-back-top-btn"
            onClick={onBack}
            aria-label="Volver"
          >
            <FaArrowLeft size={14} />
            <span>Volver</span>
          </button>
        </div>

        <section className="w-full xl:grid xl:grid-cols-12 xl:gap-6 flex flex-col gap-8 overflow-visible">
          {/* Columna Izquierda - Galería (6 columnas) */}
          {showLeftColumn && (
            <motion.div className="relative flex flex-col items-start w-full xl:col-span-6 overflow-visible">

              {/* Galería estilo eBay - Visible en todos los dispositivos */}
              {desktopMediaItems.length > 0 && (
                <div className="amazon-gallery-layout flex">
                  {/* Thumbnails verticales (a la IZQUIERDA en desktop) */}
                  <div className="amazon-thumbs-sidebar">
                    {desktopMediaItems.map((item, i) => (
                      <button
                        key={`thumb-${i}`}
                        type="button"
                        className={`amazon-thumb ${i === safeDesktopIndex ? "active" : ""}`}
                        onClick={() => {
                          setDesktopMediaIndex(i);
                          // Si es imagen, sincronizar índice de imágenes para zoom y móvil
                          if (item.type === "image") {
                            const norm = (u) => (u ? String(u).split("?")[0].split("#")[0].trim().toLowerCase() : "");
                            const idx = imagenes.findIndex((u) => norm(u) === norm(item.url));
                            if (idx >= 0) setImagenActualIndex(idx);
                          }
                        }}
                        aria-label={`Miniatura ${i + 1}`}
                      >
                        {item.type === "video" ? (
                          <div className="relative w-full h-full">
                            <video src={item.url} className="w-full h-full object-contain" muted preload="metadata" />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                            </div>
                          </div>
                        ) : (
                          <img
                            src={item.url}
                            alt={`Miniatura ${i + 1}`}
                            className="w-full h-full object-contain"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "/Productos/N.jpg";
                            }}
                          />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Imagen principal */}
                  <div className="amazon-main-image-container">
                    {/* Botón de regreso sobre la imagen */}
                    <button
                      className="vp-back-fab xl:hidden"
                      onClick={onBack}
                      aria-label="Volver"
                      type="button"
                    >
                      <FaArrowLeft size={18} />
                    </button>
                    <div
                      ref={imgWrapRef}
                      className={`amazon-main-image-wrap ${isZooming ? "zooming" : ""}`}
                      onMouseEnter={handleMouseEnter}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                      onClick={() => {
                        // eBay overlay unificado: usar índice combinado directamente
                        openMediaOverlay("images", safeDesktopIndex);
                      }}
                      onTouchStart={handleMainImageTouchStart}
                      onTouchMove={handleMainImageTouchMove}
                      onTouchEnd={handleMainImageTouchEnd}
                      role="button"
                      aria-label="Ver imagen en pantalla completa"
                      tabIndex={0}
                    >
                      {(() => {
                        const current = desktopMediaItems[safeDesktopIndex];
                        if (!current) return null;
                        if (current.type === "video") {
                          return (
                            <video
                              src={current.url}
                              className="w-full h-full object-contain"
                              controls
                              preload="metadata"
                            />
                          );
                        }
                        return (
                          <img
                            ref={mainImgRef}
                            key={`main-img-${safeDesktopIndex}`}
                            src={current.url}
                            alt={producto.nombre}
                            className="w-full h-full object-contain transition-opacity duration-300"
                            draggable={false}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "/Productos/N.jpg";
                            }}
                          />
                        );
                      })()}

                      {/* share removed en móvil/desktop para vista limpia */}
                    </div>

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
                </div>
              )}

              {desktopMediaItems.length > 1 && (
                <div className="xl:hidden w-full mt-3">
                  <div className="mobile-tablet-thumbs flex gap-3 overflow-x-auto pb-2">
                    {desktopMediaItems.map((item, i) => (
                      <button
                        key={`mt-thumb-${i}`}
                        type="button"
                        className={`mt-thumb ${i === safeDesktopIndex ? "active" : ""}`}
                        onClick={() => setDesktopMediaIndex(i)}
                        aria-label={`Vista ${i + 1}`}
                      >
                        {item.type === "video" ? (
                          <div className="relative w-full h-full">
                            <video src={item.url} className="w-full h-full object-contain" muted preload="metadata" />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                            </div>
                          </div>
                        ) : (
                          <img
                            src={item.url}
                            alt={`Miniatura ${i + 1}`}
                            className="w-full h-full object-contain"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "/Productos/N.jpg";
                            }}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Enlace removido para vista limpia tipo eBay */}


              {/* Enhanced Visual Variant Selector - Always render to avoid hook order issues */}
              <div className={`vp-variants mt-6 ${(!variantesConColor || variantesConColor.length <= 1) ? 'hidden' : ''}`}>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Variantes disponibles:
                </h4>
                <VisualVariantSelector
                  variants={variantesConColor ? variantesConColor.map((v, idx) => ({
                    id: v.id || `var_${idx}`,
                    name: v.color || `Variante ${idx + 1}`,
                    price: v.precio,
                    stock: v.cantidad || 0,
                    image: v.imagenPrincipal?.[0]?.url || v.imagen,
                    isSelected: varianteSeleccionada === idx
                  })) : []}
                  productMainImage={getMainImage()}
                  onVariantChange={handleVariantChange}
                  className="w-full"
                />
                  {/* Fallback to original selector if VisualVariantSelector fails */}
                  <div className="flex flex-wrap gap-3 hidden">
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
            
            {/* Información del Vendedor */}
            {producto.sellerId && (
              <div className="vp-seller-info">
                <div className="seller-content">
                  <span className="seller-label">Vendido por:</span>
                  <button
                    className="seller-name"
                    onClick={() => navigate(`/tienda/${producto.sellerId}`)}
                  >
                    {producto.sellerName || 'Ver Tienda'}
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

        {/* Secciones inferiores ocupan todo el ancho */}
        <section className="w-full mt-8 flex flex-col items-stretch">
          {/* Productos relacionados - Estilo Amazon */}
          <div className="w-full">
            <EnhancedRelatedProducts
              productoActual={producto}
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
              <h4 className="vp-moreinfo-title">Más información del producto</h4>
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
                          loading="lazy"
                          decoding="async"
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

      {/* Modal de galería fullscreen - PERFECTO COMO AMAZON/EBAY */}
      {mediaOverlayOpen && (
        <div className="fixed inset-0 bg-black/95 z-[9999] flex flex-col" onClick={closeMediaOverlay}>
          {/* Solo botón X arriba a la derecha */}
          <div className="absolute top-4 right-4 z-20">
            <button 
              type="button" 
              className="bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
              aria-label="Cerrar" 
              onClick={closeMediaOverlay}
            >
              <FaTimes size={20} />
            </button>
          </div>

          {/* Área principal de la imagen/video - CENTRADA CON SWIPE Y ZOOM */}
          <div 
            className="flex-1 flex items-center justify-center p-4 xl:p-8 relative overflow-hidden" 
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleFullscreenTouchStart}
            onTouchMove={handleFullscreenTouchMove}
            onTouchEnd={handleFullscreenTouchEnd}
          >
            {/* Flechas SOLO en desktop */}
            {desktopMediaItems.length > 1 && (
              <>
                <button
                  type="button"
                  className="hidden xl:flex absolute left-6 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors z-10"
                  aria-label="Anterior"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMediaOverlayIndex((prev) => (prev - 1 + desktopMediaItems.length) % desktopMediaItems.length);
                  }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="hidden xl:flex absolute right-6 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors z-10"
                  aria-label="Siguiente"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMediaOverlayIndex((prev) => (prev + 1) % desktopMediaItems.length);
                  }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Imagen/Video principal CENTRADA CON ZOOM Y SWIPE */}
            <div className="w-full h-full flex items-center justify-center">
              {(() => {
                const current = desktopMediaItems[mediaOverlayIndex];
                if (!current) return null;
                if (current.type === "video") {
                  return (
                    <video 
                      src={current.url} 
                      className="max-w-full max-h-full object-contain" 
                      controls 
                      autoPlay 
                      preload="metadata"
                      style={{
                        transform: `scale(${fullscreenZoom}) translate(${fullscreenPan.x}px, ${fullscreenPan.y}px)`
                      }}
                    />
                  );
                }
                return (
                  <img
                    src={current.url}
                    alt={`${producto?.nombre || "Imagen"}`}
                    className="max-w-full max-h-full object-contain select-none"
                    style={{
                      transform: `scale(${fullscreenZoom}) translate(${fullscreenPan.x}px, ${fullscreenPan.y}px)`,
                      transition: fullscreenZoom === 1 ? 'transform 0.3s ease' : 'none'
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

          {/* Thumbnails como slider horizontal abajo SOLO si hay más de 1 imagen */}
          {desktopMediaItems.length > 1 && (
            <div className="p-4 xl:p-6" onClick={(e) => e.stopPropagation()}>
              {/* Desktop: thumbnails verticales a la derecha */}
              <div className="hidden xl:block absolute right-4 top-1/2 transform -translate-y-1/2 w-24">
                <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
                  {desktopMediaItems.map((item, i) => (
                    <button
                      key={`desktop-thumb-${i}`}
                      type="button"
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        i === mediaOverlayIndex ? "border-white" : "border-gray-600 hover:border-gray-400"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setMediaOverlayIndex(i);
                        setFullscreenZoom(1);
                        setFullscreenPan({ x: 0, y: 0 });
                      }}
                      aria-label={`Vista ${i + 1}`}
                    >
                      {item.type === "video" ? (
                        <div className="relative w-full h-full">
                          <video src={item.url} className="w-full h-full object-contain" muted preload="metadata" />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                        </div>
                      ) : (
                        <img src={item.url} alt={`Miniatura ${i + 1}`} className="w-full h-full object-contain" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Móvil/Tablet: slider horizontal abajo */}
              <div className="xl:hidden">
                <div 
                  className="flex gap-3 overflow-x-auto pb-2 px-2 scrollbar-hide" 
                  style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}
                >
                  {desktopMediaItems.map((item, i) => (
                    <button
                      key={`mobile-thumb-${i}`}
                      type="button"
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        i === mediaOverlayIndex ? "border-white border-opacity-100" : "border-gray-600 border-opacity-50"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setMediaOverlayIndex(i);
                        setFullscreenZoom(1);
                        setFullscreenPan({ x: 0, y: 0 });
                      }}
                      aria-label={`Vista ${i + 1}`}
                    >
                      {item.type === "video" ? (
                        <div className="relative w-full h-full">
                          <video src={item.url} className="w-full h-full object-contain" muted preload="metadata" />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                        </div>
                      ) : (
                        <img src={item.url} alt={`Miniatura ${i + 1}`} className="w-full h-full object-contain" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

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
        <div className="fixed inset-0 bg-black/95 z-[9999] flex flex-col" onClick={cerrarImagenModal}>
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
                transform: `scale(${modalZoom || 1}) translate(${modalPan?.x || 0}px, ${modalPan?.y || 0}px)`,
                transition: (modalZoom || 1) === 1 ? 'transform 0.3s ease' : 'none'
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
                style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}
              >
                {imagenesModal.map((img, index) => (
                  <button
                    key={index}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      index === imagenActualIndex ? "border-white border-opacity-100" : "border-gray-600 border-opacity-50"
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

      {/* Productos relacionados */}
      {producto && (
        <div className="bg-gray-50 py-6">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Artículos similares que pueden enviarse rápidamente
            </h2>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {/* Aquí irían los productos relacionados */}
              <div className="flex-shrink-0 w-48 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                <div className="aspect-square bg-gray-50 rounded-t-lg"></div>
                <div className="p-3">
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                    Producto relacionado
                  </h3>
                  <div className="text-lg font-bold text-gray-900">
                    RD$ 1,500
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
}

export default VistaProducto;
