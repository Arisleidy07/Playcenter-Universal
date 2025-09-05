import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const API_BASE = import.meta.env.DEV 
  ? ""   // usa el proxy de Vite en localhost
  : "https://playcenter-universal.onrender.com"; // en producción usa Render

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const session = searchParams.get("session");

    if (session) {
      fetch(`${API_BASE}/cardnet/get-sk/${session}`)
        .then(res => res.json())
        .then(({ sk }) => {
          if (sk) {
            fetch(`${API_BASE}/cardnet/verify/${session}/${sk}`)
              .then(res => res.json())
              .then(data => setStatus(data))
              .catch(err => console.error("Error verificando transacción:", err));
          }
        })
        .catch(err => console.error("Error obteniendo SK:", err));
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 px-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-extrabold text-green-600 mb-4">
          Pago realizado con éxito
        </h1>
        {status ? (
          <pre className="text-left bg-gray-50 rounded-xl p-4 text-sm max-h-64 overflow-y-auto">
            {JSON.stringify(status, null, 2)}
          </pre>
        ) : (
          <p className="text-gray-500">Verificando transacción...</p>
        )}
        <div className="mt-6 flex flex-col sm:flex-row sm:justify-center gap-3">
          <Link to="/" className="px-6 py-3 rounded-xl bg-green-600 text-white font-bold">
            Seguir comprando
          </Link>
          <Link to="/carrito" className="px-6 py-3 rounded-xl bg-gray-200 text-gray-700 font-bold">
            Ver mi carrito
          </Link>
        </div>
      </div>
    </div>
  );
}
