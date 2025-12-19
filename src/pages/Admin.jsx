import React, { useEffect, useState, useRef } from "react";
import {
  collection,
  onSnapshot,
  query,
  doc,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  orderBy,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../hooks/useStore";
import { notify } from "../utils/notificationBus";
import "../styles/Admin.css";
import { motion, AnimatePresence } from "framer-motion";
import ProductForm from "../components/ProductForm";
import ProductManagement from "../components/ProductManagement";
import CategoryManagement from "../components/CategoryManagement";
import AdminDashboard from "../components/AdminDashboard";
import LoadingSpinner from "../components/LoadingSpinner";
import SolicitudesVendedor from "../components/SolicitudesVendedor";
import GestionTiendas from "../components/GestionTiendas";
import {
  FiBarChart2,
  FiBox,
  FiTag,
  FiUsers,
  FiSearch,
  FiMapPin,
  FiShoppingCart,
  FiUser,
  FiShield,
  FiEye,
  FiUserPlus,
  FiShoppingBag,
  FiHome,
  FiPackage,
  FiDollarSign,
  FiX,
} from "react-icons/fi";
import { migrateAllLegacyProductMedia } from "../utils/legacyMediaMigrator";

// Colores base
const COLOR_PRIMARIO = "bg-blue-700";
const COLOR_SECUNDARIO = "bg-blue-100";
const COLOR_TEXTO = "text-blue-900";
const COLOR_TEXTO_HEADER = "text-white";
const COLOR_HEADER = "bg-blue-800";
const COLOR_BADGE = "bg-blue-200 text-blue-900";
const COLOR_BADGE_ADMIN = "bg-green-200 text-green-900";
const COLOR_BADGE_USER = "bg-blue-200 text-blue-900";

function getInitials(name = "") {
  if (!name) return "US";
  const parts = name.trim().split(" ");
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
}

function extractFirstUrl(text = "") {
  if (!text) return null;
  if (typeof text !== "string") text = String(text);
  // 1) Enlaces http(s) directos
  const httpMatch = text.match(/(https?:\/\/[^\s]+)/i);
  if (httpMatch) return httpMatch[1];
  // 2) Dominios de Google Maps sin esquema (maps.app, goo.gl, google.com/maps)
  const mapsMatch = text.match(
    /(?:^|\s)(maps\.app\.[^\s]+|goo\.gl\/[^\s]+|(?:www\.)?google\.com\/maps[^\s]*)/i
  );
  if (mapsMatch) {
    const candidate = mapsMatch[1] || mapsMatch[0];
    const normalized = candidate.startsWith("http")
      ? candidate
      : `https://${candidate}`;
    return normalized;
  }
  // 3) Coordenadas lat,lng (e.g., 19.45,-70.68)
  const coordMatch = text.match(/(-?\d{1,2}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[2]);
    if (
      !isNaN(lat) &&
      !isNaN(lng) &&
      Math.abs(lat) <= 90 &&
      Math.abs(lng) <= 180
    ) {
      return `https://www.google.com/maps?q=${lat},${lng}`;
    }
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
  const migrationRanRef = useRef(false);

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

  // Ejecutar migración legacy una sola vez al entrar el admin
  useEffect(() => {
    if (!usuario || !usuarioData?.admin) return;
    if (migrationRanRef.current) return;
    migrationRanRef.current = true;
    (async () => {
      try {
        await migrateAllLegacyProductMedia(() => {});
      } catch (e) {
        // Error silencioso
      }
    })();
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
    extractFirstUrl(usuarioData?.ubicacion) || extractFirstUrl(direccionTexto);

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
                  className={usuarioData?.admin ? "badge-admin" : "badge-user"}
                >
                  {usuarioData?.admin ? "Admin" : "Usuario"}
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
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700">
                <FiUser />
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
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700">
                <FiMapPin />
              </div>
              <h3 className={`text-xl font-bold ${COLOR_TEXTO}`}>
                Dirección y Ubicación
              </h3>
            </div>
            <p className="text-base text-blue-900 mb-4">
              {ubicacionLink ? (
                <a
                  href={ubicacionLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 underline inline-flex items-center gap-2"
                  title="Abrir ubicación en Google Maps"
                >
                  <FiMapPin /> {direccionTexto || "Abrir en Google Maps"}
                </a>
              ) : (
                direccionTexto || "No se ha registrado dirección"
              )}
            </p>
            {ubicacionLink && (
              <a
                href={ubicacionLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
              >
                <FiMapPin /> Ver en Google Maps
              </a>
            )}
          </section>

          {/* Historial de Compras */}
          <section className="bg-white rounded-xl border shadow p-4 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700">
                <FiShoppingCart />
              </div>
              <h3 className={`text-xl font-bold ${COLOR_TEXTO}`}>
                Historial de Compras
              </h3>
              <span className="bg-blue-100 text-blue-900 px-3 py-1 rounded-full text-sm font-bold">
                {compras.length} {compras.length === 1 ? "compra" : "compras"}
              </span>
            </div>

            {loadingCompras ? (
              <div className="flex items-center justify-center py-12 bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl">
                <div className="text-center">
                  <LoadingSpinner size="large" color="blue" variant="dots" />
                  <p className="text-gray-700 dark:text-gray-300 text-base font-semibold mt-4">
                    Cargando compras...
                  </p>
                </div>
              </div>
            ) : compras.length === 0 ? (
              <div className="text-center py-12 bg-blue-50 rounded-xl">
                <div className="text-6xl mb-4 text-blue-700 flex items-center justify-center">
                  <FiShoppingCart />
                </div>
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
                              Cantidad: {producto.cantidad} •{" "}
                              {new Intl.NumberFormat("es-DO", {
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
                              <span className="inline-flex items-center gap-1">
                                <FiEye /> Ver producto
                              </span>
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
   LISTA DE PEDIDOS (ORDERS LIST)
   ============================================================ */
function OrdersList() {
  const [orders, setOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("fecha", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setOrders(data);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, []);
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl">
        <div className="text-center">
          <LoadingSpinner size="large" color="blue" variant="pulse" />
          <p className="text-gray-700 dark:text-gray-300 text-base font-semibold mt-4">
            Cargando órdenes...
          </p>
        </div>
      </div>
    );
  }
  if (orders.length === 0) {
    return (
      <div className="text-center text-gray-600 py-8">
        No hay pedidos registrados.
      </div>
    );
  }
  return (
    <div className="divide-y border rounded-lg">
      {orders.map((o) => (
        <div key={o.id} className="p-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-blue-900">
              Pedido #{o.id.slice(-8)}
            </p>
            <p className="text-sm text-gray-600">
              {o.fecha?.seconds
                ? new Date(o.fecha.seconds * 1000).toLocaleString()
                : ""}
            </p>
          </div>
          <div className="text-right">
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                o.estado === "completado"
                  ? "bg-green-100 text-green-800"
                  : o.estado === "pendiente"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {o.estado || "Pendiente"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   PANEL DEL VENDEDOR (Seller-only, acceso limitado)
   ============================================================ */
function SellerAdminPanel() {
  const { usuario, usuarioInfo } = useAuth();
  const { tienda } = useStore(); // Hook para obtener tienda del usuario
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState({
    productos: 0,
    pedidos: 0,
    ventas: 0,
  });
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Usar storeId del usuario O del hook useStore como fallback
  const effectiveStoreId = usuarioInfo?.storeId || tienda?.id;
  const effectiveStoreName =
    usuarioInfo?.storeName || tienda?.nombre || tienda?.name || "Mi Tienda";

  // Cargar estadísticas y pedidos de la tienda del vendedor
  useEffect(() => {
    if (!effectiveStoreId) return;

    // Productos de mi tienda
    const unsubProducts = onSnapshot(
      query(
        collection(db, "productos"),
        where("storeId", "==", effectiveStoreId)
      ),
      (snapshot) => {
        setStats((prev) => ({ ...prev, productos: snapshot.size }));
      }
    );

    // Pedidos de mi tienda
    const unsubOrders = onSnapshot(
      query(collection(db, "orders")),
      (snapshot) => {
        const allOrders = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Filtrar pedidos que contengan productos de mi tienda
        const myOrders = allOrders.filter((order) =>
          order.items?.some((item) => item.storeId === effectiveStoreId)
        );

        setOrders(myOrders);
        setStats((prev) => ({
          ...prev,
          pedidos: myOrders.length,
          ventas: myOrders.reduce((sum, o) => sum + (o.total || 0), 0),
        }));
      }
    );

    return () => {
      unsubProducts();
      unsubOrders();
    };
  }, [effectiveStoreId]);

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: FiHome },
    { id: "products", label: "Productos", icon: FiPackage },
    { id: "orders", label: "Pedidos", icon: FiShoppingCart },
  ];

  return (
    <main className="admin-page min-h-screen bg-gray-50 dark:bg-gray-900 px-2 sm:px-6 pt-2 pb-2 sm:pb-6">
      <div className="w-full px-2">
        {/* HEADER */}
        <div className="text-center mb-3">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 text-gray-900 dark:text-white">
            Panel del Vendedor
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-700 dark:text-gray-300 font-medium">
            {effectiveStoreName}
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-bold inline-flex items-center gap-2">
              <FiPackage /> {stats.productos}{" "}
              {stats.productos === 1 ? "producto" : "productos"}
            </span>
            <span className="bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-300 px-4 py-2 rounded-full text-sm font-bold inline-flex items-center gap-2">
              <FiShoppingCart /> {stats.pedidos}{" "}
              {stats.pedidos === 1 ? "pedido" : "pedidos"}
            </span>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-1 mb-4 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[120px] px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-blue-600 dark:bg-blue-500 text-white shadow-md"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <span className="text-lg">
                    <tab.icon />
                  </span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* TAB CONTENT */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Estadísticas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Productos
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {stats.productos}
                      </p>
                    </div>
                    <FiPackage className="w-12 h-12 text-blue-500" />
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Pedidos
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {stats.pedidos}
                      </p>
                    </div>
                    <FiShoppingCart className="w-12 h-12 text-green-500" />
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Ventas
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        ${stats.ventas.toFixed(2)}
                      </p>
                    </div>
                    <FiDollarSign className="w-12 h-12 text-yellow-500" />
                  </div>
                </div>
              </div>

              {/* Información de la tienda */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                  Información de tu Tienda
                </h3>
                <div className="space-y-2 text-gray-700 dark:text-gray-300">
                  <p>
                    <span className="font-semibold">Nombre:</span>{" "}
                    {effectiveStoreName || "No configurado"}
                  </p>
                  <p>
                    <span className="font-semibold">ID de Tienda:</span>{" "}
                    {effectiveStoreId || "No asignado"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "products" && (
            <div>
              <ProductManagement
                onAddProduct={() => {
                  setEditingProduct(null);
                  setShowProductForm(true);
                }}
                onEditProduct={(product) => {
                  setEditingProduct(product);
                  setShowProductForm(true);
                }}
              />
            </div>
          )}

          {activeTab === "orders" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Pedidos de tu Tienda
              </h2>
              {orders.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    No tienes pedidos todavía
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-blue-500 transition-colors"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            Pedido #{order.id.slice(0, 8)}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {order.cliente?.nombre || "Cliente"}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {
                              order.items?.filter(
                                (item) => item.storeId === effectiveStoreId
                              ).length
                            }{" "}
                            productos
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 dark:text-white">
                            $
                            {order.items
                              ?.filter(
                                (item) => item.storeId === effectiveStoreId
                              )
                              .reduce(
                                (sum, item) =>
                                  sum + item.precio * item.cantidad,
                                0
                              )
                              .toFixed(2)}
                          </p>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              order.estado === "entregado"
                                ? "bg-green-100 text-green-800"
                                : order.estado === "en camino"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {order.estado || "Pendiente"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* PRODUCT FORM MODAL */}
        {showProductForm && (
          <ProductForm
            product={editingProduct}
            onClose={() => {
              setShowProductForm(false);
              setEditingProduct(null);
            }}
            onSave={() => {
              setShowProductForm(false);
              setEditingProduct(null);
            }}
          />
        )}

        {/* ORDER DETAIL MODAL */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Detalles del Pedido
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ID del Pedido
                  </p>
                  <p className="font-mono text-gray-900 dark:text-white">
                    {selectedOrder.id}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Cliente
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    {selectedOrder.cliente?.nombre || "N/A"}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedOrder.cliente?.email || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Productos de tu tienda
                  </p>
                  <div className="space-y-2">
                    {selectedOrder.items
                      ?.filter((item) => item.storeId === usuarioInfo?.storeId)
                      .map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {item.nombre}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Cantidad: {item.cantidad}
                            </p>
                          </div>
                          <p className="font-bold text-gray-900 dark:text-white">
                            ${(item.precio * item.cantidad).toFixed(2)}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

/* ============================================================
   COMPONENTE PRINCIPAL ADMIN
   ============================================================ */
export default function Admin() {
  const { usuario, usuarioInfo } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [solicitudesPendientes, setSolicitudesPendientes] = useState(0);
  const migrationRanRef = useRef(false);

  // Escuchar solicitudes pendientes en tiempo real
  useEffect(() => {
    if (usuarioInfo?.email !== "arisleidy0712@gmail.com") return;

    const solicitudesRef = collection(db, "solicitudes_vendedor");
    const q = query(solicitudesRef, where("estado", "==", "pendiente"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSolicitudesPendientes(snapshot.docs.length);
    });

    return () => unsubscribe();
  }, [usuarioInfo?.email]);

  useEffect(() => {
    if (!usuario || !usuarioInfo?.isAdmin) {
      return;
    }

    // Función para actualizar admin en Firestore si el email coincide
    const updateAdminStatus = async (userId, email, currentAdminStatus) => {
      const emailLower = (email || "").toLowerCase().trim();
      const shouldBeAdmin = emailLower === "arisleidy0712@gmail.com";

      if (shouldBeAdmin && !currentAdminStatus) {
        try {
          // Actualizar en ambas colecciones
          await updateDoc(doc(db, "users", userId), {
            admin: true,
            isAdmin: true,
          });

          try {
            await updateDoc(doc(db, "usuarios", userId), {
              admin: true,
              isAdmin: true,
            });
          } catch (err) {
            // Error silencioso
          }
        } catch (err) {
          // Error silencioso
        }
      }
    };

    // Escuchar colección "users"
    const unsubscribeUsers = onSnapshot(
      query(collection(db, "users")),
      (snap) => {
        const usersData = snap.docs.map((doc) => {
          const data = doc.data();
          const emailLower = (data.email || "").toLowerCase().trim();
          const shouldBeAdmin = emailLower === "arisleidy0712@gmail.com";

          // Actualizar en Firestore si es necesario
          if (shouldBeAdmin && !data.admin) {
            updateAdminStatus(doc.id, data.email, data.admin);
          }

          return {
            id: doc.id,
            ...data,
            // Forzar admin si el email coincide (para mostrar correctamente en UI)
            admin: shouldBeAdmin || data.admin,
            isAdmin: shouldBeAdmin || data.isAdmin,
          };
        });
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
        const usuariosData = snap.docs.map((doc) => {
          const data = doc.data();
          const emailLower = (data.email || "").toLowerCase().trim();
          const shouldBeAdmin = emailLower === "arisleidy0712@gmail.com";

          // Actualizar en Firestore si es necesario
          if (shouldBeAdmin && !data.admin) {
            updateAdminStatus(doc.id, data.email, data.admin);
          }

          return {
            id: doc.id,
            ...data,
            // Forzar admin si el email coincide
            admin: shouldBeAdmin || data.admin,
            isAdmin: shouldBeAdmin || data.isAdmin,
          };
        });
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
  }, [usuario, usuarioInfo]);

  if (!usuario)
    return (
      <div className="flex items-center justify-center min-h-screen bg-blue-50">
        Inicia sesión
      </div>
    );

  const isGlobalAdmin = usuarioInfo?.isAdmin === true;
  const isSeller = Boolean(
    usuarioInfo?.isSeller || usuarioInfo?.empresa || usuarioInfo?.empresaId
  );

  // Acceso vendedor: panel simplificado
  if (!isGlobalAdmin && isSeller) {
    return <SellerAdminPanel />;
  }

  // Sin acceso
  if (!isGlobalAdmin)
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

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <AdminDashboard
            onAddProduct={() => {
              setEditingProduct(null);
              setShowProductForm(true);
              setActiveTab("products");
            }}
            onEditProduct={(product) => {
              setEditingProduct(product);
              setShowProductForm(true);
            }}
            onOpenCategories={() => setActiveTab("categories")}
            onViewAllProducts={() => setActiveTab("products")}
            onViewAllOrders={() => setActiveTab("orders")}
            onViewProducts={() => setActiveTab("products")}
            onViewCategories={() => setActiveTab("categories")}
            onViewUsers={() => setActiveTab("users")}
            onViewOrders={() => setActiveTab("orders")}
          />
        );
      case "products":
        return (
          <ProductManagement
            onAddProduct={() => {
              setEditingProduct(null);
              setShowProductForm(true);
            }}
            onEditProduct={(product) => {
              setEditingProduct(product);
              setShowProductForm(true);
            }}
          />
        );
      case "categories":
        return <CategoryManagement />;
      case "users":
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                Gestión de Usuarios
              </h2>
              <input
                type="text"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                placeholder="Buscar por nombre, email, teléfono, dirección o código"
                className="w-full sm:w-80 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            {usuariosFiltrados.length === 0 ? (
              <div className="text-gray-600">
                No hay usuarios que coincidan con la búsqueda.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Teléfono
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Código
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registrado
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rol
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {usuariosFiltrados.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-900 font-medium">
                          {u.displayName || u.nombre || "Usuario"}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-700">
                          {u.email || "-"}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-700">
                          {u.telefono || "-"}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-700">
                          {u.codigo || "-"}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-700">
                          {formatDate(u.createdAt) || "-"}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              u.admin || u.isAdmin
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {u.admin || u.isAdmin ? "Admin" : "Usuario"}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setUsuarioSeleccionado(u);
                              }}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                              title="Ver detalles"
                            >
                              <FiEye size={18} />
                            </button>
                            {(u.email || "").toLowerCase().trim() ===
                              "arisleidy0712@gmail.com" &&
                              !(u.admin || u.isAdmin) && (
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                      await updateDoc(doc(db, "users", u.id), {
                                        admin: true,
                                        isAdmin: true,
                                      });
                                      try {
                                        await updateDoc(
                                          doc(db, "usuarios", u.id),
                                          {
                                            admin: true,
                                            isAdmin: true,
                                          }
                                        );
                                      } catch (err) {
                                        // Error silencioso
                                      }
                                      notify(
                                        "✅ ¡Ahora eres Admin! Refresca la página.",
                                        "success",
                                        "Admin asignado"
                                      );
                                    } catch (error) {
                                      notify(
                                        "Error: " + error.message,
                                        "error",
                                        "Error"
                                      );
                                    }
                                  }}
                                  className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs font-bold"
                                  title="Convertir en Admin"
                                >
                                  👑 ADMIN
                                </button>
                              )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setUserToDelete(u);
                                setShowDeleteUserModal(true);
                              }}
                              className="text-red-600 hover:text-red-800 font-medium"
                              title="Eliminar usuario"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      case "orders":
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Gestión de Pedidos
            </h2>
            <p className="text-gray-600 mb-4">
              Aquí aparecerán los pedidos filtrados por tienda
            </p>
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">
                Funcionalidad de pedidos por tienda - En desarrollo
              </p>
            </div>
          </div>
        );
      case "tiendas":
        return <GestionTiendas />;
      case "solicitudes":
        return <SolicitudesVendedor />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <main className="admin-page min-h-screen bg-gray-50 dark:bg-gray-900 px-2 sm:px-6 pt-2 pb-2 sm:pb-6">
      <div className="w-full px-2">
        {/* HEADER */}
        <div className="text-center mb-3">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 text-gray-900 dark:text-white">
            Panel Administrativo
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-700 dark:text-gray-300 font-medium">
            Gestión Completa del Sistema
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-bold inline-flex items-center gap-2">
              <FiUsers /> {usuarios.length}{" "}
              {usuarios.length === 1 ? "usuario" : "usuarios"} registrados
            </span>
            {solicitudesPendientes > 0 && (
              <button
                onClick={() => setActiveTab("solicitudes")}
                className="bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-300 px-4 py-2 rounded-full text-sm font-bold inline-flex items-center gap-2 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors cursor-pointer border-0"
              >
                <FiUserPlus /> {solicitudesPendientes}{" "}
                {solicitudesPendientes === 1
                  ? "solicitud pendiente"
                  : "solicitudes pendientes"}
              </button>
            )}
            <span className="bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-300 px-4 py-2 rounded-full text-sm font-bold">
              Sincronización en tiempo real
            </span>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-1 mb-4 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-1">
            {[
              { id: "dashboard", label: "Dashboard", icon: <FiBarChart2 /> },
              { id: "products", label: "Productos", icon: <FiBox /> },
              { id: "categories", label: "Categorías", icon: <FiTag /> },
              { id: "orders", label: "Pedidos", icon: <FiSearch /> },
              { id: "users", label: "Usuarios", icon: <FiUsers /> },
              // SOLO mostrar "Tiendas" y "Solicitudes" si eres super admin
              ...(usuarioInfo?.email === "arisleidy0712@gmail.com"
                ? [
                    {
                      id: "tiendas",
                      label: "Tiendas",
                      icon: <FiShoppingBag />,
                    },
                    {
                      id: "solicitudes",
                      label: "Solicitudes",
                      icon: <FiUserPlus />,
                      badge: solicitudesPendientes,
                    },
                  ]
                : []),
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[120px] px-4 py-3 rounded-lg font-medium transition-all duration-200 relative ${
                  activeTab === tab.id
                    ? "bg-blue-600 dark:bg-blue-500 text-white shadow-md"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <span className="text-lg">{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.badge > 0 && (
                    <span
                      className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full"
                      style={{
                        backgroundColor:
                          activeTab === tab.id ? "#ffffff" : "#ef4444",
                        color: activeTab === tab.id ? "#2563eb" : "#ffffff",
                        minWidth: "20px",
                      }}
                    >
                      {tab.badge > 99 ? "99+" : tab.badge}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* TAB CONTENT */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderTabContent()}
        </motion.div>

        {/* MODALS */}
        {usuarioSeleccionado && (
          <UsuarioFullView
            usuario={usuarioSeleccionado}
            onClose={() => setUsuarioSeleccionado(null)}
          />
        )}

        {showProductForm && (
          <ProductForm
            product={editingProduct}
            onClose={() => {
              setShowProductForm(false);
              setEditingProduct(null);
            }}
            onSave={() => {
              setShowProductForm(false);
              setEditingProduct(null);
            }}
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

      {/* Modal de confirmación para eliminar usuario */}
      <AnimatePresence>
        {showDeleteUserModal && userToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
            onClick={() => {
              setShowDeleteUserModal(false);
              setUserToDelete(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Icono de advertencia */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <FiUsers className="w-8 h-8 text-red-600" />
                </div>
              </div>

              {/* Título */}
              <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
                ¿Eliminar usuario?
              </h3>

              {/* Info del usuario */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                <p className="text-center text-lg font-semibold text-gray-700 dark:text-gray-300">
                  {userToDelete.email || userToDelete.displayName || "Usuario"}
                </p>
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                  UID: {userToDelete.id}
                </p>
              </div>

              {/* Advertencia */}
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-800 dark:text-red-200 font-medium text-center">
                  ⚠️ Esta acción NO se puede deshacer
                </p>
              </div>

              {/* Botones */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteUserModal(false);
                    setUserToDelete(null);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    try {
                      // Eliminar de colección users
                      const userDocRef = doc(db, "users", userToDelete.id);
                      await deleteDoc(userDocRef);

                      // Intentar eliminar de colección usuarios si existe
                      try {
                        const usuarioDocRef = doc(
                          db,
                          "usuarios",
                          userToDelete.id
                        );
                        await deleteDoc(usuarioDocRef);
                      } catch (err) {
                        // Error silencioso
                      }

                      notify(
                        "Usuario eliminado exitosamente",
                        "success",
                        "Eliminado"
                      );
                    } catch (error) {
                      notify(
                        "Error al eliminar usuario: " + error.message,
                        "error",
                        "Error"
                      );
                    } finally {
                      setShowDeleteUserModal(false);
                      setUserToDelete(null);
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <span>🗑️</span>
                  Sí, eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

/* Modal de detalles de orden */
function OrderDetailsModal({ order, onClose }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "DOP",
    }).format(amount || 0);
  };

  const formatOrderDate = (fecha) => {
    if (!fecha) return "Fecha no disponible";
    let date;
    if (typeof fecha === "object" && fecha.seconds) {
      date = new Date(fecha.seconds * 1000);
    } else {
      date = new Date(fecha);
    }
    return date.toLocaleDateString("es-DO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case "completado":
        return "status-completed";
      case "cancelado":
        return "status-cancelled";
      case "pendiente":
        return "status-pending";
      default:
        return "status-pending";
    }
  };

  const getStatusText = (estado) => {
    switch (estado) {
      case "completado":
        return "✓ Completado";
      case "cancelado":
        return "✗ Cancelado";
      case "pendiente":
        return "⏳ Pendiente";
      default:
        return "⏳ Pendiente";
    }
  };

  React.useEffect(() => {
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
                      👁️ Ver producto
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
