import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, doc, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import "../styles/Admin.css";
import { motion, AnimatePresence } from "framer-motion";

// Colores base
const COLOR_PRIMARIO = "bg-blue-700";
const COLOR_SECUNDARIO = "bg-blue-100";
const COLOR_TEXTO = "text-blue-900";
const COLOR_TEXTO_HEADER = "text-white";
const COLOR_HEADER = "bg-blue-800";
const COLOR_BADGE = "bg-blue-200 text-blue-900";
const COLOR_BADGE_ADMIN = "bg-green-200 text-green-900";
const COLOR_BADGE_USER = "bg-blue-200 text-blue-900";

const ADMIN_UID = "ZeiFzBgosCd0apv9cXL6aQZCYyu2";

function getInitials(name = "") {
  if (!name) return "👤";
  const parts = name.trim().split(" ");
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
}

function extractFirstUrl(text = "") {
  if (!text) return null;
  const httpMatch = text.match(/(https?:\/\/[^\s]+)/i);
  if (httpMatch) return httpMatch[1];
  const mapsMatch = text.match(
    /(maps\.app\.[^\s]+|goo\.gl\/[^\s]+|google\.com\/maps[^\s]*)/i
  );
  if (mapsMatch) {
    const candidate = mapsMatch[0];
    return candidate.startsWith("http") ? candidate : `https://${candidate}`;
  }
  return null;
}

function formatDate(ts) {
  if (!ts) return null;
  if (typeof ts === "object" && ts.seconds) {
    return new Date(ts.seconds * 1000).toLocaleString();
  }
  const d = new Date(ts);
  if (!isNaN(d.getTime())) return d.toLocaleString();
  return String(ts);
}

/* ============================================================
   COMPONENTE FULL VIEW DE USUARIO
   ============================================================ */
