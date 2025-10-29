# 📋 Checklist de Despliegue - Playcenter Universal

## 🔐 1. Configuración de Variables de Entorno

### Frontend (.env)
- [ ] Copiar `.env.example` a `.env`
- [ ] Configurar credenciales de Firebase
- [ ] Configurar VAPID key para FCM
- [ ] Configurar Cloudinary (si aplica)

### Cloud Functions
```bash
# SendGrid
firebase functions:config:set sendgrid.apikey="SG.xxxxxx"

# Email configuration
firebase functions:config:set mail.from="no-reply@tudominio.com"

# Site URL
firebase functions:config:set site.url="https://tudominio.com"

# Admin API Key
firebase functions:config:set admin.apikey="tu-api-key-secreta"

# Unsubscribe secret
firebase functions:config:set unsubscribe.secret="tu-secret-key"
```

- [ ] Configurar todas las variables de entorno
- [ ] Verificar config con `firebase functions:config:get`

---

## 📧 2. Configuración de SendGrid

- [ ] Crear cuenta en SendGrid
- [ ] Generar API Key con permisos de envío
- [ ] Verificar dominio (SPF, DKIM, DMARC)
- [ ] Crear template de email (opcional)
- [ ] Probar envío de email test

**Verificación de dominio:**
1. SendGrid → Settings → Sender Authentication
2. Verificar dominio con registros DNS
3. Esperar 24-48h para propagación DNS

---

## 🔔 3. Configuración de Firebase Cloud Messaging (FCM)

- [ ] Habilitar Cloud Messaging en Firebase Console
- [ ] Generar VAPID key pública:
  - Firebase Console → Project Settings → Cloud Messaging
  - Web Push certificates → Generate key pair
- [ ] Agregar `firebase-messaging-sw.js` en /public
- [ ] Configurar VAPID key en `.env`
- [ ] Probar notificaciones en desarrollo

---

## 🔒 4. Seguridad

### Firestore Rules
- [ ] Revisar y actualizar `firestore.rules`
- [ ] Probar reglas con emuladores
- [ ] Deploy: `firebase deploy --only firestore:rules`

### Storage Rules
- [ ] Revisar y actualizar `storage.rules`
- [ ] Verificar límites de tamaño de archivo
- [ ] Deploy: `firebase deploy --only storage`

### Verificaciones adicionales
- [ ] Habilitar App Check (protección contra bots)
- [ ] Configurar rate limiting en Cloud Functions
- [ ] Revisar índices de Firestore
- [ ] Habilitar logging y monitoring

---

## 🚀 5. Deploy de Cloud Functions

```bash
# Navegar a carpeta functions
cd functions

# Instalar dependencias
npm install

# Probar localmente con emuladores
npm run serve

# Deploy a producción
npm run deploy
# O específicamente:
firebase deploy --only functions
```

- [ ] Instalar dependencias
- [ ] Probar con emuladores
- [ ] Deploy a producción
- [ ] Verificar logs: `firebase functions:log`

---

## 🌐 6. i18n (Internacionalización)

- [ ] Instalar: `npm install i18next react-i18next`
- [ ] Importar i18n en `src/index.js` o `src/App.js`
- [ ] Agregar traducciones en `src/i18n.js`
- [ ] Probar cambio de idioma en interfaz

---

## 📱 7. Service Worker para Push Notifications

Crear `/public/firebase-messaging-sw.js`:

```javascript
importScripts('https://www.gstatic.com/firebasejs/9.x.x/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.x.x/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Mensaje en background:', payload);
  const { title, body, icon } = payload.notification;
  self.registration.showNotification(title, {
    body,
    icon: icon || '/logo192.png'
  });
});
```

- [ ] Crear service worker
- [ ] Configurar Firebase config
- [ ] Registrar en index.html
- [ ] Probar en background y foreground

---

## 🧪 8. Testing

### Local con Emuladores
```bash
# Instalar emulators
firebase init emulators

# Iniciar emulators
firebase emulators:start
```

- [ ] Probar Auth (login, registro, cambio contraseña)
- [ ] Probar Firestore (lectura, escritura)
- [ ] Probar Storage (subida de fotos)
- [ ] Probar Functions (envío de emails)
- [ ] Probar FCM (notificaciones push)

