import { useState, useEffect } from 'react';

// Hook para detectar tipo de dispositivo según especificaciones del usuario
const useDeviceDetection = () => {
  const [deviceType, setDeviceType] = useState('desktop');
  const [screenInfo, setScreenInfo] = useState({
    width: 0,
    height: 0,
    diagonal: 0,
    ppi: 0
  });

  useEffect(() => {
    const detectDevice = () => {
      if (typeof window === 'undefined') return;

      const width = window.innerWidth;
      const height = window.innerHeight;
      const pixelRatio = window.devicePixelRatio || 1;

      // Calcular información de pantalla
      const physicalWidth = width * pixelRatio;
      const physicalHeight = height * pixelRatio;
      
      // Estimación de PPI (pixels per inch) basada en dispositivos comunes
      let estimatedPPI = 96; // Default desktop PPI
      
      // Detectar si es móvil por user agent
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobileUA) {
        // Para móviles, estimar PPI más alto
        if (physicalWidth >= 1080) estimatedPPI = 400; // High-end phones
        else if (physicalWidth >= 720) estimatedPPI = 300; // Mid-range phones
        else estimatedPPI = 200; // Basic phones
      }

      // Calcular diagonal en pulgadas
      const diagonalPixels = Math.sqrt(physicalWidth * physicalWidth + physicalHeight * physicalHeight);
      const diagonalInches = diagonalPixels / estimatedPPI;

      setScreenInfo({
        width,
        height,
        diagonal: diagonalInches,
        ppi: estimatedPPI
      });

      // Lógica de detección según especificaciones del usuario
      let detectedType = 'desktop';

      if (isMobileUA) {
        // Regla específica: Samsung S24 y teléfonos grandes siguen siendo "móvil"
        // S24 ≈ 6.8" diagonal, densidad ~ 500-520 ppi
        if (diagonalInches <= 7.5) { // Hasta 7.5" es teléfono
          detectedType = 'mobile';
        } else if (diagonalInches <= 12) { // 7.5" - 12" es tablet
          detectedType = 'tablet';
        } else {
          detectedType = 'desktop';
        }
      } else {
        // Para dispositivos no móviles, usar breakpoints de ancho
        if (width < 768) {
          detectedType = 'mobile';
        } else if (width < 1280) { // xl breakpoint
          detectedType = 'tablet';
        } else {
          detectedType = 'desktop';
        }
      }

      setDeviceType(detectedType);
    };

    // Detectar al cargar
    detectDevice();

    // Detectar al redimensionar
    window.addEventListener('resize', detectDevice);
    window.addEventListener('orientationchange', detectDevice);

    return () => {
      window.removeEventListener('resize', detectDevice);
      window.removeEventListener('orientationchange', detectDevice);
    };
  }, []);

  // Funciones de utilidad
  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';
  const isDesktop = deviceType === 'desktop';
  
  // Breakpoints específicos
  const isMobileOrTablet = isMobile || isTablet;
  const isTabletOrDesktop = isTablet || isDesktop;

  return {
    deviceType,
    screenInfo,
    isMobile,
    isTablet,
    isDesktop,
    isMobileOrTablet,
    isTabletOrDesktop
  };
};

export default useDeviceDetection;
