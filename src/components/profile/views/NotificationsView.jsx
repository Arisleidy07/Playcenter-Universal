import React, { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Package, Tag } from "lucide-react";

export default function NotificationsView() {
  const [notiEmail, setNotiEmail] = useState(true);
  const [notiPedidos, setNotiPedidos] = useState(true);
  const [notiOfertas, setNotiOfertas] = useState(false);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 border bg-white border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-green-50 dark:bg-green-900/30">
            <Bell className="text-green-600 dark:text-green-400" size={22} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-50">
              Notificaciones
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Elige cómo quieres recibir avisos de Playcenter Universal.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <NotificationToggle
            icon={<Bell size={18} />}
            title="Notificaciones por email"
            description="Recibe avisos importantes en tu correo electrónico."
            checked={notiEmail}
            onChange={() => setNotiEmail((v) => !v)}
          />

          <NotificationToggle
            icon={<Package size={18} />}
            title="Actualizaciones de pedidos"
            description="Seguimiento de envíos, entregas y devoluciones."
            checked={notiPedidos}
            onChange={() => setNotiPedidos((v) => !v)}
          />

          <NotificationToggle
            icon={<Tag size={18} />}
            title="Ofertas y promociones"
            description="Recibe cupones y descuentos exclusivos."
            checked={notiOfertas}
            onChange={() => setNotiOfertas((v) => !v)}
          />
        </div>
      </motion.div>
    </div>
  );
}

function NotificationToggle({ icon, title, description, checked, onChange }) {
  return (
    <div className="rounded-xl p-4 bg-gray-50 hover:bg-gray-100 transition-all dark:bg-gray-700/40 dark:hover:bg-gray-600/60">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className={`p-2 rounded-lg ${
              checked
                ? "bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300"
                : "bg-gray-100 text-gray-400 dark:bg-gray-600/60 dark:text-gray-300"
            }`}
          >
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 dark:text-gray-50 text-sm md:text-base truncate">
              {title}
            </p>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mt-0.5">
              {description}
            </p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={onChange}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/40 ${
            checked
              ? "bg-gradient-to-r from-blue-500 to-blue-600 shadow-blue-500/40 shadow-md"
              : "bg-gray-300 dark:bg-gray-500"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
              checked ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
