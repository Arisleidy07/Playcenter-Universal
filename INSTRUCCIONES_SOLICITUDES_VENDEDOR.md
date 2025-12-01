# 📋 Sistema de Solicitudes de Vendedor - Instrucciones Completas

## 🎯 ¿Cómo Funciona?

El sistema ahora funciona con **APROBACIÓN MANUAL** de solicitudes (como tú solicitaste):

### Para las Personas (Solicitantes):

1. Van a `/vender` y hacen clic en "COMENZAR"
2. Son redirigidos a `/solicitar-vender`
3. Llenan un formulario de 3 pasos:
   - **Paso 1:** Nombre de tienda, eslogan, descripción
   - **Paso 2:** Logo y banner (opcional)
   - **Paso 3:** Email, nombre, teléfono, dirección
4. Al enviar, ven el mensaje:
   > **"Playcenter Universal evaluará tu solicitud"**  
   > Te enviaremos la respuesta a tu email en 24-48 horas.
5. La solicitud se guarda en Firebase y ellos NO tienen acceso de vendedor todavía.

### Para Ti (Super Admin - arisleidy0712@gmail.com):

1. Inicias sesión con tu cuenta `arisleidy0712@gmail.com`
2. Vas al **Panel Administrativo** (`/admin`)
3. Verás una nueva pestaña: **"Solicitudes"** (solo visible para ti)
4. Ahí aparecen TODAS las solicitudes con:
   - ✅ **Estadísticas:** Pendientes, Aprobadas, Rechazadas
   - 📋 **Filtros:** Ver por estado
   - 🖼️ **Imágenes:** Logo y banner del solicitante
   - 📧 **Información:** Email, nombre, teléfono, dirección
5. Para cada solicitud puedes:
   - ✅ **Aprobar:** Esto automáticamente:
     - Crea la tienda en la colección `stores`
     - Actualiza al usuario para darle rol de `seller`
     - Marca la solicitud como "aprobada"
   - ❌ **Rechazar:** Marca la solicitud como rechazada (puedes añadir un motivo)

---

## 🛠️ Pasos de Configuración (Una Sola Vez)

### 1. **Migrar Productos Existentes**

Todos tus productos actuales deben tener un `storeId`. Para asignarlos a "Playcenter Universal":

```bash
# 1. Abrir el script de migración
nano scripts/migrar-productos-a-tienda.mjs

# 2. Reemplazar "tu_uid_aqui" con TU UID real de Firebase
# (Puedes encontrarlo en Firebase Console > Authentication > Tu usuario)

# 3. Ejecutar el script
node scripts/migrar-productos-a-tienda.mjs
```

Este script:

- ✅ Actualiza TODOS los productos sin `storeId`
- ✅ Les asigna `storeId: "playcenter_universal"`
- ✅ Les asigna `storeName: "Playcenter Universal"`
- ✅ Les asigna tu `ownerUid`

### 2. **Actualizar Reglas de Firestore**

```bash
# 1. Copiar las nuevas reglas
cat firestore-multivendor.rules

# 2. Ir a Firebase Console > Firestore Database > Reglas
# 3. Pegar las reglas del archivo firestore-multivendor.rules
# 4. Publicar las reglas
```

Las reglas aseguran que:

- 🔒 Solo tú puedes ver las solicitudes
- 🔒 Solo tú puedes aprobar/rechazar solicitudes
- 🔒 Vendedores solo ven sus propios productos
- 🔒 Clientes ven productos activos

---

## 📊 Estructura de Datos

### Colección: `stores`

```javascript
{
  id: "auto_generated_id",
  nombre: "TecnoStore",
  descripcion: "Tienda de tecnología",
  eslogan: "Los mejores precios en tech",
  logo: "url_del_logo",
  banner: "url_del_banner",
  telefono: "809-123-4567",
  direccion: "Santiago, RD",
  ownerUid: "uid_del_usuario",
  ownerEmail: "usuario@email.com",
  ownerName: "Juan Pérez",
  createdAt: Timestamp,
  activa: true,
  stats: {
    productos: 0,
    ventas: 0,
    calificacion: 5.0
  }
}
```

### Colección: `solicitudes_vendedor`

```javascript
{
  id: "auto_generated_id",
  tiendaNombre: "TecnoStore",
  tiendaDescripcion: "Tienda de tecnología",
  tiendaEslogan: "Los mejores precios",
  tiendaLogo: "url_del_logo",
  tiendaBanner: "url_del_banner",
  tiendaTelefono: "809-123-4567",
  tiendaDireccion: "Santiago, RD",
  email: "usuario@email.com",
  nombreContacto: "Juan Pérez",
  userId: "uid_si_está_registrado_o_null",
  fechaSolicitud: Timestamp,
  estado: "pendiente", // pendiente | aprobada | rechazada
  revisadoPor: "arisleidy0712@gmail.com",
  fechaRevision: Timestamp,
  notasAdmin: "Motivo de rechazo (si aplica)",
  storeId: "id_de_la_tienda_creada (si fue aprobada)"
}
```

### Colección: `productos` (ACTUALIZADA)

