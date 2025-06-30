import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaWhatsapp, FaMapMarkerAlt, FaPhone, FaEnvelope } from "react-icons/fa";
import SliderAnuncios from "../components/SliderAnuncios";
import ArcadeCallToAction from "../components/ArcadeCallToAction";

function Inicio() {
  return (
    <div className="pt-[80px] bg-gray-100 min-h-screen">
      
      {/* SLIDER GRANDE */}
      <div className="w-full max-w-[1600px] mx-auto px-4">
        <div className="rounded-lg overflow-hidden shadow-xl">
          <SliderAnuncios />
        </div>
      </div>

      {/* BANNERS GRANDES */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-[1600px] mx-auto px-4 mt-12">
        <div className="overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition">
          <Link to="/productos/retro-consolas">
            <img
              src="/ads/retro.png"
              alt="Retro Consolas"
              className="w-full h-[320px] object-cover hover:scale-105 transition-transform duration-300"
            />
          </Link>
        </div>
        <div className="overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition">
          <Link to="/productos/camaras">
            <img
              src="/ads/camaras.png"
              alt="Cámaras"
              className="w-full h-[320px] object-cover hover:scale-105 transition-transform duration-300"
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
            <Link to="/producto/cs5"><img src="/Productos/ps4.jpg" alt="PS4" className="w-full aspect-[4/3] object-cover rounded" /></Link>
            <Link to="/producto/cs1"><img src="/Productos/ps5.webp" alt="PS5" className="w-full aspect-[4/3] object-cover rounded" /></Link>
            <Link to="/producto/cs6"><img src="/Productos/xboxone.webp" alt="Xbox One" className="w-full aspect-[4/3] object-cover rounded" /></Link>
            <Link to="/producto/cs3"><img src="/Productos/nintendoswitch.jpg" alt="Switch OLED" className="w-full aspect-[4/3] object-cover rounded" /></Link>
          </div>
          <Link to="/productos/consolas" className="text-blue-600 text-sm mt-3 hover:underline">Explora nuestras Consolas →</Link>
        </div>

        {/* Consolas Retro */}
        <div className="bg-white rounded-lg shadow hover:shadow-xl transition h-[440px] flex flex-col justify-between p-4">
          <h3 className="text-xl font-semibold mb-2">Consolas Retro</h3>
          <div className="grid grid-cols-2 gap-2 flex-grow">
            <Link to="/producto/rc6"><img src="/Productos/atari2600.png" alt="Atari 2600" className="w-full aspect-[4/3] object-cover rounded" /></Link>
            <Link to="/producto/rc5"><img src="/Productos/gameboy.jpg" alt="Game Boy" className="w-full aspect-[4/3] object-cover rounded" /></Link>
            <Link to="/producto/rc3"><img src="/Productos/segagenesis.webp" alt="Sega Genesis" className="w-full aspect-[4/3] object-cover rounded" /></Link>
            <Link to="/producto/rc4"><img src="/Productos/playstation1.webp" alt="PS1" className="w-full aspect-[4/3] object-cover rounded" /></Link>
          </div>
          <Link to="/productos/retro-consolas" className="text-blue-600 text-sm mt-3 hover:underline">Explora nuestras Consolas Retro →</Link>
        </div>

        {/* Videojuegos */}
        <div className="bg-white rounded-lg shadow hover:shadow-xl transition h-[440px] flex flex-col justify-between p-4">
          <h3 className="text-xl font-semibold mb-2">Videojuegos</h3>
          <div className="grid grid-cols-2 gap-2 flex-grow">
            <Link to="/producto/vj6"><img src="/Productos/Mario-Kart-8.jpeg" alt="Mario Kart 8" className="w-full aspect-[4/3] object-cover rounded" /></Link>
            <Link to="/producto/vj3"><img src="/Productos/zelda.webp" alt="Zelda BOTW" className="w-full aspect-[4/3] object-cover rounded" /></Link>
            <Link to="/producto/vj5"><img src="/Productos/spider-manps5.jpeg" alt="Spider-Man PS5" className="w-full aspect-[4/3] object-cover rounded" /></Link>
            <Link to="/producto/vj7"><img src="/Productos/super-smash-bros.jpg" alt="Super Smash Bros" className="w-full aspect-[4/3] object-cover rounded" /></Link>
          </div>
          <Link to="/productos/videojuegos" className="text-blue-600 text-sm mt-3 hover:underline">Explora nuestros Videojuegos →</Link>
        </div>

        {/* Retro Juegos */}
        <div className="bg-white rounded-lg shadow hover:shadow-xl transition h-[440px] flex flex-col justify-between p-4">
          <h3 className="text-xl font-semibold mb-2">Retro Juegos</h3>
          <div className="grid grid-cols-2 gap-2 flex-grow">
            <Link to="/producto/rj3"><img src="/Productos/donkeykongnretro.jpeg" alt="Donkey Kong Country" className="w-full aspect-[4/3] object-cover rounded" /></Link>
            <Link to="/producto/rj4"><img src="/Productos/crash-bandicoat-PS1.webp" alt="Crash Bandicoot PS1" className="w-full aspect-[4/3] object-cover rounded" /></Link>
            <Link to="/producto/rj1"><img src="/Productos/mariobrosretro.jpg" alt="Super Mario Bros NES" className="w-full aspect-[4/3] object-cover rounded" /></Link>
            <Link to="/producto/rj2"><img src="/Productos/zeldaretro.jpg" alt="Zelda NES" className="w-full aspect-[4/3] object-cover rounded" /></Link>
          </div>
          <Link to="/productos/retro-juegos" className="text-blue-600 text-sm mt-3 hover:underline">Explora nuestros Retro Juegos →</Link>
        </div>
      </section>

      {/* CATEGORÍAS DESTACADAS */}
      <section className="max-w-[1600px] mx-auto mt-16 px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Explora nuestras categorías</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Link to={`/categoria/${i}`} key={i}>
                <img
                  src={`https://via.placeholder.com/260x260?text=Cat${i}`}
                  alt={`Categoría ${i}`}
                  className="rounded-lg hover:scale-105 transition object-cover w-full h-[200px]"
                />
              </Link>
            ))}
          </div>
          <div className="text-right mt-4">
            <Link to="/categorias" className="text-blue-600 hover:underline text-sm">
              Explora todas nuestras categorías →
            </Link>
          </div>
        </div>
      </section>

      {/* SLIDER PRODUCTOS DESTACADOS */}
      <section className="max-w-[1600px] mx-auto mt-16 px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Productos destacados</h2>
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
            {[...Array(15)].map((_, i) => (
              <Link to={`/producto/prod${i}`} key={i} className="min-w-[180px]">
                <img
                  src={`https://via.placeholder.com/180x180?text=Prod${i}`}
                  alt={`Producto ${i}`}
                  className="rounded-lg hover:scale-105 transition object-cover w-full h-[180px]"
                />
              </Link>
            ))}
          </div>
          <div className="text-right mt-4">
            <Link to="/productos" className="text-blue-600 hover:underline text-sm">
              Ver todos nuestros productos →
            </Link>
          </div>
        </div>
      </section>

      {/* SLIDER VIDEOJUEGOS */}
      <section className="max-w-[1600px] mx-auto mt-16 px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Videojuegos en oferta</h2>
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
            {[...Array(15)].map((_, i) => (
              <Link to={`/producto/game${i}`} key={i} className="min-w-[180px]">
                <img
                  src={`https://via.placeholder.com/180x180?text=Game${i}`}
                  alt={`Videojuego ${i}`}
                  className="rounded-lg hover:scale-105 transition object-cover w-full h-[180px]"
                />
              </Link>
            ))}
          </div>
          <div className="text-right mt-4">
            <Link to="/categoria/videojuegos" className="text-blue-600 hover:underline text-sm">
              Ver todos los videojuegos →
            </Link>
          </div>
        </div>
      </section>

      {/* BLOQUES FINALES INFERIORES */}
      <section className="max-w-[1600px] mx-auto mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
        {/* Bloque 1 */}
        <div className="bg-white rounded-lg shadow hover:shadow-xl transition overflow-hidden">
          <Link to="/categoria/3">
            <img
              src="https://via.placeholder.com/500x300?text=Categoría+3"
              alt="Categoría 3"
              className="w-full h-[220px] object-cover transition-transform hover:scale-105"
            />
          </Link>
        </div>

        {/* Bloque 2 */}
        <div className="bg-white rounded-lg shadow hover:shadow-xl transition overflow-hidden">
          <Link to="/categoria/4">
            <img
              src="https://via.placeholder.com/500x300?text=Categoría+4"
              alt="Categoría 4"
              className="w-full h-[220px] object-cover transition-transform hover:scale-105"
            />
          </Link>
        </div>

        {/* Bloque 3 - Accesorios */}
        <div className="bg-white rounded-lg shadow p-4 flex flex-col justify-between">
          <h3 className="text-lg font-semibold mb-2">Nuestros mejores accesorios</h3>
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Link to="/categoria/accesorios" key={i}>
                <img
                  src={`https://via.placeholder.com/160x120?text=Acc${i}`}
                  alt={`Accesorio ${i}`}
                  className="rounded-lg w-full h-[120px] object-cover"
                />
              </Link>
            ))}
          </div>
          <Link
            to="/categoria/accesorios"
            className="text-blue-600 text-sm mt-3 hover:underline"
          >
            Explora nuestros accesorios →
          </Link>
        </div>

        {/* Bloque 4 - Smart TV */}
        <div className="bg-white rounded-lg shadow p-4 flex flex-col justify-between">
          <h3 className="text-lg font-semibold mb-2">Explora nuestros Smart TV</h3>
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Link to="/categoria/smart-tv" key={i}>
                <img
                  src={`https://via.placeholder.com/160x120?text=TV${i}`}
                  alt={`TV ${i}`}
                  className="rounded-lg w-full h-[120px] object-cover"
                />
              </Link>
            ))}
          </div>
          <Link
            to="/categoria/smart-tv"
            className="text-blue-600 text-sm mt-3 hover:underline"
          >
            Explora nuestros Smart TV →
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
