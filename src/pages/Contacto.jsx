import React from "react";
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
      <div className="text-center mb-6 sm:mb-8 max-w-4xl mx-auto">
        <h1
          className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 ${
            isDark ? "text-white" : "text-gray-900"
          }`}
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          CONTÁCTANOS
        </h1>
        <h2
          className={`text-base sm:text-lg lg:text-xl font-semibold ${
            isDark ? "text-gray-300" : "text-gray-600"
          }`}
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          PlayCenter Universal
        </h2>
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
          className={`relative backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-xl border ${
            isDark
              ? "bg-gray-800/80 border-blue-500/30"
              : "bg-white/80 border-gray-200/50"
          }`}
        >
          <div className="space-y-4 sm:space-y-6">
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
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-6 sm:mt-8">
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
        </div>
      </div>
    </div>
  );
}

const InfoItem = ({ icon, label, text, isDark }) => (
  <div className="flex items-start gap-3 sm:gap-4 w-full">
    <div
      className={`flex-shrink-0 text-xl sm:text-2xl ${
        isDark ? "text-blue-400" : "text-blue-500"
      }`}
    >
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <h3
        className={`text-sm sm:text-base lg:text-lg font-semibold mb-1 sm:mb-2 ${
          isDark ? "text-white" : "text-gray-800"
        }`}
      >
        {label}:
      </h3>
      <p
        className={`text-xs sm:text-sm lg:text-base leading-relaxed ${
          isDark ? "text-gray-300" : "text-gray-600"
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
    className={`inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl min-w-0 flex-1 sm:flex-initial sm:min-w-[180px] ${
      isDark
        ? "bg-emerald-600 hover:bg-emerald-700 border border-emerald-500"
        : "bg-emerald-500 hover:bg-emerald-600 border border-emerald-400"
    }`}
  >
    <FaWhatsapp className="text-sm sm:text-base flex-shrink-0" />
    <span className="text-sm sm:text-base truncate">{text}</span>
  </a>
);

export default Contacto;
