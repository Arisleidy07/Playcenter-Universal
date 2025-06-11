import React from "react";
import { FaPhone, FaMapMarkerAlt, FaEnvelope, FaWhatsapp } from "react-icons/fa";

function Contacto() {
    return (
        <div className="pt-24 px-4 sm:px-8 lg:px-24 pb-16 bg-white min-h-screen text-gray-800">
            <h1 className="text-3xl sm:text-4xl font-bold text-center mb-10 text-red-600">
                Contáctanos
            </h1>

            <div className="max-w-3xl mx-auto bg-red-50 p-6 rounded-2xl shadow-md">
                <h2 className="text-2xl font-semibold mb-4 text-red-700">Playcenter Universal</h2>
                <p className="flex items-center mb-3 text-gray-700">
                    <FaMapMarkerAlt className="mr-2 text-red-600" />
                    Av. Estrella Sadhalá, Santiago, República Dominicana
                </p>
                <p className="flex items-center mb-3 text-gray-700">
                    <FaPhone className="mr-2 text-red-600" />
                    +1 (809) 582-1212
                </p>
                <p className="flex items-center mb-3 text-gray-700">
                    <FaEnvelope className="mr-2 text-red-600" />
                    playcenter121@gmail.com
                </p>
                <a
                    href="https://wa.me/18095821212"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center mt-5 bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 transition"
                >
                    <FaWhatsapp className="mr-2" />
                    Escríbenos por WhatsApp
                </a>
            </div>
        </div>
    );
}

export default Contacto;
