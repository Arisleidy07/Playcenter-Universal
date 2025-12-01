# ✅ Checklist: Verificar que Todo Funciona Después de Aprobar un Vendedor

## 🎯 Objetivo

Después de aprobar una solicitud de vendedor, verificar que:

1. La tienda se creó correctamente
2. El vendedor puede acceder a su panel
3. La tienda aparece públicamente
4. El vendedor puede subir productos

---

## 📋 Pasos de Verificación

### ✅ PASO 1: Verificar en Firebase Console

**1.1 - Verificar que la tienda se creó:**

```
Firebase Console → Firestore Database → Colección "stores"
```

Debe existir un documento con:

- `nombre`: Nombre de la tienda
- `logo`: URL del logo
- `banner`: URL del banner
- `descripcion`: Descripción de la tienda
- `ownerUid`: UID del usuario vendedor
- `ownerEmail`: Email del vendedor
- `activa`: true
- `createdAt`: Timestamp

**1.2 - Verificar que el usuario se actualizó:**

```
Firebase Console → Firestore Database → Colección "users" → [UID del vendedor]
```

El documento debe tener:

- `role`: "seller"
- `isSeller`: true
- `storeId`: [ID de la tienda creada]
- `storeName`: Nombre de la tienda

**1.3 - Verificar que la solicitud se marcó como aprobada:**

```
Firebase Console → Firestore Database → Colección "solicitudes_vendedor" → [ID de la solicitud]
```

El documento debe tener:

- `estado`: "aprobada"
- `revisadoPor`: "arisleidy0712@gmail.com"
- `fechaRevision`: Timestamp
- `storeId`: [ID de la tienda creada]

**1.4 - (Opcional) Verificar cola de email:**

```
Firebase Console → Firestore Database → Colección "mail_queue"
```

Debe existir un documento con:

- `to`: Email del vendedor
- `subject`: "¡Tu tienda ha sido aprobada en Playcenter!"
- `status`: "pending"

---

### ✅ PASO 2: Verificar en la Página de Tiendas

**2.1 - Ver todas las tiendas:**

```
https://playcenter.com/tiendas
```

Verificar que:

- ✅ Aparece la nueva tienda
- ✅ Se muestra el logo correctamente
- ✅ Se muestra el banner correctamente
- ✅ Aparece el nombre de la tienda
- ✅ Aparece la descripción
- ✅ Contador de seguidores funciona (si hay)

**2.2 - Entrar a la tienda individual:**

```
https://playcenter.com/tiendas/[id-de-la-tienda]
```

Verificar que:

- ✅ La página carga sin errores
- ✅ Muestra la información de la tienda
- ✅ (Por ahora estará vacía porque no tiene productos)

---

### ✅ PASO 3: Verificar Acceso del Vendedor

**Instrucciones para el vendedor:**

1. Cierra sesión si estabas logueado
2. Inicia sesión con la cuenta que usaste para solicitar la tienda
3. Ve a: `https://playcenter.com/admin`

**3.1 - Verificar que ve su panel:**

- ✅ El vendedor puede acceder a `/admin`
- ✅ Ve la pestaña "Productos"
- ✅ NO ve las pestañas de super admin (Dashboard, Usuarios, Solicitudes)
- ✅ Solo ve "Productos" y "Categorías"

**3.2 - Verificar que puede crear productos:**

1. Haz clic en "Productos"
2. Haz clic en "Agregar Producto"
3. Llena el formulario:
   - Nombre: "Producto de Prueba"
   - Precio: 100
   - Descripción: "Este es un producto de prueba"
   - Categoría: Selecciona cualquiera
   - Sube 1 imagen
4. Haz clic en "Guardar"

**3.3 - Verificar que el producto se creó:**

- ✅ El producto aparece en la lista de "Productos" del vendedor
- ✅ El producto tiene `storeId` de la tienda del vendedor
- ✅ Solo el vendedor y tú (admin) pueden ver/editar ese producto

