import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Estilos para scrollbar personalizado
const scrollbarStyles = `
  .gallery-scroll-desktop::-webkit-scrollbar {
    width: 6px;
  }
  .gallery-scroll-desktop::-webkit-scrollbar-track {
    background: #f7fafc;
    border-radius: 3px;
  }
  .gallery-scroll-desktop::-webkit-scrollbar-thumb {
    background: #cbd5e0;
    border-radius: 3px;
  }
  .gallery-scroll-desktop::-webkit-scrollbar-thumb:hover {
    background: #a0aec0;
  }
`;

function GaleriaImagenes({
  imagenes,
  imagenPrincipal,
  videos,
  nombreProducto,
  onImageClick,
}) {
  // Separar imágenes y videos
  const soloImagenes = (imagenes || []).map((img) => ({
    url: img,
    type: "image",
  }));
  const soloVideos = (videos || []).map((vid) => ({ url: vid, type: "video" }));
  const todosLosMedias = [...soloImagenes, ...soloVideos];

  const [mediaActivo, setMediaActivo] = useState(0);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [zoomVisible, setZoomVisible] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isMobile, setIsMobile] = useState(false);
  const [tabActiva, setTabActiva] = useState("imagenes"); // 'imagenes' o 'videos'
  const zoomRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      // Solo desktop real (≥1600px) usa vista normal
      // Todo lo demás (tablets, móviles, 700-1599px) usa vista con pestañas
      setIsMobile(window.innerWidth < 1600);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Medias filtrados según pestaña activa
  const mediasFiltrados =
    modalAbierto && isMobile
      ? tabActiva === "imagenes"
        ? soloImagenes
        : soloVideos
      : todosLosMedias;

  // Índice activo local para modal
  const [indiceModalActivo, setIndiceModalActivo] = useState(0);

  const handleMouseMove = (e) => {
    const bounds = zoomRef.current.getBoundingClientRect();
    const x = ((e.clientX - bounds.left) / bounds.width) * 100;
    const y = ((e.clientY - bounds.top) / bounds.height) * 100;
    setZoomPosition({ x, y });
  };

  const handleMouseEnter = () => setZoomVisible(true);
  const handleMouseLeave = () => setZoomVisible(false);

  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const thumbnailsRef = useRef(null);

  // Actualizar estado de flechas de scroll
  useEffect(() => {
    const updateScrollButtons = () => {
      const container = thumbnailsRef.current;
      if (!container) return;

      const { scrollTop, scrollHeight, clientHeight } = container;
      setCanScrollUp(scrollTop > 5);
      setCanScrollDown(scrollTop < scrollHeight - clientHeight - 5);
    };

    const container = thumbnailsRef.current;
    if (container) {
      updateScrollButtons();
      container.addEventListener("scroll", updateScrollButtons);
      window.addEventListener("resize", updateScrollButtons);

      return () => {
        container.removeEventListener("scroll", updateScrollButtons);
        window.removeEventListener("resize", updateScrollButtons);
      };
    }
  }, [todosLosMedias]);

  const scrollThumbnails = (direction) => {
    const container = thumbnailsRef.current;
    if (!container) return;

    const scrollAmount = direction === "up" ? -100 : 100;
    container.scrollBy({ top: scrollAmount, behavior: "smooth" });
  };

  return (
    <>
      {/* Inyectar estilos de scrollbar */}
      <style>{scrollbarStyles}</style>

      {/* Layout estilo Amazon: Miniaturas IZQUIERDA + Imagen Principal DERECHA (Desktop) */}
      {/* En móvil/tablet: Layout vertical con miniaturas horizontales abajo */}
      <div className="w-full flex flex-col lg:flex-row gap-4 relative bg-white">
        {/* MINIATURAS A LA IZQUIERDA (solo desktop >= 1024px) */}
        {todosLosMedias.length > 1 && (
          <div
            className="hidden lg:block relative flex-shrink-0"
            style={{ width: "80px" }}
          >
            {/* Flecha ARRIBA - solo desktop */}
            {canScrollUp && (
              <button
                onClick={() => scrollThumbnails("up")}
                className="absolute top-0 left-0 right-0 z-10 bg-white/90 hover:bg-white border border-gray-200 h-8 flex items-center justify-center transition-all"
                aria-label="Anterior"
              >
                <svg
                  className="w-4 h-4 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              </button>
            )}

            {/* Contenedor de miniaturas con scroll */}
            <div
              ref={thumbnailsRef}
              className="flex flex-col gap-2 overflow-y-auto gallery-scroll-desktop"
              style={{
                maxHeight: "500px",
                scrollbarWidth: "thin",
                scrollbarColor: "#cbd5e0 #f7fafc",
              }}
            >
              {todosLosMedias.map((media, index) => (
                <button
                  key={index}
                  onClick={() => setMediaActivo(index)}
                  className={`w-full aspect-square rounded overflow-hidden border-2 transition-all flex-shrink-0 ${
                    index === mediaActivo
                      ? "border-[#007185] ring-1 ring-[#007185]"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {media.type === "video" ? (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center relative">
                      <svg
                        className="w-8 h-8 text-gray-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  ) : (
                    <img
                      src={media.url}
                      alt={`Miniatura ${index + 1}`}
                      className="w-full h-full object-contain bg-white"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Flecha ABAJO - solo desktop */}
            {canScrollDown && (
              <button
                onClick={() => scrollThumbnails("down")}
                className="absolute bottom-0 left-0 right-0 z-10 bg-white/90 hover:bg-white border border-gray-200 h-8 flex items-center justify-center transition-all"
                aria-label="Siguiente"
              >
                <svg
                  className="w-4 h-4 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* IMAGEN PRINCIPAL A LA DERECHA */}
        <div className="flex-1 flex items-start justify-center lg:justify-start">
          <div
            className="relative w-full max-w-[600px]"
            ref={zoomRef}
            onClick={() => {
              if (onImageClick) {
                onImageClick(mediaActivo);
              } else {
                setModalAbierto(true);
              }
            }}
            onMouseMove={window.innerWidth >= 1600 ? handleMouseMove : null}
            onMouseEnter={window.innerWidth >= 1600 ? handleMouseEnter : null}
            onMouseLeave={window.innerWidth >= 1600 ? handleMouseLeave : null}
          >
            {/* Mostrar imagen o video */}
            {todosLosMedias[mediaActivo]?.type === "image" ? (
              <img
                src={todosLosMedias[mediaActivo].url}
                alt={`${nombreProducto} - Media ${mediaActivo + 1}`}
                className="w-full aspect-square object-contain bg-white rounded"
              />
            ) : (
              <div className="w-full aspect-square bg-black rounded flex items-center justify-center">
                <video
                  controls
                  className="max-w-full max-h-full rounded"
                  preload="metadata"
                  poster={imagenPrincipal}
                >
                  <source
                    src={todosLosMedias[mediaActivo]?.url}
                    type="video/mp4"
                  />
                  Tu navegador no soporta el elemento de video.
                </video>
              </div>
            )}

            {/* Zoom overlay (solo computadoras reales ≥1600px y solo para imágenes) */}
            {zoomVisible &&
              window.innerWidth >= 1600 &&
              todosLosMedias[mediaActivo]?.type === "image" && (
                <div
                  className="absolute inset-0 bg-white/10 cursor-zoom-in rounded"
                  style={{
                    backgroundImage: `url(${todosLosMedias[mediaActivo].url})`,
                    backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    backgroundSize: "200%",
                    backgroundRepeat: "no-repeat",
                  }}
                />
              )}
          </div>
        </div>

        {/* MINIATURAS HORIZONTALES ABAJO (solo móvil/tablet < 1024px) */}
        {todosLosMedias.length > 1 && (
          <div
            className="lg:hidden w-full overflow-x-auto pb-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <style>{`.lg\\:hidden::-webkit-scrollbar { display: none; }`}</style>
            <div className="flex gap-2 px-2">
              {todosLosMedias.map((media, index) => (
                <button
                  key={index}
                  onClick={() => setMediaActivo(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all ${
                    index === mediaActivo
                      ? "border-[#007185] ring-1 ring-[#007185]"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {media.type === "video" ? (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center relative">
                      <svg
                        className="w-6 h-6 text-gray-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  ) : (
                    <img
                      src={media.url}
                      alt={`Miniatura ${index + 1}`}
                      className="w-full h-full object-contain bg-white"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal - Desktop fullscreen / Tablet-Móvil con pestañas */}
      <AnimatePresence>
        {modalAbierto && (
          <motion.div
            className="fixed inset-0 bg-black z-50 flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Header con botón cerrar */}
            <div className="flex items-center justify-between p-4 bg-black/90">
              <h2 className="text-white text-lg font-semibold">
                {nombreProducto || "Producto"}
              </h2>
              <button
                onClick={() => setModalAbierto(false)}
                className="text-white hover:text-gray-300 text-3xl w-10 h-10 flex items-center justify-center"
              >
                ×
              </button>
            </div>

            {/* Pestañas - Solo en tablet/móvil */}
            {isMobile && (soloImagenes.length > 0 || soloVideos.length > 0) && (
              <div className="flex border-b border-gray-700 bg-black/90">
                {soloImagenes.length > 0 && (
                  <button
                    onClick={() => {
                      setTabActiva("imagenes");
                      setIndiceModalActivo(0);
                    }}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${
                      tabActiva === "imagenes"
                        ? "text-blue-500 border-b-2 border-blue-500"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Imágenes ({soloImagenes.length})
                  </button>
                )}
                {soloVideos.length > 0 && (
                  <button
                    onClick={() => {
                      setTabActiva("videos");
                      setIndiceModalActivo(0);
                    }}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${
                      tabActiva === "videos"
                        ? "text-blue-500 border-b-2 border-blue-500"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Videos ({soloVideos.length})
                  </button>
                )}
              </div>
            )}

            {/* Contenedor principal */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-hidden">
              {/* Imagen/Video principal */}
              <div
                className="w-full max-w-4xl flex items-center justify-center mb-4"
                style={{ maxHeight: "calc(100vh - 240px)" }}
              >
                {isMobile ? (
                  // Vista tablet/móvil
                  mediasFiltrados[indiceModalActivo]?.type === "image" ? (
                    <img
                      src={mediasFiltrados[indiceModalActivo]?.url}
                      alt={`${nombreProducto} - ${indiceModalActivo + 1}`}
                      className="max-w-full max-h-full object-contain"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <video
                      controls
                      autoPlay
                      className="max-w-full max-h-full"
                      preload="metadata"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <source
                        src={mediasFiltrados[indiceModalActivo]?.url}
                        type="video/mp4"
                      />
                      Tu navegador no soporta el elemento de video.
                    </video>
                  )
                ) : // Vista desktop
                todosLosMedias[mediaActivo]?.type === "image" ? (
                  <img
                    src={todosLosMedias[mediaActivo]?.url}
                    alt="Imagen ampliada"
                    className="max-w-full max-h-full object-contain"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <video
                    controls
                    autoPlay
                    className="max-w-full max-h-full"
                    preload="metadata"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <source
                      src={todosLosMedias[mediaActivo]?.url}
                      type="video/mp4"
                    />
                    Tu navegador no soporta el elemento de video.
                  </video>
                )}
              </div>

              {/* Galería de miniaturas */}
              {(isMobile ? mediasFiltrados : todosLosMedias).length > 1 && (
                <div
                  className={`w-full max-w-4xl ${
                    isMobile
                      ? "overflow-x-auto pb-2"
                      : "overflow-y-auto max-h-40 pb-2 gallery-scroll-desktop"
                  }`}
                  style={
                    !isMobile
                      ? {
                          scrollbarWidth: "thin",
                          scrollbarColor: "#4B5563 #1F2937",
                        }
                      : {}
                  }
                >
                  <div
                    className={`flex gap-2 ${
                      isMobile
                        ? "justify-center min-w-min px-4"
                        : "flex-wrap justify-center px-4"
                    }`}
                  >
                    {(isMobile ? mediasFiltrados : todosLosMedias).map(
                      (media, index) => (
                        <button
                          key={index}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isMobile) {
                              setIndiceModalActivo(index);
                            } else {
                              setMediaActivo(index);
                            }
                          }}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                            (
                              isMobile
                                ? index === indiceModalActivo
                                : index === mediaActivo
                            )
                              ? "border-blue-500 ring-2 ring-blue-400"
                              : "border-gray-600 hover:border-gray-400"
                          }`}
                        >
                          {media.type === "video" ? (
                            <div className="w-full h-full bg-gray-800 flex items-center justify-center relative">
                              <svg
                                className="w-6 h-6 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          ) : (
                            <img
                              src={media.url}
                              alt={`Miniatura ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default GaleriaImagenes;
