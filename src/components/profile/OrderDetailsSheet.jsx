import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function OrderDetailsSheet({
  open: openProp,
  isOpen,
  onClose,
  order,
}) {
  const open = typeof isOpen !== "undefined" ? isOpen : openProp;
  if (!open) return null;

  const getStatusStyles = (estado) => {
    const e = String(estado || "").toLowerCase();
    if (e === "completado") return "bg-green-100 text-green-700";
    if (e === "cancelado" || e === "rechazado")
      return "bg-red-100 text-red-700";
    return "bg-amber-100 text-amber-700";
  };
  const [productImageById, setProductImageById] = React.useState({});
  const fetchingRef = React.useRef(new Set());
  const getPid = (p) => p?.id || p?.productId || p?.productoId || p?.pid;

  React.useEffect(() => {
    const ids = new Set();
    for (const p of order?.productos || []) {
      const pid = getPid(p);
      if (pid && !productImageById[pid]) ids.add(pid);
    }
    if (ids.size === 0) return;
    const load = async () => {
      for (const id of ids) {
        if (fetchingRef.current.has(id)) continue;
        fetchingRef.current.add(id);
        try {
          const snap = await getDoc(doc(db, "productos", id));
          if (snap.exists()) {
            const data = snap.data();
            const url =
              data?.imagen ||
              (Array.isArray(data?.imagenes) && data.imagenes[0]) ||
              null;
            if (url) setProductImageById((prev) => ({ ...prev, [id]: url }));
          }
        } catch {
        } finally {
          fetchingRef.current.delete(id);
        }
      }
    };
    load();
  }, [order, productImageById]);
  // Evitar scroll del fondo mientras el sheet/modal esté abierto
  React.useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow || "";
    };
  }, [open]);
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
                <div className="text-sm text-gray-600 space-y-3">
                  <div>
                    <div className="text-xs uppercase text-gray-500">Fecha</div>
                    <div className="font-semibold">
                      {order.fecha?.seconds
                        ? new Date(order.fecha.seconds * 1000).toLocaleString(
                            "es-DO",
                            { dateStyle: "medium", timeStyle: "short" }
                          )
                        : "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase text-gray-500">Total</div>
                    <div className="text-base font-bold text-slate-900">
                      RD$ {order.total}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase text-gray-500">
                      Estado
                    </div>
                    <span
                      className={`mt-0.5 inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusStyles(
                        order.estado
                      )}`}
                    >
                      {String(order.estado || "")
                        .charAt(0)
                        .toUpperCase() +
                        String(order.estado || "")
                          .slice(1)
                          .toLowerCase()}
                    </span>
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <h4 className="font-semibold mb-2">Productos</h4>
                  <div className="space-y-3">
                    {order.productos?.map((p, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="h-16 w-16 rounded-md bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden">
                          {(() => {
                            const pid = getPid(p);
                            const src =
                              productImageById[pid] ||
                              p.imagen ||
                              "/Copia de play.png";
                            return (
                              <img
                                src={src}
                                alt={p.nombre}
                                className="h-full w-full object-contain"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = "/Copia de play.png";
                                }}
                              />
                            );
                          })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">
                            {p.nombre}
                          </p>
                          <p className="text-xs text-gray-500">
                            Cant: {p.cantidad}
                          </p>
                        </div>
                        <div className="text-right whitespace-nowrap">
                          <div className="text-sm font-semibold text-blue-600">
                            RD$ {p.precio}
                          </div>
                          <div className="text-xs text-gray-500">
                            Subtotal: RD${" "}
                            {(Number(p.precio) || 0) *
                              (Number(p.cantidad) || 0)}
                          </div>
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

          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="hidden md:flex absolute inset-0 items-center justify-center p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/70 dark:border-slate-700/70 overflow-hidden">
              <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-5 py-4 flex items-center justify-between">
                <h3 className="text-lg font-bold" id="order-details-title">
                  Detalles del pedido
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Cerrar"
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  ×
                </button>
              </div>

              <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                {!order ? (
                  <p className="text-gray-500">Sin información.</p>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-3 text-sm text-gray-600">
                      <div>
                        <div className="text-xs uppercase text-gray-500">
                          Pedido #
                        </div>
                        <div className="font-semibold">
                          {order.numeroOrden || order.id}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs uppercase text-gray-500">
                          Fecha
                        </div>
                        <div className="font-semibold">
                          {order.fecha?.seconds
                            ? new Date(
                                order.fecha.seconds * 1000
                              ).toLocaleString("es-DO", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })
                            : "-"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs uppercase text-gray-500">
                          Total
                        </div>
                        <div className="text-lg font-bold text-slate-900 dark:text-white">
                          RD$ {order.total}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs uppercase text-gray-500">
                          Estado
                        </div>
                        <span
                          className={`mt-0.5 inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusStyles(
                            order.estado
                          )}`}
                        >
                          {String(order.estado || "")
                            .charAt(0)
                            .toUpperCase() +
                            String(order.estado || "")
                              .slice(1)
                              .toLowerCase()}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Productos</h4>
                      <div className="space-y-3">
                        {order.productos?.map((p, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 border border-slate-100 dark:border-slate-800 rounded-lg p-3"
                          >
                            <div className="h-16 w-16 rounded-md bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                              {p.imagen ? (
                                <img
                                  src={p.imagen}
                                  alt={p.nombre}
                                  className="h-full w-full object-contain"
                                />
                              ) : (
                                <div className="text-gray-400 text-xs">IMG</div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {p.nombre}
                              </p>
                              <p className="text-xs text-gray-500">
                                Cant: {p.cantidad}
                              </p>
                            </div>
                            <div className="text-right whitespace-nowrap">
                              <div className="text-sm font-semibold text-blue-600">
                                RD$ {p.precio}
                              </div>
                              <div className="text-xs text-gray-500">
                                Subtotal: RD${" "}
                                {(Number(p.precio) || 0) *
                                  (Number(p.cantidad) || 0)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
