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

      {/* Flecha IZQUIERDA */}
      <button
        onClick={handlePrev}
        style={{
          all: "unset",
          position: "absolute",
          top: "50%",
          left: "16px",
          transform: "translateY(-50%)",
          cursor: "pointer",
        }}
      >
        <ChevronLeft size={40} color="#ffffff" strokeWidth={3} />
      </button>

      {/* Flecha DERECHA */}
      <button
        onClick={handleNext}
        style={{
          all: "unset",
          position: "absolute",
          top: "50%",
          right: "16px",
          transform: "translateY(-50%)",
          cursor: "pointer",
        }}
      >
        <ChevronRight size={40} color="#ffffff" strokeWidth={3} />
      </button>

      {/* Indicadores - Circulitos blancos individuales */}
      <div
        style={{
          position: "absolute",
          bottom: window.innerWidth < 640 ? "12px" : "20px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "10px",
          zIndex: 20,
          padding: "8px 12px",
          background: "rgba(0, 0, 0, 0.4)",
          borderRadius: "20px",
          backdropFilter: "blur(8px)",
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
              width: window.innerWidth < 640 ? "8px" : "10px",
              height: window.innerWidth < 640 ? "8px" : "10px",
              borderRadius: "50%",
              backgroundColor: "#ffffff",
              opacity: idx === index ? 1 : 0.6,
              transform: idx === index ? "scale(1.3)" : "scale(1)",
              transition: "all 0.3s ease",
              border: "1px solid #ffffff",
              cursor: "pointer",
              outline: "none",
              boxShadow:
                idx === index
                  ? "0 0 8px rgba(255, 255, 255, 0.8), 0 2px 4px rgba(0, 0, 0, 0.3)"
                  : "0 1px 3px rgba(0, 0, 0, 0.3)",
              padding: 0,
            }}
            onMouseEnter={(e) => {
              if (idx !== index) {
                e.currentTarget.style.opacity = "0.9";
                e.currentTarget.style.transform = "scale(1.2)";
              }
            }}
            onMouseLeave={(e) => {
              if (idx !== index) {
                e.currentTarget.style.opacity = "0.6";
                e.currentTarget.style.transform = "scale(1)";
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default SliderAnuncios;
