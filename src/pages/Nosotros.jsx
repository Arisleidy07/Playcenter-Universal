import React from "react";
import { Link } from "react-router-dom";
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

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center px-4 sm:px-6 lg:px-8 pb-8 relative ${
        isDark
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700"
          : "bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-100"
      }`}
      style={{ paddingTop: "180px" }}
    >
      <Wave />

      {/* Header */}
      <div className="text-center mb-8 sm:mb-12 max-w-4xl mx-auto">
        <h1
          className={`text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 ${
            isDark ? "text-white" : "text-gray-900"
          }`}
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          NOSOTROS
        </h1>

      </div>

      {/* Main Content */}
      <div className="w-full max-w-4xl mx-auto relative">
        {/* Toy Image - Only on desktop */}
        <img
          src="/toy/asoma.png"
          alt="Muñeco asomándose"
          className="hidden xl:block absolute -top-20 right-4 w-40 h-auto z-10 pointer-events-none"
        />

        {/* Glass Card */}
        <div
          className={`relative backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl border ${
            isDark
              ? "bg-gray-800/80 border-blue-500/30"
              : "bg-white/80 border-gray-200/50"
          }`}
        >
          <div className="space-y-6 sm:space-y-8">
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
              className={`inline-flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-white transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl ${
                isDark
                  ? "bg-blue-600 hover:bg-blue-700 border border-blue-500"
                  : "bg-blue-600 hover:bg-blue-700 border border-blue-500"
              }`}
            >
              <FaPhoneAlt className="text-lg" />
              <span className="text-base sm:text-lg">Contáctanos</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const InfoItem = ({ icon, label, text, isDark }) => (
  <div className="flex items-start gap-4 sm:gap-6 w-full">
    <div
      className={`flex-shrink-0 text-2xl sm:text-3xl lg:text-4xl ${
        isDark ? "text-blue-400" : "text-blue-500"
      }`}
    >
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <h3
        className={`text-base sm:text-lg lg:text-xl font-semibold mb-2 sm:mb-3 ${
          isDark ? "text-white" : "text-gray-800"
        }`}
      >
        {label}:
      </h3>
      <p
        className={`text-sm sm:text-base lg:text-lg leading-relaxed ${
          isDark ? "text-gray-300" : "text-gray-600"
        }`}
      >
        {text}
      </p>
    </div>
  </div>
);

export default Nosotros;
