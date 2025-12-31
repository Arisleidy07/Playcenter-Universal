import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaWhatsapp,
  FaMoneyCheckAlt,
  FaUniversity,
  FaRegCopy,
  FaCheck,
  FaTimes,
  FaMapMarkerAlt,
} from "react-icons/fa";

const estafetas = [
  {
    id: 0,
    nombre: "Estafeta Principal (Oficina)",
    descripcion: "Playcenter Universal",
    direccion: "Av Estrella Sadhala Nº 55, Frente a la doble vía, Santiago",
    telefono: "809-582-1212",
    ubicacionLink:
      "https://www.google.com/maps/place/19%C2%B026'13.2%22N+70%C2%B041'23.3%22W/@19.436998,-70.689812,17z/data=!4m4!3m3!8m2!3d19.437!4d-70.6898056",
    imagen: "/estafetas/oficina.png",
  },
  {
    id: 1,
    nombre: "Estafeta Marilópez",
    descripcion: "Minimarket Los Hermanos",
    direccion:
      "Calle Penetración Nº 1, Suburbanización Mare López, La villa-Olímpica, Próximo a la calle 1",
    telefono: "809-626-3262",
    ubicacionLink:
      "https://www.google.com/maps/place/19%C2%B025'43.1%22N+70%C2%B041'12.7%22W/@19.4286338,-70.6894342,964m/data=!3m2!1e3!4b1!4m4!3m3!8m2!3d19.4286338!4d-70.6868593?hl=es&entry=ttu",
    imagen: "/estafetas/loshermanos.png",
  },
  {
    id: 2,
    nombre: "Estafeta Nibaje",
    descripcion: "Cafetería Guido",
    direccion: "Avenida Franco Vido, Nº 148, Nibaje",
    telefono: "829-324-2318",
    ubicacionLink:
      "https://www.google.com/maps/place//@19.420887,-70.6811611,3857m/data=!3m2!1e3!4b1?entry=ttu",
    imagen: "/estafetas/cafeteria-guido.png",
  },
  {
    id: 3,
    nombre: "Estafeta El Ensueño",
    descripcion: "Salón y Cafetería Marais",
    direccion: "Calle Paseo de los Locutores, Esquina 11, El Ensueño",
    telefono: "829-755-3636",
    ubicacionLink:
      "https://www.google.com/maps/place/19%C2%B026'22.4%22N+70%C2%B041'26.1%22W/@19.439565,-70.690574,964m/data=!3m2!1e3!4b1!4m4!3m3!8m2!3d19.439565!4d-70.690574?entry=ttu",
    imagen: "/estafetas/salon-y-cafeteria-maraez.png",
  },
  {
    id: 4,
    nombre: "Estafeta Korea",
    descripcion: "Bodega Vasquez",
    direccion: "Calle 6 esquina 2",
    telefono: "",
    ubicacionLink: "https://maps.google.com/?q=19.429781,-70.693405",
    imagen: "/estafetas/estafeta korea.jpeg",
  },
  {
    id: 5,
    nombre: "Estafeta La Villa-Olímpica",
    descripcion: "Palmatec Solutions",
    direccion:
      "Villa-Olímpica, frente Manzana F, al lado del antiguo Colegio Génesis",
    telefono: "809-785-3354",
    ubicacionLink:
      "https://www.google.com/maps/place/19.435309,-70.685961/data=!4m6!3m5!1s0!7e2!8m2!3d19.435309!4d-70.68596099999999",
    imagen: "/estafetas/palmatech-solution.png",
  },
  {
    id: 6,
    nombre: "Estafeta Ensanche Bermúdez",
    descripcion: "St Electronics",
    direccion: "Calle 11, número 27, Ensanche Bermúdez",
    telefono: "849-437-3100",
    ubicacionLink:
      "https://www.google.com/maps/place/Espailla,+51000+Santiago+de+los+Caballeros/@19.4717075,-70.7148707,964m/data=!3m2!1e3!4b1!4m6!3m5!1s0x8eb1c5e2c3c79d7d:0x3a75c6d5f2312708!8m2!3d19.4717075!4d-70.7148707",
    imagen: "/estafetas/St electronics.png",
  },
  {
    id: 7,
    nombre: "Estafeta Los Guandules",
    descripcion: "Mini Market El Vecino",
    direccion: "Estafeta de pago Los Guandules, próximo al puente",
    telefono: "+1 829 218 1889",
    ubicacionLink:
      "https://www.google.com/maps/place/19%C2%B026'15.3%22N+70%C2%B041'22.2%22W/@19.4381999,-70.6893169,526m/data=!3m1!1e3!4m4!3m3!8m2!3d19.437576!4d-70.689512?entry=ttu",
    imagen: "/estafetas/losguandules.png",
  },
];

