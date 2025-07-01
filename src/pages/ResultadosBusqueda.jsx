import React from "react";
import { useLocation } from "react-router-dom";
import productosAll from "../data/productosAll";
import TarjetaProducto from "../components/TarjetaProducto";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ResultadosBusqueda() {
  const query = useQuery();
  const termino = query.get("q")?.toLowerCase() || "";

  // Buscar en todos los productos
  const todos = productosAll.flatMap((cat) => cat.productos);
  const coincidencias = todos.filter((producto) =>
    producto.nombre.toLowerCase().includes(termino)
  );

  return (
    <main className="min-h-screen bg-white px-4 py-10 text-gray-800">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">
        Resultados para: <span className="text-[#4FC3F7]">"{termino}"</span>
      </h1>

      {coincidencias.length > 0 ? (
        <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6 max-w-[1600px] mx-auto">
          {coincidencias.map((producto) => (
            <TarjetaProducto key={producto.id} producto={producto} />
          ))}
        </section>
      ) : (
        <p className="text-center text-gray-600 mt-16 text-lg">
          No se encontraron productos que coincidan con tu búsqueda.
        </p>
      )}
    </main>
  );
}
