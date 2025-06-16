import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const anuncios = [
  {
    id: 1,
    img: "/ads/nuestrasconsolas.png",
    link: "/consolas",
    isExternal: false,
  },
  {
    id: 2,
    img: "/ads/nuestraubicacion.png",
    // Link directo a Google Maps
    link: "https://maps.app.goo.gl/ZSXza3ESVeLEPPx78",
    isExternal: true,
  },
  {
    id: 3,
    img: "/ads/nuestrosvideojuegos.png",
    link: "/videojuegos",
    isExternal: false,
  },
  {
    id: 4,
    img: "/ads/nuevoslanzamientos.png",
    link: "/nuevos-lanzamientos",
    isExternal: false,
  },
  {
    id: 5,
    img: "/ads/ofertasespeciales.png",
    link: "/ofertas-especiales",
    isExternal: false,
  },
  {
    id: 6,
    img: "/ads/relojesinteligentes.png",
    link: "/relojes-inteligentes",
    isExternal: false,
  },
  {
    id: 7,
    img: "/ads/smarttv.png",
    link: "/smart-tv",
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
        }}
      >
        {anuncios.map((item) =>
          item.isExternal ? (
            // Link externo abre en pestaña nueva
            <a
              key={item.id}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex-shrink-0"
            >
              <img
                src={item.img}
                alt={`Anuncio ${item.id}`}
                className="w-full object-cover h-[250px] sm:h-[350px] md:h-[450px]"
              />
            </a>
          ) : (
            // Link interno usa react-router Link
            <Link key={item.id} to={item.link} className="w-full flex-shrink-0">
              <img
                src={item.img}
                alt={`Anuncio ${item.id}`}
                className="w-full object-cover h-[250px] sm:h-[350px] md:h-[450px]"
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
