import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../hooks/useNotifications";
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Store,
  ShoppingCart,
  UserPlus,
  AlertCircle,
  Package,
  Clock,
  ChevronRight,
} from "lucide-react";

// Íconos por tipo de notificación - Colores profesionales (azul, verde, gris)
const notificationIcons = {
  solicitud_vendedor: {
    icon: Store,
    color: "#2563eb",
    bg: "#dbeafe",
    darkBg: "rgba(37, 99, 235, 0.15)",
  },
  solicitud_aprobada: {
    icon: Check,
    color: "#16a34a",
    bg: "#dcfce7",
    darkBg: "rgba(22, 163, 74, 0.15)",
  },
  solicitud_rechazada: {
    icon: X,
    color: "#dc2626",
    bg: "#fee2e2",
    darkBg: "rgba(220, 38, 38, 0.15)",
  },
  nuevo_pedido: {
    icon: ShoppingCart,
    color: "#2563eb",
    bg: "#dbeafe",
    darkBg: "rgba(37, 99, 235, 0.15)",
  },
  pedido_actualizado: {
    icon: Package,
    color: "#0891b2",
    bg: "#cffafe",
    darkBg: "rgba(8, 145, 178, 0.15)",
  },
  nuevo_seguidor: {
    icon: UserPlus,
    color: "#2563eb",
    bg: "#dbeafe",
    darkBg: "rgba(37, 99, 235, 0.15)",
  },
  producto_agotado: {
    icon: AlertCircle,
    color: "#dc2626",
    bg: "#fee2e2",
    darkBg: "rgba(220, 38, 38, 0.15)",
  },
  default: {
    icon: Bell,
    color: "#6b7280",
    bg: "#f3f4f6",
    darkBg: "rgba(107, 114, 128, 0.15)",
  },
};

// Formatear tiempo relativo
function timeAgo(date) {
  if (!date) return "";
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Ahora";
  if (minutes < 60) return `Hace ${minutes}m`;
  if (hours < 24) return `Hace ${hours}h`;
  if (days < 7) return `Hace ${days}d`;
  return new Date(date).toLocaleDateString("es-DO", {
    day: "numeric",
    month: "short",
  });
}

