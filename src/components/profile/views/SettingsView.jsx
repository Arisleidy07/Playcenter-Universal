import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Sun,
  Moon,
  Bell,
  Mail,
  Package,
  Tag,
  Palette,
  LogOut,
  AlertCircle,
  CreditCard,
} from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../../../styles/SettingsToggle.css";

export default function SettingsView() {
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const { theme, toggleTheme, setTheme, isDark } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const selectTheme = (mode) => {
    if (mode !== theme) setTheme(mode);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="max-w-3xl mx-auto grid grid-cols-1 gap-4 md:gap-6">
      {/* Sección de Apariencia */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl p-4 md:p-5 border transition-all duration-300 ring-1 ring-black/5 dark:ring-white/5 ${
          isDark
            ? "bg-slate-900/80 border-slate-700/60"
            : "bg-white border-slate-200/80 shadow-sm"
        }`}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className={`p-2 rounded-xl ring-1 ${
              isDark
                ? "ring-white/5 bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-blue-500/10 text-blue-300"
                : "ring-black/5 bg-gradient-to-br from-blue-500/10 via-sky-500/10 to-blue-500/10 text-blue-700"
            }`}
          >
            <Palette size={20} />
          </div>
          <h2
            className={`text-lg md:text-xl font-bold ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Apariencia
          </h2>
        </div>
        <p
          className={`text-sm mb-3 ${
            isDark ? "text-slate-400" : "text-slate-600"
          }`}
        >
          Elige cómo se ve la aplicación.
        </p>

        <div
          className={`rounded-lg p-3 transition-all duration-300 ${
            isDark ? "bg-slate-800/60" : "bg-slate-50"
          }`}
        >
          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => selectTheme("light")}
              aria-pressed={
                theme === "light" || (theme === "system" && !isDark)
              }
              type="button"
              className={`group w-full rounded-lg p-3 border bg-white dark:bg-slate-900 ring-1 ring-black/5 dark:ring-white/5 transition-all relative overflow-hidden hover:bg-slate-50 dark:hover:bg-slate-800 ${
                theme === "light" || (theme === "system" && !isDark)
                  ? "border-blue-500 ring-2 ring-blue-400/70 bg-blue-50 shadow-md shadow-blue-500/20"
                  : "border-slate-200/80 hover:border-blue-300"
              }`}
            >
              {(theme === "light" || (theme === "system" && !isDark)) && (
                <span className="pointer-events-none absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-blue-500 to-indigo-500" />
              )}
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700 ring-1 ring-black/5">
                  <Sun size={16} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm md:text-base text-slate-900 dark:text-slate-200">
                    Claro
                  </p>
                </div>
                {(theme === "light" || (theme === "system" && !isDark)) && (
                  <span className="ml-auto w-3 h-3 rounded-full bg-blue-600 ring-2 ring-blue-300 shadow-[0_0_0.45rem_rgba(59,130,246,0.45)]" />
                )}
              </div>
            </button>

            <button
              onClick={() => selectTheme("dark")}
              aria-pressed={theme === "dark" || (theme === "system" && isDark)}
              type="button"
              className={`group w-full rounded-lg p-3 border bg-white dark:bg-slate-900 ring-1 ring-black/5 dark:ring-white/5 transition-all relative overflow-hidden hover:bg-slate-50 dark:hover:bg-slate-800 ${
                theme === "dark" || (theme === "system" && isDark)
                  ? "border-blue-500 ring-2 ring-blue-400/70 dark:bg-slate-800 shadow-md shadow-blue-500/20"
                  : "border-slate-200/80 hover:border-blue-300"
              }`}
            >
              {(theme === "dark" || (theme === "system" && isDark)) && (
                <span className="pointer-events-none absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-blue-500 to-indigo-500" />
              )}
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg ring-1 bg-blue-50 text-blue-700 ring-black/5 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-white/5">
                  <Moon size={16} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm md:text-base text-slate-900 dark:text-white">
                    Oscuro
                  </p>
                </div>
                {(theme === "dark" || (theme === "system" && isDark)) && (
                  <span className="ml-auto w-3 h-3 rounded-full bg-blue-600 ring-2 ring-blue-300 shadow-[0_0_0.45rem_rgba(59,130,246,0.5)]" />
                )}
              </div>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Sección de Cuenta - Cerrar Sesión */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`rounded-xl p-4 md:p-5 border transition-all duration-300 ring-1 ring-black/5 dark:ring-white/5 ${
          isDark
            ? "bg-slate-900/80 border-slate-700/60"
            : "bg-white border-slate-200/80 shadow-sm"
        }`}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`p-2 rounded-xl ring-1 ${
              isDark
                ? "bg-rose-500/10 ring-white/5 text-rose-300"
                : "bg-rose-50 ring-black/5 text-rose-700"
            }`}
          >
            <LogOut size={20} />
          </div>
          <h2
            className={`text-lg md:text-xl font-bold ${
              isDark ? "text-white" : "text-slate-900"
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
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
              isDark
                ? "bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/15"
                : "bg-rose-50 border border-rose-100 hover:bg-rose-100"
            }`}
          >
            <div
              className={`p-1.5 rounded-lg ${
                isDark
                  ? "bg-rose-500/15 text-rose-300"
                  : "bg-rose-100 text-rose-700"
              }`}
            >
              <LogOut size={18} />
            </div>
            <div className="flex-1 text-left">
              <p
                className={`font-semibold text-sm md:text-base ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                Cerrar Sesión
              </p>
              <p
                className={`text-sm ${
                  isDark ? "text-slate-400" : "text-slate-600"
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
            className={`rounded-lg p-3 border ${
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
                className={`font-semibold text-sm md:text-base ${
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
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm md:text-base transition-all duration-300 ${
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
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm md:text-base transition-all duration-300 ${
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
  accent,
}) {
  return (
    <div
      className={`rounded-lg p-3 transition-all duration-200 h-full relative overflow-hidden ${
        isDark
          ? "bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/60"
          : "bg-slate-50 hover:bg-white border border-slate-200/70"
      } ${checked ? "ring-2 ring-blue-400/60" : ""}`}
      role="button"
      aria-pressed={checked}
      tabIndex={0}
      onClick={() => onChange?.()}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onChange?.();
        }
      }}
    >
      {checked && (
        <span className="pointer-events-none absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-blue-500 to-indigo-500" />
      )}
      <div className="flex items-center justify-between h-full">
        <div className="flex items-center gap-3 flex-1">
          <div
            className={`p-2 rounded-lg ${
              checked
                ? isDark
                  ? "bg-blue-500/15 text-blue-300"
                  : "bg-blue-50 text-blue-700"
                : isDark
                ? "bg-slate-700/70 text-slate-300"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {icon}
          </div>
          <div className="flex-1">
            <p
              className={`font-semibold text-sm md:text-base ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              {label}
            </p>
            <p
              className={`text-sm ${
                isDark ? "text-slate-400" : "text-slate-600"
              }`}
            >
              {description}
            </p>
          </div>
        </div>

        {/* Toggle Switch - user's exact HTML/CSS structure */}
        <label
          className="container"
          style={{ "--clr": accent || "#3B82F6" }}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            checked={checked}
            onChange={onChange}
          />
          <div className="checkmark"></div>
        </label>
      </div>
    </div>
  );
}
