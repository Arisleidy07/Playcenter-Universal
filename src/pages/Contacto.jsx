import React from "react";
import { FaPhone, FaMapMarkerAlt, FaEnvelope, FaWhatsapp } from "react-icons/fa";
import Wave from "../components/wave";

function Contacto() {
  return (
    <div
      className="relative min-h-screen flex flex-col items-center px-4 pt-12 pb-20 font-sans text-gray-800
                 bg-transparent overflow-hidden"
    >
      {/* Fondo animado */}
      <Wave />

      {/* Títulos */}
      <h1
        className="text-5xl font-extrabold mb-4 text-center text-gray-800 z-10"
        style={{ fontFamily: "'Orbitron', sans-serif" }}
      >
        CONTÁCTANOS
      </h1>
      <h2
        className="text-2xl font-semibold mb-10 text-center text-gray-600 z-10"
        style={{ fontFamily: "'Montserrat', sans-serif" }}
      >
        PlayCenter Universal
      </h2>

      {/* Caja cristal */}
      <div
        className="relative w-full max-w-3xl flex flex-col items-center gap-6 text-lg z-10"
        style={{
          background: "rgba(255, 255, 255, 0.25)",
          borderRadius: "1rem",
          padding: "2rem",
          backdropFilter: "blur(30px)",
          WebkitBackdropFilter: "blur(30px)",
          boxShadow: "0 0 40px rgba(255, 255, 255, 0.2)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
        }}
      >
{/* Imagen asomándose afuera del cuadro (arriba derecha) */}
<img
  src="/toy/asoma.png"
  alt="Muñeco asomándose"
  className="absolute z-20"
  style={{
    top: "-160px",     // más arriba
    right: "-80px",   // menos fuera, más a la izquierda
    width: "300px",   // más grande
    height: "auto",
  }}
/>


        <InfoItem
          icon={<FaMapMarkerAlt />}
          label="Dirección"
          text="Av. Estrella Sadhalá #55, Santiago, República Dominicana"
        />
        <InfoItem
          icon={<FaPhone />}
          label="Teléfono Tienda"
          text="+1 (849)-635-7000"
        />
        <InfoItem
          icon={<FaPhone />}
          label="Teléfono Internet"
          text="+1 (809)-582-1212"
        />
        <InfoItem
          icon={<FaEnvelope />}
          label="Correo"
          text="playcenter121@gmail.com"
        />

        {/* Botones WhatsApp */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center mt-4">
          <WhatsAppButton href="https://wa.me/18496357000" text="WhatsApp Tienda" />
          <WhatsAppButton href="https://wa.me/18095821212" text="WhatsApp Internet" />
        </div>
      </div>
    </div>
  );
}

const InfoItem = ({ icon, label, text }) => (
  <div className="flex items-start gap-4 w-full z-10">
    <div className="text-2xl text-gray-400">{icon}</div>
    <div>
      <p className="font-semibold text-gray-700">{label}:</p>
      <p className="text-gray-600 break-words">{text}</p>
    </div>
  </div>
);

const WhatsAppButton = ({ href, text }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center justify-center gap-3 px-6 py-3 text-base font-bold
               rounded-xl transition-transform z-10 animate-fade-in"
    style={{
      background: "rgba(255, 255, 255, 0.25)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      border: "1px solid rgba(255, 255, 255, 0.3)",
      boxShadow: "0 0 20px rgba(255, 255, 255, 0.2)",
      color: "#333",
      transition: "all 0.3s ease",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = "0 0 30px rgba(255, 255, 255, 0.4)";
      e.currentTarget.style.transform = "scale(1.05)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = "0 0 20px rgba(255, 255, 255, 0.2)";
      e.currentTarget.style.transform = "scale(1)";
    }}
  >
    <FaWhatsapp className="text-xl text-cyan-500" />
    {text}
  </a>
);

export default Contacto;
