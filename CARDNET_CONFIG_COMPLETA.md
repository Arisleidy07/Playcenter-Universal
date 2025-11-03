# 🎯 CONFIGURACIÓN COMPLETA DE CARDNET - PLAYCENTER UNIVERSAL

## ✅ ESTADO ACTUAL: TODO DESPLEGADO Y FUNCIONANDO

**Última actualización:** 3 de Noviembre, 2025
**Ambiente:** LAB (Pruebas)

---

## 🔑 CREDENCIALES CARDNET LAB

```javascript
AMBIENTE: LAB (Pruebas)
API_URL: "https://lab.cardnet.com.do/sessions"
AUTHORIZE_URL: "https://lab.cardnet.com.do/authorize"

// Credenciales de Merchant (LAB)
MerchantNumber: "349000000"
MerchantTerminal: "58585858"
MerchantTerminal_amex: "00000001"
MerchantType: "7997"
AcquiringInstitutionCode: "349"
MerchantName: "PLAYCENTER UNIVERSAL PRUEBAS DO"

// Configuración de transacciones
TransactionType: "200" // Venta normal
CurrencyCode: "214"    // Pesos Dominicanos (DOP)
PageLanguaje: "ESP"    // Español
```

---

## 📦 PARÁMETROS DE LA PETICIÓN

### **Creación de Sesión (POST /sessions)**

```json
{
  "TransactionType": "200",
  "CurrencyCode": "214",
  "AcquiringInstitutionCode": "349",
  "MerchantType": "7997",
  "MerchantNumber": "349000000",
  "MerchantTerminal": "58585858",
  "MerchantTerminal_amex": "00000001",
  "ReturnUrl": "https://tu-dominio.vercel.app/payment/success",
  "CancelUrl": "https://tu-dominio.vercel.app/payment/cancel",
  "PageLanguaje": "ESP",
  "OrdenId": "ORD-1234567890",
  "TransactionId": "123456",
  "Tax": "1588",
  "MerchantName": "PLAYCENTER UNIVERSAL PRUEBAS DO",
  "Amount": "8810"
}
```

### **Formato de Montos:**
- **Amount:** Centavos sin padding (ej: "8810" = RD$88.10)
- **Tax:** ITBIS (18%) en centavos (ej: "1588" = RD$15.88)
- **NO usar formato de 12 dígitos para LAB**

### **IDs Únicos:**
- **OrdenId:** `ORD-${timestamp}-${random}` (ej: "ORD-1730304000-abc123def")
- **TransactionId:** Últimos 6 dígitos del timestamp

---

## 🔄 FLUJO COMPLETO DE PAGO

```
1. USUARIO HACE CLICK EN "COMPRAR AHORA"
   ↓
   
2. FRONTEND (BotonCardnet.jsx)
   - Llama a Firebase Function: createCardnetSession
   - Envía: amount, orderId, items
   ↓
   
3. FIREBASE FUNCTION (createCardnetSession)
   - Valida monto
   - Formatea parámetros según especificaciones
   - POST a https://lab.cardnet.com.do/sessions
   - Recibe: SESSION + session-key
   ↓
   
4. FRONTEND
   - Guarda sessionKey en sessionStorage
   - Crea form con SESSION
   - POST a https://lab.cardnet.com.do/authorize
   ↓
   
5. CARDNET GATEWAY
   - Usuario ingresa datos de tarjeta
   - Procesa pago
   - Redirige según resultado:
     * Exitoso → /payment/success?session=XXX
     * Cancelado → /payment/cancel?session=XXX
     * Pendiente → /payment/pending?session=XXX
   ↓
   
6. FRONTEND (PaymentSuccess.jsx)
   - Llama a Firebase Function: verifyCardnetTransaction
   - Envía: session, sessionKey
   ↓
   
7. FIREBASE FUNCTION (verifyCardnetTransaction)
   - GET a https://lab.cardnet.com.do/sessions/{SESSION}?sk={key}
   - Obtiene ResponseCode
   - Devuelve resultado
   ↓
   
8. FRONTEND
   - Si ResponseCode === "00" → Éxito
   - Crea orden en Firestore
   ↓
   
9. FIREBASE FUNCTION (onOrderCreated)
   - Trigger automático al crear orden
   - Envía email de confirmación con SendGrid
```

---

## 📁 ARCHIVOS MODIFICADOS

### **Backend - Firebase Functions**

**`/functions/index.js`**
```javascript
// Función 1: Crear sesión de Cardnet
exports.createCardnetSession = functions.https.onCall(async (data, context) => {
  // Valida monto
  // Formatea Amount y Tax (sin padding)
  // POST a Cardnet API
  // Retorna SESSION + sessionKey
});

// Función 2: Verificar transacción
exports.verifyCardnetTransaction = functions.https.onCall(async (data) => {
  // GET resultado de Cardnet
  // Retorna ResponseCode y detalles
});

// Función 3: Enviar email (trigger automático)
exports.onOrderCreated = functions.firestore
  .document("orders/{orderId}")
  .onCreate(async (snap, context) => {
    // Se dispara al crear orden
    // Envía email con SendGrid
  });
```

