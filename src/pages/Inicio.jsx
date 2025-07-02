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
import ArcadeCallToAction from "../components/ArcadeCallToAction";
import productosAll from "../data/productosAll";

function Inicio() {
  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Si quieres mantener espacio para el header fijo, controla ese espacio desde el Header.jsx */}
      
      {/* SLIDER GRANDE */}
      <div className="w-full max-w-[1600px] mx-auto px-4">
        <div className="rounded-lg overflow-hidden shadow-xl">
          <SliderAnuncios />
        </div>
      </div>

      {/* BANNERS GRANDES */}
      <section className="grid grid-cols-2 gap-4 sm:gap-6 max-w-[1600px] mx-auto px-4 mt-12">
        <div className="overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition">
          <Link to="/productos/retro-consolas">
            <img
              src="/ads/retro.png"
              alt="Retro Consolas"
              className="w-full h-[160px] sm:h-[220px] md:h-[320px] object-cover hover:scale-105 transition-transform duration-300"
            />
          </Link>
        </div>
        <div className="overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition">
          <Link to="/productos/camaras">
            <img
              src="/ads/camaras.png"
              alt="Cámaras"
              className="w-full h-[160px] sm:h-[220px] md:h-[320px] object-cover hover:scale-105 transition-transform duration-300"
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
              <img src="/Productos/ps4.jpg" alt="PS4" className="w-full aspect-[4/3] object-contain rounded" />
            </Link>
            <Link to="/producto/cs1">
              <img src="/Productos/ps5.webp" alt="PS5" className="w-full aspect-[4/3] object-contain rounded" />
            </Link>
            <Link to="/producto/cs6">
              <img src="/Productos/xboxone.webp" alt="Xbox One" className="w-full aspect-[4/3] object-contain rounded" />
            </Link>
            <Link to="/producto/cs3">
              <img src="/Productos/nintendoswitch.jpg" alt="Switch OLED" className="w-full aspect-[4/3] object-contain rounded" />
            </Link>
          </div>
          <Link to="/productos/consolas" className="text-blue-600 text-sm mt-3 hover:underline">
            Explora nuestras Consolas →
          </Link>
        </div>

        {/* Consolas Retro */}
        <div className="bg-white rounded-lg shadow hover:shadow-xl transition h-[440px] flex flex-col justify-between p-4">
          <h3 className="text-xl font-semibold mb-2">Consolas Retro</h3>
          <div className="grid grid-cols-2 gap-2 flex-grow">
            <Link to="/producto/rc6">
              <img src="/Productos/atari2600.png" alt="Atari 2600" className="w-full aspect-[4/3] object-cover rounded" />
            </Link>
            <Link to="/producto/rc5">
              <img src="/Productos/gameboy.jpg" alt="Game Boy" className="w-full aspect-[4/3] object-cover rounded" />
            </Link>
            <Link to="/producto/rc3">
              <img src="/Productos/segagenesis.webp" alt="Sega Genesis" className="w-full aspect-[4/3] object-cover rounded" />
            </Link>
            <Link to="/producto/rc4">
              <img src="/Productos/playstation1.webp" alt="PS1" className="w-full aspect-[4/3] object-cover rounded" />
            </Link>
          </div>
          <Link to="/productos/retro-consolas" className="text-blue-600 text-sm mt-3 hover:underline">
            Explora nuestras Consolas Retro →
          </Link>
        </div>

        {/* Videojuegos */}
        <div className="bg-white rounded-lg shadow hover:shadow-xl transition h-[440px] flex flex-col justify-between p-4">
          <h3 className="text-xl font-semibold mb-2">Videojuegos</h3>
          <div className="grid grid-cols-2 gap-2 flex-grow">
            <Link to="/producto/vj6">
              <img src="/Productos/Mario-Kart-8.jpeg" alt="Mario Kart 8" className="w-full aspect-[4/3] object-contain rounded" />
            </Link>
            <Link to="/producto/vj3">
              <img src="/Productos/zelda.webp" alt="Zelda BOTW" className="w-full aspect-[4/3] object-contain rounded" />
            </Link>
            <Link to="/producto/vj5">
              <img src="/Productos/spider-manps5.jpeg" alt="Spider-Man PS5" className="w-full aspect-[4/3] object-contain rounded" />
            </Link>
            <Link to="/producto/vj7">
              <img src="/Productos/super-smash-bros.jpg" alt="Super Smash Bros" className="w-full aspect-[4/3] object-contain rounded" />
            </Link>
          </div>
          <Link to="/productos/videojuegos" className="text-blue-600 text-sm mt-3 hover:underline">
            Explora nuestros Videojuegos →
          </Link>
        </div>

        {/* Retro Juegos */}
        <div className="bg-white rounded-lg shadow hover:shadow-xl transition h-[440px] flex flex-col justify-between p-4">
          <h3 className="text-xl font-semibold mb-2">Retro Juegos</h3>
          <div className="grid grid-cols-2 gap-2 flex-grow">
            <Link to="/producto/rj3">
              <img src="/Productos/donkeykongnretro.jpeg" alt="Donkey Kong Country" className="w-full aspect-[4/3] object-contain rounded" />
            </Link>
            <Link to="/producto/rj4">
              <img src="/Productos/crash-bandicoat-PS1.webp" alt="Crash Bandicoot PS1" className="w-full aspect-[4/3] object-contain rounded" />
            </Link>
            <Link to="/producto/rj1">
              <img src="/Productos/mariobrosretro.jpg" alt="Super Mario Bros NES" className="w-full aspect-[4/3] object-contain rounded" />
            </Link>
            <Link to="/producto/rj2">
              <img src="/Productos/zeldaretro.jpg" alt="Zelda NES" className="w-full aspect-[4/3] object-contain rounded" />
            </Link>
          </div>
          <Link to="/productos/retro-juegos" className="text-blue-600 text-sm mt-3 hover:underline">
            Explora nuestros Retro Juegos →
          </Link>
        </div>
      </section>

