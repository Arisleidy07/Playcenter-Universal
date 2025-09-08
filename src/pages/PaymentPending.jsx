import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useCarrito } from "../context/CarritoContext";
import "../styles/PaymentLoader.css"; // 👈 tu CSS del loader

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
            userEmail: usuarioInfo?.email || usuario?.email || null,
            userName: usuarioInfo?.displayName || null,
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
            raw: data,
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
  }, [searchParams, navigate, usuario, usuarioInfo, carrito, vaciarCarrito]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-6">
      <div className="loader mb-6">
        <div className="box box0"><div></div></div>
        <div className="box box1"><div></div></div>
        <div className="box box2"><div></div></div>
        <div className="box box3"><div></div></div>
        <div className="box box4"><div></div></div>
        <div className="box box5"><div></div></div>
        <div className="box box6"><div></div></div>
        <div className="box box7"><div></div></div>
        <div className="ground"><div></div></div>
      </div>
      <h1 className="text-2xl font-extrabold text-blue-700 mb-2">
        Procesando tu pago...
      </h1>
      <p className="text-gray-600 text-center max-w-md">
        Estamos verificando tu transacción con <b>CardNet</b>.<br />
        Por favor espera unos segundos.
      </p>
    </div>
  );
}
