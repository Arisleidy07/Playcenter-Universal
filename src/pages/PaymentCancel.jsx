import { Link } from "react-router-dom";
import { XCircle, ShoppingCart, Home } from "lucide-react";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useCarrito } from "../context/CarritoContext";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useEffect } from "react";
import { motion } from "framer-motion";

export default function PaymentCancel() {
  const { usuarioInfo } = useAuth();
  const { carrito, vaciarCarrito } = useCarrito();

  useEffect(() => {
    const guardarCancelada = async () => {
      if (usuarioInfo && carrito.length > 0) {
        try {
          await addDoc(collection(db, "orders"), {
            userId: usuarioInfo.uid,
            userEmail: usuarioInfo.email,
            userName: usuarioInfo.displayName,
            productos: carrito,
            total: carrito.reduce(
              (acc, p) => acc + (p.precio || 0) * p.cantidad,
              0
            ),
            estado: "cancelado",
            fecha: serverTimestamp(),
          });
          vaciarCarrito();
        } catch (err) {
          console.error("Error guardando orden cancelada:", err);
        }
      }
    };
    guardarCancelada();
  }, [usuarioInfo, carrito, vaciarCarrito]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center bg-red-50 px-6"
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-3xl shadow-2xl p-10 max-w-lg w-full text-center"
      >
        <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6 drop-shadow" />
        <h1 className="text-3xl font-extrabold text-red-600 mb-4">
          Pago cancelado
        </h1>
        <p className="text-gray-600 mb-6">
          El proceso de pago no se completó. Puedes intentar nuevamente.
        </p>
        <div className="flex flex-col sm:flex-row sm:justify-center gap-4">
          <Link
            to="/carrito"
            className="px-6 py-3 rounded-xl bg-red-600 text-white font-bold shadow hover:bg-red-700 transition flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" /> Volver al carrito
          </Link>
          <Link
            to="/"
            className="px-6 py-3 rounded-xl bg-gray-200 text-gray-700 font-bold shadow hover:bg-gray-300 transition flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" /> Ir a la tienda
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
