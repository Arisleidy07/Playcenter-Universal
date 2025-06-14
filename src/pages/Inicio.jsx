// src/pages/Inicio.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaWhatsapp, FaYoutube, FaTiktok } from "react-icons/fa";

function Inicio() {
  return (
    <div className="min-h-screen pt-24 bg-gradient-to-tr from-white via-gray-100 to-white text-gray-900 font-sans">
      {/* Encabezado principal */}
      <section className="text-center px-4 md:px-12">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 animate-pulse bg-gradient-to-r from-blue-600 via-sky-500 to-teal-400 bg-clip-text text-transparent drop-shadow">
          Bienvenidos a Playcenter Universal
        </h1>
        <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto text-gray-700">
          Tu universo de tecnología, innovación y estilo. Donde cada clic es una aventura.
        </p>
        <div className="flex justify-center gap-6 flex-wrap">
          <Link to="/productos" className="bg-gradient-to-r from-blue-600 to-teal-500 text-white px-8 py-3 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300">
            Explorar Productos
          </Link>
          <Link
            to="/productos/ofertas-especiales"
            className="bg-white border border-blue-500 text-blue-600 px-8 py-3 rounded-2xl shadow hover:bg-blue-50 transition duration-300" >
            Ver Ofertas
          </Link>

        </div>
      </section>

      {/* Beneficios */}
      <section className="mt-20 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 px-6 md:px-20">
        {[
          ["Tecnología Avanzada", "Productos de última generación y diseño impactante.", "from-blue-100 to-white"],
          ["Estilo Inigualable", "Diseños seleccionados para destacar con elegancia.", "from-slate-100 to-white"],
          ["Calidad Garantizada", "Productos originales, potentes y confiables.", "from-gray-100 to-white"]
        ].map(([titulo, texto, bg], idx) => (
          <div key={idx} className={`bg-gradient-to-br ${bg} rounded-2xl p-6 shadow-xl hover:shadow-2xl transition duration-300`}>
            <h2 className="text-2xl font-bold text-blue-700 mb-4">{titulo}</h2>
            <p className="text-gray-700">{texto}</p>
          </div>
        ))}
      </section>

      {/* Productos más vendidos */}
      <section className="mt-24 px-6 md:px-20">
        <h2 className="text-3xl font-bold text-center mb-8 text-blue-800"> Productos más vendidos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {[
            { nombre: "PS5 + Control", imagen: "/products/ps5.jpg", precio: 499.99 },
            { nombre: "Audífonos Gamer RGB", imagen: "/products/audifonos-gamer.jpg", precio: 129.99 },
            { nombre: "Tablet Lenovo 10\"", imagen: "/products/tablet.jpg", precio: 199.99 },
          ].map((p, idx) => (
            <div key={idx} className="bg-white p-4 shadow rounded-xl text-center hover:scale-105 transition-transform">
              <img src={p.imagen} alt={p.nombre} className="w-32 h-32 object-contain mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800">{p.nombre}</h3>
              <p className="text-blue-600 font-bold">${p.precio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Enlaces a categorías destacadas */}
      <section className="mt-24 text-center">
        <h2 className="text-3xl font-bold text-blue-800 mb-6"> Explora por Categorías</h2>
        <div className="flex flex-wrap justify-center gap-4 px-4">
          {["celulares", "videojuegos", "tablets", "audifonos", "smart-tv"].map((cat, idx) => (
            <Link
              key={idx}
              to={`/productos/${cat}`}
              className="bg-blue-100 text-blue-700 px-6 py-2 rounded-full shadow hover:bg-blue-200 transition"
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1).replace("-", " ")}
            </Link>
          ))}
        </div>
      </section>

      {/* Redes sociales */}
      <section className="mt-24 text-center pb-16">
        <h2 className="text-2xl font-semibold text-blue-900 mb-6">Visítanos en nuestras plataformas</h2>
        <div className="flex justify-center gap-6 text-3xl text-blue-600">
          <a href="#" aria-label="Instagram" className="hover:text-pink-500"><FaInstagram /></a>
          <a href="#" aria-label="Facebook" className="hover:text-blue-700"><FaFacebookF /></a>
          <a href="#" aria-label="WhatsApp" className="hover:text-green-500"><FaWhatsapp /></a>
          <a href="#" aria-label="TikTok" className="hover:text-black"><FaTiktok /></a>
          <a href="#" aria-label="YouTube" className="hover:text-red-600"><FaYoutube /></a>
        </div>
      </section>
    </div>
  );
}

export default Inicio;
