# 🎨 GUÍA VISUAL DE MEJORAS UX/UI

## 📐 ESTRUCTURA Y ESPACIADO

### Panel de Editar Tienda
```
┌─────────────────────────────────────────────────────┐
│                    [Header Fijo]                     │ ← 120px (--content-offset)
├─────────────────────────────────────────────────────┤
│                                                      │
│                    70px espacio                      │ ← Separación del header
│                                                      │
│   ┌───────────────────────────────────────────┐    │
│   │  ╔═══════════════════════════════════╗    │    │
│   │  ║     Editar Tienda          [X]    ║    │    │ ← Título centrado
│   │  ╠═══════════════════════════════════╣    │    │
│   │  ║  ┌──────────┐  ┌──────────┐      ║    │    │
│   │  ║  │ Nombre   │  │Descripción│      ║    │    │ ← 2 columnas desktop
│   │  ║  └──────────┘  └──────────┘      ║    │    │
│   │  ║  ┌──────────────────────────┐    ║    │    │
│   │  ║  │   Banner Preview         │    ║    │    │
│   │  ║  └──────────────────────────┘    ║    │    │
│   │  ║  ┌──────────────────────────┐    ║    │    │
│   │  ║  │   Logo Preview    ⭕     │    ║    │    │
│   │  ║  └──────────────────────────┘    ║    │    │
│   │  ╠═══════════════════════════════════╣    │    │
│   │  ║  [Cancelar] [Guardar Cambios]    ║    │    │ ← Botones centrados
│   │  ╚═══════════════════════════════════╝    │    │
│   └───────────────────────────────────────────┘    │
│   │◄─────── Backdrop blur 8px ─────────►│          │
└─────────────────────────────────────────────────────┘
```

---

## 🎭 ESTADOS DE ANIMACIÓN

### Modal de Edición
```
CERRADO → OPENING → ABIERTO → CLOSING → CERRADO

1. OPENING (300ms):
   opacity: 0 ────────────────► 1
   y: -50px ──────────────────► 0
   backdrop: blur(0) ─────────► blur(8px)
   
   Tipo: Spring animation
   Damping: 25
   Stiffness: 300

2. CLOSING (300ms):
   opacity: 1 ────────────────► 0
   y: 0 ──────────────────────► -50px
   backdrop: blur(8px) ───────► blur(0)
   
   Tipo: ease-out
```

### Toast Notification
```
HIDDEN → APPEARING → VISIBLE → DISAPPEARING → HIDDEN

1. APPEARING (300ms):
   opacity: 0 ────────────────► 1
   y: -20px ──────────────────► 0
   
2. VISIBLE (3000ms):
   Mantiene posición y opacidad
   
3. DISAPPEARING (300ms):
   opacity: 1 ────────────────► 0
   y: 0 ──────────────────────► -20px
```

---

## 🎨 PALETA DE COLORES

### Tema Claro
```css
┌─────────────────────────────────────┐
│ Fondo Principal: bg-white           │ ← #FFFFFF
│ Fondo Secundario: bg-gray-50        │ ← #F9FAFB
│ Texto Principal: text-gray-900      │ ← #111827
│ Texto Secundario: text-gray-500     │ ← #6B7280
│ Bordes: border-gray-200             │ ← #E5E7EB
│ Hover: hover:bg-blue-50             │ ← #EFF6FF
│ Acento: bg-blue-600                 │ ← #2563EB
└─────────────────────────────────────┘
```

### Tema Oscuro
```css
┌─────────────────────────────────────┐
│ Fondo Principal: bg-gray-900        │ ← #111827
│ Fondo Secundario: bg-gray-800       │ ← #1F2937
│ Texto Principal: text-white         │ ← #FFFFFF
│ Texto Secundario: text-gray-400     │ ← #9CA3AF
│ Bordes: border-gray-700             │ ← #374151
│ Hover: hover:bg-blue-950/30         │ ← rgba(23, 37, 84, 0.3)
│ Acento: bg-blue-600                 │ ← #2563EB
└─────────────────────────────────────┘
```

