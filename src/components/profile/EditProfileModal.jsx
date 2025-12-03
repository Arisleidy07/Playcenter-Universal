import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function EditProfileModal({
  open,
  onClose,
  initialInfo,
  onSave,
  saving,
}) {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");

  useEffect(() => {
    if (open) {
      setNombre(initialInfo?.displayName || "");
      setTelefono(initialInfo?.telefono || "");
      setDireccion(initialInfo?.direccion || "");
    }
  }, [open, initialInfo]);

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[999999]"
          role="dialog"
          aria-modal
          onClick={onClose}
          style={{ zIndex: 999999 }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            style={{ zIndex: 999998 }}
          />

          {/* Mobile: Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="absolute left-0 right-0 bottom-0 bg-white rounded-t-2xl shadow-2xl p-6 md:hidden max-h-[85vh] overflow-y-auto"
            style={{ zIndex: 999999 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto h-1.5 w-14 bg-gray-300 rounded-full mb-4" />
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Editar Perfil</h3>
              <button
                className="p-2 rounded hover:bg-gray-100"
                onClick={onClose}
              >
                ✕
              </button>
            </div>
            <div
              className="space-y-4"
              style={{ position: "relative", zIndex: 1 }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  className="w-full px-4 py-2 border rounded-lg"
                  style={{ position: "relative", zIndex: 1 }}
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  className="w-full px-4 py-2 border rounded-lg"
                  style={{ position: "relative", zIndex: 1 }}
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="809-555-1234"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <textarea
                  className="w-full px-4 py-2 border rounded-lg"
                  style={{ position: "relative", zIndex: 1 }}
                  rows={3}
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Tu dirección completa"
                />
              </div>
            </div>
            <div
              className="mt-6 flex gap-2"
              style={{ position: "relative", zIndex: 1 }}
            >
              <button
                className="flex-1 px-4 py-2 border rounded-lg"
                style={{ position: "relative", zIndex: 1 }}
                onClick={onClose}
              >
                Cancelar
              </button>
              <button
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                style={{ position: "relative", zIndex: 1 }}
                onClick={() =>
                  onSave({ displayName: nombre, telefono, direccion })
                }
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </motion.div>

          {/* Desktop: Centered modal */}
          <div
            className="hidden md:flex items-center justify-center h-full"
            style={{ zIndex: 999999 }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6"
              style={{ position: "relative", zIndex: 999999 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Editar Perfil</h3>
                <button
                  className="p-2 rounded hover:bg-gray-100"
                  onClick={onClose}
                >
                  ✕
                </button>
              </div>
              <div
                className="space-y-4"
                style={{ position: "relative", zIndex: 1 }}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    className="w-full px-4 py-2 border rounded-lg"
                    style={{ position: "relative", zIndex: 1 }}
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    className="w-full px-4 py-2 border rounded-lg"
                    style={{ position: "relative", zIndex: 1 }}
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="809-555-1234"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border rounded-lg"
                    style={{ position: "relative", zIndex: 1 }}
                    rows={3}
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Tu dirección completa"
                  />
                </div>
              </div>
              <div
                className="mt-6 flex justify-end gap-2"
                style={{ position: "relative", zIndex: 1 }}
              >
                <button
                  className="px-4 py-2 border rounded-lg"
                  style={{ position: "relative", zIndex: 1 }}
                  onClick={onClose}
                >
                  Cancelar
                </button>
                <button
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                  style={{ position: "relative", zIndex: 1 }}
                  onClick={() =>
                    onSave({ displayName: nombre, telefono, direccion })
                  }
                >
                  {saving ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
