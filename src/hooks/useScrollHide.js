import { useState, useEffect, useRef } from 'react';

/**
 * Hook personalizado para controlar la visibilidad de elementos con scroll
 * Solo funciona en desktop (xl ≥ 1280px)
 * 
 * @param {number} threshold - Píxeles mínimos de scroll antes de ocultar (default: 100)
 * @returns {boolean} visible - Si el elemento debe estar visible
 */
export const useScrollHide = (threshold = 100) => {
  const [visible, setVisible] = useState(true);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1280);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  // Detectar cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      const isDesktopNow = window.innerWidth >= 1280;
      setIsDesktop(isDesktopNow);
      if (!isDesktopNow) {
        setVisible(true); // Siempre visible en móvil/tablet
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll hide/show solo en desktop
  useEffect(() => {
    if (!isDesktop) return;

    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScroll = window.pageYOffset;
          const lastScroll = lastScrollY.current;

          if (currentScroll > lastScroll && currentScroll > threshold) {
            // Bajando y pasó threshold: ocultar
            setVisible(false);
          } else if (currentScroll < lastScroll || currentScroll === 0) {
            // Subiendo o en top: mostrar
            setVisible(true);
          }

          lastScrollY.current = currentScroll;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDesktop, threshold]);

  return visible;
};
