import React, { useMemo, useRef, useCallback, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useProductsByCategory } from "../hooks/useProducts";
import "../styles/ProductosRelacionados.css";

function ProductosRelacionados({ productoActual, onProductoClick }) {
  const { products: productosCategoria, loading } = useProductsByCategory(
    productoActual?.categoria
  );

  // Hooks MUST be declared unconditionally (before any early returns)
  const railRef = useRef(null);
  const snapTimer = useRef(null);
  const dragging = useRef(false);
  const moved = useRef(false);

  const getStep = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return 0;
    const card = rail.querySelector(".prl-card");
    if (!card) return 0;
    const styles = getComputedStyle(rail);
    const gap = parseInt(styles.getPropertyValue("--gap") || "16", 10) || 16;
    const w = card.getBoundingClientRect().width;
    return w + gap;
  }, []);

  const snapToNearest = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const step = getStep();
    if (!step) return;
    const index = Math.round(rail.scrollLeft / step);
    const target = index * step;
    rail.classList.add("no-smooth");
    rail.scrollTo({ left: target });
    setTimeout(() => rail.classList.remove("no-smooth"), 40);
  }, [getStep]);

  const onScroll = () => {
    if (dragging.current) return;
    if (snapTimer.current) clearTimeout(snapTimer.current);
    snapTimer.current = setTimeout(snapToNearest, 90);
  };

  const onPointerDown = () => {
    dragging.current = true;
    moved.current = false;
    railRef.current?.classList.add("no-smooth");
  };

  const onPointerMove = (e) => {
    if (!dragging.current) return;
    if (Math.abs(e.movementX) > 2 || Math.abs(e.movementY) > 2) {
      moved.current = true;
    }
  };

  const onPointerUp = () => {
    dragging.current = false;
    snapToNearest();
  };

  useEffect(() => {
    return () => snapTimer.current && clearTimeout(snapTimer.current);
  }, []);

  const go = (id) => {
    if (!id) return;
    if (onProductoClick) onProductoClick(id);
    else window.location.href = `/producto/${id}`;
  };

  const scrollBy = (dir) => {
    const el = railRef.current;
    if (el && el.firstChild) {
      const cardWidth = el.firstChild.getBoundingClientRect().width;
      const gap =
        parseInt(getComputedStyle(el).getPropertyValue("--gap") || "16", 10) ||
        16;
      const scrollAmount = dir * (cardWidth + gap);
      el.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const relacionados = useMemo(() => {
    if (!productoActual || !productosCategoria) return [];
    return productosCategoria
      .filter((p) => p?.id !== productoActual?.id)
      .slice(0, 20);
  }, [productosCategoria, productoActual?.id]);

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
    <section className="prl-section" aria-label="Productos relacionados" style={{ overflow: 'visible' }}>
      <div className="prl-container" style={{ overflow: 'visible' }}>
        <h2 className="prl-title">Productos relacionados</h2>

        <div className="prl-wrapper" aria-roledescription="carrusel" style={{ overflow: 'visible' }}>
          {/* Flecha izquierda */}
          <button
            className="prl-arrow left"
            onClick={() => scrollBy(-1)}
            aria-label="Anterior"
            type="button"
          >
            <FaChevronLeft size={16} />
          </button>

          {/* Rail */}
          <div
            ref={railRef}
            className="prl-rail"
            style={{ overflowY: 'visible' }}
            onScroll={onScroll}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onPointerLeave={onPointerUp}
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
                    onClick={() => {
                      if (moved.current) return;
                      go(rel.slug || rel.id);
                    }}
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

          {/* Flecha derecha */}
          <button
            className="prl-arrow right"
            onClick={() => scrollBy(1)}
            aria-label="Siguiente"
            type="button"
          >
            <FaChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}

export default ProductosRelacionados;
