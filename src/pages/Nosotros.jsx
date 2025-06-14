import React from "react";
import { Link } from "react-router-dom";
import { FaMapMarkerAlt, FaBuilding, FaRocket, FaPhoneAlt } from "react-icons/fa";
import "../styles/nosotros.css";

function Nosotros() {
    return (
        <div className="nosotros-container pt-28 min-h-screen px-6 pb-20">
            <div className="max-w-5xl mx-auto text-center z-10 relative">
                <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 via-pink-500 to-purple-600 text-transparent bg-clip-text animate-pulse mb-6 drop-shadow-lg">
                    Conoce Playcenter Universal
                </h1>

                <p className="text-xl text-gray-800 font-medium mb-6 leading-relaxed">
                    <FaBuilding className="inline-block mr-2 text-pink-400" />
                    Somos una empresa dominicana ubicada en <strong className="text-pink-600">Santiago</strong>, especializada en brindar lo último en tecnología, innovación y productos para el estilo de vida moderno.
                </p>

                <p className="text-lg text-gray-700 mb-6 leading-loose">
                    <FaRocket className="inline-block mr-2 text-blue-500" />
                    Nuestra misión es superar las expectativas de nuestros clientes ofreciendo artículos de calidad como consolas, videojuegos, tablets, móviles, accesorios y más, con un servicio humano, eficiente y profesional.
                </p>

                <p className="text-lg text-gray-700 mb-10 leading-loose">
                    <FaMapMarkerAlt className="inline-block mr-2 text-green-500" />
                    ¡Gracias por confiar en nosotros! Playcenter Universal no solo vende productos, crea experiencias memorables con cada compra.
                </p>

                <Link
                    to="/contacto"
                    className="contacto-btn transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                    <FaPhoneAlt className="inline-block mr-2" />
                    Contáctanos
                </Link>
            </div>

            <div className="animated-bg"></div>
        </div>
    );
}

export default Nosotros;
