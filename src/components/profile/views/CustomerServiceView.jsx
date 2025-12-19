import React from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

export default function CustomerServiceView() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.12 },
          },
        }}
      >
        <motion.div variants={fadeInUp} className="mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-50">
            Servicio al Cliente
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-2xl">
            ¿Necesitas ayuda con tu pedido, tu tienda o tu cuenta? Aquí tienes
            todas las formas oficiales de contactar con el equipo de Playcenter
            Universal.
          </p>
        </motion.div>

        {/* Tarjeta principal de contacto */}
        <motion.div
          variants={fadeInUp}
          className="rounded-2xl p-5 md:p-6 border bg-white border-gray-200 shadow-sm dark:bg-gray-900 dark:border-gray-700"
        >
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-50 mb-4">
            Información de contacto
          </h2>

          <div className="space-y-4 text-sm">
            <ContactRow
              icon={<MapPin size={18} />}
              label="Dirección"
              value="Av. Estrella Sadhalá #55, Santiago, República Dominicana"
            />
            <ContactRow
              icon={<Phone size={18} />}
              label="Teléfono Tienda"
              value="+1 (849)-635-7000"
            />
            <ContactRow
              icon={<Phone size={18} />}
              label="Teléfono Internet"
              value="+1 (809)-582-1212"
            />
            <ContactRow
              icon={<Mail size={18} />}
              label="Correo electrónico"
              value="playcenter121@gmail.com"
            />
          </div>
        </motion.div>

        {/* Tarjeta de WhatsApp */}
        <motion.div
          variants={fadeInUp}
          className="rounded-2xl p-5 md:p-6 border bg-white border-gray-200 shadow-sm dark:bg-gray-900 dark:border-gray-700"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center dark:bg-emerald-900/30 dark:text-emerald-300">
              <FaWhatsapp size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                WhatsApp de atención
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Escríbenos por WhatsApp para ayuda con tus pedidos o tu tienda.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            <WhatsAppButton
              href="https://wa.me/18496357000"
              label="WhatsApp Tienda"
              description="Consultas sobre compras en tienda física y productos"
            />
            <WhatsAppButton
              href="https://wa.me/18095821212"
              label="WhatsApp Internet"
              description="Ayuda con pedidos en línea y entregas a domicilio"
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function ContactRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center dark:bg-blue-900/30 dark:text-blue-300">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
          {label}
        </p>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 break-words">
          {value}
        </p>
      </div>
    </div>
  );
}

function WhatsAppButton({ href, label, description }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 px-3 py-2.5 rounded-full border border-emerald-500 text-emerald-600 bg-white hover:bg-emerald-50 dark:bg-transparent dark:hover:bg-emerald-900/10 dark:text-emerald-300 text-sm md:text-base transition-all"
    >
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500 text-white">
        <FaWhatsapp size={14} />
      </span>
      <div className="flex flex-col min-w-0">
        <span className="font-semibold leading-tight truncate">{label}</span>
        {description && (
          <span className="text-[11px] md:text-xs opacity-80 leading-tight truncate">
            {description}
          </span>
        )}
      </div>
    </a>
  );
}
