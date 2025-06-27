    import React from "react";
    import TarjetaProducto from "../components/TarjetaProducto";
    import { useCarrito } from "../context/CarritoContext";
    import { FaPhone, FaEnvelope, FaWhatsapp } from "react-icons/fa";

    export default function Favoritos() {
    const { favoritos } = useCarrito();

    return (
        <main className="pt-24 px-4 sm:px-6 lg:px-12 pb-16 min-h-screen bg-white text-[#1E2A47]">
        {/* Título */}
        <h1
            className="text-3xl sm:text-4xl font-bold text-center mb-10
            bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 
            bg-clip-text text-transparent animate-text-glow"
        >
            Favoritos
        </h1>

        {favoritos.length === 0 ? (
            <p className="text-center text-[#4B5563] text-lg">
            No tienes productos favoritos.
            </p>
        ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
            {favoritos.map((item) => (
                <TarjetaProducto key={item.id} producto={item} />
            ))}
            </div>
        )}

        {/* CTA de contacto */}
        <section className="max-w-4xl mx-auto mt-16 p-6 bg-white rounded-xl shadow-lg text-center border border-blue-200">
            <p className="text-gray-700 text-lg mb-4">
            ¿Te interesa algún producto? ¡Escríbenos directamente a WhatsApp!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
                href="https://wa.me/18496357000?text=Hola%20PlayCenter%2C%20estoy%20interesad@%20en%20un%20producto%20que%20vi%20en%20su%20página."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-5 py-3 text-white bg-indigo-600 hover:bg-indigo-700 transition rounded-xl shadow-md w-full sm:w-auto"
            >
                <FaWhatsapp className="text-xl" />
                WhatsApp Tienda
            </a>

            <a
                href="https://wa.me/18095821212?text=Hola%20PlayCenter%2C%20estoy%20interesad@%20en%20un%20producto%20que%20vi%20en%20su%20página."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-5 py-3 text-white bg-rose-500 hover:bg-rose-600 transition rounded-xl shadow-md w-full sm:w-auto"
            >
                <FaWhatsapp className="text-xl" />
                WhatsApp Internet
            </a>
            </div>

            <div className="mt-6 space-y-2">
            <p className="flex items-center justify-center text-blue-700 font-medium">
                <FaPhone className="mr-2 text-blue-600" />
                +1 (849)-635-7000 (Tienda)
            </p>
            <p className="flex items-center justify-center text-red-700 font-medium">
                <FaPhone className="mr-2 text-red-600" />
                +1 (809)-582-1212 (Internet)
            </p>
            <p className="flex items-center justify-center">
                <FaEnvelope className="mr-2 text-green-600" />
                playcenter121@gmail.com
            </p>
            </div>
        </section>
        </main>
    );
    }
