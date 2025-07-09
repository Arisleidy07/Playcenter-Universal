import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const anuncios = [
  { id: 1, img: "/ads/1.png", link: "/productos/consolas", isExternal: false },
  { id: 6, img: "/ads/6.png", link: "https://playcenterwisp.com", isExternal: true },
  { id: 2, img: "/ads/2.png", link: "https://maps.app.goo.gl/ZSXza3ESVeLEPPx78", isExternal: true },
  { id: 3, img: "/ads/3.png", link: "/productos/videojuegos", isExternal: false },
  { id: 4, img: "/ads/5.png", link: "/productos/ofertas-especiales", isExternal: false },
  { id: 5, img: "/ads/4.png", link: "/productos", isExternal: false },

];

function SliderAnuncios() {
  const [index, setIndex] = useState(0);
  const timeoutRef = useRef(null);
  const delay = 6000;

  const resetAutoplay = useCallback(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIndex((prev) => (prev + 1) % anuncios.length);
    }, delay);
  }, []);

  useEffect(() => {
    resetAutoplay();
    return () => clearTimeout(timeoutRef.current);
  }, [index, resetAutoplay]);

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
        onClick={handlePrev}
        className="absolute top-1/2 left-2 sm:left-4 -translate-y-1/2 bg-black/40 hover:bg-black/60 backdrop-blur rounded-full p-1.5 sm:p-3 z-20 transition"
        aria-label="Anterior"
      >
        <ChevronLeft className="text-white w-4 h-4 sm:w-6 sm:h-6" />
      </button>
      <button
        onClick={handleNext}
        className="absolute top-1/2 right-2 sm:right-4 -translate-y-1/2 bg-black/40 hover:bg-black/60 backdrop-blur rounded-full p-1.5 sm:p-3 z-20 transition"
        aria-label="Siguiente"
      >
        <ChevronRight className="text-white w-4 h-4 sm:w-6 sm:h-6" />
      </button>

      {/* Indicadores */}
      <div className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {anuncios.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              clearTimeout(timeoutRef.current);
              setIndex(idx);
            }}
            aria-label={`Ir al slide ${idx + 1}`}
            className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${
              idx === index ? "bg-white opacity-90 scale-110" : "bg-white opacity-40"
            } transition`}
          />
        ))}
      </div>
    </div>
  );
}

export default SliderAnuncios;
