import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaTimes,
  FaTrash,
  FaShareSquare,
  FaChevronDown,
  FaVideo,
} from "react-icons/fa";
import { useProduct } from "../hooks/useProducts";
import { useCarrito } from "../context/CarritoContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import ModalLoginAlert from "../components/ModalLoginAlert";
import { useAuthModal } from "../context/AuthModalContext";
import BotonCardnet from "../components/BotonCardnet";
import useDeviceDetection from "../hooks/useDeviceDetection";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  runTransaction,
  where,
  getDocs,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { recordProduct } from "../lib/history";
import { uploadFileFast } from "../utils/uploadFast";
import { fixBucket } from "../utils/imageUtils";

// Components necesarios
import VisualVariantSelector from "../components/VisualVariantSelector";
import ToastNotification from "../components/ToastNotification";
const VP_DEBUG = false;
import ProductosRelacionados from "../components/ProductosRelacionados";

// Componentes de reseñas estilo Amazon
import ReviewsSummary from "../components/reviews/ReviewsSummary";
import ReviewCard from "../components/reviews/ReviewCard";
import ReviewMediaModal from "../components/reviews/ReviewMediaModal";
import WriteReviewModal from "../components/reviews/WriteReviewModal";

// Sistema simple directo

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

// Componente de sección colapsable con animación suave y mejor diseño
function CollapsibleSection({ title, children, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentRef = useRef(null);

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/30 dark:hover:from-gray-700/50 dark:hover:to-gray-600/30 transition-all duration-300 group rounded-lg"
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-1.5 h-6 rounded-full bg-gradient-to-b transition-all duration-300 ${
              isOpen
                ? "from-blue-500 to-blue-600 shadow-lg shadow-blue-500/50"
                : "from-gray-400 to-gray-500 group-hover:from-blue-500 group-hover:to-blue-600"
            }`}
          ></div>
          <h3
            className={`text-sm font-bold transition-all duration-300 ${
              isOpen
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400"
            }`}
          >
            {title}
          </h3>
        </div>
        <div
          className={`flex items-center gap-2 transition-all duration-300 ${
            isOpen
              ? "text-blue-600 dark:text-blue-400"
              : "text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"
          }`}
        >
          <svg
            className={`w-5 h-5 transform transition-all duration-500 ease-out ${
              isOpen ? "rotate-180 scale-110" : "rotate-0 scale-100"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>
      <div
        ref={contentRef}
        className={`transition-all duration-500 ease-out overflow-hidden ${
          isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-5 pb-5 pt-2">{children}</div>
      </div>
    </div>
  );
}

// Componente "Acerca de este artículo" con botón "Ver más" responsive e inteligente
function AcercaDeEsteArticulo({ producto }) {
  const [mostrarTodo, setMostrarTodo] = useState(false);

  // Límites inteligentes basados en longitud de texto
  const MAX_CARACTERES_TOTAL = 500; // Máximo de caracteres a mostrar inicialmente
  const MIN_ITEMS = 3; // Mínimo de items a mostrar siempre
  const MAX_ITEMS = 8; // Máximo de items a mostrar sin importar longitud

  const acercaItems = [];

  // Agregar items del array acerca
  if (Array.isArray(producto.acerca)) {
    acercaItems.push(...producto.acerca.filter((item) => item && item.trim()));
  }

  // Agregar información IMPORTANTE del producto automáticamente
  if (producto.empresa || producto.marca) {
    acercaItems.push(`Marca: ${producto.empresa || producto.marca}`);
  }
  if (producto.modelo) {
    acercaItems.push(`Modelo: ${producto.modelo}`);
  }
  if (producto.colorPrincipal) {
    acercaItems.push(`Color: ${producto.colorPrincipal}`);
  }
  if (producto.material) {
    acercaItems.push(`Material: ${producto.material}`);
  }
  if (producto.peso) {
    acercaItems.push(`Peso: ${producto.peso}`);
  }
  if (producto.dimensiones) {
    acercaItems.push(`Dimensiones: ${producto.dimensiones}`);
  }
  if (producto.conectividad) {
    acercaItems.push(`Conectividad: ${producto.conectividad}`);
  }
  if (producto.garantia) {
    acercaItems.push(`Garantía: ${producto.garantia}`);
  }
  if (producto.estado) {
    acercaItems.push(`Estado: ${producto.estado}`);
  }

  if (acercaItems.length === 0) return null;

  // LÓGICA INTELIGENTE: Determinar cuántos items mostrar basándose en longitud
  const calcularItemsAMostrar = () => {
    let caracteresAcumulados = 0;
    let itemsAMostrar = 0;

    for (let i = 0; i < acercaItems.length; i++) {
      const longitudItem = acercaItems[i].length;
      caracteresAcumulados += longitudItem;

      // Si aún no alcanzamos el límite de caracteres Y no hemos superado MAX_ITEMS
      if (
        caracteresAcumulados <= MAX_CARACTERES_TOTAL ||
        itemsAMostrar < MIN_ITEMS
      ) {
        itemsAMostrar++;
      } else {
        break; // Ya alcanzamos el límite
      }

      // No mostrar más de MAX_ITEMS aunque sean cortos
      if (itemsAMostrar >= MAX_ITEMS) {
        break;
      }
    }

    return Math.max(itemsAMostrar, MIN_ITEMS); // Mínimo MIN_ITEMS siempre
  };

  const itemsIniciales = calcularItemsAMostrar();
  const hayMasItems = acercaItems.length > itemsIniciales;
  const itemsVisibles = mostrarTodo
    ? acercaItems
    : acercaItems.slice(0, itemsIniciales);

  return (
    <div className="space-y-4 xl:order-4 order-4 -mt-2">
      <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-4 flex items-center gap-2">
        <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
        Acerca de este artículo
      </h3>

      {/* Lista de items - En desktop muestra todo, en móvil/tablet controla con estado */}
      <ul className="space-y-3">
        {/* Desktop: mostrar todo siempre */}
        <div className="hidden xl:block">
          {acercaItems.map((detalle, i) => (
            <li
              key={i}
              className="flex items-start gap-3 text-sm md:text-base xl:text-sm leading-relaxed group hover:translate-x-1 transition-all duration-200 mb-3"
            >
              <div className="w-2 h-2 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 mt-1.5 flex-shrink-0 shadow-sm group-hover:scale-125 group-hover:shadow-md transition-all duration-200" />
              <span className="flex-1 text-gray-800 dark:text-gray-200 font-medium group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-200">
                {detalle}
              </span>
            </li>
          ))}
        </div>

        {/* Móvil/Tablet: mostrar con control "Ver más" */}
        <div className="xl:hidden">
          {itemsVisibles.map((detalle, i) => (
            <li
              key={i}
              className="flex items-start gap-3 text-sm md:text-base xl:text-sm leading-relaxed group hover:translate-x-1 transition-all duration-200 mb-3"
            >
              <div className="w-2 h-2 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 mt-1.5 flex-shrink-0 shadow-sm group-hover:scale-125 group-hover:shadow-md transition-all duration-200" />
              <span className="flex-1 text-gray-800 dark:text-gray-200 font-medium group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-200">
                {detalle}
              </span>
            </li>
          ))}
        </div>
      </ul>

      {/* Botón "Ver más" solo en móvil/tablet y solo si hay más items */}
      {hayMasItems && (
        <button
          onClick={() => setMostrarTodo(!mostrarTodo)}
          className="xl:hidden w-full text-center text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 py-2 px-4 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 transition-all duration-200 flex items-center justify-center gap-2 group"
        >
          <span>
            {mostrarTodo
              ? "Ver menos"
              : `Ver más (${acercaItems.length - itemsIniciales} más)`}
          </span>
          <svg
            className={`w-4 h-4 transition-transform duration-300 ${
              mostrarTodo ? "rotate-180" : "rotate-0"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

// Componente de información del producto
function ProductInformationSection({ producto, allVariantes }) {
  // UNIFICAR características en arrays organizados
  const caracteristicas = [];
  const detalles = [];
  const adicionales = [];

  // CARACTERÍSTICAS Y ESPECIFICACIONES (columna izquierda)
  // 1. Marca / Empresa
  if (producto.empresa || producto.marca) {
    caracteristicas.push({
      label: "Marca",
      value: producto.empresa || producto.marca,
    });
  }

  // 2. Modelo
  if (producto.modelo) {
    caracteristicas.push({ label: "Modelo", value: producto.modelo });
  }

  // 3. Color Principal
  if (producto.colorPrincipal) {
    caracteristicas.push({ label: "Color", value: producto.colorPrincipal });
  } else if (allVariantes && allVariantes.length > 0) {
    const variantColors = allVariantes
      .filter((v) => v.color)
      .map((v) => v.color)
      .join(", ");
    if (variantColors) {
      caracteristicas.push({ label: "Color", value: variantColors });
    }
  }

  // 4. Material
  if (producto.material) {
    caracteristicas.push({ label: "Material", value: producto.material });
  }

  // 5. Peso del producto
  if (producto.peso) {
    caracteristicas.push({ label: "Peso del producto", value: producto.peso });
  }

  // 6. Dimensiones
  if (producto.dimensiones) {
    caracteristicas.push({ label: "Dimensiones", value: producto.dimensiones });
  }

  // 7. Conectividad
  if (producto.conectividad) {
    caracteristicas.push({
      label: "Interfaz de hardware",
      value: producto.conectividad,
    });
  }

  // 8. Fuente de Alimentación
  if (producto.fuenteAlimentacion) {
    caracteristicas.push({
      label: "Fuente de alimentación",
      value: producto.fuenteAlimentacion,
    });
  }

  // Agregar TODOS los campos de caracteristicasAdicionales
  if (producto.caracteristicasAdicionales) {
    const carac = producto.caracteristicasAdicionales;

    // Iterar sobre TODOS los campos y agregarlos
    Object.keys(carac).forEach((key) => {
      const value = carac[key];
      if (value && String(value).trim()) {
        // Convertir el key snake_case o camelCase a texto legible
        const label = key
          .split("_") // Separar por guiones bajos
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalizar cada palabra
          .join(" ") // Unir con espacios
          .replace(/([A-Z])/g, " $1") // Agregar espacio antes de mayúsculas (para camelCase)
          .replace(/\s+/g, " ") // Limpiar espacios múltiples
          .trim();

        const displayValue = Array.isArray(value)
          ? value.join(", ")
          : String(value);
        caracteristicas.push({ label, value: displayValue });
      }
    });
  }

  // DETALLES DEL PRODUCTO (columna derecha)
  // 1. Fabricante
  if (producto.fabricante) {
    detalles.push({ label: "Fabricante", value: producto.fabricante });
  } else if (producto.empresa || producto.marca) {
    detalles.push({
      label: "Fabricante",
      value: producto.empresa || producto.marca,
    });
  }

  // 2. Garantía
  if (producto.garantia) {
    detalles.push({ label: "Garantía", value: producto.garantia });
  }

  // 3. País de Fabricación
  if (producto.paisFabricacion) {
    detalles.push({
      label: "País de fabricación",
      value: producto.paisFabricacion,
    });
  }

  // 4. Estado
  if (producto.estado) {
    detalles.push({ label: "Estado", value: producto.estado });
  }

  // 5. Fecha de Publicación
  if (producto.fechaPublicacion) {
    const fecha = new Date(producto.fechaPublicacion);
    const fechaFormateada = fecha.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    detalles.push({ label: "Fecha de publicación", value: fechaFormateada });
  }

  // Estado para secciones colapsables
  const [openSections, setOpenSections] = React.useState({
    caracteristicas: true,
    detalles: true,
    adicionales: true,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Si no hay ningún dato, no mostrar la sección
  const hasData =
    caracteristicas.length > 0 || detalles.length > 0 || adicionales.length > 0;
  if (!hasData) return null;

  return (
    <section className="w-full mt-8 mb-8 px-4 sm:px-6">
      <div className="max-w-[1200px] mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Información del producto
        </h2>

        <div className="space-y-6">
          {/* Detalles del producto */}
          {detalles.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <button
                onClick={() => toggleSection("detalles")}
                className="w-full flex items-center justify-between py-2 text-left"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Detalles del producto
                </h3>
                <svg
                  className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
                    openSections.detalles ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {openSections.detalles && (
                <div className="mt-4 space-y-2">
                  {detalles.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-start gap-4 py-2"
                    >
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[140px]">
                        {item.label}
                      </span>
                      <span className="text-sm text-gray-900 dark:text-gray-200 text-right flex-1">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Características y especificaciones */}
          {caracteristicas.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <button
                onClick={() => toggleSection("caracteristicas")}
                className="w-full flex items-center justify-between py-2 text-left"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Características y especificaciones
                </h3>
                <svg
                  className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
                    openSections.caracteristicas ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {openSections.caracteristicas && (
                <div className="mt-4 space-y-2">
                  {caracteristicas.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-start gap-4 py-2"
                    >
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[140px]">
                        {item.label}
                      </span>
                      <span className="text-sm text-gray-900 dark:text-gray-200 text-right flex-1">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Detalles adicionales */}
          {adicionales.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <button
                onClick={() => toggleSection("adicionales")}
                className="w-full flex items-center justify-between py-2 text-left"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Detalles adicionales
                </h3>
                <svg
                  className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
                    openSections.adicionales ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {openSections.adicionales && (
                <div className="mt-4 space-y-2">
                  {adicionales.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-start gap-4 py-2"
                    >
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[140px]">
                        {item.label}
                      </span>
                      <span className="text-sm text-gray-900 dark:text-gray-200 text-right flex-1">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function VistaProducto() {
  const VP_DEBUG = false; // Toggle logs for debugging
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
  // Índice de thumbnail en HOVER (solo desktop). No cambia la selección.
  const [hoverThumbIndex, setHoverThumbIndex] = useState(null);

  // Enhanced state for new components
  const [isFavorite, setIsFavorite] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState(true);
  const [cartQuantity, setCartQuantity] = useState(0);
  const [modalAlertaAbierto, setModalAlertaAbierto] = useState(false);
  const [tiendaNombreReal, setTiendaNombreReal] = useState(null);
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
  const [fullscreenZoomMode, setFullscreenZoomMode] = useState(false); // Modo zoom con mouse

  // Estados para zoom en modal de imagen
  const [modalZoom, setModalZoom] = useState(1);
  const [modalPan, setModalPan] = useState({ x: 0, y: 0 });
  const [modalZoomMode, setModalZoomMode] = useState(false); // Modo zoom con mouse

  // Estados para modal de "Más información del producto" - Imágenes grandes
  const [productInfoModalOpen, setProductInfoModalOpen] = useState(false);
  const [productInfoImageIndex, setProductInfoImageIndex] = useState(0);
  const [productInfoZoom, setProductInfoZoom] = useState(1);
  const [productInfoPan, setProductInfoPan] = useState({ x: 50, y: 50 });
  const [productInfoZoomMode, setProductInfoZoomMode] = useState(false); // Modo zoom con mouse

  // Ref para medir altura de imagen principal
  const mainImageRef = useRef(null);

  // refs/estado para swipe en modal
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);

  // Estado para hover en galería de miniaturas
  const [thumbnailsHover, setThumbnailsHover] = useState(false);
  const thumbnailsRef = useRef(null);

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

  const reviewsRef = useRef(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState(null);
  const [reviewOrder, setReviewOrder] = useState("recent");
  const [reviewStarsFilter, setReviewStarsFilter] = useState(null);
  const [reviewHasMedia, setReviewHasMedia] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [newMediaFiles, setNewMediaFiles] = useState([]);
  const [submitBusy, setSubmitBusy] = useState(false);
  const [reviewOverlayOpen, setReviewOverlayOpen] = useState(false);
  const [reviewOverlayItems, setReviewOverlayItems] = useState([]);
  const [reviewOverlayIndex, setReviewOverlayIndex] = useState(0);

  // Inline ratings popover + delete state
  const [ratingPopoverOpen, setRatingPopoverOpen] = useState(false);
  const ratingPopoverRef = useRef(null);
  const ratingPopoverCardRef = useRef(null);
  const [deleteBusyId, setDeleteBusyId] = useState(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetReview, setDeleteTargetReview] = useState(null);

  // Estados para nuevo sistema de reseñas Amazon
  const [reviewMediaModalOpen, setReviewMediaModalOpen] = useState(false);
  const [selectedReviewIndex, setSelectedReviewIndex] = useState(0);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [reviewFilters, setReviewFilters] = useState({
    stars: null,
    hasMedia: false,
    verifiedOnly: false,
    sortBy: "newest",
  });
  const [writeReviewOpen, setWriteReviewOpen] = useState(false);
  const [photosGridOpen, setPhotosGridOpen] = useState(false);
  const { isMobile, isTablet } = useDeviceDetection();
  const isTouch = isMobile || isTablet;

  const closeDeleteConfirm = () => {
    if (deleteBusyId) return;
    setDeleteConfirmOpen(false);
    setDeleteTargetReview(null);
  };

  useEffect(() => {
    if (!ratingPopoverOpen) return;
    const onDocClick = (e) => {
      if (
        ratingPopoverRef.current &&
        ratingPopoverCardRef.current &&
        !ratingPopoverRef.current.contains(e.target) &&
        !ratingPopoverCardRef.current.contains(e.target)
      ) {
        setRatingPopoverOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") setRatingPopoverOpen(false);
    };
    document.addEventListener("pointerdown", onDocClick);
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDocClick);
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [ratingPopoverOpen]);

  // Sistema de notificaciones
  const [notifications, setNotifications] = useState([]);

  const showNotification = (message, type = "info", title = null) => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { id, message, type, title }]);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Derived values - available throughout component
  const allVariantes = Array.isArray(producto?.variantes)
    ? producto.variantes
    : [];
  const variantesConColor = allVariantes.filter(
    (v) => v && typeof v.color === "string" && v.color.trim(),
  );

  const computedBreakdown = (() => {
    const base = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      const rr = Math.max(1, Math.min(5, Math.round(Number(r?.rating) || 0)));
      base[rr] = (base[rr] || 0) + 1;
    });
    return base;
  })();
  const ratingCount = Number(producto?.ratingCount) || reviews.length || 0;
  const ratingAverage = Number(
    producto?.ratingAverage ||
      (reviews.length
        ? (
            reviews.reduce((s, r) => s + (Number(r?.rating) || 0), 0) /
            reviews.length
          ).toFixed(2)
        : 0),
  );
  const ratingBreakdown = producto?.ratingBreakdown || computedBreakdown;

  const filteredReviews = reviews.filter((r) => {
    const starOk = reviewStarsFilter
      ? Math.round(Number(r?.rating) || 0) === reviewStarsFilter
      : true;
    const mediaOk = reviewHasMedia
      ? (Array.isArray(r?.images) && r.images.length > 0) ||
        (Array.isArray(r?.videos) && r.videos.length > 0)
      : true;
    return starOk && mediaOk;
  });
  const orderedReviews = [...filteredReviews].sort((a, b) => {
    if (reviewOrder === "rating") {
      return (Number(b?.rating) || 0) - (Number(a?.rating) || 0);
    }
    const ta = a?.createdAt?.seconds || 0;
    const tb = b?.createdAt?.seconds || 0;
    return tb - ta;
  });

  // Helper functions for media processing - available throughout component
  // ARREGLADO: Solo detectar videos REALES (URLs válidas con extensión de video)
  const getGalleryVideos = () => {
    if (!producto) return [];

    const urls = [];
    const seen = new Set();

    // Extensiones de video válidas
    const videoExtensions = [
      "mp4",
      "mov",
      "webm",
      "avi",
      "mkv",
      "m4v",
      "ogg",
      "ogv",
    ];

    // Helper para validar que es realmente un video
    const isValidVideoUrl = (url) => {
      if (!url || typeof url !== "string") return false;
      const trimmed = url.trim();
      if (!trimmed) return false;
      // Debe tener una extensión de video
      const ext = trimmed.split(".").pop()?.split("?")[0]?.toLowerCase() || "";
      return videoExtensions.includes(ext);
    };

    const pushUrl = (raw) => {
      if (!raw) return;
      const str = String(raw).trim();
      if (!str) return;
      // VALIDACIÓN ESTRICTA: Solo agregar si es realmente un video
      if (!isValidVideoUrl(str)) return;
      const key = str.split("?")[0].split("#")[0].toLowerCase();
      if (!key || seen.has(key)) return;
      seen.add(key);
      urls.push(str);
    };

    // NUEVO FORMATO: videos del producto en videoUrls (array de strings u objetos)
    if (Array.isArray(producto.videoUrls)) {
      producto.videoUrls.forEach((item) => {
        const url = typeof item === "string" ? item : item?.url;
        pushUrl(url);
      });
    }

    // VIDEOS de la variante activa (si existe)
    if (varianteSeleccionada >= 0 && variantesConColor[varianteSeleccionada]) {
      const variante = variantesConColor[varianteSeleccionada];

      if (Array.isArray(variante?.videoUrls)) {
        variante.videoUrls.forEach((item) => {
          const url = typeof item === "string" ? item : item?.url;
          pushUrl(url);
        });
      }
    }

    return urls;
  }; // ALL useEffect hooks MUST be called consistently - BEFORE any early returns
  // Reset variant and gallery state when product id changes to avoid mixing between products
  useEffect(() => {
    setVarianteSeleccionada(-1); // seleccionar PRODUCTO PRINCIPAL por defecto
    setImagenActualIndex(0);
    setDesktopMediaIndex(0);
    setHoverThumbIndex(null);
  }, [id]);
  // Mantener selección por defecto en "principal" (-1) a menos que el usuario cambie
  // No forzar selección de variante aquí para evitar sobreescribir la opción principal
  useEffect(() => {}, [varianteSeleccionada]);

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

  // Registrar vista del producto en historial local (recentProducts)
  useEffect(() => {
    try {
      if (!id) return;
      const key = "recentProducts";
      const prev = JSON.parse(localStorage.getItem(key) || "[]");
      const next = [id, ...prev.filter((x) => x !== id)].slice(0, 20);
      localStorage.setItem(key, JSON.stringify(next));
    } catch {}
  }, [id]);

  // Registrar en historial unificado: producto visto (+ categoría si existe)
  useEffect(() => {
    try {
      if (!producto?.id) return; // esperar a tener el id real
      const cat =
        (producto?.categoria && String(producto.categoria)) ||
        (producto?.categoriaId && String(producto.categoriaId)) ||
        undefined;
      recordProduct(producto.id, cat);
    } catch {}
  }, [producto?.id, producto?.categoria, producto?.categoriaId]);

  // Intentar registrar última categoría vista basada en el producto
  useEffect(() => {
    try {
      const rutaCat =
        (producto?.categoria && String(producto.categoria)) ||
        (producto?.categoriaId && String(producto.categoriaId)) ||
        "";
      if (rutaCat) {
        localStorage.setItem("ultimaCategoriaVista", rutaCat);
      }
    } catch {}
  }, [producto?.categoria, producto?.categoriaId]);

  useEffect(() => {
    if (!id) return;
    setReviewsLoading(true);
    const col = collection(db, "productos", id, "reviews");
    const q = query(col, orderBy("createdAt", "desc"), limit(50));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setReviews(arr);
        setReviewsLoading(false);
      },
      () => {
        setReviewsError("Error cargando reseñas");
        setReviewsLoading(false);
      },
    );
    return () => unsub && unsub();
  }, [id]);

  const checkVerifiedPurchase = async (uid, productId) => {
    try {
      const q = query(
        collection(db, "orders"),
        where("userId", "==", uid),
        orderBy("fecha", "desc"),
        limit(20),
      );
      const snap = await getDocs(q);
      for (const ds of snap.docs) {
        const items = ds.data()?.productos || [];
        if (items.some((p) => p?.id === productId)) return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleMediaFilesChange = (e) => {
    const files = Array.from(e.target.files || []).slice(0, 10);
    setNewMediaFiles(files);
  };

  const publishReview = async (payloadFromModal) => {
    if (!usuario) {
      try {
        abrirModal();
      } catch {}
      return;
    }
    if (!id) return;

    // Compatibilidad: soporta payload nuevo del WriteReviewModal o fallback al estado legacy
    const data = payloadFromModal || {
      rating: newRating,
      title: "",
      comment: newComment,
      recommend: null,
      files: newMediaFiles,
    };
    const ratingVal = Number(data.rating) || 0;
    const commentVal = (data.comment || "").trim();
    const titleVal = (data.title || "").trim();
    const filesList = Array.isArray(data.files) ? data.files : [];

    if (!(ratingVal > 0) || !commentVal) {
      showNotification("Calificación y comentario son obligatorios", "error");
      return;
    }
    setSubmitBusy(true);
    try {
      let images = [];
      let videos = [];
      for (const file of filesList) {
        const res = await uploadFileFast(file, id);
        if (res?.type === "image") images.push(res.url);
        else if (res?.type === "video") videos.push(res.url);
      }
      const verified = await checkVerifiedPurchase(usuario.uid, id);
      const payload = {
        userId: usuario.uid,
        userName:
          usuario.displayName || usuario.email?.split("@")[0] || "Usuario",
        userPhoto: usuario.photoURL || null,
        productId: id,
        rating: ratingVal,
        title: titleVal,
        comment: commentVal,
        recommend:
          data.recommend === true || data.recommend === false
            ? data.recommend
            : null,
        images,
        videos,
        verifiedPurchase: !!verified,
        helpfulCount: 0,
        helpfulBy: [],
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, "productos", id, "reviews"), payload);
      // La reseña YA está guardada. Si la actualización del agregado falla,
      // NO lo consideramos un error del publicar (se reconciliará después).
      try {
        await runTransaction(db, async (tx) => {
          const pRef = doc(db, "productos", id);
          const snap = await tx.get(pRef);
          const pdata = snap.exists() ? snap.data() : {};
          const prevCount = Number(pdata?.ratingCount) || 0;
          const prevSum = Number(pdata?.ratingSum) || 0;
          const prevBreak = pdata?.ratingBreakdown || {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
          };
          const r = Math.max(1, Math.min(5, Math.round(ratingVal)));
          const nextBreak = { ...prevBreak, [r]: (prevBreak[r] || 0) + 1 };
          const nextCount = prevCount + 1;
          const nextSum = prevSum + ratingVal;
          const nextAvg =
            nextCount > 0 ? Number((nextSum / nextCount).toFixed(2)) : 0;
          tx.update(pRef, {
            ratingCount: nextCount,
            ratingAverage: nextAvg,
            ratingSum: nextSum,
            ratingBreakdown: nextBreak,
          });
        });
      } catch (aggErr) {
        console.warn(
          "Reseña publicada pero no se pudo actualizar el agregado:",
          aggErr,
        );
      }
      setNewRating(0);
      setNewComment("");
      setNewMediaFiles([]);
      setWriteReviewOpen(false);
      showNotification("Tu opinión fue publicada", "success");
    } catch (e) {
      showNotification("No se pudo publicar la opinión", "error");
      throw e;
    } finally {
      setSubmitBusy(false);
    }
  };

  const handleDeleteReview = async (rev) => {
    if (!rev) return;
    if (!usuario || usuario.uid !== rev?.userId) {
      showNotification("No autorizado", "error");
      return;
    }
    if (!id || !rev?.id) return;
    setDeleteBusyId(rev.id);
    try {
      await runTransaction(db, async (tx) => {
        const pRef = doc(db, "productos", id);
        const rRef = doc(db, "productos", id, "reviews", rev.id);
        const pSnap = await tx.get(pRef);

        // Si el producto no existe, no hacer nada
        if (!pSnap.exists()) {
          throw new Error("Producto no encontrado");
        }

        const pData = pSnap.data();
        const prevCount = Number(pData?.ratingCount) || 0;
        const prevSum = Number(pData?.ratingSum) || 0;
        const prevBreak = pData?.ratingBreakdown || {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
        };
        const r = Math.max(
          1,
          Math.min(5, Math.round(Number(rev?.rating) || 0)),
        );
        const nextBreak = {
          ...prevBreak,
          [r]: Math.max((prevBreak[r] || 0) - 1, 0),
        };
        const nextCount = Math.max(prevCount - 1, 0);
        const nextSum = prevSum - Number(rev?.rating || 0);
        const nextAvg =
          nextCount > 0 ? Number((nextSum / nextCount).toFixed(2)) : 0;

        // Primero borrar la reseña
        tx.delete(rRef);

        // Luego actualizar SOLO los campos de rating, NUNCA usar set()
        tx.update(pRef, {
          ratingCount: nextCount,
          ratingAverage: nextAvg,
          ratingSum: nextSum,
          ratingBreakdown: nextBreak,
        });
      });
      showNotification("Tu opinión fue eliminada", "success");
    } catch (e) {
      console.error("Error en transacción principal:", e);
      try {
        // Fallback más seguro: solo borrar la reseña y actualizar ratings
        const rRef = doc(db, "productos", id, "reviews", rev.id);
        await deleteDoc(rRef);

        // Actualizar ratings de forma segura
        await runTransaction(db, async (tx) => {
          const pRef = doc(db, "productos", id);
          const pSnap = await tx.get(pRef);

          if (!pSnap.exists()) {
            throw new Error("Producto no encontrado en fallback");
          }

          const pData = pSnap.data();
          const prevCount = Number(pData?.ratingCount) || 0;
          const prevSum = Number(pData?.ratingSum) || 0;
          const prevBreak = pData?.ratingBreakdown || {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
          };
          const r = Math.max(
            1,
            Math.min(5, Math.round(Number(rev?.rating) || 0)),
          );
          const nextBreak = {
            ...prevBreak,
            [r]: Math.max((prevBreak[r] || 0) - 1, 0),
          };
          const nextCount = Math.max(prevCount - 1, 0);
          const nextSum = prevSum - Number(rev?.rating || 0);
          const nextAvg =
            nextCount > 0 ? Number((nextSum / nextCount).toFixed(2)) : 0;

          // SOLO update(), NUNCA set()
          tx.update(pRef, {
            ratingCount: nextCount,
            ratingAverage: nextAvg,
            ratingSum: nextSum,
            ratingBreakdown: nextBreak,
          });
        });
        showNotification("Tu opinión fue eliminada", "success");
      } catch (e2) {
        console.error("Error en fallback:", e2);
        showNotification("No se pudo eliminar la opinión", "error");
      }
    } finally {
      setDeleteBusyId(null);
      setDeleteConfirmOpen(false);
      setDeleteTargetReview(null);
    }
  };

  const openDeleteConfirm = (rev) => {
    if (!rev?.id) return;
    if (!usuario || usuario.uid !== rev?.userId) {
      showNotification("No autorizado", "error");
      return;
    }
    if (deleteBusyId) return;
    setDeleteTargetReview(rev);
    setDeleteConfirmOpen(true);
  };

  const handleImageClick = (review, mediaIndex) => {
    const reviewIndex = reviews.findIndex((r) => r.id === review.id);
    setSelectedReviewIndex(reviewIndex);
    setSelectedMediaIndex(mediaIndex);
    setReviewMediaModalOpen(true);
  };

  const closeReviewMediaModal = () => {
    setReviewMediaModalOpen(false);
    setSelectedReviewIndex(0);
    setSelectedMediaIndex(0);
  };

  const scrollToReviews = () => {
    reviewsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-scroll a reviews si la URL tiene hash #reviews (ej. desde "Mis Opiniones")
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash !== "#reviews") return;
    if (reviewsLoading) return;
    const t = setTimeout(() => {
      reviewsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 150);
    return () => clearTimeout(t);
  }, [reviewsLoading]);

  // Filtrar y ordenar reseñas según filtros
  const getFilteredAndSortedReviews = () => {
    let filtered = [...reviews];

    // Aplicar filtros
    if (reviewFilters.stars) {
      filtered = filtered.filter(
        (review) => review.rating === reviewFilters.stars,
      );
    }

    if (reviewFilters.hasMedia) {
      filtered = filtered.filter(
        (review) => review.images?.length > 0 || review.videos?.length > 0,
      );
    }

    if (reviewFilters.verifiedOnly) {
      filtered = filtered.filter((review) => review.verifiedPurchase);
    }

    // Aplicar ordenamiento
    switch (reviewFilters.sortBy) {
      case "oldest":
        filtered.sort((a, b) => {
          const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return dateA - dateB;
        });
        break;
      case "highest":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "lowest":
        filtered.sort((a, b) => a.rating - b.rating);
        break;
      case "newest":
      default:
        filtered.sort((a, b) => {
          const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return dateB - dateA;
        });
        break;
    }

    return filtered;
  };

  const openWriteReview = () => {
    if (!usuario) {
      setModalAbierto(true);
      return;
    }
    setWriteReviewOpen(true);
  };

  const closeWriteReview = () => {
    if (submitBusy) return;
    setWriteReviewOpen(false);
  };

  // Todas las fotos de reseñas (para fila horizontal y modal de grid)
  const reviewPhotoItems = useMemo(() => {
    const items = [];
    for (const r of reviews || []) {
      if (Array.isArray(r?.images)) {
        r.images.forEach((url, idx) =>
          items.push({ review: r, url, index: idx }),
        );
      }
    }
    return items;
  }, [reviews]);

  // Update cart quantity when carrito changes
  useEffect(() => {
    if (producto) {
      const varianteActivaUI = variantesConColor[varianteSeleccionada] || null;

      const currentInCart = carrito.find(
        (item) =>
          item.id === producto.id &&
          (!varianteActivaUI ||
            item.variante?.color === varianteActivaUI?.color),
      );
      setCartQuantity(currentInCart?.cantidad || 0);
    }
  }, [carrito, producto, varianteSeleccionada, variantesConColor]);

  // Cargar nombre REAL de la tienda desde Firestore
  useEffect(() => {
    const cargarNombreTienda = async () => {
      // PRIORIDAD 1: Usar storeName si existe (productos nuevos)
      if (producto?.storeName) {
        setTiendaNombreReal(producto.storeName);
        return;
      }

      // PRIORIDAD 2: Usar tienda_nombre si existe (productos legacy)
      if (producto?.tienda_nombre) {
        setTiendaNombreReal(producto.tienda_nombre);
        return;
      }

      // PRIORIDAD 3: Consultar base de datos si solo tenemos tienda_id (legacy)
      if (producto?.tienda_id) {
        try {
          const tiendaRef = doc(db, "tiendas", producto.tienda_id);
          const tiendaSnap = await getDoc(tiendaRef);
          if (tiendaSnap.exists()) {
            setTiendaNombreReal(tiendaSnap.data().nombre);
          }
        } catch (error) {
          setTiendaNombreReal(null);
        }
      } else {
        setTiendaNombreReal(null);
      }
    };
    cargarNombreTienda();
  }, [
    producto?.storeId,
    producto?.storeName,
    producto?.tienda_id,
    producto?.tienda_nombre,
  ]);

  // Ajustar altura de miniaturas para que coincida con imagen principal
  useEffect(() => {
    const adjustThumbnailHeight = () => {
      const mainImage = mainImageRef.current;
      const thumbnailContainer = document.querySelector(
        ".amazon-thumbs-sidebar",
      );

      if (mainImage && thumbnailContainer) {
        const imageHeight = mainImage.offsetHeight;
        thumbnailContainer.style.height = `${imageHeight}px`;
        thumbnailContainer.style.maxHeight = `${imageHeight}px`;
      }
    };

    // Ajustar cuando la imagen se carga
    const timer = setTimeout(adjustThumbnailHeight, 100);

    // Ajustar cuando cambia el tamaño de ventana
    window.addEventListener("resize", adjustThumbnailHeight);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", adjustThumbnailHeight);
    };
  }, [desktopMediaIndex, producto]);

  // REAL-TIME SYNC: Listen to ProductForm save events for immediate updates
  useEffect(() => {
    if (!id) return;

    const handleProductUpdate = (event) => {
      if (event.detail?.productId === id) {
        // Force immediate re-render when ProductForm saves
        setVarianteSeleccionada((prev) => prev);
        setImagenActualIndex(0);
        setDesktopMediaIndex(0);
      }
    };

    // Listen to custom events from ProductForm
    window.addEventListener("productSaved", handleProductUpdate);
    window.addEventListener("forceProductUpdate", handleProductUpdate);
    window.addEventListener(`productUpdate:${id}`, handleProductUpdate);

    return () => {
      window.removeEventListener("productSaved", handleProductUpdate);
      window.removeEventListener("forceProductUpdate", handleProductUpdate);
      window.removeEventListener(`productUpdate:${id}`, handleProductUpdate);
    };
  }, [id]);

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
              className="mx-auto h-16 w-16 text-blue-400"
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
          <p className="text-lg sm:text-xl font-semibold mb-2 text-blue-600">
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

  // Variables already calculated earlier - using global definitions

  // Enhanced variant processing
  // -1 o null = producto principal seleccionado
  // 0+ = índice de variante seleccionada
  const varianteActivaUI =
    varianteSeleccionada === -1 || varianteSeleccionada === null
      ? null // Producto principal
      : variantesConColor[varianteSeleccionada] || null;
  const varianteActiva = varianteActivaUI; // For compatibility with existing code

  // ARREGLADO: Obtener imagen principal SIEMPRE mostrando la imagen que subí
  const getMainImage = () => {
    // PRIORIDAD 1: Si hay variante seleccionada, usar su imagen
    if (varianteSeleccionada >= 0 && variantesConColor[varianteSeleccionada]) {
      const variante = variantesConColor[varianteSeleccionada];
      const u = variante?.imagenPrincipal?.[0]?.url || variante?.imagen || "";
      return fixBucket(u);
    }

    // PRIORIDAD 2: Imagen principal del producto (la que subí)
    return fixBucket(
      producto?.imagenPrincipal?.[0]?.url || producto?.imagen || "",
    );
  };

  // ARREGLADO: Obtener imágenes de galería - SIN DUPLICADOS
  const getGalleryImages = () => {
    // Helper para normalizar URL y evitar duplicados
    const normalizeUrl = (url) => {
      if (!url || typeof url !== "string") return null;
      try {
        // Quitar query params, hash, decodificar y convertir a minúsculas
        const base = url.split("?")[0].split("#")[0].trim().toLowerCase();
        return decodeURIComponent(base);
      } catch {
        return url.split("?")[0].split("#")[0].trim().toLowerCase();
      }
    };

    // PASO 1: Obtener imagen principal
    const mainImg = getMainImage();
    const mainKey = mainImg ? normalizeUrl(mainImg) : null;

    // PASO 2: Obtener imágenes de galería según variante seleccionada
    let gallerySource = [];

    if (varianteSeleccionada >= 0 && variantesConColor[varianteSeleccionada]) {
      const variante = variantesConColor[varianteSeleccionada];
      gallerySource =
        Array.isArray(variante?.imagenes) && variante.imagenes.length > 0
          ? variante.imagenes
          : Array.isArray(variante?.galeriaImagenes)
            ? variante.galeriaImagenes
            : [];
    } else {
      gallerySource =
        Array.isArray(producto?.imagenes) && producto.imagenes.length > 0
          ? producto.imagenes
          : Array.isArray(producto?.galeriaImagenes)
            ? producto.galeriaImagenes
            : [];
    }

    // PASO 3: Filtrar imágenes de galería (excluir principal, duplicados y videos)
    const seen = new Set();
    if (mainKey) seen.add(mainKey); // Marcar imagen principal como vista

    const galleryImages = [];
    gallerySource.forEach((img) => {
      const imgUrl = typeof img === "string" ? img : img?.url || null;
      if (!imgUrl) return;

      // Excluir videos por tipo explícito
      const type = (img?.type || "").toLowerCase();
      if (type === "video") return;

      // Excluir videos por extensión
      const fixed = fixBucket(imgUrl);
      const ext = fixed.split(".").pop()?.split("?")[0]?.toLowerCase() || "";
      if (["mp4", "mov", "webm", "avi", "mkv", "m4v"].includes(ext)) return;

      // Verificar duplicados
      const key = normalizeUrl(fixed);
      if (!key || seen.has(key)) return;
      seen.add(key);
      galleryImages.push(fixed);
    });

    // PASO 4: Construir resultado final
    // Si hay imagen principal, siempre va primero
    // Las imágenes de galería van después (ya filtradas de duplicados)
    const result = [];
    if (mainImg) {
      result.push(mainImg);
    }

    // Agregar imágenes de galería que NO son la principal
    result.push(...galleryImages);

    return result;
  };

  const getMainVideo = () => {
    if (producto.videoAcercaArticulo?.[0]?.url)
      return producto.videoAcercaArticulo[0].url;
    if (producto.videoUrl) return producto.videoUrl; // Legacy
    return null;
  };

  // SIMPLE: Obtener archivos extras
  const getExtraFiles = () => {
    return (producto?.imagenesExtra || []).slice(0, 3);
  };

  // getGalleryVideos function moved earlier to avoid duplicate declaration

  // All useEffect hooks have been moved above to maintain consistent hook order

  // ========== COMPUTED VALUES FOR MEDIA ==========
  // Build the gallery images array
  const imagenes = getGalleryImages();

  // Get videos from gallery
  const galleryVideosList = getGalleryVideos();

  // Build desktop media items (images + videos)
  const imageItemsMedia = imagenes.map((url) => ({ type: "image", url }));
  const videoItemsMedia = (galleryVideosList || []).map((url) => ({
    type: "video",
    url,
  }));
  const desktopMediaItems = [...imageItemsMedia, ...videoItemsMedia];

  if (VP_DEBUG) {
    console.log("[VistaProducto] media debug", {
      id,
      imagenes,
      galleryVideosList,
      desktopMediaItems,
      varianteSeleccionada,
      variantesConColor,
    });
  }

  // Calculate safe desktop index
  const safeDesktopIndex = Math.max(
    0,
    Math.min(desktopMediaIndex, Math.max(0, desktopMediaItems.length - 1)),
  );

  // Display index (hover has priority over selection on desktop)
  const displayDesktopIndex =
    hoverThumbIndex !== null ? hoverThumbIndex : safeDesktopIndex;

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
        (!variantToUse || item.variante?.color === variantToUse?.color),
    );
    setCartQuantity((currentInCart?.cantidad || 0) + quantity);
  };

  const handleToggleFavorite = (product) => {
    setIsFavorite(!isFavorite);
    // Here you would typically save to localStorage or backend
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
      normalizeColor(item.colorSeleccionado) === colorKey,
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

  // ARREGLADO: Precio que cambia según variante seleccionada
  const precioProducto = (() => {
    // Si hay variante seleccionada, usar su precio
    if (varianteSeleccionada >= 0 && variantesConColor[varianteSeleccionada]) {
      const variante = variantesConColor[varianteSeleccionada];
      const precioVariante = Number(variante?.precio);
      if (Number.isFinite(precioVariante) && precioVariante > 0) {
        return precioVariante;
      }
    }

    // Si no hay variante o no tiene precio, usar precio del producto principal
    return Number(producto?.precio) || 0;
  })();
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

  // imagenes already calculated earlier - using global definition
  // Estados derivados para layout compacto cuando no hay medios ni variantes
  const hasImageGallery = imagenes.length > 0;
  // ARREGLADO: Solo mostrar selector de variantes si hay variantes REALES (no solo el producto principal)
  const hasVariantsUI = Boolean(
    variantesConColor && variantesConColor.length > 0,
  );
  const showLeftColumn = hasImageGallery;
  const isSingleImage = imagenes.length === 1;
  const compactMedia = isSingleImage && !hasVariantsUI;

  // Galería unificada: SOLO IMÁGENES (sin videos)
  const toMediaObj = (u) => {
    return { type: "image", url: u || "" };
  };

  //  FILTRO ESTRICTO: Solo URLs válidas
  const imagenesValidas = imagenes.filter((url) => {
    if (!url) return false;
    if (typeof url !== "string") return false;
    if (url.trim() === "") return false;
    return true;
  });

  const mediaItems = imagenesValidas.map((u) => toMediaObj(u));

  // Dedupe por URL normalizada
  const seenGallery = new Set();
  const dedupedMediaItems = mediaItems.filter((m) => {
    const key = (m.url || "").split("?")[0].split("#")[0].trim().toLowerCase();
    if (!key || seenGallery.has(key)) return false;
    seenGallery.add(key);
    return true;
  });
  // Índice seguro para compatibilidad con estados previos
  const mainIndex = Math.min(
    Math.max(imagenActualIndex, 0),
    Math.max(0, (imagenesValidas.length || 1) - 1),
  );
  // NO mostrar archivos extras ni videos - SOLO IMÁGENES (CON FILTRO)
  const imagenesModal = [...imagenesValidas];
  const hasRowFiles = false;
  const rowFiles = [];

  // Note: desktopMediaItems and displayDesktopIndex are now calculated earlier in the component
  // to avoid ReferenceError in useEffect hooks

  // (debug removido para respetar el orden de hooks y evitar renderizaciones diferentes)

  const siguienteImagen = () => {
    setImagenActualIndex((prev) =>
      prev === imagenesModal.length - 1 ? 0 : prev + 1,
    );
  };

  const anteriorImagen = () => {
    setImagenActualIndex((prev) =>
      prev === 0 ? imagenesModal.length - 1 : prev - 1,
    );
  };

  // Funciones de touch simplificadas - se usan las más completas abajo

  // ---------- Handlers ZOOM (desktop) - ESTILO AMAZON PERFECTO ----------
  const handleMouseEnter = (e) => {
    if (typeof window === "undefined" || window.innerWidth < 1280) return;
    const current =
      (desktopMediaItems && desktopMediaItems[displayDesktopIndex]) || null;
    if (!current || current.type !== "image") return;

    // Establecer la imagen de fondo del zoom
    setZoomBg(current.url);

    // Guardar el rectángulo de la imagen para posicionar el panel
    const imgEl = mainImgRef.current;
    if (imgEl) {
      zoomRectRef.current = imgEl.getBoundingClientRect();
    } else if (imgWrapRef.current) {
      zoomRectRef.current = imgWrapRef.current.getBoundingClientRect();
    }

    // Calcular posición inicial del cursor (en porcentaje)
    const rect = zoomRectRef.current;
    if (rect && e) {
      const x = Math.max(
        0,
        Math.min(100, ((e.clientX - rect.left) / rect.width) * 100),
      );
      const y = Math.max(
        0,
        Math.min(100, ((e.clientY - rect.top) / rect.height) * 100),
      );
      lastPosRef.current = { x, y };
    } else {
      lastPosRef.current = { x: 50, y: 50 };
    }

    setIsZooming(true);

    // Aplicar posición inicial del background
    requestAnimationFrame(() => {
      const el = zoomOverlayRef.current;
      if (el) {
        el.style.backgroundPosition = `${lastPosRef.current.x}% ${lastPosRef.current.y}%`;
      }
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
      Math.min(100, ((e.clientX - rect.left) / rect.width) * 100),
    );
    const y = Math.max(
      0,
      Math.min(100, ((e.clientY - rect.top) / rect.height) * 100),
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
      if (touchDeltaX.current > 0 && desktopMediaIndex > 0) {
        // Swipe derecha - imagen anterior
        setDesktopMediaIndex(desktopMediaIndex - 1);
      } else if (
        touchDeltaX.current < 0 &&
        desktopMediaIndex < desktopMediaItems.length - 1
      ) {
        // Swipe izquierda - imagen siguiente
        setDesktopMediaIndex(desktopMediaIndex + 1);
      }
    }

    touchStartX.current = 0;
    touchDeltaX.current = 0;
  };

  // ---------- PINCH TO ZOOM (vista completa móvil) ----------

  const getDistance = (touch1, touch2) => {
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2),
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

  // --- Funciones de touch para modal de información del producto ---
  const onTouchStartProductInfo = (e) => {
    if (e.touches.length === 2) {
      // Pinch start
      const distance = getDistance(e.touches[0], e.touches[1]);
      setInitialDistance(distance);
      setInitialZoom(productInfoZoom);
    } else if (e.touches.length === 1) {
      // Pan start
      touchStartX.current = e.touches[0].clientX;
      touchDeltaX.current = 0;
    }
  };

  const onTouchMoveProductInfo = (e) => {
    if (e.touches.length === 2) {
      // Pinch zoom
      const distance = getDistance(e.touches[0], e.touches[1]);
      const scale = distance / initialDistance;
      const newZoom = Math.min(Math.max(initialZoom * scale, 1), 4);
      setProductInfoZoom(newZoom);
    } else if (e.touches.length === 1) {
      if (productInfoZoom > 1) {
        // Pan when zoomed
        const deltaX = e.touches[0].clientX - touchStartX.current;
        const deltaY = e.touches[0].clientY - (touchStartX.current || 0);
        setProductInfoPan({ x: deltaX, y: deltaY });
      } else {
        // Track swipe for image navigation when not zoomed
        const deltaX = e.touches[0].clientX - touchStartX.current;
        touchDeltaX.current = deltaX;
      }
    }
  };

  const onTouchEndProductInfo = (e) => {
    if (e.touches.length === 0) {
      // Reset if zoom is too small
      if (productInfoZoom < 1.1) {
        setProductInfoZoom(1);
        setProductInfoPan({ x: 50, y: 50 });
      }

      // Handle swipe navigation
      const swipeThreshold = 50;
      if (
        Math.abs(touchDeltaX.current) > swipeThreshold &&
        productInfoZoom === 1
      ) {
        const extraImages = getExtraFiles();
        if (touchDeltaX.current > 0) {
          // Swipe derecha = anterior
          setProductInfoImageIndex(
            (prev) => (prev - 1 + extraImages.length) % extraImages.length,
          );
        } else {
          // Swipe izquierda = siguiente
          setProductInfoImageIndex((prev) => (prev + 1) % extraImages.length);
        }
        setProductInfoZoom(1);
        setProductInfoPan({ x: 50, y: 50 });
      }

      touchStartX.current = 0;
      touchDeltaX.current = 0;
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
        showNotification(
          "Enlace copiado al portapapeles",
          "success",
          "¡Copiado!",
        );
      }
    } catch (error) {
      // Error silencioso
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
        showNotification("Enlace copiado", "success", "¡Listo!");
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

  // Calcular estilos del panel de zoom - ESTILO AMAZON PROFESIONAL
  const zoomRect = zoomRectRef.current;
  const zoomOverlayStyle = {
    display: isZooming && zoomRect ? "block" : "none",
    backgroundImage: zoomBg ? `url(${zoomBg})` : "none",
    backgroundRepeat: "no-repeat",
  };

  if (zoomRect && typeof window !== "undefined" && window.innerWidth >= 1280) {
    // MISMO TAMAÑO que la imagen principal
    const panelWidth = zoomRect.width;
    const panelHeight = zoomRect.height;

    // Factor de zoom: 2.5x para ver detalles
    const zoomFactor = 2.5;
    const bgWidth = Math.round(panelWidth * zoomFactor);
    const bgHeight = Math.round(panelHeight * zoomFactor);

    // Posicionar a la derecha de la imagen principal
    const leftPosition = zoomRect.right + 16;

    zoomOverlayStyle.position = "fixed";
    zoomOverlayStyle.top = `${zoomRect.top}px`;
    zoomOverlayStyle.left = `${leftPosition}px`;
    zoomOverlayStyle.width = `${panelWidth}px`;
    zoomOverlayStyle.height = `${panelHeight}px`;
    zoomOverlayStyle.backgroundSize = `${bgWidth}px ${bgHeight}px`;
  }

  return (
    <>
      {/* Sin topbar móvil: solo contenido */}
      <main className="min-h-screen bg-white px-4 sm:px-6 pb-16 text-gray-800">
        <section className="w-full flex flex-col gap-8 xl:grid xl:grid-cols-12 xl:gap-6 xl:items-start">
          {/* Columna Izquierda - Galería (6 columnas) CON STICKY COMO AMAZON */}
          {showLeftColumn && (
            <div className="flex flex-col items-start w-full xl:col-span-6 xl:sticky xl:top-4 xl:h-fit">
              {/* Galería estilo eBay - Visible en todos los dispositivos - STICKY en desktop */}
              {desktopMediaItems.length > 0 && (
                <div className="amazon-gallery-layout flex">
                  {/* Wrapper para flechas fijas */}
                  <div className="relative">
                    {/* Thumbnails verticales (a la IZQUIERDA en desktop) */}
                    <div
                      className={`amazon-thumbs-sidebar ${
                        desktopMediaItems.length > 4 ? "has-overflow" : ""
                      }`}
                      onMouseLeave={() => setHoverThumbIndex(null)}
                    >
                      {desktopMediaItems.map((item, i) => (
                        <button
                          key={`thumb-${i}`}
                          type="button"
                          className={`amazon-thumb ${
                            i === safeDesktopIndex ? "active" : ""
                          }`}
                          onClick={() => {
                            setDesktopMediaIndex(i);
                            // Sincronizar índice de imágenes para zoom y móvil
                            const norm = (u) =>
                              u
                                ? String(u)
                                    .split("?")[0]
                                    .split("#")[0]
                                    .trim()
                                    .toLowerCase()
                                : "";
                            const idx = imagenes.findIndex(
                              (u) => norm(u) === norm(item.url),
                            );
                            if (idx >= 0) setImagenActualIndex(idx);
                          }}
                          onMouseEnter={() => setHoverThumbIndex(i)}
                          onFocus={() => setHoverThumbIndex(i)}
                          onMouseLeave={() => setHoverThumbIndex(null)}
                          aria-label={`Miniatura ${i + 1}`}
                        >
                          {item.type === "video" ? (
                            <div className="relative w-full h-full bg-black flex items-center justify-center">
                              <video
                                src={item.url}
                                preload="metadata"
                                muted
                                className="w-full h-full object-contain"
                              />
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="bg-white/95 rounded-full p-2 shadow">
                                  <svg
                                    className="w-5 h-5 text-gray-800"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <img
                              src={item.url}
                              alt={`Miniatura ${i + 1}`}
                              className="w-full h-full object-contain"
                              loading="lazy"
                            />
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Flechas OVERLAY - FUERA del scroll, dentro del wrapper */}
                    {desktopMediaItems.length > 4 && (
                      <>
                        {/* Flecha ARRIBA - FIJA */}
                        <button
                          className="ebay-arrow-overlay ebay-arrow-up"
                          onClick={() => {
                            const container = document.querySelector(
                              ".amazon-thumbs-sidebar",
                            );
                            if (container)
                              container.scrollBy({
                                top: -100,
                                behavior: "smooth",
                              });
                          }}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                        </button>

                        {/* Flecha ABAJO - FIJA */}
                        <button
                          className="ebay-arrow-overlay ebay-arrow-down"
                          onClick={() => {
                            const container = document.querySelector(
                              ".amazon-thumbs-sidebar",
                            );
                            if (container)
                              container.scrollBy({
                                top: 100,
                                behavior: "smooth",
                              });
                          }}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>

                  {/* Imagen principal */}
                  <div className="amazon-main-image-container vp-main-image-sticky">
                    <div
                      ref={(el) => {
                        imgWrapRef.current = el;
                        mainImageRef.current = el;
                      }}
                      className={`amazon-main-image-wrap ${
                        isZooming ? "zooming" : ""
                      }`}
                      onMouseEnter={handleMouseEnter}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                      onClick={() => {
                        // Abrir overlay en pestaña correcta según tipo
                        const current = desktopMediaItems[displayDesktopIndex];
                        if (current?.type === "video") {
                          const vidIdx = (galleryVideosList || []).findIndex(
                            (u) => u === current.url,
                          );
                          openMediaOverlay("videos", Math.max(0, vidIdx));
                        } else {
                          openMediaOverlay("images", displayDesktopIndex);
                        }
                      }}
                      onTouchStart={handleMainImageTouchStart}
                      onTouchMove={handleMainImageTouchMove}
                      onTouchEnd={handleMainImageTouchEnd}
                      role="button"
                      aria-label="Ver imagen en pantalla completa"
                      tabIndex={0}
                    >
                      {(() => {
                        const current = desktopMediaItems[displayDesktopIndex];
                        if (!current) return null;
                        if (current.type === "video") {
                          return (
                            <div className="relative w-full h-full flex items-center justify-center bg-white">
                              <video
                                key={`main-vid-${displayDesktopIndex}`}
                                src={current.url}
                                controls
                                preload="metadata"
                                playsInline
                                className="w-full h-full object-contain"
                              />
                            </div>
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
                            onLoad={() => {
                              // Ajustar altura de miniaturas cuando la imagen se carga
                              setTimeout(() => {
                                const mainImage = mainImageRef.current;
                                const thumbnailContainer =
                                  document.querySelector(
                                    ".amazon-thumbs-sidebar",
                                  );

                                if (mainImage && thumbnailContainer) {
                                  const imageHeight = mainImage.offsetHeight;
                                  thumbnailContainer.style.height = `${imageHeight}px`;
                                  thumbnailContainer.style.maxHeight = `${imageHeight}px`;
                                }
                              }, 50);
                            }}
                          />
                        );
                      })()}

                      {/* share removed en móvil/desktop para vista limpia */}
                    </div>

                    {/* Enlace "Ver vista completa" - Solo visible en desktop y centrado */}
                    <div className="hidden xl:block text-center mt-3">
                      <button
                        onClick={() =>
                          openMediaOverlay("images", displayDesktopIndex)
                        }
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200"
                      >
                        Ver vista completa
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Bolitas indicadoras estilo Amazon - SOLO móvil/tablet */}
              {desktopMediaItems.length > 1 && (
                <div className="xl:hidden w-full mt-4 flex justify-center">
                  <div className="flex gap-2 items-center">
                    {desktopMediaItems.map((_, i) => (
                      <button
                        key={`dot-${i}`}
                        type="button"
                        className={`dot-indicator ${
                          i === safeDesktopIndex ? "dot-active" : ""
                        }`}
                        onClick={() => setDesktopMediaIndex(i)}
                        aria-label={`Imagen ${i + 1} de ${
                          desktopMediaItems.length
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Enlace removido para vista limpia tipo eBay */}
            </div>
          )}

          {/* Columna Centro - Información del producto (4 columnas) */}
          <div className="flex flex-col gap-4 sm:gap-5 w-full xl:col-span-4">
            {/* Título, descripción y precio - PRIMERO (orden correcto) */}
            <h1 className="vp-title">{producto.nombre}</h1>
            {/* Resumen compacto tipo Amazon con popover (oculto aquí; se renderiza debajo del link de tienda) */}
            <div
              className="relative inline-block hidden"
              onMouseEnter={() => setRatingPopoverOpen(true)}
              onMouseLeave={() => setRatingPopoverOpen(false)}
            >
              <button
                type="button"
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                onClick={() => setRatingPopoverOpen((v) => !v)}
                aria-haspopup="dialog"
                aria-expanded={ratingPopoverOpen ? "true" : "false"}
              >
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={
                        i < Math.round(ratingAverage || 0)
                          ? "text-blue-500"
                          : "text-gray-300"
                      }
                    >
                      ★
                    </span>
                  ))}
                </span>
                <span className="font-semibold text-gray-900">
                  {Number(ratingAverage || 0).toFixed(1)} de 5
                </span>
                <span className="text-blue-600">
                  ({(Number(ratingCount) || 0).toLocaleString("es-DO")})
                </span>
                <FaChevronDown className="ml-0.5" size={12} />
              </button>

              {ratingPopoverOpen && (
                <div
                  ref={ratingPopoverCardRef}
                  className="absolute left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
                  role="dialog"
                >
                  <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    onClick={() => setRatingPopoverOpen(false)}
                    aria-label="Cerrar"
                  >
                    <FaTimes size={14} />
                  </button>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5 text-blue-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            className={
                              i < Math.round(ratingAverage || 0)
                                ? ""
                                : "text-gray-300"
                            }
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {Number(ratingAverage || 0).toFixed(1)} de 5
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {(Number(ratingCount) || 0).toLocaleString("es-DO")}{" "}
                      calificaciones globales
                    </div>
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((s) => {
                        const total = Number(ratingCount) || 0;
                        const count = Number(ratingBreakdown?.[s]) || 0;
                        const pct = total
                          ? Math.round((count / total) * 100)
                          : 0;
                        return (
                          <div key={s} className="flex items-center gap-2">
                            <span className="w-20 text-sm text-gray-700">
                              {s} estrellas
                            </span>
                            <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-3 bg-blue-500 rounded-full"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="w-10 text-right text-sm text-gray-700">
                              {pct}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setRatingPopoverOpen(false);
                        scrollToReviews();
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      Ver las opiniones de los clientes ›
                    </button>
                  </div>
                </div>
              )}
            </div>
            {/* Enlace Visitar Tienda */}
            {(producto.storeId || producto.tienda_id) && tiendaNombreReal ? (
              <Link
                to={`/tiendas/${producto.storeId || producto.tienda_id}`}
                className="text-blue-600 hover:text-blue-800 underline hover:underline transition-colors w-fit block mb-4 font-semibold"
                aria-label={`Visitar tienda de ${tiendaNombreReal}`}
              >
                Visitar tienda de {tiendaNombreReal}
              </Link>
            ) : (
              // Solo mostrar para admins si no hay tienda
              producto.creadorId && (
                <div className="text-red-500 text-sm mb-4">
                  Producto sin tienda asignada
                </div>
              )
            )}
            {/* Resumen compacto tipo Amazon con popover - debajo del link de tienda */}
            <div
              className="relative inline-block mb-2"
              ref={ratingPopoverRef}
              onMouseEnter={
                isTouch ? undefined : () => setRatingPopoverOpen(true)
              }
              onMouseLeave={
                isTouch ? undefined : () => setRatingPopoverOpen(false)
              }
            >
              <button
                type="button"
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                onClick={() => setRatingPopoverOpen((v) => !v)}
                aria-haspopup="dialog"
                aria-expanded={ratingPopoverOpen ? "true" : "false"}
              >
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={
                        i < Math.round(ratingAverage || 0)
                          ? "text-blue-500"
                          : "text-gray-300"
                      }
                    >
                      ★
                    </span>
                  ))}
                </span>
                <span className="font-semibold text-gray-900">
                  {Number(ratingAverage || 0).toFixed(1)} de 5
                </span>
                <span className="text-blue-600">
                  ({(Number(ratingCount) || 0).toLocaleString("es-DO")})
                </span>
                <FaChevronDown className="ml-0.5" size={12} />
              </button>

              {ratingPopoverOpen && (
                <div
                  ref={ratingPopoverCardRef}
                  className="absolute left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
                  role="dialog"
                >
                  <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    onClick={() => setRatingPopoverOpen(false)}
                    aria-label="Cerrar"
                  >
                    <FaTimes size={14} />
                  </button>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5 text-blue-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            className={
                              i < Math.round(ratingAverage || 0)
                                ? ""
                                : "text-gray-300"
                            }
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {Number(ratingAverage || 0).toFixed(1)} de 5
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {(Number(ratingCount) || 0).toLocaleString("es-DO")}{" "}
                      calificaciones globales
                    </div>
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((s) => {
                        const total = Number(ratingCount) || 0;
                        const count = Number(ratingBreakdown?.[s]) || 0;
                        const pct = total
                          ? Math.round((count / total) * 100)
                          : 0;
                        return (
                          <div key={s} className="flex items-center gap-2">
                            <span className="w-20 text-sm text-gray-700">
                              {s} estrellas
                            </span>
                            <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-3 bg-blue-500 rounded-full"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="w-10 text-right text-sm text-gray-700">
                              {pct}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setRatingPopoverOpen(false);
                        scrollToReviews();
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      Ver las opiniones de los clientes ›
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div
              className="vp-desc prose max-w-none"
              dangerouslySetInnerHTML={{
                __html: sanitizeBasic(
                  producto.descripcion ||
                    "<p>Contáctanos para más detalles.</p>",
                ),
              }}
            />
            <div>
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1">
                  <span className="text-sm text-gray-600 font-medium">DOP</span>
                  <span className="text-sm text-gray-600 font-medium">$</span>
                  <span className="text-3xl font-bold text-blue-700">
                    {formatPriceRD(precioProducto)}
                  </span>
                </div>
              </div>
            </div>
            {/* SELECTOR DE VARIANTES - SOLO SI HAY VARIANTES REALES */}
            {hasVariantsUI && (
              <div className="-mt-2">
                <VisualVariantSelector
                  producto={producto}
                  variantes={[
                    // Variante principal (producto base) - solo si hay variantes reales
                    {
                      id: "principal",
                      color: "Principal",
                      nombre: "Producto Principal",
                      precio: producto?.precio,
                      imagen:
                        producto?.imagenPrincipal?.[0]?.url || producto?.imagen,
                      imagenPrincipal: producto?.imagenPrincipal,
                      galeriaImagenes: producto?.galeriaImagenes,
                      cantidad: producto?.cantidad,
                    },
                    // Agregar todas las variantes con color
                    ...variantesConColor,
                  ]}
                  varianteSeleccionada={
                    varianteSeleccionada === -1 ? 0 : varianteSeleccionada + 1
                  }
                  onVarianteChange={(index) => {
                    // index 0 = Principal, index 1+ = variantes reales
                    if (index === 0) {
                      setVarianteSeleccionada(-1); // Producto principal
                    } else {
                      setVarianteSeleccionada(index - 1); // Variante real (ajustar índice)
                    }
                    // Reset media indexes when variant changes
                    setImagenActualIndex(0);
                    setDesktopMediaIndex(0);
                  }}
                />
              </div>
            )}
            {/* Acerca de este artículo - DESPUÉS DEL SELECTOR DE VARIANTES */}
            <div>
              <AcercaDeEsteArticulo producto={producto} />
            </div>
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
                    className={`w-full sm:w-1/2 px-8 md:px-10 py-3 md:py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold md:font-bold md:text-base rounded-xl transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl ${
                      !disponible
                        ? "opacity-60 cursor-not-allowed hover:scale-100 hover:bg-blue-600"
                        : ""
                    }`}
                    style={{ backgroundColor: "#2563eb" }}
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
          </div>

          {/* Columna Derecha - Tarjeta de compra (2 columnas) */}
          <aside className="vp-buy-card w-full xl:col-span-2 hidden xl:block">
            <div className="vp-buy-inner">
              <div className="vp-buy-price text-xl font-semibold">
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
                    className={`w-full px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl whitespace-nowrap ${
                      !disponible
                        ? "opacity-60 cursor-not-allowed hover:scale-100 hover:bg-blue-600"
                        : ""
                    }`}
                    style={{ backgroundColor: "#2563eb" }}
                    onClick={handleAgregar}
                    disabled={!disponible}
                    title={!disponible ? "No disponible" : "Agregar al carrito"}
                  >
                    Agregar al carrito
                  </button>
                )}

                {/* "Comprar ahora" */}
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

        {/* Overlay global de zoom tipo Amazon - renderizado como portal en <body> */}
        {typeof document !== "undefined" &&
          createPortal(
            <div
              ref={zoomOverlayRef}
              className="vp-zoom-float vp-zoom-stage"
              style={zoomOverlayStyle}
            />,
            document.body,
          )}

        {/* Productos relacionados - ARRIBA */}
        {producto && (
          <section className="w-full mt-8 px-4 sm:px-6 xl:px-6">
            <ProductosRelacionados productoActual={producto} />
          </section>
        )}

        {/* Secciones de archivos extras eliminadas */}

        {/* 📸 MÁS INFORMACIÓN DEL PRODUCTO - Imágenes grandes estilo Amazon */}
        {(() => {
          const extraImages = getExtraFiles();
          if (!extraImages || extraImages.length === 0) return null;

          return (
            <section className="w-full mt-8 xl:mt-12 mb-0 xl:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 xl:mb-6 text-center px-4 xl:px-6">
                Más información del producto
              </h2>
              <div className="-mx-4 sm:-mx-6 xl:max-w-[1500px] xl:mx-auto xl:px-6 xl:space-y-4">
                {extraImages.map((imageUrl, index) => (
                  <div
                    key={`product-info-${index}`}
                    className="relative w-full cursor-pointer"
                    onClick={() => {
                      setProductInfoImageIndex(index);
                      setProductInfoModalOpen(true);
                    }}
                  >
                    <img
                      src={imageUrl}
                      alt={`${producto.nombre} - Información ${index + 1}`}
                      className="w-full h-auto object-cover xl:object-contain bg-white dark:bg-gray-800 xl:rounded-lg"
                      style={{
                        display: "block",
                      }}
                    />
                  </div>
                ))}
              </div>
            </section>
          );
        })()}

        {/* 📋 INFORMACIÓN DEL PRODUCTO - Secciones colapsables estilo Amazon */}
        <ProductInformationSection
          producto={producto}
          allVariantes={allVariantes}
        />

        {/* 📋 OPINIONES DE CLIENTES - DISEÑO PREMIUM */}
        <section
          ref={reviewsRef}
          id="reviews"
          className="w-full mt-10 xl:mt-12"
          style={{ scrollMarginTop: "90px" }}
        >
          {/* Header de sección */}
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Opiniones de clientes
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Reseñas reales verificadas por la comunidad
              </p>
            </div>
          </div>

          {/* GRID PRINCIPAL: stats (left) + lista (right) en desktop, apilado en móvil */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
            {/* COLUMNA IZQUIERDA: stats + CTA (flat estilo Amazon) */}
            <aside className="lg:col-span-4 xl:col-span-3">
              <div className="lg:sticky lg:top-24">
                <ReviewsSummary
                  ratingAverage={ratingAverage}
                  ratingCount={ratingCount}
                  ratingBreakdown={ratingBreakdown}
                  onScrollToReviews={scrollToReviews}
                  onOpenWriteReview={openWriteReview}
                  loading={reviewsLoading}
                />
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Comparte tu experiencia
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Si tienes este producto, tu opinión ayudará a otros
                    compradores.
                  </p>
                  <button
                    type="button"
                    onClick={openWriteReview}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-full border border-gray-300 dark:border-gray-600 shadow-sm transition-all active:scale-[0.98]"
                  >
                    Escribir una opinión
                  </button>
                </div>
              </div>
            </aside>

            {/* COLUMNA DERECHA: fotos + lista de reseñas */}
            <div className="lg:col-span-8 xl:col-span-9 min-w-0">
              {/* OPINIONES CON IMÁGENES */}
              <section className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                      Opiniones con imágenes
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Las fotos de otros clientes te ayudan a decidir
                    </p>
                  </div>
                  {reviewPhotoItems.length > 0 && (
                    <button
                      type="button"
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-semibold whitespace-nowrap"
                      onClick={() => setPhotosGridOpen(true)}
                    >
                      Ver todas ({reviewPhotoItems.length})
                    </button>
                  )}
                </div>

                {reviewPhotoItems.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
                    {reviewPhotoItems.slice(0, 12).map((item, i) => (
                      <button
                        key={`${item.review.id}-${item.index}-${i}`}
                        type="button"
                        onClick={() =>
                          handleImageClick(item.review, item.index)
                        }
                        className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:scale-[1.03] hover:shadow-lg hover:border-blue-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        aria-label="Abrir foto de reseña"
                      >
                        <img
                          src={item.url}
                          alt="foto de reseña"
                          className="w-full h-full object-contain bg-gray-100 dark:bg-gray-800"
                          loading="lazy"
                        />
                        {i === 11 && reviewPhotoItems.length > 12 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-lg font-bold">
                            +{reviewPhotoItems.length - 12}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/40 p-8 text-center">
                    <div className="mx-auto w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-3">
                      <svg
                        className="w-7 h-7 text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Aún no hay fotos de clientes
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Sé el primero en compartir tus fotos del producto
                    </p>
                  </div>
                )}
              </section>

              {/* LISTA DE RESEÑAS */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                    Todas las opiniones{" "}
                    {reviews.length > 0 && (
                      <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">
                        ({reviews.length})
                      </span>
                    )}
                  </h3>
                </div>

                {reviewsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="animate-pulse rounded-2xl border border-gray-200 dark:border-gray-700 p-5"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                          </div>
                        </div>
                        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                        <div className="flex gap-2">
                          <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                          <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : getFilteredAndSortedReviews().length > 0 ? (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {getFilteredAndSortedReviews().map((review) => (
                      <div key={review.id} className="py-5 first:pt-0">
                        <ReviewCard
                          review={review}
                          canDelete={usuario?.uid === review.userId}
                          onDelete={openDeleteConfirm}
                          onImageClick={handleImageClick}
                          isDeleting={deleteBusyId === review.id}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  // Empty state premium
                  <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white to-blue-50/40 dark:from-gray-900 dark:to-blue-950/20 p-10 text-center">
                    {reviews.length === 0 ? (
                      <>
                        <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-4">
                          <svg
                            className="w-8 h-8 text-blue-500"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                          Aún no hay opiniones
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 max-w-md mx-auto">
                          Sé el primero en compartir tu experiencia con este
                          producto. Tu opinión ayuda a otros compradores.
                        </p>
                        <button
                          type="button"
                          onClick={openWriteReview}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                        >
                          Escribir la primera opinión
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          No hay reseñas que coincidan con los filtros
                          seleccionados.
                        </p>
                      </>
                    )}
                  </div>
                )}
              </section>
            </div>
          </div>
        </section>
      </main>

      {/* Modal de galería fullscreen - ESTILO AMAZON EXACTO */}
      {mediaOverlayOpen &&
        (() => {
          // ⚠️ AMAZON: SOLO mostrar medios de la variante activa
          const galleryVideos = getGalleryVideos();
          const galleryImages = getGalleryImages();
          const hasVideos = galleryVideos.length > 0;

          const currentMediaItems =
            mediaOverlayTab === "videos"
              ? galleryVideos.map((url) => ({ type: "video", url }))
              : galleryImages.map((url) => ({ type: "image", url }));

          // Medios cargados

          // Asegurar que el índice esté dentro del rango
          const safeMediaIndex = Math.min(
            mediaOverlayIndex,
            Math.max(0, currentMediaItems.length - 1),
          );

          return (
            <div
              className={`fixed inset-0 z-[9999] flex flex-col ${
                isDark ? "bg-gray-900" : "bg-white"
              }`}
            >
              {/* Barra superior con pestañas y botón X */}
              <div
                className={`border-b px-4 py-3 flex items-center justify-between ${
                  isDark
                    ? "border-gray-700 bg-gray-800"
                    : "border-[#DDD] bg-white"
                }`}
              >
                {/* Pestañas IMÁGENES / VIDEOS */}
                <div className="flex gap-1">
                  <button
                    type="button"
                    className={`px-4 py-2 text-sm font-medium transition-all rounded-t ${
                      mediaOverlayTab === "images"
                        ? isDark
                          ? "text-blue-400 border-b-2 border-blue-400 bg-gray-700"
                          : "text-[#007185] border-b-2 border-[#007185] bg-gray-50"
                        : isDark
                          ? "text-gray-300 hover:text-white hover:bg-gray-700"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setMediaOverlayTab("images");
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
                        mediaOverlayTab === "videos"
                          ? isDark
                            ? "text-blue-400 border-b-2 border-blue-400 bg-gray-700"
                            : "text-[#007185] border-b-2 border-[#007185] bg-gray-50"
                          : isDark
                            ? "text-gray-300 hover:text-white hover:bg-gray-700"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                      onClick={() => {
                        setMediaOverlayTab("videos");
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
                  className={`transition-colors ${
                    isDark
                      ? "text-gray-300 hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  aria-label="Cerrar"
                  onClick={closeMediaOverlay}
                >
                  <FaTimes className="text-2xl" />
                </button>
              </div>

              {/* Contenido - 2 columnas desktop (izq: miniaturas, der: imagen/video) */}
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Miniaturas verticales - Izquierda (Desktop ≥ md) */}
                <div
                  className={`hidden md:block w-64 lg:w-80 border-r relative group ${
                    isDark
                      ? "border-gray-700 bg-gray-800"
                      : "border-[#DDD] bg-gray-50"
                  }`}
                  onClick={(e) => e.stopPropagation()}
                  onMouseEnter={() => setThumbnailsHover(true)}
                  onMouseLeave={() => setThumbnailsHover(false)}
                >
                  {/* Flechas circulares estilo eBay - Solo aparecen con hover */}
                  {thumbnailsHover && currentMediaItems.length > 4 && (
                    <>
                      <button
                        type="button"
                        className={`absolute top-2 left-1/2 -translate-x-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all border ${
                          isDark
                            ? "bg-gray-800 hover:bg-gray-700 text-white border-gray-600"
                            : "bg-white hover:bg-gray-50 text-gray-800 border-gray-300"
                        }`}
                        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.12)" }}
                        onClick={() => {
                          if (thumbnailsRef.current) {
                            thumbnailsRef.current.scrollBy({
                              top: -200,
                              behavior: "smooth",
                            });
                          }
                        }}
                        aria-label="Scroll arriba"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className={`absolute bottom-2 left-1/2 -translate-x-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all border ${
                          isDark
                            ? "bg-gray-800 hover:bg-gray-700 text-white border-gray-600"
                            : "bg-white hover:bg-gray-50 text-gray-800 border-gray-300"
                        }`}
                        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.12)" }}
                        onClick={() => {
                          if (thumbnailsRef.current) {
                            thumbnailsRef.current.scrollBy({
                              top: 200,
                              behavior: "smooth",
                            });
                          }
                        }}
                        aria-label="Scroll abajo"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
                        </svg>
                      </button>
                    </>
                  )}

                  <div
                    ref={thumbnailsRef}
                    className="overflow-y-auto p-4 h-full"
                    style={{ scrollbarWidth: "thin" }}
                  >
                    <div className="space-y-3">
                      <h3
                        className={`text-sm font-semibold mb-4 uppercase ${
                          isDark ? "text-gray-200" : "text-gray-700"
                        }`}
                      >
                        {mediaOverlayTab === "videos" ? "Videos" : "Imágenes"}
                      </h3>
                      {/* Grid de miniaturas 2 columnas - SOLO de variante activa */}
                      <div className="grid grid-cols-2 gap-3">
                        {currentMediaItems.map((item, i) => (
                          <button
                            key={`desktop-thumb-${i}`}
                            type="button"
                            className={`w-full aspect-square overflow-hidden rounded border-2 transition-all ${
                              i === safeMediaIndex
                                ? ""
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                            style={
                              i === safeMediaIndex
                                ? { borderColor: "#0064D2" }
                                : undefined
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              setMediaOverlayIndex(i);
                              setFullscreenZoom(1);
                              setFullscreenPan({ x: 0, y: 0 });
                            }}
                            aria-label={`Vista ${i + 1}`}
                          >
                            {mediaOverlayTab === "videos" ? (
                              <div className="relative w-full h-full bg-black flex items-center justify-center">
                                <video
                                  src={item.url}
                                  className="w-full h-full object-contain"
                                  muted
                                />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                  <div className="bg-white/90 rounded-full p-2">
                                    <svg
                                      className="w-6 h-6 text-gray-700"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
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

                {/* Columna DERECHA - Imagen/Video grande */}
                <div
                  className={`flex-1 flex items-center justify-center p-4 md:p-8 relative ${
                    isDark ? "bg-gray-900" : "bg-white"
                  }`}
                  onClick={(e) => e.stopPropagation()}
                  onTouchStart={
                    mediaOverlayTab === "images"
                      ? handleFullscreenTouchStart
                      : undefined
                  }
                  onTouchMove={
                    mediaOverlayTab === "images"
                      ? handleFullscreenTouchMove
                      : undefined
                  }
                  onTouchEnd={
                    mediaOverlayTab === "images"
                      ? handleFullscreenTouchEnd
                      : undefined
                  }
                >
                  <div className="relative w-full h-full flex items-center justify-center max-w-[1500px]">
                    {/* Flechas SOLO en desktop (≥1280px) Y cuando NO hay zoom - Móvil/tablet usan swipe */}
                    {currentMediaItems.length > 1 && fullscreenZoom === 1 && (
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
                                currentMediaItems.length,
                            );
                          }}
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
                          type="button"
                          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 text-gray-700 hover:text-gray-900 transition-all hidden xl:flex items-center justify-center"
                          aria-label="Siguiente"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMediaOverlayIndex(
                              (prev) => (prev + 1) % currentMediaItems.length,
                            );
                          }}
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

                    {/* Contenido principal: Imagen o Video */}
                    <div className="w-full h-full flex items-center justify-center px-2 md:px-4">
                      {(() => {
                        const current = currentMediaItems[safeMediaIndex];
                        if (!current) return null;

                        // Si es video, mostrar video player
                        if (mediaOverlayTab === "videos") {
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
                                // Error cargando video
                              }}
                            />
                          );
                        }

                        // Si es imagen, mostrar con zoom
                        return (
                          <img
                            src={current.url}
                            alt={`${producto?.nombre || "Imagen"}`}
                            className="w-full h-full object-contain select-none"
                            style={{
                              maxWidth: "min(100vw - 2rem, 1500px)",
                              maxHeight: "min(90vh, 100%)",
                              transform: `scale(${fullscreenZoom}) translate(${fullscreenPan.x}px, ${fullscreenPan.y}px)`,
                              transition:
                                fullscreenZoom === 1
                                  ? "transform 0.3s ease"
                                  : "none",
                              cursor:
                                fullscreenZoom > 1 ? "zoom-out" : "zoom-in",
                            }}
                            draggable={false}
                            onClick={(e) => {
                              if (fullscreenZoom === 1) {
                                // Activar zoom y centrar en la posición del clic
                                const rect =
                                  e.currentTarget.getBoundingClientRect();
                                const x =
                                  ((e.clientX - rect.left) / rect.width - 0.5) *
                                  -100;
                                const y =
                                  ((e.clientY - rect.top) / rect.height - 0.5) *
                                  -100;
                                setFullscreenZoom(2);
                                setFullscreenPan({ x, y });
                              } else {
                                // Desactivar zoom
                                setFullscreenZoom(1);
                                setFullscreenPan({ x: 0, y: 0 });
                              }
                            }}
                            onMouseMove={(e) => {
                              if (fullscreenZoom > 1) {
                                const rect =
                                  e.currentTarget.getBoundingClientRect();
                                const x =
                                  ((e.clientX - rect.left) / rect.width - 0.5) *
                                  -100;
                                const y =
                                  ((e.clientY - rect.top) / rect.height - 0.5) *
                                  -100;
                                setFullscreenPan({ x, y });
                              }
                            }}
                          />
                        );
                      })()}
                    </div>
                  </div>

                  {/* Contador simple abajo a la derecha */}
                  <div className="absolute bottom-4 right-4 xl:hidden">
                    <div
                      className={`text-xs font-medium px-2 py-1 rounded ${
                        isDark
                          ? "bg-black/50 text-white"
                          : "bg-black/40 text-white"
                      }`}
                    >
                      {safeMediaIndex + 1} / {currentMediaItems.length}
                    </div>
                  </div>
                </div>

                {/* Miniaturas horizontales (Móvil - debajo de la imagen/video) */}
                <div
                  className={`md:hidden border-t p-4 overflow-x-auto ${
                    isDark
                      ? "border-gray-700 bg-gray-800"
                      : "border-[#DDD] bg-gray-50"
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex gap-3 min-w-min">
                    {/* Móvil 80x80px con scroll horizontal */}
                    {currentMediaItems.map((item, i) => (
                      <button
                        key={`mobile-thumb-${i}`}
                        type="button"
                        className={`flex-shrink-0 w-20 h-20 overflow-hidden rounded border-2 transition-all ${
                          i === safeMediaIndex
                            ? ""
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        style={
                          i === safeMediaIndex
                            ? { borderColor: "#0064D2" }
                            : undefined
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          setMediaOverlayIndex(i);
                          setFullscreenZoom(1);
                          setFullscreenPan({ x: 0, y: 0 });
                        }}
                        aria-label={`Vista ${i + 1}`}
                      >
                        {mediaOverlayTab === "videos" ? (
                          <div className="relative w-full h-full bg-black flex items-center justify-center">
                            <video
                              src={item.url}
                              className="w-full h-full object-contain"
                              muted
                            />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="bg-white/90 rounded-full p-1.5">
                                <svg
                                  className="w-4 h-4 text-gray-700"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
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
            setModalAbierto(false);
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
                cursor: (modalZoom || 1) > 1 ? "zoom-out" : "zoom-in",
              }}
              draggable={false}
              onClick={(e) => {
                e.stopPropagation();
                if ((modalZoom || 1) === 1) {
                  // Activar zoom y centrar en la posición del clic
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width - 0.5) * -100;
                  const y = ((e.clientY - rect.top) / rect.height - 0.5) * -100;
                  setModalZoom && setModalZoom(2);
                  setModalPan && setModalPan({ x, y });
                } else {
                  // Desactivar zoom
                  setModalZoom && setModalZoom(1);
                  setModalPan && setModalPan({ x: 0, y: 0 });
                }
              }}
              onMouseMove={(e) => {
                if ((modalZoom || 1) > 1) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width - 0.5) * -100;
                  const y = ((e.clientY - rect.top) / rect.height - 0.5) * -100;
                  setModalPan && setModalPan({ x, y });
                }
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
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 🖼️ Modal de "Más información del producto" - Imágenes grandes fullscreen */}
      {productInfoModalOpen &&
        (() => {
          const extraImages = getExtraFiles();
          if (!extraImages || extraImages.length === 0) return null;

          const currentImage = extraImages[productInfoImageIndex];
          const hasMultipleImages = extraImages.length > 1;

          return (
            <div
              className={`fixed inset-0 z-[9999] flex flex-col ${
                isDark ? "bg-gray-900" : "bg-white"
              }`}
            >
              {/* Barra superior simple con X */}
              <div
                className={`border-b px-4 py-3 flex items-center justify-between ${
                  isDark
                    ? "border-gray-700 bg-gray-800"
                    : "border-[#DDD] bg-white"
                }`}
              >
                <h2
                  className={`text-lg font-semibold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Información del producto ({productInfoImageIndex + 1} /{" "}
                  {extraImages.length})
                </h2>
                <button
                  type="button"
                  className={`transition-colors ${
                    isDark
                      ? "text-gray-300 hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  aria-label="Cerrar"
                  onClick={() => setProductInfoModalOpen(false)}
                >
                  <FaTimes className="text-2xl" />
                </button>
              </div>

              {/* Contenedor de imagen centrada */}
              <div
                className={`flex-1 flex items-center justify-center p-4 md:p-8 relative overflow-auto ${
                  isDark ? "bg-gray-900" : "bg-white"
                }`}
                onTouchStart={onTouchStartProductInfo}
                onTouchMove={onTouchMoveProductInfo}
                onTouchEnd={onTouchEndProductInfo}
              >
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
                            (prev) =>
                              (prev - 1 + extraImages.length) %
                              extraImages.length,
                          );
                          setProductInfoZoom(1);
                          setProductInfoPan({ x: 50, y: 50 });
                        }}
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
                        type="button"
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 text-gray-700 hover:text-gray-900 transition-all hidden xl:flex items-center justify-center"
                        aria-label="Siguiente"
                        onClick={() => {
                          setProductInfoImageIndex(
                            (prev) => (prev + 1) % extraImages.length,
                          );
                          setProductInfoZoom(1);
                          setProductInfoPan({ x: 50, y: 50 });
                        }}
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

                  {/* Imagen principal con zoom */}
                  <div className="w-full h-full flex items-center justify-center overflow-hidden px-2 md:px-4">
                    <img
                      src={currentImage}
                      alt={`${producto?.nombre} - Información ${
                        productInfoImageIndex + 1
                      }`}
                      className="w-full h-full object-contain select-none"
                      style={{
                        maxWidth: "min(100vw - 2rem, 1500px)",
                        maxHeight: "min(90vh, 100%)",
                        transform: `scale(${productInfoZoom})`,
                        transformOrigin: `${productInfoPan.x}% ${productInfoPan.y}%`,
                        transition:
                          productInfoZoom === 1
                            ? "transform 0.3s ease"
                            : "none",
                        cursor: productInfoZoom > 1 ? "zoom-out" : "zoom-in",
                      }}
                      draggable={false}
                      onClick={(e) => {
                        if (productInfoZoom === 1) {
                          // Activar zoom en la posición exacta del clic
                          const rect = e.currentTarget.getBoundingClientRect();
                          const x =
                            ((e.clientX - rect.left) / rect.width) * 100;
                          const y =
                            ((e.clientY - rect.top) / rect.height) * 100;
                          setProductInfoZoom(2.5);
                          setProductInfoPan({ x, y });
                        } else {
                          // Desactivar zoom
                          setProductInfoZoom(1);
                          setProductInfoPan({ x: 50, y: 50 });
                        }
                      }}
                      onMouseMove={(e) => {
                        if (productInfoZoom > 1) {
                          // Actualizar transform-origin según posición del mouse
                          const rect = e.currentTarget.getBoundingClientRect();
                          const x =
                            ((e.clientX - rect.left) / rect.width) * 100;
                          const y =
                            ((e.clientY - rect.top) / rect.height) * 100;
                          setProductInfoPan({ x, y });
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Miniaturas horizontales (solo si hay más de 1 imagen) */}
              {hasMultipleImages && (
                <div
                  className={`border-t p-4 overflow-x-auto ${
                    isDark
                      ? "border-gray-700 bg-gray-800"
                      : "border-[#DDD] bg-gray-50"
                  }`}
                >
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
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

      {/* Sistema de notificaciones */}
      <ToastNotification
        notifications={notifications}
        onRemove={removeNotification}
      />

      {deleteConfirmOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDeleteConfirm}
            role="dialog"
            aria-modal="true"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div
              className="relative w-full max-w-sm mx-auto sm:max-w-md rounded-2xl bg-gray-900 dark:bg-gray-900 shadow-2xl border border-gray-700 dark:border-gray-700 overflow-hidden"
              initial={{ scale: 0.96, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.98, opacity: 0, y: 10 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-5 border-b border-gray-700 dark:border-gray-700">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white dark:text-white leading-tight">
                      ¿Eliminar tu opinión?
                    </h3>
                    <p className="text-sm text-blue-300 dark:text-blue-300 mt-1 leading-relaxed">
                      Esta acción no se puede deshacer.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeDeleteConfirm}
                    disabled={!!deleteBusyId}
                    className="p-2 rounded-full hover:bg-gray-800 dark:hover:bg-gray-800 text-blue-400 dark:text-blue-400 hover:text-blue-300 dark:hover:text-blue-300 transition-all duration-200"
                    aria-label="Cerrar"
                  >
                    <FaTimes size={16} />
                  </button>
                </div>
              </div>

              <div className="px-6 py-5">
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeDeleteConfirm}
                    disabled={!!deleteBusyId}
                    className="px-5 py-2.5 rounded-lg border border-blue-300 bg-blue-600 text-white hover:bg-blue-700 font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteReview(deleteTargetReview)}
                    disabled={!!deleteBusyId}
                    className={`px-5 py-2.5 rounded-lg text-white font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                      deleteBusyId
                        ? "!bg-red-400 hover:!bg-red-400"
                        : "!bg-red-600 hover:!bg-red-700"
                    }`}
                  >
                    {deleteBusyId ? "Eliminando..." : "Eliminar"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>,
          document.body,
        )}

      {reviewOverlayOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 flex flex-col"
          onClick={() => setReviewOverlayOpen(false)}
        >
          <div className="absolute top-4 right-4 z-20">
            <button
              className="bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
              onClick={() => setReviewOverlayOpen(false)}
              aria-label="Cerrar"
            >
              <FaTimes size={20} />
            </button>
          </div>
          <div
            className="flex-1 flex items-center justify-center p-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const item = reviewOverlayItems[reviewOverlayIndex];
              if (!item) return null;
              if (item.type === "video") {
                return (
                  <video
                    src={item.url}
                    controls
                    className="max-w-full max-h-full object-contain"
                  />
                );
              }
              return (
                <img
                  src={item.url}
                  alt="adjunto"
                  className="max-w-full max-h-full object-contain"
                />
              );
            })()}
            {reviewOverlayItems.length > 1 && (
              <>
                <button
                  type="button"
                  className="hidden xl:flex absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 text-gray-700 hover:text-gray-900"
                  onClick={() =>
                    setReviewOverlayIndex(
                      (i) =>
                        (i - 1 + reviewOverlayItems.length) %
                        reviewOverlayItems.length,
                    )
                  }
                  aria-label="Anterior"
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
                  type="button"
                  className="hidden xl:flex absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 text-gray-700 hover:text-gray-900"
                  onClick={() =>
                    setReviewOverlayIndex(
                      (i) => (i + 1) % reviewOverlayItems.length,
                    )
                  }
                  aria-label="Siguiente"
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
          {reviewOverlayItems.length > 1 && (
            <div className="p-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex gap-2 justify-center overflow-x-auto pb-2 scrollbar-hide">
                {reviewOverlayItems.map((m, i) => (
                  <button
                    key={i}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      i === reviewOverlayIndex
                        ? "border-white"
                        : "border-gray-600"
                    }`}
                    onClick={() => setReviewOverlayIndex(i)}
                    aria-label={`Miniatura ${i + 1}`}
                  >
                    {m.type === "image" ? (
                      <img
                        src={m.url}
                        alt="miniatura"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        src={m.url}
                        className="w-full h-full object-cover"
                        muted
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL PREMIUM: Escribir opinión (estilo Amazon/eBay) */}
      <WriteReviewModal
        isOpen={writeReviewOpen}
        onClose={closeWriteReview}
        onSubmit={publishReview}
        submitting={submitBusy}
        productName={producto?.nombre || ""}
        productImage={
          producto?.imagen ||
          producto?.imagenPrincipal?.[0]?.url ||
          (Array.isArray(producto?.imagenes) ? producto.imagenes[0] : "")
        }
        user={
          usuario
            ? {
                displayName:
                  usuario.displayName ||
                  usuario.email?.split("@")[0] ||
                  "Usuario",
                photoURL: usuario.photoURL || null,
              }
            : null
        }
      />

      {/* MODAL: Todas las fotos de clientes */}
      {photosGridOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPhotosGridOpen(false)}
            role="dialog"
            aria-modal="true"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div
              className="relative w-full max-w-6xl mx-auto rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              initial={{ scale: 0.96, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.98, opacity: 0, y: 10 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Todas las fotos
                </h3>
                <button
                  type="button"
                  onClick={() => setPhotosGridOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition"
                  aria-label="Cerrar"
                >
                  <FaTimes size={16} />
                </button>
              </div>
              <div className="p-4 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                  {reviewPhotoItems.map((item, i) => (
                    <button
                      key={`${item.review.id}-${item.index}-${i}`}
                      type="button"
                      onClick={() => {
                        handleImageClick(item.review, item.index);
                        setPhotosGridOpen(false);
                      }}
                      className="relative w-full aspect-square rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                    >
                      <img
                        src={item.url}
                        alt="foto de reseña"
                        className="absolute inset-0 w-full h-full object-contain"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>,
          document.body,
        )}

      {/* NIVEL 3 - MODAL DE MEDIOS DE RESEÑAS (ESTRUCTURA EXACTA AMAZON) */}
      <ReviewMediaModal
        isOpen={reviewMediaModalOpen}
        onClose={closeReviewMediaModal}
        reviews={reviews}
        initialReviewIndex={selectedReviewIndex}
        initialMediaIndex={selectedMediaIndex}
      />
    </>
  );
}

export default VistaProducto;
