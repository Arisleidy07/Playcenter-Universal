import React from "react";
import { Link } from "react-router-dom";
import SliderAnuncios from "../components/SliderAnuncios";
import SliderProductos from "../components/SliderProductos";
import TarjetaProducto from "../components/TarjetaProducto";
import productosAll from "../data/productosAll";
import { FaPhone, FaMapMarkerAlt, FaEnvelope, FaWhatsapp } from "react-icons/fa";

// Aplanar todos los productos de todas las categorías para tener un arreglo plano
const productosTodos = productosAll.flatMap(categoria => categoria.productos);

// Filtrar sólo productos de la categoría Consolas
const consolaCategoria = productosAll.find(c => c.categoria === "Consolas");
const productosConsolas = consolaCategoria ? consolaCategoria.productos : [];

const ofertasEspeciales = [
  {
    id: 1,
    nombre: "PlayStation 5",
    imagen: "/products/ps5.jpg",
    precio: 499.99,
  },
  {
    id: 2,
    nombre: "Nintendo Switch",
    imagen: "/products/nintendo_switch.png",
    precio: 299.99,
  },
  {
    id: 3,
    nombre: "Xbox Series X",
    imagen: "/products/xbox_series_x.png",
    precio: 499.99,
  },
  {
    id: 4,
    nombre: "Tablet Samsung Galaxy",
    imagen: "/products/tablet.jpg",
    precio: 179.99,
  },
  {
    id: 5,
    nombre: "Audífonos Bluetooth Sony",
    imagen: "/products/audifonos-sony.jpg",
    precio: 89.99,
  },
  {
    id: 6,
    nombre: "Control PS5 Edición Especial",
    imagen: "/products/control-ps5.jpg",
    precio: 64.99,
  },
];

function Inicio() {
  return (
    <div className="min-h-screen pt-24 bg-white text-gray-800 font-sans px-4">

      {/* Bienvenida */}
      <section className="text-center max-w-4xl mx-auto mb-12 animate-fade-in">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 text-transparent bg-clip-text animate-pulse">
          Bienvenidos a Playcenter Universal
        </h1>
        <p className="text-lg md:text-xl mb-6 animate-fade-in-up">
          Tu universo de tecnología, innovación y estilo. Donde cada clic es una aventura.
        </p>
        <div className="flex justify-center gap-6 flex-wrap mb-10 animate-fade-in-up">
          <Link
            to="/productos"
            className="bg-gradient-to-r from-blue-600 to-indigo-500 text-white px-8 py-3 rounded-full shadow hover:scale-105 hover:brightness-110 transition duration-300"
          >
            Explorar Productos
          </Link>
          <Link
            to="/productos/ofertas-especiales"
            className="bg-gradient-to-r from-cyan-500 to-teal-400 text-white px-8 py-3 rounded-full shadow hover:scale-105 hover:brightness-110 transition duration-300"
          >
            Ver Ofertas
          </Link>
        </div>
      </section>

      {/* Slider de anuncios */}
      <SliderAnuncios />

      {/* Slider: Todos los productos */}
      <section className="max-w-7xl mx-auto mb-12 animate-fade-in-up">
        <h2 className="text-2xl font-bold mb-4">Recomendaciones para ti</h2>
        <SliderProductos productos={productosTodos.slice(0, 10)} />
        <div className="text-right mt-2">
          <Link to="/productos" className="text-blue-600 hover:underline font-semibold">
            Ver todos los productos →
          </Link>
        </div>
      </section>

      {/* Slider: Consolas */}
      <section className="max-w-7xl mx-auto mb-12 animate-fade-in-up">
        <h2 className="text-2xl font-bold mb-4">Consolas populares</h2>
        <SliderProductos productos={productosConsolas.slice(0, 10)} />
        <div className="text-right mt-2">
          <Link to="/categorias/consolas" className="text-blue-600 hover:underline font-semibold">
            Ver todas las consolas →
          </Link>
        </div>
      </section>

      {/* Slider: Ofertas Especiales */}
      <section className="max-w-7xl mx-auto mb-12 animate-fade-in-up">
        <h2 className="text-2xl font-bold mb-4">Ofertas Especiales</h2>
        <SliderProductos productos={ofertasEspeciales.slice(0, 10)} />
        <div className="text-right mt-2">
          <Link to="/productos/ofertas-especiales" className="text-blue-600 hover:underline font-semibold">
            Seguir viendo ofertas →
          </Link>
        </div>
      </section>

      {/* Contacto directo */}
      <section className="pt-16 px-4 sm:px-8 lg:px-24 pb-24 bg-white text-gray-800 animate-fade-in-up">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-10 text-red-600">
          Contáctanos
        </h2>

        <div className="max-w-3xl mx-auto bg-red-50 p-6 rounded-2xl shadow-md">
          <h3 className="text-2xl font-semibold mb-4 text-red-700">Playcenter Universal</h3>

          <p className="flex items-center mb-3 text-gray-700">
            <FaMapMarkerAlt className="mr-2 text-red-600" />
            Av. Estrella Sadhalá, Santiago, República Dominicana
          </p>

          <p className="flex items-center mb-3 text-gray-700">
            <FaPhone className="mr-2 text-red-600" />
            +1 (809) 582-1212
          </p>

          <p className="flex items-center mb-3 text-gray-700">
            <FaEnvelope className="mr-2 text-red-600" />
            playcenter121@gmail.com
          </p>

          <a
            href="https://wa.me/18095821212"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center mt-5 bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 transition"
          >
            <FaWhatsapp className="mr-2" />
            Escríbenos por WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}

export default Inicio;
