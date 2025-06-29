// src/pages/Inicio.jsx
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaWhatsapp, FaMapMarkerAlt, FaPhone, FaEnvelope } from "react-icons/fa";
import SliderAnuncios from "../components/SliderAnuncios";
import ArcadeCallToAction from "../components/ArcadeCallToAction";

function Inicio() {
  return (
    <div className="pt-[80px] bg-gray-100 min-h-screen relative overflow-hidden">
      {/* SLIDER */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 max-w-[1600px] mx-auto px-4"
      >
        <SliderAnuncios />
      </motion.div>

      {/* --- QUITÉ EL DEGRADADO --- */}

      {/* GRID 4 BLOQUES ESTILO AMAZON */}
      <section className="max-w-[1280px] mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
        {/* Bloque 1 - imagen grande */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <Link to="/categoria/1" className="block">
            <img
              src="https://via.placeholder.com/600x400?text=Imagen+Grande+1"
              alt="Bloque 1"
              className="w-full h-[280px] object-cover"
            />
          </Link>
        </div>

        {/* Bloque 2 - imagen grande */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <Link to="/categoria/2" className="block">
            <img
              src="https://via.placeholder.com/600x400?text=Imagen+Grande+2"
              alt="Bloque 2"
              className="w-full h-[280px] object-cover"
            />
          </Link>
        </div>

        {/* Bloque 3 - 4 imágenes pequeñas + texto */}
        <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col">
          <h3 className="text-xl font-semibold mb-4">Explora nuestros audífonos</h3>
          <div className="grid grid-cols-2 gap-3 flex-grow">
            {[1, 2, 3, 4].map((i) => (
              <Link key={i} to="/categoria/audifonos" className="block overflow-hidden rounded-lg hover:scale-105 transition-transform duration-300">
                <img
                  src={`https://via.placeholder.com/300x200?text=Audifono+${i}`}
                  alt={`Audifono ${i}`}
                  className="w-full h-[140px] object-cover"
                />
              </Link>
            ))}
          </div>
          <Link
            to="/categoria/audifonos"
            className="mt-4 text-blue-600 hover:underline font-medium self-start"
          >
            Explora nuestros audífonos →
          </Link>
        </div>

        {/* Bloque 4 - 4 imágenes pequeñas + texto */}
        <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col">
          <h3 className="text-xl font-semibold mb-4">Nuestros mejores electrodomésticos</h3>
          <div className="grid grid-cols-2 gap-3 flex-grow">
            {[1, 2, 3, 4].map((i) => (
              <Link key={i} to="/categoria/electrodomesticos" className="block overflow-hidden rounded-lg hover:scale-105 transition-transform duration-300">
                <img
                  src={`https://via.placeholder.com/300x200?text=Electrodomestico+${i}`}
                  alt={`Electrodoméstico ${i}`}
                  className="w-full h-[140px] object-cover"
                />
              </Link>
            ))}
          </div>
          <Link
            to="/categoria/electrodomesticos"
            className="mt-4 text-blue-600 hover:underline font-medium self-start"
          >
            Explora nuestros electrodomésticos →
          </Link>
        </div>
      </section>

      {/* RECTÁNGULO CATEGORÍAS */}
      <section className="max-w-7xl mx-auto mt-12 px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Explora nuestras categorías</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Link to={`/categoria/${i}`} key={i}>
                <img
                  src={`https://via.placeholder.com/200x200?text=Cat${i}`}
                  alt={`Categoría ${i}`}
                  className="rounded hover:scale-105 transition"
                />
              </Link>
            ))}
          </div>
          <div className="text-right mt-4">
            <Link
              to="/categorias"
              className="text-blue-600 hover:underline text-sm"
            >
              Explora todas nuestras categorías →
            </Link>
          </div>
        </div>
      </section>

      {/* RECTÁNGULO SLIDER PRODUCTOS 1 */}
      <section className="max-w-7xl mx-auto mt-12 px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Productos destacados</h2>
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {[...Array(15)].map((_, i) => (
              <Link to={`/producto/${i}`} key={i} className="min-w-[150px]">
                <img
                  src={`https://via.placeholder.com/150x150?text=Prod${i}`}
                  alt={`Producto ${i}`}
                  className="rounded hover:scale-105 transition"
                />
              </Link>
            ))}
          </div>
          <div className="text-right mt-4">
            <Link
              to="/productos"
              className="text-blue-600 hover:underline text-sm"
            >
              Ver todos nuestros productos →
            </Link>
          </div>
        </div>
      </section>

      {/* RECTÁNGULO SLIDER PRODUCTOS 2 */}
      <section className="max-w-7xl mx-auto mt-12 px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Videojuegos en oferta</h2>
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {[...Array(15)].map((_, i) => (
              <Link to={`/producto/${i}`} key={i} className="min-w-[150px]">
                <img
                  src={`https://via.placeholder.com/150x150?text=Game${i}`}
                  alt={`Videojuego ${i}`}
                  className="rounded hover:scale-105 transition"
                />
              </Link>
            ))}
          </div>
          <div className="text-right mt-4">
            <Link
              to="/categoria/videojuegos"
              className="text-blue-600 hover:underline text-sm"
            >
              Ver todos los videojuegos →
            </Link>
          </div>
        </div>
      </section>

      {/* 4 BLOQUES INFERIORES */}
      <section className="max-w-7xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
        {/* Bloque 1 */}
        <div className="bg-white rounded-lg shadow p-4">
          <Link to="/categoria/3">
            <img
              src="https://via.placeholder.com/400x300?text=Imagen+Grande"
              alt="Categoría 3"
              className="w-full rounded"
            />
          </Link>
        </div>
        {/* Bloque 2 */}
        <div className="bg-white rounded-lg shadow p-4">
          <Link to="/categoria/4">
            <img
              src="https://via.placeholder.com/400x300?text=Imagen+Grande"
              alt="Categoría 4"
              className="w-full rounded"
            />
          </Link>
        </div>
        {/* Bloque 3 */}
        <div className="bg-white rounded-lg shadow p-4 flex flex-col gap-2">
          <h3 className="text-lg font-semibold">Nuestros mejores accesorios</h3>
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Link to="/categoria/accesorios" key={i}>
                <img
                  src={`https://via.placeholder.com/150x150?text=Acc${i}`}
                  alt={`Accesorio ${i}`}
                  className="rounded"
                />
              </Link>
            ))}
          </div>
          <Link
            to="/categoria/accesorios"
            className="text-blue-600 text-sm mt-2 hover:underline"
          >
            Explora nuestros accesorios →
          </Link>
        </div>
        {/* Bloque 4 */}
        <div className="bg-white rounded-lg shadow p-4 flex flex-col gap-2">
          <h3 className="text-lg font-semibold">Explora nuestros Smart TV</h3>
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Link to="/categoria/smart-tv" key={i}>
                <img
                  src={`https://via.placeholder.com/150x150?text=TV${i}`}
                  alt={`TV ${i}`}
                  className="rounded"
                />
              </Link>
            ))}
          </div>
          <Link
            to="/categoria/smart-tv"
            className="text-blue-600 text-sm mt-2 hover:underline"
          >
            Explora nuestros Smart TV →
          </Link>
        </div>
      </section>



      {/* LLAMADO A ARCADE */}
      <ArcadeCallToAction />

      {/* CONTACTO */}
      <section className="max-w-7xl mx-auto mt-12 px-4">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h2 className="text-2xl font-semibold mb-4">Contáctanos</h2>
          <p className="flex items-center justify-center mb-2">
            <FaMapMarkerAlt className="mr-2 text-red-600" />
            Av. Estrella Sadhalá, Santiago, República Dominicana
          </p>
          <p className="flex items-center justify-center mb-2">
            <FaPhone className="mr-2 text-blue-600" />
            +1 (849)-635-7000 (Tienda)
          </p>
          <p className="flex items-center justify-center mb-2">
            <FaEnvelope className="mr-2 text-green-600" />
            playcenter121@gmail.com
          </p>
          <div className="flex justify-center mt-4 gap-4">
            <a
              href="https://wa.me/18496357000"
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaWhatsapp />
              WhatsApp Tienda
            </a>
            <a
              href="https://wa.me/18095821212"
              className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded hover:bg-rose-600 transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaWhatsapp />
              WhatsApp Internet
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Inicio;
