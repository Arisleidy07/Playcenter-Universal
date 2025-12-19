# 📧 Configuración de Resend para Envío de Emails

## 🎯 Descripción

Este sistema utiliza **Resend** (resend.com) para enviar emails automáticos cuando:

- ✅ Se **aprueba** una solicitud de tienda
- ❌ Se **rechaza** una solicitud de tienda
- 📧 Se procesan emails de la cola (`mail_queue`)
- 🔔 Se envían notificaciones genéricas

## 🔧 Configuración Paso a Paso

### 1. Crear cuenta en Resend

1. Ve a [resend.com](https://resend.com)
2. Crea una cuenta gratuita
3. Verifica tu email

### 2. Obtener API Key

1. En el dashboard de Resend, ve a **API Keys**
2. Crea una nueva API Key
3. Copia la key (empieza con `re_`)

### 3. Configurar dominio (Opcional pero recomendado)

Para enviar desde tu propio dominio:

1. Ve a **Domains** en Resend
2. Agrega tu dominio (ej: `playcenteruniversal.com`)
3. Configura los registros DNS (MX, SPF, DKIM)
4. Espera la verificación

> **Nota**: Sin dominio verificado, los emails se envían desde `onboarding@resend.dev`

### 4. Configurar Firebase Functions

#### Opción A: Variables de entorno en Firebase

```bash
# Navega a la carpeta functions
cd functions

# Configura la API key de Resend
firebase functions:config:set resend.apikey="re_TU_API_KEY_AQUI"

# Configura el email de origen (opcional)
firebase functions:config:set mail.from="Playcenter Universal <no-reply@tudominio.com>"

# Configura la URL del sitio (opcional)
firebase functions:config:set site.url="https://playcenter-universal.vercel.app"

# Verifica la configuración
firebase functions:config:get
```

#### Opción B: Variables de entorno locales (para desarrollo)

Crea un archivo `.env` en la carpeta `functions/`:

```env
RESEND_API_KEY=re_TU_API_KEY_AQUI
```

### 5. Instalar dependencias

```bash
cd functions
npm install resend
```

### 6. Desplegar las funciones

```bash
firebase deploy --only functions
```

## 📬 Funciones de Email Disponibles

### `sendStoreApprovedEmail`

Envía email cuando se aprueba una tienda.

```javascript
const sendStoreApprovedEmail = httpsCallable(
  functions,
  "sendStoreApprovedEmail"
);
await sendStoreApprovedEmail({
  email: "usuario@email.com",
  nombreContacto: "Juan Pérez",
  tiendaNombre: "Mi Tienda",
  storeId: "store123",
});
```

### `sendStoreRejectedEmail`

Envía email cuando se rechaza una tienda.

```javascript
const sendStoreRejectedEmail = httpsCallable(
  functions,
  "sendStoreRejectedEmail"
);
await sendStoreRejectedEmail({
  email: "usuario@email.com",
  nombreContacto: "Juan Pérez",
  tiendaNombre: "Mi Tienda",
  motivo: "Información incompleta",
});
```

### `sendNotificationEmail`

Envía notificaciones genéricas por email.

```javascript
const sendNotificationEmail = httpsCallable(functions, "sendNotificationEmail");
await sendNotificationEmail({
  email: "usuario@email.com",
  subject: "Asunto del email",
  title: "Título",
  message: "Contenido del mensaje",
  actionUrl: "https://...",
  actionLabel: "Ver más",
  type: "success", // success | error | warning | info
});
```

### `processMailQueue` (Automático)

Se ejecuta automáticamente cuando se agrega un documento a `mail_queue`.

## 🔔 Sistema de Notificaciones In-App

Además de los emails, el sistema crea notificaciones dentro de la aplicación:

### Tipos de notificaciones:

- `solicitud_vendedor` - Nueva solicitud de tienda (para admin)
- `solicitud_aprobada` - Tienda aprobada (para usuario)
- `solicitud_rechazada` - Tienda rechazada (para usuario)
- `nuevo_pedido` - Nuevo pedido (para vendedor)
- `pedido_actualizado` - Estado de pedido cambió (para comprador)
- `nuevo_seguidor` - Alguien te siguió

### Crear notificación manualmente:

```javascript
import {
  createNotification,
  NotificationHelpers,
} from "../hooks/useNotifications";

// Opción 1: Función genérica
await createNotification({
  type: "solicitud_aprobada",
  title: "¡Tu tienda fue aprobada!",
  message: "Ya puedes empezar a vender",
  targetUserId: "user123",
  targetType: "user",
  actionUrl: "/admin",
  actionLabel: "Ir al panel",
});

// Opción 2: Helpers predefinidos
await NotificationHelpers.sellerApproved(userId, tiendaNombre, storeId);
await NotificationHelpers.sellerRejected(userId, tiendaNombre, motivo);
await NotificationHelpers.newOrder(sellerId, order);
await NotificationHelpers.orderUpdated(userId, orderId, nuevoEstado);
```

## 🧪 Probar el Sistema

### 1. Probar envío de email (desde consola de Firebase)

```javascript
// En Firebase Console > Functions > Shell
const sendStoreApprovedEmail = require("./index").sendStoreApprovedEmail;
sendStoreApprovedEmail.run({
  email: "tu-email@test.com",
  nombreContacto: "Test User",
  tiendaNombre: "Tienda de Prueba",
  storeId: "test123",
});
```

### 2. Probar desde la app

1. Crea una solicitud de tienda desde `/crear-tienda`
2. Ve al panel de admin `/admin?tab=solicitudes`
3. Aprueba o rechaza la solicitud
4. Verifica que llegue el email y la notificación

## 📊 Monitoreo

### Ver logs de Firebase Functions:

```bash
firebase functions:log
```

### Ver emails enviados en Resend:

1. Ve a [resend.com/emails](https://resend.com/emails)
2. Verifica el estado de cada email

## ⚠️ Límites de Resend (Plan Gratuito)

- **100 emails/día**
- **3,000 emails/mes**
- Sin dominio personalizado (usa `onboarding@resend.dev`)

Para más volumen, considera el plan de pago.

## 🔒 Seguridad

- ✅ La API key de Resend está en variables de entorno de Firebase
- ✅ Las funciones solo pueden ser llamadas desde la app
- ✅ Los emails se envían desde el servidor, no desde el cliente
- ✅ No se expone la API key en el código del frontend

## 📁 Archivos Relacionados

- `functions/index.js` - Funciones de Firebase con Resend
- `functions/package.json` - Dependencia de Resend
- `src/components/SolicitudesVendedor.jsx` - Llama a las funciones de email
- `src/hooks/useNotifications.js` - Sistema de notificaciones in-app
- `src/components/NotificationsPanel.jsx` - UI de notificaciones

## 🚀 Flujo Completo

```
Usuario solicita tienda
        ↓
Admin aprueba/rechaza
        ↓
┌───────────────────────────────────────┐
│  1. Se actualiza Firestore            │
│  2. Se llama Firebase Function        │
│  3. Resend envía email                │
│  4. Se crea notificación in-app       │
│  5. Usuario ve campanita con número   │
│  6. Usuario abre panel de notificaciones│
│  7. Usuario recibe email en su correo │
└───────────────────────────────────────┘
```

## ❓ Troubleshooting

### El email no llega

1. Verifica la API key de Resend
2. Revisa los logs de Firebase Functions
3. Verifica que el email no esté en spam
4. Confirma que el dominio está verificado (si usas uno personalizado)

### Error "CORS" o "Permission denied"

1. Asegúrate de que las funciones están desplegadas
2. Verifica que el usuario está autenticado

### Las notificaciones no aparecen

1. Verifica que el usuario tiene `targetUserId` correcto
2. Revisa la colección `notifications` en Firestore
3. Confirma que el hook `useNotifications` está funcionando
