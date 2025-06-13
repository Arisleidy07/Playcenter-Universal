import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

function Inicio() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white font-sans overflow-x-hidden">
      <header className="fixed top-0 left-0 w-full z-50 bg-black/50 backdrop-blur-md shadow-lg border-b border-purple-500">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-500 to-yellow-500 bg-clip-text text-transparent animate-pulse">
            Playcenter Universal 🚀
          </h1>
          <nav className="space-x-6 text-lg font-semibold">
            <Link to="/" className="hover:text-yellow-300 transition">Inicio</Link>
            <Link to="/productos" className="hover:text-yellow-300 transition">Categorías</Link>
            <Link to="/carrito" className="hover:text-yellow-300 transition">Carrito</Link>
            <Link to="/nosotros" className="hover:text-yellow-300 transition">Nosotros</Link>
            <Link to="/contacto" className="hover:text-yellow-300 transition">Contáctanos</Link>
          </nav>
        </div>
      </header>

      <section className="pt-28 text-center px-4">
        <h2 className="text-6xl md:text-7xl font-extrabold tracking-tight leading-tight bg-gradient-to-r from-fuchsia-500 via-indigo-400 to-cyan-400 bg-clip-text text-transparent animate-bounce">
          ¡Bienvenidos a la tienda del futuro!
        </h2>
        <p className="mt-6 text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto">
          Donde la tecnología, el diseño y la experiencia se unen para sorprenderte 
        </p>
        <div className="mt-10 flex justify-center gap-6">
          <Link to="/productos">
            <Button className="bg-gradient-to-r from-emerald-400 to-cyan-500 text-black text-lg px-6 py-3 shadow-lg hover:scale-105 transition rounded-2xl">
              Ver Productos
            </Button>
          </Link>
          <Link to="/nosotros">
            <Button variant="outline" className="border-white text-white text-lg px-6 py-3 hover:bg-white hover:text-black transition rounded-2xl">
              Conócenos
            </Button>
          </Link>
        </div>
      </section>

      <section className="mt-32 px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-7xl mx-auto">
          <div className="bg-black/20 border border-purple-400 p-6 rounded-2xl shadow-xl hover:scale-105 transition backdrop-blur-md">
            <h3 className="text-2xl font-bold mb-4 text-purple-300">Tecnología de punta</h3>
            <p className="text-gray-300">
              Equipos de última generación, gadgets futuristas y más para mantenerte un paso adelante.
            </p>
          </div>
          <div className="bg-black/20 border border-pink-400 p-6 rounded-2xl shadow-xl hover:scale-105 transition backdrop-blur-md">
            <h3 className="text-2xl font-bold mb-4 text-pink-300"> Diseño deslumbrante</h3>
            <p className="text-gray-300">
              Visuales únicos, efectos animados y estética de otro mundo. Tu experiencia importa.
            </p>
          </div>
          <div className="bg-black/20 border border-yellow-400 p-6 rounded-2xl shadow-xl hover:scale-105 transition backdrop-blur-md">
            <h3 className="text-2xl font-bold mb-4 text-yellow-300">🛒 Compra inteligente</h3>
            <p className="text-gray-300">
              Sistema intuitivo, favoritos, carrito personalizado y descuentos irresistibles.
            </p>
          </div>
        </div>
      </section>

      <footer className="mt-32 py-12 bg-black/80 border-t border-purple-500 text-center">
        <p className="text-gray-400">© 2025 Playcenter Universal. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

export default Inicio;
