import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import AccountMenuWrapper from "./AccountMenuWrapper";

export default function ProfileHeader({
  user,
  userInfo,
  onLogout,
  onAddAccount,
  setView,
  simple = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const currentName =
    userInfo?.displayName || user?.displayName || user?.email || "Usuario";
  const currentAvatar = userInfo?.fotoURL || user?.photoURL || "";

  // Datos actuales para el menú
  const currentUser = {
    uid: user?.uid,
    email: user?.email,
    displayName: currentName,
    photoURL: currentAvatar,
  };

  // Versión simple (sidebar) con flechita y menú reutilizable
  if (simple) {
    return (
      <div className="p-4">
        <div className="relative">
          <button
            onClick={() => setIsOpen((v) => !v)}
            className={`w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg transition-all duration-300 border ${
              isOpen
                ? "bg-gray-100 dark:bg-slate-700/50 border-gray-300 dark:border-slate-600"
                : "hover:bg-gray-50 dark:hover:bg-slate-700/30 border-transparent"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 flex-shrink-0">
                {currentAvatar ? (
                  <img
                    src={currentAvatar}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold">
                    {String(currentName || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1 text-left">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                  {currentName}
                </h3>
              </div>
            </div>
            <ChevronDown
              size={16}
              className={`flex-shrink-0 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          <AccountMenuWrapper
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            currentUser={currentUser}
            onAddAccount={() => {
              setIsOpen(false);
              onAddAccount && onAddAccount();
            }}
            onLogout={() => {
              setIsOpen(false);
              onLogout && onLogout();
            }}
          />
        </div>
      </div>
    );
  }

  // Versión completa con Account Switcher
  return (
    <div className="pl-1 pr-3 sm:pr-4 py-1.5 md:py-2">
      <div className="flex items-center justify-between">
        <div className="relative">
          <button
            onClick={() => setIsOpen((v) => !v)}
            className={`flex items-center gap-2 pl-0.5 pr-2.5 py-1 rounded-full transition-all duration-300 border ${
              isOpen
                ? "bg-gray-100 dark:bg-slate-700/50 border-gray-300 dark:border-slate-600"
                : "hover:bg-gray-50 dark:hover:bg-slate-700/30 border-transparent"
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-blue-600 p-[2px] flex-shrink-0">
              <img
                src={currentAvatar || "https://via.placeholder.com/150"}
                alt="Avatar"
                className="w-full h-full rounded-full object-cover border-2 border-white dark:border-slate-800"
              />
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-sm font-semibold text-gray-900 dark:text-white leading-none truncate max-w-[100px]">
                {String(currentName).split(" ")[0]}
              </span>
              <ChevronDown
                size={14}
                className={`flex-shrink-0 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </div>
          </button>

          <AccountMenuWrapper
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            currentUser={currentUser}
            onAddAccount={() => {
              setIsOpen(false);
              onAddAccount && onAddAccount();
            }}
            onLogout={() => {
              setIsOpen(false);
              onLogout && onLogout();
            }}
          />
        </div>

        <h1 className="text-lg font-bold text-gray-900 dark:text-white hidden md:block">
          Mi Perfil
        </h1>
      </div>
    </div>
  );
}
