import { Link, useSearchParams } from "react-router-dom";
import { XCircle } from "lucide-react";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useCarrito } from "../context/CarritoContext";
import { addDoc, collection, serverTimestamp, query, where, limit, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";

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
  const { carrito, vaciarCarrito } = useCarrito();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const guardarCancelada = async () => {
      if (saved) return;

      const session = searchParams.get("session");
      const payload = readCheckoutPayload();
      const productos = payload?.items?.length
        ? payload.items
        : carrito.map((p) => ({
            id: p.id, nombre: p.nombre, precio: Number(p.precio) || 0, cantidad: p.cantidad,
          }));
      const total = payload?.total ?? carrito.reduce((acc, p) => acc + (Number(p.precio) || 0) * p.cantidad, 0);

      try {
        // Evitar duplicar si ya existe orden para esta session
        if (session) {
          const q = query(collection(db, "orders"), where("raw.SESSION", "==", session), limit(1));
          const snap = await getDocs(q);
          if (!snap.empty) {
            // ya guardado por PaymentPending
            try { sessionStorage.removeItem("checkoutPayload"); } catch {}
            setSaved(true);
            return;
          }
        }

        if (usuarioInfo && (productos.length > 0 || total >= 0)) {
          await addDoc(collection(db, "orders"), {
            userId: usuarioInfo.uid,
            userEmail: usuarioInfo.email,
            userName: usuarioInfo.displayName,
            productos,
            total,
            estado: "cancelado",
            fecha: serverTimestamp(),
            checkoutMode: payload?.mode || (payload ? "unknown" : "cart"),
            raw: { SESSION: session || null },
          });

          // si la cancelación vino del carrito → lo dejamos como está
          // (no vaciamos a menos que tú lo prefieras)
          try { sessionStorage.removeItem("checkoutPayload"); } catch {}
          setSaved(true);
        }
      } catch (err) {
        console.error("Error guardando orden cancelada:", err);
      }
    };

    const timer = setTimeout(guardarCancelada, 800); // rápido, pero deja ver la UI
    return () => clearTimeout(timer);
  }, [usuarioInfo, carrito, saved, searchParams]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-red-50 px-6 z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center">
        <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
        <h1 className="text-3xl font-extrabold text-red-600 mb-4">Pago cancelado</h1>
        <p className="text-gray-600 mb-6">
          El proceso de pago no se completó. Puedes intentar nuevamente.
        </p>
        <div className="flex flex-col sm:flex-row sm:justify-center gap-3">
          <Link to="/carrito" className="px-6 py-3 rounded-xl bg-red-600 text-white font-bold shadow hover:bg-red-700 transition">
            Volver al carrito
          </Link>
          <Link to="/" className="px-6 py-3 rounded-xl bg-gray-200 text-gray-700 font-bold shadow hover:bg-gray-300 transition">
            Ir a la tienda
          </Link>
        </div>
      </div>
    </div>
  );
}
