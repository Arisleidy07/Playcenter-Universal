import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function PaymentPending() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const session = searchParams.get("session");

    const verificar = async () => {
      try {
        const skRes = await fetch(`/cardnet/get-sk/${session}`);
        const { sk } = await skRes.json();

        if (sk) {
          const res = await fetch(`/cardnet/verify/${session}/${sk}`);
          const data = await res.json();

          if (data && data.ResponseCode === "00") {
            navigate(`/payment/success?session=${session}`);
          } else {
            navigate("/payment/cancel");
          }
        } else {
          navigate("/payment/cancel");
        }
      } catch {
        navigate("/payment/cancel");
      }
    };

    if (session) verificar();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 px-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
        <h1 className="text-2xl font-extrabold text-blue-700 mb-2">
          Procesando tu pago...
        </h1>
        <p className="text-gray-600">
          Estamos verificando tu transacción con CardNet, por favor espera unos segundos.
        </p>
      </div>
    </div>
  );
}
