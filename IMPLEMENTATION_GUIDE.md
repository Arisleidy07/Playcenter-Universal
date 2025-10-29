# 📖 Guía de Implementación Completa - Sistema de Perfil Avanzado

## 🎯 Funcionalidades Implementadas

### ✅ 1. Cambio de Contraseña
- Usuario autenticado puede cambiar su contraseña
- Reset por email ("Olvidé mi contraseña")
- Reautenticación automática cuando es necesario
- Validación de fortaleza de contraseña
- Indicador visual de seguridad

### ✅ 2. Subida de Foto de Perfil
- Vista previa instantánea antes de subir
- Subida a Firebase Storage con progreso
- Validación de tipo y tamaño (max 5MB)
- Guardado automático en Firestore
- Compatible con móvil (cámara/galería)
- Compresión opcional de imágenes

### ✅ 3. Internacionalización (i18n)
- Soporte para Español e Inglés
- Cambio de idioma en perfil
- Persistencia en Firestore y localStorage
- Traducciones en toda la app

### ✅ 4. Notificaciones por Email
- Email automático al crear pedido
- Templates HTML profesionales
- SendGrid integration
- Sistema de idempotencia (no duplicar emails)
- Reintentos automáticos
- Opt-in/out de promociones
- Link de unsubscribe

### ✅ 5. Push Notifications (FCM)
- Permiso de notificaciones
- Notificaciones en foreground
- Notificaciones en background
- Click action personalizado
- Limpieza automática de tokens viejos
- Notificación cuando cambia estado de pedido

### ✅ 6. Seguridad
- Reglas de Firestore por colección
- Reglas de Storage por carpeta
- Validación de permisos
- Protección contra acceso no autorizado

---

## 📁 Estructura de Archivos Creados

```
/src/
├── utils/
│   ├── authUtils.js              # Cambio y reset de contraseña
│   ├── storageUtils.js           # Subida de fotos a Firebase Storage
│   └── fcmUtils.js               # Firebase Cloud Messaging
├── components/
│   └── ChangePasswordModal.jsx   # Modal de cambio de contraseña
├── i18n.js                        # Configuración de internacionalización
└── ...

/functions/
├── index.js                       # Cloud Functions (emails, push, etc)
└── package.json                   # Dependencias de Functions

/public/
└── firebase-messaging-sw.js      # Service Worker para FCM

/
├── firestore.rules               # Reglas de seguridad Firestore
├── storage.rules                 # Reglas de seguridad Storage
├── .env.example                  # Variables de entorno ejemplo
├── DEPLOYMENT_CHECKLIST.md       # Checklist completo de deploy
└── IMPLEMENTATION_GUIDE.md       # Esta guía
```

---

## 🚀 Instalación e Integración

### 1. Instalar Dependencias del Frontend

```bash
# React i18next para internacionalización
npm install i18next react-i18next

# UUID para nombres únicos de archivos
npm install uuid
```

### 2. Instalar Dependencias de Cloud Functions

```bash
cd functions
npm install
```

Dependencias incluidas en `functions/package.json`:
- `@sendgrid/mail`: Envío de emails
- `firebase-admin`: Acceso a Firestore, Auth, Storage
- `firebase-functions`: Triggers y HTTP functions

### 3. Configurar Variables de Entorno

#### Frontend (.env)
Copiar `.env.example` a `.env` y rellenar:

```env
# Firebase config
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...

# FCM VAPID Key
REACT_APP_FIREBASE_VAPID_KEY=...
```

#### Cloud Functions
```bash
# SendGrid
firebase functions:config:set sendgrid.apikey="SG.xxxxx"

# Email settings
firebase functions:config:set mail.from="no-reply@tudominio.com"
firebase functions:config:set site.url="https://tudominio.com"

# Admin API key (generar UUID seguro)
firebase functions:config:set admin.apikey="tu-api-key-super-secreta"

# Unsubscribe secret
firebase functions:config:set unsubscribe.secret="otra-key-secreta"

# Verificar configuración
firebase functions:config:get
```

### 4. Configurar Service Worker (FCM)

Editar `/public/firebase-messaging-sw.js` y reemplazar con tu config de Firebase:

```javascript
firebase.initializeApp({
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROJECT.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_PROJECT.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
});
```

### 5. Inicializar i18n en tu App

Editar `src/index.js` o `src/App.js`:

```javascript
import './i18n'; // Importar configuración de i18n

// Resto de tu código...
```

---

## 🔧 Integración en Profile.jsx

### 1. Importar Utilidades y Componentes

```javascript
import { changePassword, sendPasswordReset } from "../utils/authUtils";
import { 
  uploadProfilePicture, 
  deleteProfilePicture, 
  createImagePreview 
} from "../utils/storageUtils";
import {
  requestNotificationPermission,
  setupForegroundMessageListener,
  areNotificationsEnabled
} from "../utils/fcmUtils";
import ChangePasswordModal from "../components/ChangePasswordModal";
import { useTranslation } from "react-i18next";
```

