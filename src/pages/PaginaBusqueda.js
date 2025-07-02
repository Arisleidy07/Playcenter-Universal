// src/pages/PaginaBusqueda.js
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import productos from "../data/productos.json"; // Cambia según tu fuente
import { normalizarTexto } from "../utils/normalizarTexto";

function PaginaBusqueda() {
  const location = useLocation();
  const [resultados, setResultados] = useState([]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const queryOriginal = queryParams.get("q") || "";
    const query = normalizarTexto(queryOriginal);

    const palabras = query.split(" ");

    const filtrados = productos.filter((prod) => {
      const texto = normalizarTexto(`${prod.nombre} ${prod.descripcion}`);
      return palabras.every((palabra) => texto.includes(palabra));
    });

    setResultados(filtrados);
  }, [location.search]);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">
        Resultados de búsqueda
      </h2>

      {resultados.length === 0 ? (
        <p>No se encontraron productos relacionados.</p>
      ) : (
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {resultados.map((item) => (
            <li key={item.id} className="border p-2 rounded-lg shadow-sm">
              <img
                src={item.imagen}
                alt={item.nombre}
                className="w-full h-32 object-cover rounded-md"
              />
              <h3 className="text-sm font-semibold mt-2">{item.nombre}</h3>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PaginaBusqueda;
