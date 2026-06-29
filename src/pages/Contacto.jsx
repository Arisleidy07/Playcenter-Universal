import React from "react";
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
              CONTÁCTANOS
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className={`text-base sm:text-lg lg:text-xl transition-colors duration-300 ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Estamos aquí para ayudarte. Contáctanos por los canales que
              prefieras.
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
              Información de contacto
            </h2>

            <div className="space-y-5 sm:space-y-6 lg:space-y-8">
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
                label="Correo electrónico"
                text="playcenter121@gmail.com"
                isDark={isDark}
              />
            </div>

            {/* WhatsApp Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 mt-8 sm:mt-10">
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
