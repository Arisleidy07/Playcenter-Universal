import React, { useRef } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { motion } from "framer-motion";

function ProductosRelacionados({
  productoActual,
  productosPorCategoria,
  onProductoClick,
}) {
  const productosPlanos = productosPorCategoria.flatMap((grupo) =>
    grupo.productos.map((p) => ({
      ...p,
      categoria: grupo.categoria?.trim().toLowerCase(),
    }))
  );

  const categoriaActual = productoActual.categoria?.trim().toLowerCase();

  const relacionados = productosPlanos
    .filter(
      (p) =>
        p.id !== productoActual.id &&
        p.categoria === categoriaActual &&
        categoriaActual !== "todos los productos"
    )
    .slice(0, 1000);

  const scrollRef = useRef(null);

  const scrollBy = (dir) => {
    const el = scrollRef.current;
    if (el && el.firstChild) {
      const cardWidth = el.firstChild.offsetWidth;
      const gap = 24;
      const scrollAmount = dir * (cardWidth + gap);
      el.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className="w-full pt-6 pb-12 bg-white border-t border-gray-200 mt-6 overflow-visible">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-[#232f3e] mb-4 pl-1 tracking-tight">
          Productos relacionados
        </h2>

        <div className="relative overflow-visible">
          {/* Flecha izquierda (solo desktop) */}
          <button
            className="hidden lg:flex absolute top-1/2 -left-6 z-20 -translate-y-1/2 bg-white border border-gray-300 rounded-full shadow-lg p-3 hover:bg-gray-100 transition"
            onClick={() => scrollBy(-1)}
            aria-label="Anterior"
          >
            <FaChevronLeft size={22} className="text-[#232f3e]" />
          </button>

          {/* Contenedor scroll horizontal */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto overflow-y-visible pb-4 px-1 scroll-smooth snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
            style={{ minHeight: "280px" }}
          >
            {relacionados.length > 0 ? (
              relacionados.map((rel) => (
                <motion.div
                  key={rel.id}
                  whileHover={{
                    scale: 1.03, // más sutil
                    y: -4, // sube poquito
                    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                    zIndex: 20,
                    position: "relative",
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="flex flex-col min-w-[160px] max-w-[200px] w-[60vw] sm:w-[200px] md:w-[220px] lg:w-[240px] bg-white rounded-2xl border border-gray-200 shadow-md cursor-pointer snap-start overflow-visible"
                  onClick={() =>
                    onProductoClick
                      ? onProductoClick(rel.id)
                      : window.location.assign(`/producto/${rel.id}`)
                  }
                >
                  {/* Imagen */}
                  <div className="relative w-full h-[140px] sm:h-[160px] bg-gray-50 flex items-center justify-center p-2 overflow-visible">
                    <img
                      src={rel.imagen || rel.imagenes?.[0]}
                      alt={rel.nombre}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>

                  {/* Contenido */}
                  <div className="flex flex-col px-3 pt-2 pb-4 flex-1">
                    <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-3 min-h-[36px]">
                      {rel.nombre}
                    </h3>
                    <button
                      className="button whitespace-nowrap px-3 py-1.5 text-xs font-semibold self-start"
                      tabIndex={-1}
                    >
                      Ver producto
                      <svg
                        className="icon w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12 2.25c-5.385 0-9.75 4.365-9.75 
                          9.75s4.365 9.75 9.75 9.75 9.75-4.365 
                          9.75-9.75S17.385 2.25 12 2.25zm4.28 
                          10.28a.75.75 0 000-1.06l-3-3a.75.75 
                          0 10-1.06 1.06l1.72 1.72H8.25a.75.75 
                          0 000 1.5h5.69l-1.72 1.72a.75.75 0 
                          101.06 1.06l3-3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-10 w-full">
                No hay productos relacionados en esta categoría.
              </div>
            )}
          </div>

          {/* Flecha derecha (solo desktop) */}
          <button
            className="hidden lg:flex absolute top-1/2 -right-6 z-20 -translate-y-1/2 bg-white border border-gray-300 rounded-full shadow-lg p-3 hover:bg-gray-100 transition"
            onClick={() => scrollBy(1)}
            aria-label="Siguiente"
          >
            <FaChevronRight size={22} className="text-[#232f3e]" />
          </button>
        </div>
      </div>
    </section>
  );
}

export default ProductosRelacionados;
