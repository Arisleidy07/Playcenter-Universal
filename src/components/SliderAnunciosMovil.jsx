import React from "react";

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
  return (
    <div className="block sm:hidden w-full max-w-[600px] mx-auto px-3 py-4">
      <div
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide space-x-2"
        style={{ scrollPaddingLeft: "12px", scrollPaddingRight: "12px" }}
      >
        {imagenes.map((src, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-[260px] h-[380px] rounded-xl overflow-hidden shadow-lg bg-white snap-center"
          >
            <img
              src={src}
              alt={`Anuncio ${i + 1}`}
              className="w-full h-full object-cover"
              draggable={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default SliderAnunciosMovil;
