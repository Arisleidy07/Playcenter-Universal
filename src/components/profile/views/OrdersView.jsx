import React from "react";
import { Package, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CardSkeleton } from "../../ui/Skeleton";

// Helper para estilos de estado
const getStatusStyles = (estado) => {
  const e = String(estado || "").toLowerCase();
  if (e === "completado")
    return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800";
  if (e === "cancelado")
    return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
  return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800";
};

export default function OrdersView({
  orders = [],
  loading = false,
  onOpenOrder,
}) {
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
      <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-gray-300 dark:border-slate-600">
        <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-full mb-4">
          <Package size={40} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Aún no hay pedidos
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          ¡Es hora de estrenar el carrito!
        </p>
      </div>
    );
  }

  const sortedOrders = [...orders].sort(
    (a, b) => (b.fecha?.seconds || 0) - (a.fecha?.seconds || 0)
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
      <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white break-words">
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
              className="group cursor-pointer bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 overflow-hidden"
            >
              <div className="p-4 sm:p-6 lg:p-8 flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-8">
                {/* Galería */}
                <div className="flex -space-x-3 overflow-hidden py-1 pl-1">
                  {order.productos?.slice(0, 3).map((prod, idx) => (
                    <div
                      key={idx}
                      className="relative w-16 h-16 rounded-xl border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden bg-gray-100 dark:bg-slate-700 z-0 hover:z-10 transition-all hover:scale-110"
                    >
                      <img
                        src={prod.imagen || "https://via.placeholder.com/64"}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {order.productos?.length > 3 && (
                    <div className="w-16 h-16 rounded-xl border-2 border-white dark:border-slate-800 bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-gray-500 z-0">
                      +{order.productos.length - 3}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                        Pedido #{order.numeroOrden || order.id.slice(0, 8)}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {order.fecha?.seconds
                          ? new Date(
                              order.fecha.seconds * 1000
                            ).toLocaleDateString(undefined, {
                              dateStyle: "long",
                            })
                          : "Fecha desconocida"}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyles(
                        order.estado
                      )}`}
                    >
                      {order.estado}
                    </span>
                  </div>
                </div>

                {/* Precio y CTA */}
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-gray-100 dark:border-slate-700 pt-4 sm:pt-0 mt-2 sm:mt-0">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    RD$ {order.total}
                  </span>
                  <div className="flex items-center gap-1 text-sm text-blue-600 font-medium group-hover:translate-x-1 transition-transform mt-1">
                    Ver detalles <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
