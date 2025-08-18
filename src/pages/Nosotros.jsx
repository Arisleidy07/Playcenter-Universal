import React from "react";
import { Link } from "react-router-dom";
import { FaMapMarkerAlt, FaBuilding, FaRocket, FaPhoneAlt } from "react-icons/fa";
import "../styles/nosotros.css";

function Nosotros() {
    return (
        <div className="nosotros-container pt-28 min-h-screen px-6 pb-20 relative">
            {/* Fondo animado */}
            <div className="animated-bg absolute inset-0 -z-10"></div>

            <div className="max-w-5xl mx-auto text-center z-10 relative animate-fadeIn">
                <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-800 via-cyan-400  text-transparent bg-clip-text mb-6 drop-shadow-lg animate-gradient">
                    Playcenter Universal
                </h1>

                <p className="text-xl text-gray-900 font-medium mb-6 leading-relaxed animate-slideUp">
                    <FaBuilding className="inline-block mr-2 text-yellow-400" />
                    Somos una empresa dominicana ubicada en <strong className="text-blue-800">Santiago</strong>, especializada en brindar lo último en tecnología, innovación y productos para el estilo de vida moderno.
                </p>

                <p className="text-lg text-gray-800 mb-6 leading-loose animate-slideUp delay-100">
                    <FaRocket className="inline-block mr-2 text-cyan-500" />
                    Nuestra misión es superar las expectativas de nuestros clientes ofreciendo artículos de calidad como consolas, videojuegos, tablets, móviles, accesorios y más, con un servicio humano, eficiente y profesional.
                </p>

                <p className="text-lg text-gray-800 mb-10 leading-loose animate-slideUp delay-200">
                    <FaMapMarkerAlt className="inline-block mr-2 text-green-500" />
                    ¡Gracias por confiar en nosotros! Playcenter Universal no solo vende productos, crea experiencias memorables con cada compra.
                </p>

                <Link
                    to="/contacto"
                    className="contacto-btn inline-flex items-center gap-2"
                >
                    <FaPhoneAlt />
                    Contáctanos
                </Link>
            </div>
        </div>
    );
}

export default Nosotros;
