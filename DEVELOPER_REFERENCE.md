# 👨‍💻 REFERENCIA RÁPIDA PARA DESARROLLADORES

## 🚀 Quick Start

### Clases CSS Clave Implementadas

```css
/* Botones Modernos */
.btn-modern {
  @apply px-6 py-3 rounded-xl font-semibold;
  @apply transition-all duration-200 hover:scale-105;
  @apply shadow-lg hover:shadow-xl;
}

.btn-primary {
  @apply bg-blue-600 hover:bg-blue-700 text-white;
}

.btn-secondary {
  @apply text-gray-700 dark:text-gray-300;
  @apply hover:bg-gray-100 dark:hover:bg-gray-800;
}

/* Cards con Hover */
.card-modern {
  @apply bg-white dark:bg-gray-800 rounded-2xl shadow-md;
  @apply border border-gray-100 dark:border-gray-700;
  @apply transition-all duration-300;
  @apply hover:shadow-2xl hover:-translate-y-3 hover:scale-[1.02];
}

/* Backdrop Blur */
.backdrop-modern {
  @apply bg-white/90 dark:bg-gray-800/90;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* Toast Notifications */
.toast-notification {
  @apply fixed top-24 right-4 z-[10000];
  @apply px-6 py-3 rounded-full shadow-2xl;
  @apply flex items-center gap-3 font-semibold;
}
```

---

## 🎨 Componentes Reutilizables

### Modal Centrado con Blur

```jsx
import { motion, AnimatePresence } from 'framer-motion';

function ModernModal({ isOpen, onClose, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-start justify-center px-4"
          style={{ paddingTop: 'calc(var(--content-offset, 120px) + 70px)' }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            style={{ backdropFilter: 'blur(8px)' }}
            onClick={onClose}
          />
          
          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[calc(90vh-140px)] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### Toast Notification Function

```javascript
function showToast(message, type = 'success') {
  const notification = document.createElement('div');
  const bgColor = type === 'success' ? 'bg-green-600' : 
                  type === 'error' ? 'bg-red-600' : 'bg-blue-600';
  
  notification.className = `fixed top-24 right-4 ${bgColor} text-white px-6 py-3 rounded-full shadow-2xl z-[10000] flex items-center gap-3 font-semibold`;
  notification.style.opacity = '0';
  notification.style.transform = 'translateY(-20px)';
  notification.style.transition = 'all 0.3s ease-out';
  
  notification.innerHTML = `
    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
    </svg>
    <span>${message}</span>
  `;
  
  document.body.appendChild(notification);
  
  // Fade in
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateY(0)';
  }, 10);
  
  // Fade out after 3 seconds
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-20px)';
    setTimeout(() => {
      if (notification.parentNode) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Uso
showToast('Cambios guardados correctamente', 'success');
showToast('Error al guardar', 'error');
showToast('Procesando...', 'info');
```

### Card con Hover Moderno

```jsx
function ModernCard({ children, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="group"
    >
      <div
        onClick={onClick}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-3 hover:scale-[1.02] border border-gray-100 dark:border-gray-700 cursor-pointer"
      >
        {children}
      </div>
    </motion.div>
  );
}
```

### Botón Pill con Efecto

```jsx
function PillButton({ children, variant = 'primary', onClick, loading = false }) {
  const baseClasses = "px-8 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2";
  
  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
  };
  
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`${baseClasses} ${variantClasses[variant]} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
          Cargando...
        </>
      ) : children}
    </button>
  );
}
```

### Select Translúcido

```jsx
function ModernSelect({ value, onChange, options, label }) {
  return (
    <div className="flex items-center gap-4">
      {label && <span className="text-gray-500 dark:text-gray-400">{label}</span>}
      <select
        value={value}
        onChange={onChange}
        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-900 dark:text-white transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-950/30 cursor-pointer"
        style={{ backdropFilter: 'blur(8px)' }}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
```

---

## 🎯 Patrones de Animación

### Spring Animation (Modales)

```javascript
// Apertura suave y natural
const springConfig = {
  type: "spring",
  damping: 25,
  stiffness: 300
};

// Uso con Framer Motion
<motion.div
  initial={{ opacity: 0, y: -50 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -50 }}
  transition={springConfig}
>
```

### Fade Transition (Overlays)

```javascript
// Fade suave para backdrops
const fadeConfig = {
  duration: 0.3,
  ease: "easeOut"
};

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={fadeConfig}
>
```

### Scale Hover (Botones)

```css
/* CSS approach */
.button {
  transition: transform 0.2s ease-out;
}
.button:hover {
  transform: scale(1.05);
}
.button:active {
  transform: scale(0.95);
}
```

---

## 🔧 Hooks Útiles

### useToast

```javascript
import { useCallback } from 'react';

export function useToast() {
  const showToast = useCallback((message, type = 'success') => {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-600' : 
                    type === 'error' ? 'bg-red-600' : 'bg-blue-600';
    
    notification.className = `fixed top-24 right-4 ${bgColor} text-white px-6 py-3 rounded-full shadow-2xl z-[10000] flex items-center gap-3 font-semibold`;
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-20px)';
    notification.style.transition = 'all 0.3s ease-out';
    
    notification.innerHTML = `
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
      </svg>
      <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateY(0)';
    }, 10);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(-20px)';
      setTimeout(() => {
        if (notification.parentNode) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }, []);
  
  return { showToast };
}

