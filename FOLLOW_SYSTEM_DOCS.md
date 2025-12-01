# 📚 Sistema de Seguimiento (Follow/Unfollow) - Documentación Completa

## 🎯 Arquitectura

El sistema está diseñado siguiendo la arquitectura de **Instagram, Twitter y YouTube**, con:

- ✅ **Operaciones atómicas** con `increment()` (sin race conditions)
- ✅ **Optimistic UI** para velocidad instantánea
- ✅ **Subcolecciones** para escalabilidad (millones de seguidores)
- ✅ **Listeners en tiempo real** para actualizaciones automáticas

---

## 📦 Archivos Creados

### 1. **Hook: `/src/hooks/useFollow.js`**

La lógica central del sistema. Maneja:

- Verificación de estado de seguimiento
- Toggle follow/unfollow
- Operaciones atómicas en Firestore
- Rollback automático si falla

### 2. **Componente: `/src/components/ui/FollowButton.jsx`**

Botón visual con tres variantes:

- `default` - Botón completo con texto e icono
- `compact` - Versión compacta para espacios pequeños
- `icon-only` - Solo icono para listas densas

### 3. **Hook: `useFollow.js`**

**Ubicación:** `/src/hooks/useFollow.js`

Hook personalizado que maneja toda la lógica de seguimiento:

- Verifica si el usuario actual sigue al usuario objetivo
- Toggle follow/unfollow con optimistic UI
- Operaciones atómicas en Firestore
- Rollback automático en caso de error

### 4. **Componente: `FollowButton.jsx`**

**Ubicación:** `/src/components/ui/FollowButton.jsx`

Botón reutilizable con tres variantes:

- `default`: Botón completo con texto e icono
- `compact`: Versión compacta para espacios reducidos
- `icon-only`: Solo icono para listas densas

### 5. **Página: `UserProfile.jsx`**

**Ubicación:** `/src/pages/UserProfile.jsx`

Página de perfil público de otros usuarios:

- Muestra información del usuario/tienda
- FollowButton integrado
- Stats en tiempo real (seguidores, seguidos, publicaciones)
- Lista de productos del usuario
- Redirige automáticamente a `/profile` si es tu propio perfil

### 6. **Componente: `UserCard.jsx`**

**Ubicación:** `/src/components/UserCard.jsx`

Tarjeta de usuario con FollowButton:

- Variant `default`: Tarjeta completa con avatar, stats y botones
- Variant `compact`: Lista compacta para resultados de búsqueda
- Stats se actualizan automáticamente en tiempo real
- Click en avatar/nombre navega al perfil del usuario

### 7. **Página: `UsersPage.jsx`**

**Ubicación:** `/src/pages/UsersPage.jsx`

Página de explorar usuarios y tiendas:

- Búsqueda por nombre, tienda o email
- Filtros: Todos / Solo Tiendas / Solo Usuarios
- Ordenar: Más Seguidores / Más Productos / Más Recientes
- Grid responsive de UserCards
- Stats actualizados en tiempo real

### 8. **AuthContext actualizado**

Se agregaron stats de seguimiento al crear usuarios:

```javascript
stats: {
  seguidores: 0,  // Cuántos me siguen
  seguidos: 0,    // A cuántos sigo
  publicaciones: 0 // Productos publicados
}
```

---

## 🗄️ Estructura de Datos en Firestore

### Colección: `users`

```javascript
users/{userId} = {
  displayName: "María García",
  email: "maria@example.com",
  stats: {
    seguidores: 150,   // ← Se actualiza con increment(±1)
    seguidos: 48,      // ← Se actualiza con increment(±1)
    publicaciones: 12
  }
}
```

### Subcolección: `users/{userId}/followers`

```javascript
users/{targetUserId}/followers/{followerId} = {
  uid: "abc123",
  displayName: "Juan Pérez",
  photoURL: "https://...",
  seguidoEn: Timestamp(2024-01-15)  // ← Para ordenar por más recientes
}
```

**Ventaja de subcolecciones:**

- No hay límite de seguidores (arrays tienen límite de 1MB)
- Consultas eficientes: `orderBy("seguidoEn", "desc").limit(20)`
- Fácil paginación para millones de seguidores

---

## 🚀 Cómo Usar el Botón

### Ejemplo 1: En un Perfil de Tienda

