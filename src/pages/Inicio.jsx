import React from "react";
import { Link } from "react-router-dom";

function Inicio() {
  return (
    <div className="min-h-screen pt-24 bg-gradient-to-br from-white to-slate-100 text-gray-800 font-sans">
      
      {/* Sección principal de bienvenida */}
      <section className="text-center px-4 md:px-12">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-indigo-600 to-blue-400 text-transparent bg-clip-text animate-pulse">
          Bienvenidos a Playcenter Universal
        </h1>
        <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto">
          Tu universo de tecnología, innovación y estilo. Donde cada clic es una aventura.
        </p>
        <div className="flex justify-center gap-6 flex-wrap">
          <Link
            to="/productos"
            className="bg-blue-600 hover:bg-blue-800 text-white px-8 py-3 rounded-full shadow-md transition duration-300"
          >
            Explorar Productos
          </Link>
          <Link
            to="/productos/ofertas-especiales"
            className="bg-white text-blue-700 px-8 py-3 rounded-full border border-blue-600 hover:bg-blue-100 transition duration-300"
          >
            Ver Ofertas
          </Link>
        </div>
      </section>

      {/* Sección de características */}
      <section className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 px-6 md:px-20">
        <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition duration-300">
          <h2 className="text-2xl font-bold text-blue-600 mb-4">🚀 Tecnología Avanzada</h2>
          <p>Productos de última generación con diseño impactante y rendimiento de otro mundo.</p>
        </div>
        <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition duration-300">
          <h2 className="text-2xl font-bold text-green-600 mb-4">🎨 Estilo Inigualable</h2>
          <p>Cada producto tiene un diseño cuidadosamente seleccionado para destacar.</p>
        </div>
        <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition duration-300">
          <h2 className="text-2xl font-bold text-purple-600 mb-4">✅ Calidad Garantizada</h2>
          <p>Ofrecemos productos originales, potentes y listos para impresionar.</p>
        </div>
      </section>
    </div>
  );
}

export default Inicio;
