import React from "react";
import SliderAnuncios from '../components/SliderAnuncios';
import { Link } from "react-router-dom";

function Inicio() {
  return (
    <>
      <SliderAnuncios />

      <main className="pt-24 px-4 sm:px-6 lg:px-12 pb-16 bg-white min-h-screen">

        {/* Banner principal */}
        <section className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 sm:p-10 rounded-2xl shadow-lg mb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 animate-fade-in">
            Bienvenido a Playcenter Universal
          </h1>
          <p className="text-lg sm:text-xl mb-6 max-w-2xl animate-fade-in">
            Descubre miles de productos, promociones exclusivas y mucho más.
          </p>
          <Link
            to="/productos"
            className="inline-block bg-white text-purple-600 font-bold px-6 py-3 rounded-xl shadow hover:bg-purple-100 transition-all"
          >
            Ver productos
          </Link>
        </section>

        {/* Sección destacada */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-14">
          <div className="bg-blue-100 rounded-xl p-6 shadow hover:scale-[1.02] transition-all">
            <h2 className="text-xl font-semibold mb-2">Categorías variadas</h2>
            <p className="text-sm mb-4">Explora más de 20 categorías con productos increíbles.</p>
            <Link to="/categorias" className="text-blue-600 font-medium hover:underline">Explorar</Link>
          </div>
          <div className="bg-green-100 rounded-xl p-6 shadow hover:scale-[1.02] transition-all">
            <h2 className="text-xl font-semibold mb-2">Ofertas especiales</h2>
            <p className="text-sm mb-4">Descuentos únicos en tecnología, accesorios, ropa y más.</p>
            <Link to="/productos" className="text-green-600 font-medium hover:underline">Ver ofertas</Link>
          </div>
          <div className="bg-yellow-100 rounded-xl p-6 shadow hover:scale-[1.02] transition-all">
            <h2 className="text-xl font-semibold mb-2">Atención personalizada</h2>
            <p className="text-sm mb-4">¿Tienes dudas? Contáctanos y te ayudamos con gusto.</p>
            <Link to="/contacto" className="text-yellow-700 font-medium hover:underline">Contáctanos</Link>
          </div>
        </section>

        {/* NUEVA SECCIÓN */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold mb-6 text-center">🎉 Nuevas Colecciones</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {[
              'Gaming',
              'Oficina',
              'Fitness',
              'Electrodomésticos',
              'Moda',
              'Juguetes'
            ].map((cat, idx) => (
              <div
                key={idx}
                className="bg-white border rounded-xl shadow-md p-4 text-center hover:shadow-xl transition-all cursor-pointer"
              >
                <img
                  src={`https://via.placeholder.com/100x100?text=${cat}`}
                  alt={cat}
                  className="mx-auto mb-2 rounded"
                />
                <p className="text-sm font-semibold">{cat}</p>
              </div>
            ))}
          </div>
        </section>

      </main>
    </>
  );
}

export default Inicio;
