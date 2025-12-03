import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { db } from "../../../firebase";
import { doc, setDoc } from "firebase/firestore";

export default function PaymentsView() {
  const { usuario, usuarioInfo, actualizarUsuarioInfo } = useAuth();
  const [saving, setSaving] = useState(false);
  const [preferStore, setPreferStore] = useState(
    Boolean(usuarioInfo?.preferenciaPagoEnTienda)
  );
  const [savedNotice, setSavedNotice] = useState("");

  useEffect(() => {
    setPreferStore(Boolean(usuarioInfo?.preferenciaPagoEnTienda));
  }, [usuarioInfo?.preferenciaPagoEnTienda]);

  const persistPreference = async (value) => {
    if (!usuario) return;
    try {
      setSaving(true);
      await actualizarUsuarioInfo({ preferenciaPagoEnTienda: value });
      const payload = { preferenciaPagoEnTienda: value, updatedAt: new Date() };
      await setDoc(doc(db, "users", usuario.uid), payload, { merge: true });
      await setDoc(doc(db, "usuarios", usuario.uid), payload, { merge: true });
      setSavedNotice("Preferencia guardada");
      setTimeout(() => setSavedNotice(""), 2000);
    } catch (e) {
      // console.error("save preferenciaPagoEnTienda:", e);
    } finally {
      setSaving(false);
    }
  };

  const onToggleStore = async () => {
    const newVal = !preferStore;
    setPreferStore(newVal);
    await persistPreference(newVal);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Billetera</h2>

      {/* Preferencia de pago en tienda */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-900 font-semibold">Pagar en tienda</p>
            <p className="text-sm text-gray-500">
              Usa el método de pago en tienda (paga cuando recojas).
            </p>
          </div>
          <button
            onClick={onToggleStore}
            disabled={saving}
            role="switch"
            aria-checked={preferStore}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              preferStore ? "bg-blue-600" : "bg-gray-300"
            } disabled:opacity-60`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                preferStore ? "translate-x-5" : "translate-x-1"
              }`}
            />
          </button>
        </div>
        {savedNotice && (
          <p className="text-xs text-green-600 mt-2">{savedNotice}</p>
        )}
      </div>

      {/* Métodos guardados (placeholder) */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-gray-900">Métodos guardados</p>
          <button className="px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700">
            Agregar
          </button>
        </div>
        <p className="text-sm text-gray-500">
          Próximamente podrás vincular tarjetas y cuentas.
        </p>
      </div>
    </div>
  );
}