{/* CATEGORÍAS DESTACADAS */}
      <section className="max-w-[1600px] mx-auto mt-16 px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Explora nuestras categorías</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
      <Link to="/productos/audifonos">
        <img src="/ads/audifonoscate.png" alt="Audífonos" className="rounded-lg hover:scale-105 transition object-cover w-full h-[200px]" />
      </Link>
      <Link to="/productos/mouses">
        <img src="/ads/mousecate.png" alt="Mouses" className="rounded-lg hover:scale-105 transition object-cover w-full h-[200px]" />
      </Link>
      <Link to="/productos/teclados">
        <img src="/ads/tecladocate.png" alt="Teclados" className="rounded-lg hover:scale-105 transition object-cover w-full h-[200px]" />
      </Link>
      <Link to="/productos/camaras">
        <img src="/ads/camaracate.png" alt="Cámaras" className="rounded-lg hover:scale-105 transition object-cover w-full h-[200px]" />
      </Link>
      <Link to="/productos/discos-duros">
        <img src="/ads/discodurocate.png" alt="Discos Duros" className="rounded-lg hover:scale-105 transition object-cover w-full h-[200px]" />
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
            <Link to="/productos" className="text-blue-600 hover:underline text-sm">
              Ver todos los productos →
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

      {/* BANNERS GRANDES - RESPONSIVE */}
      <section className="grid grid-cols-2 gap-4 sm:gap-6 max-w-[1600px] mx-auto px-4 mt-12">
        <div className="overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition">
          <Link to="/productos/consolas" className="block w-full h-[160px] sm:h-[260px] md:h-[400px]">
            <img
              src="/ads/nintendoswtitchads.png"
              alt="Consolas"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </Link>
        </div>
        <div className="overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition">
          <Link to="/productos/controles" className="block w-full h-[160px] sm:h-[260px] md:h-[400px]">
            <img
              src="/ads/controlads.png"
              alt="Controles"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </Link>
        </div>
      </section>





