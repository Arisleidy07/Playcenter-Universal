import React from "react";
import { Link } from "react-router-dom";
import "../styles/blobCard.css";
import productosAll from "../data/productosAll";
import BotonFavorito from "../components/BotonFavorito";


function ProductosTodos() {
  const productos = productosAll.flatMap((cat) =>
    cat.productos.map((prod) => ({
      ...prod,
      categoria: cat.categoria,
    }))
  );

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {productos.map((producto) => (
          <Link
            to={`/producto/${producto.id}`}
            key={producto.id}
            className="card transform transition-transform duration-300 hover:scale-105"
          >
            <div className="bg"></div>
            <div className="blob"></div>
            <div className="absolute top-2 right-2 z-20">
              <BotonFavorito producto={producto} />
            </div>

            <img
              src={producto.imagen}
              alt={producto.nombre}
              className="z-10 w-32 h-32 object-contain mx-auto"
            />
            <h2 className="z-10 mt-4 font-semibold text-gray-800 text-center">
              {producto.nombre}
            </h2>
            <p className="z-10 text-pink-600 font-bold text-center">
              ${producto.precio}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default ProductosTodos;
