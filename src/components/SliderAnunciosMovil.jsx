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

    const scrollStep = 220 + 16; // ancho + gap (4 = 1rem = 16px)
    let scrollPosition = 0;

    const intervalo = setInterval(() => {
      scrollPosition += scrollStep;

      if (scrollPosition >= contenedor.scrollWidth) {
        scrollPosition = 0;
      }

      contenedor.scrollTo({ left: scrollPosition, behavior: "smooth" });
    }, 3000);

    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="block sm:block md:hidden w-full">
      <div
        ref={contenedorRef}
        className="flex space-x-4 overflow-x-auto scrollbar-hide px-4 py-4"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {imagenes.map((src, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-[220px] h-[350px] rounded-xl overflow-hidden shadow-lg bg-white scroll-snap-align-center"
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
