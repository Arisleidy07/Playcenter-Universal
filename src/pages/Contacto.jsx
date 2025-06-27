import React from "react";
import { FaPhone, FaMapMarkerAlt, FaEnvelope, FaWhatsapp } from "react-icons/fa";

function Contacto() {
    return (
        <div className="pt-24 px-4 sm:px-8 lg:px-24 pb-16 bg-white min-h-screen text-gray-800">
            <h1 className="text-3xl sm:text-4xl font-bold text-center mb-10 text-red-600">
                Contáctanos
            </h1>

            <div className="max-w-3xl mx-auto bg-red-50 p-6 rounded-2xl shadow-md">
                    <h2 className="text-2xl font-bold mb-4 flex flex-wrap items-center gap-1">
                    <span className="text-red-600">P</span>
                    <span className="text-orange-500">l</span>
                    <span className="text-yellow-500">a</span>
                    <span className="text-green-600">y</span>
                    <span className="text-blue-600">c</span>
                    <span className="text-indigo-600">e</span>
                    <span className="text-purple-600">n</span>
                    <span className="text-pink-600">t</span>
                    <span className="text-teal-600">e</span>
                    <span className="text-emerald-600">r</span>
                    <span className="ml-2 text-green-800">Universal</span>
                </h2>

                <p className="flex items-center mb-3 text-gray-700">
                    <FaMapMarkerAlt className="mr-2 text-red-600" />
                    Av. Estrella Sadhalá, Santiago, República Dominicana
                </p>

                <p className="flex items-center mb-2 text-blue-700 font-medium ">
                    <FaPhone className="mr-2 text-blue-500" />
                    +1 (849)-635-7000 (Tienda)
                </p>

                <p className="flex items-center mb-2 text-green-700 font-medium">
                    <FaPhone className="mr-2 text-green-500" />
                    +1 (809)-582-1212 (Internet)
                </p>



                <p className="flex items-center mb-3 text-gray-700">
                    <FaEnvelope className="mr-2 text-red-600" />
                    playcenter121@gmail.com
                </p>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <a
            href="https://wa.me/18496357000?text=Hola%20PlayCenter%2C%20estoy%20interesad%40%20en%20un%20producto%20que%20vi%20en%20su%20página."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-5 py-3 text-white bg-indigo-600 hover:bg-indigo-700 transition rounded-xl shadow-md w-full sm:w-auto"
            >
            <FaWhatsapp className="text-xl" />
            WhatsApp Tienda
            </a>

            <a
            href="https://wa.me/18095821212?text=Hola%20PlayCenter%2C%20estoy%20interesad%40%20en%20un%20producto%20que%20vi%20en%20su%20página."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-5 py-3 text-white bg-green-500 hover:bg-rose-600 transition rounded-xl shadow-md w-full sm:w-auto"
            >
            <FaWhatsapp className="text-xl" />
            WhatsApp Internet
            </a>
        </div>

            </div>
        </div>
    );
}

export default Contacto;
