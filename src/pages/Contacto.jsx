import React from "react";
import { FaPhone, FaMapMarkerAlt, FaEnvelope, FaWhatsapp } from "react-icons/fa";

function Contacto() {
    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center px-4 bg-white"
        >
            <h1
                className="text-4xl font-extrabold text-center mb-8 mt-16 tracking-wide"
                style={{
                    fontFamily: "'Orbitron', 'Montserrat', Arial, sans-serif",
                    letterSpacing: "0.10em",
                    background: "linear-gradient(90deg, #FFD700, #C0C0C0, #A1FFCE 90%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    textShadow: "0 2px 12px #FFD70055,0 1px 0 #C0C0C055",
                }}
            >
                Contáctanos
            </h1>

            <h2
                className="text-xl font-bold mb-10 flex flex-wrap items-center gap-1 justify-center tracking-wide select-none"
                style={{
                    fontFamily: "'Orbitron', 'Montserrat', Arial, sans-serif",
                    letterSpacing: "0.08em",
                    textShadow: "0 1px 10px #A1FFCE44, 0 1px 0 #FFD70055"
                }}
            >
                <span style={{
                    background: "linear-gradient(120deg, #FFD700 20%, #FFF7AE 80%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent"
                }}>P</span>
                <span style={{
                    background: "linear-gradient(120deg, #C0C0C0 10%, #A1FFCE 90%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent"
                }}>l</span>
                <span style={{
                    background: "linear-gradient(120deg, #FFD700 0%, #C0C0C0 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent"
                }}>a</span>
                <span style={{
                    background: "linear-gradient(120deg, #A1FFCE 0%, #C0C0C0 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent"
                }}>y</span>
                <span style={{
                    background: "linear-gradient(120deg, #EEE 0%, #FFD700 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent"
                }}>c</span>
                <span style={{
                    background: "linear-gradient(120deg, #FFD700 20%, #C0C0C0 80%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent"
                }}>e</span>
                <span style={{
                    background: "linear-gradient(120deg, #C0C0C0 0%, #FFD700 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent"
                }}>n</span>
                <span style={{
                    background: "linear-gradient(120deg, #FFD700 0%, #A1FFCE 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent"
                }}>t</span>
                <span style={{
                    background: "linear-gradient(120deg, #C0C0C0 0%, #FFD700 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent"
                }}>e</span>
                <span style={{
                    background: "linear-gradient(120deg, #FFD700 0%, #A1FFCE 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent"
                }}>r</span>
                <span className="ml-2"
                    style={{
                        background: "linear-gradient(90deg, #C0C0C0 0%, #FFD700 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontWeight: "bold"
                    }}
                >Universal</span>
            </h2>

            <div className="flex flex-col gap-7 w-full max-w-xl">
                <div className="flex items-center gap-3 text-gray-700 text-lg">
                    <FaMapMarkerAlt className="text-2xl" style={{
                        color: "#FFD700",
                        filter: "drop-shadow(0 0 6px #FFD70044)"
                    }} />
                    <span>Av. Estrella Sadhalá, Santiago, República Dominicana</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700 text-lg">
                    <FaPhone className="text-2xl" style={{
                        color: "#C0C0C0",
                        filter: "drop-shadow(0 0 6px #C0C0C044)"
                    }} />
                    <span>
                        +1 (849)-635-7000 <span className="text-xs text-gray-500 ml-1">(Tienda)</span>
                    </span>
                </div>
                <div className="flex items-center gap-3 text-gray-700 text-lg">
                    <FaPhone className="text-2xl" style={{
                        color: "#A1FFCE",
                        filter: "drop-shadow(0 0 6px #A1FFCE44)"
                    }} />
                    <span>
                        +1 (809)-582-1212 <span className="text-xs text-gray-500 ml-1">(Internet)</span>
                    </span>
                </div>
                <div className="flex items-center gap-3 text-gray-700 text-lg">
                    <FaEnvelope className="text-2xl" style={{
                        color: "#FFD700",
                        filter: "drop-shadow(0 0 6px #FFD70044)"
                    }} />
                    <span>playcenter121@gmail.com</span>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 mt-12 mb-10 justify-center w-full max-w-xl">
                <a
                    href="https://wa.me/18496357000?text=Hola%20PlayCenter%2C%20estoy%20interesad%40%20en%20un%20producto%20que%20vi%20en%20su%20página."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-8 py-3 text-lg font-semibold rounded-full shadow transition-all"
                    style={{
                        background: "linear-gradient(90deg,#FFD700,#C0C0C0 80%)",
                        color: "#232323",
                        fontFamily: "'Montserrat', Arial, sans-serif",
                        letterSpacing: "0.03em",
                        boxShadow: "0 4px 18px #FFD70044, 0 1.5px 0 #C0C0C044",
                        border: "2px solid #FFD700"
                    }}
                >
                    <FaWhatsapp className="text-2xl" />
                    WhatsApp Tienda
                </a>

                <a
                    href="https://wa.me/18095821212?text=Hola%20PlayCenter%2C%20estoy%20interesad%40%20en%20un%20producto%20que%20vi%20en%20su%20página."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-8 py-3 text-lg font-semibold rounded-full shadow transition-all"
                    style={{
                        background: "linear-gradient(90deg,#C0C0C0,#FFD700 80%)",
                        color: "#232323",
                        fontFamily: "'Montserrat', Arial, sans-serif",
                        letterSpacing: "0.03em",
                        boxShadow: "0 4px 18px #C0C0C044, 0 1.5px 0 #FFD70044",
                        border: "2px solid #C0C0C0"
                    }}
                >
                    <FaWhatsapp className="text-2xl" />
                    WhatsApp Internet
                </a>
            </div>
        </div>
    );
}

export default Contacto;