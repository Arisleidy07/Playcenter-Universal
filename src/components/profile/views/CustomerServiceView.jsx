import React from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail } from "lucide-react";
import { FaWhatsapp, FaFacebook } from "react-icons/fa";

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
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <img
              src="/logos/perfil/5.jpg"
              alt=""
              className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full object-cover"
            />
            Servicio al Cliente
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
            ¿Necesitas ayuda con tu pedido, tu tienda o tu cuenta? Aquí tienes
            todas las formas oficiales de contactar con el equipo de Playcenter
            Universal.
          </p>
        </motion.div>

        {/* Tarjeta principal de contacto */}
        <motion.div
          variants={fadeInUp}
          className="rounded-2xl p-5 md:p-6 border bg-white border-slate-200/80 shadow-sm dark:bg-slate-900 dark:border-slate-700/80 ring-1 ring-black/5 dark:ring-white/5"
        >
          <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
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

        {/* Canales rápidos */}
        <motion.div
          variants={fadeInUp}
          className="rounded-2xl p-5 md:p-6 border bg-white border-slate-200/80 shadow-sm dark:bg-slate-900 dark:border-slate-700/80 ring-1 ring-black/5 dark:ring-white/5"
        >
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Canales rápidos
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Contáctanos por WhatsApp o a través de nuestras redes oficiales.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <ChannelButton
              href="https://wa.me/18496357000"
              label="WhatsApp Tienda"
              variant="whatsapp"
              icon={<FaWhatsapp size={16} />}
            />
            <ChannelButton
              href="https://wa.me/18095821212"
              label="WhatsApp Internet"
              variant="whatsapp"
              icon={<FaWhatsapp size={16} />}
            />
            <ChannelButton
              href="https://www.facebook.com/pcu12"
              label="Facebook Oficial"
              variant="facebook"
              icon={<FaFacebook size={16} />}
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
      <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center ring-1 ring-black/5 dark:bg-blue-900/20 dark:text-blue-300 dark:ring-white/5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <p className="text-base font-bold text-slate-900 dark:text-white break-words leading-tight">
          {value}
        </p>
      </div>
    </div>
  );
}

function ChannelButton({ href, label, icon, variant = "default" }) {
  const variants = {
    whatsapp:
      "bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-500/40",
    facebook: "bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-500/40",
    default: "bg-slate-700 hover:bg-slate-800 focus-visible:ring-slate-500/40",
  };
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex items-center gap-3 px-4 py-3 rounded-xl text-white shadow-sm transition-colors focus:outline-none focus-visible:ring-4 ${variants[variant]}`}
    >
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/20">
        {icon}
      </span>
      <span className="font-bold leading-tight truncate">{label}</span>
    </a>
  );
}
