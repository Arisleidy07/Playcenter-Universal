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
    <div className="w-full bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-slate-600 overflow-hidden">
      <div className="p-3 max-h-[70vh] overflow-y-auto">
        <p className="px-2 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Cambiar Cuentas
        </p>

        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30 mb-2 border border-gray-200 dark:border-gray-600">
          <div className="relative flex-shrink-0">
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-sm"
                alt="Active"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-slate-700 dark:bg-slate-600 flex items-center justify-center text-white text-lg sm:text-xl font-semibold shadow-sm border-2 border-white dark:border-slate-800 ${currentUser?.photoURL ? 'hidden' : 'flex'}`}
            >
              {((currentUser?.displayName || currentUser?.email)?.charAt(0) || "U").toUpperCase()}
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full shadow-sm" />
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
          <div className="flex-1 min-w-0 overflow-hidden">
            <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white break-words overflow-wrap-anywhere">
              {currentUser?.displayName ||
                currentUser?.email?.split("@")[0] ||
                "Usuario"}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 break-words overflow-wrap-anywhere mt-0.5">
              {currentUser?.email}
            </p>
          </div>
          <Check size={16} className="sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" title="Cuenta activa" />
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
              className="group relative flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
            >
              <div className="relative flex-shrink-0">
                {acc.photoURL ? (
                  <img
                    src={acc.photoURL}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border border-gray-200 dark:border-white/10 shadow-sm"
                    alt="Saved"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-slate-700 dark:bg-slate-600 flex items-center justify-center text-white text-base sm:text-lg font-semibold shadow-sm border border-gray-200 dark:border-white/10 ${acc.photoURL ? 'hidden' : 'flex'}`}
                >
                  {((acc.displayName || acc.email)?.charAt(0) || "U").toUpperCase()}
                </div>
              </div>
              <div className="flex-1 text-left min-w-0 overflow-hidden">
                <p className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 break-words overflow-wrap-anywhere group-hover:text-gray-900 dark:group-hover:text-white">
                  {acc.displayName || acc.email?.split("@")[0] || "Usuario"}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 break-words overflow-wrap-anywhere mt-0.5">
                  {acc.email}
                </p>
              </div>
              <button
                className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
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
          className="w-full flex items-center gap-3 p-3 mt-1 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
        >
          <div className="w-10 h-10 rounded-full border border-dashed border-blue-300 flex items-center justify-center">
            <Plus size={18} />
          </div>
          <span className="text-sm font-medium">Agregar cuenta</span>
        </button>
      </div>

      <div className="h-px bg-gray-200 dark:bg-slate-700 mx-3" />

      <div className="p-3">
        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full flex items-center gap-3 p-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/20 transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Cerrar Sesión</span>
          </button>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-500/20 text-red-700 dark:text-red-300">
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