### 2. Agregar Estados

```javascript
const { t, i18n } = useTranslation();
const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
const [uploadProgress, setUploadProgress] = useState(0);
const [notificationsEnabled, setNotificationsEnabled] = useState(false);
const [settings, setSettings] = useState({
  emailNotifications: true,
  orderNotifications: true,
  offersNotifications: false,
  language: "es"
});
```

### 3. Función de Subida de Foto

```javascript
const handleUploadPhoto = async (file) => {
  try {
    setLoading(true);
    setMensaje({ text: "", tipo: "" });

    // Vista previa instantánea
    const preview = await createImagePreview(file);
    setLocalPreview(preview);

    // Subir a Firebase Storage
    const result = await uploadProfilePicture(
      file, 
      usuario.uid,
      (progress) => setUploadProgress(progress)
    );

    // Actualizar Firestore
    await updateDoc(doc(db, "users", usuario.uid), {
      photoURL: result.url,
      photoPath: result.path
    });

    // Actualizar Auth profile
    await updateProfile(usuario, { photoURL: result.url });

    setMensaje({ text: "Foto actualizada correctamente", tipo: "success" });
    setLocalPreview(null);
  } catch (error) {
    console.error("Error al subir foto:", error);
    setMensaje({ text: error.message, tipo: "error" });
  } finally {
    setLoading(false);
    setUploadProgress(0);
  }
};
```

### 4. Función de Cambio de Idioma

```javascript
const handleLanguageChange = async (lang) => {
  try {
    // Cambiar idioma en i18next
    await i18n.changeLanguage(lang);
    
    // Guardar en Firestore
    await updateDoc(doc(db, "users", usuario.uid), {
      language: lang
    });
    
    // Guardar en localStorage
    localStorage.setItem("language", lang);
    
    setSettings((prev) => ({ ...prev, language: lang }));
    setMensaje({ text: t("profileUpdated"), tipo: "success" });
  } catch (error) {
    console.error("Error al cambiar idioma:", error);
    setMensaje({ text: t("error"), tipo: "error" });
  }
};
```

### 5. Solicitar Permisos de Notificaciones

```javascript
const handleEnableNotifications = async () => {
  try {
    await requestNotificationPermission(usuario.uid);
    setNotificationsEnabled(true);
    setMensaje({ text: "Notificaciones habilitadas", tipo: "success" });
  } catch (error) {
    console.error("Error al habilitar notificaciones:", error);
    setMensaje({ text: error.message, tipo: "error" });
  }
};
```

### 6. Setup Listener de Mensajes (useEffect)

```javascript
useEffect(() => {
  if (!usuario) return;

  // Cargar idioma preferido
  const loadLanguage = async () => {
    try {
      const userDoc = await getDoc(doc(db, "users", usuario.uid));
      const userData = userDoc.data();
      
      if (userData?.language) {
        i18n.changeLanguage(userData.language);
        setSettings((prev) => ({ ...prev, language: userData.language }));
      }
    } catch (error) {
      console.error("Error al cargar idioma:", error);
    }
  };

  loadLanguage();

  // Setup listener de notificaciones
  const unsubscribe = setupForegroundMessageListener((payload) => {
    console.log("Mensaje recibido:", payload);
    setMensaje({
      text: payload.notification?.body || "Nueva notificación",
      tipo: "info"
    });
  });

  // Verificar si notificaciones están habilitadas
  setNotificationsEnabled(areNotificationsEnabled());

  return () => {
    if (unsubscribe) unsubscribe();
  };
}, [usuario]);
```

### 7. Agregar Componentes en el JSX

```javascript
{/* Modal de cambio de contraseña */}
<ChangePasswordModal
  isOpen={changePasswordModalOpen}
  onClose={() => setChangePasswordModalOpen(false)}
}/>

{/* Sección de Configuración */}
{vista === "configuracion" && (
  <div className="config-section">
    <h3>Cambiar contraseña</h3>
    <button onClick={() => setChangePasswordModalOpen(true)}>
      Cambiar contraseña
    </button>

    <h3>Idioma</h3>
    <select value={settings.language} onChange={(e) => handleLanguageChange(e.target.value)}>
      <option value="es">Español</option>
      <option value="en">English</option>
    </select>

    <h3>Notificaciones</h3>
    {!notificationsEnabled && (
      <button onClick={handleEnableNotifications}>
        Habilitar notificaciones push
      </button>
    )}
  </div>
)}
```

---

## 🔔 Configuración de SendGrid

### 1. Crear Cuenta y Obtener API Key

