import React from "react";
import { Link } from "react-router-dom";
import { FaMapMarkerAlt, FaBuilding, FaRocket, FaPhoneAlt } from "react-icons/fa";
import Wave from "../components/wave";

function Nosotros() {
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
        NOSOTROS
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
        {/* Imagen asomándose afuera del cuadro (arriba a la derecha) */}
{/* Imagen asomándose afuera del cuadro (arriba a la derecha) */}
<img
  src="/toy/asoman.png"
  alt="Muñeco asomándose"
  className="hidden lg:block absolute z-20" // solo se muestra en desktop grande
  style={{
    top: "-160px",
    right: "-230px",
    width: "300px",
    height: "auto",
  }}
/>





        <InfoItem
          icon={<FaBuilding className="text-yellow-400" />}
          label="Quiénes somos"
          text="Somos una empresa dominicana ubicada en Santiago, especializada en brindar lo último en tecnología, innovación y productos para el estilo de vida moderno."
        />
        <InfoItem
          icon={<FaRocket className="text-cyan-500" />}
          label="Nuestra misión"
          text="Superar las expectativas de nuestros clientes ofreciendo artículos de calidad como consolas, videojuegos, tablets, móviles, accesorios y más, con un servicio humano, eficiente y profesional."
        />
        <InfoItem
          icon={<FaMapMarkerAlt className="text-green-500" />}
          label="Nuestro compromiso"
          text="PlayCenter Universal no solo vende productos, crea experiencias memorables con cada compra. ¡Gracias por confiar en nosotros!"
        />

        {/* Botón cristal */}
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
            <FaPhoneAlt className="text-xl text-cyan-500" />
            Contáctanos
          </Link>
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

export default Nosotros;
