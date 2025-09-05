import { Link } from "react-router-dom";
import { XCircle } from "lucide-react";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useCarrito } from "../context/CarritoContext";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useEffect } from "react";

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
            total: carrito.reduce((acc, p) => acc + (p.precio || 0) * p.cantidad, 0),
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
    <div className="min-h-screen flex items-center justify-center bg-red-50 px-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center">
        <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
        <h1 className="text-3xl font-extrabold text-red-600 mb-4">
          Pago cancelado
        </h1>
        <p className="text-gray-600 mb-6">
          El proceso de pago no se completó. Puedes intentar nuevamente.
        </p>
        <div className="flex flex-col sm:flex-row sm:justify-center gap-3">
          <Link to="/carrito" className="px-6 py-3 rounded-xl bg-red-600 text-white font-bold">
            Volver al carrito
          </Link>
          <Link to="/" className="px-6 py-3 rounded-xl bg-gray-200 text-gray-700 font-bold">
            Ir a la tienda
          </Link>
        </div>
      </div>
    </div>
  );
}
