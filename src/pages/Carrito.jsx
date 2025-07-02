    // src/pages/Carrito.jsx
    import React from "react";
    import { useCarrito } from "../context/CarritoContext";
    import { FaPhone, FaEnvelope, FaWhatsapp } from "react-icons/fa";
    import TarjetaProducto from "../components/TarjetaProducto";

    function WhatsAppCTA() {
    return (
        <section className="max-w-4xl mx-auto mt-12 p-6 bg-white rounded-xl shadow-lg text-center">
        <p className="text-lg font-semibold text-[#1E40AF] mb-4">
            Si te interesa algún producto o quieres más información, contáctanos directamente por WhatsApp 
        </p>

        <p className="flex items-center mb-3 text-blue-700 font-medium justify-center">
            <FaPhone className="mr-2 text-blue-600" />
            +1 (849)-635-7000 (Tienda)
        </p>

        <p className="flex items-center mb-3 text-red-700 font-medium justify-center">
            <FaPhone className="mr-2 text-red-600" />
            +1 (809)-582-1212 (Internet)
        </p>

        <p className="flex items-center mb-3 justify-center">
            <FaEnvelope className="mr-2 text-green-600" />
            playcenter121@gmail.com
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-6 justify-center">
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
            className="flex items-center justify-center gap-2 px-5 py-3 text-white bg-rose-500 hover:bg-rose-600 transition rounded-xl shadow-md w-full sm:w-auto"
            >
            <FaWhatsapp className="text-xl" />
            WhatsApp Internet
            </a>
        </div>
        </section>
    );
    }

    export default function Carrito() {
    const { carrito } = useCarrito();
    const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

    return (
        <main className="pt-24 px-4 sm:px-6 lg:px-12 pb-16 min-h-screen bg-white text-[#1E2A47]">
        <h1
            className="text-3xl sm:text-4xl font-bold text-center mb-10
            bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 
            bg-clip-text text-transparent animate-text-glow"
        >
            Mi Carrito
        </h1>

        {carrito.length === 0 ? (
            <p className="text-center text-[#4B5563] text-lg">Tu carrito está vacío.</p>
        ) : (
            <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
                {carrito.map((item) => (
                <TarjetaProducto
                    key={item.id}
                    producto={item}
                    enCarrito // esta prop le dice al componente que muestre el botón rojo
                />
                ))}
            </div>

            <div className="mt-10 text-center">
                <p className="text-lg font-semibold mb-3 text-[#2563EB]">
                Total: ${total.toFixed(2)}
                </p>

            </div>
            </>
        )}

        <WhatsAppCTA />
        </main>
    );
    }