---

## 🔘 BOTONES Y ESTADOS

### Botón Principal (CTA)
```
┌─────────────────────────────┐
│   DEFAULT:                  │
│   ╔═══════════════════════╗ │
│   ║  💾 Guardar Cambios  ║ │ ← rounded-xl, px-8, py-3
│   ╚═══════════════════════╝ │ ← bg-blue-600, shadow-lg
│                             │
│   HOVER:                    │
│   ╔═══════════════════════╗ │
│   ║  💾 Guardar Cambios  ║ │ ← scale(1.05)
│   ╚═══════════════════════╝ │ ← bg-blue-700, shadow-xl
│                             │
│   ACTIVE:                   │
│   ╔═══════════════════════╗ │
│   ║  💾 Guardar Cambios  ║ │ ← scale(0.95)
│   ╚═══════════════════════╝ │ ← 200ms transition
└─────────────────────────────┘
```

### Botón Secundario
```
┌─────────────────────────────┐
│   DEFAULT:                  │
│   ┌───────────────────────┐ │
│   │      Cancelar         │ │ ← rounded-xl, px-6, py-3
│   └───────────────────────┘ │ ← text-gray-700, no bg
│                             │
│   HOVER:                    │
│   ┌───────────────────────┐ │
│   │      Cancelar         │ │ ← scale(1.05)
│   └───────────────────────┘ │ ← bg-gray-100
└─────────────────────────────┘
```

### Botón Circular (Logo Edit)
```
DEFAULT:        HOVER:          ACTIVE:
   ⭕             ⭕⭕             ⭕
  (32x32)      (35x35)        (30x30)
 bg-blue-600  bg-blue-700   scale(0.95)
 shadow-lg    shadow-xl      200ms
```

---

## 📱 RESPONSIVE BREAKPOINTS

### Mobile (<768px)
```
┌─────────────────┐
│                 │
│  ┌───────────┐  │
│  │  Banner   │  │ ← Full width
│  └───────────┘  │
│                 │
│  ⭕ [Nombre]    │ ← Logo + Name (1 col)
│                 │
│  ┌───────────┐  │
│  │ Producto  │  │ ← 1 columna
│  └───────────┘  │
│  ┌───────────┐  │
│  │ Producto  │  │
│  └───────────┘  │
│                 │
└─────────────────┘
```

### Tablet (768px-1023px)
```
┌─────────────────────────────┐
│                             │
│  ┌───────────────────────┐  │
│  │      Banner           │  │ ← Full width
│  └───────────────────────┘  │
│                             │
│  ⭕ [Nombre]                │
│                             │
│  ┌──────────┐ ┌──────────┐ │
│  │ Producto │ │ Producto │ │ ← 2 columnas
│  └──────────┘ └──────────┘ │
│  ┌──────────┐ ┌──────────┐ │
│  │ Producto │ │ Producto │ │
│  └──────────┘ └──────────┘ │
│                             │
└─────────────────────────────┘
```

### Desktop (≥1024px)
```
┌───────────────────────────────────────────┐
│                                           │
│  ┌─────────────────────────────────────┐  │
│  │           Banner                    │  │ ← Full width
│  └─────────────────────────────────────┘  │
│                                           │
│  ⭕ [Nombre Grande]                       │
│                                           │
│  ┌────────┐ ┌────────┐ ┌────────┐       │
│  │Product │ │Product │ │Product │       │ ← 3 columnas
│  └────────┘ └────────┘ └────────┘       │
│  ┌────────┐ ┌────────┐ ┌────────┐       │
│  │Product │ │Product │ │Product │       │
│  └────────┘ └────────┘ └────────┘       │
│                                           │
└───────────────────────────────────────────┘
```

---

## 🎭 HOVER EFFECTS

