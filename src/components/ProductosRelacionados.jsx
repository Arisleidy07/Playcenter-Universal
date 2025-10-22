import React, { useMemo, useRef, useCallback, useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useProductsByCategory } from "../hooks/useProducts";
import "../styles/ProductosRelacionados.css";

function ProductosRelacionados({ productoActual, onProductoClick }) {
  const { products: productosCategoria, loading } = useProductsByCategory(
    productoActual?.categoria
  );

  // Hooks MUST be declared unconditionally (before any early returns)
  const railRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const relacionados = useMemo(() => {
    if (!productoActual || !productosCategoria) return [];
    return productosCategoria
      .filter((p) => p?.id !== productoActual?.id)
      .slice(0, 20);
  }, [productosCategoria, productoActual?.id]);

  // Calcular cuántos productos caben en la pantalla
  const getVisibleCount = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return 1;
    
    const containerWidth = rail.offsetWidth;
    const card = rail.querySelector(".prl-card");
    if (!card) return 1;
    
    const cardWidth = card.offsetWidth;
    const gap = 20; // gap fijo de 20px
    const cardWithGap = cardWidth + gap;
    
    // Calcular cuántos productos completos caben
    return Math.floor(containerWidth / cardWithGap);
  }, []);

  // Actualizar estado de flechas
  const updateScrollButtons = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = rail;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  // Scroll por página completa de productos
  const scrollByPage = useCallback((direction) => {
    const rail = railRef.current;
    if (!rail) return;
    
    const card = rail.querySelector(".prl-card");
    if (!card) return;
    
    const cardWidth = card.offsetWidth;
    const gap = 20;
    const cardWithGap = cardWidth + gap;
    const visibleCount = getVisibleCount();
    
    // Mover exactamente el número de productos visibles
    const scrollAmount = direction * visibleCount * cardWithGap;
    
    rail.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  }, [getVisibleCount]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    
    updateScrollButtons();
    
    // Ocultar indicador "Desliza" después del primer scroll
    const hideScrollHint = () => {
      const wrapper = rail.parentElement;
      if (wrapper && rail.scrollLeft > 10) {
        wrapper.classList.add('scrolled');
      }
    };
    
    rail.addEventListener('scroll', updateScrollButtons);
    rail.addEventListener('scroll', hideScrollHint);
    window.addEventListener('resize', updateScrollButtons);
    
    return () => {
      rail.removeEventListener('scroll', updateScrollButtons);
      rail.removeEventListener('scroll', hideScrollHint);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [updateScrollButtons, relacionados]);

  const go = (id) => {
    if (!id) return;
    if (onProductoClick) onProductoClick(id);
    else window.location.href = `/producto/${id}`;
  };


  const formatPriceRD = (value) => {
    const pesos = Math.round(Number(value) || 0);
    try {
      return new Intl.NumberFormat("es-DO").format(pesos);
    } catch {
      return String(pesos);
    }
  };

  // Conditional UI rendering AFTER hooks have been set up
  if (loading) {
    return (
      <div className="productos-relacionados-container">
        <h3 className="prl-title">Productos Relacionados</h3>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
        </div>
      </div>
    );
  }

  return (
    <section className="prl-section" aria-label="Productos relacionados">
      <div className="prl-container">
        <h2 className="prl-title">Productos relacionados</h2>

        <div className="prl-wrapper" aria-roledescription="carrusel">
          {/* Flecha izquierda - solo desktop */}
          {canScrollLeft && (
            <button
              className="prl-arrow left"
              onClick={() => scrollByPage(-1)}
              aria-label="Anterior"
              type="button"
            >
              <FaChevronLeft size={18} />
            </button>
          )}

          {/* Rail con scroll snap */}
          <div
            ref={railRef}
            className="prl-rail"
          >
            {relacionados.length > 0 ? (
              relacionados.map((rel) => {
                const imgSrc = rel?.imagen || rel?.imagenes?.[0] || "";
                const name = rel?.nombre || "Producto";
                const price = Number(rel?.precio) || 0;
                return (
                  <article
                    key={rel?.id}
                    className="prl-card"
                    role="group"
                    aria-label={name}
                    onClick={() => go(rel.slug || rel.id)}
                  >
                    <div className="prl-imgbox">
                      {imgSrc ? (
                        <img
                          src={imgSrc}
                          alt={name}
                          className="prl-img"
                          loading="lazy"
                          draggable="false"
                          decoding="async"
                        />
                      ) : (
                        <div className="prl-img-fallback" aria-hidden />
                      )}
                    </div>

                    <div className="prl-meta">
                      <h3 className="prl-name" title={name}>
                        {name}
                      </h3>
                      <div className="prl-price">
                        {price > 0 ? (
                          <span>
                            DOP <strong>{formatPriceRD(price)}</strong>
                          </span>
                        ) : (
                          <span className="prl-price-muted">Sin precio</span>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="prl-empty">No hay productos relacionados.</div>
            )}
          </div>

          {/* Flecha derecha - solo desktop */}
          {canScrollRight && (
            <button
              className="prl-arrow right"
              onClick={() => scrollByPage(1)}
              aria-label="Siguiente"
              type="button"
            >
              <FaChevronRight size={18} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

export default ProductosRelacionados;
