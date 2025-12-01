import React, { useState } from "react";
import {
  MapPin,
  Plus,
  Trash2,
  Edit2,
  Store as StoreIcon,
  Check,
  CheckCircle,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CardSkeleton } from "../../ui/Skeleton";

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

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Mis Direcciones
        </h2>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={18} /> Nueva Dirección
        </button>
      </div>

      {/* Eliminado resumen de predeterminada para evitar duplicación visual */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          whileHover={{ y: -6, scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (defaultMetodoEntrega !== "tienda") {
              setSavingId("playcenter");
              setTimeout(async () => {
                await onSetDefault?.(PLAYCENTER);
                setSavingId(null);
              }, 600);
            }
          }}
          className="relative bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-800 border-2 rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all cursor-pointer overflow-hidden"
          style={{
            borderColor:
              defaultMetodoEntrega === "tienda" ? "#f59e0b" : "#fde68a",
            borderWidth: defaultMetodoEntrega === "tienda" ? "3px" : "2px",
          }}
        >
          {/* CAPA 2: Indicador de Selección */}
          <div className="absolute top-5 right-5 z-10">
            {defaultMetodoEntrega === "tienda" ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg"
              >
                <Check
                  size={20}
                  className="text-white font-bold"
                  strokeWidth={3}
                />
              </motion.div>
            ) : (
              <div className="w-10 h-10 rounded-full border-3 border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 shadow-md" />
            )}
          </div>

          {/* CAPA 3: Overlay de Animación (Glassmorphism) */}
          <AnimatePresence>
            {savingId === "playcenter" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md flex flex-col items-center justify-center z-20 rounded-3xl"
              >
                <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
                  Guardando...
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
            <StoreIcon size={24} />
          </div>

          <h3 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2">
            Playcenter Universal
            <ShieldCheck size={16} className="text-blue-500" />
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
            {PLAYCENTER.direccionCompleta}
          </p>
          <div className="mt-4 pt-4 border-t border-amber-100 dark:border-slate-700">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-500 uppercase tracking-wide">
              Punto de Recogida Oficial
            </span>
          </div>
        </motion.div>

        {!loading &&
          addresses?.map((addr) => {
            const isSelected =
              defaultMetodoEntrega !== "tienda" &&
              defaultDireccion &&
              addr.direccionCompleta === defaultDireccion;
            const isSaving = savingId === addr.id;

            return (
              <motion.div
                key={addr.id}
                variants={itemVariants}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (!isSelected) {
                    setSavingId(addr.id);
                    setTimeout(async () => {
                      await onSetDefault?.(addr);
                      setSavingId(null);
                    }, 600);
                  }
                }}
                className={`relative rounded-3xl p-6 transition-all cursor-pointer overflow-hidden shadow-lg hover:shadow-2xl ${
                  isSelected
                    ? "bg-blue-50 dark:bg-blue-950/20"
                    : "bg-white dark:bg-slate-800"
                }`}
                style={{
                  borderWidth: isSelected ? "3px" : "2px",
                  borderColor: isSelected ? "#3b82f6" : "#e5e7eb",
                }}
              >
                {/* CAPA 2: Indicador de Selección */}
                <div className="absolute top-5 right-5 z-10">
                  {isSelected ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg"
                    >
                      <Check
                        size={20}
                        className="text-white font-bold"
                        strokeWidth={3}
                      />
                    </motion.div>
                  ) : (
                    <div className="w-10 h-10 rounded-full border-3 border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 shadow-md" />
                  )}
                </div>

                {/* CAPA 3: Overlay de Animación (Glassmorphism) */}
                <AnimatePresence>
                  {isSaving && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md flex flex-col items-center justify-center z-20 rounded-3xl"
                    >
                      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
                      <p className="text-sm font-bold text-blue-700 dark:text-blue-400">
                        Guardando...
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Botones de Acción (con stopPropagation) */}
                <div className="absolute top-5 right-16 z-10 flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit?.(addr);
                    }}
                    className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-full transition-all hover:scale-110 shadow-md bg-white dark:bg-slate-800"
                    aria-label="Editar"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDeleteId(addr.id);
                      setShowConfirm(true);
                    }}
                    className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-700 rounded-full transition-all hover:scale-110 shadow-md bg-white dark:bg-slate-800"
                    aria-label="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 flex items-center justify-center mb-4">
                  <MapPin size={24} />
                </div>

                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">
                  {addr.provincia}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2 min-h-[40px]">
                  {addr.direccionCompleta}
                </p>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                  {isSelected && (
                    <span className="inline-flex items-center gap-2 text-xs font-semibold text-gray-700 bg-gray-100 dark:text-gray-200 dark:bg-slate-700 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-slate-600">
                      <CheckCircle
                        size={14}
                        className="text-green-600 dark:text-green-500"
                      />
                      Dirección Activa
                    </span>
                  )}
                </div>
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
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowConfirm(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
            >
              <div className="bg-red-50 dark:bg-red-900/20 p-6 flex flex-col items-center justify-center border-b border-red-100 dark:border-red-900/30">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/50 text-red-600 rounded-full flex items-center justify-center mb-3 shadow-inner">
                  <Trash2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  ¿Borrar esta dirección?
                </h3>
              </div>
              <div className="p-6 text-center">
                <p className="text-gray-500 dark:text-gray-300 mb-8">
                  Esta acción no se puede deshacer.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-700 dark:text-white bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      const id = confirmDeleteId;
                      setShowConfirm(false);
                      setConfirmDeleteId(null);
                      onDelete && id && onDelete(id);
                    }}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/30 transition-transform active:scale-95"
                  >
                    Eliminar
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
