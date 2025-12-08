import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import AccountMenu from "./AccountMenu";

export default function AccountMenuWrapper({
  isOpen,
  onClose,
  currentUser,
  onAddAccount,
  onLogout,
}) {
  // Handler para cambiar de cuenta que cierra el modal primero
  const handleSwitchAccount = (switchFn) => {
    onClose(); // Cerrar modal inmediatamente
    setTimeout(() => switchFn(), 50); // Pequeño delay para que se vea el cierre
  };
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for all viewports */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 z-[99998] bg-black/40"
          />

          {/* Desktop/Tablet popover (anchored to parent relative container) */}
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="hidden md:block absolute z-[99999]"
            style={{
              left: "0",
              top: "calc(100% + 8px)",
              width: "min(320px, calc(100vw - 32px))",
            }}
          >
            <AccountMenu
              currentUser={currentUser}
              onAddAccount={onAddAccount}
              onLogout={onLogout}
              onClose={onClose}
              onSwitchAccount={handleSwitchAccount}
            />
          </motion.div>

          {/* Mobile dropdown - Responsive positioning */}
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="md:hidden fixed z-[99999] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-600 overflow-hidden"
            style={{
              width: "calc(100vw - 32px)",
              maxWidth: "320px",
              top: "80px", // Más cerca del header
              left: "16px",
              right: "16px",
              transform: "none", // Sin centrado para evitar overflow
            }}
          >
            <AccountMenu
              currentUser={currentUser}
              onAddAccount={onAddAccount}
              onLogout={onLogout}
              onClose={onClose}
              onSwitchAccount={handleSwitchAccount}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
