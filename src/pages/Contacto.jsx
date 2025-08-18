import React, { useEffect, useState } from "react";
import { FaPhone, FaMapMarkerAlt, FaEnvelope, FaWhatsapp } from "react-icons/fa";

function Contacto() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center px-4 sm:px-6 pt-8 sm:pt-12 pb-16 sm:pb-24 font-sans text-gray-800 overflow-hidden bg-gradient-to-b from-white via-cyan-50 to-white">
      
      {/* Fondo dinámico sutil */}
      <div className="absolute inset-0">
        <div
          className="w-full h-full"
          style={{
            background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(0,200,255,0.05), transparent 80%)`,
            transition: "background 0.1s",
          }}
        />
      </div>

      {/* Título futurista neutro */}
      <h1
        className="text-5xl sm:text-7xl font-extrabold mb-4 tracking-wide text-center text-gray-800"
        style={{
          fontFamily: "'Orbitron', sans-serif",
          textShadow: "0 0 10px rgba(0,200,255,0.2)",
          zIndex: 10,
        }}
      >
        CONTÁCTANOS
      </h1>

      <h2
        className="text-2xl sm:text-4xl font-semibold mb-10 sm:mb-14 text-center text-gray-600"
        style={{
          fontFamily: "'Montserrat', sans-serif",
          textShadow: "0 0 5px rgba(0,200,255,0.1)",
          zIndex: 10,
        }}
      >
        PlayCenter Universal
      </h2>

      {/* Contenedor Info */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-4xl p-8 sm:p-12 md:p-16 mb-12 sm:mb-16 border border-gray-200 relative z-10">
        <div className="flex flex-col gap-8 sm:gap-10 text-base sm:text-lg md:text-xl leading-relaxed">
          <InfoItem icon={<FaMapMarkerAlt />} label="Dirección" text="Av. Estrella Sadhalá #55, Santiago, República Dominicana" />
          <InfoItem icon={<FaPhone />} label="Teléfono Tienda" text="+1 (849)-635-7000" />
          <InfoItem icon={<FaPhone />} label="Teléfono Internet" text="+1 (809)-582-1212" />
          <InfoItem icon={<FaEnvelope />} label="Correo" text="playcenter121@gmail.com" />
        </div>
      </div>

      {/* Botones WhatsApp neutros */}
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 w-full max-w-4xl justify-center items-center relative z-10">
        <WhatsAppButton href="https://wa.me/18496357000" text="WhatsApp Tienda" />
        <WhatsAppButton href="https://wa.me/18095821212" text="WhatsApp Internet" />
      </div>
    </div>
  );
}

// InfoItem flotante neutro
const InfoItem = ({ icon, label, text }) => {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      className="flex items-start gap-4 sm:gap-5 transition-transform duration-300"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        transform: hovered ? "translateY(-5px) scale(1.03)" : "translateY(0) scale(1)",
      }}
    >
      <div
        className="text-2xl sm:text-3xl mt-1 text-gray-400 drop-shadow-[0_0_5px_rgba(0,200,255,0.1)]"
      >
        {icon}
      </div>
      <div>
        <p className="font-semibold text-gray-700 mb-1">{label}:</p>
        <p className="text-gray-600 break-words">{text}</p>
      </div>
    </div>
  );
};

// Botón WhatsApp neutro
const WhatsAppButton = ({ href, text }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center justify-center gap-3 sm:gap-4 px-8 sm:px-12 py-4 sm:py-5 text-lg sm:text-2xl font-extrabold rounded-3xl shadow-md bg-white/90 text-gray-700 transition-transform duration-300 hover:scale-105 hover:shadow-lg"
  >
    <FaWhatsapp className="text-2xl sm:text-3xl" />
    {text}
  </a>
);

export default Contacto;
