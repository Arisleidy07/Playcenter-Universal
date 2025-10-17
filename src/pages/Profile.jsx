import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "firebase/auth";
import { subirImagenCloudinary } from "../utils/subirImagenCloudinary";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import Entrega from "../components/Entrega";
import "../styles/Profile.css";

/* =========================
   CONSTS & HELPERS
   ========================= */

const TIENDA_PLAYCENTER = {
  provincia: "Santiago",
  ciudad: "Santiago de los Caballeros",
  numeroCalle: "Av. Juan Pablo Duarte 68",
  direccionCompleta:
    "Playcenter Universal, Av. Juan Pablo Duarte 68, Santiago de los Caballeros 51000, República Dominicana",
  ubicacion: "https://maps.app.goo.gl/kszSTHedLYWCby1E7",
  metodoEntrega: "tienda",
};

const nameToInitial = (v = "") =>
  String(v || "").trim() ? String(v).trim().charAt(0).toUpperCase() : "?";
const stringToHexColor = (str = "") => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  const r = (hash >> 0) & 0xff;
  const g = (hash >> 8) & 0xff;
  const b = (hash >> 16) & 0xff;
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
};
const avatarDataUrl = (seed = "", size = 512) => {
  const initial = nameToInitial(seed);
  const bg = stringToHexColor(seed || initial);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'>
    <rect width='100%' height='100%' fill='${bg}' rx='${Math.floor(
    size * 0.12
  )}' />
    <text x='50%' y='50%' dy='.04em' font-family='Inter, system-ui, Arial' font-size='${Math.floor(
      size * 0.42
    )}' fill='#fff' text-anchor='middle' alignment-baseline='middle'>${initial}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const pageVariant = {
  hidden: { opacity: 0, y: 10 },
  enter: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.36, ease: [0.2, 0.8, 0.2, 1] },
  },
  exit: { opacity: 0, y: -8, transition: { duration: 0.25 } },
};

const itemFade = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.26 } },
};

