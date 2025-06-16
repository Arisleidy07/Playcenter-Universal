import React, { useState } from "react";
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

  const handlePrev = () => {
    setIndex((prev) => (prev === 0 ? anuncios.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setIndex((prev) => (prev === anuncios.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative w-full overflow-hidden rounded-2xl shadow-xl my-4">
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{
          transform: `translateX(-${index * 100}%)`,
          width: `${anuncios.length * 100}%`,
          height: "450px", // fijo para que el slider tenga altura estable
        }}
      >
        {anuncios.map((item) =>
          item.isExternal ? (
            <a
              key={item.id}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex-shrink-0"
              style={{ height: "450px" }}
            >
              <img
                src={item.img}
                alt={`Anuncio ${item.id}`}
                className="w-full h-full object-cover rounded-2xl"
              />
            </a>
          ) : (
            <Link
              key={item.id}
              to={item.link}
              className="w-full flex-shrink-0"
              style={{ height: "450px" }}
            >
              <img
                src={item.img}
                alt={`Anuncio ${item.id}`}
                className="w-full h-full object-cover rounded-2xl"
              />
            </Link>
          )
        )}
      </div>

      {/* Flecha izquierda */}
      <button
        onClick={handlePrev}
        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg z-10"
      >
        <ChevronLeft className="text-gray-700 w-6 h-6" />
      </button>

      {/* Flecha derecha */}
      <button
        onClick={handleNext}
        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg z-10"
      >
        <ChevronRight className="text-gray-700 w-6 h-6" />
      </button>
    </div>
  );
}

export default SliderAnuncios;