```jsx
import FollowButton from "../components/ui/FollowButton";

function StoreProfile({ tienda }) {
  return (
    <div className="store-header">
      <img src={tienda.logo} alt={tienda.nombre} />
      <h1>{tienda.nombre}</h1>

      {/* Botón de seguir - Solo pasa el UID */}
      <FollowButton targetUserId={tienda.uid} />
    </div>
  );
}
```

### Ejemplo 2: En una Lista de Tiendas (Compact)

```jsx
function StoreCard({ tienda }) {
  return (
    <div className="store-card">
      <img src={tienda.logo} />
      <h3>{tienda.nombre}</h3>
      <p>{tienda.descripcion}</p>

      {/* Versión compacta */}
      <FollowButton targetUserId={tienda.uid} variant="compact" />
    </div>
  );
}
```

### Ejemplo 3: En una Lista Densa (Solo Icono)

```jsx
function StoreListItem({ tienda }) {
  return (
    <div className="flex items-center gap-2">
      <img src={tienda.logo} className="w-8 h-8 rounded-full" />
      <span>{tienda.nombre}</span>

      {/* Solo icono para espacios pequeños */}
      <FollowButton targetUserId={tienda.uid} variant="icon-only" />
    </div>
  );
}
```

### Ejemplo 4: En Resultados de Búsqueda

```jsx
function SearchResults({ results }) {
  return (
    <div className="search-results">
      {results.map((item) => (
        <div key={item.id} className="result-item">
          <Link to={`/perfil/${item.uid}`}>
            <img src={item.avatar} />
            <div>
              <h4>{item.nombre}</h4>
              <p>{item.bio}</p>
            </div>
          </Link>

          {/* Botón custom styling */}
          <FollowButton targetUserId={item.uid} customClass="ml-auto" />
        </div>
      ))}
    </div>
  );
}
```

---

## 🎨 Props del Componente FollowButton

| Prop           | Tipo                                        | Default       | Descripción                     |
| -------------- | ------------------------------------------- | ------------- | ------------------------------- |
| `targetUserId` | `string`                                    | **requerido** | UID del usuario/tienda a seguir |
| `variant`      | `"default"` \| `"compact"` \| `"icon-only"` | `"default"`   | Estilo del botón                |
| `customClass`  | `string`                                    | `""`          | Clases CSS adicionales          |

---

## 🔐 Reglas de Seguridad de Firestore

**IMPORTANTE:** Debes agregar estas reglas en la consola de Firebase:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Colección users - Lectura pública, escritura solo del dueño
    match /users/{userId} {
      allow read: if true;
      allow create: if request.auth.uid == userId;
      allow update: if request.auth.uid == userId;
      allow delete: if request.auth.uid == userId;

      // Subcolección followers - Control de seguimiento
      match /followers/{followerId} {
        // Cualquiera puede leer la lista de seguidores
        allow read: if true;

        // Solo puedes agregar/quitar tu propio documento de seguidor
        allow create: if request.auth.uid == followerId;
        allow delete: if request.auth.uid == followerId;

        // Nadie puede actualizar (solo crear o borrar)
        allow update: if false;
      }
    }
  }
}
```

---

## 🧪 Cómo Funciona Internamente

### 1. **Al dar click en "Seguir":**

```javascript
// ✅ OPTIMISTIC UI - Cambia el botón INMEDIATAMENTE
setIsFollowing(true); // ← El usuario ve cambio al instante

// Luego ejecuta en background:
// 1. Crear documento de relación
await setDoc(relationshipRef, {
  uid: miUsuario.uid,
  seguidoEn: serverTimestamp(),
});

// 2. Sumar contadores (operación atómica)
await updateDoc(targetUserRef, {
  "stats.seguidores": increment(1), // ← +1 seguidor
});
await updateDoc(myUserRef, {
  "stats.seguidos": increment(1), // ← +1 seguido
});
```

### 2. **Al dar click en "Dejar de seguir":**

```javascript
// ✅ OPTIMISTIC UI - Cambia el botón INMEDIATAMENTE
setIsFollowing(false);

// Luego ejecuta en background:
// 1. Borrar documento de relación
await deleteDoc(relationshipRef);

