import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  limit,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

/**
 * Hook para manejar notificaciones en tiempo real
 *
 * Tipos de notificaciones:
 * - solicitud_vendedor: Nueva solicitud de tienda
 * - solicitud_aprobada: Tienda aprobada
 * - solicitud_rechazada: Tienda rechazada
 * - nuevo_pedido: Nuevo pedido recibido
 * - pedido_actualizado: Estado de pedido cambió
 * - nuevo_seguidor: Alguien te siguió
 * - producto_agotado: Stock bajo o agotado
 */
export function useNotifications() {
  const { usuario, usuarioInfo } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [solicitudesPendientes, setSolicitudesPendientes] = useState([]);
  const [solicitudesVistas, setSolicitudesVistas] = useState([]); // IDs de solicitudes ya vistas
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const isAdmin =
    usuarioInfo?.email === "arisleidy0712@gmail.com" || usuarioInfo?.isAdmin;
  const isSeller =
    usuarioInfo?.isSeller || usuarioInfo?.empresa || usuarioInfo?.empresaId;

  // Escuchar solicitudes pendientes en tiempo real (solo para admin)
  useEffect(() => {
    if (!usuario || !isAdmin) {
      setSolicitudesPendientes([]);
      return;
    }

    const solicitudesRef = collection(db, "solicitudes_vendedor");
    const q = query(
      solicitudesRef,
      where("estado", "==", "pendiente"),
      orderBy("fechaSolicitud", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const solicitudes = snapshot.docs.map((doc) => ({
          id: `solicitud_${doc.id}`,
          type: "solicitud_vendedor",
          title: "Nueva solicitud de tienda",
          message: `${doc.data().nombreContacto || "Alguien"} quiere abrir "${
            doc.data().tiendaNombre
          }"`,
          actionUrl: "/admin?tab=solicitudes",
          actionLabel: "Ver solicitud",
          read: false,
          createdAt: doc.data().fechaSolicitud?.toDate?.() || new Date(),
          metadata: {
            solicitudId: doc.id,
            tiendaNombre: doc.data().tiendaNombre,
            email: doc.data().email,
          },
        }));
        setSolicitudesPendientes(solicitudes);
      },
      (error) => {
        console.error("Error fetching solicitudes:", error);
      }
    );

    return () => unsubscribe();
  }, [usuario, isAdmin]);

  // Escuchar notificaciones normales
  useEffect(() => {
    if (!usuario) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    // Query para notificaciones del usuario actual
    const notificationsRef = collection(db, "notifications");

    // Construir query basado en el rol del usuario
    let q;

    if (isAdmin) {
      // Admin ve notificaciones de tipo admin
      q = query(
        notificationsRef,
        where("targetType", "==", "admin"),
        orderBy("createdAt", "desc"),
        limit(50)
      );
    } else {
      // Usuario normal solo ve sus notificaciones
      q = query(
        notificationsRef,
        where("targetUserId", "==", usuario.uid),
        orderBy("createdAt", "desc"),
        limit(50)
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notifs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        }));

        // Filtrar notificaciones relevantes para el usuario
        const filteredNotifs = notifs.filter((n) => {
          if (isAdmin && n.targetType === "admin") return true;
          if (n.targetUserId === usuario.uid) return true;
          return false;
        });

        setNotifications(filteredNotifs);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching notifications:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [usuario, isAdmin]);

  // Combinar solicitudes pendientes (marcando las vistas) con notificaciones normales
  const solicitudesConEstado = solicitudesPendientes.map((s) => ({
    ...s,
    read: solicitudesVistas.includes(s.id),
  }));

  const allNotifications = [...solicitudesConEstado, ...notifications].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  // Calcular total de no leídas - recalcular cada vez que cambian las dependencias
  useEffect(() => {
    const solicitudesNoLeidas = solicitudesPendientes.filter(
      (s) => !solicitudesVistas.includes(s.id)
    ).length;
    const notificacionesNoLeidas = notifications.filter((n) => !n.read).length;
    setUnreadCount(solicitudesNoLeidas + notificacionesNoLeidas);
  }, [solicitudesPendientes, notifications, solicitudesVistas]);

  // Marcar notificación como leída
  const markAsRead = async (notificationId) => {
    // Si es una solicitud (empieza con "solicitud_"), marcarla localmente
    if (notificationId.startsWith("solicitud_")) {
      setSolicitudesVistas((prev) => [...prev, notificationId]);
      return;
    }

    // Si es una notificación normal, actualizar en Firestore
    try {
      const notifRef = doc(db, "notifications", notificationId);
      await updateDoc(notifRef, { read: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Marcar todas como leídas
  const markAllAsRead = async () => {
    // Marcar solicitudes localmente
    const solicitudIds = solicitudesPendientes.map((s) => s.id);
    setSolicitudesVistas((prev) => [...prev, ...solicitudIds]);

    // Marcar notificaciones en Firestore
    try {
      const unreadNotifs = notifications.filter((n) => !n.read);
      await Promise.all(
        unreadNotifs.map((n) =>
          updateDoc(doc(db, "notifications", n.id), { read: true })
        )
      );
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  return {
    notifications: allNotifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    isAdmin,
    isSeller,
  };
}

/**
 * Función para crear una notificación
 * Usar desde cualquier parte de la app
 */
export async function createNotification({
  type,
  title,
  message,
  targetUserId = null,
  targetType = "user", // "user" | "admin" | "seller"
  actionUrl = null,
  actionLabel = null,
  metadata = {},
}) {
  try {
    await addDoc(collection(db, "notifications"), {
      type,
      title,
      message,
      targetUserId,
      targetType,
      actionUrl,
      actionLabel,
      metadata,
      read: false,
      createdAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Error creating notification:", error);
    return false;
  }
}

/**
 * Funciones helper para crear notificaciones específicas
 */
export const NotificationHelpers = {
  // Notificar al admin sobre nueva solicitud de vendedor
  newSellerRequest: async (solicitud) => {
    return createNotification({
      type: "solicitud_vendedor",
      title: "Nueva solicitud de tienda",
      message: `${solicitud.nombreContacto} quiere abrir la tienda "${solicitud.tiendaNombre}"`,
      targetType: "admin",
      actionUrl: "/admin?tab=solicitudes",
      actionLabel: "Ver solicitud",
      metadata: {
        solicitudId: solicitud.id,
        tiendaNombre: solicitud.tiendaNombre,
        email: solicitud.email,
      },
    });
  },

  // Notificar al usuario que su tienda fue aprobada
  sellerApproved: async (userId, tiendaNombre, storeId) => {
    return createNotification({
      type: "solicitud_aprobada",
      title: "Tu tienda fue aprobada",
      message: `Tu tienda "${tiendaNombre}" ya está activa. Ahora puedes acceder al Panel de Administración para subir productos y comenzar a vender.`,
      targetUserId: userId,
      targetType: "user",
      actionUrl: "/admin",
      actionLabel: "Ir al Panel Admin",
      metadata: { storeId, tiendaNombre },
    });
  },

  // Notificar al usuario que su tienda fue rechazada
  sellerRejected: async (userId, tiendaNombre, motivo) => {
    return createNotification({
      type: "solicitud_rechazada",
      title: "Solicitud no aprobada",
      message: `Tu solicitud para "${tiendaNombre}" no fue aprobada. ${
        motivo ? `Motivo: ${motivo}` : ""
      }`,
      targetUserId: userId,
      targetType: "user",
      actionUrl: null,
      actionLabel: null,
      metadata: { tiendaNombre, motivo },
    });
  },

  // Notificar al vendedor sobre nuevo pedido
  newOrder: async (sellerId, order) => {
    return createNotification({
      type: "nuevo_pedido",
      title: "¡Nuevo pedido! 🛒",
      message: `Tienes un nuevo pedido por RD$${
        order.total?.toLocaleString() || "0"
      }`,
      targetUserId: sellerId,
      targetType: "seller",
      actionUrl: "/admin?tab=orders",
      actionLabel: "Ver pedido",
      metadata: {
        orderId: order.id,
        total: order.total,
        items: order.items?.length || 0,
      },
    });
  },

  // Notificar al comprador sobre actualización de pedido
  orderUpdated: async (userId, orderId, nuevoEstado) => {
    const estadoTexto = {
      pendiente: "está pendiente",
      procesando: "está siendo procesado",
      enviado: "ha sido enviado 📦",
      entregado: "ha sido entregado ✅",
      cancelado: "fue cancelado",
    };

    return createNotification({
      type: "pedido_actualizado",
      title: "Actualización de pedido",
      message: `Tu pedido ${estadoTexto[nuevoEstado] || nuevoEstado}`,
      targetUserId: userId,
      targetType: "user",
      actionUrl: "/perfil?vista=historial",
      actionLabel: "Ver pedido",
      metadata: { orderId, estado: nuevoEstado },
    });
  },

  // Notificar sobre nuevo seguidor
  newFollower: async (userId, followerName) => {
    return createNotification({
      type: "nuevo_seguidor",
      title: "Nuevo seguidor",
      message: `${followerName} comenzó a seguirte`,
      targetUserId: userId,
      targetType: "user",
      actionUrl: "/perfil?vista=seguidores",
      actionLabel: "Ver perfil",
      metadata: { followerName },
    });
  },
};

export default useNotifications;
