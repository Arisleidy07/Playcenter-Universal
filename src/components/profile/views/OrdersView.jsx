import React from "react";
import { fixBucket } from "../../../utils/imageUtils";
import { Package, ChevronRight, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CardSkeleton } from "../../ui/Skeleton";
import { db } from "../../../firebase";
import { doc, getDoc } from "firebase/firestore";

// Helpers de imagen: extraer URL de varios formatos y campos
const pickUrl = (u) => {
  try {
    if (!u) return "";
    if (typeof u === "string") return fixBucket(u);
    if (typeof u === "object") return fixBucket(u.url || u.src || "");
    return String(u || "");
  } catch {
    return "";
  }
};

const firstImageFromMedia = (arr) => {
  const list = Array.isArray(arr) ? arr : [];
  for (const m of list) {
    const t = String(m?.type || "").toLowerCase();
    const url = pickUrl(m);
    if (url && (!t || t.includes("image") || t === "img" || t === "photo")) {
      return url;
    }
  }
  return "";
};

// Resolver imagen desde documento de Firestore (estructura flexible)
const resolveProductImageFromDoc = (data) => {
  if (!data || typeof data !== "object") return "";
  return (
    pickUrl(Array.isArray(data.imagenPrincipal) && data.imagenPrincipal[0]) ||
    pickUrl(data.imagen) ||
    firstImageFromMedia(data.media) ||
    pickUrl(Array.isArray(data.galeriaImagenes) && data.galeriaImagenes[0]) ||
    pickUrl(Array.isArray(data.imagenes) && data.imagenes[0]) ||
    // Intento con variantes (primera variante disponible)
    (() => {
      const vars = Array.isArray(data.variantes) ? data.variantes : [];
      for (const v of vars) {
        const url =
          pickUrl(Array.isArray(v?.imagenPrincipal) && v.imagenPrincipal[0]) ||
          pickUrl(v?.imagen) ||
          firstImageFromMedia(v?.media);
        if (url) return url;
      }
      return "";
    })()
  );
};

// Resolver imagen desde item del pedido (por si ya trae campos)
const resolveImageFromOrderItem = (p) => {
  if (!p) return "";
  return (
    pickUrl(Array.isArray(p?.imagenPrincipal) && p.imagenPrincipal[0]) ||
    pickUrl(p?.imagen) ||
    firstImageFromMedia(p?.media) ||
    pickUrl(Array.isArray(p?.galeriaImagenes) && p.galeriaImagenes[0]) ||
    pickUrl(Array.isArray(p?.imagenes) && p.imagenes[0]) ||
    ""
  );
};

// Helper para estilos de estado
const getStatusStyles = (estado) => {
  const e = String(estado || "").toLowerCase();
  if (e === "completado")
    return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800";
  if (e === "cancelado" || e === "rechazado")
    return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
  return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800";
};

