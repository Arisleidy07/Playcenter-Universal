// src/pages/Contacto.jsx
import React from "react";

function Contacto() {
    return (
    <main className="pt-24 px-4 sm:px-6 lg:px-12 pb-16 bg-white min-h-screen">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-10">Contáctanos</h1>

        <form className="max-w-3xl mx-auto bg-gray-50 p-6 sm:p-10 rounded-xl shadow-md space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
            <label className="block mb-1 font-medium">Nombre</label>
            <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                placeholder="Tu nombre"
            />
            </div>
            <div>
            <label className="block mb-1 font-medium">Correo</label>
            <input
                type="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                placeholder="tunombre@email.com"
            />
            </div>
        </div>

        <div>
            <label className="block mb-1 font-medium">Mensaje</label>
            <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-pink-400"
            rows="5"
            placeholder="Escribe tu mensaje..."
            ></textarea>
        </div>

        <div className="text-center">
            <button
            type="submit"
            className="bg-pink-500 hover:bg-pink-600 text-white font-medium px-6 py-3 rounded-lg transition-all"
            >
            Enviar mensaje
            </button>
        </div>
        </form>
    </main>
    );
}

export default Contacto;
