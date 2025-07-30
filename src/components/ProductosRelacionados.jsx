import React, { useRef } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { motion } from "framer-motion";

function ProductosRelacionados({ productoActual, productosPorCategoria, onProductoClick }) {
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
    <section className="w-full pt-4 pb-10 bg-white border-t border-gray-200 mt-4">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-[#232f3e] mb-4 pl-1">
          Productos relacionados
        </h2>

        <div className="relative">
          {/* Flecha izquierda */}
          <button
            className="absolute top-1/2 -left-6 z-10 -translate-y-1/2 bg-white border border-gray-300 rounded-full shadow-lg p-3 hover:bg-gray-100 transition"
            onClick={() => scrollBy(-1)}
            aria-label="Anterior"
          >
            <FaChevronLeft size={24} className="text-[#232f3e]" />
          </button>

          {/* Contenedor scroll horizontal */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-4 px-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 scroll-smooth"
            style={{
              scrollBehavior: "smooth",
              minHeight: "300px",
              scrollSnapType: "x mandatory",
            }}
          >
            {relacionados.length > 0 ? (
              relacionados.map((rel) => (
                <motion.div
                  key={rel.id}
                  whileHover={{ scale: 1.06, boxShadow: "0 8px 36px #00000022" }}
                  className="flex flex-col min-w-[180px] max-w-[220px] w-[65vw] sm:min-w-[220px] sm:w-[220px] md:w-[250px] lg:w-[270px] bg-white rounded-xl border border-gray-200 overflow-hidden shadow transition cursor-pointer scroll-snap-align-start"
                  onClick={() =>
                    onProductoClick
                      ? onProductoClick(rel.id)
                      : window.location.assign(`/producto/${rel.id}`)
                  }
                  style={{ scrollSnapAlign: "start" }}
                >
                  <div className="relative w-full h-[140px] sm:h-[160px] bg-gray-50 flex items-center justify-center">
                    <img
                      src={rel.imagen || rel.imagenes?.[0]}
                      alt={rel.nombre}
                      className="max-w-full max-h-[140px] sm:max-h-[160px] object-contain"
                    />
                  </div>
                  <div className="flex flex-col px-5 pt-3 pb-5">
                    <h3 className="text-base font-semibold text-gray-800 line-clamp-2 mb-2 min-h-[40px]">
                      {rel.nombre}
                    </h3>
                    <p className="text-[#FF9900] font-bold text-xl mb-3">
                      DOP {rel.precio.toFixed(2)}
                    </p>
                    <button
                      className="bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg py-2 text-base font-semibold w-full shadow transition"
                      tabIndex={-1}
                    >
                      Ver producto
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

          {/* Flecha derecha */}
          <button
            className="absolute top-1/2 -right-6 z-10 -translate-y-1/2 bg-white border border-gray-300 rounded-full shadow-lg p-3 hover:bg-gray-100 transition"
            onClick={() => scrollBy(1)}
            aria-label="Siguiente"
          >
            <FaChevronRight size={24} className="text-[#232f3e]" />
          </button>
        </div>
      </div>
    </section>
  );
}

export default ProductosRelacionados;
