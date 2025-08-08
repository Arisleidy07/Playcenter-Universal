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
import productosAll from "../data/productosAll.js";
import MouseTrail from "../components/mousetrail";


// Animación sutil para bloques y banners
const fadeIn = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};

const trailImages = Array.from({ length: 17 }, (_, i) => `/animacion/${i + 1}.png`);

function Inicio() {
  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-blue-100 min-h-screen">
      
      {/* VIDEO SOLO EN DESKTOP */}
      <div className="hidden sm:block w-full">
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
        className="hidden sm:block w-full max-w-[1600px] mx-auto px-4"
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <div className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-indigo-100">
          <SliderAnuncios />
        </div>
      </motion.div>

      {/* SLIDER SOLO MOBILE */}
      <motion.div
        className="block sm:hidden w-full max-w-[600px] mx-auto px-2 mt-4"
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <SliderAnunciosMovil />
      </motion.div>




      {/* BLOQUES CUADRADOS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-[1600px] mx-auto px-4 mt-14">
        {[
          {
            title: "Consolas",
            links: [
              { to: "/producto/cs5", img: "/Productos/ps4.jpg", alt: "PS4" },
              {
                to: "/producto/cs1",
                img: "/Productos/ps5.webp",
                alt: "PS5",
              },
              {
                to: "/producto/cs6",
                img: "/Productos/xboxone.webp",
                alt: "Xbox One",
              },
              {
                to: "/producto/cs3",
                img: "/Productos/nintendoswitch.jpg",
                alt: "Switch OLED",
              },
            ],
            explore: "/Productos/consolas",
          },
          {
            title: "Consolas Retro",
            links: [
              {
                to: "/producto/rc6",
                img: "/Productos/atari2600.png",
                alt: "Atari 2600",
              },
              {
                to: "/producto/rc5",
                img: "/Productos/gameboy.jpg",
                alt: "Game Boy",
              },
              {
                to: "/producto/rc3",
                img: "/Productos/segagenesis.webp",
                alt: "Sega Genesis",
              },
              {
                to: "/producto/rc4",
                img: "/Productos/playstation1.webp",
                alt: "PS1",
              },
            ],
            explore: "/Productos/retro-consolas",
          },
          {
            title: "Videojuegos",
            links: [
              {
                to: "/producto/vj6",
                img: "/Productos/Mario-Kart-8.jpeg",
                alt: "Mario Kart 8",
              },
              {
                to: "/producto/vj3",
                img: "/Productos/zelda.webp",
                alt: "Zelda BOTW",
              },
              {
                to: "/producto/vj5",
                img: "/Productos/spider-manps5.jpeg",
                alt: "Spider-Man PS5",
              },
              {
                to: "/producto/vj7",
                img: "/Productos/super-smash-bros.jpg",
                alt: "Super Smash Bros",
              },
            ],
            explore: "/Productos/videojuegos",
          },
          {
            title: "Retro Juegos",
            links: [
              {
                to: "/producto/rj3",
                img: "/Productos/dk.jpg",
                alt: "Donkey Kong Country",
              },
              {
                to: "/producto/rj4",
                img: "/Productos/crash-retro.png",
                alt: "Crash Bandicoot PS1",
              },
              {
                to: "/producto/rj1",
                img: "/Productos/mario-bros-.png",
                alt: "Super Mario Bros NES",
              },
              {
                to: "/producto/rj2",
                img: "/Productos/legen-of-zelda.png",
                alt: "Zelda NES",
              },
            ],
            explore: "/Productos/retro-juegos",
          },
        ].map((bloque, idx) => (
          <motion.div
            key={bloque.title}
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition h-[440px] flex flex-col justify-between p-5 group"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 * idx }}
          >
            <h3 className="text-xl font-bold mb-2 text-indigo-700 tracking-tight">
              {bloque.title}
            </h3>
            <div className="grid grid-cols-2 gap-2 flex-grow">
              {bloque.links.map((item, i) => (
                <Link to={item.to} key={i}>
                  <img
                    src={item.img}
                    alt={item.alt}
                    className="w-full aspect-[4/3] object-contain rounded-lg shadow-sm group-hover:scale-105 transition-transform"
                  />
                </Link>
              ))}
            </div>
            <Link
              to={bloque.explore}
              className="text-indigo-600 text-sm mt-3 hover:underline font-medium"
            >
              Explora nuestras {bloque.title} →
            </Link>
          </motion.div>
        ))}
      </section>

                        {/* BANNER afisionados - SOLO DESKTOP */}
<motion.div
  className="hidden lg:block max-w-[1600px] mx-auto px-4 mt-10"
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
      <section className="hidden lg:grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[1600px] mx-auto px-4 mt-14">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-7">
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
        className="hidden lg:block max-w-[1600px] mx-auto px-4 mt-10"
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-7">
            {productosAll
              .flatMap((cat) => cat.productos)
              .slice(0, 6)
              .map((producto) => (
                <Link to={`/producto/${producto.id}`} key={producto.id}>
                  <div className="bg-white rounded-xl overflow-hidden shadow hover:shadow-md transition">
                    <img
                      src={producto.imagen || producto.imagenes?.[0]}
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

      {/* SLIDER HOGAR INTELIGENTE */}
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
            {[
              {
                to: "/producto/hi1",
                img: "/Productos/focointeligente.webp",
                alt: "Foco inteligente Wi-Fi RGB",
              },
              {
                to: "/producto/hi2",
                img: "/Productos/enchufeinteligentewifi.jpg",
                alt: "Enchufe inteligente TP-Link",
              },
              {
                to: "/producto/hi4",
                img: "/Productos/sensormovimientowifi.jpg",
                alt: "Sensor de movimiento Wi-Fi",
              },
              {
                to: "/producto/hi8",
                img: "/Productos/echodot.png",
                alt: "Amazon Echo Dot",
              },
              {
                to: "/producto/hi9",
                img: "/Productos/alexaecho.webp",
                alt: "Amazon Echo Show 8",
              },
              {
                to: "/producto/hi11",
                img: "/Productos/smartplug.jpg",
                alt: "Smart Plug compatible con Alexa",
              },
            ].map((prod, idx) => (
              <Link to={prod.to} className="min-w-[180px] px-2" key={idx}>
                <img
                  src={prod.img}
                  alt={prod.alt}
                  className="rounded-xl hover:scale-110 transition object-cover w-full h-[180px]"
                />
              </Link>
            ))}
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

      {/* TU RINCÓN VARIADO */}
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
            {[
              {
                id: "rv1",
                nombre: "Bicicleta Urbana MTB 26'' Mongoose",
                img: "/Productos/mongose.jpg",
              },
              {
                id: "rv2",
                nombre: "Patineta Eléctrica Plegable",
                img: "/Productos/patinetaelectrica.jpg",
              },
              {
                id: "rv3",
                nombre: 'Hoverboard Autoequilibrado 10"',
                img: "/Productos/hoverboard.jpg",
              },
              {
                id: "rv4",
                nombre: "Patines en línea 4 ruedas",
                img: "/Productos/patines4ruedaasenlinea.jpeg",
              },
              {
                id: "rv5",
                nombre: "Patines clásicos 4 ruedas",
                img: "/Productos/patinesclasicos.webp",
              },
              {
                id: "rv6",
                nombre: "Ruedas de repuesto para patineta",
                img: "/Productos/ruedapatineta.webp",
              },
              {
                id: "rv7",
                nombre: "Casco Protector Urbano",
                img: "/Productos/casco.jpg",
              },
              {
                id: "rv8",
                nombre: "Botella Térmica 1L Acero Inoxidable",
                img: "/Productos/botella.jpg",
              },
              {
                id: "rv9",
                nombre: "Luz LED Recargable para Bicicleta",
                img: "/Productos/lucesbici.webp",
              },
            ].map((prod) => (
              <Link
                to={`/producto/${prod.id}`}
                key={prod.id}
                className="min-w-[180px] px-2"
                title={prod.nombre}
              >
                <img
                  src={prod.img}
                  alt={prod.nombre}
                  className="rounded-xl hover:scale-110 transition-transform duration-300 object-contain w-full h-[180px]"
                />
              </Link>
            ))}
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

      {/* BLOQUES: Cámaras, Discos Duros, Memorias USB, Cables */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-[1600px] mx-auto px-4 mt-16">
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
            {[
              {
                id: "cam1",
                nombre: "Hikvision Dome",
                img: "/Productos/hikvision.png",
              },
              {
                id: "cam2",
                nombre: "Dahua Bullet",
                img: "/Productos/dahua.webp",
              },
              {
                id: "cam3",
                nombre: "EZVIZ WiFi",
                img: "/Productos/ezviz.png",
              },
              {
                id: "cam4",
                nombre: "TP-Link Tapo",
                img: "/Productos/tapo.webp",
              },
            ].map((prod) => (
              <Link to={`/producto/${prod.id}`} key={prod.id}>
                <img
                  src={prod.img}
                  alt={prod.nombre}
                  className="w-full aspect-[4/3] object-cover rounded-lg shadow-sm hover:scale-105 transition-transform"
                />
              </Link>
            ))}
          </div>
          <Link
            to="/categoria/camaras-vigilancia"
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
            {[
              {
                id: "dd1",
                nombre: "Seagate 1TB",
                img: "/Productos/seagate.png",
              },
              {
                id: "dd2",
                nombre: "SSD Samsung",
                img: "/Productos/samsung.webp",
              },
              { id: "dd3", nombre: "WD 2TB", img: "/Productos/wd2tb.jpg" },
              {
                id: "dd4",
                nombre: "Crucial X6",
                img: "/Productos/crucial.jpg",
              },
            ].map((prod) => (
              <Link to={`/producto/${prod.id}`} key={prod.id}>
                <img
                  src={prod.img}
                  alt={prod.nombre}
                  className="w-full aspect-[4/3] object-cover rounded-lg shadow-sm hover:scale-105 transition-transform"
                />
              </Link>
            ))}
          </div>
          <Link
            to="/categoria/discos-duros"
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
            {[
              {
                id: "usb1",
                nombre: "USB SanDisk 64GB",
                img: "/Productos/sandisk.jpeg",
              },
              {
                id: "usb2",
                nombre: "Kingston 128GB USB 3.1",
                img: "/Productos/kingston.webp",
              },
              {
                id: "usb3",
                nombre: "HP v150w 32GB",
                img: "/Productos/hp.jpeg",
              },
              {
                id: "usb4",
                nombre: "Corsair Flash Voyager 256GB",
                img: "/Productos/corsair.avif",
              },
            ].map((prod) => (
              <Link to={`/producto/${prod.id}`} key={prod.id}>
                <img
                  src={prod.img}
                  alt={prod.nombre}
                  className="w-full aspect-[4/3] object-contain rounded-lg shadow-sm hover:scale-105 transition-transform"
                />
              </Link>
            ))}
          </div>
          <Link
            to="/categoria/memorias-usb"
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
            {[
              { id: "cb1", img: "/Productos/usb-c.jpg" },
              { id: "cb2", img: "/Productos/hdmi4k.jpeg" },
              { id: "cb3", img: "/Productos/micro.jpg" },
              { id: "cb4", img: "/Productos/ethernet.jpeg" },
            ].map((prod) => (
              <Link to={`/producto/${prod.id}`} key={prod.id}>
                <img
                  src={prod.img}
                  alt="Cable"
                  className="w-full aspect-[4/3] object-contain rounded-lg shadow-sm hover:scale-105 transition-transform"
                />
              </Link>
            ))}
          </div>
          <Link
            to="/categoria/cables"
            className="text-indigo-600 text-sm mt-3 hover:underline font-medium"
          >
            Explora nuestros Cables →
          </Link>
        </motion.div>
      </section>



    {/* Aquí inserta el rastro de imágenes */}
      <div className="max-w-[1600px] mx-auto mt-20 px-4">
        <MouseTrail
          items={trailImages}
          maxNumberOfImages={5}
          distance={100}
          imgClass="w-60 h-60"
          fadeAnimation={true}
        />
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
