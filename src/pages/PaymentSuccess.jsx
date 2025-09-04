import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const session = searchParams.get("session");

    if (session) {
      fetch(`/cardnet/get-sk/${session}`)
        .then(res => res.json())
        .then(({ sk }) => {
          if (sk) {
            fetch(`/cardnet/verify/${session}/${sk}`)
              .then(res => res.json())
              .then(data => setStatus(data));
          }
        });
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
          <Link to="/" className="px-6 py-3 rounded-xl bg-green-600 text-white">Seguir comprando</Link>
          <Link to="/carrito" className="px-6 py-3 rounded-xl bg-gray-200 text-gray-700">Ver mi carrito</Link>
        </div>
      </div>
    </div>
  );
}
