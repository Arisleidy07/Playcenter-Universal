import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaPhone,
  FaMapMarkerAlt,
  FaEnvelope,
  FaWhatsapp,
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";
import Wave from "../components/wave";

function Contacto() {
  const { isDark } = useTheme();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videos = [
    "/vender/1-.mp4",
    "/vender/2-.mp4",
    "/vender/3-.mp4",
    "/vender/4-.mp4",
    "/vender/5-.mp4",
  ];

  // Cambio automático de videos cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [videos.length]);

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0 },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        isDark
          ? "bg-slate-900"
          : "bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50"
      }`}
      style={{ paddingTop: "0px" }}
    >
      <Wave />

      {/* Sección de Contacto */}
      <section
        className={`py-6 sm:py-8 lg:py-10 transition-colors duration-500 ${
          isDark
            ? "bg-slate-800"
            : "bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.h1
              variants={fadeInUp}
              className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 transition-colors duration-300 ${
                isDark ? "text-white" : "text-slate-900"
              }`}
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              CONTÁCTANOS
            </motion.h1>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Columna Izquierda - Texto en Recuadro */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className={`p-4 sm:p-6 lg:p-8 rounded-3xl ${
                isDark ? "bg-slate-900" : "bg-white shadow-xl"
              }`}
            >
              <h2
                className={`text-lg sm:text-xl lg:text-2xl xl:text-3xl font-extrabold mb-4 sm:mb-6 lg:mb-8 transition-colors duration-300 ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                Estamos aquí para ayudarte
              </h2>

              <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                <InfoItem
                  icon={<FaMapMarkerAlt />}
                  label="Dirección"
                  text="Av. Estrella Sadhalá #55, Santiago, República Dominicana"
                  isDark={isDark}
                />
                <InfoItem
                  icon={<FaPhone />}
                  label="Teléfono Tienda"
                  text="+1 (849)-635-7000"
                  isDark={isDark}
                />
                <InfoItem
                  icon={<FaPhone />}
                  label="Teléfono Internet"
                  text="+1 (809)-582-1212"
                  isDark={isDark}
                />
                <InfoItem
                  icon={<FaEnvelope />}
                  label="Correo"
                  text="playcenter121@gmail.com"
                  isDark={isDark}
                />
              </div>

              {/* WhatsApp Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 sm:mt-6 lg:mt-8">
                <WhatsAppButton
                  href="https://wa.me/18496357000"
                  text="WhatsApp Tienda"
                  isDark={isDark}
                />
                <WhatsAppButton
                  href="https://wa.me/18095821212"
                  text="WhatsApp Internet"
                  isDark={isDark}
                />
              </div>
            </motion.div>

            {/* Columna Derecha - Slideshow de Videos */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className={`relative overflow-hidden rounded-3xl aspect-square ${
                isDark ? "bg-slate-800" : "bg-white shadow-xl"
              }`}
            >
              <div className="relative w-full h-full">
                {videos.map((video, index) => (
                  <video
                    key={index}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                      index === currentVideoIndex ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <source src={video} type="video/mp4" />
                  </video>
                ))}
              </div>

              {/* Indicadores */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                {videos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentVideoIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentVideoIndex
                        ? isDark
                          ? "bg-yellow-400 w-8"
                          : "bg-blue-600 w-8"
                        : isDark
                        ? "bg-white/40"
                        : "bg-slate-400/40"
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

const InfoItem = ({ icon, label, text, isDark }) => (
  <div className="flex items-start gap-2 sm:gap-3 lg:gap-4 w-full">
    <div
      className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl flex items-center justify-center transition-colors duration-300 ${
        isDark ? "bg-yellow-400" : "bg-blue-600"
      }`}
    >
      <div
        className={`text-sm sm:text-base lg:text-xl ${
          isDark ? "text-gray-900" : "text-white"
        }`}
      >
        {icon}
      </div>
    </div>
    <div className="flex-1 min-w-0">
      <h3
        className={`text-sm sm:text-base lg:text-lg font-bold mb-1 sm:mb-1.5 lg:mb-2 transition-colors duration-300 ${
          isDark ? "text-white" : "text-gray-900"
        }`}
      >
        {label}
      </h3>
      <p
        className={`text-xs sm:text-sm lg:text-base leading-relaxed transition-colors duration-300 ${
          isDark ? "text-gray-100" : "text-gray-600"
        }`}
      >
        {text}
      </p>
    </div>
  </div>
);

const WhatsAppButton = ({ href, text, isDark }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={`inline-flex items-center justify-center gap-2 px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-lg font-bold text-white transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex-1 ${
      isDark
        ? "bg-emerald-600 hover:bg-emerald-700"
        : "bg-emerald-500 hover:bg-emerald-600"
    }`}
  >
    <FaWhatsapp className="text-base lg:text-lg" />
    <span className="text-xs sm:text-sm lg:text-base">{text}</span>
  </a>
);

export default Contacto;
