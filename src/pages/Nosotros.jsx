import React from "react";
import { Link } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaBuilding,
  FaRocket,
  FaPhoneAlt,
} from "react-icons/fa";
import Wave from "../components/wave";

function Nosotros() {
  return (
    <div
      className="relative min-h-screen flex flex-col items-center px-4 pb-20 font-sans text-gray-800 dark:text-gray-100
                  bg-gradient-to-b from-blue-50 via-blue-50 to-blue-100 dark:from-blue-950 dark:via-blue-950 dark:to-blue-900 overflow-hidden"
      style={{ paddingTop: "calc(var(--content-offset, 100px) + 48px)" }}
    >
      <Wave />

      <h1
        className="text-5xl font-extrabold mb-4 text-center text-gray-800 dark:text-gray-100 z-10"
        style={{ fontFamily: "'Orbitron', sans-serif" }}
      >
        NOSOTROS
      </h1>
      <h2
        className="text-2xl font-semibold mb-10 text-center text-gray-600 dark:text-gray-300 z-10"
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
          className="relative w-full flex flex-col items-center gap-6 text-lg"
          style={{
            background: "rgba(239, 246, 255, 0.35)",
            borderRadius: "1rem",
            padding: "1.8rem",
            paddingTop: "2.6rem",
            backdropFilter: "blur(30px)",
            WebkitBackdropFilter: "blur(30px)",
            boxShadow: "0 0 40px rgba(255, 255, 255, 0.2)",
            border: "1px solid rgba(59, 130, 246, 0.25)",
            overflow: "visible",
          }}
        >
          <InfoItem
            icon={<FaBuilding className="text-blue-500 dark:text-blue-400" />}
            label="Quiénes somos"
            text="Somos una empresa dominicana ubicada en Santiago, especializada en brindar lo último en tecnología, innovación y productos para el estilo de vida moderno."
          />
          <InfoItem
            icon={<FaRocket className="text-blue-500 dark:text-blue-400" />}
            label="Nuestra misión"
            text="Superar las expectativas de nuestros clientes ofreciendo artículos de calidad como consolas, videojuegos, tablets, móviles, accesorios y más, con un servicio humano, eficiente y profesional."
          />
          <InfoItem
            icon={
              <FaMapMarkerAlt className="text-blue-500 dark:text-blue-400" />
            }
            label="Nuestro compromiso"
            text="PlayCenter Universal no solo vende productos, crea experiencias memorables con cada compra. ¡Gracias por confiar en nosotros!"
          />

          <div className="flex justify-center mt-6">
            <Link
              to="/contacto"
              className="flex items-center gap-3 px-6 py-3 text-base font-bold
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
                e.currentTarget.style.boxShadow =
                  "0 0 30px rgba(255, 255, 255, 0.4)";
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 0 20px rgba(255, 255, 255, 0.2)";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <FaPhoneAlt className="text-xl text-blue-500 dark:text-blue-400" />
              Contáctanos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const InfoItem = ({ icon, label, text }) => (
  <div className="flex items-start gap-4 w-full z-10">
    <div className="text-2xl text-gray-400 dark:text-gray-300">{icon}</div>
    <div>
      <p className="font-semibold text-gray-700 dark:text-gray-300">{label}:</p>
      <p className="text-gray-600 dark:text-gray-400 break-words">{text}</p>
    </div>
  </div>
);

export default Nosotros;
