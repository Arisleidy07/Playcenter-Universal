# 🧪 Guía de Pruebas - Sistema de Emails

## ✅ Configuración Completada

Tu sistema de emails ya está configurado con:
- ✉️ **Email remitente**: no-reply@pcu.com.do
- 📧 **SendGrid API Key**: Configurada
- 🌐 **Dominio verificado**: pcu.com.do
- 👤 **Email de prueba**: arisleidy0712@gmail.com

---

## 🚀 PASO 1: Activar Plan Blaze

**IMPORTANTE**: Cloud Functions requiere el plan Blaze (es gratis dentro de las cuotas)

### Cómo activarlo:
1. Ve a: https://console.firebase.google.com/project/playcenter-universal/usage/details
2. Click en **"Modificar plan"** o **"Upgrade"**
3. Selecciona **"Plan Blaze"**
4. Agrega una tarjeta (no te cobrarán mientras estés en las cuotas gratuitas)

### Cuotas gratuitas incluidas:
- ✅ 2,000,000 invocaciones/mes
- ✅ 400,000 GB-segundo de tiempo de ejecución
- ✅ 5 GB de salida de red
- ✅ **Suficiente para miles de emails gratis**

---

## 🚀 PASO 2: Desplegar Cloud Functions

Una vez activado Blaze, ejecuta:

```bash
firebase deploy --only functions
```

**Tiempo estimado**: 2-3 minutos

Deberías ver esto al finalizar:
```
✔  functions[onOrderCreated] deployed successfully
✔  functions[onOrderStatusChanged] deployed successfully
✔  functions[sendEmailCampaign] deployed successfully
✔  functions[unsubscribe] deployed successfully
✔  functions[cleanupOldFCMTokens] deployed successfully
```

---

## 🧪 PASO 3: Probar el Sistema

### Opción A: Desde la App (Recomendado)

1. Abre tu app: http://localhost:5174 (o tu URL de producción)
2. Navega a un producto
3. Agrega al carrito
4. Completa el checkout
5. **Usa tu email**: arisleidy0712@gmail.com
6. Completa el pedido

**Resultado esperado**: 
- Deberías recibir un email en **5-10 segundos**
- Revisa inbox y carpeta de spam

---

### Opción B: Script de Prueba Rápido

Ejecuta el script de prueba que creé:

```bash
node test-email-order.js
```

Este script:
- Crea un pedido de prueba en Firestore
- Activa automáticamente la función onOrderCreated
- Envía un email a arisleidy0712@gmail.com

---

### Opción C: Manual en Firestore Console

1. Ve a: https://console.firebase.google.com/project/playcenter-universal/firestore
2. Navega a la colección `orders`
3. Click en **"Agregar documento"**
4. Usa este JSON:

```json
{
  "email": "arisleidy0712@gmail.com",
  "customerName": "Arisleidy Prueba",
  "status": "Pendiente",
  "total": 1500,
  "items": [
    {
      "name": "Producto de Prueba",
      "quantity": 1,
      "price": 1500
    }
  ],
  "paymentMethod": "Tarjeta",
  "createdAt": "Timestamp actual"
}
```

5. Click **"Guardar"**
6. **Revisa tu email en 5-10 segundos**

---

## 📧 Cómo se ve el Email

Recibirás un email profesional con:

**Remitente**: Playcenter Universal <no-reply@pcu.com.do>

**Asunto**: ✅ Pedido recibido - #[ID del pedido]

**Contenido**:
- 🎮 Header azul de Playcenter
- Detalles del pedido
- Lista de productos con precios
- Total en RD$
- Botón "Ver mi pedido"
- Footer profesional

---

## 🔍 Ver Logs de las Functions

Para verificar que todo funcione:

```bash
# Ver todos los logs
firebase functions:log

# Ver logs en tiempo real
firebase functions:log --follow

# Ver solo la función de emails
firebase functions:log --only onOrderCreated

# Ver solo errores
firebase functions:log --min-severity ERROR
```

---

## ✅ Checklist de Verificación

Después de crear un pedido de prueba, verifica:

- [ ] Email recibido en inbox (revisa spam también)
- [ ] Remitente es "no-reply@pcu.com.do"
- [ ] Email tiene diseño profesional
- [ ] Productos se muestran correctamente
- [ ] Total es correcto
- [ ] Botón "Ver mi pedido" funciona
- [ ] En Firestore, el pedido tiene `emailSent: true`

---

## 🎯 Probar Otras Funcionalidades

### 1. Push Notifications (al cambiar estado)

1. Ve a Firestore Console
2. Encuentra tu pedido de prueba
3. Cambia `status` de "Pendiente" a "En camino"
4. Deberías recibir una notificación push (si tienes FCM configurado)

### 2. Email Campaign (para marketing)

```bash
curl -X POST https://us-central1-playcenter-universal.cloudfunctions.net/sendEmailCampaign \
  -H "Content-Type: application/json" \
  -H "x-api-key: PCU-ADMIN-2024-SECURE-KEY-XYZ789" \
  -d '{
    "subject": "🎮 Oferta especial solo para ti",
    "html": "<h1>Hola!</h1><p>Tenemos ofertas increíbles</p>",
    "testMode": true
  }'
```

### 3. Página de Unsubscribe

Ve a: https://us-central1-playcenter-universal.cloudfunctions.net/unsubscribe?email=arisleidy0712@gmail.com

---

## 📊 Monitoreo en Producción

### Firebase Console - Functions
https://console.firebase.google.com/project/playcenter-universal/functions

Aquí verás:
- Estado de cada función (healthy/unhealthy)
- Número de invocaciones
- Errores recientes
- Tiempo de ejecución promedio

### SendGrid Dashboard
https://app.sendgrid.com/email_activity

Aquí verás:
- Emails enviados
- Emails abiertos
- Clicks en links
- Bounces y spam reports

---

## 🐛 Problemas Comunes

### Email no llega

**Solución**:
1. Revisa carpeta de spam
2. Verifica logs: `firebase functions:log --only onOrderCreated`
3. Verifica que el pedido tenga email: `order.email` o `order.customerEmail`
4. Verifica que NO tenga `emailSent: true` (se marca después de enviar)

### Error "config.sendgrid is undefined"

**Solución**:
```bash
firebase functions:config:get
firebase functions:config:set sendgrid.apikey="TU-API-KEY"
firebase deploy --only functions
```

### Error 403 en SendGrid

**Solución**:
- API key incorrecta o revocada
- Generar nueva API key en SendGrid
- Actualizar config de Firebase

---

## 📞 Soporte

Si algo no funciona:
1. Revisa los logs: `firebase functions:log`
2. Verifica la configuración: `firebase functions:config:get`
3. Revisa SendGrid Dashboard para ver si hay errores
4. Verifica que el dominio pcu.com.do esté verificado en SendGrid

---

## 🎉 ¡Todo Listo!

Una vez que completes estos pasos, tendrás:
- ✅ Emails automáticos funcionando
- ✅ Push notifications configuradas
- ✅ Sistema completo de notificaciones
- ✅ Monitoreo y logs funcionando

**¡Tu sistema de emails profesional está listo para producción!** 🚀
