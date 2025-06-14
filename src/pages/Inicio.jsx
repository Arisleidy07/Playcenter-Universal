import React from "react";
import { Link } from "react-router-dom";

function Inicio() {
  return (
    <div className="min-h-screen pt-24 bg-gradient-to-r from-black via-gray-900 to-black text-white font-sans">
      <section className="text-center px-4 md:px-12">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 animate-pulse bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
          Bienvenidos a Playcenter Universal
        </h1>
        <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto text-gray-300">
          Tu universo de tecnología, innovación y estilo. Donde cada clic es una aventura.
        </p>
        <div className="flex justify-center gap-6 flex-wrap">
          <Link to="/productos" className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-2xl shadow-lg hover:scale-105 hover:from-pink-500 hover:to-yellow-500 transition-transform duration-300">
            Explorar Productos
          </Link>
          <Link to="/ofertas" className="bg-white text-black px-8 py-3 rounded-2xl border border-white shadow hover:bg-yellow-300 hover:text-black transition duration-300">
            Ver Ofertas
          </Link>
        </div>
      </section>

      <section className="mt-20 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 px-6 md:px-20">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition duration-300">
          <h2 className="text-2xl font-bold text-purple-400 mb-4"> Tecnología Avanzada</h2>
          <p className="text-gray-300">Productos de última generación con diseño impactante y rendimiento de otro mundo.</p>
        </div>
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition duration-300">
          <h2 className="text-2xl font-bold text-pink-400 mb-4">🎨 Estilo Inigualable</h2>
          <p className="text-gray-300">Cada producto tiene un diseño cuidadosamente seleccionado para destacar.</p>
        </div>
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition duration-300">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4"> Calidad Garantizada</h2>
          <p className="text-gray-300">Nos aseguramos de ofrecer productos originales, potentes y listos para impresionar.</p>
        </div>
      </section>
    </div>
  );
}

export default Inicio;