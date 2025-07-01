import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaWhatsapp, FaShoppingCart } from "react-icons/fa";
import GaleriaImagenes from "../components/GaleriaImagenes";
import productosAll from "../data/productosAll";
import { useCarrito } from "../context/CarritoContext";

function VistaProducto() {
  const { carrito, agregarAlCarrito, quitarDelCarrito } = useCarrito();
  const { id } = useParams();
  const navigate = useNavigate();

  const todos = productosAll.flatMap((categoria) => categoria.productos);
  const producto = todos.find((p) => p.id === id);
  const estaEnCarrito = carrito.some((item) => item.id === producto?.id);

  if (!producto) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-700 p-4">
        <p className="text-center text-xl font-semibold">
          Producto no encontrado.
          <button
            onClick={() => navigate(-1)}
            className="text-blue-500 underline ml-2"
          >
            Volver
          </button>
        </p>
      </div>
    );
  }

  const mensajeWhatsApp = `https://wa.me/18496357000?text=${encodeURIComponent(
    `¡Hola! Estoy interesado/a en el producto "${producto.nombre}". ¿Sigue disponible?`
  )}`;

  const preguntasFrecuentes = [
    "¿Sigue disponible?",
    "¿Dónde están ubicados?",
    "¿Puedo reservarlo?",
    "¿Está disponible en otro color o modelo?",
  ];

  return (
    <main className="min-h-screen bg-white px-4 py-10 text-gray-800 flex justify-center">
      <section className="max-w-6xl w-full flex flex-col-reverse md:grid md:grid-cols-2 gap-10">
        {/* Galería */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center"
        >
          <GaleriaImagenes imagenes={producto.imagenes || [producto.imagen]} />
        </motion.div>

        {/* Info */}
        <motion.div
          className="flex flex-col gap-6"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#333] text-center md:text-left">
            {producto.nombre}
          </h1>

          <p className="text-xl sm:text-2xl font-semibold text-[#FF9900] text-center md:text-left">
            ${producto.precio.toFixed(2)}
          </p>

          <motion.p
            className="text-gray-700 text-base sm:text-lg leading-relaxed text-center md:text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {producto.descripcion ||
              "Contáctanos para más detalles o para coordinar una compra en nuestra tienda física."}
          </motion.p>

          <div className="flex justify-center md:justify-start">
            <button
              onClick={() =>
                estaEnCarrito
                  ? quitarDelCarrito(producto.id)
                  : agregarAlCarrito({ ...producto, cantidad: 1 })
              }
              className={`w-full sm:w-auto inline-flex justify-center items-center gap-3 px-6 py-3 rounded shadow transition-transform hover:scale-105 font-semibold ${
                estaEnCarrito
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-yellow-400 hover:bg-yellow-500 text-black"
              }`}
            >
              <FaShoppingCart className="text-xl" />
              {estaEnCarrito ? "Quitar del carrito" : "Agregar al carrito"}
            </button>
          </div>

          <div className="mt-6 flex flex-col items-center md:items-start gap-3">
            <p className="text-gray-700 text-center md:text-left">
              Si te interesa este producto, puedes escribirnos directamente por WhatsApp:
            </p>
            <a
              href={mensajeWhatsApp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-full shadow transition-transform hover:scale-105 w-full sm:w-auto"
            >
              <FaWhatsapp className="text-2xl" />
              Escribir por WhatsApp
            </a>
          </div>

          <div className="mt-4">
            <h3 className="font-bold text-gray-700 mb-2">Preguntas comunes:</h3>
            <ul className="list-disc list-inside text-sm text-gray-600">
              {preguntasFrecuentes.map((pregunta, i) => (
                <li key={i}>{pregunta}</li>
              ))}
            </ul>
          </div>
        </motion.div>
      </section>
    </main>
  );
}

export default VistaProducto;
