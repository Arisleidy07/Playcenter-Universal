import React, { useState, useEffect } from "react";
import {
  MapPin,
  Plus,
  Trash2,
  Pencil,
  Store as StoreIcon,
  Check,
  ShieldCheck,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CardSkeleton } from "../../ui/Skeleton";
import "../../../styles/Spinners.css";
import "../../../styles/Entrega.css";

export default function AddressesView({
  addresses,
  userId,
  onAdd,
  onEdit,
  onDelete,
  onSetDefault,
  defaultDireccion = "",
  defaultMetodoEntrega = "",
  loading = false,
}) {
  const PLAYCENTER = {
    provincia: "Santiago",
    ciudad: "Santiago de los Caballeros",
    numeroCalle: "Av. Juan Pablo Duarte 68",
    direccionCompleta:
      "Playcenter Universal, Av. Juan Pablo Duarte 68, Santiago de los Caballeros 51000, República Dominicana",
    ubicacion: "https://maps.app.goo.gl/kszSTHedLYWCby1E7",
    metodoEntrega: "tienda",
  };

  // No hay vista de "Ver"; acciones son solo por iconos

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06, when: "beforeChildren" },
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0 },
  };

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingId, setSavingId] = useState(null); // Estado para tracking de guardado
  const [loadingChangeId, setLoadingChangeId] = useState(null);
  const [loadingEditId, setLoadingEditId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [globalSaving, setGlobalSaving] = useState(false);
  const [selectedOverride, setSelectedOverride] = useState(null);

  // Clear optimistic selection once parent props confirm the change
  useEffect(() => {
    if (!selectedOverride) return;
    if (selectedOverride === "tienda") {
      if (defaultMetodoEntrega === "tienda") setSelectedOverride(null);
      return;
    }
    // Selected a user address id
    if (defaultMetodoEntrega !== "tienda") {
      const sel = addresses?.find((a) => a.id === selectedOverride);
      if (
        sel &&
        defaultDireccion &&
        sel.direccionCompleta === defaultDireccion
      ) {
        setSelectedOverride(null);
      }
    }
  }, [selectedOverride, defaultMetodoEntrega, defaultDireccion, addresses]);

  // Lock body scroll while confirmation modal is open (mobile-friendly)
  useEffect(() => {
    if (!showConfirm) return;
    const scrollY = window.scrollY;
    const prev = {
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
      overflow: document.body.style.overflow,
    };
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") setShowConfirm(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.position = prev.position || "";
      document.body.style.top = prev.top || "";
      document.body.style.width = prev.width || "";
      document.body.style.overflow = prev.overflow || "";
      window.scrollTo(0, scrollY);
      window.removeEventListener("keydown", onKey);
    };
  }, [showConfirm]);

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <img
            src="/logos/perfil/3.jpg"
            alt=""
            className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full object-cover"
          />
          Mis Direcciones
        </h2>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 border border-blue-600 px-3 py-2 sm:px-4 sm:py-2 rounded-xl transition-colors dark:text-white dark:bg-blue-600 dark:hover:bg-blue-700 dark:border-blue-600"
        >
          <Plus size={16} /> Nueva Dirección
        </button>
      </div>

      {/* Spinner Loading Animation (global overlay) - identical to Entrega.jsx */}
      <AnimatePresence>
        {globalSaving && (
          <motion.div
            className="spinner-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="status"
            aria-live="polite"
          >
            <div
              className="spinner-container"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <div
                className="dot-spinner"
                style={{ "--uib-size": "3rem", "--uib-color": "#2563EB" }}
              >
                <div className="dot-spinner__dot"></div>
                <div className="dot-spinner__dot"></div>
                <div className="dot-spinner__dot"></div>
                <div className="dot-spinner__dot"></div>
                <div className="dot-spinner__dot"></div>
                <div className="dot-spinner__dot"></div>
                <div className="dot-spinner__dot"></div>
                <div className="dot-spinner__dot"></div>
              </div>
              <motion.div
                className="spinner-text"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                Guardando dirección...
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Eliminado resumen de predeterminada para evitar duplicación visual */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-visible">
        {loading && (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        )}

        {/* Tarjeta: Playcenter (Oficial, no eliminable) */}
        <motion.div
          variants={itemVariants}
          className={`relative bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-900 dark:to-slate-900 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all cursor-default overflow-visible ${
            defaultMetodoEntrega === "tienda" || selectedOverride === "tienda"
              ? "ring-0"
              : "ring-1 ring-gray-200 dark:ring-slate-800"
          } ${
            defaultMetodoEntrega === "tienda" || selectedOverride === "tienda"
              ? "border-2 border-blue-500 dark:border-blue-500"
              : "border border-amber-200 dark:border-amber-500"
          }`}
        >
          {/* Botón Seleccionar Playcenter */}
          <div className="absolute top-5 right-5 z-10 flex items-center gap-2">
            <button
              onClick={async (e) => {
                e.stopPropagation();
                if (defaultMetodoEntrega !== "tienda") {
                  setSelectedOverride("tienda");
                  setSavingId("playcenter");
                  setGlobalSaving(true);
                  try {
                    await Promise.resolve(onSetDefault?.("tienda"));
                  } finally {
                    setSavingId(null);
                    setGlobalSaving(false);
                  }
                }
              }}
              className={`${
                defaultMetodoEntrega === "tienda" ||
                selectedOverride === "tienda"
                  ? "p-2.5 bg-blue-600 text-white border border-blue-600 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 dark:border-blue-600"
                  : "p-2.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:hover:text-blue-300 dark:hover:bg-slate-800"
              } rounded-full transition-all shadow-sm`}
              aria-label="Seleccionar Playcenter"
              title={
                defaultMetodoEntrega === "tienda"
                  ? "Playcenter activo"
                  : "Seleccionar Playcenter"
              }
            >
              {savingId === "playcenter" ? (
                <span className="inline-block w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check size={16} />
              )}
            </button>
          </div>

          {/* Sin overlay por tarjeta para Playcenter al seleccionar */}

          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
            <StoreIcon size={24} />
          </div>

          <h3 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2">
            Playcenter Universal
            <ShieldCheck size={16} className="text-blue-500" />
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed whitespace-pre-wrap break-words">
            {PLAYCENTER.direccionCompleta}
          </p>
          {PLAYCENTER.ubicacion && (
            <a
              href={PLAYCENTER.ubicacion}
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-2 text-blue-600 dark:text-blue-400 font-semibold underline underline-offset-2 break-all"
            >
              Ver ubicación
            </a>
          )}
          <div className="mt-4 pt-4 border-t border-amber-100 dark:border-slate-700">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-500 uppercase tracking-wide">
              Punto de Recogida Oficial
            </span>
          </div>
        </motion.div>

        {!loading &&
          addresses?.map((addr) => {
            const matchesProp =
              defaultMetodoEntrega !== "tienda" &&
              !!defaultDireccion &&
              ((typeof defaultDireccion === "string" &&
                addr.direccionCompleta === defaultDireccion) ||
                (typeof defaultDireccion === "object" &&
                  ((defaultDireccion?.id && addr.id === defaultDireccion.id) ||
                    (defaultDireccion?.direccionCompleta &&
                      addr.direccionCompleta ===
                        defaultDireccion.direccionCompleta))));
            const isSelected = matchesProp || selectedOverride === addr.id;
            const isSaving = savingId === addr.id;
            const isDeleting = deletingId === addr.id;

            return (
              <motion.div
                key={addr.id}
                variants={itemVariants}
                className={`relative rounded-3xl p-6 transition-all cursor-default overflow-visible shadow-sm hover:shadow-xl ${
                  isSelected
                    ? "ring-0"
                    : "ring-1 ring-gray-200 dark:ring-slate-800"
                } bg-white dark:bg-slate-900 ${
                  isSelected
                    ? "border-2 border-blue-500 dark:border-blue-500"
                    : "border border-slate-200 dark:border-slate-700"
                }`}
              >
                {/* Sin burbuja de indicador para evitar doble 'seleccionar' */}

                {/* Overlay solo para eliminación, no para selección */}
                <AnimatePresence>
                  {isDeleting && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-white dark:bg-slate-900 flex flex-col items-center justify-center z-20 rounded-3xl"
                    >
                      <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-3" />
                      <p className="text-sm font-bold text-rose-700 dark:text-rose-400">
                        Eliminando...
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Botones de Acción (con stopPropagation) */}
                <div className="absolute top-5 right-5 z-10 flex items-center gap-2">
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      setLoadingEditId(addr.id);
                      try {
                        await Promise.resolve(onEdit?.(addr));
                      } finally {
                        setLoadingEditId(null);
                      }
                    }}
                    className="p-2.5 text-blue-600 bg-white border border-blue-600 hover:bg-blue-600 hover:text-white dark:text-blue-400 dark:bg-slate-900 dark:border-blue-500 dark:hover:bg-blue-600 dark:hover:text-white rounded-full transition-colors shadow-sm disabled:opacity-60"
                    disabled={!!loadingEditId || isSaving || isDeleting}
                    aria-label="Editar"
                  >
                    {loadingEditId === addr.id ? (
                      <span className="inline-block w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Pencil size={16} />
                    )}
                  </button>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (!isSelected) {
                        setSelectedOverride(addr.id);
                        setSavingId(addr.id);
                        setLoadingChangeId(addr.id);
                        setGlobalSaving(true);
                        try {
                          await Promise.resolve(onSetDefault?.(addr.id));
                        } finally {
                          setSavingId(null);
                          setLoadingChangeId(null);
                          setGlobalSaving(false);
                        }
                      }
                    }}
                    disabled={loadingChangeId === addr.id || isDeleting}
                    aria-busy={loadingChangeId === addr.id}
                    className={`${
                      isSelected
                        ? "p-2.5 bg-blue-600 text-white border border-blue-600 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 dark:border-blue-600"
                        : "p-2.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:hover:text-blue-300 dark:hover:bg-slate-800"
                    } rounded-full transition-all shadow-sm`}
                    aria-label="Seleccionar"
                    title={
                      isSelected
                        ? "Ya es la dirección activa"
                        : "Seleccionar esta dirección"
                    }
                  >
                    {loadingChangeId === addr.id ? (
                      <span className="inline-block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Check size={16} />
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDeleteId(addr.id);
                      setShowConfirm(true);
                    }}
                    className="p-2.5 text-slate-600 hover:text-rose-700 hover:bg-rose-50 dark:text-slate-300 dark:hover:text-rose-300 dark:hover:bg-rose-900 rounded-full transition-all shadow-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                    aria-label="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center mb-4 ring-1 ring-gray-200 dark:ring-slate-800">
                  <MapPin size={24} />
                </div>

                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">
                  {addr.provincia}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap break-words">
                  {addr.direccionCompleta}
                </p>
                {addr.ubicacion && (
                  <a
                    href={addr.ubicacion}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-2 text-blue-600 dark:text-blue-400 font-semibold underline underline-offset-2 break-all"
                  >
                    Ver ubicación
                  </a>
                )}

                {/* Indicador textual de selección removido: solo borde azul en toda la tarjeta */}
              </motion.div>
            );
          })}
      </div>

      <AnimatePresence>
        {showConfirm && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-desc"
          >
            <div
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md touch-none"
              onClick={() => setShowConfirm(false)}
            />
            <motion.div
              initial={{ scale: 0.98, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.98, opacity: 0, y: 12 }}
              className="relative w-full max-w-[16rem] sm:max-w-[20rem] rounded-xl border border-slate-200/70 dark:border-slate-700/70 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden pointer-events-auto"
            >
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                aria-label="Cerrar"
                className="absolute top-2 right-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={18} className="text-slate-600 dark:text-slate-300" />
              </button>

              <div className="p-3 sm:p-4 text-center flex flex-col items-center justify-center">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900 text-red-600 rounded-full flex items-center justify-center mb-2 shadow-inner">
                  <Trash2 size={20} />
                </div>
                <h3
                  id="confirm-title"
                  className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white"
                >
                  ¿Borrar esta dirección?
                </h3>
                <p
                  id="confirm-desc"
                  className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300"
                >
                  Esta acción no se puede deshacer.
                </p>
                <div className="mt-4 flex gap-2 w-full">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 py-2 px-3 rounded-lg font-semibold text-gray-700 dark:text-white bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={async () => {
                      const id = confirmDeleteId;
                      if (!id) return;
                      setDeletingId(id);
                      try {
                        await Promise.resolve(onDelete?.(id));
                        setShowConfirm(false);
                        setConfirmDeleteId(null);
                      } finally {
                        setDeletingId(null);
                      }
                    }}
                    disabled={!!deletingId}
                    className="flex-1 py-2 px-3 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/30 transition-transform active:scale-95 disabled:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  >
                    {deletingId ? (
                      <span className="inline-block w-5 h-5 border-2 border-white/90 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Eliminar"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
