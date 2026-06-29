import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaMapMarkerAlt,
  FaBuilding,
  FaRocket,
  FaPhoneAlt,
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";
import Wave from "../components/wave";

function Nosotros() {
  const { isDark } = useTheme();

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
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

      <section
        className={`py-12 sm:py-16 lg:py-20 transition-colors duration-500 ${
          isDark
            ? "bg-slate-800"
            : "bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50"
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center mb-12 sm:mb-16"
          >
            <motion.h1
              variants={fadeInUp}
              className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 transition-colors duration-300 ${
                isDark ? "text-white" : "text-slate-900"
              }`}
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              NOSOTROS
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className={`text-base sm:text-lg lg:text-xl transition-colors duration-300 ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Conoce nuestra historia, misión y compromiso con nuestros
              clientes.
            </motion.p>
          </motion.div>

          {/* Contenido centrado */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`p-6 sm:p-8 lg:p-10 rounded-3xl ${
              isDark ? "bg-slate-900" : "bg-white shadow-2xl"
            }`}
          >
            <h2
              className={`text-xl sm:text-2xl lg:text-3xl font-extrabold mb-8 sm:mb-10 transition-colors duration-300 ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Nuestra historia
            </h2>

            <div className="space-y-5 sm:space-y-6 lg:space-y-8">
              <InfoItem
                icon={<FaBuilding />}
                label="Quiénes somos"
                text="Somos una empresa dominicana ubicada en Santiago, especializada en brindar lo último en tecnología, innovación y productos para el estilo de vida moderno."
                isDark={isDark}
              />
              <InfoItem
                icon={<FaRocket />}
                label="Nuestra misión"
                text="Superar las expectativas de nuestros clientes ofreciendo artículos de calidad como consolas, videojuegos, tablets, móviles, accesorios y más, con un servicio humano, eficiente y profesional."
                isDark={isDark}
              />
              <InfoItem
                icon={<FaMapMarkerAlt />}
                label="Nuestro compromiso"
                text="PlayCenter Universal no solo vende productos, crea experiencias memorables con cada compra. ¡Gracias por confiar en nosotros!"
                isDark={isDark}
              />
            </div>

            {/* CTA Button */}
            <div className="flex justify-center mt-8 sm:mt-10">
              <Link
                to="/contacto"
                className={`inline-flex items-center gap-2 lg:gap-3 px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 rounded-xl font-bold text-white transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl ${
                  isDark
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                <FaPhoneAlt className="text-sm sm:text-base lg:text-lg" />
                <span className="text-sm sm:text-base lg:text-lg">
                  Contáctanos
                </span>
              </Link>
            </div>
          </motion.div>
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

export default Nosotros;
