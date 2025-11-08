# 🏪 Sistema de Tiendas - Playcenter Universal

## 📋 Descripción General

Este sistema permite gestionar múltiples tiendas en Playcenter Universal, comenzando con la tienda principal **Playcenter Universal** que contiene todos los productos actuales.

---

## 🚀 Pasos de Configuración

### 1️⃣ Inicializar la Tienda Principal

Ejecuta el siguiente comando para crear la tienda **Playcenter Universal** en Firestore:

```bash
node scripts/init-playcenter-store.mjs
```

Este script creará un documento en la colección `tiendas` con:
- **ID:** `playcenter_universal`
- **Nombre:** Playcenter Universal
- **Estado:** Activa
- **Principal:** `true` (aparecerá primero en la lista)
- **Estadísticas iniciales**

---

### 2️⃣ Migrar Productos Existentes

Después de crear la tienda, ejecuta este comando para asignar todos los productos existentes a la tienda principal:

```bash
node scripts/migrate-products-to-store.mjs
```

Este script:
- ✅ Busca todos los productos en la colección `productos`
- ✅ Agrega los campos `tienda_id` y `tienda_nombre` a cada producto
- ✅ Muestra un resumen de productos actualizados
- ✅ Omite productos que ya tengan tienda asignada

---

## 🎯 Funcionalidades Implementadas

### ✅ Productos Nuevos

Cuando creas un producto nuevo desde el panel admin, automáticamente se asigna:
```javascript
tienda_id: "playcenter_universal"
tienda_nombre: "Playcenter Universal"
```

Esto está en: `/src/components/ProductForm.jsx` (líneas 2576-2579)

---

### ✅ Vista de Producto

En la página de cada producto (`/producto/:id`), aparece un botón:

**"Ver tienda: Playcenter Universal"** 🏪

Al hacer clic, lleva a `/tiendas/playcenter_universal`

Implementado en: `/src/pages/VistaProducto.jsx` (líneas 1917-1928)

---

### ✅ Página de Tiendas

**Ruta:** `/tiendas`

Muestra todas las tiendas activas con:
- 🏆 Badge "TIENDA PRINCIPAL" para Playcenter Universal
- 📊 Estadísticas (productos, ventas, rating)
- 🖼️ Logo y banner
- 🔗 Enlace a cada tienda

Implementado en: `/src/pages/Tiendas.jsx`

---

### ✅ Página de Tienda Individual

**Ruta:** `/tiendas/:id`

Ejemplo: `/tiendas/playcenter_universal`

Muestra:
- 🎨 Banner y logo de la tienda
- 📝 Información y descripción
- 📊 Estadísticas detalladas
- 📦 **TODOS los productos de esa tienda**
- 🔄 Vista grid o lista
- 📞 Información de contacto

Los productos se filtran por:
```javascript
where('tienda_id', '==', 'playcenter_universal')
```

Implementado en: `/src/pages/TiendaIndividual.jsx`

---

## 📁 Estructura de Datos

### Colección: `tiendas`

```javascript
{
  id: "playcenter_universal",
  nombre: "Playcenter Universal",
  propietario_id: "ADMIN",
  descripcion: "Tienda oficial del sistema...",
  logo: "/logo.png",
  banner: "/banner.jpg",
  estado: "activa",
  principal: true,
  fecha_creacion: Timestamp,
  categorias_destacadas: ["Videojuegos", "Consolas", ...],
  estadisticas: {
    total_productos: 0,
    total_ventas: 0,
    valoracion_promedio: 5.0
  },
  contacto: {
    telefono: "",
    email: "",
    whatsapp: ""
  }
}
```

### Colección: `productos`

Cada producto ahora tiene:

```javascript
{
  // ... campos existentes ...
  tienda_id: "playcenter_universal",
  tienda_nombre: "Playcenter Universal"
}
```

---

## 🔄 Flujo de Usuario

```
1. Usuario ve producto en /categorias
   ↓
2. Ve botón "Ver tienda: Playcenter Universal"
   ↓
3. Click → /tiendas/playcenter_universal
   ↓
4. Ve TODOS los productos de Playcenter Universal
   ↓
5. Puede ir a /tiendas para ver lista de todas las tiendas
```

---

## 🛠️ Archivos Modificados/Creados

### Scripts:
- ✅ `scripts/init-playcenter-store.mjs` - Inicializar tienda
- ✅ `scripts/migrate-products-to-store.mjs` - Migrar productos

### Páginas:
- ✅ `src/pages/Tiendas.jsx` - Lista de tiendas
- ✅ `src/pages/TiendaIndividual.jsx` - Página de tienda individual
- ✅ `src/pages/VistaProducto.jsx` - Botón "Ver tienda"

### Componentes:
- ✅ `src/components/ProductForm.jsx` - Auto-asignar tienda a productos nuevos

### Rutas:
- ✅ `src/AnimatedRoutes.jsx` - Rutas `/tiendas` y `/tiendas/:id`

---

## 🎨 Características de Diseño

### Tienda Principal

- ⭐ Badge dorado "TIENDA PRINCIPAL"
- 🔵 Borde azul con ring
- 📌 Aparece PRIMERA en la lista
- 🎯 Destacada visualmente

### Cards de Producto

- 📱 Responsive (grid/lista)
- 🖼️ Imágenes con lazy loading
- 💰 Precios formateados
- ⚡ Animaciones Framer Motion

---

## 🔮 Futuro: Multi-Tiendas

Cuando actives el sistema para que otros creen tiendas:

1. **Cada usuario** podrá crear su tienda
2. **Productos** se asocian automáticamente a la tienda del propietario
3. **Vista general** (`/categorias`) muestra TODOS los productos
4. **Vista tienda** (`/tiendas/:id`) muestra solo productos de esa tienda
5. **Playcenter Universal** sigue siendo la tienda principal

---

## ✅ Checklist de Verificación

Después de ejecutar los scripts, verifica:

- [ ] Tienda existe en Firestore (`tiendas/playcenter_universal`)
- [ ] Productos tienen campos `tienda_id` y `tienda_nombre`
- [ ] `/tiendas` muestra la tienda Playcenter Universal
- [ ] `/tiendas/playcenter_universal` muestra todos los productos
- [ ] Botón "Ver tienda" aparece en cada producto
- [ ] Productos nuevos se asignan automáticamente
- [ ] Todo es responsive (móvil, tablet, desktop)

---

## 🐛 Troubleshooting

### Los productos no aparecen en la tienda

1. Verifica que el producto tiene `tienda_id: "playcenter_universal"`
2. Ejecuta el script de migración de nuevo
3. Revisa la consola del navegador para errores

### La tienda no aparece

1. Verifica que existe en Firestore: `tiendas/playcenter_universal`
2. Ejecuta el script de inicialización
3. Verifica que `estado: "activa"`

### El botón "Ver tienda" no aparece

1. El producto debe tener `tienda_id` y `tienda_nombre`
2. Verifica que el componente `Link` esté importado en `VistaProducto.jsx`

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs de la consola
2. Verifica que Firebase esté configurado correctamente
3. Asegúrate de tener permisos de escritura en Firestore

---

## 🎉 Resultado Final

✅ **Tienda principal funcionando**
✅ **Productos migrados**
✅ **Botón "Ver tienda" en cada producto**
✅ **Página de tienda con filtro de productos**
✅ **Sistema listo para multi-tiendas en el futuro**

---

**¡Sistema de tiendas implementado exitosamente!** 🚀
