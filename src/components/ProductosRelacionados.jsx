import React, { useMemo, useRef, useCallback, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "../styles/ProductosRelacionados.css";

function ProductosRelacionados({
  productoActual,
  productosPorCategoria,
  onProductoClick,
}) {
  const productosPlanos = useMemo(
    () =>
      (productosPorCategoria || []).flatMap((grupo) =>
        (grupo?.productos || []).map((p) => ({
          ...p,
          categoria: (grupo?.categoria || "").trim().toLowerCase(),
        }))
      ),
    [productosPorCategoria]
  );

  const categoriaActual = (productoActual?.categoria || "")
    .trim()
    .toLowerCase();

  const relacionados = useMemo(() => {
    if (!productoActual) return [];
    return productosPlanos
      .filter(
        (p) =>
          p?.id !== productoActual?.id &&
          p?.categoria === categoriaActual &&
          categoriaActual !== "todos los productos"
      )
      .slice(0, 1000);
  }, [productosPlanos, productoActual?.id, categoriaActual]);

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
    const gap =
      parseInt(styles.getPropertyValue("--gap") || "16", 10) || 16;
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
        parseInt(
          getComputedStyle(el).getPropertyValue("--gap") || "16",
          10
        ) || 16;
      const scrollAmount = dir * (cardWidth + gap);
      el.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className="prl-section" aria-label="Productos relacionados">
      <div className="prl-container">
        <h2 className="prl-title">Productos relacionados</h2>

        <div className="prl-wrapper" aria-roledescription="carrusel">
          {/* Flecha izquierda */}
          <button
            className="prl-arrow left hidden lg:flex"
            onClick={() => scrollBy(-1)}
            aria-label="Anterior"
            type="button"
          >
            <FaChevronLeft size={20} />
          </button>

          {/* Rail */}
          <div
            ref={railRef}
            className="prl-rail"
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
                return (
                  <article
                    key={rel?.id}
                    className="prl-card"
                    role="group"
                    aria-label={name}
                    onClick={() => {
                      if (moved.current) return;
                      go(rel?.id);
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

                      <div className="prl-cta">
                        <button
                          className="prl-btn"
                          type="button"
                          tabIndex={-1}
                          aria-label={`Ver ${name}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            go(rel?.id);
                          }}
                        >
                          Ver producto
                          <svg
                            className="prl-btn-icon"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            aria-hidden
                          >
                            <path
                              fillRule="evenodd"
                              d="M12 2.25c-5.385 0-9.75 4.365-9.75 
                              9.75s4.365 9.75 9.75 9.75 9.75-4.365 
                              9.75-9.75S17.385 2.25 12 2.25zm4.28 
                              10.28a.75.75 0 000-1.06l-3-3a.75.75 
                              0 10-1.06 1.06l1.72 1.72H8.25a.75.75 
                              0 000 1.5h5.69l-1.72 1.72a.75.75 0 
                              101.06 1.06l3-3z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
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
            className="prl-arrow right hidden lg:flex"
            onClick={() => scrollBy(1)}
            aria-label="Siguiente"
            type="button"
          >
            <FaChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}

export default ProductosRelacionados;
