import React from "react";
import { FaPhone, FaMapMarkerAlt, FaEnvelope, FaWhatsapp } from "react-icons/fa";

function Contacto() {
        return (
    <div className="pt-24 px-4 sm:px-8 lg:px-24 pb-16 bg-white min-h-screen text-gray-800">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-10 text-red-600">
        Contáctanos
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Información de contacto */}
        <div className="bg-red-50 p-6 rounded-2xl shadow-md">
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

        {/* Mapa de ubicación */}
        <div className="rounded-2xl overflow-hidden shadow-lg">
            <iframe
            title="Ubicación Playcenter"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3793.4600575214286!2d-70.70339732580298!3d19.45361098180988!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8eb1cf58b6896235%3A0x48f55a58a6be01a7!2sPlaycenter%20Universal!5e0!3m2!1ses-419!2sdo!4v1718049820000"
            width="100%"
            height="100%"
            className="h-80 w-full border-none"
            allowFullScreen=""
            loading="lazy"
            ></iframe>
        </div>
        </div>
    </div>
    );
}

export default Contacto;
