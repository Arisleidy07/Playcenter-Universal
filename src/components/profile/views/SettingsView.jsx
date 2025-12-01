import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Bell, Package, Tag, Palette } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";

export default function SettingsView() {
  const [notiEmail, setNotiEmail] = useState(true);
  const [notiPedidos, setNotiPedidos] = useState(true);
  const [notiOfertas, setNotiOfertas] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="space-y-6">
      {/* Sección de Apariencia */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-6 border transition-all duration-300 ${
          isDark
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200 shadow-sm"
        }`}
      >
        <div className="flex items-center gap-3 mb-6">
          <div
            className={`p-2 rounded-xl ${
              isDark ? "bg-blue-600/20" : "bg-blue-50"
            }`}
          >
            <Palette
              className={isDark ? "text-blue-400" : "text-blue-600"}
              size={24}
            />
          </div>
          <h2
            className={`text-2xl font-bold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Apariencia
          </h2>
        </div>

        {/* Toggle de Tema Premium */}
        <div
          className={`rounded-xl p-5 transition-all duration-300 ${
            isDark ? "bg-gray-700/50" : "bg-gray-50"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-xl transition-all duration-300 ${
                  isDark
                    ? "bg-gradient-to-br from-indigo-600 to-purple-600"
                    : "bg-gradient-to-br from-blue-500 to-indigo-500"
                }`}
              >
                {isDark ? (
                  <Moon className="text-white" size={24} />
                ) : (
                  <Sun className="text-white" size={24} />
                )}
              </div>
              <div>
                <p
                  className={`font-bold text-lg ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {isDark ? "Tema Oscuro" : "Tema Claro"}
                </p>
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {isDark
                    ? "Ideal para ambientes con poca luz"
                    : "Perfecto para el día"}
                </p>
              </div>
            </div>

            {/* Toggle Switch Premium */}
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/50 ${
                isDark
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/50"
                  : "bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/50"
              }`}
            >
              <motion.span
                layout
                transition={{
                  type: "spring",
                  stiffness: 700,
                  damping: 30,
                }}
                className={`inline-flex h-6 w-6 items-center justify-center transform rounded-full bg-white shadow-lg ${
                  isDark ? "translate-x-9" : "translate-x-1"
                }`}
              >
                {isDark ? (
                  <Moon className="text-indigo-600" size={14} />
                ) : (
                  <Sun className="text-blue-600" size={14} />
                )}
              </motion.span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Sección de Notificaciones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`rounded-2xl p-6 border transition-all duration-300 ${
          isDark
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200 shadow-sm"
        }`}
      >
        <div className="flex items-center gap-3 mb-6">
          <div
            className={`p-2 rounded-xl ${
              isDark ? "bg-green-600/20" : "bg-green-50"
            }`}
          >
            <Bell
              className={isDark ? "text-green-400" : "text-green-600"}
              size={24}
            />
          </div>
          <h2
            className={`text-2xl font-bold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Notificaciones
          </h2>
        </div>

        <div className="space-y-4">
          <SettingToggle
            icon={<Bell size={20} />}
            label="Notificaciones por email"
            description="Recibe actualizaciones en tu correo"
            checked={notiEmail}
            onChange={() => setNotiEmail((v) => !v)}
            isDark={isDark}
          />
          <SettingToggle
            icon={<Package size={20} />}
            label="Actualizaciones de pedidos"
            description="Estado de tus compras en tiempo real"
            checked={notiPedidos}
            onChange={() => setNotiPedidos((v) => !v)}
            isDark={isDark}
          />
          <SettingToggle
            icon={<Tag size={20} />}
            label="Ofertas y promociones"
            description="Descuentos exclusivos para ti"
            checked={notiOfertas}
            onChange={() => setNotiOfertas((v) => !v)}
            isDark={isDark}
          />
        </div>
      </motion.div>
    </div>
  );
}

function SettingToggle({
  icon,
  label,
  description,
  checked,
  onChange,
  isDark,
}) {
  return (
    <div
      className={`rounded-xl p-4 transition-all duration-300 hover:scale-[1.02] ${
        isDark ? "bg-gray-700/30" : "bg-gray-50 hover:bg-gray-100"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div
            className={`p-2 rounded-lg ${
              checked
                ? isDark
                  ? "bg-blue-600/20 text-blue-400"
                  : "bg-blue-50 text-blue-600"
                : isDark
                ? "bg-gray-600/50 text-gray-400"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            {icon}
          </div>
          <div className="flex-1">
            <p
              className={`font-semibold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {label}
            </p>
            <p
              className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {description}
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <button
          role="switch"
          aria-checked={checked}
          onClick={onChange}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/50 ${
            checked
              ? "bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg shadow-blue-500/50"
              : isDark
              ? "bg-gray-600"
              : "bg-gray-300"
          }`}
        >
          <motion.span
            layout
            transition={{
              type: "spring",
              stiffness: 700,
              damping: 30,
            }}
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ${
              checked ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
