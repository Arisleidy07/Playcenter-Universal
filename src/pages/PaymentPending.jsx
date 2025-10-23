import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useCarrito } from "../context/CarritoContext";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Clock, CreditCard, Shield, Zap } from "lucide-react";
import "../styles/PaymentLoader.css";

const API_BASE = import.meta.env.DEV ? "" : "https://playcenter-universal.onrender.com";

function readCheckoutPayload() {
  try {
    const raw = sessionStorage.getItem("checkoutPayload");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function PaymentPending() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { usuario, usuarioInfo } = useAuth();
  const { carrito, vaciarCarrito } = useCarrito();
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(0);

  // Fullscreen: desactivar scroll del body
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    const session = searchParams.get("session");
    const payload = readCheckoutPayload(); // { mode, items, total }

    // Animación de progreso incremental
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return Math.min(90, prev + Math.random() * 15);
      });
    }, 200);

    // Animación de pasos
    const stepTimer = setTimeout(() => setStep(2), 900);
    const stepTimer2 = setTimeout(() => setStep(3), 1600);

    const verificar = async () => {
      try {
        if (!session) {
          navigate("/payment/cancel");
          return;
        }

        const skRes = await fetch(`${API_BASE}/cardnet/get-sk/${session}`);
        const { sk } = await skRes.json();

        if (!sk) {
          navigate(`/payment/cancel?session=${session}`);
          return;
        }

        const res = await fetch(`${API_BASE}/cardnet/verify/${session}/${sk}`);
        const data = await res.json();

        const productos = payload?.items?.length
          ? payload.items.map(item => ({
              id: item.id,
              nombre: item.nombre,
              precio: Number(item.precio) || 0,
              cantidad: item.cantidad,
              imagen: item.imagen || '/Productos/default.jpg',
              empresa: item.empresa || 'N/A',
              subtotal: (Number(item.precio) || 0) * item.cantidad
            }))
          : (carrito || []).map((p) => ({
              id: p.id,
              nombre: p.nombre,
              precio: Number(p.precio) || 0,
              cantidad: p.cantidad,
              imagen: p.imagen || '/Productos/default.jpg',
              empresa: p.empresa || 'N/A',
              subtotal: (Number(p.precio) || 0) * p.cantidad
            }));

        const total =
          payload?.total ??
          (carrito || []).reduce((acc, item) => acc + (Number(item.precio) || 0) * item.cantidad, 0);

        const orderData = {
          userId: usuario?.uid || null,
          userEmail: usuarioInfo?.email || usuario?.email || null,
          userName: usuarioInfo?.displayName || null,
          userPhone: usuarioInfo?.telefono || null,
          productos,
          total,
          subtotal: productos.reduce((acc, item) => acc + item.subtotal, 0),
          impuestos: 0,
          envio: 0,
          estado: data?.ResponseCode === "00" ? "completado" : "cancelado",
          estadoPago: data?.ResponseCode === "00" ? "pagado" : "fallido",
          metodoPago: "CardNet",
          fecha: serverTimestamp(),
          fechaCreacion: new Date().toISOString(),
          numeroOrden: `PCU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          checkoutMode: payload?.mode || (payload ? "unknown" : "cart"),
          direccionEntrega: usuarioInfo?.direccionCompleta || null,
          telefonoContacto: usuarioInfo?.telefono || null,
          notasEspeciales: null,
          raw: { ...data, SESSION: session },
        };

        try {
          await addDoc(collection(db, "orders"), orderData);
        } catch (err) {
          console.error("❌ Error guardando orden:", err);
        }

        try { sessionStorage.removeItem("checkoutPayload"); } catch {}

        setProgress(100);
        setStep(4);

        setTimeout(() => {
          if (data?.ResponseCode === "00") {
            if ((payload?.mode || "cart") === "cart") vaciarCarrito();
            navigate(`/payment/success?session=${session}`);
          } else {
            navigate(`/payment/cancel?session=${session}`);
          }
        }, 900);
      } catch (err) {
        console.error("❌ Error verificando pago:", err);
        navigate("/payment/cancel");
      }
    };

    if (session) {
      const timer = setTimeout(verificar, 9000);
      return () => {
        clearTimeout(timer);
        clearInterval(progressTimer);
        clearTimeout(stepTimer);
        clearTimeout(stepTimer2);
      };
    } else {
      navigate("/payment/cancel");
    }
  }, [searchParams, navigate, usuario, usuarioInfo, carrito, vaciarCarrito]);

  const steps = [
    { id: 1, icon: CreditCard, title: "Conectando con CardNet", description: "Estableciendo conexión segura" },
    { id: 2, icon: Shield, title: "Verificando seguridad", description: "Validando datos de pago" },
    { id: 3, icon: Zap, title: "Procesando transacción", description: "Confirmando tu compra" },
    { id: 4, icon: CheckCircle, title: "¡Completado!", description: "Redirigiendo..." }
  ];

  return (
    <motion.div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-gray-900 px-4 sm:px-6 md:px-8 overflow-auto py-4 sm:py-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      role="dialog"
      aria-modal="true"
    >
      {/* Partículas de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-200 dark:bg-blue-800 rounded-full opacity-30 dark:opacity-20"
            animate={{
              x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
              y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
            }}
            transition={{
              duration: Math.random() * 12 + 12,
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
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 dark:from-blue-500/10 dark:to-purple-500/10 rounded-2xl sm:rounded-3xl" />
        
        <div className="relative z-10">
          {/* Barra de progreso */}
          <div className="mb-6 sm:mb-8">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Progreso</span>
              <span className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 sm:h-3 overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Pasos */}
          <div className="mb-6 sm:mb-8">
            <AnimatePresence mode="wait">
              {steps.map((stepData) => (
                step >= stepData.id && (
                  <motion.div
                    key={stepData.id}
                    initial={{ opacity: 0, y: 16, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.98 }}
                    transition={{ duration: 0.35, type: "spring" }}
                    className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl mb-2 sm:mb-3 ${
                      step === stepData.id 
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-2 border-blue-200 dark:border-blue-800' 
                        : 'bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <motion.div 
                      className={`p-2 sm:p-3 rounded-lg sm:rounded-xl flex-shrink-0 ${
                        step === stepData.id 
                          ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white' 
                          : 'bg-green-100 text-green-600'
                      }`}
                      animate={step === stepData.id ? { scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <stepData.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </motion.div>
                    <div className="text-left flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 dark:text-gray-100 text-base sm:text-lg">{stepData.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm break-words">{stepData.description}</p>
                    </div>
                    {step > stepData.id && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-green-500 flex-shrink-0">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                      </motion.div>
                    )}
                  </motion.div>
                )
              ))}
            </AnimatePresence>
          </div>

          {/* Loader visual */}
          <div className="mb-6 sm:mb-8">
            <div className="loader mx-auto">
              <div className="loader__bar"></div>
              <div className="loader__bar"></div>
              <div className="loader__bar"></div>
              <div className="loader__bar"></div>
              <div className="loader__bar"></div>
              <div className="loader__ball"></div>
            </div>
          </div>

          {/* Título y descripción */}
          <motion.h1 
            className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-3 sm:mb-4"
            animate={{ opacity: [0.85, 1, 0.85] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Procesando tu pago
          </motion.h1>
          
          <motion.p 
            className="text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Estamos verificando tu transacción con CardNet de forma segura.<br />
            <span className="font-semibold text-blue-600 dark:text-blue-400">Por favor, no cierres esta ventana.</span>
          </motion.p>

          {/* Badges */}
          <motion.div 
            className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
              <span>Conexión segura</span>
            </div>
            <div className="w-1 h-1 bg-gray-300 rounded-full hidden sm:block" />
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
              <span>Tiempo real</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
