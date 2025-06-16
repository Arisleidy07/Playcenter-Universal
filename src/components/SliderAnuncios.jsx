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

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setIndex((prev) => (prev === anuncios.length - 1 ? 0 : prev + 1));
    }, delay);
    return () => clearTimeout(timeoutRef.current);
  }, [index]);

  const handlePrev = () => {
    clearTimeout(timeoutRef.current);
    setIndex((prev) => (prev === 0 ? anuncios.length - 1 : prev - 1));
  };

  const handleNext = () => {
    clearTimeout(timeoutRef.current);
    setIndex((prev) => (prev === anuncios.length - 1 ? 0 : prev + 1));
  };

  return (
    <div
      className="relative max-w-[1280px] mx-auto rounded-xl shadow-lg overflow-hidden"
      style={{ aspectRatio: "16 / 9", maxHeight: "720px" }}
      onMouseEnter={() => clearTimeout(timeoutRef.current)}
      onMouseLeave={() => {
        timeoutRef.current = setTimeout(() => {
          setIndex((prev) => (prev === anuncios.length - 1 ? 0 : prev + 1));
        }, delay);
      }}
    >
      <div
        className="flex transition-transform duration-700 ease-in-out h-full"
        style={{ width: `${anuncios.length * 100}%`, transform: `translateX(-${index * (100 / anuncios.length)}%)` }}
      >
        {anuncios.map((item) =>
          item.isExternal ? (
            <a
              key={item.id}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0"
              style={{ width: `${100 / anuncios.length}%` }}
            >
              <img
                src={item.img}
                alt={`Anuncio ${item.id}`}
                className="w-full h-full object-contain rounded-xl bg-white"
                loading="lazy"
              />
            </a>
          ) : (
            <Link
              key={item.id}
              to={item.link}
              className="flex-shrink-0"
              style={{ width: `${100 / anuncios.length}%` }}
            >
              <img
                src={item.img}
                alt={`Anuncio ${item.id}`}
                className="w-full h-full object-contain rounded-xl bg-white"
                loading="lazy"
              />
            </Link>
          )
        )}
      </div>

      {/* Flechas */}
      <button
        onClick={handlePrev}
        className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg z-10"
        aria-label="Anterior"
      >
        <ChevronLeft className="text-gray-700 w-8 h-8" />
      </button>
      <button
        onClick={handleNext}
        className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg z-10"
        aria-label="Siguiente"
      >
        <ChevronRight className="text-gray-700 w-8 h-8" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-3">
        {anuncios.map((_, idx) => (
          <button
            key={idx}
            className={`w-3 h-3 rounded-full ${idx === index ? "bg-gray-800" : "bg-gray-400"}`}
            aria-label={`Ir al slide ${idx + 1}`}
            onClick={() => {
              clearTimeout(timeoutRef.current);
              setIndex(idx);
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default SliderAnuncios;
