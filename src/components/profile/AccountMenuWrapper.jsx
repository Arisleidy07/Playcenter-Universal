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

          {/* Mobile bottom sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="md:hidden fixed bottom-0 left-0 right-0 z-[99999] rounded-t-2xl overflow-hidden shadow-2xl"
          >
            <div className="bg-white dark:bg-[#1E293B]">
              <div className="w-full flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-gray-300 dark:bg-white/20 rounded-full" />
              </div>
              <div className="px-2 pb-3">
                <AccountMenu
                  currentUser={currentUser}
                  onAddAccount={onAddAccount}
                  onLogout={onLogout}
                  onClose={onClose}
                  onSwitchAccount={handleSwitchAccount}
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