// Componente de una notificación individual - DISEÑO MODERNO Y HERMOSO
function NotificationItem({ notification, onRead, onNavigate, isDark }) {
  const iconConfig =
    notificationIcons[notification.type] || notificationIcons.default;
  const IconComponent = iconConfig.icon;
  const isApproval = notification.type === "solicitud_aprobada";
  const isRejection = notification.type === "solicitud_rechazada";

  return (
    <div
      className="cursor-pointer"
      style={{
        padding: "14px 16px",
        margin: "0",
        borderBottom: isDark ? "1px solid #374151" : "1px solid #e5e7eb",
        backgroundColor: notification.read
          ? "transparent"
          : isDark
          ? "rgba(37, 99, 235, 0.08)"
          : "rgba(37, 99, 235, 0.04)",
        transition: "background-color 0.2s",
      }}
      onClick={() => {
        onRead(notification.id);
        if (notification.actionUrl) {
          onNavigate(notification.actionUrl);
        }
      }}
    >
      <div className="d-flex gap-3 align-items-start">
        {/* Ícono simple */}
        <div
          className="d-flex align-items-center justify-content-center flex-shrink-0"
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            backgroundColor: isDark ? iconConfig.darkBg : iconConfig.bg,
          }}
        >
          <IconComponent size={20} style={{ color: iconConfig.color }} />
        </div>

        {/* Contenido */}
        <div className="flex-grow-1" style={{ minWidth: 0 }}>
          <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
            <div className="d-flex align-items-center gap-2">
              <h6
                className="mb-0"
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: isDark ? "#f1f5f9" : "#1e293b",
                  lineHeight: "1.3",
                }}
              >
                {notification.title}
              </h6>
              {!notification.read && (
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: "#2563eb",
                    display: "inline-block",
                  }}
                />
              )}
            </div>
            <span
              className="d-flex align-items-center gap-1"
              style={{
                fontSize: "11px",
                color: isDark ? "#64748b" : "#94a3b8",
                whiteSpace: "nowrap",
              }}
            >
              <Clock size={12} />
              {timeAgo(notification.createdAt)}
            </span>
          </div>

          <p
            className="mb-0"
            style={{
              fontSize: "13px",
              color: isDark ? "#94a3b8" : "#64748b",
              lineHeight: "1.5",
              marginBottom: notification.actionLabel ? "12px" : "0",
            }}
          >
            {notification.message}
          </p>

          {/* Botón de acción simple */}
          {notification.actionLabel && (
            <button
              className="btn d-flex align-items-center gap-1 mt-2"
              style={{
                fontSize: "13px",
                padding: "6px 12px",
                backgroundColor: isApproval
                  ? "#16a34a"
                  : isRejection
                  ? "#dc2626"
                  : "#2563eb",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                fontWeight: "500",
              }}
              onClick={(e) => {
                e.stopPropagation();
                onRead(notification.id);
                if (notification.actionUrl) {
                  onNavigate(notification.actionUrl);
                }
              }}
            >
              {notification.actionLabel}
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Componente principal del panel
export default function NotificationsPanel({ isOpen, onClose, isDark }) {
  const navigate = useNavigate();
  const [showHistory, setShowHistory] = useState(false);
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } =
    useNotifications();

  // Filtrar: solo no leídas o todas si showHistory está activo
  const displayNotifications = showHistory
    ? notifications
    : notifications.filter((n) => !n.read);

  const handleNavigate = (url) => {
    onClose();
    navigate(url);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay gris oscuro que cubre toda la pantalla */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="position-fixed d-none d-md-block"
            style={{
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 99998,
            }}
            onClick={onClose}
          />

          {/* Panel - Fullscreen en móvil, dropdown en desktop */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="position-fixed notifications-panel-responsive"
            style={{
              backgroundColor: isDark ? "#1e293b" : "#ffffff",
              zIndex: 99999,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              border: isDark ? "1px solid #374151" : "1px solid #e5e7eb",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header HERMOSO con gradiente */}
            <div
              className="d-flex justify-content-between align-items-center px-4 py-3"
              style={{
                backgroundColor: isDark ? "#1e293b" : "#ffffff",
                borderBottom: isDark
                  ? "1px solid #374151"
                  : "1px solid #e5e7eb",
              }}
            >
              <div className="d-flex align-items-center gap-2">
                <Bell
                  size={20}
                  style={{ color: isDark ? "#f1f5f9" : "#1e293b" }}
                />
                <h5
                  className="mb-0"
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: isDark ? "#f1f5f9" : "#1e293b",
                  }}
                >
                  Notificaciones
                </h5>
                {unreadCount > 0 && (
                  <span
                    style={{
                      fontSize: "12px",
                      padding: "2px 8px",
                      backgroundColor: "#dc2626",
                      color: "#ffffff",
                      borderRadius: "10px",
                      fontWeight: "600",
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </div>

              {/* Solo botón cerrar */}
              <button
                onClick={onClose}
                className="btn d-flex align-items-center justify-content-center"
                style={{
                  width: "36px",
                  height: "36px",
                  padding: "0",
                  backgroundColor: isDark ? "#374151" : "#f1f5f9",
                  border: "none",
                  borderRadius: "8px",
                  color: isDark ? "#9ca3af" : "#6b7280",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Lista de notificaciones - responsive */}
            <div
              className="flex-grow-1"
              style={{
                overflowY: "auto",
                flex: 1,
                paddingTop: "8px",
                paddingBottom: "16px",
              }}
            >
              {loading ? (
                <div
                  className="d-flex flex-column justify-content-center align-items-center"
                  style={{ padding: "60px 20px" }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      border: "3px solid",
                      borderColor: isDark
                        ? "rgba(59, 130, 246, 0.2)"
                        : "rgba(59, 130, 246, 0.1)",
                      borderTopColor: "#3b82f6",
                    }}
                  />
                  <p
                    style={{
                      marginTop: "16px",
                      color: isDark ? "#94a3b8" : "#64748b",
                      fontSize: "14px",
                    }}
                  >
                    Cargando...
                  </p>
                </div>
              ) : displayNotifications.length === 0 ? (
                <div
                  className="d-flex flex-column justify-content-center align-items-center"
                  style={{ padding: "40px 20px" }}
                >
                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "16px",
                      backgroundColor: isDark ? "#374151" : "#f3f4f6",
                      marginBottom: "16px",
                    }}
                  >
                    <Bell
                      size={28}
                      style={{
                        color: isDark ? "#6b7280" : "#9ca3af",
                      }}
                    />
                  </div>
                  <p
                    style={{
                      fontSize: "15px",
                      fontWeight: "500",
                      color: isDark ? "#9ca3af" : "#6b7280",
                      textAlign: "center",
                    }}
                  >
                    {showHistory
                      ? "No hay notificaciones en el historial"
                      : "No tienes notificaciones nuevas"}
                  </p>
                </div>
              ) : (
                <>
                  {displayNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onRead={markAsRead}
                      onNavigate={handleNavigate}
                      isDark={isDark}
                    />
                  ))}
                </>
              )}
            </div>

            {/* Botón Ver Historial */}
            <div
              style={{
                padding: "12px 16px",
                borderTop: isDark ? "1px solid #374151" : "1px solid #e5e7eb",
                backgroundColor: isDark ? "#1e293b" : "#ffffff",
              }}
            >
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="btn w-100 d-flex align-items-center justify-content-center gap-2"
                style={{
                  padding: "10px",
                  backgroundColor: showHistory
                    ? isDark
                      ? "#374151"
                      : "#e5e7eb"
                    : isDark
                    ? "#1e293b"
                    : "#f9fafb",
                  border: isDark ? "1px solid #4b5563" : "1px solid #d1d5db",
                  borderRadius: "8px",
                  color: isDark ? "#e5e7eb" : "#374151",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                {showHistory ? (
                  <>
                    <Bell size={16} />
                    Ver solo nuevas
                  </>
                ) : (
                  <>
                    <Clock size={16} />
                    Ver historial
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Componente del botón de campanita para el Header - HERMOSO
export function NotificationBell({ isDark, onClick, className = "" }) {
  const { unreadCount } = useNotifications();

  return (
    <button
      onClick={onClick}
      className={`position-relative btn p-0 ${className}`}
      style={{
        backgroundColor: "transparent",
        border: "none",
        padding: "6px",
      }}
      title="Notificaciones"
    >
      <Bell
        size={22}
        style={{
          color: isDark ? "#e2e8f0" : "#1e293b",
        }}
      />
      {unreadCount > 0 && (
        <span
          className="position-absolute d-flex align-items-center justify-content-center"
          style={{
            top: "-2px",
            right: "-2px",
            minWidth: "16px",
            height: "16px",
            padding: "0 4px",
            backgroundColor: "#dc2626",
            color: "#ffffff",
            fontSize: "10px",
            fontWeight: "700",
            borderRadius: "8px",
            border: "2px solid",
            borderColor: isDark ? "#1e293b" : "#ffffff",
          }}
        >
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
}
