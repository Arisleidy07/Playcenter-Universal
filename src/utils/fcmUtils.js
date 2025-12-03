import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { doc, setDoc, deleteDoc, collection } from "firebase/firestore";
import { db } from "../firebase";

// VAPID key pública (obtenerla de Firebase Console -> Project Settings -> Cloud Messaging)
// Reemplazar con tu clave real
const VAPID_KEY = process.env.REACT_APP_FIREBASE_VAPID_KEY || "YOUR_PUBLIC_VAPID_KEY";

/**
 * Solicitar permisos de notificación y obtener token FCM
 * @param {string} userId - ID del usuario
 */
export async function requestNotificationPermission(userId) {
  try {
    // Verificar si el navegador soporta notificaciones
    if (!("Notification" in window)) {
      throw new Error("Este navegador no soporta notificaciones");
    }

    // Solicitar permisos
    const permission = await Notification.requestPermission();
    
    if (permission !== "granted") {
      throw new Error("Permisos de notificación denegados");
    }

    // Obtener token FCM
    const messaging = getMessaging();
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    
    if (!token) {
      throw new Error("No se pudo obtener el token FCM");
    }

    // Guardar token en Firestore
    await saveTokenToFirestore(userId, token);
    
    return { success: true, token };
  } catch (error) {
    // console.error("Error al solicitar permisos de notificación:", error);
    throw error;
  }
}

/**
 * Guardar token FCM en Firestore
 * @param {string} userId - ID del usuario
 * @param {string} token - Token FCM
 */
export async function saveTokenToFirestore(userId, token) {
  try {
    const tokenRef = doc(db, `users/${userId}/fcmTokens`, token);
    await setDoc(tokenRef, {
      token,
      createdAt: new Date(),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
    });
    
    return { success: true };
  } catch (error) {
    // console.error("Error al guardar token:", error);
    throw error;
  }
}

/**
 * Eliminar token FCM de Firestore
 * @param {string} userId - ID del usuario
 * @param {string} token - Token FCM
 */
export async function removeTokenFromFirestore(userId, token) {
  try {
    const tokenRef = doc(db, `users/${userId}/fcmTokens`, token);
    await deleteDoc(tokenRef);
    
    return { success: true };
  } catch (error) {
    // console.error("Error al eliminar token:", error);
    throw error;
  }
}

/**
 * Configurar listener para mensajes en primer plano
 * @param {Function} onMessageReceived - Callback cuando se recibe mensaje
 */
export function setupForegroundMessageListener(onMessageReceived) {
  try {
    const messaging = getMessaging();
    
    return onMessage(messaging, (payload) => {
      // console.log("Mensaje recibido en primer plano:", payload);
      
      if (onMessageReceived) {
        onMessageReceived(payload);
      }
      
      // Mostrar notificación si tiene payload
      if (payload.notification) {
        const { title, body, icon } = payload.notification;
        
        // Crear notificación del navegador
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(title, {
            body,
            icon: icon || "/logo192.png",
            badge: "/logo192.png",
            tag: payload.messageId || Date.now().toString(),
          });
        }
      }
    });
  } catch (error) {
    // console.error("Error al configurar listener de mensajes:", error);
    return null;
  }
}

/**
 * Verificar si las notificaciones están habilitadas
 */
export function areNotificationsEnabled() {
  if (!("Notification" in window)) {
    return false;
  }
  
  return Notification.permission === "granted";
}

/**
 * Verificar estado de permisos de notificación
 */
export function getNotificationPermissionStatus() {
  if (!("Notification" in window)) {
    return "unsupported";
  }
  
  return Notification.permission; // "granted", "denied", "default"
}

/**
 * Test de notificación
 * @param {string} title - Título de la notificación
 * @param {string} body - Cuerpo de la notificación
 */
export function testNotification(title = "Prueba", body = "Esta es una notificación de prueba") {
  if (!areNotificationsEnabled()) {
    // console.warn("Las notificaciones no están habilitadas");
    return;
  }
  
  new Notification(title, {
    body,
    icon: "/logo192.png",
    badge: "/logo192.png",
  });
}
