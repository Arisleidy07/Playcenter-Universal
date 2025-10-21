import React from "react";
import {
  FaPhone,
  FaMapMarkerAlt,
  FaEnvelope,
  FaWhatsapp,
} from "react-icons/fa";
import Wave from "../components/wave";

function Contacto() {
  return (
    <div
      className="relative min-h-screen flex flex-col items-center px-4 sm:px-8 pb-20 font-sans text-gray-800 dark:text-gray-100 bg-gradient-to-b from-blue-50 via-blue-50 to-blue-100 dark:from-blue-950 dark:via-blue-950 dark:to-blue-900 overflow-hidden"
      style={{ paddingTop: "calc(var(--content-offset, 100px) + 48px)" }}
    >
      <Wave />

      <h1
        className="text-2xl sm:text-5xl font-extrabold mb-4 text-center text-gray-800 dark:text-gray-100 z-10"
        style={{ fontFamily: "'Orbitron', sans-serif" }}
      >
        CONTÁCTANOS
      </h1>
      <h2
        className="text-lg sm:text-2xl font-semibold mb-10 text-center text-gray-600 dark:text-gray-300 z-10"
        style={{ fontFamily: "'Montserrat', sans-serif" }}
      >
        PlayCenter Universal
      </h2>

      <div
        className="w-full max-w-3xl flex flex-col items-center z-10"
        style={{ position: "relative" }}
      >
        <img
          src="/toy/asoma.png"
          alt="Muñeco asomándose"
          className="pointer-events-none select-none absolute hidden sm:block"
          style={{
            top: "-118px",
            right: "0px",
            width: "min(220px, 40vw)",
            height: "auto",
            zIndex: 50,
            filter: "drop-shadow(0 10px 20px rgba(2, 6, 23, 0.15))",
            pointerEvents: "none",
          }}
        />
        <div
          className="relative w-full flex flex-col items-center gap-4 sm:gap-6 text-sm sm:text-lg px-4 py-4 sm:px-8 sm:py-6"
          style={{
            background: "rgba(239, 246, 255, 0.35)",
            borderRadius: "1rem",
            backdropFilter: "blur(30px)",
            WebkitBackdropFilter: "blur(30px)",
            boxShadow: "0 0 40px rgba(255, 255, 255, 0.2)",
            border: "1px solid rgba(59, 130, 246, 0.25)",
            paddingTop: "1.5rem",
          }}
        >
          <InfoItem
            icon={
              <FaMapMarkerAlt className="text-blue-500 dark:text-blue-400" />
            }
            label="Dirección"
            text="Av. Estrella Sadhalá #55, Santiago, República Dominicana"
          />
          <InfoItem
            icon={<FaPhone className="text-blue-500 dark:text-blue-400" />}
            label="Teléfono Tienda"
            text="+1 (849)-635-7000"
          />
          <InfoItem
            icon={<FaPhone className="text-blue-500 dark:text-blue-400" />}
            label="Teléfono Internet"
            text="+1 (809)-582-1212"
          />
          <InfoItem
            icon={<FaEnvelope className="text-blue-500 dark:text-blue-400" />}
            label="Correo"
            text="playcenter121@gmail.com"
          />

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center mt-4 w-full">
            <WhatsAppButton
              href="https://wa.me/18496357000"
              text="WhatsApp Tienda"
            />
            <WhatsAppButton
              href="https://wa.me/18095821212"
              text="WhatsApp Internet"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const InfoItem = ({ icon, label, text }) => (
  <div className="flex items-start gap-3 w-full z-10">
    <div className="text-xl sm:text-2xl text-gray-400 dark:text-gray-300">
      {icon}
    </div>
    <div>
      <p className="font-semibold text-sm sm:text-base text-gray-700 dark:text-gray-300">
        {label}:
      </p>
      <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base break-words">
        {text}
      </p>
    </div>
  </div>
);

const WhatsAppButton = ({ href, text }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center justify-center gap-2 sm:gap-3 px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base font-bold rounded-xl transition-transform z-10 w-full sm:w-auto"
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
    <FaWhatsapp className="text-lg sm:text-xl text-blue-500 dark:text-blue-400" />
    {text}
  </a>
);

export default Contacto;