### Card de Tienda
```
DEFAULT:                    HOVER:
┌─────────────┐            ┌─────────────┐
│   Banner    │            │   Banner    │ ← scale(1.05)
├─────────────┤            │             │ ← overlay blue/10
│ ⭕ [Nombre] │     →      ├─────────────┤
└─────────────┘            │ ⭕⭕[Nombre] │ ← Logo scale(1.1)
shadow-md                  └─────────────┘ ← Text blue
                           shadow-2xl
                           translateY(-3px)
                           scale(1.02)
```

### Filtro de Categorías
```
DEFAULT:                 HOVER:
┌──────────────┐        ┌──────────────┐
│  Categorías  ▼│   →   │  Categorías  ▼│
└──────────────┘        └──────────────┘
bg-white/90             bg-blue-50
backdrop-blur           scale(1.02)
```

### Toggle Vista
```
INACTIVE:     ACTIVE:        HOVER (inactive):
┌─────┐      ┌─────┐        ┌─────┐
│ 🔲  │      │ 🔲  │        │ 🔲  │
└─────┘      └─────┘        └─────┘
gray-500     blue-600       blue-600
             shadow-md      bg-blue-50
             scale(1.05)    scale(1.02)
```

---

## 📊 TIMING FUNCTIONS

### Animaciones Standard
```javascript
// Apertura de modales (Spring)
{
  type: "spring",
  damping: 25,
  stiffness: 300
}

// Hover effects (Cubic Bezier)
transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1)

// Fade transitions
transition: opacity 0.3s ease-out

// Scale effects
transition: transform 0.2s ease-out
```

### Duraciones
```
Ultra rápido: 100ms  → Focus states
Rápido:       200ms  → Hover, click feedback
Standard:     300ms  → Modales, overlays
Suave:        500ms  → Scroll, scale de imágenes
```

---

## 🎯 ESPACIADO Y TAMAÑOS

### Padding
```
┌─────────────────────────────┐
│ p-3  → 12px  (Muy pequeño) │
│ p-4  → 16px  (Pequeño)     │
│ p-5  → 20px  (Mediano)     │
│ p-6  → 24px  (Grande)      │
│ p-8  → 32px  (Muy grande)  │
└─────────────────────────────┘
```

### Gap
```
┌─────────────────────────────┐
│ gap-2 → 8px   (Cards mobile)│
│ gap-4 → 16px  (Default)     │
│ gap-6 → 24px  (Desktop)     │
└─────────────────────────────┘
```

### Border Radius
```
┌──────────────────────────────────┐
│ rounded-lg  → 8px  (Inputs)      │
│ rounded-xl  → 12px (Botones)     │
│ rounded-2xl → 16px (Cards)       │
│ rounded-full → 9999px (Pills)    │
└──────────────────────────────────┘
```

### Shadows
```
┌─────────────────────────────────────┐
│ shadow-sm  → 0 1px 2px rgba(0,0,0,.05)│
│ shadow-md  → 0 4px 6px rgba(0,0,0,.1) │
│ shadow-lg  → 0 10px 15px rgba(0,0,0,.1)│
│ shadow-xl  → 0 20px 25px rgba(0,0,0,.1)│
│ shadow-2xl → 0 25px 50px rgba(0,0,0,.25)│
└─────────────────────────────────────┘
```

---

## 🌊 BACKDROP BLUR EFFECT

### Implementación
```css
/* Modal Backdrop */
.backdrop {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* Categorías Translúcidas */
.translucent {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
}

/* Dark Mode */
.dark .translucent {
  background: rgba(31, 41, 55, 0.9);
}
```

### Visual
```
┌────────────────────────────────┐
│  Contenido nítido detrás       │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │ ← blur(8px)
│  ▓ Contenido del modal  ▓    │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │
│  Contenido borroso detrás      │
└────────────────────────────────┘
```

---

## 🔔 TOAST NOTIFICATIONS

