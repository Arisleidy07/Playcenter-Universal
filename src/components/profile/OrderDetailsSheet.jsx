import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function OrderDetailsSheet({ open, onClose, order }) {
  if (!open) return null;
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999]" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="absolute left-0 right-0 bottom-0 bg-white rounded-t-2xl shadow-2xl p-5 max-h-[85vh] overflow-y-auto md:hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto h-1.5 w-14 bg-gray-300 rounded-full mb-4" />
            <h3 className="text-lg font-bold mb-3">Detalles del pedido</h3>
            {!order ? (
              <p className="text-gray-500">Sin información.</p>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Pedido #</span>
                  <span className="font-semibold">
                    {order.numeroOrden || order.id}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Fecha</span>
                  <span className="font-semibold">
                    {order.fecha?.seconds
                      ? new Date(
                          order.fecha.seconds * 1000
                        ).toLocaleDateString()
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Total</span>
                  <span className="font-semibold">RD$ {order.total}</span>
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <h4 className="font-semibold mb-2">Productos</h4>
                  <div className="space-y-3">
                    {order.productos?.map((p, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="h-16 w-16 rounded-md bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden">
                          {p.imagen ? (
                            <img
                              src={p.imagen}
                              alt={p.nombre}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="text-gray-400 text-xs">IMG</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">
                            {p.nombre}
                          </p>
                          <p className="text-xs text-gray-500">
                            Cant: {p.cantidad}
                          </p>
                        </div>
                        <div className="text-sm font-semibold text-blue-600 whitespace-nowrap">
                          RD$ {p.precio}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div className="mt-4 flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-2 border rounded-lg"
              >
                Cerrar
              </button>
              <button className="flex-1 py-2 bg-blue-600 text-white rounded-lg">
                Comprar de nuevo
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
