import React, { useState } from "react";

const imagenes = [
  "/ads/movil/articulosads.png",
  "/ads/movil/camarasads.png",
  "/ads/movil/consolaads.png",
  "/ads/movil/ofertas.png",
  "/ads/movil/productosads.png",
  "/ads/movil/retroads.png",
  "/ads/movil/ubicacionads.png",
];

function SliderAnunciosMovil() {
  const [actual, setActual] = useState(0);

  const siguiente = () => {
    setActual((prev) => (prev === imagenes.length - 1 ? 0 : prev + 1));
  };

  const anterior = () => {
    setActual((prev) => (prev === 0 ? imagenes.length - 1 : prev - 1));
  };

  return (
    <div className="relative w-full">
      {/* Slider */}
      <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
        {imagenes.map((src, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-full snap-center"
          >
            <img
              src={src}
              alt={`Anuncio ${i + 1}`}
              className="w-full h-auto object-cover"
            />
          </div>
        ))}
      </div>
      {/* Flechas opcionales (ocultas en móvil) */}
      <button
        onClick={anterior}
        className="hidden sm:flex absolute top-1/2 left-2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
      >
        ◀
      </button>
      <button
        onClick={siguiente}
        className="hidden sm:flex absolute top-1/2 right-2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
      >
        ▶
      </button>
    </div>
  );
}

export default SliderAnunciosMovil;