{/* BLOQUES CUADRADOS */}
<section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1600px] mx-auto px-4 mt-10">

  {/* Bloque 1 - Cámaras de Vigilancia */}
  <div className="bg-white rounded-lg shadow hover:shadow-xl transition h-[440px] flex flex-col justify-between p-4">
    <h3 className="text-xl font-semibold mb-2">Cámaras de Vigilancia</h3>
    <div className="grid grid-cols-2 gap-2 flex-grow">
      {[
        { id: "cam1", nombre: "Hikvision Dome", img: "/Productos/hikvision.png" },
        { id: "cam2", nombre: "Dahua Bullet", img: "/Productos/dahua.webp" },
        { id: "cam3", nombre: "EZVIZ WiFi", img: "/Productos/ezviz.png" },
        { id: "cam4", nombre: "TP-Link Tapo", img: "/Productos/tapo.webp" },
      ].map((prod) => (
        <Link to={`/producto/${prod.id}`} key={prod.id}>
          <img
            src={prod.img}
            alt={prod.nombre}
            className="w-full aspect-[4/3] object-cover rounded"
          />
        </Link>
      ))}
    </div>
    <Link to="/categoria/camaras-vigilancia" className="text-blue-600 text-sm mt-3 hover:underline">
      Explora nuestras Cámaras de Vigilancia →
    </Link>
  </div>

  {/* Bloque 2 - Discos Duros */}
  <div className="bg-white rounded-lg shadow hover:shadow-xl transition h-[440px] flex flex-col justify-between p-4">
    <h3 className="text-xl font-semibold mb-2">Discos Duros</h3>
    <div className="grid grid-cols-2 gap-2 flex-grow">
      {[
        { id: "dd1", nombre: "Seagate 1TB", img: "/Productos/seagate.png" },
        { id: "dd2", nombre: "SSD Samsung", img: "/Productos/samsung.webp" },
        { id: "dd3", nombre: "WD 2TB", img: "/Productos/wd2tb.jpg" },
        { id: "dd4", nombre: "Crucial X6", img: "/Productos/crucial.jpg" },
      ].map((prod) => (
        <Link to={`/producto/${prod.id}`} key={prod.id}>
          <img
            src={prod.img}
            alt={prod.nombre}
            className="w-full aspect-[4/3] object-cover rounded"
          />
        </Link>
      ))}
    </div>
    <Link to="/categoria/discos-duros" className="text-blue-600 text-sm mt-3 hover:underline">
      Explora nuestros Discos Duros →
    </Link>
  </div>

  {/* Bloque 3 - Memorias USB */}
  <div className="bg-white rounded-lg shadow hover:shadow-xl transition h-[440px] flex flex-col justify-between p-4">
    <h3 className="text-xl font-semibold mb-2">Memorias USB</h3>
    <div className="grid grid-cols-2 gap-2 flex-grow">
      {[
        { id: "usb1", nombre: "SanDisk 64GB", img: "/Productos/sandisk.jpeg" },
        { id: "usb2", nombre: "Kingston 128GB", img: "/Productos/kingston.webp" },
        { id: "usb3", nombre: "HP 32GB", img: "/Productos/hp.jpeg" },
        { id: "usb4", nombre: "Corsair 256GB", img: "/Productos/corsair.avif" },
      ].map((prod) => (
        <Link to={`/producto/${prod.id}`} key={prod.id}>
          <img
            src={prod.img}
            alt={prod.nombre}
            className="w-full aspect-[4/3] object-cover rounded"
          />
        </Link>
      ))}
    </div>
    <Link to="/categoria/memorias-usb" className="text-blue-600 text-sm mt-3 hover:underline">
      Explora nuestras Memorias USB →
    </Link>
  </div>

  {/* Bloque 4 - Cables */}
  <div className="bg-white rounded-lg shadow hover:shadow-xl transition h-[440px] flex flex-col justify-between p-4">
    <h3 className="text-xl font-semibold mb-2">Cables</h3>
    <div className="grid grid-cols-2 gap-2 flex-grow">
      {[
        { id: "cb1", nombre: "USB-C a Lightning", img: "/Productos/usb-c.jpg" },
        { id: "cb2", nombre: "HDMI 4K", img: "/Productos/hdmi4k.jpeg" },
        { id: "cb3", nombre: "USB 3.0 Micro", img: "/Productos/micro.jpg" },
        { id: "cb4", nombre: "Ethernet Cat6", img: "/Productos/ethernet.jpeg" },
      ].map((prod) => (
        <Link to={`/producto/${prod.id}`} key={prod.id}>
          <img
            src={prod.img}
            alt={prod.nombre}
            className="w-full aspect-[4/3] object-cover rounded"
          />
        </Link>
      ))}
    </div>
    <Link to="/categoria/cables" className="text-blue-600 text-sm mt-3 hover:underline">
      Explora nuestros Cables →
    </Link>
  </div>

</section>




      {/* BANNERS EXTRAS */}
      <section className="grid grid-cols-2 gap-4 sm:gap-6 max-w-[1600px] mx-auto px-4 mt-12">
        <div className="overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition">
          <Link to="/productos/hogar-inteligente" className="block w-full h-[160px] sm:h-[260px] md:h-[400px]">
            <img
              src="/ads/smart.png"
              alt="Hogar Inteligente"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </Link>
        </div>
        <div className="overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition">
          <Link to="/productos" className="block w-full h-[160px] sm:h-[260px] md:h-[400px]">
            <img
              src="/ads/subedenivel.png"
              alt="Sube de Nivel"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </Link>
        </div>
      </section>





      {/* LLAMADO A ARCADE */}
      <ArcadeCallToAction />

      {/* CONTACTO */}
      <section className="max-w-[1600px] mx-auto mt-16 px-4 pb-16">
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
              <FaWhatsapp className="text-xl" />
              Enviar WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Inicio;