export default function OrdersView({
  orders = [],
  loading = false,
  onOpenOrder,
}) {
  const [indices, setIndices] = React.useState({});
  const [productImageById, setProductImageById] = React.useState({});
  const fetchingRef = React.useRef(new Set());

  const getPid = (p) =>
    p?.id ||
    p?.productId ||
    p?.productoId ||
    p?.pid ||
    p?.productID ||
    p?.product_id;

  React.useEffect(() => {
    // Recolectar IDs de productos sin imagen para cargar desde Firestore
    const ids = new Set();
    for (const order of orders || []) {
      for (const p of order?.productos || []) {
        const pid = getPid(p);
        if (pid && !productImageById[pid]) {
          ids.add(pid);
        }
      }
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
            const url = resolveProductImageFromDoc(data) || null;
            if (url) {
              setProductImageById((prev) => ({ ...prev, [id]: url }));
            }
          }
        } catch (e) {
          // ignore errors silently
        } finally {
          fetchingRef.current.delete(id);
        }
      }
    };
    load();
  }, [orders, productImageById]);
  if (loading) {
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!orders?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700/80 ring-1 ring-black/5 dark:ring-white/5">
        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full mb-4">
          <Package size={40} className="text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Aún no hay pedidos
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          ¡Es hora de estrenar el carrito!
        </p>
      </div>
    );
  }

  const sortedOrders = [...orders].sort(
    (a, b) => (b.fecha?.seconds || 0) - (a.fecha?.seconds || 0),
  );

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

  return (
    <motion.div
      className="space-y-4 sm:space-y-6 lg:space-y-8 w-full max-w-full overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-slate-900 dark:text-white break-words tracking-tight flex items-center gap-2">
        <img
          src="/logos/perfil/2.jpg"
          alt=""
          className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full object-cover"
        />
        Historial de Pedidos
      </h2>

      <div className="space-y-3 sm:space-y-4 lg:space-y-6">
        <AnimatePresence>
          {sortedOrders.map((order, i) => (
            <motion.div
              key={order.id}
              variants={itemVariants}
              initial="hidden"
              animate="show"
              transition={{ delay: i * 0.05 }}
              onClick={() => onOpenOrder && onOpenOrder(order)}
              className="group cursor-pointer bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700/80 ring-1 ring-black/5 dark:ring-white/5 hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 overflow-hidden hover:scale-[1.01] hover:shadow-blue-200/50 dark:hover:shadow-blue-900/30"
            >
              <div className="p-4 sm:p-6 lg:p-8 flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-8">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded-xl border-2 border-white dark:border-slate-900 shadow-sm overflow-hidden bg-slate-100 dark:bg-slate-800">
                  {(() => {
                    const imgs = (order.productos || []).map((p) => {
                      const pid = getPid(p);
                      const fromOrder = resolveImageFromOrderItem(p);
                      return (
                        productImageById[pid] ||
                        fromOrder ||
                        "/Copia de play.png"
                      );
                    });
                    const current = indices[order.id] ?? 0;
                    const safeIndex = imgs.length
                      ? ((current % imgs.length) + imgs.length) % imgs.length
                      : 0;
                    const show = imgs[safeIndex];
                    return (
                      <>
                        {show ? (
                          <img
                            src={show}
                            alt=""
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "/Copia de play.png";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <Package size={24} />
                          </div>
                        )}
                        {imgs.length > 1 && (
                          <>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIndices((prev) => ({
                                  ...prev,
                                  [order.id]:
                                    (current - 1 + imgs.length) % imgs.length,
                                }));
                              }}
                              className="absolute left-1 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 shadow"
                              aria-label="Anterior"
                            >
                              <ChevronLeft size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIndices((prev) => ({
                                  ...prev,
                                  [order.id]: (current + 1) % imgs.length,
                                }));
                              }}
                              className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 shadow"
                              aria-label="Siguiente"
                            >
                              <ChevronRight size={16} />
                            </button>
                          </>
                        )}
                      </>
                    );
                  })()}
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-center">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-lg">
                      Pedido #{order.numeroOrden || order.id.slice(0, 8)}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {order.fecha?.seconds
                        ? new Date(order.fecha.seconds * 1000).toLocaleString(
                            "es-DO",
                            {
                              dateStyle: "medium",
                              timeStyle: "short",
                            },
                          )
                        : "Fecha desconocida"}
                    </p>
                    <div className="mt-1 text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      RD$ {order.total}
                    </div>
                    <span
                      className={`mt-1 inline-flex px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyles(
                        order.estado,
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

                {/* CTA */}
                <div className="flex items-center justify-end border-t sm:border-t-0 border-slate-100 dark:border-slate-800 pt-4 sm:pt-0 mt-2 sm:mt-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenOrder && onOpenOrder(order);
                    }}
                    type="button"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-sm sm:text-base font-bold bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:text-white dark:hover:bg-blue-400 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    aria-label="Ver detalles del pedido"
                  >
                    Ver detalles <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
