import React, { useState, useRef, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useProductsByCategory } from "../hooks/useProducts";
import ResponsiveProductCard from "./ResponsiveProductCard";

const EnhancedRelatedProducts = ({ productoActual, className = "" }) => {
  const { products: productosCategoria, loading } = useProductsByCategory(
    productoActual?.categoria
  );
  
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  // Filtrar productos relacionados (excluir el actual)
  const productosRelacionados = productosCategoria.filter(
    producto => producto.id !== productoActual?.id
  ).slice(0, 12); // Máximo 12 productos relacionados

  // Verificar capacidad de scroll
  const checkScrollCapability = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  // Scroll suave
  const scrollTo = (direction) => {
    const container = scrollContainerRef.current;
    if (!container || isScrolling) return;

    setIsScrolling(true);
    const cardWidth = 280; // Ancho aproximado de cada tarjeta + gap
    const scrollAmount = direction === 'left' ? -cardWidth * 2 : cardWidth * 2;

    container.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });

    // Reset scrolling flag
    setTimeout(() => {
      setIsScrolling(false);
      checkScrollCapability();
    }, 300);
  };

  // Manejar scroll manual
  const handleScroll = () => {
    if (!isScrolling) {
      checkScrollCapability();
    }
  };

  // Touch events para móvil
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && canScrollRight) {
      scrollTo('right');
    }
    if (isRightSwipe && canScrollLeft) {
      scrollTo('left');
    }
  };

  // Verificar scroll al cargar y redimensionar
  useEffect(() => {
    checkScrollCapability();
    
    const handleResize = () => {
      setTimeout(checkScrollCapability, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [productosRelacionados]);

  // No mostrar si no hay productos relacionados
  if (loading || productosRelacionados.length === 0) {
    return null;
  }

  return (
    <section className={`py-8 ${className}`}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Productos relacionados
          </h2>
          
          {/* Controles de navegación - Solo desktop */}
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => scrollTo('left')}
              disabled={!canScrollLeft || isScrolling}
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              aria-label="Anterior"
            >
              <FaChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => scrollTo('right')}
              disabled={!canScrollRight || isScrolling}
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              aria-label="Siguiente"
            >
              <FaChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Carrusel de productos */}
        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitScrollbar: { display: 'none' }
            }}
            onScroll={handleScroll}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {productosRelacionados.map((producto) => (
              <div
                key={producto.id}
                className="flex-shrink-0 w-64 md:w-72"
              >
                <ResponsiveProductCard 
                  producto={producto}
                  className="h-full"
                />
              </div>
            ))}
          </div>

          {/* Gradientes de fade en los bordes - Solo desktop */}
          {canScrollLeft && (
            <div className="hidden md:block absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none z-10" />
          )}
          {canScrollRight && (
            <div className="hidden md:block absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />
          )}
        </div>

        {/* Indicador de swipe para móvil */}
        <div className="md:hidden mt-4 text-center">
          <p className="text-sm text-gray-500">
            Desliza para ver más productos →
          </p>
        </div>
      </div>
    </section>
  );
};

export default EnhancedRelatedProducts;
