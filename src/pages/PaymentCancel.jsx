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
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-rose-50 via-red-50 to-pink-50 px-3 sm:px-6 overflow-auto"
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
            className="absolute w-3 h-3 bg-red-200 rounded-full opacity-20"
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
        className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8 lg:p-10 max-w-lg sm:max-w-2xl w-full text-center relative overflow-hidden border border-white/30 my-4"
        initial={{ scale: 0.94, y: 28 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 22, stiffness: 280 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-pink-500/5 rounded-3xl" />

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
              <XCircle className="w-24 h-24 text-red-500 mx-auto drop-shadow-lg" />
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
            className="text-4xl font-extrabold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-6"
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
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
              Tu transacción no pudo ser completada.
            </p>
            <motion.div 
              className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full border border-green-200"
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
              className="flex items-center gap-2 mx-auto text-gray-600 hover:text-gray-800 transition-colors"
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
                  className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {reasons.map((reason, index) => (
                    <motion.div
                      key={index}
                      className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.08 }}
                      whileHover={{ scale: 1.02, backgroundColor: "#f8fafc" }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <reason.icon className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-semibold text-gray-800 mb-1">{reason.title}</h4>
                          <p className="text-sm text-gray-600">{reason.desc}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/carrito"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Intentar de nuevo</span>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/"
                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-gray-700 rounded-xl font-bold shadow-lg border-2 border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-300"
              >
                <Home className="w-5 h-5" />
                <span>Ir al inicio</span>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <h3 className="font-semibold text-blue-800 mb-2">¿Necesitas ayuda?</h3>
            <p className="text-blue-700 text-sm">
              Si el problema persiste, contacta a nuestro equipo de soporte. 
              Estamos aquí para ayudarte a completar tu compra.
            </p>
            <motion.a
              href="/contacto"
              className="mt-3 inline-block text-blue-600 font-semibold hover:text-blue-800 transition-colors"
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
