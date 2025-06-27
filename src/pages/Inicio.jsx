import React from "react";
import { Link } from "react-router-dom";
import SliderAnuncios from "../components/SliderAnuncios";
import SliderProductos from "../components/SliderProductos";
import productosAll from "../data/productosAll";
import { FaPhone, FaMapMarkerAlt, FaEnvelope, FaWhatsapp } from "react-icons/fa";
import { motion } from "framer-motion";
import ArcadeCallToAction from "../components/ArcadeCallToAction";


const productosTodos = productosAll.flatMap(categoria => categoria.productos);
const consolaCategoria = productosAll.find(c => c.categoria === "Consolas");
const productosConsolas = consolaCategoria ? consolaCategoria.productos : [];

const ofertasEspeciales = productosTodos.filter(p => p.oferta);

function Inicio() {
  return (
    <div className="pt-[80px] bg-white min-h-screen">
      {/* VIDEO HERO */}
      <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] overflow-hidden rounded-3xl shadow-md mb-12 border border-gray-300">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover rounded-3xl"
        >
          <source src="/videos/playcenter_intro.mp4" type="video/mp4" />
          Tu navegador no soporta video HTML5.
        </video>
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-gray-200/40 to-transparent rounded-3xl pointer-events-none"
          animate={{ opacity: [0, 0.15, 0] }}
          transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
        />
      </div>

      {/* SLIDER DE ANUNCIOS */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="slider-anuncios-container"
      >
        <SliderAnuncios />
      </motion.div>
      

      {/* BOTONES */}
      <motion.section
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="btn-container"
      >
        <h2 className="btn-title">Mira nuestras mejores ofertas</h2>
        <div className="btn-wrapper">
          <Link to="/productos" className="btn btn-primary">
            Explorar Productos
            <span className="btn-glow" />
          </Link>

          <Link to="/productos/ofertas-especiales" className="btn btn-secondary">
            Ver Ofertas
            <span className="btn-glow" />
          </Link>
        </div>
      </motion.section>

      {/* RECOMENDADOS */}
      <section className="max-w-7xl mx-auto mb-12 px-4">
        <h2 className="section-title">Recomendaciones para ti</h2>
        <SliderProductos productos={productosTodos.slice(0, 10)} tipo="recomendados" />
        <div className="text-right mt-4">
          <Link to="/productos" className="link-primary">
            Ver todos los productos →
          </Link>
        </div>
      </section>

      {/* CONSOLAS POPULARES */}
      <section className="max-w-7xl mx-auto mb-12 px-4">
        <h2 className="section-title">Consolas populares</h2>
        <SliderProductos productos={productosConsolas.slice(0, 10)} tipo="consolas" />
        <div className="text-right mt-4">
          <Link to="/categorias/consolas" className="link-primary">
            Ver todas las consolas →
          </Link>
        </div>
      </section>

      {/* OFERTAS ESPECIALES */}
      <section className="max-w-7xl mx-auto mb-12 px-4">
        <h2 className="section-title">Ofertas Especiales</h2>
        <SliderProductos productos={ofertasEspeciales.slice(0, 10)} tipo="ofertas" />
        <div className="text-right mt-4">
          <Link to="/productos/ofertas-especiales" className="link-primary">
            Seguir viendo ofertas →
          </Link>
        </div>
      </section>
      <ArcadeCallToAction />

      {/* CONTACTO */}
      <section className="contact-section">
        <h2 className="contact-title">Contáctanos</h2>

        <div className="contact-card">
          <h2 className="text-2xl font-bold mb-4 flex flex-wrap items-center gap-1">
            <span className="text-red-600">P</span>
            <span className="text-orange-500">l</span>
            <span className="text-yellow-500">a</span>
            <span className="text-green-600">y</span>
            <span className="text-blue-600">c</span>
            <span className="text-indigo-600">e</span>
            <span className="text-purple-600">n</span>
            <span className="text-pink-600">t</span>
            <span className="text-teal-600">e</span>
            <span className="text-emerald-600">r</span>
            <span className="ml-2 text-green-800">Universal</span>
          </h2>

          <p className="flex items-center mb-3 text-gray-700">
            <FaMapMarkerAlt className="mr-2 text-red-600" />
            Av. Estrella Sadhalá, Santiago, República Dominicana
          </p>

          <p className="flex items-center mb-3 text-blue-700 font-medium">
            <FaPhone className="mr-2 text-blue-600" />
            +1 (849)-635-7000 (Tienda)
          </p>

          <p className="flex items-center mb-3 text-red-700 font-medium">
            <FaPhone className="mr-2 text-red-600" />
            +1 (809)-582-1212 (Internet)
          </p>

          <p className="flex items-center mb-3">
            <FaEnvelope className="mr-2 text-green-600" />
            playcenter121@gmail.com
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <a
              href="https://wa.me/18496357000?text=Hola%20PlayCenter%2C%20estoy%20interesad%40%20en%20un%20producto%20que%20vi%20en%20su%20página."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-5 py-3 text-white bg-indigo-600 hover:bg-indigo-700 transition rounded-xl shadow-md w-full sm:w-auto"
            >
              <FaWhatsapp className="text-xl" />
              WhatsApp Tienda
            </a>

            <a
              href="https://wa.me/18095821212?text=Hola%20PlayCenter%2C%20estoy%20interesad%40%20en%20un%20producto%20que%20vi%20en%20su%20página."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-5 py-3 text-white bg-rose-500 hover:bg-rose-600 transition rounded-xl shadow-md w-full sm:w-auto"
            >
              <FaWhatsapp className="text-xl" />
              WhatsApp Internet
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Inicio;
