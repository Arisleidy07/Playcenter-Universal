import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { subirImagenCloudinary } from "../utils/subirImagenCloudinary";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import Entrega from "../components/Entrega";
import {
  User,
  Package,
  MapPin,
  CreditCard,
  Settings,
  LogOut,
  Calendar,
  ShoppingBag,
  CircleDollarSign,
  Clock,
  ArrowRight,
  Hourglass,
  XCircle,
  CheckCircle,
  Pencil,
  Check,
  Trash2,
  Menu,
  X,
  Lock,
  Bell,
  Globe,
  ChevronRight,
  ChevronDown,
  Camera,
  Image as ImageIcon,
  Upload,
  Eye,
  Store,
  Users,
  TrendingUp,
  BarChart,
  Plus,
  Star,
} from "lucide-react";
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
        className="orders-container-beautiful"
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
                }}
                whileTap={{ scale: 0.99 }}
                layout
              >
                <div
                  className="order-card-glow"
                  style={{ background: statusConfig.gradient }}
                />
                <div className="order-header-beautiful">
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

                  <div className="order-status-beautiful">
                    <motion.div
                      className={`status-badge-beautiful ${statusConfig.color}`}
                      style={{
                        background: statusConfig.gradient,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "8px 16px",
                        borderRadius: "999px",
                        color: "#ffffff",
                        fontWeight: "bold",
                        fontSize: "0.875rem",
                      }}
                      whileHover={{ scale: 1.05 }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.35, type: "spring" }}
                    >
                      <StatusIcon size={14} />
                      <span
                        className="status-text"
                        style={{ color: "#ffffff" }}
                      >
                        {statusConfig.text}
                      </span>
                    </motion.div>
                    <motion.div
                      className="order-total-beautiful"
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      style={{
                        color: "#000000",
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                      }}
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
                          <span
                            className="product-name-beautiful"
                            style={{
                              color: "#000000",
                              fontWeight: "600",
                              fontSize: "0.95rem",
                            }}
                          >
                            {producto.nombre}
                          </span>
                          <span
                            className="product-details-beautiful"
                            style={{
                              color: "#4b5563",
                              fontSize: "0.875rem",
                            }}
                          >
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

      {/* Modal FULLSCREEN con estilos inline */}
      <AnimatePresence>
        {selectedOrder && (
          <div
            onClick={() => setSelectedOrder(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.85)",
              zIndex: 99999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#ffffff",
                borderRadius: "16px",
                width: "100%",
                maxWidth: "800px",
                maxHeight: "90vh",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                border: "3px solid #2563eb",
              }}
            >
              {/* Header */}
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                  color: "white",
                  padding: "24px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "1.5rem",
                      fontWeight: "bold",
                    }}
                  >
                    {selectedOrder.numeroOrden ||
                      `Orden #${selectedOrder.id.slice(-8)}`}
                  </h2>
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      fontSize: "0.9rem",
                      opacity: 0.9,
                    }}
                  >
                    Detalles de tu pedido
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  style={{
                    background: "rgba(255, 255, 255, 0.2)",
                    border: "none",
                    color: "white",
                    width: "40px",
                    height: "40px",
                    borderRadius: "8px",
                    fontSize: "28px",
                    cursor: "pointer",
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>

              {/* Contenido scrolleable */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "24px",
                  background: "#f9fafb",
                }}
              >
                {/* Resumen */}
                <div
                  style={{
                    background: "white",
                    borderRadius: "12px",
                    padding: "20px",
                    marginBottom: "20px",
                    border: "2px solid #e5e7eb",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 16px 0",
                      fontSize: "1.1rem",
                      fontWeight: "bold",
                      color: "#111827",
                    }}
                  >
                    Resumen
                  </h3>
                  <div style={{ display: "grid", gap: "12px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span
                        style={{
                          color: "#6b7280",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <Calendar size={16} /> Fecha:
                      </span>
                      <strong style={{ color: "#111827" }}>
                        {formatOrderDate(selectedOrder.fecha)}
                      </strong>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span
                        style={{
                          color: "#6b7280",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <ShoppingBag size={16} /> Estado:
                      </span>
                      <strong style={{ color: "#111827" }}>
                        {selectedOrder.estado}
                      </strong>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        paddingTop: "12px",
                        borderTop: "1px solid #e5e7eb",
                      }}
                    >
                      <span
                        style={{
                          color: "#6b7280",
                          fontSize: "1.1rem",
                          fontWeight: "bold",
                        }}
                      >
                        Total:
                      </span>
                      <strong style={{ color: "#2563eb", fontSize: "1.25rem" }}>
                        {formatCurrency(selectedOrder.total)}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Productos */}
                <div
                  style={{
                    background: "white",
                    borderRadius: "12px",
                    padding: "20px",
                    border: "2px solid #e5e7eb",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 16px 0",
                      fontSize: "1.1rem",
                      fontWeight: "bold",
                      color: "#111827",
                    }}
                  >
                    Productos ({selectedOrder.productos?.length || 0})
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    {selectedOrder.productos?.map((producto, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "12px",
                          background: "#f9fafb",
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontWeight: "600",
                              color: "#111827",
                              marginBottom: "4px",
                            }}
                          >
                            {producto.nombre}
                          </div>
                          <div
                            style={{ fontSize: "0.875rem", color: "#6b7280" }}
                          >
                            {producto.cantidad} ×{" "}
                            {formatCurrency(producto.precio)}
                          </div>
                        </div>
                        <div
                          style={{
                            fontWeight: "bold",
                            color: "#2563eb",
                            fontSize: "1.1rem",
                          }}
                        >
                          {formatCurrency(producto.cantidad * producto.precio)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
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

// Componente de menú lateral
function SidebarMenu({ vista, setVista, onLogout, isMobile, onClose }) {
  const navigate = useNavigate();

  const menuItems = [
    { id: "perfil", label: "Ver mi perfil", icon: User },
    { id: "historial", label: "Historial de búsqueda", icon: Clock },
    { id: "ubicaciones", label: "Mis direcciones", icon: MapPin },
    { id: "pedidos", label: "Mis pedidos", icon: ShoppingBag },
    { id: "pagos", label: "Métodos de pago", icon: CreditCard },
    { id: "tiendas", label: "Mi tienda", icon: Store },
    { id: "configuracion", label: "Configuración", icon: Settings },
  ];

  const handleItemClick = (id) => {
    setVista(id);
    if (isMobile && onClose) onClose();
  };

  return (
    <div className="sidebar-menu">
      {menuItems.map((item) => {
        const IconComponent = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => handleItemClick(item.id)}
            className={`sidebar-item ${vista === item.id ? "active" : ""}`}
          >
            <IconComponent size={20} />
            <span>{item.label}</span>
            <ChevronRight size={16} className="sidebar-item-arrow" />
          </button>
        );
      })}

      <div className="sidebar-divider" />

      <button onClick={onLogout} className="sidebar-item danger">
        <LogOut size={20} />
        <span>Cerrar sesión</span>
        <ChevronRight size={16} className="sidebar-item-arrow" />
      </button>
    </div>
  );
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ text: "", tipo: "" });
  const [photoUploadModalOpen, setPhotoUploadModalOpen] = useState(false);
  const [empresas, setEmpresas] = useState([]);
  const [stats, setStats] = useState({
    seguidos: 0,
    seguidores: 0,
    publicaciones: 0,
  });
  const [miTienda, setMiTienda] = useState(null);
  const [loadingTienda, setLoadingTienda] = useState(true);
  const [cambiarPasswordOpen, setCambiarPasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    actual: "",
    nueva: "",
    confirmar: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [notificaciones, setNotificaciones] = useState({
    email: true,
    pedidos: true,
    ofertas: false,
  });
  const [idioma, setIdioma] = useState("es");

  // Refs para inputs de archivo
  const fileInputRef = React.useRef(null);
  const cameraInputRef = React.useRef(null);

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
    fetchEmpresas();
    loadNotificaciones();

    // Iniciar listeners en tiempo real
    const unsubscribeStats = fetchStats();
    const unsubscribeTienda = fetchMiTienda();

    // Limpiar listeners al desmontar
    return () => {
      if (unsubscribeStats) unsubscribeStats.then((unsub) => unsub && unsub());
      if (unsubscribeTienda)
        unsubscribeTienda.then((unsub) => unsub && unsub());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario]);

  const fetchHistorial = async () => {
    try {
      const q = query(
        collection(db, "orders"),
        where("userId", "==", usuario.uid)
      );
      const snap = await getDocs(q);
      const pedidos = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setHistorial(pedidos);
    } catch (err) {
      console.error("Error fetchHistorial:", err);
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

  const fetchEmpresas = async () => {
    try {
      // TODO: Implementar query real cuando exista la colección
      setEmpresas([]);
    } catch (err) {
      console.error("fetchEmpresas:", err);
    }
  };

  const fetchStats = async () => {
    try {
      // Contar publicaciones (productos) del usuario en TIEMPO REAL
      const productosQuery = query(
        collection(db, "productos"),
        where("tienda_id", "==", "playcenter_universal")
      );

      // Listener en tiempo real
      const unsubscribe = onSnapshot(productosQuery, (snapshot) => {
        setStats({
          seguidos: 0,
          seguidores: 0,
          publicaciones: snapshot.docs.length,
        });
      });

      // Guardar unsubscribe para limpieza
      return unsubscribe;
    } catch (err) {
      console.error("fetchStats:", err);
      // Fallback si falla
      setStats({
        seguidos: 0,
        seguidores: 0,
        publicaciones: 0,
      });
    }
  };

  const fetchMiTienda = async () => {
    try {
      setLoadingTienda(true);

      // Buscar la tienda principal en TIEMPO REAL
      const playcenterRef = doc(db, "tiendas", "playcenter_universal");

      // Listener en tiempo real para la tienda
      const unsubscribe = onSnapshot(playcenterRef, (docSnap) => {
        if (docSnap.exists()) {
          const playcenterData = {
            id: docSnap.id,
            ...docSnap.data(),
          };

          // Verificar si el usuario es admin o si la tienda no tiene propietario
          const esAdmin = usuarioInfo?.es_admin || usuarioInfo?.rol === "admin";
          const tieneSinPropietario =
            !playcenterData.propietario_id ||
            playcenterData.propietario_id === "ADMIN";

          if (esAdmin || tieneSinPropietario) {
            setMiTienda(playcenterData);
          } else {
            setMiTienda(null);
          }
        } else {
          setMiTienda(null);
        }
        setLoadingTienda(false);
      });

      // Guardar unsubscribe para limpieza
      return unsubscribe;
    } catch (err) {
      console.error("Error fetchMiTienda:", err);
      setMiTienda(null);
      setLoadingTienda(false);
    }
  };

  const loadNotificaciones = () => {
    const saved = localStorage.getItem(`notificaciones_${usuario.uid}`);
    if (saved) setNotificaciones(JSON.parse(saved));
    const savedIdioma = localStorage.getItem(`idioma_${usuario.uid}`);
    if (savedIdioma) setIdioma(savedIdioma);
  };

  const handleNotificacionChange = (tipo) => {
    const nuevas = { ...notificaciones, [tipo]: !notificaciones[tipo] };
    setNotificaciones(nuevas);
    localStorage.setItem(
      `notificaciones_${usuario.uid}`,
      JSON.stringify(nuevas)
    );
    toast("Notificaciones actualizadas", "success");
  };

  const handleIdiomaChange = (e) => {
    const nuevoIdioma = e.target.value;
    setIdioma(nuevoIdioma);
    localStorage.setItem(`idioma_${usuario.uid}`, nuevoIdioma);
    toast("Idioma actualizado", "success");
  };

  const handleCambiarPassword = async () => {
    setPasswordError("");
    if (
      !passwordForm.actual ||
      !passwordForm.nueva ||
      !passwordForm.confirmar
    ) {
      setPasswordError("Todos los campos son requeridos");
      return;
    }
    if (passwordForm.nueva !== passwordForm.confirmar) {
      setPasswordError("Las contraseñas no coinciden");
      return;
    }
    if (passwordForm.nueva.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(
        usuario.email,
        passwordForm.actual
      );
      await reauthenticateWithCredential(usuario, credential);
      await updatePassword(usuario, passwordForm.nueva);
      setPasswordForm({ actual: "", nueva: "", confirmar: "" });
      setCambiarPasswordOpen(false);
      toast("Contraseña actualizada correctamente", "success");
    } catch (err) {
      if (err.code === "auth/wrong-password") {
        setPasswordError("La contraseña actual es incorrecta");
      } else {
        setPasswordError("Error: " + err.message);
      }
    } finally {
      setLoading(false);
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
        className="min-h-screen flex items-center justify-center bg-slate-50"
        style={{ paddingTop: "calc(var(--content-offset, 100px) + 40px)" }}
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
      {/* HEADER CON "HOLA, NOMBRE" Y DROPDOWN - ESQUINA */}
      <div className="profile-new-topbar">
        <div className="w-full px-3 md:px-4">
          <div className="flex justify-between items-center">
            {/* Hola, Nombre con dropdown - Esquina pequeño */}
            <div className="relative" style={{ zIndex: 100 }}>
              <button
                className="flex items-center gap-1 px-1.5 py-1 rounded hover:bg-gray-50 transition-colors"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span className="text-xs md:text-sm font-normal text-gray-700">
                  Hola, {publicName}
                </span>
                <ChevronDown
                  size={14}
                  className={`transition-transform ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown */}
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 min-w-[240px] overflow-hidden"
                    style={{ zIndex: 101 }}
                  >
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                      onClick={() => {
                        setEditModalOpen(true);
                        setDropdownOpen(false);
                      }}
                    >
                      <Pencil size={16} />
                      <span>Editar perfil</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left">
                      <Users size={16} />
                      <span>Cambiar cuenta</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left">
                      <Plus size={16} />
                      <span>Agregar cuenta</span>
                    </button>
                    <div className="h-px bg-gray-200 my-1" />
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left text-red-600"
                      onClick={() => {
                        setDropdownOpen(false);
                        setConfirmLogoutOpen(true);
                      }}
                    >
                      <LogOut size={16} />
                      <span>Cerrar sesión</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Botón menú lateral - Cambia a X cuando está abierto */}
            <button
              className="flex items-center gap-2 px-2 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all xl:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {sidebarOpen ? (
                <X size={20} className="text-red-600" />
              ) : (
                <Menu size={20} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* CABECERA DEL PERFIL: Avatar + Nombre + Botón Editar */}
      <div className="w-full px-4 xl:px-8 mt-3 md:mt-4 xl:mt-6 max-w-[1920px] mx-auto">
        <motion.div
          className="flex flex-col items-center gap-2 md:gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="relative">
            <img
              src={avatarSrc}
              alt="Avatar"
              className="w-20 h-20 md:w-24 md:h-24 xl:w-28 xl:h-28 rounded-full object-cover border-3 border-white shadow-lg ring-1 ring-gray-200"
            />
            <div className="absolute bottom-0 right-0 w-5 h-5 md:w-6 md:h-6 bg-green-500 border-3 border-white rounded-full" />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl xl:text-3xl font-bold text-gray-900">
              {publicName}
            </h1>
            <button
              className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all hover:scale-110 shadow-md"
              onClick={() => setEditModalOpen(true)}
              title="Editar perfil"
            >
              <Pencil size={14} className="md:w-4 md:h-4" />
            </button>
          </div>
        </motion.div>

        {/* INDICADORES DE SEGUIMIENTO */}
        <motion.div
          className="flex justify-center gap-6 md:gap-8 xl:gap-12 py-3 md:py-4 border-b border-gray-200 mt-3 md:mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <button
            className="flex flex-col items-center hover:opacity-75 hover:scale-105 transition-all group"
            onClick={() => toast("Próximamente")}
          >
            <span className="text-lg md:text-xl xl:text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              {stats.seguidos}
            </span>
            <span className="text-xs md:text-sm text-gray-600">Seguidos</span>
          </button>
          <button
            className="flex flex-col items-center hover:opacity-75 hover:scale-105 transition-all group"
            onClick={() => toast("Próximamente")}
          >
            <span className="text-lg md:text-xl xl:text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              {stats.seguidores}
            </span>
            <span className="text-xs md:text-sm text-gray-600">Seguidores</span>
          </button>
          <button
            className="flex flex-col items-center hover:opacity-75 hover:scale-105 transition-all group"
            onClick={() => toast("Próximamente")}
          >
            <span className="text-lg md:text-xl xl:text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              {stats.publicaciones}
            </span>
            <span className="text-xs md:text-sm text-gray-600">
              Publicaciones
            </span>
          </button>
        </motion.div>

        {/* MENÚ DE ACCESOS RÁPIDOS (ÍCONOS) - SLIDER VISIBLE */}
        <motion.div
          className="py-2 md:py-3 border-b border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="overflow-x-auto scrollbar-hide scroll-smooth px-2 md:px-4">
            <div className="flex justify-start xl:justify-center gap-2 md:gap-2 xl:gap-4 min-w-max xl:flex-wrap xl:max-w-full">
              {[
                { id: "perfil", icon: User, label: "Perfil" },
                { id: "historial", icon: Clock, label: "Historial" },
                { id: "ubicaciones", icon: MapPin, label: "Direcciones" },
                { id: "pedidos", icon: ShoppingBag, label: "Pedidos" },
                { id: "pagos", icon: CreditCard, label: "Pagos" },
                { id: "tiendas", icon: Store, label: "Mi Tienda" },
                {
                  id: "configuracion",
                  icon: Settings,
                  label: "Ajustes",
                  hideOnMobile: false,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    className={`flex flex-col items-center gap-1 md:gap-1.5 p-1.5 md:p-2 xl:p-2.5 rounded-lg transition-all hover:scale-105 min-w-[60px] md:min-w-[65px] xl:min-w-[80px] ${
                      vista === item.id && !item.isExternal
                        ? "bg-blue-50 shadow-sm"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setVista(item.id);
                    }}
                  >
                    <div
                      className={`w-10 h-10 md:w-11 md:h-11 xl:w-14 xl:h-14 flex items-center justify-center rounded-full transition-all ${
                        vista === item.id
                          ? "bg-blue-600 text-white scale-105"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      <Icon
                        size={item.id === vista ? 18 : 16}
                        className="md:w-5 md:h-5 xl:w-6 xl:h-6"
                      />
                    </div>
                    <span
                      className={`text-[9px] md:text-[10px] xl:text-xs font-medium text-center leading-tight max-w-[65px] xl:max-w-none ${
                        vista === item.id ? "text-blue-600" : "text-gray-700"
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Indicador de scroll para móvil */}
          <div className="flex justify-center gap-1 mt-3 xl:hidden">
            <div className="w-2 h-2 rounded-full bg-blue-600" />
            <div className="w-2 h-2 rounded-full bg-gray-300" />
            <div className="w-2 h-2 rounded-full bg-gray-300" />
          </div>
        </motion.div>
      </div>

      {/* BOTÓN HAMBURGUESA MÓVIL (LEGACY) */}
      <button
        className="sidebar-toggle-btn xl:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Abrir menú"
        style={{ display: "none" }}
      >
        <Menu size={24} />
        <span>Perfil</span>
      </button>

      {/* OVERLAY PARA CERRAR SIDEBAR EN MÓVIL */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="sidebar-overlay xl:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* CONTENEDOR PRINCIPAL - ANCHO COMPLETO */}
      <div className="w-full">
        {/* SIDEBAR LATERAL (solo móvil/tablet) */}
        <aside
          className={`profile-sidebar xl:hidden ${sidebarOpen ? "open" : ""}`}
        >
          {/* BOTÓN CERRAR EN MÓVIL */}
          <button
            className="sidebar-close-btn xl:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>

          <SidebarMenu
            vista={vista}
            setVista={setVista}
            onLogout={() => setConfirmLogoutOpen(true)}
            isMobile={true}
            onClose={() => setSidebarOpen(false)}
          />
        </aside>

        {/* CONTENIDO DINÁMICO - ANCHO COMPLETO */}
        <div className="w-full px-4 xl:px-8 py-6 md:py-8 xl:py-12 max-w-[1920px] mx-auto">
          <AnimatePresence mode="wait">
            {/* VISTA PERFIL */}
            {vista === "perfil" && (
              <motion.div
                key="perfil"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Mi Información
                </h2>

                {/* Card Principal de Información */}
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md border border-gray-200">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                          Nombre Completo
                        </label>
                        <p className="text-base md:text-lg font-bold text-gray-900">
                          {form.nombre || "No especificado"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                          Correo Electrónico
                        </label>
                        <p className="text-base md:text-lg text-gray-900 break-all">
                          {form.email}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                          Teléfono
                        </label>
                        <p className="text-base md:text-lg text-gray-900">
                          {form.telefono || "No especificado"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                          Dirección
                        </label>
                        <p className="text-base md:text-lg text-gray-900">
                          {form.direccion || "No especificada"}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200 flex flex-wrap gap-3">
                      <button
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all hover:scale-105 font-semibold shadow-md flex items-center gap-2"
                        onClick={() => setEditModalOpen(true)}
                      >
                        <Pencil size={18} />
                        Editar perfil
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card de Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-sm border border-blue-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-600 rounded-lg">
                        <ShoppingBag size={20} className="text-white" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-700">
                        Total Pedidos
                      </h3>
                    </div>
                    <p className="text-3xl font-bold text-blue-600">
                      {stats.publicaciones || 0}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 shadow-sm border border-green-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-green-600 rounded-lg">
                        <MapPin size={20} className="text-white" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-700">
                        Direcciones
                      </h3>
                    </div>
                    <p className="text-3xl font-bold text-green-600">
                      {direcciones.length || 0}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 shadow-sm border border-purple-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-purple-600 rounded-lg">
                        <User size={20} className="text-white" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-700">
                        Miembro desde
                      </h3>
                    </div>
                    <p className="text-lg font-bold text-purple-600">
                      {usuario?.metadata?.creationTime
                        ? new Date(
                            usuario.metadata.creationTime
                          ).toLocaleDateString("es-DO", {
                            year: "numeric",
                            month: "short",
                          })
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* VISTA HISTORIAL - Historial de Búsqueda */}
            {vista === "historial" && (
              <motion.div
                key="historial"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                  Tu historial de búsqueda
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Estos productos se vieron recientemente. Los utilizamos para
                  personalizar las recomendaciones.
                </p>
                <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-200 text-center">
                  <div className="text-6xl mb-4">👁️</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Próximamente
                  </h3>
                  <p className="text-gray-600">
                    Aquí aparecerán los productos que has visto.
                  </p>
                </div>
              </motion.div>
            )}

            {/* VISTA UBICACIONES */}
            {vista === "ubicaciones" && (
              <motion.div
                key="ubicaciones"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Mis Direcciones
                  </h2>
                  <button
                    className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
                    onClick={() => setModalEntregaOpen(true)}
                  >
                    <Plus size={20} />
                    <span className="font-semibold">Agregar dirección</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* Opción recoger en tienda */}
                  <motion.div
                    className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 md:p-6 shadow-md border-2 border-blue-600 hover:shadow-xl transition-all"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                      <div className="p-3 bg-blue-600 text-white rounded-xl">
                        <Store size={28} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">
                          Recoger en tienda
                        </h3>
                        <p className="text-sm md:text-base text-gray-700 font-semibold mb-1">
                          Playcenter Santiago
                        </p>
                        <p className="text-xs md:text-sm text-gray-600">
                          {TIENDA_PLAYCENTER.direccionCompleta}
                        </p>
                        {TIENDA_PLAYCENTER.ubicacion && (
                          <a
                            href={TIENDA_PLAYCENTER.ubicacion}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs md:text-sm text-blue-600 hover:text-blue-800 underline mt-2 inline-block"
                          >
                            Ver en Google Maps
                          </a>
                        )}
                      </div>
                      <button
                        className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white text-sm md:text-base font-semibold rounded-xl hover:bg-blue-700 transition-all hover:scale-105 shadow-md whitespace-nowrap"
                        onClick={() =>
                          handleSeleccionarDireccion(TIENDA_PLAYCENTER)
                        }
                      >
                        Seleccionar
                      </button>
                    </div>
                  </motion.div>

                  {/* Lista de direcciones */}
                  {direcciones.map((dir) => (
                    <motion.div
                      key={dir.id}
                      className="bg-white rounded-2xl p-4 md:p-6 shadow-md border border-gray-200 hover:shadow-xl transition-all"
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex flex-col gap-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-gray-100 text-gray-700 rounded-lg">
                            <MapPin size={24} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base md:text-lg font-bold text-gray-900 truncate">
                              {dir.provincia}, {dir.ciudad}
                            </h3>
                            <p className="text-sm md:text-base text-gray-600 mt-1 break-words">
                              {dir.direccionCompleta}
                            </p>
                            {dir.numeroCalle && (
                              <p className="text-xs md:text-sm text-gray-500 mt-1">
                                Calle: {dir.numeroCalle}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            className="flex-1 min-w-[100px] px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all hover:scale-105 flex items-center justify-center gap-2"
                            onClick={() => handleSeleccionarDireccion(dir)}
                          >
                            <Check size={18} />
                            <span>Seleccionar</span>
                          </button>
                          <button
                            className="flex-1 min-w-[100px] px-4 py-2.5 border-2 border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-all hover:scale-105 flex items-center justify-center gap-2"
                            onClick={() => {
                              setDireccionEditar(dir);
                              setModalEntregaOpen(true);
                            }}
                          >
                            <Pencil size={18} />
                            <span>Editar</span>
                          </button>
                          <button
                            className="px-4 py-2.5 border-2 border-red-300 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-50 transition-all hover:scale-105 flex items-center justify-center gap-2"
                            onClick={() => confirmarEliminar(dir.id)}
                          >
                            <Trash2 size={18} />
                            <span className="hidden sm:inline">Eliminar</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {direcciones.length === 0 && (
                    <motion.div
                      className="text-center py-16 bg-gray-50 rounded-2xl"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <MapPin
                        size={64}
                        className="mx-auto mb-4 text-gray-400"
                      />
                      <p className="text-lg text-gray-600 font-medium">
                        No tienes direcciones guardadas
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Agrega una dirección para tus entregas
                      </p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* VISTA PEDIDOS */}
            {vista === "pedidos" && (
              <motion.div
                key="pedidos"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Mis Pedidos
                  </h2>
                  {historial && historial.length > 0 && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                      {historial.length}{" "}
                      {historial.length === 1 ? "pedido" : "pedidos"}
                    </span>
                  )}
                </div>
                <HistorialSection historial={historial} />
              </motion.div>
            )}

            {/* VISTA MÉTODOS DE PAGO */}
            {vista === "pagos" && (
              <motion.div
                key="pagos"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-16"
              >
                <CreditCard size={64} className="mx-auto text-gray-400 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Métodos de Pago
                </h2>
                <p className="text-gray-600 mb-6">
                  Gestiona tus métodos de pago
                </p>
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Agregar método de pago
                </button>
              </motion.div>
            )}

            {/* VISTA MI TIENDA */}
            {vista === "tiendas" && (
              <motion.div
                key="tiendas"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Mi Tienda
                  </h2>
                  {miTienda && (
                    <Link
                      to={`/tiendas/${miTienda.id}`}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all hover:scale-105 font-semibold shadow-md flex items-center gap-2"
                    >
                      <Store size={20} />
                      Ver mi tienda
                    </Link>
                  )}
                </div>

                {loadingTienda ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
                  </div>
                ) : !miTienda ? (
                  <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-200 text-center">
                    <div className="text-6xl mb-4">🏪</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      No tienes una tienda aún
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Contacta al administrador para crear tu tienda y comenzar
                      a vender.
                    </p>
                    <Link
                      to="/contacto"
                      className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all hover:scale-105"
                    >
                      Contactar
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 rounded-2xl overflow-hidden shadow-lg border-2 border-blue-200">
                      {miTienda.banner && (
                        <div className="w-full h-32 md:h-48 bg-gradient-to-r from-blue-500 to-purple-600 overflow-hidden">
                          <img
                            src={miTienda.banner}
                            alt={`Banner de ${miTienda.nombre}`}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}

                      <div className="p-6 md:p-8">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
                          {miTienda.logo && (
                            <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full shadow-lg border-4 border-white flex-shrink-0 overflow-hidden">
                              <img
                                src={miTienda.logo}
                                alt={`Logo de ${miTienda.nombre}`}
                                className="w-full h-full object-contain p-2"
                              />
                            </div>
                          )}

                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                                {miTienda.nombre}
                              </h3>
                              {(miTienda.principal ||
                                miTienda.es_admin ||
                                usuarioInfo?.es_admin) && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
                                  <span>DUEÑA</span>
                                </span>
                              )}
                            </div>
                            {miTienda.descripcion && (
                              <p className="text-gray-700 text-base">
                                {miTienda.descripcion}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                            <div className="flex items-center justify-center gap-2 text-blue-600 mb-1">
                              <Package size={20} />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">
                              {stats.publicaciones}
                            </p>
                            <p className="text-xs text-gray-600">Productos</p>
                          </div>

                          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                            <div className="flex items-center justify-center gap-2 text-green-600 mb-1">
                              <Users size={20} />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">
                              {miTienda.seguidores || 0}
                            </p>
                            <p className="text-xs text-gray-600">Seguidores</p>
                          </div>

                          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                            <div className="flex items-center justify-center gap-2 text-purple-600 mb-1">
                              <TrendingUp size={20} />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">
                              {miTienda.ventas || 0}
                            </p>
                            <p className="text-xs text-gray-600">Ventas</p>
                          </div>

                          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                            <div className="flex items-center justify-center gap-2 text-yellow-600 mb-1">
                              <Star size={20} />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">
                              {miTienda.valoracion_promedio?.toFixed(1) ||
                                "5.0"}
                            </p>
                            <p className="text-xs text-gray-600">Rating</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button
                            className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all hover:scale-105 font-semibold shadow-md flex items-center justify-center gap-2"
                            onClick={() => navigate("/admin")}
                          >
                            <BarChart size={20} />
                            Gestionar productos
                          </button>
                          <Link
                            to={`/tiendas/${miTienda.id}`}
                            className="w-full px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-all hover:scale-105 font-semibold flex items-center justify-center gap-2"
                          >
                            <Store size={20} />
                            Ver página pública
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CONTENIDO PRINCIPAL (LEGACY - OCULTO) */}
        <main className="profile-content" style={{ display: "none" }}>
          <div className="content-card">
            <AnimatePresence mode="wait">
              {vista === "cuenta" && (
                <motion.section
                  key="perfil"
                  variants={itemFade}
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                >
                  <div className="profile-header big">
                    <div className="avatar-block large">
                      <img
                        src={avatarSrc}
                        alt="Avatar"
                        className="avatar-img"
                      />
                    </div>
                    <div className="profile-meta big">
                      <h1 className="profile-name">{publicName}</h1>
                      <p className="profile-email">{form.email}</p>
                      <p className="muted small">
                        UID: <span className="mono">{usuario.uid}</span>
                      </p>

                      <div className="profile-actions">
                        <button
                          className="btn btn-primary"
                          onClick={() => setPhotoUploadModalOpen(true)}
                        >
                          Cambiar foto
                        </button>
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

                      {/* Inputs ocultos para diferentes opciones */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFile}
                        className="hidden"
                        style={{ display: "none" }}
                      />
                      <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFile}
                        className="hidden"
                        style={{ display: "none" }}
                      />
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
                      <p className="muted hint">
                        Pulsa "Editar" para modificar.
                      </p>
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

              {vista === "pedidos" && (
                <motion.section
                  key="historial"
                  variants={itemFade}
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                >
                  <h2 className="section-title large">Mis pedidos</h2>
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

              {vista === "pagos" && (
                <motion.section
                  key="pagos"
                  variants={itemFade}
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                >
                  <h2 className="section-title large">Métodos de pago</h2>

                  <div className="empty-state-beautiful">
                    <div className="empty-illustration">
                      <motion.div
                        className="empty-box"
                        animate={{ y: [0, -10, 0] }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <CreditCard size={56} />
                      </motion.div>
                    </div>
                    <h3>Aún no tienes métodos de pago</h3>
                    <p>
                      Cuando agregues una tarjeta o método de pago, aparecerá
                      aquí.
                    </p>
                    <div className="empty-cta">
                      <button className="btn-beautiful-primary">
                        Agregar método de pago
                      </button>
                    </div>
                  </div>
                </motion.section>
              )}

              {/* VISTA CONFIGURACIÓN */}
              {vista === "configuracion" && (
                <motion.div
                  key="configuracion"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                    Configuración
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {/* Cambiar contraseña - FUNCIONAL */}
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 hover:shadow-xl transition-all">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <Lock size={24} className="text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">
                          Cambiar contraseña
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Actualiza tu contraseña para mantener tu cuenta segura.
                      </p>
                      <button
                        onClick={() => setCambiarPasswordOpen(true)}
                        className="w-full px-4 py-2.5 border-2 border-blue-600 text-blue-600 text-sm font-semibold rounded-xl hover:bg-blue-50 transition-all hover:scale-105"
                      >
                        Cambiar contraseña
                      </button>
                    </div>

                    {/* Notificaciones - FUNCIONAL */}
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 hover:shadow-xl transition-all">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <Bell size={24} className="text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">
                          Notificaciones
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Administra cómo quieres recibir notificaciones.
                      </p>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                          <span className="text-sm font-medium text-gray-900">
                            Notificaciones por email
                          </span>
                          <input
                            type="checkbox"
                            checked={notificaciones.email}
                            onChange={() => handleNotificacionChange("email")}
                            className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                          />
                        </label>
                        <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                          <span className="text-sm font-medium text-gray-900">
                            Notificaciones de pedidos
                          </span>
                          <input
                            type="checkbox"
                            checked={notificaciones.pedidos}
                            onChange={() => handleNotificacionChange("pedidos")}
                            className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                          />
                        </label>
                        <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                          <span className="text-sm font-medium text-gray-900">
                            Ofertas y promociones
                          </span>
                          <input
                            type="checkbox"
                            checked={notificaciones.ofertas}
                            onChange={() => handleNotificacionChange("ofertas")}
                            className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Idioma - FUNCIONAL */}
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 hover:shadow-xl transition-all">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <Globe size={24} className="text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">
                          Idioma
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Selecciona tu idioma preferido.
                      </p>
                      <select
                        value={idioma}
                        onChange={handleIdiomaChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:border-blue-600 focus:outline-none transition-colors cursor-pointer"
                      >
                        <option value="es">Español</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

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

      {/* Modal de opciones de foto */}
      <AnimatePresence>
        {photoUploadModalOpen && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPhotoUploadModalOpen(false)}
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
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: "white",
                padding: "2rem",
                borderRadius: "16px",
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                maxWidth: "400px",
                width: "90%",
              }}
            >
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "700",
                  color: "#1f2937",
                  marginBottom: "1rem",
                  textAlign: "center",
                }}
              >
                Cambiar foto de perfil
              </h3>
              <p
                style={{
                  color: "#6b7280",
                  marginBottom: "1.5rem",
                  textAlign: "center",
                  fontSize: "0.9rem",
                }}
              >
                Selecciona cómo quieres subir tu foto
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <button
                  onClick={() => {
                    cameraInputRef.current?.click();
                    setPhotoUploadModalOpen(false);
                  }}
                  style={{
                    padding: "1rem 1.5rem",
                    borderRadius: "12px",
                    border: "2px solid #e5e7eb",
                    backgroundColor: "white",
                    color: "#374151",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    fontSize: "1rem",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "#f9fafb";
                    e.currentTarget.style.borderColor = "#2563eb";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "white";
                    e.currentTarget.style.borderColor = "#e5e7eb";
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                    <circle cx="12" cy="13" r="4"></circle>
                  </svg>
                  Tomar foto con cámara
                </button>
                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                    setPhotoUploadModalOpen(false);
                  }}
                  style={{
                    padding: "1rem 1.5rem",
                    borderRadius: "12px",
                    border: "2px solid #e5e7eb",
                    backgroundColor: "white",
                    color: "#374151",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    fontSize: "1rem",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "#f9fafb";
                    e.currentTarget.style.borderColor = "#2563eb";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "white";
                    e.currentTarget.style.borderColor = "#e5e7eb";
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="2"
                      ry="2"
                    ></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                  Seleccionar de galería
                </button>
                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                    setPhotoUploadModalOpen(false);
                  }}
                  style={{
                    padding: "1rem 1.5rem",
                    borderRadius: "12px",
                    border: "2px solid #e5e7eb",
                    backgroundColor: "white",
                    color: "#374151",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    fontSize: "1rem",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "#f9fafb";
                    e.currentTarget.style.borderColor = "#2563eb";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "white";
                    e.currentTarget.style.borderColor = "#e5e7eb";
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                    <polyline points="13 2 13 9 20 9"></polyline>
                  </svg>
                  Seleccionar archivo
                </button>
                <button
                  onClick={() => setPhotoUploadModalOpen(false)}
                  style={{
                    marginTop: "0.5rem",
                    padding: "0.75rem 1.5rem",
                    borderRadius: "12px",
                    border: "none",
                    backgroundColor: "transparent",
                    color: "#6b7280",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.color = "#374151")}
                  onMouseOut={(e) => (e.currentTarget.style.color = "#6b7280")}
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* MODAL DE EDICIÓN DE PERFIL */}
      <AnimatePresence>
        {editModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999] p-4"
            onClick={() => setEditModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl md:rounded-2xl shadow-2xl w-full max-w-[95%] sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[95vh] md:max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex justify-between items-center z-10">
                <h3 className="text-lg md:text-xl font-bold text-gray-900">
                  Editar Perfil
                </h3>
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 md:p-6 space-y-4 md:space-y-6">
                {/* Avatar */}
                <div className="flex flex-col items-center gap-3 md:gap-4">
                  <img
                    src={avatarSrc}
                    alt="Avatar"
                    className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-gray-200"
                  />
                  <div className="flex flex-wrap gap-2 justify-center">
                    <button
                      onClick={() => {
                        setPhotoUploadModalOpen(true);
                        setEditModalOpen(false);
                      }}
                      className="px-3 md:px-4 py-2 text-xs md:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Camera size={16} />
                      Cambiar foto
                    </button>
                    {form.fotoURL && (
                      <button
                        onClick={() => {
                          setConfirmRemoveImageOpen(true);
                          setEditModalOpen(false);
                        }}
                        className="px-3 md:px-4 py-2 text-xs md:text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Quitar
                      </button>
                    )}
                  </div>
                </div>

                {/* Formulario */}
                <div className="space-y-3 md:space-y-4">
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                      Nombre
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      className="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tu nombre completo"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      disabled
                      className="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      El email no se puede modificar
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      name="telefono"
                      value={form.telefono}
                      onChange={handleChange}
                      className="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="809-555-1234"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                      Dirección
                    </label>
                    <textarea
                      name="direccion"
                      value={form.direccion}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tu dirección completa"
                    />
                  </div>
                </div>

                {/* Inputs ocultos */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                  style={{ display: "none" }}
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFile}
                  style={{ display: "none" }}
                />
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 md:px-6 py-3 md:py-4 flex flex-col sm:flex-row gap-2 md:gap-3 z-10">
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="w-full sm:flex-1 px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    await saveProfile();
                    setEditModalOpen(false);
                  }}
                  className="w-full sm:flex-1 px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  disabled={loading}
                >
                  {loading ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL CAMBIAR CONTRASEÑA */}
      <AnimatePresence>
        {cambiarPasswordOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999] p-4"
            onClick={() => {
              setCambiarPasswordOpen(false);
              setPasswordError("");
              setPasswordForm({ actual: "", nueva: "", confirmar: "" });
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Lock size={24} />
                  </div>
                  <button
                    onClick={() => {
                      setCambiarPasswordOpen(false);
                      setPasswordError("");
                      setPasswordForm({ actual: "", nueva: "", confirmar: "" });
                    }}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                <h3 className="text-2xl font-bold">Cambiar Contraseña</h3>
                <p className="text-blue-100 text-sm mt-1">
                  Actualiza tu contraseña de forma segura
                </p>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                {passwordError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                    <XCircle
                      size={20}
                      className="text-red-600 flex-shrink-0 mt-0.5"
                    />
                    <p className="text-sm text-red-800">{passwordError}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña actual
                  </label>
                  <input
                    type="password"
                    value={passwordForm.actual}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        actual: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nueva contraseña
                  </label>
                  <input
                    type="password"
                    value={passwordForm.nueva}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        nueva: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Mínimo 6 caracteres
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar nueva contraseña
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmar}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmar: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 flex gap-3">
                <button
                  onClick={() => {
                    setCambiarPasswordOpen(false);
                    setPasswordError("");
                    setPasswordForm({ actual: "", nueva: "", confirmar: "" });
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCambiarPassword}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Guardando...
                    </>
                  ) : (
                    "Cambiar contraseña"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL DE CONFIRMACIÓN LOGOUT */}
      <AnimatePresence>
        {confirmLogoutOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999] p-4"
            onClick={() => setConfirmLogoutOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center"
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="text-red-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                ¿Cerrar sesión?
              </h3>
              <p className="text-gray-600 mb-6">
                ¿Estás seguro que quieres cerrar sesión?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmLogoutOpen(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Cerrar sesión
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL DE ENTREGA */}
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
