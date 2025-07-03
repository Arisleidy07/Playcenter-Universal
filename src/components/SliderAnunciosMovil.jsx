import React, { useState, useEffect } from "react";

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

  // Auto-slide cada 4 segundos
  useEffect(() => {
    const intervalo = setInterval(() => {
      siguiente();
    }, 4000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="block md:hidden w-full max-w-[480px] mx-auto px-3">
      <div className="relative rounded-2xl overflow-hidden shadow-lg">
        {imagenes.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`Anuncio ${index + 1}`}
            className={`w-full h-[180px] object-cover transition-opacity duration-700 ease-in-out ${
              index === actual ? "opacity-100" : "opacity-0 absolute top-0 left-0"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default SliderAnunciosMovil;