**`/functions/package.json`**
```json
{
  "engines": { "node": "20" },
  "dependencies": {
    "axios": "^1.6.0",
    "firebase-admin": "^11.11.0",
    "firebase-functions": "^4.5.0",
    "@sendgrid/mail": "^7.7.0"
  }
}
```

### **Frontend**

**`/src/firebase.js`**
```javascript
import { getFunctions } from "firebase/functions";
const functions = getFunctions(app);
export { db, auth, storage, functions };
```

**`/src/components/BotonCardnet.jsx`**
```javascript
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";

const iniciarPago = async () => {
  // Llama a createCardnetSession
  // Recibe SESSION
  // POST form a Cardnet
};
```

**`/src/pages/PaymentSuccess.jsx`**
```javascript
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";

// Llama a verifyCardnetTransaction
// Si ResponseCode === "00" → Crea orden
// Trigger automático envía email
```

---

## 🧪 TARJETAS DE PRUEBA (LAB)

```
✅ VISA APROBADA:
   Número: 4242 4242 4242 4242
   CVV: 123
   Fecha: Cualquier fecha futura
   Nombre: Test User

✅ MASTERCARD APROBADA:
   Número: 5555 5555 5555 5557
   CVV: 123
   Fecha: Cualquier fecha futura
   Nombre: Test User

❌ TARJETA RECHAZADA:
   Número: 4000 0000 0000 0002
   CVV: 123
   Fecha: Cualquier fecha futura
```

---

## 📊 CÓDIGOS DE RESPUESTA

| Código | Significado |
|--------|-------------|
| `00` | ✅ Transacción aprobada |
| `01` | Llamar al banco |
| `04` | ❌ Rechazada |
| `05` | ❌ Rechazada |
| `51` | ❌ Fondos insuficientes |
| `TF` | ❌ Autenticación 3DS rechazada |

**IMPORTANTE:** Solo `ResponseCode === "00"` se considera éxito.

---

## ⚙️ CONFIGURACIÓN DE URLs

### **Detección Automática**
```javascript
// Firebase Function detecta automáticamente el dominio
const API_BASE = context.rawRequest?.headers?.origin || 
                 context.rawRequest?.headers?.referer?.replace(/\/$/, "") ||
                 "https://playcenter-universal.vercel.app";
```

### **URLs Configuradas**
```
ReturnUrl:  ${API_BASE}/payment/success
CancelUrl:  ${API_BASE}/payment/cancel
```

**Dominios válidos:**
- Local: `http://localhost:5174`
- Vercel: `https://playcenter-universal.vercel.app`
- Vercel (custom): `https://tu-dominio-custom.vercel.app`

---

## 🔐 SEGURIDAD

### **sessionStorage (Frontend)**
```javascript
// Guardado después de crear sesión:
sessionStorage.setItem('cardnetSessionKey', sessionKey);
sessionStorage.setItem('cardnetOrderId', orderId);
sessionStorage.setItem('cardnetTransactionId', transactionId);

// Limpiado después de crear orden:
sessionStorage.removeItem('cardnetSessionKey');
sessionStorage.removeItem('cardnetOrderId');
sessionStorage.removeItem('cardnetTransactionId');
sessionStorage.removeItem('checkoutPayload');
```

### **Validaciones**
- ✅ Session expira en 30 minutos
- ✅ sessionKey requerido para verificar
- ✅ Solo ResponseCode "00" crea orden
- ✅ Prevención de órdenes duplicadas (check por SESSION)

---

## 📧 EMAIL AUTOMÁTICO

### **Trigger**
```javascript
exports.onOrderCreated = functions.firestore
  .document("orders/{orderId}")
  .onCreate(async (snap, context) => {
    // Se ejecuta automáticamente al crear orden
  });
```

### **Condiciones para enviar:**
- ✅ Orden creada en Firestore
- ✅ Campo `email` o `customerEmail` presente
- ✅ `emailSent: false`

### **Contenido del email:**
- Número de orden
- Fecha y hora
- Estado (Completado)
- Método de pago (CardNet)
- Lista de productos
- Total
- Link a perfil

---

## 🐛 DEBUGGING

### **Logs en Firebase Functions:**
```bash
firebase functions:log --only createCardnetSession
firebase functions:log --only verifyCardnetTransaction
firebase functions:log --only onOrderCreated
```

