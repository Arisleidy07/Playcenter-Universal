import React from "react";
import { Link } from "react-router-dom";

function SliderProductos({ productos }) {
  return (
    <div className="overflow-x-auto whitespace-nowrap scrollbar-hide px-2">
      <div className="flex gap-4">
        {productos.map((prod) => (
          <div
            key={prod.id}
            className="inline-block bg-white rounded-xl shadow w-[180px] md:w-[220px] p-2 hover:scale-105 transition-transform"
          >
            <Link to={`/producto/${prod.id}`}>
              <img
                src={prod.imagen}
                alt={prod.nombre}
                className="w-full h-32 object-contain"
              />
              <h3 className="text-sm font-semibold mt-2 truncate">{prod.nombre}</h3>
              <p className="text-gray-800 font-bold text-md">${prod.precio}</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SliderProductos;
