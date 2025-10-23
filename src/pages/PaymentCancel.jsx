import { Link, useSearchParams } from "react-router-dom";
import { XCircle, AlertTriangle, RefreshCw, Home, ShoppingCart, Clock, Shield } from "lucide-react";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useCarrito } from "../context/CarritoContext";
import { addDoc, collection, serverTimestamp, query, where, limit, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function readCheckoutPayload() {
  try {
    const raw = sessionStorage.getItem("checkoutPayload");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

export default function PaymentCancel() {
  const [searchParams] = useSearchParams();
  const { usuarioInfo } = useAuth();
  const { carrito } = useCarrito();
  const [saved, setSaved] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Evita scroll en el body mientras esta vista está activa
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    const guardarCancelada = async () => {
      if (saved) return;

      const session = searchParams.get("session");
      const payload = readCheckoutPayload();

      const productos = payload?.items?.length
        ? payload.items
        : (carrito || []).map((p) => ({
            id: p.id,
            nombre: p.nombre,
            precio: Number(p.precio) || 0,
            cantidad: p.cantidad,
          }));

      const total = payload?.total ?? (carrito || []).reduce((acc, p) => acc + (Number(p.precio) || 0) * p.cantidad, 0);

      try {
        if (session) {
          const q = query(collection(db, "orders"), where("raw.SESSION", "==", session), limit(1));
          const snap = await getDocs(q);
          if (!snap.empty) {
            try { sessionStorage.removeItem("checkoutPayload"); } catch {}
            setSaved(true);
            return;
          }
        }

        if (usuarioInfo && (productos.length > 0 || total >= 0)) {
          const productosCompletos = productos.map(p => ({
            id: p.id,
            nombre: p.nombre,
            precio: Number(p.precio) || 0,
            cantidad: p.cantidad,
            imagen: p.imagen || '/Productos/default.jpg',
            empresa: p.empresa || 'N/A',
            subtotal: (Number(p.precio) || 0) * p.cantidad
          }));

          await addDoc(collection(db, "orders"), {
            userId: usuarioInfo.uid,
            userEmail: usuarioInfo.email,
            userName: usuarioInfo.displayName,
            userPhone: usuarioInfo?.telefono || null,
            productos: productosCompletos,
            total,
            subtotal: productosCompletos.reduce((acc, item) => acc + item.subtotal, 0),
            impuestos: 0,
            envio: 0,
            estado: "cancelado",
            estadoPago: "fallido",
            metodoPago: "CardNet",
            fecha: serverTimestamp(),
            fechaCreacion: new Date().toISOString(),
            numeroOrden: `PCU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            checkoutMode: payload?.mode || (payload ? "unknown" : "cart"),
            direccionEntrega: usuarioInfo?.direccionCompleta || null,
            telefonoContacto: usuarioInfo?.telefono || null,
            notasEspeciales: null,
            raw: { SESSION: session || null },
          });

          try { sessionStorage.removeItem("checkoutPayload"); } catch {}
          setSaved(true);
        }
      } catch (err) {
        console.error("Error guardando orden cancelada:", err);
      }
    };

    const timer = setTimeout(guardarCancelada, 600);
    return () => clearTimeout(timer);
  }, [usuarioInfo, carrito, saved, searchParams]);

  const reasons = [
    { icon: Shield, title: "Datos incorrectos", desc: "Verifica la información de tu tarjeta" },
    { icon: Clock, title: "Sesión expirada", desc: "El tiempo límite para el pago se agotó" },
    { icon: AlertTriangle, title: "Fondos insuficientes", desc: "Tu tarjeta no tiene saldo disponible" },
    { icon: XCircle, title: "Cancelado por el usuario", desc: "El pago fue cancelado manualmente" }
  ];

  return (
    <motion.div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-rose-50 via-red-50 to-pink-50 dark:from-gray-900 dark:via-red-950 dark:to-gray-900 px-4 sm:px-6 md:px-8 overflow-auto py-4 sm:py-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      role="dialog"
      aria-modal="true"
    >
      {/* Burbujas animadas de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(16)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 bg-red-200 dark:bg-red-900 rounded-full opacity-20 dark:opacity-15"
            animate={{
              x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
              y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
              rotate: [0, 360]
            }}
            transition={{
              duration: Math.random() * 14 + 14,
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
        className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-xl sm:rounded-2xl md:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 lg:p-12 max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-3xl w-full text-center relative overflow-hidden border border-white/30 dark:border-gray-700/50 my-4"
        initial={{ scale: 0.94, y: 28 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 22, stiffness: 280 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-pink-500/5 dark:from-red-500/10 dark:to-pink-500/10 rounded-3xl" />

        <div className="relative z-10">
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
              <XCircle className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 text-red-500 mx-auto drop-shadow-lg" />
              <motion.div
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.h1 
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-red-600 to-pink-600 dark:from-red-400 dark:to-pink-400 bg-clip-text text-transparent mb-4 sm:mb-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Pago cancelado
          </motion.h1>

          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg leading-relaxed mb-4">
              Tu transacción no pudo ser completada.
            </p>
            <motion.div 
              className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 px-4 py-2 rounded-full border border-green-200 dark:border-green-800"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.65, type: "spring" }}
            >
              <Shield className="w-4 h-4" />
              <span className="font-semibold">No se realizó ningún cargo a tu tarjeta</span>
            </motion.div>
          </motion.div>

          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <button
              onClick={() => setShowDetails(v => !v)}
              className="flex items-center gap-2 mx-auto text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              type="button"
            >
              <span className="font-medium">¿Por qué falló mi pago?</span>
              <motion.div animate={{ rotate: showDetails ? 180 : 0 }} transition={{ duration: 0.25 }}>
                <RefreshCw className="w-4 h-4" />
              </motion.div>
            </button>

            <AnimatePresence>
              {showDetails && (
                <motion.div
                  className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {reasons.map((reason, index) => (
                    <motion.div
                      key={index}
                      className="bg-gray-50 dark:bg-gray-700/50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700"
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.08 }}
                      whileHover={{ scale: 1.02, backgroundColor: "#f8fafc" }}
                    >
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg flex-shrink-0">
                          <reason.icon className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-1 text-sm sm:text-base">{reason.title}</h4>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-words">{reason.desc}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div 
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/carrito"
                className="inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-red-600 to-pink-600 dark:from-red-500 dark:to-pink-500 text-white rounded-lg sm:rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Intentar de nuevo</span>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg sm:rounded-xl font-bold shadow-lg border-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
              >
                <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Ir al inicio</span>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            className="mt-6 sm:mt-8 p-4 sm:p-5 bg-blue-50 dark:bg-blue-950/30 rounded-lg sm:rounded-xl border border-blue-200 dark:border-blue-800"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 text-sm sm:text-base">¿Necesitas ayuda?</h3>
            <p className="text-blue-700 dark:text-blue-300 text-xs sm:text-sm">
              Si el problema persiste, contacta a nuestro equipo de soporte. 
              Estamos aquí para ayudarte a completar tu compra.
            </p>
            <motion.a
              href="/contacto"
              className="mt-3 inline-block text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              whileHover={{ scale: 1.03 }}
            >
              Contactar soporte →
            </motion.a>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
