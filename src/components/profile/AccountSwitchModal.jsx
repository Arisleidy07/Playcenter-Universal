import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Plus, Mail, Trash2, Check } from "lucide-react";
import { useMultiAccount } from "../../context/MultiAccountContext";
import { useAuth } from "../../context/AuthContext";
import { functions } from "../../firebase";
import { httpsCallable } from "firebase/functions";
import { fixBucket } from "../../utils/imageUtils";

export default function AccountSwitchModal({
  isOpen,
  onClose,
  initialTab = "list",
}) {
  const {
    savedAccounts,
    switchAccount,
    removeAccount,
    addAccount,
    loadingAccounts,
  } = useMultiAccount() || {};
  const { usuario, usuarioInfo, logout } = useAuth();

  const [activeTab, setActiveTab] = useState(initialTab); // 'list' | 'add'
  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setEmail("");
      setAddError("");
      setAddSuccess("");
    }
  }, [isOpen, initialTab]);

  const currentUserCard = useMemo(() => {
    if (!usuario) return null;
    return {
      uid: usuario.uid,
      email: usuario.email,
      displayName:
        usuarioInfo?.displayName ||
        usuario?.displayName ||
        (usuario?.email ? usuario.email.split("@")[0] : "Usuario"),
      photoURL: (() => {
        const raw = usuarioInfo?.fotoURL || usuario?.photoURL || "";
        const fixed = raw ? fixBucket(String(raw)) : "";
        return fixed || null;
      })(),
      role: usuarioInfo?.role || (usuarioInfo?.admin ? "admin" : "user"),
    };
  }, [usuario, usuarioInfo]);

  async function handleAddAccount(e) {
    e?.preventDefault?.();
    setAddError("");
    setAddSuccess("");
    const emailClean = (email || "").trim().toLowerCase();
    if (!emailClean) {
      setAddError("Ingresa un correo");
      return;
    }
    if (emailClean === (usuario?.email || "").toLowerCase()) {
      setAddError("Esa es la cuenta actual");
      return;
    }

    // Si ya está en la lista
    const exists = (savedAccounts || []).some(
      (a) => (a.email || "").toLowerCase() === emailClean,
    );
    if (exists) {
      setAddSuccess("Ya estaba agregada");
      return;
    }

    setAdding(true);
    try {
      // Usar Cloud Function segura para verificar existencia y obtener UID
      const issueToken = httpsCallable(functions, "issueSwitchToken");
      const resp = await issueToken({ email: emailClean });
      const { uid, email: normalizedEmail } = resp?.data || {};

      if (!uid || !normalizedEmail) {
        setAddError("No existe una cuenta con ese correo");
        return;
      }

      const accountData = {
        uid,
        email: normalizedEmail,
        displayName: (normalizedEmail || emailClean).split("@")[0],
        photoURL: null,
        role: "user",
      };

      await addAccount?.(accountData);
      setAddSuccess("Cuenta agregada");
      setEmail("");
      // Permanecer en el modal, NO cambiar de cuenta automáticamente
    } catch (err) {
      console.error("Error al agregar cuenta:", err);
      setAddError("Error al agregar la cuenta");
    } finally {
      setAdding(false);
    }
  }

  const accountsToShow = useMemo(() => {
    const arr = savedAccounts || [];
    // Filtrar duplicados por uid/email
    const seen = new Set();
    return arr.filter((acc) => {
      const key = (acc.email || acc.uid || "").toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [savedAccounts]);

  const getAccountPhotoUrl = (acc) => {
    try {
      const raw = acc?.photoURL || "";
      const fixed = raw ? fixBucket(String(raw)) : "";
      return fixed || null;
    } catch {
      return null;
    }
  };

  const handleSwitch = (acc) => {
    console.log("�️ CLICK EN BOTÓN DETECTADO - handleSwitch called");
    console.log("�🔄 [AccountSwitchModal] handleSwitch called with:", acc);
    console.log(
      "🔄 [AccountSwitchModal] switchAccount function:",
      switchAccount,
    );
    onClose?.();
    setTimeout(() => {
      console.log("🔄 [AccountSwitchModal] Calling switchAccount with:", acc);
      switchAccount?.(acc);
    }, 60);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[99998] bg-black"
            onClick={onClose}
          />

          {/* Modal container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ duration: 0.18 }}
            className="fixed z-[99999] inset-0 flex items-center justify-center p-3"
            aria-modal="true"
            role="dialog"
          >
            <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 md:px-5 py-3 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">
                  Cambiar de cuenta
                </h3>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                  aria-label="Cerrar"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body - Horizontal en desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Left: cuentas guardadas */}
                <div className="p-4 md:p-5">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Cuentas guardadas
                  </p>

                  {/* Cuenta actual */}
                  {currentUserCard && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 mb-2">
                      <div className="relative flex-shrink-0">
                        {currentUserCard.photoURL ? (
                          <img
                            src={currentUserCard.photoURL}
                            alt="Actual"
                            className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-slate-700 text-white flex items-center justify-center text-lg font-semibold">
                            {(
                              currentUserCard.displayName ||
                              currentUserCard.email ||
                              "U"
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                        )}
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-slate-800" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {currentUserCard.displayName}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {currentUserCard.email}
                        </p>
                      </div>
                      <Check
                        size={16}
                        className="text-blue-600 dark:text-blue-400"
                        title="Cuenta activa"
                      />
                    </div>
                  )}

                  <div className="max-h-[46vh] overflow-y-auto pr-1">
                    {loadingAccounts ? (
                      <p className="text-sm text-slate-500">Cargando...</p>
                    ) : accountsToShow && accountsToShow.length > 0 ? (
                      accountsToShow
                        .filter((acc) => acc.uid !== usuario?.uid)
                        .map((acc) => (
                          <div
                            key={acc.email || acc.uid}
                            className="group flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors border border-transparent"
                          >
                            <button
                              onClick={() => handleSwitch(acc)}
                              className="flex items-center gap-3 flex-1 text-left"
                            >
                              <div className="relative flex-shrink-0">
                                {getAccountPhotoUrl(acc) ? (
                                  <img
                                    src={getAccountPhotoUrl(acc)}
                                    alt="Avatar"
                                    className="w-11 h-11 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <div className="w-11 h-11 rounded-full bg-slate-700 text-white flex items-center justify-center text-base font-semibold">
                                    {(acc.displayName || acc.email || "U")
                                      .charAt(0)
                                      .toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate group-hover:text-slate-900 dark:group-hover:text-white">
                                  {acc.displayName ||
                                    acc.email?.split("@")[0] ||
                                    "Usuario"}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                  {acc.email}
                                </p>
                              </div>
                            </button>
                            <button
                              onClick={() => removeAccount?.(acc.uid)}
                              className="p-1.5 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              title="Eliminar de la lista"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))
                    ) : (
                      <p className="text-sm text-slate-500">
                        No hay cuentas guardadas.
                      </p>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden md:block w-px bg-slate-200 dark:bg-slate-700" />

                {/* Right: agregar cuenta */}
                <div className="p-4 md:p-5">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                    Agregar cuenta (no cambia sesión)
                  </p>
                  <form onSubmit={handleAddAccount} className="space-y-3">
                    <div>
                      <label className="block text-xs text-slate-600 dark:text-slate-300 mb-1">
                        Correo electrónico
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="usuario@correo.com"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    {addError && (
                      <div className="text-sm text-red-600 dark:text-red-400">
                        {addError}
                      </div>
                    )}
                    {addSuccess && (
                      <div className="text-sm text-green-600 dark:text-green-400">
                        {addSuccess}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={adding}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-60"
                      >
                        <Plus size={16} />
                        {adding ? "Agregando..." : "Agregar"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEmail("");
                          setAddError("");
                          setAddSuccess("");
                        }}
                        className="px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        Limpiar
                      </button>
                    </div>
                  </form>

                  <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                    La cuenta agregada aparecerá en la lista de la izquierda.
                    Luego podrás seleccionarla para cambiar de sesión. No se
                    cambiará automáticamente.
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