### Tests de Funcionalidad
- [ ] Cambio de contraseña (usuario autenticado)
- [ ] Reset de contraseña (olvide mi contraseña)
- [ ] Subida de foto de perfil
- [ ] Cambio de idioma
- [ ] Opt-in/out de notificaciones
- [ ] Creación de orden → email automático
- [ ] Cambio de estado → push notification
- [ ] Unsubscribe de emails

---

## 📊 9. Monitoring y Logs

- [ ] Habilitar Cloud Functions logs
- [ ] Configurar alertas en Google Cloud Console
- [ ] Monitorear uso de SendGrid
- [ ] Revisar errores en Firestore
- [ ] Configurar Crashlytics (opcional)

**Comandos útiles:**
```bash
# Ver logs de functions
firebase functions:log

# Ver logs en tiempo real
firebase functions:log --only onOrderCreated

# Ver errores
firebase functions:log --only onOrderCreated --min-severity ERROR
```

---

## 🚀 10. Deploy Final a Producción

```bash
# Build del frontend
npm run build

# Deploy completo
firebase deploy

# O por partes:
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
firebase deploy --only storage
```

- [ ] Build del frontend
- [ ] Deploy hosting
- [ ] Deploy functions
- [ ] Deploy rules
- [ ] Verificar sitio en producción
- [ ] Probar flujo completo end-to-end

---

## ✅ 11. Verificación Post-Deploy

### Funcionalidad Básica
- [ ] Sitio carga correctamente
- [ ] Login/registro funcionan
- [ ] Fotos de perfil se suben
- [ ] Cambio de contraseña funciona
- [ ] Reset de contraseña por email

### Emails
- [ ] Se envía email al crear orden
- [ ] Template se ve bien en Gmail, Outlook
- [ ] Link de unsubscribe funciona
- [ ] Emails no van a spam

### Push Notifications
- [ ] Permiso de notificaciones funciona
- [ ] Se reciben en foreground
- [ ] Se reciben en background
- [ ] Click abre la app correctamente

### i18n
- [ ] Cambio de idioma funciona
- [ ] Traducciones se guardan en Firestore
- [ ] Se mantiene al recargar página

---

## 🔧 12. Optimizaciones Opcionales

- [ ] Habilitar Cloud CDN para Firebase Hosting
- [ ] Configurar dominio personalizado
- [ ] Configurar SSL/HTTPS
- [ ] Optimizar imágenes (compresión automática)
- [ ] Implementar lazy loading
- [ ] Configurar caché headers
- [ ] Minificar y comprimir assets
- [ ] Implementar código splitting
- [ ] PWA (Progressive Web App)
- [ ] Analytics y tracking

---

## 📝 13. Documentación

- [ ] Documentar variables de entorno
- [ ] Documentar estructura de Firestore
- [ ] Documentar Cloud Functions
- [ ] Documentar flujos de email
- [ ] Documentar API endpoints
- [ ] README actualizado
- [ ] Guía de contribución

---

## 🆘 14. Troubleshooting Común

### Emails no llegan
- Verificar API key de SendGrid
- Verificar dominio verificado
- Revisar logs: `firebase functions:log --only onOrderCreated`
- Verificar que `emailSent: true` no esté bloqueando reintentos

### Push notifications no funcionan
- Verificar VAPID key configurada
- Verificar permisos en navegador
- Revisar service worker registrado
- Verificar tokens FCM guardados en Firestore

### Errores de permisos Firestore
- Revisar reglas de seguridad
- Verificar auth.uid coincide con userId
- Probar con Firebase Emulators

### Cambio de contraseña falla
- Verificar reautenticación (contraseña actual correcta)
- Verificar nueva contraseña cumple requisitos (min 6 chars)
- Revisar error específico en console

---

## 📞 15. Contactos y Recursos

- **Firebase Console**: https://console.firebase.google.com
- **SendGrid Dashboard**: https://app.sendgrid.com
- **Firebase Docs**: https://firebase.google.com/docs
- **SendGrid Docs**: https://docs.sendgrid.com

---

## ✨ ¡Listo para Producción!

Una vez completado este checklist, tu aplicación estará lista para manejar:
- ✅ Autenticación completa
- ✅ Cambio y reset de contraseñas
- ✅ Subida de fotos de perfil
- ✅ Internacionalización
- ✅ Notificaciones por email
- ✅ Push notifications
- ✅ Seguridad robusta
- ✅ Monitoreo y logs

**¡Éxito con el lanzamiento! 🚀**
