import React, { useState } from "react";
import { LogOut, Plus, Check, X, AlertCircle, Bell } from "lucide-react";
import { useMultiAccount } from "../../context/MultiAccountContext";
import { useNotifications } from "../../hooks/useNotifications";

export default function AccountMenu({
  currentUser,
  onAddAccount,
  onLogout,
  onClose,
  onSwitchAccount,
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const ctx = useMultiAccount();
  const savedAccounts = ctx?.savedAccounts || [];
  const switchAccount = ctx?.switchAccount || (() => {});
  const removeAccount = ctx?.removeAccount || (() => {});
  const { unreadCount } = useNotifications();

  return (
    <div className="w-full min-w-[280px] max-w-[320px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-600 overflow-hidden">
      <div className="p-2 max-h-96 overflow-y-auto">
        <p className="px-3 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Cambiar Cuentas
        </p>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-500/20 mb-2 border border-blue-100 dark:border-blue-500/30">
          <div className="relative">
            <img
              src={currentUser?.photoURL || "https://via.placeholder.com/150"}
              className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-slate-800"
              alt="Active"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
            {/* Badge de notificaciones */}
            {unreadCount > 0 && (
              <span
                className="absolute -top-1 -right-1 flex items-center justify-center"
                style={{
                  minWidth: "18px",
                  height: "18px",
                  padding: "0 4px",
                  backgroundColor: "#dc2626",
                  color: "#ffffff",
                  fontSize: "10px",
                  fontWeight: "700",
                  borderRadius: "9px",
                  border: "2px solid #ffffff",
                }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
              {currentUser?.displayName ||
                currentUser?.email?.split("@")[0] ||
                "Usuario"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {currentUser?.email}
            </p>
          </div>
          <Check size={18} className="text-blue-600" title="Cuenta activa" />
        </div>

        {savedAccounts
          .filter((acc) => acc.uid !== currentUser?.uid)
          .map((acc) => (
            <div
              key={acc.uid}
              onClick={() =>
                onSwitchAccount
                  ? onSwitchAccount(() => switchAccount(acc))
                  : switchAccount(acc)
              }
              className="group relative flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
            >
              <img
                src={acc.photoURL || "https://via.placeholder.com/150"}
                className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-white/10"
                alt="Saved"
              />
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate group-hover:text-gray-900 dark:group-hover:text-white">
                  {acc.displayName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {acc.email}
                </p>
              </div>
              <button
                className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  removeAccount(acc.uid);
                }}
                title="Eliminar de la lista"
              >
                <X size={16} />
              </button>
            </div>
          ))}

        <button
          onClick={onAddAccount}
          className="w-full flex items-center gap-3 p-2 mt-1 rounded-xl text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
        >
          <div className="w-9 h-9 rounded-full border border-dashed border-blue-300 flex items-center justify-center">
            <Plus size={18} />
          </div>
          <span className="text-sm font-medium">Agregar cuenta</span>
        </button>
      </div>

      <div className="h-px bg-gray-200 dark:bg-slate-700 mx-4" />

      <div className="p-2">
        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/20 transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Cerrar Sesión</span>
          </button>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/20 text-red-700 dark:text-red-300">
              <AlertCircle size={18} />
              <span className="text-sm font-medium">¿Estás seguro?</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onLogout();
                  setShowConfirm(false);
                }}
                className="flex-1 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
              >
                Sí, salir
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-white text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