1. Ir a [https://sendgrid.com](https://sendgrid.com)
2. Crear cuenta (plan gratuito: 100 emails/día)
3. Settings → API Keys → Create API Key
4. Seleccionar "Full Access"
5. Copiar la key (solo se muestra una vez)

### 2. Verificar Dominio

1. SendGrid → Settings → Sender Authentication
2. Click "Verify a Single Sender" o "Authenticate Your Domain"
3. Agregar registros DNS (SPF, DKIM)
4. Esperar 24-48h para verificación

### 3. Crear Template (Opcional)

1. SendGrid → Email API → Dynamic Templates
2. Create Template
3. Usar HTML personalizado o Handlebars

---

## 🔥 Deploy de Cloud Functions

### 1. Inicializar (si no está hecho)

```bash
firebase init functions
# Seleccionar JavaScript
# Instalar dependencias: Yes
```

### 2. Probar Localmente

```bash
# Iniciar emuladores
firebase emulators:start

# O solo functions
firebase emulators:start --only functions

# Acceder a UI
# http://localhost:4000
```

### 3. Deploy a Producción

```bash
# Deploy todas las functions
firebase deploy --only functions

# Deploy una función específica
firebase deploy --only functions:onOrderCreated

# Ver logs
firebase functions:log
firebase functions:log --only onOrderCreated
```

---

## 🧪 Testing

### Test de Cambio de Contraseña

```javascript
// En consola del navegador
import { changePassword } from './utils/authUtils';

const user = firebase.auth().currentUser;
await changePassword(user, "contraseña_actual", "nueva_contraseña");
```

### Test de Subida de Foto

```javascript
// Simular upload
const file = document.querySelector('input[type="file"]').files[0];
await uploadProfilePicture(file, userId, (progress) => {
  console.log(`Progreso: ${progress}%`);
});
```

### Test de Email (Cloud Function)

```javascript
// Crear orden de prueba en Firestore
await db.collection("orders").add({
  userId: "test-user",
  email: "tu@email.com",
  customerName: "Test User",
  status: "Pendiente",
  total: 100,
  items: [
    { name: "Producto Test", quantity: 1, price: 100 }
  ],
  createdAt: firebase.firestore.FieldValue.serverTimestamp()
});

// Debería disparar onOrderCreated y enviar email
```

### Test de Push Notification

```javascript
// En frontend
await requestNotificationPermission(userId);

// En Cloud Functions o Firebase Console, enviar notificación test
```

---

## 📊 Monitoreo y Debugging

### Ver Logs de Functions

```bash
# Logs generales
firebase functions:log

# Logs de función específica
firebase functions:log --only onOrderCreated

# Solo errores
firebase functions:log --min-severity ERROR

# Logs en tiempo real
firebase functions:log --follow
```

### Google Cloud Console

1. [https://console.cloud.google.com](https://console.cloud.google.com)
2. Seleccionar proyecto
3. Cloud Functions → Ver logs
4. Cloud Functions → Métricas
5. Configurar alertas

### SendGrid Dashboard

1. [https://app.sendgrid.com](https://app.sendgrid.com)
2. Email Activity → Ver emails enviados
3. Revisar bounces, spam reports
4. Ver estadísticas de apertura/clicks

---

## 🐛 Troubleshooting Común

### "auth/requires-recent-login"
**Problema**: Firebase requiere reautenticación reciente  
**Solución**: La función `changePassword` ya maneja esto con `reauthenticateWithCredential`

### Emails no llegan
**Posibles causas**:
- API key incorrecta → Verificar `firebase functions:config:get`
- Dominio no verificado → Verificar en SendGrid
- Email en spam → Configurar SPF/DKIM
- Función no se ejecutó → Ver logs

### Push notifications no funcionan
**Posibles causas**:
- VAPID key no configurada
- Service worker no registrado → Verificar en DevTools
- Permisos denegados → Solicitar de nuevo
- Tokens no guardados → Verificar Firestore

### Subida de fotos falla
**Posibles causas**:
- Reglas de Storage restrictivas → Revisar `storage.rules`
- Archivo muy grande (>5MB) → Comprimir imagen
- Tipo de archivo no permitido → Solo imágenes
- Sin autenticación → Usuario debe estar logueado

---

## 📚 Recursos Adicionales

- [Firebase Auth Docs](https://firebase.google.com/docs/auth)
- [Firebase Storage Docs](https://firebase.google.com/docs/storage)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [SendGrid API Docs](https://docs.sendgrid.com)
- [react-i18next Docs](https://react.i18next.com)

---

## ✅ Checklist de Implementación

- [ ] Instalar dependencias frontend y functions
- [ ] Configurar variables de entorno
- [ ] Configurar SendGrid
- [ ] Configurar FCM (VAPID key)
- [ ] Actualizar service worker con tu config
- [ ] Importar i18n en App.js
- [ ] Integrar componentes en Profile.jsx
- [ ] Deploy reglas de Firestore y Storage
- [ ] Deploy Cloud Functions
- [ ] Probar cambio de contraseña
- [ ] Probar subida de foto
- [ ] Probar cambio de idioma
- [ ] Probar email al crear orden
- [ ] Probar push notification
- [ ] Configurar monitoring

---

¡Con esta guía tienes todo lo necesario para implementar un sistema completo de perfil profesional! 🚀