// 2. Restar contadores (operación atómica)
await updateDoc(targetUserRef, {
  "stats.seguidores": increment(-1), // ← -1 seguidor
});
await updateDoc(myUserRef, {
  "stats.seguidos": increment(-1), // ← -1 seguido
});
```

### 3. **Si falla (sin internet, permisos, etc.):**

```javascript
// ❌ ROLLBACK AUTOMÁTICO
catch (error) {
  // Revierte el estado visual al anterior
  setIsFollowing(previousState);

  // Muestra mensaje de error
  alert("Error al actualizar. Intenta de nuevo.");
}
```

---

## 📊 Consultas Útiles

### Obtener lista de seguidores de un usuario:

```javascript
const followersRef = collection(db, "users", targetUserId, "followers");
const q = query(followersRef, orderBy("seguidoEn", "desc"), limit(20));
const snapshot = await getDocs(q);

const seguidores = snapshot.docs.map((doc) => ({
  uid: doc.id,
  ...doc.data(),
}));
```

### Verificar si UserA sigue a UserB:

```javascript
const relationshipRef = doc(db, "users", userB_uid, "followers", userA_uid);
const snapshot = await getDoc(relationshipRef);

const estaSiguiendo = snapshot.exists(); // true o false
```

### Obtener usuarios que sigo:

```javascript
// Necesitas crear una subcolección "following" si quieres esta query
// O puedes iterar sobre todos los usuarios y verificar si los sigues
```

---

## ✅ Ventajas de Este Sistema

### 1. **Operaciones Atómicas**

```javascript
// ❌ MALO - Race condition
const userData = await getDoc(userRef);
const newCount = userData.seguidores + 1; // ← Puede ser incorrecto
await updateDoc(userRef, { seguidores: newCount });

// ✅ BUENO - Operación atómica
await updateDoc(userRef, {
  "stats.seguidores": increment(1), // ← Firebase garantiza que es correcto
});
```

### 2. **Escalabilidad**

- **Arrays:** Máximo ~1,000 seguidores (límite de 1MB por documento)
- **Subcolecciones:** Millones de seguidores sin problema

### 3. **Velocidad (Optimistic UI)**

- Usuario ve cambio INSTANTÁNEO
- Operación se ejecuta en background
- Si falla, se revierte automáticamente

### 4. **Consultas Eficientes**

```javascript
// Obtener últimos 20 seguidores
const q = query(followersRef, orderBy("seguidoEn", "desc"), limit(20));
```

---

## 🎯 Próximos Pasos Sugeridos

### 1. **Página de Seguidores/Seguidos**

Crear `/perfil/:userId/seguidores` y `/perfil/:userId/seguidos` con listas completas.

### 2. **Feed Personalizado**

Mostrar productos de las tiendas que sigo:

```javascript
// Obtener IDs de tiendas que sigo
const seguidos = await getDocs(collection(db, "users", miUid, "following"));

const tiendaIds = seguidos.docs.map((doc) => doc.id);

// Consultar productos de esas tiendas
const productos = await getDocs(
  query(collection(db, "productos"), where("tienda_id", "in", tiendaIds))
);
```

### 3. **Notificaciones**

Enviar notificación cuando alguien te sigue:

```javascript
// En Cloud Functions
exports.onNewFollower = functions.firestore
  .document("users/{userId}/followers/{followerId}")
  .onCreate(async (snap, context) => {
    // Enviar notificación al usuario
  });
```

### 4. **Sugerencias de a Quién Seguir**

Algoritmo simple:

- Tiendas con más seguidores
- Tiendas que siguen tus amigos
- Tiendas de tu ciudad/país

---

## 🐛 Troubleshooting

### Error: "No tienes permisos para realizar esta acción"

**Causa:** Reglas de Firestore no configuradas.
**Solución:** Agregar las reglas de seguridad mostradas arriba.

### Error: "El usuario no existe"

**Causa:** El `targetUserId` no corresponde a un documento en `users`.
**Solución:** Verificar que el usuario existe antes de mostrar el botón.

### El contador no se actualiza

**Causa:** Listener no configurado correctamente.
**Solución:** Usar `onSnapshot()` en lugar de `getDoc()` para actualizaciones en tiempo real.

---

## 📞 Soporte

Si tienes dudas sobre la implementación:

1. Revisa los ejemplos de uso arriba
2. Verifica que las reglas de Firestore estén configuradas
3. Comprueba que `AuthContext` esté inicializando los stats
4. Verifica en la consola de Firebase que los documentos se crean correctamente

---

**¡El sistema está listo para usar! Solo importa `FollowButton` y pásale el `targetUserId`.**