### **Logs importantes:**
```javascript
// Al crear sesión
console.log("📤 Enviando solicitud a Cardnet:", requestBody);
console.log("🔗 URL base detectada:", API_BASE);
console.log("✅ Respuesta de Cardnet:", response.data);

// Al verificar
console.log("🔍 Verificando transacción Cardnet:", session);
console.log("✅ Resultado Cardnet:", response.data);

// Al crear orden
console.log("✅ Orden creada exitosamente - Email se enviará automáticamente");
```

### **Consola del navegador:**
```javascript
// Al iniciar pago
console.log('📤 Creando sesión de Cardnet...', { amount, orderId, items });
console.log('✅ Sesión creada:', session);

// Al verificar resultado
console.log('🔍 Verificando transacción con Cardnet...');
console.log('✅ Resultado de verificación:', data);
```

---

## ⚡ OPTIMIZACIONES

### **Timeouts configurados:**
- Firebase Function → Cardnet: **15 segundos**
- Frontend → Firebase Function: **20 segundos**

### **Manejo de errores:**
```javascript
// Error de timeout
if (error.code === "ECONNABORTED") {
  throw new functions.https.HttpsError(
    "deadline-exceeded",
    "Cardnet tardó demasiado en responder"
  );
}

// Error 405
if (error.response?.status === 405) {
  throw new functions.https.HttpsError(
    "failed-precondition",
    "Método HTTP no permitido por Cardnet"
  );
}
```

---

## 🚀 DESPLIEGUE

### **1. Firebase Functions:**
```bash
cd /Users/arisleidy/Downloads/PCU
firebase deploy --only functions --force
```

### **2. Frontend (Vercel):**
```bash
git add -A
git commit -m "Actualización Cardnet"
git push origin main
# Vercel despliega automáticamente
```

---

## ✅ CHECKLIST DE VERIFICACIÓN

### **Backend:**
- [x] Firebase Functions desplegadas
- [x] Node.js 20 configurado
- [x] axios instalado
- [x] Parámetros según ejemplo de Postman
- [x] TransactionType: "200" (sin 0 inicial)
- [x] Montos sin padding (LAB)
- [x] URLs dinámicas según origen
- [x] Timeout 15s
- [x] Manejo de errores específicos

### **Frontend:**
- [x] firebase.js exporta functions
- [x] BotonCardnet usa httpsCallable
- [x] PaymentSuccess usa httpsCallable
- [x] sessionStorage guarda sessionKey
- [x] sessionStorage limpiado después
- [x] Timeout 20s en frontend
- [x] Mensajes de error claros

### **Integración:**
- [x] Flujo de 2 pasos implementado
- [x] Verificación con ResponseCode
- [x] Creación de orden condicional
- [x] Email automático
- [x] Prevención de duplicados
- [x] Limpieza de sessionStorage

---

## 🎯 PRÓXIMOS PASOS (PRODUCCIÓN)

Cuando estés listo para producción:

### **1. Obtener credenciales de PRODUCCIÓN:**
Contactar a Cardnet para obtener:
- MerchantNumber (producción)
- MerchantTerminal (producción)
- MerchantType (producción)
- AcquiringInstitutionCode (producción)

### **2. Cambiar URLs:**
```javascript
// En functions/index.js
const CARDNET_API = "https://ecommerce.cardnet.com.do/sessions";

// En BotonCardnet.jsx
const AUTHORIZE_URL = "https://ecommerce.cardnet.com.do/authorize";
```

### **3. Actualizar MerchantName:**
```javascript
MerchantName: "PLAYCENTER UNIVERSAL" // Remover "PRUEBAS DO"
```

### **4. Usar formato de 12 dígitos:**
```javascript
// PRODUCCIÓN requiere padding
const formattedAmount = String(amountInCents).padStart(12, "0");
const formattedTax = String(taxAmount).padStart(12, "0");
```

---

## 📞 SOPORTE

**Firebase Functions:**
- Console: https://console.firebase.google.com/project/playcenter-universal/functions
- Logs: `firebase functions:log`

**Cardnet LAB:**
- Documentación: Archivo local en `/Users/arisleidy/Downloads/CARDNET/`
- API: https://lab.cardnet.com.do

**Vercel:**
- Dashboard: https://vercel.com/dashboard
- Logs: Panel de deployment

---

## 🎉 ESTADO FINAL

```
✅ Firebase Functions: DESPLEGADAS
✅ Frontend: DESPLEGADO EN VERCEL
✅ Integración Cardnet: FUNCIONANDO
✅ Email automático: CONFIGURADO
✅ Parámetros: CORRECTOS según Postman
✅ Timeouts: OPTIMIZADOS
✅ Errores: MANEJADOS
✅ URLs: DINÁMICAS
✅ Seguridad: IMPLEMENTADA
```

**TODO ESTÁ LISTO Y FUNCIONANDO** 🚀
