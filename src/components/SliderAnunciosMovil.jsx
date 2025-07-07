import React from "react";


const anuncios = [
  { id: 1, img: "/ads/movil/articulosads.png", link: "/productos/consolas", isExternal: false },
  { id: 2, img: "/ads/movil/camarasads.png", link: "https://maps.app.goo.gl/ZSXza3ESVeLEPPx78", isExternal: true },
  { id: 3, img: "/ads/movil/consolaads.png", link: "/productos/consolas", isExternal: false },
  { id: 4, img: "/ads/movil/ofertas.png", link: "/productos/ofertas-especiales", isExternal: false },
  { id: 5, img: "/ads/movil/productosads.png", link: "/productos", isExternal: false },
];

function SliderAnunciosMovil() {
  return (
    <div className="block sm:hidden w-full max-w-[600px] mx-auto px-3 py-4">
      <div
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide space-x-3"
        style={{ scrollPaddingLeft: "12px", scrollPaddingRight: "12px" }}
      >
        {anuncios.map((anuncio) => (
          <a
            key={anuncio.id}
            href={anuncio.link}
            target={anuncio.isExternal ? "_blank" : "_self"}
            rel="noreferrer"
            className="flex-shrink-0 w-[300px] h-[420px] rounded-xl overflow-hidden shadow-lg bg-white snap-center"
          >
            <img
              src={anuncio.img}
              alt={`Anuncio ${anuncio.id}`}
              className="w-full h-full object-cover"
              draggable={false}
            />
          </a>
        ))}
      </div>
    </div>
  );
}

export default SliderAnunciosMovil;
