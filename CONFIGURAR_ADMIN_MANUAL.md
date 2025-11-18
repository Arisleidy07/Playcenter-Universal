# 👑 Configuración Manual - Arisleidy como Administradora

## 🎯 Pasos Rápidos en Firebase Console

### 1️⃣ Abre Firebase Console

Ve a: https://console.firebase.google.com/

Selecciona el proyecto: **playcenter-universal**

### 2️⃣ Obtén tu User ID

1. En el menú lateral, ve a **Authentication**
2. Busca tu email: **arisleidy0712@gmail.com**
3. **Copia el UID** (User ID) - es un texto largo como `abc123xyz...`

### 3️⃣ Configura la Tienda

1. En el menú lateral, ve a **Firestore Database**
2. Busca la colección `tiendas`
3. Busca o crea el documento: `playcenter_universal`
4. Haz clic en **Editar** o **Agregar documento**
5. Agrega/actualiza estos campos:

```
Campo: propietario_id
Tipo: string
Valor: [PEGA AQUÍ TU UID DEL PASO 2]

Campo: nombre
Tipo: string
Valor: Playcenter Universal

Campo: principal
Tipo: boolean
Valor: true

Campo: es_admin
Tipo: boolean
Valor: true

Campo: estado
Tipo: string
Valor: activa

Campo: descripcion
Tipo: string
Valor: Tienda oficial del sistema Playcenter Universal

Campo: logo
Tipo: string
Valor: /logo.png

Campo: banner
Tipo: string
Valor: /banner.jpg

Campo: seguidores
Tipo: number
Valor: 0

Campo: ventas
Tipo: number
Valor: 0

Campo: valoracion_promedio
Tipo: number
Valor: 5.0
```

### 4️⃣ Configura tu Usuario

1. En Firestore Database, busca la colección `usuarios`
2. Busca o crea el documento con tu UID (el mismo del paso 2)
3. Agrega/actualiza estos campos:

```
Campo: email
Tipo: string
Valor: arisleidy0712@gmail.com

Campo: es_admin
Tipo: boolean
Valor: true

Campo: rol
Tipo: string
Valor: admin

Campo: tienda_id
Tipo: string
Valor: playcenter_universal
```

### 5️⃣ Guarda y Recarga

1. Haz clic en **Guardar** en Firebase Console
2. Ve a tu navegador donde está abierto Playcenter
3. Presiona **Cmd + Shift + R** para recargar con caché limpio
4. O cierra sesión y vuelve a iniciar sesión

### 6️⃣ Verifica

Ve a tu perfil → sección "Mi Tienda"

Deberías ver:

- ✅ **Playcenter Universal** como tu tienda
- ✅ Badge dorado **👑 DUEÑA**
- ✅ Estadísticas de la tienda
- ✅ Botón "Gestionar productos"

---

## 🎉 ¡Listo!

Ya eres la dueña y administradora de Playcenter Universal.

**Email:** arisleidy0712@gmail.com  
**Rol:** Administradora Principal  
**Tienda:** Playcenter Universal