**3.4 - Verificar que el producto aparece en la tienda:**

```
https://playcenter.com/tiendas/[id-de-la-tienda]
```

- ✅ El producto aparece en la tienda pública
- ✅ Se puede hacer clic y ver los detalles

---

### ✅ PASO 4: Verificar Separación de Datos

**4.1 - Como vendedor:**

- ✅ Solo puede ver SUS productos
- ✅ NO puede ver productos de otras tiendas
- ✅ NO puede ver usuarios
- ✅ NO puede ver solicitudes
- ✅ NO puede ver estadísticas globales

**4.2 - Como super admin (tú):**

- ✅ Puedes ver TODOS los productos
- ✅ Puedes ver TODAS las tiendas
- ✅ Puedes ver TODAS las solicitudes
- ✅ Puedes editar/eliminar cualquier producto

---

## 🚨 Problemas Comunes y Soluciones

### Problema 1: "La tienda no aparece en /tiendas"

**Causa:** El campo `activa` no está en `true`
**Solución:**

```javascript
// En Firebase Console, edita el documento de la tienda:
activa: true;
```

### Problema 2: "El vendedor no puede acceder a /admin"

**Causa:** El usuario no se actualizó correctamente
**Solución:**

```javascript
// En Firebase Console, edita el documento del usuario:
role: "seller";
isSeller: true;
storeId: "[ID de la tienda]";
```

### Problema 3: "El vendedor ve productos de otras tiendas"

**Causa:** Filtro en ProductManagement no está funcionando
**Solución:**

- Verifica que `ProductManagement.jsx` esté usando el hook `useStore`
- Verifica que los productos tengan `storeId` asignado

### Problema 4: "Los productos no tienen storeId"

**Causa:** ProductForm no está asignando el storeId
**Solución:**

- Verifica que `ProductForm.jsx` tenga la función `detectarTiendaUsuario`
- Ejecuta el script de migración para productos existentes

### Problema 5: "El email no se envió"

**Causa:** Falta configurar Firebase Functions para enviar emails
**Solución:**

- Por ahora, los emails se encolan en `mail_queue`
- Para enviar emails reales, necesitas:
  1. Instalar Firebase Functions
  2. Configurar un servicio de email (SendGrid, Mailgun, etc.)
  3. Crear una Cloud Function que procese la cola

---

## 📧 Notificar al Vendedor

Si el email automático no funciona, envía este mensaje manualmente:

```
Asunto: ¡Tu tienda ha sido aprobada en Playcenter! 🎉

Hola [Nombre del Vendedor],

¡Felicidades! Tu solicitud para crear la tienda "[Nombre de la Tienda]" ha sido aprobada.

¿Qué sigue?
1. Inicia sesión en https://playcenter.com
2. Ve a tu panel de administración: https://playcenter.com/admin
3. Empieza a subir tus productos
4. ¡Comienza a vender!

Tu tienda ya está visible públicamente en:
https://playcenter.com/tiendas/[id-de-tu-tienda]

Si tienes alguna pregunta, no dudes en contactarnos.

¡Mucho éxito!

---
Playcenter Universal
https://playcenter.com
```

---

## ✅ Checklist Rápido

Marca cada item después de verificarlo:

- [ ] La tienda aparece en Firebase (`stores` collection)
- [ ] El usuario se actualizó (`role: "seller"`, `storeId` asignado)
- [ ] La solicitud se marcó como "aprobada"
- [ ] La tienda aparece en `/tiendas`
- [ ] Logo y banner se ven correctamente
- [ ] El vendedor puede acceder a `/admin`
- [ ] El vendedor puede crear productos
- [ ] Los productos aparecen en su tienda pública
- [ ] El vendedor SOLO ve sus productos (no los de otros)
- [ ] El email se encoló en `mail_queue` (opcional)

---

**Si todos los items están marcados: ¡Sistema funcionando correctamente!** ✅

---

_Última actualización: Diciembre 2024_
