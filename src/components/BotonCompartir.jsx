import React, { useState } from "react";
import { FaShareAlt, FaWhatsapp, FaLink, FaEnvelope } from "react-icons/fa";

export default function BotonCompartir({ producto }) {
  const [showFallback, setShowFallback] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareData = {
    title: producto.nombre,
    text: producto.descripcion || "",
    url: window.location.href,
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Si cancela, no hacer nada
      }
    } else {
      setShowFallback(true);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1300);
  };

  return (
    <>
<button
  className="flex items-center gap-1 bg-white hover:bg-yellow-500 text-gray-900 font-semibold rounded-full px-2.5 py-1.5 shadow border border-yellow-300 transition text-sm absolute top-2 right-2 z-10"
  onClick={handleShare}
  aria-label="Compartir"
  type="button"
>
  <FaShareAlt className="text-sm" />
</button>


      {showFallback && (
        <div
          className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center"
          onClick={() => setShowFallback(false)}
        >
          <div
            className="bg-white p-5 rounded-xl shadow-2xl w-[90vw] max-w-sm flex flex-col gap-4 relative border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-400 text-xl hover:text-red-400"
              onClick={() => setShowFallback(false)}
              aria-label="Cerrar"
            >
              ×
            </button>

            <h3 className="font-bold text-lg text-gray-900 mb-2 text-center">
              Compartir producto
            </h3>

            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `${producto.nombre} ${window.location.href}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2 rounded-lg font-semibold transition border border-green-100 justify-center"
            >
              <FaWhatsapp /> WhatsApp
            </a>

            <a
              href={`mailto:?subject=${encodeURIComponent(
                producto.nombre
              )}&body=${encodeURIComponent(window.location.href)}`}
              className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold transition border border-gray-200 justify-center"
            >
              <FaEnvelope /> Correo
            </a>

            <button
              className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold transition border border-gray-200 justify-center"
              onClick={handleCopy}
            >
              <FaLink /> {copied ? "¡Copiado!" : "Copiar link"}
            </button>

            <p className="text-xs text-gray-400 text-center mt-2">
              * Usa el botón nativo de tu navegador si quieres AirDrop, Telegram, Mensajes, etc.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
