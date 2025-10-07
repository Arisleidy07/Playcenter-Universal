import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaWhatsapp,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa";
import SliderAnuncios from "../components/SliderAnuncios";
import SliderAnunciosMovil from "../components/SliderAnunciosMovil";
import { useProductsByCategories } from "../hooks/useProducts";
import Anim from '../components/anim';

// Animación sutil para bloques y banners
const fadeIn = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};

const trailImages = Array.from({ length: 17 }, (_, i) => `/animacion/${i + 1}.png`);

function Inicio() {
  const { productsByCategory, categories, loading, error } = useProductsByCategories();

  if (loading) {
    return null; // sin animación ni texto durante la carga
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-indigo-50 via-white to-blue-100 min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-lg">Error cargando productos</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Helpers nube
  const pickUrl = (u) => {
    try {
      if (!u) return "";
      if (typeof u === "string") return u;
      if (typeof u === "object" && u !== null) return u.url || "";
      return String(u || "");
    } catch { return ""; }
  };
  const getMainImage = (p) => {
    const a = pickUrl(p?.imagenPrincipal?.[0]);
    if (a) return a;
    if (p?.imagen) return p.imagen;
    const m = (Array.isArray(p?.media) ? p.media : []).find((x) => x?.type === "image" && x?.url);
    if (m?.url) return m.url;
    if (Array.isArray(p?.imagenes) && p.imagenes[0]) return p.imagenes[0];
    return "";
  };
  const getCategoryByRoute = (ruta) => categories.find((c) => (c?.ruta || "") === ruta);
  const getProductsByRoute = (ruta) => {
    const cat = getCategoryByRoute(ruta);
    if (!cat) return [];
    return productsByCategory[cat.id] || [];
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-blue-100 min-h-screen">
      
      {/* VIDEO SOLO EN DESKTOP */}
      <div className="hidden xl:block w-full">
        <video
          src="/videos/pcu-intro.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-auto object-cover"
          style={{ marginTop: '0px' }}
        />
      </div>

      {/* SLIDER SOLO DESKTOP */}
      <motion.div
        className="hidden xl:block w-full max-w-[1600px] mx-auto px-4"
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <div className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-indigo-100">
          <SliderAnuncios />
        </div>
      </motion.div>

      {/* SLIDER PARA < xl */}
      <motion.div
        className="block xl:hidden w-full max-w-[600px] mx-auto px-2 mt-4"
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <SliderAnunciosMovil />
      </motion.div>




      {/* BLOQUES CUADRADOS - CATEGORÍAS DINÁMICAS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8 max-w-[1600px] mx-auto px-4 mt-14">
        {categories.slice(0, 4).map((category, idx) => {
          const categoryProducts = productsByCategory[category.id] || [];
          const featuredProducts = categoryProducts.slice(0, 4);
          
          return (
            <motion.div
              key={category.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition h-[440px] flex flex-col justify-between p-5 group"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 * idx }}
            >
              <h3 className="text-xl font-bold mb-2 text-indigo-700 tracking-tight">
                {category.nombre}
              </h3>
              <div className="grid grid-cols-2 gap-2 flex-grow">
                {featuredProducts.map((product, i) => {
                  const img = getMainImage(product) || '/placeholder-product.png';
                  return (
                    <Link to={`/producto/${product.id}`} key={product.id}>
                      <img
                        src={img}
                        alt={product.nombre}
                        className="w-full aspect-[4/3] object-contain rounded-lg shadow-sm group-hover:scale-105 transition-transform"
                      />
                    </Link>
                  );
                })}
              </div>
              <Link
                to={`/Productos/${category.ruta}`}
                className="text-indigo-600 text-sm mt-3 hover:underline font-medium"
              >
                Explora {category.nombre} →
              </Link>
            </motion.div>
          );
        })}
      </section>

                        {/* BANNER afisionados - SOLO DESKTOP */}
<motion.div
  className="hidden xl:block max-w-[1600px] mx-auto px-4 mt-10"
  variants={fadeIn}
  initial="hidden"
  animate="visible"
>
  <Link
    to="/Productos/coleccionables"
    className="block overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition"
  >
    <img
      src="/ads/aficionados.png"
      alt="Ver Nuestras colecciones"
      className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
    />
  </Link>
</motion.div>



            {/* BANNERS GRANDES - SOLO COMPUTADORA */}
      <section className="hidden xl:grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[1600px] mx-auto px-4 mt-14">
        {[
          {
            to: "/Productos/retro-consolas",
            src: "/ads/retro.png",
            alt: "Retro Consolas",
          },
          {
            to: "/Productos/camaras",
            src: "/ads/camaras.png",
            alt: "Cámaras",
          },
        ].map((banner, idx) => (
          <motion.div
            key={idx}
            className="overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition h-[220px] sm:h-[300px] md:h-[400px] group"
            whileHover={{ scale: 1.01 }}
          >
            <Link to={banner.to} className="block w-full h-full">
              <img
                src={banner.src}
                alt={banner.alt}
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-400"
              />
            </Link>
          </motion.div>
        ))}
      </section>



      {/* CATEGORÍAS DESTACADAS */}
      <motion.section
        className="max-w-[1600px] mx-auto mt-20 px-4"
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">
            Explora nuestras categorías
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-7">
            {[
              {
                to: "/Productos/audifonos",
                src: "/ads/audifonoscate.png",
                alt: "Audífonos",
              },
              {
                to: "/Productos/mouses",
                src: "/ads/mousecate.png",
                alt: "Mouses",
              },
              {
                to: "/Productos/teclados",
                src: "/ads/tecladocate.png",
                alt: "Teclados",
              },
              {
                to: "/Productos/camaras",
                src: "/ads/camaracate.png",
                alt: "Cámaras",
              },
              {
                to: "/Productos/discos-duros",
                src: "/ads/discodurocate.png",
                alt: "Discos Duros",
              },
              {
                to: "/Productos/controles",
                src: "/ads/controlcate.png",
                alt: "Controles",
              },
            ].map((cat, i) => (
              <Link to={cat.to} key={cat.alt}>
                <img
                  src={cat.src}
                  alt={cat.alt}
                  className="rounded-xl hover:scale-110 transition object-cover w-full aspect-[1/1] shadow-sm"
                />
              </Link>
            ))}
          </div>
          <div className="text-right mt-6">
            <Link
              to="/Productos"
              className="text-indigo-600 hover:underline text-base font-medium"
            >
              Ver todas las categorías →
            </Link>
          </div>
        </div>
      </motion.section>

                  {/* BANNER ESTAFETAS - SOLO DESKTOP */}
      <motion.div
        className="hidden xl:block max-w-[1600px] mx-auto px-4 mt-10"
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <Link
          to="/estafetas"
          className="block overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition"
        >
          <img
            src="/ads/ESTAFETAS.png"
            alt="Ver Nuestras Estafetas"
            className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
          />
        </Link>
      </motion.div>

      {/* GALERÍA DESTACADA DE PRODUCTOS */}
      <motion.section
        className="max-w-[1600px] mx-auto mt-20 px-4"
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">
            Descubre nuestros productos
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-7">
            {Object.values(productsByCategory)
              .flat()
              .slice(0, 6)
              .map((producto) => (
                <Link to={`/producto/${producto.id}`} key={producto.id}>
                  <div className="bg-white rounded-xl overflow-hidden shadow hover:shadow-md transition">
                    <img
                      src={getMainImage(producto) || producto.imagen || producto.imagenes?.[0] || '/placeholder-product.png'}
                      alt={producto.nombre}
                      className="w-full aspect-[1/1] object-contain p-2"
                    />
                  </div>
                </Link>
              ))}
          </div>
          <div className="text-right mt-6">
            <Link
              to="/Productos"
              className="text-indigo-600 hover:underline text-base font-medium"
            >
              Explora nuestros productos →
            </Link>
          </div>
        </div>
      </motion.section>

      {/* SLIDER HOGAR INTELIGENTE (dinámico desde Firestore) */}
      <motion.section
        className="max-w-[1600px] mx-auto mt-20 px-4"
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">
            Hogar Inteligente en Oferta
          </h2>
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
            {getProductsByRoute('hogar-inteligente')
              .slice(0, 10)
              .map((p) => {
                const img = getMainImage(p) || '/placeholder-product.png';
                return (
                  <Link to={`/producto/${p.id}`} className="min-w-[180px] px-2" key={p.id}>
                    <img
                      src={img}
                      alt={p.nombre}
                      className="rounded-xl hover:scale-110 transition object-contain w-full h-[180px] bg-white"
                    />
                  </Link>
                );
              })}
          </div>
          <div className="text-right mt-6">
            <Link
              to="/Productos/hogar-inteligente"
              className="text-indigo-600 hover:underline text-base font-medium"
            >
              Descubre cómo transformar tu casa en un hogar inteligente →
            </Link>
          </div>
        </div>
      </motion.section>

      {/* TU RINCÓN VARIADO (dinámico desde Firestore) */}
      <motion.section
        className="max-w-[1600px] mx-auto mt-20 px-4"
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">
            Tu Rincón Variado
          </h2>
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
            {getProductsByRoute('tu-rincon-variado')
              .slice(0, 12)
              .map((p) => {
                const img = getMainImage(p) || '/placeholder-product.png';
                return (
                  <Link
                    to={`/producto/${p.id}`}
                    key={p.id}
                    className="min-w-[180px] px-2"
                    title={p.nombre}
                  >
                    <img
                      src={img}
                      alt={p.nombre}
                      className="rounded-xl hover:scale-110 transition-transform duration-300 object-contain w-full h-[180px] bg-white"
                    />
                  </Link>
                );
              })}
          </div>
          <div className="text-right mt-6">
            <Link
              to="/Productos/tu-rincon-variado"
              className="text-indigo-600 hover:underline text-base font-medium"
            >
              Explora nuestro Rincón Variado →
            </Link>
          </div>
        </div>
      </motion.section>

      {/* DOBLE BANNER */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[1600px] mx-auto px-4 mt-16">
        {[
          {
            to: "/Productos/consolas",
            src: "/ads/nintendoswtitchads.png",
            alt: "Consolas",
          },
          {
            to: "/Productos/controles",
            src: "/ads/controlads.png",
            alt: "Controles",
          },
        ].map((banner, idx) => (
          <motion.div
            key={banner.alt}
            className="overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition aspect-[16/9]"
            whileHover={{ scale: 1.01 }}
          >
            <Link to={banner.to} className="block w-full h-full">
              <img
                src={banner.src}
                alt={banner.alt}
                className="w-full h-full object-contain object-center hover:scale-105 transition-transform duration-400 bg-black"
              />
            </Link>
          </motion.div>
        ))}
      </section>

      {/* BLOQUES: Cámaras, Discos Duros, Memorias USB, Cables (dinámicos desde Firestore) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8 max-w-[1600px] mx-auto px-4 mt-16">
        {/* Cámaras de Vigilancia */}
        <motion.div
          className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition h-[440px] flex flex-col justify-between p-5"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
        >
          <h3 className="text-xl font-bold mb-2 text-indigo-700 tracking-tight">
            Cámaras de Vigilancia
          </h3>
          <div className="grid grid-cols-2 gap-2 flex-grow">
            {getProductsByRoute('camaras')
              .slice(0, 4)
              .map((p) => (
                <Link to={`/producto/${p.id}`} key={p.id}>
                  <img
                    src={getMainImage(p) || '/placeholder-product.png'}
                    alt={p.nombre}
                    className="w-full aspect-[4/3] object-contain rounded-lg shadow-sm hover:scale-105 transition-transform bg-white"
                  />
                </Link>
              ))}
          </div>
          <Link
            to="/Productos/camaras"
            className="text-indigo-600 text-sm mt-3 hover:underline font-medium"
          >
            Explora nuestras Cámaras de Vigilancia →
          </Link>
        </motion.div>

        {/* Discos Duros */}
        <motion.div
          className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition h-[440px] flex flex-col justify-between p-5"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
        >
          <h3 className="text-xl font-bold mb-2 text-indigo-700 tracking-tight">
            Discos Duros
          </h3>
          <div className="grid grid-cols-2 gap-2 flex-grow">
            {getProductsByRoute('discos-duros')
              .slice(0, 4)
              .map((p) => (
                <Link to={`/producto/${p.id}`} key={p.id}>
                  <img
                    src={getMainImage(p) || '/placeholder-product.png'}
                    alt={p.nombre}
                    className="w-full aspect-[4/3] object-cover rounded-lg shadow-sm hover:scale-105 transition-transform bg-white"
                  />
                </Link>
              ))}
          </div>
          <Link
            to="/Productos/discos-duros"
            className="text-indigo-600 text-sm mt-3 hover:underline font-medium"
          >
            Explora nuestros Discos Duros →
          </Link>
        </motion.div>

        {/* Memorias USB */}
        <motion.div
          className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition h-[440px] flex flex-col justify-between p-5"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
        >
          <h3 className="text-xl font-bold mb-2 text-indigo-700 tracking-tight">
            Memorias USB
          </h3>
          <div className="grid grid-cols-2 gap-2 flex-grow">
            {getProductsByRoute('memorias-usb')
              .slice(0, 4)
              .map((p) => (
                <Link to={`/producto/${p.id}`} key={p.id}>
                  <img
                    src={getMainImage(p) || '/placeholder-product.png'}
                    alt={p.nombre}
                    className="w-full aspect-[4/3] object-contain rounded-lg shadow-sm hover:scale-105 transition-transform bg-white"
                  />
                </Link>
              ))}
          </div>
          <Link
            to="/Productos/memorias-usb"
            className="text-indigo-600 text-sm mt-3 hover:underline font-medium"
          >
            Explora nuestras Memorias USB →
          </Link>
        </motion.div>

        {/* Cables */}
        <motion.div
          className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition h-[440px] flex flex-col justify-between p-5"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
        >
          <h3 className="text-xl font-bold mb-2 text-indigo-700 tracking-tight">
            Cables
          </h3>
          <div className="grid grid-cols-2 gap-2 flex-grow">
            {getProductsByRoute('cables')
              .slice(0, 4)
              .map((p) => (
                <Link to={`/producto/${p.id}`} key={p.id}>
                  <img
                    src={getMainImage(p) || '/placeholder-product.png'}
                    alt={p.nombre || 'Cable'}
                    className="w-full aspect-[4/3] object-contain rounded-lg shadow-sm hover:scale-105 transition-transform bg-white"
                  />
                </Link>
              ))}
          </div>
          <Link
            to="/Productos/cables"
            className="text-indigo-600 text-sm mt-3 hover:underline font-medium"
          >
            Explora nuestros Cables →
          </Link>
        </motion.div>
      </section>




{/* ANIMACIÓN */}
<div className="max-w-[1600px] mx-auto mt-20 px-4">
  <Anim />
</div>



      {/* CONTACTO */}
      <motion.section
        className="max-w-4xl mx-auto px-6 py-20 text-center mt-10"
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-6 text-gray-800">
          ¿Tienes dudas?{" "}
          <span className="text-indigo-700">Contáctanos ahora</span>
        </h2>
        <p className="text-gray-600 mb-10 max-w-xl mx-auto">
          Nuestro equipo está listo para ayudarte por WhatsApp, teléfono o
          correo. Atención rápida y profesional.
        </p>
        <div className="bg-white shadow-2xl rounded-2xl p-10 max-w-3xl mx-auto flex flex-col gap-6 border border-indigo-100">
          <p className="flex items-center justify-center text-gray-700 gap-3">
            <FaMapMarkerAlt className="text-indigo-700" />
            <span>Av. Estrella Sadhalá, Santiago, República Dominicana</span>
          </p>
          <p className="flex items-center justify-center text-gray-700 gap-3">
            <FaPhone className="text-indigo-700" />
            <span>+1 (849)-635-7000 (Tienda)</span>
          </p>
          <p className="flex items-center justify-center text-gray-700 gap-3">
            <FaPhone className="text-indigo-700" />
            <span>+1 (809)-582-1212 (Internet)</span>
          </p>
          <p className="flex items-center justify-center text-gray-700 gap-3">
            <FaEnvelope className="text-indigo-700" />
            <span>playcenter121@gmail.com</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center mt-4">
            <a
              href="https://wa.me/18496357000?text=Hola%20PlayCenter%2C%20estoy%20interesad%40%20en%20un%20producto%20que%20vi%20en%20su%20página."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-700 text-white rounded-lg shadow-md hover:bg-indigo-800 transition w-full sm:w-auto"
            >
              <FaWhatsapp className="text-xl" />
              WhatsApp Tienda
            </a>
            <a
              href="https://wa.me/18095821212?text=Hola%20PlayCenter%2C%20estoy%20interesad%40%20en%20un%20producto%20que%20vi%20en%20su%20página."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-lg shadow-md hover:bg-gray-800 transition w-full sm:w-auto"
            >
              <FaWhatsapp className="text-xl" />
              WhatsApp Internet
            </a>
          </div>
        </div>
      </motion.section>
    </div>
  );
}

export default Inicio;
