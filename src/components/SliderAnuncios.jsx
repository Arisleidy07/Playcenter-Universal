import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const anuncios = [
  {
    id: 1,
    img: "/ads/consolas.png",
    link: "/consolas",
    isExternal: false,
  },
  {
    id: 2,
    img: "/ads/ubicacion.png",
    link: "https://maps.app.goo.gl/ZSXza3ESVeLEPPx78",
    isExternal: true,
  },
  {
    id: 3,
    img: "/ads/videojuegos.png",
    link: "/videojuegos",
    isExternal: false,
  },
  {
    id: 4,
    img: "/ads/verofertas.png",
    link: "/ofertas-especiales",
    isExternal: false,
  },
  {
    id: 5,
    img: "/ads/productos.png",
    link: "/nuevos-lanzamientos",
    isExternal: false,
  },
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
      className="relative mx-auto my-6 max-w-[1280px] w-full overflow-hidden rounded-xl shadow-lg bg-neutral"
      style={{ aspectRatio: "16 / 9", maxHeight: "720px" }}
      onMouseEnter={resetTimeout}
      onMouseLeave={() => {
        timeoutRef.current = setTimeout(() => {
          setIndex((prev) => (prev === anuncios.length - 1 ? 0 : prev + 1));
        }, delay);
      }}
    >
      <div
        className="flex transition-transform duration-700 ease-in-out h-full"
        style={{
          transform: `translateX(-${index * 100}%)`,
          width: `${anuncios.length * 100}%`,
        }}
      >
        {anuncios.map((item) => {
          const SlideTag = item.isExternal ? "a" : Link;
          const props = item.isExternal
            ? {
                href: item.link,
                target: "_blank",
                rel: "noopener noreferrer",
              }
            : { to: item.link };

          return (
            <SlideTag
              key={item.id}
              {...props}
              className="min-w-full h-full flex-shrink-0"
            >
              <img
                src={item.img}
                alt={`Anuncio ${item.id}`}
                className="w-full h-full object-cover transition-opacity duration-500 bg-neutral-100"
                loading="lazy"
              />
            </SlideTag>
          );
        })}
      </div>

      {/* Flechas */}
      <button
        onClick={handlePrev}
        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg z-10"
        aria-label="Anterior"
      >
        <ChevronLeft className="text-gray-700 w-8 h-8" />
      </button>

      <button
        onClick={handleNext}
        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg z-10"
        aria-label="Siguiente"
      >
        <ChevronRight className="text-gray-700 w-8 h-8" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {anuncios.map((_, idx) => (
          <button
            key={idx}
            className={`w-3 h-3 rounded-full ${
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