/* Historial de compras mejorado con UI/UX hermoso */
function HistorialSection({ historial }) {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter] = useState("all");

  // Mantengo tabs pero ocultas (no se borran).
  const SHOW_FILTERS = false;

  if (!historial?.length) {
    return (
      <motion.div
        variants={itemFade}
        className="empty-state-beautiful"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="empty-illustration">
          <motion.div
            className="empty-box"
            animate={{ y: [0, -10, 0], rotateY: [0, 5, 0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden
          >
            <Package size={56} />
          </motion.div>
        </div>
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          ¡Tu historial está esperando!
        </motion.h3>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Cuando realices tu primera compra, aparecerá aquí.
        </motion.p>
        <motion.div
          className="empty-cta"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
        >
          <button className="btn-beautiful-primary">Explorar productos</button>
        </motion.div>
      </motion.div>
    );
  }

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "DOP",
      minimumFractionDigits: 2,
    }).format(amount || 0);

  const formatOrderDate = (fecha) => {
    if (!fecha) return "—";
    let d;
    if (fecha?.seconds) d = new Date(fecha.seconds * 1000);
    else d = new Date(fecha);
    if (isNaN(d)) return "—";
    return d.toLocaleString("es-DO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusConfig = (estado) => {
    switch (estado) {
      case "completado":
        return {
          color: "status-completed",
          Icon: CheckCircle,
          text: "Completado",
          gradient: "linear-gradient(135deg, #10b981, #059669)",
        };
      case "cancelado":
        return {
          color: "status-cancelled",
          Icon: XCircle,
          text: "Cancelado",
          gradient: "linear-gradient(135deg, #ef4444, #dc2626)",
        };
      case "pendiente":
      default:
        return {
          color: "status-pending",
          Icon: Hourglass,
          text: "Pendiente",
          gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
        };
    }
  };

  const filteredHistorial = historial.filter((order) =>
    filter === "all" ? true : order.estado === filter
  );

  return (
    <>
      {/* Ajustes compact/responsive (inline para no tocar tu CSS base) */}
      <style>{`
        .history-compact { --fs-1:.95rem; --fs-2:.9rem; --fs-3:.85rem; --pad-1:.55rem; --pad-2:.8rem; --radius:12px; }
        .history-compact .order-card-beautiful { padding: var(--pad-2); border-radius: var(--radius); }
        .history-compact .order-number-beautiful { font-size: var(--fs-1); }
        .history-compact .order-date-beautiful { font-size: var(--fs-3); opacity:.8; }
        .history-compact .status-badge-beautiful { padding:.35rem .55rem; border-radius:999px; font-size: var(--fs-3); }
        .history-compact .order-total-beautiful { font-size: var(--fs-1); }
        .history-compact .products-grid { gap:.5rem; }
        .history-compact .product-preview-beautiful { padding: var(--pad-1); border-radius:10px; }
        .history-compact .product-name-beautiful { font-size: var(--fs-2); }
        .history-compact .product-details-beautiful { font-size: var(--fs-3); opacity:.85; }
      `}</style>

      {SHOW_FILTERS && (
        <motion.div
          className="history-filters"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="filter-tabs">
            {[
              { key: "all", label: "Todas" },
              { key: "completado", label: "Completadas" },
              { key: "pendiente", label: "Pendientes" },
              { key: "cancelado", label: "Canceladas" },
            ].map((tab, index) => (
              <motion.button
                key={tab.key}
                className={`filter-tab ${filter === tab.key ? "active" : ""}`}
                onClick={() => setFilter(tab.key)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <span className="tab-label">{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Contenedor de órdenes (compacto) */}
      <motion.div
        variants={itemFade}
        className="orders-container-beautiful history-compact"
        layout
      >
        <AnimatePresence>
          {filteredHistorial.map((order, index) => {
            const statusConfig = getStatusConfig(order.estado);
            const StatusIcon = statusConfig.Icon;
            return (
              <motion.div
                key={order.id}
                className="order-card-beautiful"
                onClick={() => setSelectedOrder(order)}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                transition={{
                  duration: 0.35,
                  delay: index * 0.05,
                  type: "spring",
                  stiffness: 120,
                }}
                whileHover={{
                  scale: 1.01,
                  y: -3,
                  boxShadow: "0 16px 32px rgba(0,0,0,0.08)",
                }}
                whileTap={{ scale: 0.99 }}
                layout
              >
                <div
                  className="order-card-glow"
                  style={{ background: statusConfig.gradient }}
                />
                <div
                  className="order-header-beautiful"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "0.6rem",
                  }}
                >
                  <div className="order-info-beautiful">
                    <motion.h4
                      className="order-number-beautiful"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {order.numeroOrden || `Orden #${order.id.slice(-8)}`}
                    </motion.h4>
                    <motion.p
                      className="order-date-beautiful"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Calendar size={14} /> {formatOrderDate(order.fecha)}
                      </span>
                    </motion.p>
                  </div>

                  <div
                    className="order-status-beautiful"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: ".5rem",
                    }}
                  >
                    <motion.div
                      className={`status-badge-beautiful ${statusConfig.color}`}
                      style={{
                        background: statusConfig.gradient,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                      whileHover={{ scale: 1.05 }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.35, type: "spring" }}
                    >
                      <StatusIcon size={14} />
                      <span className="status-text">{statusConfig.text}</span>
                    </motion.div>
                    <motion.div
                      className="order-total-beautiful"
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      {formatCurrency(order.total)}
                    </motion.div>
                  </div>
                </div>

                <motion.div
                  className="order-products-preview-beautiful"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 }}
                >
                  <div className="products-grid">
                    {order.productos?.slice(0, 3).map((producto, idx) => (
                      <motion.div
                        key={idx}
                        className="product-preview-beautiful"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + idx * 0.08 }}
                        whileHover={{ scale: 1.03 }}
                      >
                        <div
                          className="product-image-placeholder"
                          aria-hidden
                          style={{ display: "flex", alignItems: "center" }}
                        >
                          <Package size={18} />
                        </div>
                        <div className="product-preview-info-beautiful">
                          <span className="product-name-beautiful">
                            {producto.nombre}
                          </span>
                          <span className="product-details-beautiful">
                            {producto.cantidad}x •{" "}
                            {formatCurrency(producto.precio)}
                          </span>

                          {/* Botón/enlace tipo "Toque para ver detalles" */}
                          {producto?.id && (
                            <button
                              className="product-view-link"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = `/producto/${producto.id}`;
                              }}
                              title="Ver producto"
                              aria-label={`Ver producto ${producto.nombre}`}
                            >
                              <Eye size={14} />
                              Ver producto
                              <motion.span
                                className="pv-arrow"
                                animate={{ x: [0, 4, 0] }}
                                transition={{ duration: 1.6, repeat: Infinity }}
                              >
                                <ArrowRight size={14} />
                              </motion.span>
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {order.productos?.length > 3 && (
                    <motion.div
                      className="more-products-beautiful"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.9 }}
                      whileHover={{ scale: 1.06 }}
                    >
                      <span className="more-count">
                        +{order.productos.length - 3}
                      </span>
                      <span className="more-text">más productos</span>
                    </motion.div>
                  )}
                </motion.div>

                <motion.div
                  className="order-card-footer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="view-details-hint">
                    <span>Toque para ver detalles</span>
                    <motion.span
                      className="arrow-icon"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      aria-hidden
                    >
                      <ArrowRight size={16} />
                    </motion.span>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Modal de detalles */}
      {/* Modal de detalles FULLSCREEN en móvil */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            className="order-modal-overlay-beautiful"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              className="order-modal-beautiful"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header-beautiful">
                <div className="modal-title-section">
                  <h3 className="modal-title">
                    {selectedOrder.numeroOrden ||
                      `Orden #${selectedOrder.id.slice(-8)}`}
                  </h3>
                  <div className="modal-subtitle">Detalles de tu compra</div>
                </div>
                <button
                  className="close-modal-beautiful"
                  onClick={() => setSelectedOrder(null)}
                >
                  ×
                </button>
              </div>

              <div className="modal-content-beautiful">
                {/* Resumen */}
                <div className="order-summary-beautiful">
                  <div className="summary-card">
                    <div className="summary-item">
                      <span className="summary-label">
                        <Calendar size={14} /> Fecha
                      </span>
                      <span className="summary-value">
                        {new Date(
                          selectedOrder.fecha?.seconds
                            ? selectedOrder.fecha.seconds * 1000
                            : selectedOrder.fecha
                        ).toLocaleString("es-DO")}
                      </span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">
                        <ShoppingBag size={14} /> Estado
                      </span>
                      <span className="summary-status">
                        {selectedOrder.estado}
                      </span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">
                        <CircleDollarSign size={14} /> Total
                      </span>
                      <span className="summary-total">
                        DOP{" "}
                        {new Intl.NumberFormat("es-DO").format(
                          selectedOrder.total
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Productos */}
                <div className="products-grid-modal">
                  {selectedOrder.productos?.map((producto, idx) => (
                    <div key={idx} className="product-item-beautiful">
                      <div className="product-info-modal">
                        <span className="product-name-modal">
                          {producto.nombre}
                        </span>
                        <span className="product-details-modal">
                          {producto.cantidad} × DOP{" "}
                          {new Intl.NumberFormat("es-DO").format(
                            producto.precio
                          )}
                        </span>
                      </div>
                      <div className="product-subtotal-beautiful">
                        DOP{" "}
                        {new Intl.NumberFormat("es-DO").format(
                          producto.cantidad * producto.precio
                        )}
                      </div>
                      <button
                        className="btn-view-product-modal"
                        onClick={() =>
                          (window.location.href = `/producto/${producto.id}`)
                        }
                      >
                        <Eye size={16} /> Ver producto
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* Modal de detalles de orden (versión alternativa aún presente, no se borra) */
function OrderDetailsModal({
  order,
  onClose,
  formatCurrency,
  formatOrderDate,
  getStatusColor,
  getStatusText,
}) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="order-details-modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2>{order.numeroOrden || `Orden #${order.id.slice(-8)}`}</h2>
            <p className="order-date-detail">{formatOrderDate(order.fecha)}</p>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </div>

        <div className="modal-content">
          <div className="order-status-section">
            <span
              className={`status-badge large ${getStatusColor(order.estado)}`}
            >
              {getStatusText(order.estado)}
            </span>
            {order.estadoPago && (
              <span className="payment-status">
                Pago: {order.estadoPago === "pagado" ? "Pagado" : "Fallido"}
              </span>
            )}
          </div>

          <div className="order-summary">
            <h3>Resumen de la orden</h3>
            <div className="summary-row total">
              <span>Total pagado:</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>

          <div className="products-section">
            <h3>Productos ({order.productos?.length || 0})</h3>
            <div className="products-list">
              {order.productos?.map((producto, idx) => (
                <div key={idx} className="product-detail-item">
                  <div className="product-detail-info">
                    <h4>{producto.nombre}</h4>
                    <p className="product-company">
                      {producto.empresa || "N/A"}
                    </p>
                    <div className="product-pricing">
                      <span className="quantity">
                        Cantidad: {producto.cantidad}
                      </span>
                      <span className="price">
                        Precio unitario: {formatCurrency(producto.precio)}
                      </span>
                      <span className="subtotal">
                        Subtotal:{" "}
                        {formatCurrency(
                          producto.subtotal ||
                            producto.precio * producto.cantidad
                        )}
                      </span>
                    </div>
                    <button
                      className="btn-view-product-modal"
                      onClick={() =>
                        (window.location.href = `/producto/${producto.id}`)
                      }
                      title="Ver producto"
                    >
                      <Eye size={16} />
                      Ver producto
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {order.direccionEntrega && (
            <div className="delivery-section">
              <h3>Información de entrega</h3>
              <p>{order.direccionEntrega}</p>
              {order.telefonoContacto && (
                <p>Teléfono: {order.telefonoContacto}</p>
              )}
            </div>
          )}

          {order.metodoPago && (
            <div className="payment-section">
              <h3>Información de pago</h3>
              <p>Método: {order.metodoPago}</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function Icon({ name }) {
  const icons = {
    perfil: (
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    ),
    historial: (
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M21 12a9 9 0 1 1-3-6.7L21 7"></path>
        <path d="M12 7v6l4 2"></path>
      </svg>
    ),
    direcciones: (
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    ),
    logout: (
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <path d="M16 17l5-5-5-5"></path>
        <path d="M21 12H9"></path>
      </svg>
    ),
  };
  return <span className="icon">{icons[name]}</span>;
}

/* Loader */
function Loader({ visible, text = "Cargando..." }) {
  if (!visible) return null;
  return (
    <div className="loaderOverlay" role="status" aria-live="polite">
      <div className="loaderInner">
        <div className="loader">
          <div className="spinner">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
        <p className="loaderText">{text}</p>
      </div>
    </div>
  );
}

function ConfirmModal({
  abierto,
  titulo,
  descripcion,
  onCancel,
  onConfirm,
  dangerText = "Confirmar",
}) {
  if (!abierto) return null;
  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <motion.div
        className="modal-card card"
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
      >
        <h3 id="modal-title" className="modal-title">
          {titulo}
        </h3>
        <p className="modal-desc">{descripcion}</p>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel}>
            Cancelar
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            {dangerText}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* =========================
   PROFILE PAGE
   ========================= */
export default function Profile() {
  const { usuario, usuarioInfo, actualizarUsuarioInfo, logout } = useAuth();
  const navigate = useNavigate();

  const [vista, setVista] = useState("perfil");
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ text: "", tipo: "" });

  const [form, setForm] = useState({
    nombre: usuario?.displayName || "",
    email: usuario?.email || "",
    telefono: "",
    direccion: "",
    fotoURL: usuario?.photoURL || "",
  });

  const [localFile, setLocalFile] = useState(null);
  const [localPreview, setLocalPreview] = useState(null);

  const [historial, setHistorial] = useState([]);
  const [direcciones, setDirecciones] = useState([]);
  const [modalEntregaOpen, setModalEntregaOpen] = useState(false);
  const [direccionEditar, setDireccionEditar] = useState(null);

  const [confirmRemoveImageOpen, setConfirmRemoveImageOpen] = useState(false);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [showFullLoader, setShowFullLoader] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  useEffect(() => {
    if (usuarioInfo) {
      setForm((p) => ({
        ...p,
        telefono: usuarioInfo.telefono || "",
        direccion: usuarioInfo.direccion || "",
        fotoURL: usuarioInfo.fotoURL || usuario?.photoURL || "",
      }));
    } else {
      setForm((p) => ({ ...p, fotoURL: usuario?.photoURL || "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuarioInfo, usuario?.photoURL]);

  useEffect(() => {
    if (!usuario) return;
    fetchHistorial();
    fetchDirecciones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario]);

  const fetchHistorial = async () => {
    try {
      const q = query(
        collection(db, "orders"),
        where("userId", "==", usuario.uid)
      );
      const snap = await getDocs(q);
      setHistorial(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("fetchHistorial:", err);
    }
  };

  const fetchDirecciones = async () => {
    try {
      const q = query(
        collection(db, "direcciones"),
        where("usuarioId", "==", usuario.uid)
      );
      const snap = await getDocs(q);
      setDirecciones(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("fetchDirecciones:", err);
    }
  };

  const avatarSrc = useMemo(() => {
    if (localPreview) return localPreview;
    if (form.fotoURL) return form.fotoURL;
    const fallback = form.nombre || form.email || usuario?.email || "U";
    return avatarDataUrl(fallback, 512);
  }, [localPreview, form.fotoURL, form.nombre, form.email, usuario?.email]);

  const publicName = useMemo(() => {
    if (form.nombre && form.nombre.trim()) return form.nombre;
    const e = form.email || usuario?.email || "";
    const local = e.split("@")[0] || "Usuario";
    return local.charAt(0).toUpperCase() + local.slice(1);
  }, [form.nombre, form.email, usuario?.email]);

  const toast = (text, tipo = "info", ms = 3500) => {
    setMensaje({ text, tipo });
    if (ms) setTimeout(() => setMensaje({ text: "", tipo: "" }), ms);
  };

  const handleLogout = async () => {
    try {
      setConfirmLogoutOpen(false);
      await logout();
      navigate("/");
    } catch (err) {
      console.error("logout:", err);
      toast("Error cerrando sesión.", "error", 5000);
    }
  };

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setLocalFile(f);
    const url = URL.createObjectURL(f);
    setLocalPreview(url);
  };

  const cancelLocalPreview = () => {
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalFile(null);
    setLocalPreview(null);
  };

  const uploadLocalImage = async () => {
    if (!localFile) return toast("Selecciona una imagen primero.", "error");
    setLoading(true);
    try {
      const url = await subirImagenCloudinary(localFile);
      await actualizarUsuarioInfo({ fotoURL: url });
      await updateProfile(usuario, { photoURL: url });
      setForm((p) => ({ ...p, fotoURL: url }));
      cancelLocalPreview();
      toast("Foto actualizada.", "success");
    } catch (err) {
      console.error("uploadLocalImage:", err);
      toast("Error subiendo imagen.", "error", 5000);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      await actualizarUsuarioInfo({
        telefono: form.telefono,
        direccion: form.direccion,
        displayName: form.nombre,
      });

      const payload = {
        telefono: form.telefono,
        direccion: form.direccion,
        displayName: form.nombre,
        updatedAt: new Date(),
      };

      try {
        await setDoc(doc(db, "users", usuario.uid), payload, { merge: true });
      } catch (err) {
        console.warn("No se pudo escribir users/{uid}:", err);
      }

      try {
        await setDoc(doc(db, "usuarios", usuario.uid), payload, {
          merge: true,
        });
      } catch (err) {
        console.warn("No se pudo escribir usuarios/{uid}:", err);
      }

      const cambios = {};
      if (usuario.displayName !== form.nombre)
        cambios.displayName = form.nombre;
      if (Object.keys(cambios).length) await updateProfile(usuario, cambios);

      setEditMode(false);
      toast("Perfil guardado.", "success");
    } catch (err) {
      console.error("Error guardando perfil:", err);
      toast("Error guardando perfil.", "error");
    } finally {
      setLoading(false);
    }
  };

  const confirmRemoveImage = async () => {
    setLoading(true);
    try {
      await updateProfile(usuario, { photoURL: "" });
      await actualizarUsuarioInfo({ fotoURL: "" });
      setForm((p) => ({ ...p, fotoURL: "" }));
      cancelLocalPreview();
      toast("Imagen de perfil removida.", "success");
    } catch (err) {
      console.error("confirmRemoveImage:", err);
      toast("Error removiendo imagen.", "error");
    } finally {
      setLoading(false);
      setConfirmRemoveImageOpen(false);
    }
  };

  const handleSeleccionarDireccion = async (dir) => {
    try {
      const direccionCompleta =
        typeof dir === "string" ? dir : dir?.direccionCompleta || "";
      const metodo = dir && dir.metodoEntrega ? dir.metodoEntrega : "domicilio";

      setShowFullLoader(true);

      await actualizarUsuarioInfo({
        direccion: direccionCompleta,
        metodoEntrega: metodo,
      });

      const payload = {
        direccion: direccionCompleta,
        metodoEntrega: metodo,
        updatedAt: new Date(),
      };
      try {
        await setDoc(doc(db, "users", usuario.uid), payload, { merge: true });
      } catch (err) {
        console.warn("No se pudo escribir users/{uid}:", err);
      }
      try {
        await setDoc(doc(db, "usuarios", usuario.uid), payload, {
          merge: true,
        });
      } catch (err) {
        console.warn("No se pudo escribir usuarios/{uid}:", err);
      }

      try {
        let snap = await getDoc(doc(db, "users", usuario.uid));
        if (!snap.exists())
          snap = await getDoc(doc(db, "usuarios", usuario.uid));
        if (snap && snap.exists()) {
          const data = snap.data() || {};
          await actualizarUsuarioInfo({
            direccion: data.direccion || direccionCompleta,
            metodoEntrega: data.metodoEntrega || metodo,
          });
        }
      } catch (err) {
        console.warn("No se pudo releer documento de usuario:", err);
      }

      if (modalEntregaOpen) setModalEntregaOpen(false);
      await fetchDirecciones();
      setForm((p) => ({ ...p, direccion: direccionCompleta }));

      toast("Dirección seleccionada y guardada.", "success");

      window.location.reload();
    } catch (err) {
      console.error("handleSeleccionarDireccion error:", err);
      setShowFullLoader(false);
      toast("Error seleccionando dirección.", "error", 5000);
    }
  };

  const eliminarDireccion = async (id) => {
    try {
      await deleteDoc(doc(db, "direcciones", id));

      if (usuario?.direccion) {
        const deletedAddress = direcciones.find((dir) => dir.id === id);
        if (
          deletedAddress &&
          usuario.direccion === deletedAddress.direccionCompleta
        ) {
          await actualizarUsuarioInfo({
            direccion: "",
            metodoEntrega: "",
            selectedDeliveryMethod: "",
          });
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      }

      await fetchDirecciones();
      toast("Dirección eliminada correctamente.", "success");
    } catch (err) {
      console.error("eliminarDireccion:", err);
      toast("Error eliminando dirección.", "error");
    }
  };

  const confirmarEliminar = (id) => {
    setDeleteTargetId(id);
    setShowDeleteConfirm(true);
  };

  const cancelarEliminar = () => {
    setShowDeleteConfirm(false);
    setDeleteTargetId(null);
  };

  const procederEliminar = () => {
    if (deleteTargetId) {
      eliminarDireccion(deleteTargetId);
      setShowDeleteConfirm(false);
      setDeleteTargetId(null);
    }
  };

  if (!usuario || !usuarioInfo) {
    return (
      <main
        className="min-h-screen flex items-start justify-center bg-slate-50"
        style={{ paddingTop: "var(--content-offset, 100px)" }}
      >
        <p className="text-lg animate-pulse">Cargando perfil...</p>
      </main>
    );
  }

  return (
    <motion.main
      className="profile-page"
      variants={pageVariant}
      initial="hidden"
      animate="enter"
      exit="exit"
    >
      {/* NAVEGACIÓN SEPARADA */}
      <div className="navigation-container">
        <nav className="profile-dock" aria-label="Navegación de perfil">
          <button
            className={`dock-btn ${vista === "perfil" ? "active" : ""}`}
            onClick={() => setVista("perfil")}
            aria-label="Perfil"
          >
            <Icon name="perfil" />
            <span>Perfil</span>
          </button>

          <button
            className={`dock-btn ${vista === "historial" ? "active" : ""}`}
            onClick={() => setVista("historial")}
            aria-label="Historial"
          >
            <Icon name="historial" />
            <span>Historial</span>
          </button>

          <button
            className={`dock-btn ${vista === "direcciones" ? "active" : ""}`}
            onClick={() => setVista("direcciones")}
            aria-label="Direcciones"
          >
            <Icon name="direcciones" />
            <span>Direcciones</span>
          </button>

          <button
            className="dock-btn danger"
            onClick={() => setConfirmLogoutOpen(true)}
            aria-label="Cerrar sesión"
          >
            <Icon name="logout" />
            <span>Salir</span>
          </button>
        </nav>
      </div>

      {/* CONTENIDO SEPARADO */}
      <main className="main-content">
        <div className="main-card">
          <AnimatePresence mode="wait">
            {vista === "perfil" && (
              <motion.section
                key="perfil"
                variants={itemFade}
                initial="hidden"
                animate="show"
                exit="hidden"
              >
                <div className="profile-header big">
                  <div className="avatar-block large">
                    <img src={avatarSrc} alt="Avatar" className="avatar-img" />
                  </div>
                  <div className="profile-meta big">
                    <h1 className="profile-name">{publicName}</h1>
                    <p className="profile-email">{form.email}</p>
                    <p className="muted small">
                      UID: <span className="mono">{usuario.uid}</span>
                    </p>

                    <div className="profile-actions">
                      <label className="btn btn-primary upload-btn">
                        Subir foto
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleFile}
                          className="hidden"
                          aria-label="Subir foto"
                        />
                      </label>
                      <button
                        className="btn btn-ghost"
                        onClick={() => setConfirmRemoveImageOpen(true)}
                      >
                        Quitar
                      </button>
                      {localPreview && (
                        <>
                          <button
                            className="btn btn-success"
                            onClick={uploadLocalImage}
                            disabled={loading}
                          >
                            Guardar foto
                          </button>
                          <button
                            className="btn btn-outline"
                            onClick={cancelLocalPreview}
                          >
                            Cancelar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-grid big">
                  <div className="form-row">
                    <label>Nombre</label>
                    <input
                      name="nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      disabled={!editMode}
                    />
                  </div>
                  <div className="form-row">
                    <label>Email</label>
                    <input name="email" value={form.email} disabled />
                  </div>
                  <div className="form-row">
                    <label>Teléfono</label>
                    <input
                      name="telefono"
                      value={form.telefono}
                      onChange={handleChange}
                      disabled={!editMode}
                    />
                  </div>
                  <div className="form-row full">
                    <label>Dirección completa</label>
                    <textarea
                      name="direccion"
                      value={form.direccion}
                      onChange={handleChange}
                      disabled={!editMode}
                      rows={4}
                    />
                    <p className="muted hint">Pulsa "Editar" para modificar.</p>
                  </div>

                  <div className="form-actions">
                    {!editMode ? (
                      <button
                        onClick={() => setEditMode(true)}
                        className="btn btn-primary"
                      >
                        Editar perfil
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={saveProfile}
                          className="btn btn-success"
                          disabled={loading}
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => {
                            setEditMode(false);
                            cancelLocalPreview();
                          }}
                          className="btn btn-ghost"
                        >
                          Cancelar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.section>
            )}

            {vista === "historial" && (
              <motion.section
                key="historial"
                variants={itemFade}
                initial="hidden"
                animate="show"
                exit="hidden"
              >
                <h2 className="section-title large">Historial de compras</h2>
                <HistorialSection historial={historial} />
              </motion.section>
            )}

            {vista === "direcciones" && (
              <motion.section
                key="direcciones"
                variants={itemFade}
                initial="hidden"
                animate="show"
                exit="hidden"
              >
                <div className="direcciones-head">
                  <h2 className="section-title large">Direcciones</h2>
                  <div>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setDireccionEditar(null);
                        setModalEntregaOpen(true);
                      }}
                    >
                      Añadir dirección
                    </button>
                  </div>
                </div>

                <div className="cards-list">
                  <div className="address-card large">
                    <div className="address-content">
                      <div className="address-title">
                        Recoger en: Playcenter Universal Santiago
                      </div>
                      <div className="muted break-words">
                        {TIENDA_PLAYCENTER.direccionCompleta}
                      </div>
                      <a
                        href={TIENDA_PLAYCENTER.ubicacion}
                        target="_blank"
                        rel="noreferrer"
                        className="link"
                      >
                        Ver en Maps
                      </a>
                    </div>
                    <div className="address-actions">
                      <button
                        onClick={() =>
                          handleSeleccionarDireccion(TIENDA_PLAYCENTER)
                        }
                        className="btn btn-success"
                      >
                        Seleccionar
                      </button>
                    </div>
                  </div>

                  {direcciones.length === 0 ? (
                    <div className="empty">
                      No tienes direcciones guardadas.
                    </div>
                  ) : (
                    direcciones.map((d) => (
                      <div key={d.id} className="address-card large">
                        <div className="address-content">
                          <div className="address-title break-words">
                            {d.direccionCompleta ||
                              `${d.numeroCalle || ""} ${
                                d.numeroCasa ? "Casa " + d.numeroCasa : ""
                              }, ${d.ciudad || ""}, ${d.provincia || ""}`}
                          </div>
                          <div className="muted">
                            Método: {d.metodoEntrega || "domicilio"}
                          </div>
                          {d.referencia && (
                            <div className="muted">Ref: {d.referencia}</div>
                          )}
                          {d.ubicacion && (
                            <a
                              href={d.ubicacion}
                              target="_blank"
                              rel="noreferrer"
                              className="link"
                            >
                              Ver en Maps
                            </a>
                          )}
                        </div>

                        <div className="address-actions">
                          <button
                            onClick={() => {
                              setDireccionEditar(d);
                              setModalEntregaOpen(true);
                            }}
                            className="address-action-btn edit-btn"
                            aria-label="Editar dirección"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleSeleccionarDireccion(d)}
                            className="address-action-btn select-btn"
                            aria-label="Seleccionar dirección"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => confirmarEliminar(d.id)}
                            className="address-action-btn delete-btn"
                            aria-label="Eliminar dirección"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {modalEntregaOpen && (
                  <Entrega
                    abierto={modalEntregaOpen}
                    onClose={async () => {
                      setModalEntregaOpen(false);
                      setDireccionEditar(null);
                      await fetchDirecciones();
                    }}
                    usuarioId={usuario.uid}
                    direccionEditar={direccionEditar}
                    actualizarLista={fetchDirecciones}
                  />
                )}
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Modales y loader */}
      <ConfirmModal
        abierto={confirmRemoveImageOpen}
        titulo="Quitar imagen de perfil"
        descripcion="Se quitará la URL de tu perfil (no borra el archivo en Cloudinary)."
        onCancel={() => setConfirmRemoveImageOpen(false)}
        onConfirm={confirmRemoveImage}
        dangerText="Quitar imagen"
      />

      <ConfirmModal
        abierto={confirmLogoutOpen}
        titulo="Cerrar sesión"
        descripcion="¿Estás seguro que quieres cerrar sesión?"
        onCancel={() => setConfirmLogoutOpen(false)}
        onConfirm={handleLogout}
        dangerText="Cerrar sesión"
      />

      <Loader visible={showFullLoader} text="Guardando..." />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 999999,
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                backgroundColor: "white",
                padding: "2rem",
                borderRadius: "12px",
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                maxWidth: "400px",
                width: "90%",
                textAlign: "center",
                zIndex: 9999999,
              }}
            >
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "600",
                  color: "#1f2937",
                  marginBottom: "1rem",
                }}
              >
                ¿Eliminar dirección?
              </h3>
              <p
                style={{
                  color: "#6b7280",
                  marginBottom: "2rem",
                  lineHeight: "1.5",
                }}
              >
                ¿Estás seguro que quieres eliminar esta dirección? Esta acción
                no se puede deshacer.
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  justifyContent: "center",
                }}
              >
                <button
                  onClick={cancelarEliminar}
                  style={{
                    padding: "0.75rem 1.5rem",
                    borderRadius: "8px",
                    border: "2px solid #e5e7eb",
                    backgroundColor: "white",
                    color: "#374151",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) =>
                    (e.target.style.backgroundColor = "#f9fafb")
                  }
                  onMouseOut={(e) => (e.target.style.backgroundColor = "white")}
                >
                  Cancelar
                </button>
                <button
                  onClick={procederEliminar}
                  style={{
                    padding: "0.75rem 1.5rem",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "#ef4444",
                    color: "white",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) =>
                    (e.target.style.backgroundColor = "#dc2626")
                  }
                  onMouseOut={(e) =>
                    (e.target.style.backgroundColor = "#ef4444")
                  }
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {mensaje.text && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`toast ${
            mensaje.tipo === "success"
              ? "toast-success"
              : mensaje.tipo === "error"
              ? "toast-error"
              : "toast-info"
          }`}
        >
          {mensaje.text}
        </motion.div>
      )}
    </motion.main>
  );
}