function UsuarioFullView({ usuario, onClose }) {
  const [compras, setCompras] = useState([]);
  const [loadingCompras, setLoadingCompras] = useState(true);
  const [usuarioData, setUsuarioData] = useState(usuario);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Suscripción en tiempo real al usuario
  useEffect(() => {
    if (!usuario?.id) return;
    const unsubscribeUsers = onSnapshot(
      doc(db, "users", usuario.id),
      (docSnap) => {
        if (docSnap.exists()) {
          setUsuarioData((prev) => ({ ...prev, ...docSnap.data() }));
        }
      }
    );
    const unsubscribeUsuarios = onSnapshot(
      doc(db, "usuarios", usuario.id),
      (docSnap) => {
        if (docSnap.exists()) {
          setUsuarioData((prev) => ({ ...prev, ...docSnap.data() }));
        }
      }
    );
    return () => {
      unsubscribeUsers();
      unsubscribeUsuarios();
    };
  }, [usuario?.id]);

  // Suscripción en tiempo real a órdenes
  useEffect(() => {
    if (!usuario) return;
    const q = query(collection(db, "orders"));
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const lista = snap.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((o) => String(o.userId) === String(usuario.id));
        setCompras(
          lista.sort((a, b) => {
            const dateA = a.fecha?.seconds || 0;
            const dateB = b.fecha?.seconds || 0;
            return dateB - dateA;
          })
        );
        setLoadingCompras(false);
      },
      () => {
        setCompras([]);
        setLoadingCompras(false);
      }
    );
    return () => unsubscribe();
  }, [usuario]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const direccionTexto =
    usuarioData?.direccion || usuarioData?.direccionCompleta || "";
  const ubicacionLink =
    usuarioData?.ubicacion || extractFirstUrl(direccionTexto);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="fixed top-0 left-0 w-full h-full max-h-none !rounded-none !shadow-none bg-white overflow-y-auto flex flex-col"
        style={{ zIndex: 10000 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ENCABEZADO */}
        <header
          className={`flex justify-between items-center px-6 py-4 shadow ${COLOR_HEADER}`}
        >
          <div className="admin-user-header">
            <div className="admin-user-avatar">
              {getInitials(usuarioData?.displayName || usuarioData?.nombre)}
            </div>
            <div className="admin-user-info">
              <h2 className="admin-user-name">
                {usuarioData?.displayName || usuarioData?.nombre || "Usuario"}
              </h2>
              <p className="admin-user-email">{usuarioData?.email}</p>
              <div className="admin-user-badges">
                <span
                  className={
                    usuario.id === ADMIN_UID ? "badge-admin" : "badge-user"
                  }
                >
                  {usuario.id === ADMIN_UID ? "👑 Admin" : "👤 Usuario"}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="admin-close-btn"
          >
            ×
          </button>
        </header>
        {/* CONTENIDO */}
        <div className="flex-1 px-2 sm:px-8 py-4 sm:py-8 space-y-7 bg-gray-50">
          {/* Información Personal */}
          <section className="bg-white rounded-xl border shadow p-4 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-700 font-bold">👤</span>
              </div>
              <h3 className={`text-xl font-bold ${COLOR_TEXTO}`}>
                Información Personal
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <InfoItem
                label="Nombre Completo"
                value={usuarioData.displayName || "No especificado"}
              />
              <InfoItem
                label="Email"
                value={usuarioData.email || "No especificado"}
              />
              <InfoItem
                label="Teléfono"
                value={usuarioData.telefono || "No especificado"}
              />
              <InfoItem
                label="Código de Usuario"
                value={usuarioData.codigo || "No asignado"}
              />
              <InfoItem
                label="Método de Entrega"
                value={usuarioData.metodoEntrega || "No especificado"}
              />
              <InfoItem
                label="Fecha de Registro"
                value={
                  usuarioData.createdAt
                    ? formatDate(usuarioData.createdAt)
                    : "No disponible"
                }
              />
            </div>
          </section>

          {/* Dirección y Ubicación */}
          <section className="bg-white rounded-xl border shadow p-4 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-700 font-bold">📍</span>
              </div>
              <h3 className={`text-xl font-bold ${COLOR_TEXTO}`}>
                Dirección y Ubicación
              </h3>
            </div>
            <p className="text-base text-blue-900 mb-4">
              {direccionTexto || "No se ha registrado dirección"}
            </p>
            {ubicacionLink && (
              <a
                href={ubicacionLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
              >
                🗺️ Ver en Google Maps
              </a>
            )}
          </section>

          {/* Historial de Compras */}
          <section className="bg-white rounded-xl border shadow p-4 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-700 font-bold">🛒</span>
              </div>
              <h3 className={`text-xl font-bold ${COLOR_TEXTO}`}>
                Historial de Compras
              </h3>
              <span className="bg-blue-100 text-blue-900 px-3 py-1 rounded-full text-sm font-bold">
                {compras.length} {compras.length === 1 ? "compra" : "compras"}
              </span>
            </div>

            {loadingCompras ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
                <span className="ml-3 text-blue-700">
                  Cargando historial...
                </span>
              </div>
            ) : compras.length === 0 ? (
              <div className="text-center py-12 bg-blue-50 rounded-xl">
                <div className="text-6xl mb-4">🛍️</div>
                <p className="text-xl text-blue-700 font-medium">
                  No hay compras registradas
                </p>
              </div>
            ) : (
              <div className="admin-orders-grid">
                {compras.map((order) => (
                  <div key={order.id} className="admin-order-card">
                    <div className="admin-order-header">
                      <div className="order-info">
                        <h4 className="order-number">
                          {order.numeroOrden || `#${order.id.slice(-8)}`}
                        </h4>
                        <p className="order-date">{formatDate(order.fecha)}</p>
                      </div>
                      <div className="order-status-price">
                        <span
                          className={`admin-status-badge ${
                            order.estado || "pendiente"
                          }`}
                        >
                          {order.estado === "completado"
                            ? "✓ Completado"
                            : order.estado === "cancelado"
                            ? "✗ Cancelado"
                            : "⏳ Pendiente"}
                        </span>
                        <div className="order-total">
                          {new Intl.NumberFormat("es-DO", {
                            style: "currency",
                            currency: "DOP",
                          }).format(order.total || 0)}
                        </div>
                      </div>
                    </div>

                    <div className="admin-order-customer">
                      <div className="customer-info">
                        <span className="customer-name">
                          {order.userName || "Usuario"}
                        </span>
                        <span className="customer-email">
                          {order.userEmail}
                        </span>
                      </div>
                    </div>

                    <div className="admin-products-preview">
                      {order.productos?.slice(0, 3).map((producto, idx) => (
                        <div key={idx} className="admin-product-item">
                          <div className="admin-product-info">
                            <span className="product-name">
                              {producto.nombre}
                            </span>
                            <span className="product-quantity">
                              Cantidad: {producto.cantidad} • {new Intl.NumberFormat("es-DO", {
                                style: "currency",
                                currency: "DOP",
                              }).format(producto.precio)}
                            </span>
                            <button 
                              className="btn-view-product"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = `/producto/${producto.id}`;
                              }}
                              title="Ver producto"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                              </svg>
                              Ver producto
                            </button>
                          </div>
                        </div>
                      ))}
                      {order.productos?.length > 3 && (
                        <div className="more-products-admin">
                          +{order.productos.length - 3} más productos
                        </div>
                      )}
                    </div>

                    <div className="admin-order-actions">
                      <button 
                        className="btn-admin btn-view"
                        onClick={() => setSelectedOrder(order)}
                      >
                        Ver detalles
                      </button>
                      {order.metodoPago && (
                        <span className="payment-method">
                          {order.metodoPago}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
        
        {/* Modal de detalles de orden */}
        <AnimatePresence>
          {selectedOrder && (
            <OrderDetailsModal
              order={selectedOrder}
              onClose={() => setSelectedOrder(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
/* ============================================================
   COMPONENTE INFO ITEM
   ============================================================ */
function InfoItem({ label, value }) {
  return (
    <div className="bg-blue-50 rounded-xl p-3">
      <p className="font-semibold text-blue-700 text-xs mb-1">{label}</p>
      <p className="text-base font-medium text-blue-900 break-all">{value}</p>
    </div>
  );
}

/* ============================================================
   COMPONENTE PRINCIPAL ADMIN
   ============================================================ */
export default function Admin() {
  const { usuario } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (!usuario || usuario.uid !== ADMIN_UID) return;

    // Escuchar colección "users"
    const unsubscribeUsers = onSnapshot(
      query(collection(db, "users")),
      (snap) => {
        const usersData = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsuarios((prev) => {
          const merged = [...usersData];
          prev.forEach((existingUser) => {
            const index = merged.findIndex((u) => u.id === existingUser.id);
            if (index >= 0) {
              merged[index] = { ...merged[index], ...existingUser };
            }
          });
          return merged;
        });
      }
    );

    // Escuchar colección "usuarios"
    const unsubscribeUsuarios = onSnapshot(
      query(collection(db, "usuarios")),
      (snap) => {
        const usuariosData = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsuarios((prev) => {
          const merged = [...prev];
          usuariosData.forEach((userData) => {
            const index = merged.findIndex((u) => u.id === userData.id);
            if (index >= 0) {
              merged[index] = { ...merged[index], ...userData };
            } else {
              merged.push(userData);
            }
          });
          return merged;
        });
      }
    );

    return () => {
      unsubscribeUsers();
      unsubscribeUsuarios();
    };
  }, [usuario]);

  if (!usuario)
    return (
      <div className="flex items-center justify-center min-h-screen bg-blue-50">
        Inicia sesión
      </div>
    );
  if (usuario.uid !== ADMIN_UID)
    return (
      <div className="flex items-center justify-center min-h-screen bg-blue-50">
        Sin acceso
      </div>
    );

  const usuariosFiltrados = usuarios.filter((u) => {
    const f = filtro.toLowerCase();
    return (
      (u.displayName || "").toLowerCase().includes(f) ||
      (u.email || "").toLowerCase().includes(f) ||
      (u.telefono || "").toLowerCase().includes(f) ||
      (u.direccion || "").toLowerCase().includes(f) ||
      (u.codigo || "").toLowerCase().includes(f)
    );
  });

  return (
    <main className="min-h-screen bg-blue-50 p-2 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-3 text-blue-900">
            Panel Administrativo
          </h1>
          <p className="text-base sm:text-xl text-blue-700 font-medium">
            Gestión Completa de Usuarios
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
            <span className="bg-blue-100 text-blue-900 px-4 py-2 rounded-full text-sm font-bold">
              👥 {usuarios.length}{" "}
              {usuarios.length === 1 ? "usuario" : "usuarios"} registrados
            </span>
            <span className="bg-green-100 text-green-900 px-4 py-2 rounded-full text-sm font-bold">
              🔄 Sincronización en tiempo real
            </span>
          </div>
        </div>

        {/* BUSCADOR */}
        <div className="bg-white rounded-xl shadow-xl p-3 sm:p-6 mb-8 border border-blue-100">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">🔍</span>
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre, email, teléfono, dirección o código..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="flex-1 px-4 py-3 text-base border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all"
            />
          </div>
        </div>

        {/* LISTADO DE USUARIOS */}
        {usuariosFiltrados.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg">
            <div className="text-7xl mb-6">👤</div>
            <h3 className="text-2xl font-bold text-blue-900 mb-2">
              No se encontraron usuarios
            </h3>
            <p className="text-blue-600 text-lg">
              Intenta ajustar los términos de búsqueda
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-4">
            {usuariosFiltrados.map((u) => (
              <div
                key={u.id}
                className="bg-white border-2 border-blue-100 rounded-xl shadow-sm hover:shadow-lg hover:border-blue-400 transition-all duration-200 cursor-pointer p-3 group flex flex-col items-center"
                onClick={() => setUsuarioSeleccionado(u)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setUsuarioSeleccionado(u);
                }}
              >
                <div className="w-14 h-14 rounded-xl bg-blue-700 flex items-center justify-center text-2xl font-bold text-white mb-2 shadow">
                  {getInitials(u.displayName)}
                </div>
                <div className="w-full flex-1 flex flex-col items-center text-center">
                  <h3 className="font-bold text-base text-blue-900 truncate w-full">
                    {u.displayName || "Usuario Sin Nombre"}
                  </h3>
                  <p className="text-xs text-blue-700 break-all truncate w-full">
                    ID: {u.id}
                  </p>
                  <div className="mt-1 mb-2 w-full">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${
                        u.admin ? COLOR_BADGE_ADMIN : COLOR_BADGE_USER
                      }`}
                    >
                      {u.admin ? "🛡️ Admin" : "👤"}
                    </span>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-2 w-full mb-1">
                    <p className="text-xs text-blue-700 mb-1">
                      📧 {u.email || "No email"}
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-2 w-full mb-1">
                    <p className="text-xs text-blue-700">
                      📱 {u.telefono || "No tel."}
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-2 w-full mb-2">
                    <p className="text-xs text-blue-700 line-clamp-2">
                      📍{" "}
                      {u.direccion || u.direccionCompleta || "No especificada"}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-blue-400">Ver detalles →</span>
              </div>
            ))}
          </div>
        )}

        {/* FULL VIEW */}
        {usuarioSeleccionado && (
          <UsuarioFullView
            usuario={usuarioSeleccionado}
            onClose={() => setUsuarioSeleccionado(null)}
          />
        )}
      </div>
      
      {/* Modal de detalles de orden */}
      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

/* Modal de detalles de orden */
function OrderDetailsModal({ order, onClose }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(amount || 0);
  };

  const formatOrderDate = (fecha) => {
    if (!fecha) return 'Fecha no disponible';
    let date;
    if (typeof fecha === 'object' && fecha.seconds) {
      date = new Date(fecha.seconds * 1000);
    } else {
      date = new Date(fecha);
    }
    return date.toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'completado': return 'status-completed';
      case 'cancelado': return 'status-cancelled';
      case 'pendiente': return 'status-pending';
      default: return 'status-pending';
    }
  };

  const getStatusText = (estado) => {
    switch (estado) {
      case 'completado': return '✓ Completado';
      case 'cancelado': return '✗ Cancelado';
      case 'pendiente': return '⏳ Pendiente';
      default: return '⏳ Pendiente';
    }
  };

  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
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
          <button className="close-btn" onClick={onClose}>
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
                Pago: {order.estadoPago === "pagado" ? "✓ Pagado" : "✗ Fallido"}
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
                        Subtotal: {formatCurrency(
                          producto.subtotal ||
                            producto.precio * producto.cantidad
                        )}
                      </span>
                    </div>
                    <button 
                      className="btn-view-product-modal"
                      onClick={() => window.location.href = `/producto/${producto.id}`}
                      title="Ver producto"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
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
