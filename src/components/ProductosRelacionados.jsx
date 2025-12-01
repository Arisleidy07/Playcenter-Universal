import React, {
  useMemo,
  useRef,
  useCallback,
  useEffect,
  useState,
} from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useProducts } from "../hooks/useProducts";
import "../styles/ProductosRelacionados.css";

function ProductosRelacionados({ productoActual, onProductoClick }) {
  // Obtener TODOS los productos activos para filtrar mejor
  const { products: todosProductos, loading } = useProducts(false);

  // Hooks MUST be declared unconditionally (before any early returns)
  const railRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [showAll, setShowAll] = useState(false); // Para el botón "Ver más" en móvil

  // REGLA 1 y 2: Filtrar por categoría O etiquetas, EXCLUIR producto actual
  const relacionados = useMemo(() => {
    if (!productoActual || !todosProductos || todosProductos.length === 0)
      return [];

    const productoEtiquetas = productoActual.etiquetas || [];
    const productoCategoria = productoActual.categoria;

    return todosProductos
      .filter((p) => {
        // REGLA 2: Excluir el producto actual
        if (p?.id === productoActual?.id) return false;

        // REGLA 1: Misma categoría
        if (p.categoria === productoCategoria) return true;

        // REGLA 1: Etiquetas coincidentes
        if (
          productoEtiquetas.length > 0 &&
          p.etiquetas &&
          p.etiquetas.length > 0
        ) {
          const hasMatchingTag = p.etiquetas.some((tag) =>
            productoEtiquetas.includes(tag)
          );
          if (hasMatchingTag) return true;
        }

        return false;
      })
      .slice(0, 24); // REGLA 3: Limitar a 24 productos iniciales
  }, [todosProductos, productoActual]);

  // Calcular cuántos productos caben en la pantalla
  const getVisibleCount = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return 1;

    const containerWidth = rail.offsetWidth;
    const card = rail.querySelector(".prl-card-desktop");
    if (!card) return 1;

    const cardWidth = card.offsetWidth;
    const gap = 12; // gap de 12px
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
  const scrollByPage = useCallback(
    (direction) => {
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
        behavior: "smooth",
      });
    },
    [getVisibleCount]
  );

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    updateScrollButtons();

    // Ocultar indicador "Desliza" después del primer scroll
    const hideScrollHint = () => {
      const wrapper = rail.parentElement;
      if (wrapper && rail.scrollLeft > 10) {
        wrapper.classList.add("scrolled");
      }
    };

    rail.addEventListener("scroll", updateScrollButtons);
    rail.addEventListener("scroll", hideScrollHint);
    window.addEventListener("resize", updateScrollButtons);

    return () => {
      rail.removeEventListener("scroll", updateScrollButtons);
      rail.removeEventListener("scroll", hideScrollHint);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [updateScrollButtons, relacionados]);

  const go = (id) => {
    if (!id) return;
    if (onProductoClick) {
      onProductoClick(id);
    } else {
      window.location.href = `/producto/${id}`;
      window.scrollTo(0, 0);
    }
  };

  const handleShowMore = () => {
    setShowAll(true);
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

  // En móvil, limitar a 6 productos inicialmente
  const productosAMostrar = showAll ? relacionados : relacionados.slice(0, 6);
  const hayMasProductos = relacionados.length > 6;

  return (
    <section className="prl-section" aria-label="Productos relacionados">
      <div className="prl-container">
        <h2 className="prl-title">Productos relacionados</h2>

        {/* MÓVIL: Grid 2 columnas con botón "Ver más" */}
        <div className="prl-grid-mobile">
          {productosAMostrar.length > 0 ? (
            productosAMostrar.map((rel) => {
              const imgSrc = rel?.imagen || rel?.imagenes?.[0] || "";
              const name = rel?.nombre || "Producto";
              const price = Number(rel?.precio) || 0;
              return (
                <article
                  key={rel?.id}
                  className="prl-card-mobile"
                  onClick={() => go(rel.slug || rel.id)}
                >
                  {/* Imagen cuadrada */}
                  <div className="prl-img-wrapper">
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={name}
                        className="prl-img"
                        loading="lazy"
                      />
                    ) : (
                      <div className="prl-img-fallback" />
                    )}
                  </div>

                  {/* Contenido */}
                  <div className="prl-content">
                    {/* Título - máximo 2 líneas */}
                    <h3 className="prl-name" title={name}>
                      {name}
                    </h3>

                    {/* Precio */}
                    <div className="prl-price-mobile">
                      {price > 0 ? (
                        <>
                          <span className="currency">RD$</span>
                          <strong className="amount">
                            {formatPriceRD(price)}
                          </strong>
                        </>
                      ) : (
                        <span className="no-price">Consultar</span>
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

        {/* Botón "Ver más" - solo móvil */}
        {!showAll && hayMasProductos && (
          <button className="prl-show-more-btn" onClick={handleShowMore}>
            Ver más productos relacionados
            <FaChevronRight className="ml-2" />
          </button>
        )}

        {/* TABLET/DESKTOP: Carrusel horizontal con flechas */}
        <div className="prl-wrapper-desktop" aria-roledescription="carrusel">
          {/* Flecha izquierda */}
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

          {/* Rail horizontal con scroll */}
          <div ref={railRef} className="prl-rail-desktop">
            {relacionados.length > 0 ? (
              relacionados.map((rel) => {
                const imgSrc = rel?.imagen || rel?.imagenes?.[0] || "";
                const name = rel?.nombre || "Producto";
                const price = Number(rel?.precio) || 0;
                return (
                  <article
                    key={rel?.id}
                    className="prl-card-desktop"
                    onClick={() => go(rel.slug || rel.id)}
                  >
                    {/* Imagen cuadrada */}
                    <div className="prl-img-wrapper">
                      {imgSrc ? (
                        <img
                          src={imgSrc}
                          alt={name}
                          className="prl-img"
                          loading="lazy"
                        />
                      ) : (
                        <div className="prl-img-fallback" />
                      )}
                    </div>

                    {/* Contenido */}
                    <div className="prl-content">
                      {/* Título - máximo 2 líneas */}
                      <h3 className="prl-name" title={name}>
                        {name}
                      </h3>

                      {/* Precio */}
                      <div className="prl-price-desktop">
                        {price > 0 ? (
                          <>
                            <span className="currency">RD$</span>
                            <strong className="amount">
                              {formatPriceRD(price)}
                            </strong>
                          </>
                        ) : (
                          <span className="no-price">Consultar</span>
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