```javascript
{
  // Campos existentes...

  // NUEVOS CAMPOS:
  storeId: "playcenter_universal", // O ID de la tienda del vendedor
  storeName: "Playcenter Universal",
  ownerUid: "uid_del_vendedor",
  ownerName: "Nombre del vendedor",
}
```

---

## 🎬 Flujo Completo de Ejemplo

### Escenario: Juan quiere vender

1. **Juan va a playcenter.com/vender**

   - Ve la página de marketing
   - Hace clic en "COMENZAR"

2. **Redirigido a /solicitar-vender**

   - Llena el formulario:
     - Nombre tienda: "Juan's Gaming Store"
     - Descripción: "Venta de videojuegos nuevos y usados"
     - Email: juan@email.com
     - Nombre: Juan Pérez
   - Sube logo y banner
   - Hace clic en "Enviar Solicitud"

3. **Pantalla de confirmación**

   - ✅ "¡Solicitud Enviada!"
   - "Playcenter Universal evaluará tu solicitud"
   - "Te enviaremos la respuesta a juan@email.com"

4. **Tú recibes la notificación**

   - Entras a tu panel admin
   - Vas a la pestaña "Solicitudes"
   - Ves la solicitud de Juan con toda su info
   - Revisas su logo, banner, descripción

5. **Decides aprobar**

   - Haces clic en "✅ Aprobar"
   - El sistema automáticamente:
     - Crea la tienda "Juan's Gaming Store" en `stores`
     - Actualiza a Juan para que tenga `role: "seller"`
     - Le asigna `storeId` a su cuenta
   - Juan ahora puede entrar a `/admin` y ver su panel de vendedor

6. **Juan crea su primer producto**
   - Va a `/admin`
   - Ve su panel de vendedor (limitado)
   - Agrega un producto
   - El producto automáticamente tiene `storeId: "id_de_juan"`
   - Solo Juan y tú pueden ver/editar ese producto

---

## 🚨 Solución de Problemas

### Problema: "No veo la pestaña Solicitudes"

**Solución:** La pestaña solo aparece si tu email es `arisleidy0712@gmail.com`. Verifica que hayas iniciado sesión con esa cuenta.

### Problema: "Al aprobar una solicitud da error"

**Solución:**

1. Verifica que las reglas de Firestore estén actualizadas
2. Revisa la consola del navegador para ver el error específico
3. Asegúrate de que el usuario solicitante tenga un `userId` válido

### Problema: "Los vendedores ven todos los productos"

**Solución:**

1. Ejecuta el script de migración para asignar `storeId` a productos existentes
2. Actualiza las reglas de Firestore
3. Limpia la caché del navegador

### Problema: "El formulario de solicitud se cierra solo"

**Solución:** Esto ya está corregido. El formulario ahora es PÚBLICO y no requiere login. Al enviar, muestra una pantalla de confirmación.

---

## 📧 Notificaciones por Email (Opcional)

Para enviar emails automáticos cuando apruebes/rechaces solicitudes, puedes:

1. **Usar Firebase Functions:**

   ```javascript
   // functions/index.js
   exports.notificarAprobacion = functions.firestore
     .document("solicitudes_vendedor/{solicitudId}")
     .onUpdate(async (change, context) => {
       const nuevoEstado = change.after.data().estado;
       const email = change.after.data().email;

       if (nuevoEstado === "aprobada") {
         // Enviar email de aprobación
         await sendEmail(
           email,
           "¡Tu tienda ha sido aprobada!",
           templateAprobado
         );
       } else if (nuevoEstado === "rechazada") {
         // Enviar email de rechazo
         await sendEmail(
           email,
           "Actualización de tu solicitud",
           templateRechazado
         );
       }
     });
   ```

2. **Usar servicio externo (SendGrid, Mailgun, etc.)**

---

## ✨ Características Implementadas

- ✅ Formulario público de solicitud (3 pasos)
- ✅ Subida de logo y banner
- ✅ Pantalla de confirmación con mensaje personalizado
- ✅ Colección `solicitudes_vendedor` en Firebase
- ✅ Panel de administración solo para ti
- ✅ Estadísticas de solicitudes (pendientes, aprobadas, rechazadas)
- ✅ Filtros por estado
- ✅ Botones aprobar/rechazar con feedback visual
- ✅ Aprobación automática:
  - Crea tienda en `stores`
  - Actualiza usuario a `seller`
  - Marca solicitud como aprobada
- ✅ Rechazo con notas del admin
- ✅ Script de migración para productos existentes
- ✅ Reglas de seguridad de Firestore
- ✅ ProductForm auto-asigna `storeId`
- ✅ ProductManagement filtra por tienda del vendedor
- ✅ Separación Super Admin vs Vendedor

---

## 🎉 ¡Listo para Usar!

El sistema está 100% funcional. Solo necesitas:

1. ✅ Ejecutar el script de migración (una vez)
2. ✅ Actualizar las reglas de Firestore (una vez)
3. ✅ Empezar a recibir y aprobar solicitudes

**¡Disfruta tu nuevo sistema multi-vendor!** 🚀
