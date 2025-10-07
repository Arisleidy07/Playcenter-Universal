import React, { useState, useRef } from "react";
import { motion } from "framer-motion";

export default function Vender() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const formRef = useRef(null);

  const goToRegister = () => {
    setStep(1);
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const sendCode = async () => {
    // TODO: Integrar envío real por email/SMS (Firebase/Cloud Function)
    // Por ahora, simulamos el envío y avanzamos de paso
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return alert("Ingresa un correo válido");
    setSent(true);
    setStep(2);
  };

  const verifyCode = () => {
    if (!code || code.length < 4) return alert("Ingresa el código enviado a tu correo");
    setStep(3);
  };

  const complete = () => {
    if (!phone || phone.length < 8) return alert("Ingresa un teléfono válido");
    alert("Registro de vendedor iniciado. Un asesor confirmará tus datos.");
  };

  return (
    <div
      className="max-w-5xl mx-auto px-4 pb-12"
      style={{ paddingTop: "calc(var(--topbar-height, 0px) + 3.5rem)" }}
    >
      {/* Presentación confiable - Playcenter Universal */}
      <section className="mb-10">
        <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-indigo-200 via-white to-sky-200 shadow-[0_18px_60px_rgba(2,6,23,0.08)]">
          <div className="rounded-[14px] bg-white/90 backdrop-blur-sm p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800">
              Vende con Playcenter Universal
            </h1>
            <p className="mt-2 text-slate-600">
              Únete a la plataforma oficial gestionada por Playcenter Universal, una tienda física de confianza en
              <span className="font-semibold"> Santiago de los Caballeros, República Dominicana</span>.
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-slate-100 bg-gradient-to-b from-white to-slate-50 p-4 shadow-sm">
                <h3 className="text-sm font-bold text-slate-700">Confianza y Presencia</h3>
                <p className="mt-1 text-sm text-slate-600">Tienda física real. Atención profesional y soporte local.</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-gradient-to-b from-white to-slate-50 p-4 shadow-sm">
                <h3 className="text-sm font-bold text-slate-700">Pagos y Facturación</h3>
                <p className="mt-1 text-sm text-slate-600">Opciones de pago flexibles y comprobantes formales.</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-gradient-to-b from-white to-slate-50 p-4 shadow-sm">
                <h3 className="text-sm font-bold text-slate-700">Logística</h3>
                <p className="mt-1 text-sm text-slate-600">Coordinación de entregas y envíos a nivel nacional.</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={goToRegister}
                className="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-300/40 transition"
              >
                Comenzar registro
              </button>
              <a
                href="/tiendas"
                className="px-6 py-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold"
              >
                Ver tiendas y aliados
              </a>
            </div>
          </div>
        </div>
      </section>
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-xl sm:text-2xl font-extrabold text-gray-800 mb-4"
      >
        Vende con Playcenter Universal
      </motion.h1>

      <div ref={formRef} className="bg-white border rounded-2xl shadow-md p-5 sm:p-7">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">1) Verifica tu correo</h2>
            <p className="text-sm text-gray-600">Ingresa tu correo y te enviaremos un código de verificación.</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@empresa.com"
              className="w-full border rounded-md px-4 py-2 focus:ring-2 focus:ring-sky-400 outline-none"
            />
            <button
              onClick={sendCode}
              className="px-5 py-2 rounded-md bg-sky-500 hover:bg-sky-600 text-white font-semibold"
            >
              Enviar código
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">2) Ingresa el código</h2>
            <p className="text-sm text-gray-600">Revisa tu bandeja. Ingresa el código recibido.</p>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Código de 6 dígitos"
              className="w-full border rounded-md px-4 py-2 focus:ring-2 focus:ring-sky-400 outline-none"
            />
            <div className="flex gap-3">
              <button
                onClick={verifyCode}
                className="px-5 py-2 rounded-md bg-sky-500 hover:bg-sky-600 text-white font-semibold"
              >
                Verificar
              </button>
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-md border hover:bg-gray-50"
              >
                Cambiar correo
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">3) Tu número de teléfono</h2>
            <p className="text-sm text-gray-600">Para validar tu empresa y contacto.</p>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="809-000-0000"
              className="w-full border rounded-md px-4 py-2 focus:ring-2 focus:ring-sky-400 outline-none"
            />
            <button
              onClick={complete}
              className="px-5 py-2 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
            >
              Finalizar registro
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
