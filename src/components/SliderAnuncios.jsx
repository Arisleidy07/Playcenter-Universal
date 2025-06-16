import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const anuncios = [
  { id: 1, img: "/ads/consolas.png", link: "/consolas", isExternal: false },
  { id: 2, img: "/ads/ubicacion.png", link: "https://maps.app.goo.gl/ZSXza3ESVeLEPPx78", isExternal: true },
  { id: 3, img: "/ads/videojuegos.png", link: "/videojuegos", isExternal: false },
  { id: 4, img: "/ads/verofertas.png", link: "/ofertas-especiales", isExternal: false },
  { id: 5, img: "/ads/productos.png", link: "/nuevos-lanzamientos", isExternal: false },
];

function SliderAnuncios() {
  const [index, setIndex] = useState(0);
  const timeoutRef = useRef(null);
  const delay = 4000;

  const resetTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  useEffect(() => {
    resetTimeout();
    timeoutRef.current = setTimeout(() => {
      setIndex((prev) => (prev === anuncios.length - 1 ? 0 : prev + 1));
    }, delay);

    return () => resetTimeout();
  }, [index]);

  const handlePrev = () => {
    resetTimeout();
    setIndex((prev) => (prev === 0 ? anuncios.length - 1 : prev - 1));
  };

  const handleNext = () => {
    resetTimeout();
    setIndex((prev) => (prev === anuncios.length - 1 ? 0 : prev + 1));
  };

  return (
    <div
      className="relative mx-auto my-6 w-full max-w-[1280px] rounded-xl shadow-lg overflow-hidden"
      style={{ aspectRatio: "16 / 9", maxHeight: "720px", minHeight: "300px" }}
      onMouseEnter={resetTimeout}
      onMouseLeave={() => {
        timeoutRef.current = setTimeout(() => {
          setIndex((prev) => (prev === anuncios.length - 1 ? 0 : prev + 1));
        }, delay);
      }}
    >
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
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
              className="flex-shrink-0 w-full h-full"
            >
              <img
                src={item.img}
                alt={`Anuncio ${item.id}`}
                className="w-full h-full object-cover rounded-xl"
                loading="lazy"
                draggable={false}
              />
            </a>
          ) : (
            <Link
              key={item.id}
              to={item.link}
              className="flex-shrink-0 w-full h-full"
            >
              <img
                src={item.img}
                alt={`Anuncio ${item.id}`}
                className="w-full h-full object-cover rounded-xl"
                loading="lazy"
                draggable={false}
              />
            </Link>
          )
        )}
      </div>

      {/* Flechas */}
      <button
        onClick={handlePrev}
        className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-lg hover:bg-white transition z-20"
        aria-label="Anterior"
      >
        <ChevronLeft className="w-7 h-7 text-gray-700" />
      </button>
      <button
        onClick={handleNext}
        className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-lg hover:bg-white transition z-20"
        aria-label="Siguiente"
      >
        <ChevronRight className="w-7 h-7 text-gray-700" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 space-x-3">
        {anuncios.map((_, idx) => (
          <button
            key={idx}
            className={`h-3 w-3 rounded-full transition-colors ${
              idx === index ? "bg-gray-800" : "bg-gray-400"
            }`}
            aria-label={`Ir al slide ${idx + 1}`}
            onClick={() => {
              resetTimeout();
              setIndex(idx);
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default SliderAnuncios;
