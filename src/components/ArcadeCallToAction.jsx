import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaGamepad } from "react-icons/fa";

function ArcadeCallToAction() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true }}
      className="max-w-5xl mx-auto px-4 mb-16"
    >
      <Link
        to="/arcade"
        className="group block relative bg-gradient-to-br from-purple-700 via-pink-600 to-yellow-500 rounded-3xl overflow-hidden shadow-2xl hover:shadow-purple-600/50 transition transform hover:scale-105"
      >
        {/* Imagen */}
        <div className="relative w-full h-64 sm:h-80 md:h-96 overflow-hidden">
          <img
            src="/mario.png" // Pon aquí tu imagen del arcade
            alt="Arcade Retro"
            className="w-full h-full object-cover object-center opacity-90 group-hover:opacity-100 transition"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition"></div>
          {/* Glow */}
          <motion.div
            className="absolute -inset-1 rounded-3xl border-4 border-transparent group-hover:border-pink-400 animate-pulse pointer-events-none"
          />
        </div>

        {/* Contenido */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center gap-4"
          >
            <FaGamepad className="text-white text-5xl sm:text-6xl animate-bounce" />
            <h2 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">
              ¡Explora el Arcade Retro!
            </h2>
            <p className="text-white text-lg font-medium">
              Haz click aquí y juega gratis 🎮
            </p>
            <span className="inline-block mt-3 px-5 py-2 bg-blue-500 rounded-full text-black font-semibold shadow-md group-hover:bg-pink-400 transition">
              Jugar Ahora
            </span>
          </motion.div>
        </div>
      </Link>
    </motion.div>
  );

}

export default ArcadeCallToAction;