// Uso
function MyComponent() {
  const { showToast } = useToast();
  
  const handleSave = async () => {
    try {
      await saveData();
      showToast('Guardado correctamente', 'success');
    } catch (error) {
      showToast('Error al guardar', 'error');
    }
  };
}
```

### useBackdropBlur

```javascript
import { useEffect } from 'react';

export function useBackdropBlur(isActive) {
  useEffect(() => {
    if (isActive) {
      document.body.style.overflow = 'hidden';
      const backdrop = document.createElement('div');
      backdrop.className = 'fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]';
      backdrop.style.backdropFilter = 'blur(8px)';
      backdrop.id = 'backdrop-blur';
      document.body.appendChild(backdrop);
      
      return () => {
        document.body.style.overflow = '';
        const existingBackdrop = document.getElementById('backdrop-blur');
        if (existingBackdrop) {
          document.body.removeChild(existingBackdrop);
        }
      };
    }
  }, [isActive]);
}
```

---

## 📦 Tailwind Config Recomendado

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Tus colores personalizados si los necesitas
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '500': '500ms',
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-out': 'fadeOut 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-50px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-50px)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
```

---

## 🎨 Variables CSS Globales

```css
/* globals.css */
:root {
  --content-offset: 120px; /* Altura del header */
  --modal-offset: 70px;    /* Separación extra para modales */
  --toast-top: 6rem;       /* 24 * 4px = 96px (top-24) */
  
  --transition-fast: 150ms;
  --transition-normal: 200ms;
  --transition-smooth: 300ms;
  --transition-slow: 500ms;
  
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  
  --radius-sm: 0.5rem;   /* 8px */
  --radius-md: 0.75rem;  /* 12px */
  --radius-lg: 1rem;     /* 16px */
  --radius-xl: 1.5rem;   /* 24px */
  --radius-full: 9999px;
}

/* Dark mode adjustments */
.dark {
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
}
```

---

## 🚀 Performance Tips

### 1. GPU Acceleration

```css
/* Aplicar a elementos animados */
.animated-element {
  transform: translateZ(0);
  will-change: transform;
}
```

### 2. Lazy Loading

```jsx
// Para imágenes
<img 
  src={url} 
  loading="lazy" 
  alt="Description"
/>

// Para componentes
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

### 3. Debounce para Scroll/Resize

```javascript
import { useEffect, useState } from 'react';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
}
```

### 4. Memoización

```jsx
import { memo, useMemo, useCallback } from 'react';

// Memoizar componentes pesados
const ExpensiveComponent = memo(({ data }) => {
  // ...
});

// Memoizar valores calculados
const computedValue = useMemo(() => {
  return expensiveComputation(data);
}, [data]);

// Memoizar callbacks
const handleClick = useCallback(() => {
  doSomething(value);
}, [value]);
```

---

## 🐛 Debugging Tips

### Ver Estados de Animación

```jsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: -50 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -50 }}
  onAnimationStart={() => console.log('Animation started')}
  onAnimationComplete={() => console.log('Animation completed')}
>
```

### Logs de Render

```jsx
useEffect(() => {
  console.log('Component mounted');
  return () => console.log('Component unmounted');
}, []);

useEffect(() => {
  console.log('Modal state changed:', isOpen);
}, [isOpen]);
```

---

## ✅ Checklist Pre-Deploy

- [ ] Probar en Chrome, Firefox, Safari
- [ ] Probar en móvil (iOS y Android)
- [ ] Verificar dark mode en todos los componentes
- [ ] Comprobar animaciones en diferentes velocidades de red
- [ ] Validar accesibilidad (tab navigation, screen readers)
- [ ] Optimizar imágenes (WebP, lazy loading)
- [ ] Minificar CSS y JS
- [ ] Verificar z-index hierarchy
- [ ] Probar con prefers-reduced-motion
- [ ] Validar responsive en todos los breakpoints

---

## 📚 Recursos Adicionales

### Documentación
- [Framer Motion](https://www.framer.com/motion/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Spring](https://react-spring.io/)

### Inspiración de Diseño
- [Dribbble](https://dribbble.com/)
- [Awwwards](https://www.awwwards.com/)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/)

### Tools
- [Can I Use](https://caniuse.com/) - Compatibilidad de navegadores
- [Contrast Checker](https://webaim.org/resources/contrastchecker/) - Accesibilidad
- [Easing Functions](https://easings.net/) - Timing functions

---

**Mantén este documento actualizado conforme evolucione el sistema de diseño.**
