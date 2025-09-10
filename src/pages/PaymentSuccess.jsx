import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, Star, Gift, Sparkles, Home, Download, Trophy, Zap } from "lucide-react";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = import.meta.env.DEV ? "" : "https://playcenter-universal.onrender.com";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState(null);
  const [showConfetti, setShowConfetti] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  // Fullscreen: desactivar scroll del body
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    const session = searchParams.get("session");

    const fetchData = async () => {
      try {
        const q = query(
          collection(db, "orders"),
          where("raw.SESSION", "==", session),
          orderBy("fecha", "desc"),
          limit(1)
        );
        const snap = await getDocs(q);
        if (!snap.empty) setOrder({ id: snap.docs[0].id, ...snap.docs[0].data() });

        const skRes = await fetch(`${API_BASE}/cardnet/get-sk/${session}`);
        const { sk } = await skRes.json();
        if (sk) {
          const res = await fetch(`${API_BASE}/cardnet/verify/${session}/${sk}`);
          const data = await res.json();
          setStatus(data);
        }
      } catch (err) {
        console.error("Error cargando datos:", err);
      }
    };

    if (session) fetchData();

    const confettiTimer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(confettiTimer);
  }, [searchParams]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP", minimumFractionDigits: 2 }).format(amount || 0);

  const formatDate = (fecha) => {
    if (!fecha) return "Fecha no disponible";
    let date;
    if (typeof fecha === "object" && fecha?.seconds) date = new Date(fecha.seconds * 1000);
    else date = new Date(fecha);
    return date.toLocaleDateString("es-DO", {
      year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <motion.div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 px-3 sm:px-6 overflow-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      role="dialog"
      aria-modal="true"
    >
      {/* Confetti */}
      <AnimatePresence>
        {showConfetti && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  backgroundColor: ['#10b981', '#059669', '#34d399', '#6ee7b7', '#a7f3d0'][Math.floor(Math.random() * 5)],
                  left: Math.random() * 100 + '%',
                  top: -10
                }}
                animate={{
                  y: window.innerHeight + 50,
                  x: [0, Math.random() * 200 - 100, Math.random() * 200 - 100],
                  rotate: [0, 360, 720],
                  scale: [1, 0.5, 1]
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  ease: "easeOut",
                  delay: Math.random() * 2
                }}
                exit={{ opacity: 0 }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Partículas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-green-200 rounded-full opacity-30"
            animate={{
              x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
              y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
            }}
            transition={{
              duration: Math.random() * 15 + 15,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%'
            }}
          />
        ))}
      </div>

      <motion.div 
        className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8 lg:p-10 max-w-lg sm:max-w-3xl w-full text-center relative overflow-hidden border border-white/30 my-4"
        initial={{ scale: 0.94, y: 28 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 22, stiffness: 280 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-3xl" />
        
        <div className="relative z-10">
          {/* Icono success */}
          <motion.div
            className="mb-8"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 16, stiffness: 300, delay: 0.15 }}
          >
            <motion.div
              className="relative inline-block"
              animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <CheckCircle className="w-28 h-28 text-green-500 mx-auto drop-shadow-lg" />
              <motion.div
                className="absolute -top-3 -right-3 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center"
                animate={{ scale: [1, 1.25, 1], rotate: [0, 12, -12, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Trophy className="w-5 h-5 text-yellow-600" />
              </motion.div>
              <motion.div
                className="absolute -bottom-2 -left-2 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center"
                animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
              >
                <Sparkles className="w-4 h-4 text-green-600" />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Título */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.h1 
              className="text-5xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4"
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ¡Pago exitoso!
            </motion.h1>
            <motion.div
              className="flex items-center justify-center gap-2 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {[...Array(5)].map((_, i) => (
                <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.7 + i * 0.08, type: "spring" }}>
                  <Star className="w-6 h-6 text-yellow-400 fill-current" />
                </motion.div>
              ))}
            </motion.div>
            <motion.p 
              className="text-gray-700 text-lg leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              Tu transacción fue procesada correctamente.<br />
              ¡Gracias por tu compra en <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">PlayCenter Universal</span>!
            </motion.p>
          </motion.div>

          {/* Resumen de compra */}
          {order ? (
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
            >
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Gift className="w-6 h-6 text-green-600" />
                    Resumen de tu compra
                  </h3>
                  <motion.div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold" whileHover={{ scale: 1.05 }}>
                    ✓ Completado
                  </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Orden ID:</span>
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {order.numeroOrden || order.id?.slice(-8)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{order.userEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fecha:</span>
                      <span className="font-medium">{formatDate(order.fecha)}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Método de pago:</span>
                      <span className="font-medium flex items-center gap-2">
                        <Zap className="w-4 h-4 text-blue-500" />
                        CardNet
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total:</span>
                      <span className="text-2xl font-bold text-green-600">
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                  </div>
                </div>

                {order.productos?.length > 0 && (
                  <div>
                    <button
                      onClick={() => setShowDetails(v => !v)}
                      className="flex items-center gap-2 text-green-600 hover:text-green-800 font-medium mb-4 transition-colors"
                      type="button"
                    >
                      <span>Ver productos ({order.productos.length})</span>
                      <motion.div animate={{ rotate: showDetails ? 180 : 0 }} transition={{ duration: 0.25 }}>
                        ▼
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {showDetails && (
                        <motion.div
                          className="space-y-3"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                        >
                          {order.productos.map((p, i) => (
                            <motion.div
                              key={`${p.id}-${i}`}
                              className="flex items-center justify-between bg-white rounded-xl p-4 border border-green-100"
                              initial={{ opacity: 0, x: -16 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.06 }}
                              whileHover={{ scale: 1.02 }}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                                  🎮
                                </div>
                                <div>
                                  <span className="font-semibold text-gray-800">{p.nombre}</span>
                                  <div className="text-sm text-gray-600">
                                    Cantidad: {p.cantidad} × {formatCurrency(p.precio)}
                                  </div>
                                </div>
                              </div>
                              <span className="font-bold text-green-600">
                                {formatCurrency((Number(p.precio) || 0) * p.cantidad)}
                              </span>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          ) : null}

          {/* Botones */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Home className="w-5 h-5" />
                <span>Seguir comprando</span>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/profile"
                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-gray-700 rounded-xl font-bold shadow-lg border-2 border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-300"
              >
                <Download className="w-5 h-5" />
                <span>Ver historial</span>
              </Link>
            </motion.div>
          </motion.div>

          {/* Detalles técnicos */}
          {status && (
            <motion.details
              className="mt-2 text-left"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6 }}
            >
              <summary className="cursor-pointer text-gray-600 hover:text-gray-800 font-medium mb-2">
                Detalles técnicos de la transacción
              </summary>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 max-h-64 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-gray-600 text-xs font-mono">
                  {JSON.stringify(status, null, 2)}
                </pre>
              </div>
            </motion.details>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
