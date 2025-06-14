import React from "react";
import { Link } from "react-router-dom";

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

      {/* Ofertas Especiales */}
      <section className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 animate-slide-in-bottom">
          Ofertas Especiales
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5 animate-fade-in-up">
          {ofertasEspeciales.map((producto) => (
            <div key={producto.id} className="card">
              <div className="blob"></div>
              <div className="bg flex flex-col items-center justify-center text-center p-4 z-10">
                <img
                  src={producto.imagen}
                  alt={producto.nombre}
                  className="w-24 h-24 object-contain mb-2"
                />
                <h3 className="font-bold text-gray-800 text-sm">{producto.nombre}</h3>
                <p className="text-gray-600 text-sm">${producto.precio}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-10 animate-fade-in-up">
          <Link
            to="/productos/ofertas-especiales"
            className="inline-block bg-gradient-to-r from-blue-600 to-indigo-500 text-white px-6 py-2 rounded-full shadow hover:scale-105 transition duration-300"
          >
            Seguir viendo ofertas
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Inicio;
