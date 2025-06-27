import React from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import GaleriaImagenes from "../components/GaleriaImagenes";

function VistaProducto() {
  const location = useLocation();
  const { producto } = location.state || {};

  if (!producto) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-700">
        Producto no encontrado.
      </div>
    );
  }

  const mensajeWhatsApp = `https://wa.me/18496357000?text=${encodeURIComponent(
    `¡Hola! Estoy interesado/a en el producto "${producto.nombre}". ¿Sigue disponible?`
  )}`;

  const preguntasFrecuentes = [
    "¿Tienen envíos disponibles?",
    "¿Puedo reservarlo?",
    "¿Está disponible en otro color o modelo?",
  ];

  return (
    <main className="min-h-screen bg-[#f5f7fa] px-4 py-10 text-gray-800">
      <section className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 bg-white shadow-xl rounded-2xl p-8 animate-fadeIn">
        {/* Galería animada */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GaleriaImagenes imagenes={producto.imagenes || [producto.imagen]} />
        </motion.div>

        <motion.div
          className="flex flex-col gap-6"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-extrabold text-[#333]">{producto.nombre}</h1>

          <p className="text-2xl font-semibold text-[#FF4081]">
            ${producto.precio.toFixed(2)}
          </p>

          <motion.p
            className="text-gray-600 text-lg leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {producto.descripcion ||
              "Contáctanos para más detalles o para coordinar una compra en nuestra tienda física."}
          </motion.p>

          <a
            href={mensajeWhatsApp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-full shadow-md transition-transform hover:scale-105"
          >
            <FaWhatsapp className="text-2xl" />
            Escribir por WhatsApp
          </a>

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
