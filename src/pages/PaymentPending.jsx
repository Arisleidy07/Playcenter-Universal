// src/pages/PaymentPending.jsx
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useCarrito } from "../context/CarritoContext";

const API_BASE = import.meta.env.DEV
  ? "" // usa proxy en localhost
  : "https://playcenter-universal.onrender.com"; // producción

export default function PaymentPending() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { usuario, usuarioInfo } = useAuth();
  const { carrito, vaciarCarrito } = useCarrito();

  useEffect(() => {
    const session = searchParams.get("session");

    const verificar = async () => {
      try {
        const skRes = await fetch(`${API_BASE}/cardnet/get-sk/${session}`);
        const { sk } = await skRes.json();

        if (sk) {
          const res = await fetch(`${API_BASE}/cardnet/verify/${session}/${sk}`);
          const data = await res.json();

          // 💾 Guardar la orden en Firestore
          const orderData = {
            userId: usuario?.uid || null,
            userEmail: usuario?.email || null,
            productos: carrito.map((p) => ({
              id: p.id,
              nombre: p.nombre,
              precio: p.precio,
              cantidad: p.cantidad,
            })),
            total: carrito.reduce(
              (acc, item) => acc + (Number(item.precio) || 0) * item.cantidad,
              0
            ),
            estado: data?.ResponseCode === "00" ? "completado" : "cancelado",
            fecha: serverTimestamp(),
            raw: data, // respuesta completa de CardNet
          };

          try {
            await addDoc(collection(db, "orders"), orderData);
            console.log("✅ Orden guardada en Firestore");
          } catch (err) {
            console.error("❌ Error guardando orden:", err);
          }

          // Vaciar carrito si pago aprobado
          if (data?.ResponseCode === "00") {
            vaciarCarrito();
            navigate(`/payment/success?session=${session}`);
          } else {
            navigate("/payment/cancel");
          }
        } else {
          navigate("/payment/cancel");
        }
      } catch (err) {
        console.error("Error verificando transacción:", err);
        navigate("/payment/cancel");
      }
    };

    if (session) verificar();
  }, [searchParams, navigate, usuario, carrito, vaciarCarrito]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-6">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center transform transition-all duration-300 hover:scale-[1.01]">
        <Loader2 className="w-20 h-20 text-blue-600 animate-spin mx-auto mb-6" />
        <h1 className="text-3xl font-extrabold text-blue-700 mb-4">
          Procesando tu pago...
        </h1>
        <p className="text-gray-600">
          Estamos verificando tu transacción con CardNet.<br />
          Por favor espera unos segundos.
        </p>
      </div>
    </div>
  );
}
