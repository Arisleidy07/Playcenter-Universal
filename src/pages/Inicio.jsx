import React from "react";
import SliderAnuncios from '../components/SliderAnuncios';
import { Link } from "react-router-dom";

function Inicio() {
  return (
    <>
      <SliderAnuncios />

      <main className="pt-24 px-4 sm:px-6 lg:px-12 pb-16 bg-neutral-900 min-h-screen text-white">

        {/* Hero principal */}
        <section className="bg-gradient-to-r from-neutral-800 to-black text-white p-10 rounded-3xl shadow-xl mb-16 border border-gray-700">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight tracking-wide">
            Bienvenido a <span className="text-amber-400">Playcenter Universal</span>
          </h1>
          <p className="text-lg sm:text-xl mb-6 max-w-3xl text-gray-300">
            Tecnología, estilo y potencia en una sola tienda. Explora lo último en innovación y diseño.
          </p>
          <Link
            to="/productos"
            className="inline-block bg-amber-400 hover:bg-amber-500 text-black font-bold px-8 py-4 rounded-full shadow-lg transition-transform transform hover:scale-105"
          >
            Ver productos
          </Link>
        </section>

        {/* Secciones destacadas */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
          <div className="bg-neutral-800 rounded-2xl p-8 border border-gray-700 hover:shadow-xl transition-all hover:scale-105">
            <h2 className="text-2xl font-semibold mb-3 text-amber-400">Categorías premium</h2>
            <p className="text-gray-400 mb-4">Más de 20 categorías organizadas al estilo Amazon. Encuentra justo lo que buscas.</p>
            <Link to="/productos" className="text-amber-400 font-semibold hover:underline">Explorar</Link>
          </div>

          <div className="bg-neutral-800 rounded-2xl p-8 border border-gray-700 hover:shadow-xl transition-all hover:scale-105">
            <h2 className="text-2xl font-semibold mb-3 text-emerald-400">Ofertas exclusivas</h2>
            <p className="text-gray-400 mb-4">Accede a promociones, descuentos por temporada y precios bajos todos los días.</p>
            <Link to="/productos" className="text-emerald-400 font-semibold hover:underline">Ver ofertas</Link>
          </div>

          <div className="bg-neutral-800 rounded-2xl p-8 border border-gray-700 hover:shadow-xl transition-all hover:scale-105">
            <h2 className="text-2xl font-semibold mb-3 text-sky-400">Soporte personalizado</h2>
            <p className="text-gray-400 mb-4">¿Tienes dudas? Nuestro equipo está listo para ayudarte por WhatsApp o correo.</p>
            <Link to="/contacto" className="text-sky-400 font-semibold hover:underline">Contáctanos</Link>
          </div>
        </section>
      </main>
    </>
  );
}

export default Inicio;
