import React from "react";
import { FaGamepad } from "react-icons/fa";
import { motion } from "framer-motion";

function Arcade() {
  return (
    <main className="pt-24 px-4 sm:px-6 lg:px-12 pb-16 min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 text-[#1E2A47]">
      {/* Título bonito */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl sm:text-5xl font-extrabold flex items-center justify-center gap-3 text-indigo-700">
          <FaGamepad className="text-pink-500" />
          Arcade
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Disfruta de juegos clásicos directamente aquí 🎮
        </p>
      </motion.div>

      {/* Juego 1 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="rounded-xl overflow-hidden shadow-lg border border-gray-300 mb-10 max-w-4xl mx-auto"
      >
        <iframe
          title="Super Mario Game"
          width="100%"
          height="700px"
          allow="fullscreen; autoplay; encrypted-media"
          src="https://games.construct.net/769/latest"
          frameBorder="0"
          allowFullScreen={true}
          sandbox="allow-same-origin allow-forms allow-scripts allow-pointer-lock allow-orientation-lock allow-popups"
          scrolling="no"
          className="w-full bg-black"
        />
      </motion.div>

      {/* Juego 2 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="rounded-xl overflow-hidden shadow-lg border border-gray-300 max-w-4xl mx-auto"
      >
        <iframe
          title="Nuevo Juego Arcade"
          width="100%"
          height="700px"
          allow="fullscreen; autoplay; encrypted-media"
          src="https://games.construct.net/353/latest"
          frameBorder="0"
          allowFullScreen={true}
          sandbox="allow-same-origin allow-forms allow-scripts allow-pointer-lock allow-orientation-lock allow-popups"
          scrolling="no"
          className="w-full bg-black"
        />
      </motion.div>

      <div className="text-center mt-6">
        <p className="text-gray-500">¡Dale play y a disfrutar!</p>
      </div>
    </main>
  );
}

export default Arcade;
