import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const API_BASE = import.meta.env.DEV
  ? "" // proxy en localhost
  : "https://playcenter-universal.onrender.com"; // producción

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const session = searchParams.get("session");

    const fetchData = async () => {
      try {
        const q = query(
          collection(db, "orders"),
          where("raw.SESSION", "==", session),
          orderBy("fecha", "desc"),
          limit(1)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          setOrder({ id: snap.docs[0].id, ...snap.docs[0].data() });
        }

        const skRes = await fetch(`${API_BASE}/cardnet/get-sk/${session}`);
        const { sk } = await skRes.json();

        if (sk) {
          const res = await fetch(`${API_BASE}/cardnet/verify/${session}/${sk}`);
          const data = await res.json();
          setStatus(data);
        }
      } catch (err) {
        console.error("Error cargando datos:", err);
      }
    };

    if (session) fetchData();
  }, [searchParams]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-6 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-2xl w-full text-center">
        <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-extrabold text-green-600 mb-4">
          Pago realizado con éxito
        </h1>
        <p className="text-gray-600 mb-6">
          Tu transacción fue procesada correctamente.<br />
          Gracias por tu compra en{" "}
          <span className="font-semibold">PlayCenter Universal</span>.
        </p>

        {order ? (
          <div className="bg-gray-50 rounded-xl shadow-inner p-6 mb-6 text-left">
            <h3 className="font-bold text-lg text-gray-800 mb-4">Detalles de la Orden</h3>
            <p><strong>ID:</strong> {order.id}</p>
            <p><strong>Email:</strong> {order.userEmail}</p>
            <p><strong>Estado:</strong> {order.estado}</p>
            <p><strong>Total:</strong> DOP ${order.total}</p>
            <p><strong>Fecha:</strong> {order.fecha?.toDate?.().toLocaleString()}</p>
          </div>
        ) : (
          <p className="text-gray-500">Cargando información de la orden...</p>
        )}

        {status && (
          <div className="bg-white rounded-xl border mt-4 p-4 text-sm text-left max-h-64 overflow-y-auto">
            <p className="font-bold text-gray-700 mb-2">Respuesta de CardNet:</p>
            <pre className="whitespace-pre-wrap text-gray-600 text-xs">
              {JSON.stringify(status, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row sm:justify-center gap-3">
          <Link
            to="/"
            className="px-6 py-3 rounded-xl bg-green-600 text-white font-bold shadow hover:bg-green-700 transition"
          >
            Seguir comprando
          </Link>
          <Link
            to="/carrito"
            className="px-6 py-3 rounded-xl bg-gray-200 text-gray-700 font-bold shadow hover:bg-gray-300 transition"
          >
            Ver mi carrito
          </Link>
        </div>
      </div>
    </div>
  );
}
