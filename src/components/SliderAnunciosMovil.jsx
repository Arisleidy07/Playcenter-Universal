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
    let scrollInterval = null;

    if (contenedor) {
      scrollInterval = setInterval(() => {
        if (
          contenedor.scrollLeft + contenedor.offsetWidth >=
          contenedor.scrollWidth
        ) {
          contenedor.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          contenedor.scrollBy({ left: 220, behavior: "smooth" });
        }
      }, 3000);
    }

    return () => clearInterval(scrollInterval);
  }, []);

  return (
    <div className="block sm:block md:hidden w-full">
      <div
        ref={contenedorRef}
        className="flex space-x-4 overflow-x-auto scrollbar-hide px-2 py-2"
      >
        {imagenes.map((src, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-[220px] h-[350px] rounded-xl overflow-hidden shadow-lg bg-white"
          >
            <img
              src={src}
              alt={`Anuncio ${i + 1}`}
              className="w-full h-full object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default SliderAnunciosMovil;