### Posición y Estilo
```
┌─────────────────────────────────────┐
│ [Header]                        🔔  │ ← top-24 (debajo header)
│                                     │
│                  ┌──────────────┐   │
│                  │ ✅ Guardado  │   │ ← right-4
│                  └──────────────┘   │   rounded-full
│                                     │   shadow-2xl
│  Contenido                          │   px-6 py-3
│                                     │
└─────────────────────────────────────┘

Animación:
1. Slide in: translateY(-20px) → 0
2. Visible: 3 segundos
3. Slide out: 0 → translateY(-20px)
```

---

## 🎨 GRADIENTES

### Fondo de Página
```css
/* Tema Claro */
background: linear-gradient(to bottom, 
  #F9FAFB 0%,   /* gray-50 */
  #FFFFFF 100%  /* white */
);

/* Tema Oscuro */
background: linear-gradient(to bottom,
  #111827 0%,   /* gray-900 */
  #1F2937 100%  /* gray-800 */
);
```

### Banner Placeholder
```css
background: linear-gradient(135deg,
  #3B82F6 0%,   /* blue-500 */
  #9333EA 100%  /* purple-600 */
);

/* Hover */
background: linear-gradient(135deg,
  #2563EB 0%,   /* blue-600 */
  #7C3AED 100%  /* purple-700 */
);
```

---

## 📏 PROPORCIONES

### Logo
```
Mobile:     20px × 20px  (w-20 h-20)
Desktop:    24px × 24px  (w-24 h-24)
Padding:    8px          (p-2)
Border:     2px          (border-2)
```

### Banner
```
Width:      100%         (w-full)
Height:     Auto         (h-auto)
Max Height: None         (natural)
Object Fit: contain      (no crop)
```

### Cards
```
Width:      100%         (responsive)
Border R:   16px         (rounded-2xl)
Padding:    20-24px      (p-5 md:p-6)
Gap:        16-24px      (gap-4 md:gap-6)
```

---

## ✨ EFECTOS ESPECIALES

### Glass Morphism
```css
background: rgba(255, 255, 255, 0.9);
backdrop-filter: blur(8px) saturate(180%);
border: 1px solid rgba(255, 255, 255, 0.3);
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
```

### Elevation Layers
```
Z-Index Stack:
─────────────────
9999: Modales de edición
10000: Toast notifications
50: Header fijo
10: Backdrop blur
1: Cards hover
0: Contenido base
```

### GPU Acceleration
```css
/* Todas las animaciones */
transform: translateZ(0);
will-change: transform;

/* Mejora performance en */
- translateY
- translateX
- scale
- opacity
```

---

## 🎭 ESTADOS INTERACTIVOS

### Secuencia de Hover
```
1. DEFAULT (reposo)
   ↓
2. HOVER (mouse over)
   - Cambio de color
   - Scale 1.05
   - Shadow aumenta
   ↓
3. ACTIVE (click)
   - Scale 0.95
   - Feedback táctil
   ↓
4. RELEASE (mouse up)
   - Vuelve a HOVER
   ↓
5. HOVER OUT (mouse leave)
   - Vuelve a DEFAULT
```

### Timing
```
DEFAULT → HOVER:  150ms
HOVER → ACTIVE:   50ms
ACTIVE → RELEASE: 100ms
```

---

## 🎯 CHECKLIST VISUAL

✅ Espaciado consistente (múltiplos de 4px)
✅ Bordes redondeados adecuados por contexto
✅ Sombras proporcionales al nivel de elevación
✅ Transiciones suaves (<300ms)
✅ Colores con contraste WCAG AA
✅ Hover states en todos los elementos interactivos
✅ Focus states visibles para accesibilidad
✅ Dark mode coherente
✅ Responsive en 3 breakpoints principales
✅ Animaciones con timing natural

---

**Todo el sistema visual está optimizado para ofrecer la mejor experiencia de usuario posible, combinando elegancia, performance y usabilidad.**
