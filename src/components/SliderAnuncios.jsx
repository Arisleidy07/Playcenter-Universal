import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const anuncios = [
  { id: 1, img: "/ads/1.png", link: "/productos/consolas", isExternal: false },
  { id: 2, img: "/ads/2.png", link: "https://maps.app.goo.gl/ZSXza3ESVeLEPPx78", isExternal: true },
  { id: 3, img: "/ads/3.png", link: "/productos/videojuegos", isExternal: false },
  { id: 4, img: "/ads/5.png", link: "/productos/ofertas-especiales", isExternal: false },
  { id: 5, img: "/ads/4.png", link: "/productos", isExternal: false },
];

function SliderAnuncios() {
  const [index, setIndex] = useState(0);
  const timeoutRef = useRef(null);
  const delay = 5000;

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
      className="relative w-full max-w-[1600px] mx-auto overflow-hidden rounded-b-2xl select-none"
      style={{ height: "300px" }}
      onMouseEnter={() => clearTimeout(timeoutRef.current)}
      onMouseLeave={() => {
        timeoutRef.current = setTimeout(() => {
          setIndex((prev) => (prev === anuncios.length - 1 ? 0 : prev + 1));
        }, delay);
      }}
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
              className="flex-shrink-0 w-full"
              style={{ width: `${100 / anuncios.length}%` }}
            >
              <img
                src={item.img}
                alt={`Anuncio ${item.id}`}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </a>
          ) : (
            <Link
              key={item.id}
              to={item.link}
              className="flex-shrink-0 w-full"
              style={{ width: `${100 / anuncios.length}%` }}
            >
              <img
                src={item.img}
                alt={`Anuncio ${item.id}`}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </Link>
          )
        )}
      </div>

      {/* Flechas */}
      <button
        onClick={handlePrev}
        className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/40 hover:bg-black/70 rounded-full p-3 z-20 transition"
        aria-label="Anterior"
      >
        <ChevronLeft className="text-white w-7 h-7" />
      </button>
      <button
        onClick={handleNext}
        className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/40 hover:bg-black/70 rounded-full p-3 z-20 transition"
        aria-label="Siguiente"
      >
        <ChevronRight className="text-white w-7 h-7" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
        {anuncios.map((_, idx) => (
          <button
            key={idx}
            className={`w-3 h-3 rounded-full ${
              idx === index ? "bg-white opacity-90" : "bg-white opacity-40"
            }`}
            onClick={() => {
              clearTimeout(timeoutRef.current);
              setIndex(idx);
            }}
            aria-label={`Ir al slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default SliderAnuncios;
