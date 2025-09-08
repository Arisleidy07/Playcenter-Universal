import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useCarrito } from "../context/CarritoContext";
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

  useEffect(() => {
    const session = searchParams.get("session");
    const payload = readCheckoutPayload(); // { mode, items, total }

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

        // Determinar fuente de productos/total:
        const productos = payload?.items?.length
          ? payload.items
          : carrito.map((p) => ({
              id: p.id,
              nombre: p.nombre,
              precio: Number(p.precio) || 0,
              cantidad: p.cantidad,
            }));

        const total =
          payload?.total ??
          carrito.reduce((acc, item) => acc + (Number(item.precio) || 0) * item.cantidad, 0);

        const orderData = {
          userId: usuario?.uid || null,
          userEmail: usuarioInfo?.email || usuario?.email || null,
          userName: usuarioInfo?.displayName || null,
          productos,
          total,
          estado: data?.ResponseCode === "00" ? "completado" : "cancelado",
          fecha: serverTimestamp(),
          checkoutMode: payload?.mode || (payload ? "unknown" : "cart"),
          raw: { ...data, SESSION: session },
        };

        try {
          await addDoc(collection(db, "orders"), orderData);
        } catch (err) {
          console.error("❌ Error guardando orden:", err);
        }

        // Limpieza de estado de checkout
        try { sessionStorage.removeItem("checkoutPayload"); } catch {}

        if (data?.ResponseCode === "00") {
          // vaciamos carrito sólo si el pago venía del carrito
          if ((payload?.mode || "cart") === "cart") vaciarCarrito();
          navigate(`/payment/success?session=${session}`);
        } else {
          navigate(`/payment/cancel?session=${session}`);
        }
      } catch (err) {
        console.error("Error verificando transacción:", err);
        navigate(`/payment/cancel?session=${session || ""}`);
      }
    };

    if (session) {
      // máximo 5s para mostrar loader antes de verificar
      const t = setTimeout(verificar, 1500); // pequeño delay visual → ver animación
      const hard = setTimeout(() => verificar(), 5000); // garantía 5s máx
      return () => { clearTimeout(t); clearTimeout(hard); };
    }
  }, [searchParams, navigate, usuario, usuarioInfo, carrito, vaciarCarrito]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-6 z-50 will-change-transform">
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
        Verificando con <b>CardNet</b>. Esto puede tardar unos segundos.
      </p>
    </div>
  );
}
