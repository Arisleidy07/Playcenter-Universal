import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useCarrito } from "../context/CarritoContext";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Clock, CreditCard, Shield, Zap } from "lucide-react";
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

  useEffect(() => {
    const session = searchParams.get("session");
    const payload = readCheckoutPayload(); // { mode, items, total }

    // Animación de progreso
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 200);

    // Animación de pasos
    const stepTimer = setTimeout(() => setStep(2), 1000);
    const stepTimer2 = setTimeout(() => setStep(3), 1800);

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

        // Determinar fuente de productos/total con información completa:
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
          : carrito.map((p) => ({
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
          carrito.reduce((acc, item) => acc + (Number(item.precio) || 0) * item.cantidad, 0);

        const orderData = {
          userId: usuario?.uid || null,
          userEmail: usuarioInfo?.email || usuario?.email || null,
          userName: usuarioInfo?.displayName || null,
          userPhone: usuarioInfo?.telefono || null,
          productos,
          total,
          subtotal: productos.reduce((acc, item) => acc + item.subtotal, 0),
          impuestos: 0, // Agregar si es necesario
          envio: 0, // Agregar si es necesario
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

        // Limpieza de estado de checkout
        try { sessionStorage.removeItem("checkoutPayload"); } catch {}

        setProgress(100);
        setStep(4);

        setTimeout(() => {
          if (data?.ResponseCode === "00") {
            // vaciamos carrito sólo si el pago venía del carrito
            if ((payload?.mode || "cart") === "cart") vaciarCarrito();
            navigate(`/payment/success?session=${session}`);
          } else {
            navigate(`/payment/cancel?session=${session}`);
          }
        }, 1000);
      } catch (err) {
        console.error("❌ Error verificando pago:", err);
        navigate("/payment/cancel");
      }
    };

    if (session) {
      // máximo 5s para mostrar loader antes de verificar
      const timer = setTimeout(verificar, 2500);
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
      className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-6 z-50 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-200 rounded-full opacity-30"
            animate={{
              x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
              y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
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
        className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-10 max-w-lg w-full text-center relative overflow-hidden border border-white/20"
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl"></div>
        
        {/* Content */}
        <div className="relative z-10">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-gray-600">Progreso</span>
              <span className="text-sm font-bold text-blue-600">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Steps */}
          <div className="mb-8">
            <AnimatePresence mode="wait">
              {steps.map((stepData) => (
                step >= stepData.id && (
                  <motion.div
                    key={stepData.id}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    transition={{ duration: 0.4, type: "spring" }}
                    className={`flex items-center gap-4 p-4 rounded-2xl mb-3 ${
                      step === stepData.id 
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200' 
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <motion.div 
                      className={`p-3 rounded-xl ${
                        step === stepData.id 
                          ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white' 
                          : 'bg-green-100 text-green-600'
                      }`}
                      animate={step === stepData.id ? {
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <stepData.icon className="w-6 h-6" />
                    </motion.div>
                    <div className="text-left flex-1">
                      <h3 className="font-bold text-gray-800 text-lg">{stepData.title}</h3>
                      <p className="text-gray-600 text-sm">{stepData.description}</p>
                    </div>
                    {step > stepData.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-green-500"
                      >
                        <CheckCircle className="w-6 h-6" />
                      </motion.div>
                    )}
                  </motion.div>
                )
              ))}
            </AnimatePresence>
          </div>

          {/* Main loader */}
          <motion.div 
            className="mb-8"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <div className="loader mx-auto">
              <div className="loader__bar"></div>
              <div className="loader__bar"></div>
              <div className="loader__bar"></div>
              <div className="loader__bar"></div>
              <div className="loader__bar"></div>
              <div className="loader__ball"></div>
            </div>
          </motion.div>

          {/* Title and description */}
          <motion.h1 
            className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4"
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Procesando tu pago
          </motion.h1>
          
          <motion.p 
            className="text-gray-600 mb-8 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Estamos verificando tu transacción con CardNet de forma segura.<br />
            <span className="font-semibold text-blue-600">Por favor, no cierres esta ventana.</span>
          </motion.p>

          {/* Security badges */}
          <motion.div 
            className="flex justify-center items-center gap-4 text-sm text-gray-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Conexión segura</span>
            </div>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>Tiempo real</span>
            </div>
          </motion.div>

          {/* Animated dots */}
          <motion.div 
            className="flex items-center justify-center space-x-2 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