const cuentasBancarias = [
  {
    banco: "BANRESERVAS",
    numero: "9600153322",
    tipo: "Cuenta Corriente",
    titular: "PLAYCENTER",
  },
  {
    banco: "POPULAR",
    numero: "0798928750",
    tipo: "Cuenta Ahorro",
    titular: "FRANKLYN SANTOS",
  },
  {
    banco: "BHD",
    numero: "18673320016",
    tipo: "Cuenta Corriente",
    titular: "FRANKLYN SANTOS",
  },
  {
    banco: "SantaCruz",
    numero: "11142010011632",
    tipo: "Cuenta Ahorro",
    titular: "PLAYCENTER",
  },
  {
    banco: "Scotiabank",
    numero: "12010008845",
    tipo: "Cuenta Ahorro",
    titular: "FRANKLYN SANTOS",
  },
  {
    banco: "ASOC. CIBAO",
    numero: "100090238474",
    tipo: "Cuenta Ahorro",
    titular: "FRANKLYN SANTOS",
  },
];

export default function Estafetas() {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Variantes de animación
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0 },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const handleCopy = (numero, index) => {
    navigator.clipboard.writeText(numero);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const openImageModal = (estafeta) => {
    setSelectedImage(estafeta);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setTimeout(() => setSelectedImage(null), 300);
  };

  // Cerrar modal con tecla ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && modalOpen) {
        closeModal();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [modalOpen]);

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [modalOpen]);

  return (
    <div
      className="max-w-[1400px] mx-auto px-4 py-6 antialiased font-sans"
      style={{ paddingTop: "30px" }}
    >
      {/* Header con animación */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="text-center mb-8"
      >
        <motion.h1
          variants={fadeInUp}
          className="text-2xl md:text-3xl font-black font-sans tracking-tight leading-tight mb-2 text-gray-900 dark:text-gray-100 uppercase"
        >
          Estafetas de Pago y Métodos de Pago
        </motion.h1>
        <motion.p
          variants={fadeInUp}
          className="text-gray-600 dark:text-gray-300 text-sm md:text-base"
        >
          Puedes pagar tu factura en cualquiera de nuestros puntos autorizados o
          mediante transferencia bancaria.
        </motion.p>
      </motion.div>

      {/* Cuentas Bancarias - Diseño Compacto */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-transparent rounded-xl p-2.5 md:p-3 mb-5 md:mb-6"
      >
        <h2 className="text-base md:text-lg font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-1 uppercase">
          <FaMoneyCheckAlt className="text-sm md:text-base" />
          Cuentas Bancarias
        </h2>
        <p className="text-xs md:text-sm text-red-600 dark:text-red-400 font-semibold mb-2">
          ⚠️ Incluye tu código o nombre en la descripción del pago
        </p>
        <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300 mb-3 md:mb-4">
          Envía el comprobante al{" "}
          <span className="font-bold font-mono">809-582-1212</span>
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 tabular-nums">
          {cuentasBancarias.map((cuenta, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 md:p-3 shadow-sm hover:shadow-md transition"
            >
              <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1 mb-1 tracking-wide uppercase">
                <FaUniversity className="text-xs md:text-sm" />
                {cuenta.banco}
                <span className="text-[11px] md:text-xs font-normal text-gray-500 dark:text-gray-400">
                  · {cuenta.tipo}
                </span>
              </h3>
              <div className="space-y-1">
                <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <span className="font-mono tabular-nums whitespace-nowrap text-gray-900 dark:text-gray-100 text-xs md:text-sm">
                    {cuenta.numero}
                  </span>
                  <button
                    onClick={() => handleCopy(cuenta.numero, index)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-200 p-1"
                    aria-label={`Copiar ${cuenta.numero}`}
                    title="Copiar"
                  >
                    {copiedIndex === index ? (
                      <FaCheck size={14} />
                    ) : (
                      <FaRegCopy size={14} />
                    )}
                  </button>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {cuenta.titular}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Estafetas */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
      >
        {estafetas.map((punto, index) => (
          <motion.div
            key={punto.id}
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="flex flex-col md:flex-row bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-lg transition"
          >
            <div
              className="w-full md:w-1/2 h-40 md:h-48 lg:h-56 bg-transparent flex items-center justify-center p-2 cursor-pointer"
              onClick={() => openImageModal(punto)}
              title="Click para ver imagen completa"
            >
              <img
                src={punto.imagen}
                alt={punto.nombre}
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <div className="p-4 flex flex-col justify-between flex-1">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">
                  {punto.nombre}
                </h2>
                <p className="text-gray-700 dark:text-gray-300 text-sm md:text-base font-medium mb-1">
                  {punto.descripcion}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base mb-1">
                  {punto.direccion}
                </p>
                {punto.telefono && (
                  <p className="text-green-600 dark:text-green-400 text-sm md:text-base flex items-center gap-1 mb-1">
                    <FaWhatsapp className="text-green-500 dark:text-green-300 text-sm md:text-base" />
                    <span className="font-mono tabular-nums whitespace-nowrap">
                      {punto.telefono}
                    </span>
                  </p>
                )}
              </div>
              <a
                href={punto.ubicacionLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-800 dark:text-gray-100 hover:underline mt-2 text-sm md:text-base font-semibold flex items-center gap-2"
              >
                <FaMapMarkerAlt className="text-xs md:text-sm" />
                Ver ubicación
              </a>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-center text-gray-500 dark:text-gray-400 mt-8 text-sm md:text-base"
      >
        ¡Agradecemos su preferencia! Estamos para servirle.
      </motion.p>

      {/* Modal de Vista Completa */}
      {modalOpen && selectedImage && (
        <div
          className="estafeta-modal-bg fixed inset-0 z-[9999] flex flex-col"
          style={{ backgroundColor: "#ffffff" }}
          onClick={closeModal}
        >
          <style>
            {`
              @media (prefers-color-scheme: dark) {
                .estafeta-modal-bg {
                  background-color: #000000 !important;
                }
                .estafeta-modal-header {
                  background-color: #000000 !important;
                  border-color: #1f2937 !important;
                }
                .estafeta-modal-info {
                  background-color: #000000 !important;
                  border-color: #1f2937 !important;
                }
                .estafeta-modal-btn {
                  background-color: #374151 !important;
                  color: #ffffff !important;
                }
                .estafeta-modal-btn:hover {
                  background-color: #4b5563 !important;
                }
              }
              html.dark .estafeta-modal-bg {
                background-color: #000000 !important;
              }
              html.dark .estafeta-modal-header {
                background-color: #000000 !important;
                border-color: #1f2937 !important;
              }
              html.dark .estafeta-modal-info {
                background-color: #000000 !important;
                border-color: #1f2937 !important;
              }
              html.dark .estafeta-modal-btn {
                background-color: #374151 !important;
                color: #ffffff !important;
              }
              html.dark .estafeta-modal-btn:hover {
                background-color: #4b5563 !important;
              }
            `}
          </style>

          {/* Header con Título y Botón Cerrar */}
          <div
            className="estafeta-modal-header flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b"
            style={{ backgroundColor: "#ffffff", borderColor: "#e5e7eb" }}
          >
            <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-blue-600 dark:text-blue-400 flex-1 pr-4">
              {selectedImage.nombre}
            </h3>
            <button
              onClick={closeModal}
              className="estafeta-modal-btn p-2 md:p-3 rounded-full transition-all duration-300 shadow-2xl hover:scale-110 hover:rotate-90 flex-shrink-0"
              style={{ backgroundColor: "#f3f4f6", color: "#111827" }}
              title="Cerrar"
            >
              <FaTimes size={20} className="md:w-[22px] md:h-[22px]" />
            </button>
          </div>

          {/* Imagen con Object Contain */}
          <div
            className="flex-1 w-full flex items-center justify-center px-4 py-4 md:px-8 md:py-6"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.imagen}
              alt={selectedImage.nombre}
              className="max-w-full max-h-full object-contain"
              style={{
                maxHeight: "70vh",
                maxWidth: "90%",
                width: "auto",
                height: "auto",
              }}
            />
          </div>

          {/* Descripción */}
          <div
            className="estafeta-modal-info border-t-2 p-4 md:p-6"
            style={{ backgroundColor: "#ffffff", borderColor: "#e5e7eb" }}
          >
            <div className="max-w-4xl mx-auto">
              <p className="text-sm md:text-base lg:text-lg text-gray-700 dark:text-gray-200 text-center font-medium leading-relaxed">
                {selectedImage.descripcion}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
