import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const anuncios = [
  {
    id: 1,
    img: "/ads/1.png",
    link: "/Productos/consolas",
    isExternal: false,
  },
  {
    id: 6,
    img: "/ads/6.png",
    link: "https://playcenterwisp.com",
    isExternal: true,
  },
  {
    id: 2,
    img: "/ads/2.png",
    link: "https://maps.app.goo.gl/ZSXza3ESVeLEPPx78",
    isExternal: true,
  },
  {
    id: 3,
    img: "/ads/3.png",
    link: "/Productos/videojuegos",
    isExternal: false,
  },
  {
    id: 4,
    img: "/ads/5.png",
    link: "/Productos/ofertas-especiales",
    isExternal: false,
  },
  { id: 5, img: "/ads/4.png", link: "/Productos", isExternal: false },
];

function SliderAnuncios() {
  const [index, setIndex] = useState(0);
  const timeoutRef = useRef(null);
  const delay = 6000;
  const [paused, setPaused] = useState(false);

  const resetAutoplay = useCallback(() => {
    clearTimeout(timeoutRef.current);
    if (paused) return; // no programar si está en pausa
    timeoutRef.current = setTimeout(() => {
      setIndex((prev) => (prev + 1) % anuncios.length);
    }, delay);
  }, [paused]);

  useEffect(() => {
    resetAutoplay();
    return () => clearTimeout(timeoutRef.current);
  }, [index, resetAutoplay]);

  // Control global desde TopBar: escuchar evento para pausar/reanudar
  useEffect(() => {
    const handler = (e) => {
      try {
        const next = Boolean(e?.detail?.paused);
        setPaused(next);
        clearTimeout(timeoutRef.current);
        if (!next) {
          timeoutRef.current = setTimeout(() => {
            setIndex((prev) => (prev + 1) % anuncios.length);
          }, delay);
        }
      } catch {}
    };
    window.addEventListener("pcu:main-slider-toggle", handler);
    return () => window.removeEventListener("pcu:main-slider-toggle", handler);
  }, []);

  const handlePrev = () => {
    clearTimeout(timeoutRef.current);
    setIndex((prev) => (prev === 0 ? anuncios.length - 1 : prev - 1));
  };

  const handleNext = () => {
    clearTimeout(timeoutRef.current);
    setIndex((prev) => (prev + 1) % anuncios.length);
  };

  // Swipe touch handlers
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const deltaX = touchEndX.current - touchStartX.current;
    if (Math.abs(deltaX) > 50) {
      if (deltaX > 0) handlePrev();
      else handleNext();
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full max-w-[1600px] mx-auto overflow-hidden rounded-xl shadow-xl
        h-[140px] sm:h-[180px] md:h-[260px] lg:h-[400px]"
    >
      <div
        className="flex transition-transform duration-700 ease-in-out h-full"
        style={{
          width: `${anuncios.length * 100}%`,
          transform: `translateX(-${index * (100 / anuncios.length)}%)`,
        }}
      >
        {anuncios.map((item) =>
          item.isExternal ? (
            <a
              key={item.id}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-full flex-shrink-0"
              style={{ width: `${100 / anuncios.length}%` }}
            >
              <img
                src={item.img}
                alt={`Anuncio ${item.id}`}
                loading="lazy"
                className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-[1.02]"
              />
            </a>
          ) : (
            <Link
              key={item.id}
              to={item.link}
              className="w-full h-full flex-shrink-0"
              style={{ width: `${100 / anuncios.length}%` }}
            >
              <img
                src={item.img}
                alt={`Anuncio ${item.id}`}
                loading="lazy"
                className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-[1.02]"
              />
            </Link>
          )
        )}
      </div>

      {/* Botones de navegación */}
      <button
        data-slider-nav
        onClick={handlePrev}
        aria-label="Anterior"
        style={{
          position: "absolute",
          top: "50%",
          left: window.innerWidth < 640 ? "8px" : "16px",
          transform: "translateY(-50%)",
          zIndex: 20,
          cursor: "pointer",
        }}
      >
        <ChevronLeft
          size={window.innerWidth < 640 ? 28 : 36}
          color="#ffffff"
          strokeWidth={3}
        />
      </button>
      <button
        data-slider-nav
        onClick={handleNext}
        aria-label="Siguiente"
        style={{
          position: "absolute",
          top: "50%",
          right: window.innerWidth < 640 ? "8px" : "16px",
          transform: "translateY(-50%)",
          zIndex: 20,
          cursor: "pointer",
        }}
      >
        <ChevronRight
          size={window.innerWidth < 640 ? 28 : 36}
          color="#ffffff"
          strokeWidth={3}
        />
      </button>

      {/* Indicadores */}
      <div
        style={{
          position: "absolute",
          bottom: window.innerWidth < 640 ? "12px" : "24px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "8px",
          zIndex: 20,
        }}
      >
        {anuncios.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              clearTimeout(timeoutRef.current);
              setIndex(idx);
            }}
            aria-label={`Ir al slide ${idx + 1}`}
            style={{
              width: window.innerWidth < 640 ? "10px" : "12px",
              height: window.innerWidth < 640 ? "10px" : "12px",
              borderRadius: "50%",
              backgroundColor:
                idx === index ? "#ffffff" : "rgba(255, 255, 255, 0.4)",
              opacity: idx === index ? 0.9 : 0.4,
              transform: idx === index ? "scale(1.1)" : "scale(1)",
              transition: "all 0.3s ease",
              border: "none",
              cursor: "pointer",
              outline: "none",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default SliderAnuncios;
