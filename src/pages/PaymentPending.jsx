import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useCarrito } from "../context/CarritoContext";
import "../styles/PaymentLoader.css";

const API_BASE = import.meta.env.DEV
  ? "" // proxy en localhost
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

        if (!sk) {
          navigate("/payment/cancel?session=" + session);
          return;
        }

        const res = await fetch(`${API_BASE}/cardnet/verify/${session}/${sk}`);
        const data = await res.json();

        const orderData = {
          userId: usuario?.uid || null,
          userEmail: usuarioInfo?.email || usuario?.email || null,
          userName: usuarioInfo?.displayName || null,
          productos: carrito.map((p) => ({
            id: p.id,
            nombre: p.nombre,
            precio: Number(p.precio) || 0,
            cantidad: p.cantidad,
          })),
          total: carrito.reduce(
            (acc, item) => acc + (Number(item.precio) || 0) * item.cantidad,
            0
          ),
          estado: data?.ResponseCode === "00" ? "completado" : "cancelado",
          fecha: serverTimestamp(),
          raw: { ...data, SESSION: session },
        };

        try {
          await addDoc(collection(db, "orders"), orderData);
        } catch (err) {
          console.error("❌ Error guardando orden:", err);
        }

        if (data?.ResponseCode === "00") {
          vaciarCarrito();
          navigate(`/payment/success?session=${session}`);
        } else {
          navigate(`/payment/cancel?session=${session}`);
        }
      } catch (err) {
        console.error("Error verificando transacción:", err);
        navigate(`/payment/cancel?session=${session}`);
      }
    };

    if (session) {
      const timer = setTimeout(verificar, 5000); // máximo 5s
      return () => clearTimeout(timer);
    }
  }, [searchParams, navigate, usuario, usuarioInfo, carrito, vaciarCarrito]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-6 z-50">
      {/* Loader */}
      <div className="loader mb-6">
        <div className="loader__bar"></div>
        <div className="loader__bar"></div>
        <div className="loader__bar"></div>
        <div className="loader__bar"></div>
        <div className="loader__bar"></div>
        <div className="loader__ball"></div>
      </div>

      <h1 className="text-2xl md:text-3xl font-extrabold text-blue-700 mb-2 animate-pulse text-center">
        Procesando tu pago...
      </h1>
      <p className="text-gray-600 text-center max-w-md text-sm md:text-base">
        Estamos verificando tu transacción con <b>CardNet</b>. <br />
        Esto puede tardar unos segundos.
      </p>
    </div>
  );
}
