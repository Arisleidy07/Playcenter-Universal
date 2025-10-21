import React, { useState, useEffect, useRef } from "react";
import { collection, query, where, limit, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import RelatedProductCard from "./RelatedProductCard";

/**
 * EnhancedRelatedProducts - Productos relacionados EXACTO como Amazon
 * - Flechas FIJAS fuera del contenedor
 * - Scroll snap para productos completos
 * - Responsive: móvil (1-2), tablet (2-3), desktop (4-6)
 * - Sin cortes, altura fija, line-clamp
 */
const EnhancedRelatedProducts = ({ productoActual, className = "" }) => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const containerRef = useRef(null);

  // Cargar productos relacionados
  useEffect(() => {
    const cargarProductosRelacionados = async () => {
      if (!productoActual?.categoria) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Buscar productos de la misma categoría
        const q = query(
          collection(db, "productos"),
          where("categoria", "==", productoActual.categoria),
          where("activo", "==", true),
          limit(20)
        );

        const snapshot = await getDocs(q);
        const productosData = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((p) => p.id !== productoActual.id); // Excluir el producto actual

        setProductos(productosData);
      } catch (error) {
        console.error("Error cargando productos relacionados:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarProductosRelacionados();
  }, [productoActual]);

  // Actualizar estado de botones de scroll
  useEffect(() => {
    const updateScrollButtons = () => {
      if (!containerRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setCanScrollLeft(scrollLeft > 5); // Margen de 5px
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    };

    const container = containerRef.current;
    if (container) {
      updateScrollButtons();
      container.addEventListener("scroll", updateScrollButtons);
      return () => container.removeEventListener("scroll", updateScrollButtons);
    }
  }, [productos]);

  // Funciones de navegación - Scroll snap automático
  const scrollLeft = () => {
    if (containerRef.current) {
      const cardWidth = 180; // Ancho del card
      const gap = 12; // gap-3
      const itemWidth = cardWidth + gap;
      
      // Responsive según ancho de ventana
      const width = window.innerWidth;
      const itemsToScroll = width < 640 ? 1 : width < 1024 ? 2 : 4;
      
      const scrollAmount = itemWidth * itemsToScroll;
      
      containerRef.current.scrollBy({
        left: -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      const cardWidth = 180; // Ancho del card
      const gap = 12; // gap-3
      const itemWidth = cardWidth + gap;
      
      // Responsive según ancho de ventana
      const width = window.innerWidth;
      const itemsToScroll = width < 640 ? 1 : width < 1024 ? 2 : 4;
      
      const scrollAmount = itemWidth * itemsToScroll;
      
      containerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (loading) {
    return (
      <div className={`enhanced-related-products ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (productos.length === 0) {
    return null;
  }

  return (
    <div className={`enhanced-related-products ${className}`}>
      {/* Título */}
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Productos relacionados
      </h2>

      {/* Contenedor principal con padding para flechas */}
      <div className="relative">
        {/* Flecha IZQUIERDA - CÍRCULO como Amazon */}
        {canScrollLeft && (
          <button
            onClick={scrollLeft}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
            aria-label="Anterior"
          >
            <FaChevronLeft className="text-gray-700 dark:text-gray-300 text-lg" />
          </button>
        )}

        {/* Contenedor de productos con scroll snap y PADDING para flechas */}
        <div
          ref={containerRef}
          className="overflow-x-auto scrollbar-hide"
          style={{
            scrollSnapType: "x mandatory",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            paddingLeft: "56px", // Espacio para flecha izquierda
            paddingRight: "56px", // Espacio para flecha derecha
          }}
        >
          <div className="flex gap-3">
            {productos.map((producto) => (
              <RelatedProductCard key={producto.id} producto={producto} />
            ))}
          </div>
        </div>

        {/* Flecha DERECHA - CÍRCULO como Amazon */}
        {canScrollRight && (
          <button
            onClick={scrollRight}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
            aria-label="Siguiente"
          >
            <FaChevronRight className="text-gray-700 dark:text-gray-300 text-lg" />
          </button>
        )}
      </div>
    </div>
  );
};

export default EnhancedRelatedProducts;
