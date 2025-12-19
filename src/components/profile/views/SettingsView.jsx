import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Sun,
  Moon,
  Bell,
  Package,
  Tag,
  Palette,
  LogOut,
  AlertCircle,
} from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function SettingsView() {
  const [notiEmail, setNotiEmail] = useState(true);
  const [notiPedidos, setNotiPedidos] = useState(true);
  const [notiOfertas, setNotiOfertas] = useState(false);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const isDark = theme === "dark";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

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
              isDark ? "bg-purple-600/20" : "bg-purple-50"
            }`}
          >
            <Palette
              className={isDark ? "text-purple-400" : "text-purple-600"}
              size={24}
            />
          </div>
          <h2
            className={`text-xl font-bold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Apariencia
          </h2>
        </div>

        <div
          className={`rounded-xl p-4 transition-all duration-300 ${
            isDark ? "bg-gray-700/30" : "bg-gray-50"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  isDark
                    ? "bg-indigo-600/20 text-indigo-400"
                    : "bg-blue-50 text-blue-600"
                }`}
              >
                {isDark ? <Moon size={20} /> : <Sun size={20} />}
              </div>
              <div>
                <p
                  className={`font-semibold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Modo {isDark ? "oscuro" : "claro"}
                </p>
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {isDark
                    ? "Cambia a modo claro"
                    : "Cambia a modo oscuro"}
                </p>
              </div>
            </div>

            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/50 ${
                isDark
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600"
                  : "bg-gradient-to-r from-blue-400 to-blue-500"
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
            className={`text-xl font-bold ${
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

      {/* Sección de Cuenta - Cerrar Sesión */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`rounded-2xl p-6 border transition-all duration-300 ${
          isDark
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200 shadow-sm"
        }`}
      >
        <div className="flex items-center gap-3 mb-6">
          <div
            className={`p-2 rounded-xl ${
              isDark ? "bg-red-600/20" : "bg-red-50"
            }`}
          >
            <LogOut
              className={isDark ? "text-red-400" : "text-red-600"}
              size={24}
            />
          </div>
          <h2
            className={`text-xl font-bold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Cuenta
          </h2>
        </div>

        {!showConfirmLogout ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowConfirmLogout(true)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
              isDark
                ? "bg-red-600/10 border border-red-600/20 hover:bg-red-600/20"
                : "bg-red-50 border border-red-100 hover:bg-red-100"
            }`}
          >
            <div
              className={`p-2 rounded-lg ${
                isDark
                  ? "bg-red-600/20 text-red-400"
                  : "bg-red-100 text-red-600"
              }`}
            >
              <LogOut size={20} />
            </div>
            <div className="flex-1 text-left">
              <p
                className={`font-semibold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Cerrar Sesión
              </p>
              <p
                className={`text-sm ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Salir de tu cuenta actual
              </p>
            </div>
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-xl p-4 border ${
              isDark
                ? "bg-red-600/10 border-red-600/20"
                : "bg-red-50 border-red-200"
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle
                className={isDark ? "text-red-400" : "text-red-600"}
                size={20}
              />
              <p
                className={`font-semibold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                ¿Estás seguro de que quieres cerrar sesión?
              </p>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                  isDark
                    ? "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30"
                    : "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20"
                }`}
              >
                Sí, cerrar sesión
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowConfirmLogout(false)}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                  isDark
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                Cancelar
              </motion.button>
            </div>
          </motion.div>
        )}
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
