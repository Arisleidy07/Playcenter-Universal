    import React from "react";
    import { FaPhone, FaMapMarkerAlt, FaEnvelope, FaWhatsapp } from "react-icons/fa";

    function Contacto() {
    return (
        <div
        className="min-h-screen bg-gradient-to-b from-white via-cyan-50 to-white text-gray-900 font-sans px-6 pt-12 pb-24 flex flex-col items-center"
        style={{ scrollBehavior: "smooth" }}
        >
        {/* Título con parallax y sombra suave */}
        <h1
            className="text-7xl font-extrabold mb-4 tracking-wide text-center text-blue-700 drop-shadow-[0_10px_20px_rgba(0,112,255,0.25)]"
            style={{
            fontFamily: "'Orbitron', sans-serif",
            transform: "translateZ(0)",
            }}
        >
            CONTÁCTANOS
        </h1>

        <h2
            className="text-4xl font-semibold mb-14 text-center text-cyan-600"
            style={{
            fontFamily: "'Montserrat', sans-serif",
            textShadow: "0 0 15px rgba(0, 207, 255, 0.8)",
            }}
        >
            PlayCenter Universal
        </h2>

        {/* Contenedor de info */}
        <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full p-12 md:p-16 mb-16 border border-cyan-200">
            <div className="flex flex-col gap-10 text-lg md:text-xl leading-relaxed">
            <InfoItem icon={<FaMapMarkerAlt />} color="text-blue-600" label="Dirección" text="Av. Estrella Sadhalá #55, Santiago, República Dominicana" />
            <InfoItem icon={<FaPhone />} color="text-cyan-600" label="Teléfono Tienda" text="+1 (849)-635-7000" />
            <InfoItem icon={<FaPhone />} color="text-blue-700" label="Teléfono Internet" text="+1 (809)-582-1212" />
            <InfoItem icon={<FaEnvelope />} color="text-cyan-700" label="Correo" text="playcenter121@gmail.com" />
            </div>
        </div>

        {/* Botones WhatsApp grandes y animados */}
        <div className="flex flex-col md:flex-row gap-12 max-w-4xl w-full justify-center">
            <WhatsAppButton
            href="https://wa.me/18496357000?text=Hola%20PlayCenter%2C%20estoy%20interesad%40%20en%20un%20producto%20que%20vi%20en%20su%20página."
            colors={["from-cyan-400", "to-blue-600"]}
            text="WhatsApp Tienda"
            />
            <WhatsAppButton
            href="https://wa.me/18095821212?text=Hola%20PlayCenter%2C%20estoy%20interesad%40%20en%20un%20producto%20que%20vi%20en%20su%20página."
            colors={["from-blue-600", "to-cyan-400"]}
            text="WhatsApp Internet"
            />
        </div>
        </div>
    );
    }

    const InfoItem = ({ icon, color, label, text }) => (
    <div className="flex items-start gap-5">
        <div className={`text-3xl mt-1 ${color} drop-shadow-md transition-transform duration-300 hover:scale-110`}>
        {icon}
        </div>
        <div>
        <p className="font-semibold text-gray-800 mb-1">{label}:</p>
        <p className="text-gray-700">{text}</p>
        </div>
    </div>
    );

    const WhatsAppButton = ({ href, colors, text }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center justify-center gap-4 px-12 py-5 text-2xl font-extrabold rounded-3xl shadow-lg text-white transition-transform duration-300 hover:scale-110 bg-gradient-to-r ${colors.join(" ")}`}
    >
        <FaWhatsapp className="text-3xl drop-shadow-md animate-pulse" />
        {text}
    </a>
    );

    export default Contacto;
