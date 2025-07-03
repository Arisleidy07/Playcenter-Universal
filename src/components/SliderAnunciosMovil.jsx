import React, { useEffect, useRef } from "react";

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
  const contenedorRef = useRef(null);

  useEffect(() => {
    const contenedor = contenedorRef.current;
    if (!contenedor) return;

    const scrollStep = 250 + 8; // ancho imagen + gap
    let scrollPosition = 0;

    const intervalo = setInterval(() => {
      scrollPosition += scrollStep;

      if (scrollPosition >= contenedor.scrollWidth - contenedor.clientWidth) {
        scrollPosition = 0;
      }

      contenedor.scrollTo({ left: scrollPosition, behavior: "smooth" });
    }, 5000);

    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="block sm:block md:hidden w-full">
      <div
        ref={contenedorRef}
        className="flex space-x-2 overflow-x-auto scrollbar-hide px-3 py-4"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {imagenes.map((src, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-[250px] h-[380px] rounded-xl overflow-hidden shadow-lg bg-white scroll-snap-align-center"
          >
            <img
              src={src}
              alt={`Anuncio ${i + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default SliderAnunciosMovil;
