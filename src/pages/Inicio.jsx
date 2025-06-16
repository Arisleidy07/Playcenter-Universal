import React from "react";
import { Link } from "react-router-dom";
import SliderAnuncios from "../components/SliderAnuncios";
import SliderProductos from "../components/SliderProductos";
import productosAll from "../data/productosAll";

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
      <SliderAnuncios />

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
    </div>
  );
}

export default Inicio;
