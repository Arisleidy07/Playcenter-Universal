import React from "react";
import { Link } from "react-router-dom";
import { FaInstagram, FaFacebookF, FaWhatsapp, FaTiktok, FaYoutube } from "react-icons/fa";
import "../styles/inicio.css";

function Inicio() {
  return (
    <div className="bg-white min-h-screen pt-24 font-sans">
      <section className="text-center px-6">
        <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-indigo-500 to-sky-600 animate-pulse mb-4">
          Bienvenidos a Playcenter Universal
        </h1>
        <p className="text-lg text-gray-700 mb-8 max-w-3xl mx-auto">
          Tu universo de tecnología, innovación y estilo. Donde cada clic es una aventura visual y moderna.
        </p>
        <div className="flex justify-center gap-6 flex-wrap mb-10">
          <Link to="/productos" className="bg-gradient-to-r from-indigo-600 to-cyan-600 text-white px-8 py-3 rounded-xl shadow-md hover:scale-105 transition duration-300">
            Explorar Productos
          </Link>
          <Link to="/productos/ofertas-especiales" className="bg-yellow-400 text-black px-8 py-3 rounded-xl shadow-md hover:scale-105 transition duration-300">
            Ver Ofertas
          </Link>
        </div>
      </section>

      {/* Productos más vendidos */}
      <section className="px-6 mt-12">
        <h2 className="text-3xl font-bold text-center text-indigo-800 mb-6">Productos Más Vendidos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((id) => (
            <div key={id} className="card transform hover:scale-105 transition-all duration-300">
              <div className="bg"></div>
              <div className="blob"></div>
              <img
                src={`/products/producto${id}.jpg`}
                alt={`Producto ${id}`}
                className="z-10 w-32 h-32 object-contain mx-auto"
              />
              <h3 className="z-10 mt-3 text-center font-semibold text-gray-800">Producto {id}</h3>
              <p className="z-10 text-center font-bold text-indigo-700">$99.99</p>
            </div>
          ))}
        </div>
    </div>
  );
}

export default Inicio;
