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
import productosAll from "../data/productosAll";

function Inicio() {
  return (
    <div className="bg-gray-100 min-h-screen">
      {/* SLIDER SOLO DESKTOP - SIN ESPACIOS BLANCOS */}
      <div className="hidden sm:block w-full max-w-[1600px] mx-auto">
        <div className="rounded-lg overflow-hidden shadow-xl">
          <SliderAnuncios />
        </div>
      </div>

      {/* SLIDER SOLO MOBILE */}
      <div className="block sm:hidden w-full max-w-[600px] mx-auto px-2 mt-4">
        <SliderAnunciosMovil />
      </div>

      {/* BANNERS GRANDES - SOLO COMPUTADORA */}
      <section className="hidden lg:grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-[1600px] mx-auto px-4 mt-12">
        <div className="overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition h-[220px] sm:h-[300px] md:h-[400px]">
          <Link to="/productos/retro-consolas" className="block w-full h-full">
            <img
              src="/ads/retro.png"
              alt="Retro Consolas"
              className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-300"
            />
          </Link>
        </div>
        <div className="overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition h-[220px] sm:h-[300px] md:h-[400px]">
          <Link to="/productos/camaras" className="block w-full h-full">
            <img
              src="/ads/camaras.png"
              alt="Cámaras"
              className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-300"
            />
          </Link>
        </div>
      </section>

      {/* BLOQUES CUADRADOS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1600px] mx-auto px-4 mt-10">
        {/* Consolas */}
        <div className="bg-white rounded-lg shadow hover:shadow-xl transition h-[440px] flex flex-col justify-between p-4">
          <h3 className="text-xl font-semibold mb-2">Consolas</h3>
          <div className="grid grid-cols-2 gap-2 flex-grow">
            <Link to="/producto/cs5">
              <img
                src="/Productos/ps4.jpg"
                alt="PS4"
                className="w-full aspect-[4/3] object-contain rounded"
              />
            </Link>
            <Link to="/producto/cs1">
              <img
                src="/Productos/ps5.webp"
                alt="PS5"
                className="w-full aspect-[4/3] object-contain rounded"
              />
            </Link>
            <Link to="/producto/cs6">
              <img
                src="/Productos/xboxone.webp"
                alt="Xbox One"
                className="w-full aspect-[4/3] object-contain rounded"
              />
            </Link>
            <Link to="/producto/cs3">
              <img
                src="/Productos/nintendoswitch.jpg"
                alt="Switch OLED"
                className="w-full aspect-[4/3] object-contain rounded"
              />
            </Link>
          </div>
          <Link
            to="/productos/consolas"
            className="text-blue-600 text-sm mt-3 hover:underline"
          >
            Explora nuestras Consolas →
          </Link>
        </div>

        {/* Consolas Retro */}
        <div className="bg-white rounded-lg shadow hover:shadow-xl transition h-[440px] flex flex-col justify-between p-4">
          <h3 className="text-xl font-semibold mb-2">Consolas Retro</h3>
          <div className="grid grid-cols-2 gap-2 flex-grow">
            <Link to="/producto/rc6">
              <img
                src="/Productos/atari2600.png"
                alt="Atari 2600"
                className="w-full aspect-[4/3] object-cover rounded"
              />
            </Link>
            <Link to="/producto/rc5">
              <img
                src="/Productos/gameboy.jpg"
                alt="Game Boy"
                className="w-full aspect-[4/3] object-cover rounded"
              />
            </Link>
            <Link to="/producto/rc3">
              <img
                src="/Productos/segagenesis.webp"
                alt="Sega Genesis"
                className="w-full aspect-[4/3] object-cover rounded"
              />
            </Link>
            <Link to="/producto/rc4">
              <img
                src="/Productos/playstation1.webp"
                alt="PS1"
                className="w-full aspect-[4/3] object-cover rounded"
              />
            </Link>
          </div>
          <Link
            to="/productos/retro-consolas"
            className="text-blue-600 text-sm mt-3 hover:underline"
          >
            Explora nuestras Consolas Retro →
          </Link>
        </div>

        {/* Videojuegos */}
        <div className="bg-white rounded-lg shadow hover:shadow-xl transition h-[440px] flex flex-col justify-between p-4">
          <h3 className="text-xl font-semibold mb-2">Videojuegos</h3>
          <div className="grid grid-cols-2 gap-2 flex-grow">
            <Link to="/producto/vj6">
              <img
                src="/Productos/Mario-Kart-8.jpeg"
                alt="Mario Kart 8"
                className="w-full aspect-[4/3] object-contain rounded"
              />
            </Link>
            <Link to="/producto/vj3">
              <img
                src="/Productos/zelda.webp"
                alt="Zelda BOTW"
                className="w-full aspect-[4/3] object-contain rounded"
              />
            </Link>
            <Link to="/producto/vj5">
              <img
                src="/Productos/spider-manps5.jpeg"
                alt="Spider-Man PS5"
                className="w-full aspect-[4/3] object-contain rounded"
              />
            </Link>
            <Link to="/producto/vj7">
              <img
                src="/Productos/super-smash-bros.jpg"
                alt="Super Smash Bros"
                className="w-full aspect-[4/3] object-contain rounded"
              />
            </Link>
          </div>
          <Link
            to="/productos/videojuegos"
            className="text-blue-600 text-sm mt-3 hover:underline"
          >
            Explora nuestros Videojuegos →
          </Link>
        </div>

        {/* Retro Juegos */}
        <div className="bg-white rounded-lg shadow hover:shadow-xl transition h-[440px] flex flex-col justify-between p-4">
          <h3 className="text-xl font-semibold mb-2">Retro Juegos</h3>
          <div className="grid grid-cols-2 gap-2 flex-grow">
            <Link to="/producto/rj3">
              <img
                src="/Productos/donkeykongnretro.jpeg"
                alt="Donkey Kong Country"
                className="w-full aspect-[4/3] object-contain rounded"
              />
            </Link>
            <Link to="/producto/rj4">
              <img
                src="/Productos/crash-bandicoat-PS1.webp"
                alt="Crash Bandicoot PS1"
                className="w-full aspect-[4/3] object-contain rounded"
              />
            </Link>
            <Link to="/producto/rj1">
              <img
                src="/Productos/mariobrosretro.jpg"
                alt="Super Mario Bros NES"
                className="w-full aspect-[4/3] object-contain rounded"
              />
            </Link>
            <Link to="/producto/rj2">
              <img
                src="/Productos/zeldaretro.jpg"
                alt="Zelda NES"
                className="w-full aspect-[4/3] object-contain rounded"
              />
            </Link>
          </div>
          <Link
            to="/productos/retro-juegos"
            className="text-blue-600 text-sm mt-3 hover:underline"
          >
            Explora nuestros Retro Juegos →
          </Link>
        </div>
      </section>

      {/* CATEGORÍAS DESTACADAS */}
      <section className="max-w-[1600px] mx-auto mt-16 px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Explora nuestras categorías</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            <Link to="/productos/audifonos">
              <img
                src="/ads/audifonoscate.png"
                alt="Audífonos"
                className="rounded-lg hover:scale-105 transition object-cover w-full h-[200px]"
              />
            </Link>
            <Link to="/productos/mouses">
              <img
                src="/ads/mousecate.png"
                alt="Mouses"
                className="rounded-lg hover:scale-105 transition object-cover w-full h-[200px]"
              />
            </Link>
            <Link to="/productos/teclados">
              <img
                src="/ads/tecladocate.png"
                alt="Teclados"
                className="rounded-lg hover:scale-105 transition object-cover w-full h-[200px]"
              />
            </Link>
            <Link to="/productos/camaras">
              <img
                src="/ads/camaracate.png"
                alt="Cámaras"
                className="rounded-lg hover:scale-105 transition object-cover w-full h-[200px]"
              />
            </Link>
            <Link to="/productos/discos-duros">
              <img
                src="/ads/discodurocate.png"
                alt="Discos Duros"
                className="rounded-lg hover:scale-105 transition object-cover w-full h-[200px]"
              />
            </Link>
            <Link to="/productos/controles">
              <img
                src="/ads/controlcate.png"
                alt="Controles"
                className="rounded-lg hover:scale-105 transition object-cover w-full h-[200px]"
              />
            </Link>
          </div>
          <div className="text-right mt-4">
            <Link to="/productos" className="text-blue-600 hover:underline text-sm">
              Ver todas las categorías →
            </Link>
          </div>
        </div>
      </section>

      {/* GALERÍA DESTACADA DE PRODUCTOS */}
      <section className="max-w-[1600px] mx-auto mt-16 px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Descubre nuestros productos</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {productosAll
              .flatMap((cat) => cat.productos)
              .slice(0, 6)
              .map((producto) => (
                <Link to={`/producto/${producto.id}`} key={producto.id}>
                  <div className="bg-white rounded-lg overflow-hidden shadow hover:shadow-md transition">
                    <img
                      src={producto.imagen || producto.imagenes?.[0]}
                      alt={producto.nombre}
                      className="w-full h-[180px] object-contain p-2"
                    />
                  </div>
                </Link>
              ))}
          </div>
          <div className="text-right mt-4">
            <Link
              to="/productos"
              className="text-blue-600 hover:underline text-sm"
            >
              Explora nuestros productos →
            </Link>
          </div>
        </div>
      </section>

      {/* SLIDER HOGAR INTELIGENTE */}
      <section className="max-w-[1600px] mx-auto mt-16 px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Hogar Inteligente en Oferta</h2>
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
            {/* Foco inteligente */}
            <Link to="/producto/hi1" className="min-w-[180px] px-2">
              <img
                src="/Productos/focointeligente.webp"
                alt="Foco inteligente Wi-Fi RGB"
                className="rounded-lg hover:scale-105 transition object-cover w-full h-[180px]"
              />
            </Link>
            {/* Enchufe inteligente */}
            <Link to="/producto/hi2" className="min-w-[180px] px-2">
              <img
                src="/Productos/enchufeinteligentewifi.jpg"
                alt="Enchufe inteligente TP-Link"
                className="rounded-lg hover:scale-105 transition object-cover w-full h-[180px]"
              />
            </Link>
            {/* Sensor movimiento */}
            <Link to="/producto/hi4" className="min-w-[180px] px-2">
              <img
                src="/Productos/sensormovimientowifi.jpg"
                alt="Sensor de movimiento Wi-Fi"
                className="rounded-lg hover:scale-105 transition object-cover w-full h-[180px]"
              />
            </Link>
            {/* Echo Dot */}
            <Link to="/producto/hi8" className="min-w-[180px] px-2">
              <img
                src="/Productos/echodot.png"
                alt="Amazon Echo Dot"
                className="rounded-lg hover:scale-105 transition object-cover w-full h-[180px]"
              />
            </Link>
            {/* Echo Show */}
            <Link to="/producto/hi9" className="min-w-[180px] px-2">
              <img
                src="/Productos/alexaecho.webp"
                alt="Amazon Echo Show 8"
                className="rounded-lg hover:scale-105 transition object-cover w-full h-[180px]"
              />
            </Link>
            {/* Smart Plug Alexa */}
            <Link to="/producto/hi11" className="min-w-[180px] px-2">
              <img
                src="/Productos/smartplug.jpg"
                alt="Smart Plug compatible con Alexa"
                className="rounded-lg hover:scale-105 transition object-cover w-full h-[180px]"
              />
            </Link>
          </div>
          <div className="text-right mt-4">
            <Link
              to="/productos/hogar-inteligente"
              className="text-blue-600 hover:underline text-sm"
            >
              Descubre cómo transformar tu casa en un hogar inteligente →
            </Link>
          </div>
        </div>
      </section>

      {/* TU RINCÓN VARIADO */}
      <section className="max-w-[1600px] mx-auto mt-16 px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4 ">Tu Rincón Variado</h2>
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
            {[
              {
                id: "rv1",
                nombre: "Bicicleta Urbana MTB 26'' Mongoose",
                img: "/Productos/mongose.jpg",
              },
              { id: "rv2", nombre: "Patineta Eléctrica Plegable", img: "/Productos/patinetaelectrica.jpg" },
              { id: "rv3", nombre: "Hoverboard Autoequilibrado 10\"", img: "/Productos/hoverboard.jpg" },
              { id: "rv4", nombre: "Patines en línea 4 ruedas", img: "/Productos/patines4ruedaasenlinea.jpeg" },
              { id: "rv5", nombre: "Patines clásicos 4 ruedas", img: "/Productos/patinesclasicos.webp" },
              { id: "rv6", nombre: "Ruedas de repuesto para patineta", img: "/Productos/ruedapatineta.webp" },
              { id: "rv7", nombre: "Casco Protector Urbano", img: "/Productos/casco.jpg" },
              { id: "rv8", nombre: "Botella Térmica 1L Acero Inoxidable", img: "/Productos/botella.jpg" },
              { id: "rv9", nombre: "Luz LED Recargable para Bicicleta", img: "/Productos/lucesbici.webp" },
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
                  className="rounded-lg hover:scale-105 transition-transform duration-300 object-contain w-full h-[180px]"
                />
              </Link>
            ))}
          </div>
          <div className="text-right mt-4">
            <Link
              to="/productos/tu-rincon-variado"
              className="text-blue-600 hover:underline text-sm"
            >
              Explora nuestro Rincón Variado →
            </Link>
          </div>
        </div>
      </section>

      {/* BANNERS GRANDES - RESPONSIVE */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-[1600px] mx-auto px-4 mt-12">
        <div className="overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition h-[220px] sm:h-[300px] md:h-[400px]">
          <Link to="/productos/consolas" className="block w-full h-full">
            <img
              src="/ads/nintendoswtitchads.png"
              alt="Consolas"
              className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-300"
            />
          </Link>
        </div>
        <div className="overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition h-[220px] sm:h-[300px] md:h-[400px]">
          <Link to="/productos/videojuegos" className="block w-full h-full">
            <img
              src="/ads/videjuegosads.png"
              alt="Videojuegos"
              className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-300"
            />
          </Link>
        </div>
      </section>

      {/* CONTACTO */}
      <footer className="bg-gray-800 text-white mt-20 py-10">
        <div className="max-w-[1600px] mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-xl font-semibold mb-4">Contacto</h4>
            <p>Somos tu tienda de videojuegos y consolas favorita.</p>
          </div>
          <div>
            <h4 className="text-xl font-semibold mb-4">Dirección</h4>
            <p className="flex items-center gap-2">
              <FaMapMarkerAlt /> Santo Domingo, República Dominicana
            </p>
          </div>
          <div>
            <h4 className="text-xl font-semibold mb-4">Teléfono</h4>
            <p className="flex items-center gap-2">
              <FaPhone /> +1 809 123 4567
            </p>
          </div>
          <div>
            <h4 className="text-xl font-semibold mb-4">Email</h4>
            <p className="flex items-center gap-2">
              <FaEnvelope /> contacto@tiendadejuegos.com
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Inicio;
