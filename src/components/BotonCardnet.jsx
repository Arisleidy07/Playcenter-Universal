import { useState, useEffect } from "react";
import "../styles/BotonCardnet.css";

// Detecta automáticamente si estás en localhost o en producción
const API_BASE =
  import.meta.env.DEV
    ? "" // en localhost usamos el proxy de Vite
    : "https://playcenter-universal.onrender.com"; // en producción Render

// ⚠️ USANDO LAB PARA PRUEBAS EN PRODUCCIÓN
// Cambiar a "https://ecommerce.cardnet.com.do/authorize" cuando esté listo para producción real
const AUTHORIZE_URL = "https://lab.cardnet.com.do/authorize";

// Fetch directo con timeout de 6 segundos
const fetchWithTimeout = async (url, options, timeoutMs = 6000) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeout);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return response;
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
};

export default function BotonCardnet({ className, total, label }) {
  const [session, setSession] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionPreparada, setSessionPreparada] = useState(null);
  const displayAmount = typeof total === 'number' ? total / 100 : null; // total llega en centavos
  const formatted = Number.isFinite(displayAmount)
    ? new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(displayAmount)
    : null;
  const buttonLabel = label || (formatted ? `Comprar ahora • ${formatted}` : 'Comprar ahora');

  // Pre-crear SESSION al montar componente para redirección instantánea
  useEffect(() => {
    const prepararSession = async () => {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/cardnet/create-session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ total })
        });
        const data = await res.json();
        if (data.SESSION) {
          setSessionPreparada(data.SESSION);
        }
      } catch (error) {
        // Si falla, el botón funcionará con fetch normal
        console.log('Pre-carga de session falló, se creará al hacer clic');
      }
    };

    if (total && !import.meta.env.DEV) {
      prepararSession();
    }
  }, [total]);

  const iniciarPago = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    const button = document.querySelector('.pay-btn');
    
    try {
      if (button) {
        button.disabled = true;
        button.classList.add('loading');
      }

      let sessionId;

      // Si ya tenemos SESSION pre-cargada, usarla INSTANTÁNEAMENTE
      if (sessionPreparada) {
        sessionId = sessionPreparada;
      } else {
        // Si no, crear nueva SESSION ahora
        const res = await fetchWithTimeout(`${API_BASE}/cardnet/create-session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ total })
        });
        const data = await res.json();
        if (!data.SESSION) {
          throw new Error("No se recibió SESSION del servidor");
        }
        sessionId = data.SESSION;
      }

      setSession(sessionId);
      
      // Submit INMEDIATO
      requestAnimationFrame(() => {
        const form = document.getElementById("cardnetForm");
        if (form) {
          form.submit();
        }
      });

    } catch (error) {
      let errorMsg = "No se pudo procesar el pago";
      
      if (error.name === 'AbortError') {
        errorMsg = "Tiempo de espera agotado. Intenta de nuevo.";
      } else if (error.message.includes('Failed to fetch')) {
        errorMsg = "Sin conexión. Verifica tu internet.";
      } else if (error.message.includes('HTTP')) {
        errorMsg = "Error del servidor. Intenta de nuevo.";
      }
      
      alert(`❌ ${errorMsg}`);
      
      if (button) {
        button.disabled = false;
        button.classList.remove('loading');
        // Restaurar texto original
        button.querySelector('.btn-text').textContent = buttonLabel;
      }
      setIsProcessing(false);
    }
  };

  return (
    <>
      <button 
        onClick={iniciarPago} 
        className={`pay-btn ${className || ""}`}
        disabled={isProcessing}
      >
        <span className="btn-text">{buttonLabel}</span>
        <div className="icon-container">
          <svg viewBox="0 0 24 24" className="icon card-icon">
            <path d="M20,8H4V6H20M20,18H4V12H20M20,4H4C2.89,4 2,4.89 2,6V18C2,19.11 2.89,20 4,20H20C21.11,20 22,19.11 22,18V6C22,4.89 21.11,4 20,4Z" fill="currentColor" />
          </svg>
          <svg viewBox="0 0 24 24" className="icon payment-icon">
            <path d="M2,17H22V21H2V17M6.25,7H9V6H6V3H18V6H15V7H17.75L19,17H5L6.25,7M9,10H15V8H9V10M9,13H15V11H9V13Z" fill="currentColor" />
          </svg>
          <svg viewBox="0 0 24 24" className="icon dollar-icon">
            <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" fill="currentColor" />
          </svg>
          <svg viewBox="0 0 24 24" className="icon wallet-icon default-icon">
            <path d="M21,18V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5A2,2 0 0,1 5,3H19A2,2 0 0,1 21,5V6H12C10.89,6 10,6.9 10,8V16A2,2 0 0,0 12,18M12,16H22V8H12M16,13.5A1.5,1.5 0 0,1 14.5,12A1.5,1.5 0 0,1 16,10.5A1.5,1.5 0 0,1 17.5,12A1.5,1.5 0 0,1 16,13.5Z" fill="currentColor" />
          </svg>
          <svg viewBox="0 0 24 24" className="icon check-icon">
            <path d="M9,16.17L4.83,12L3.41,13.41L9,19L21,7L19.59,5.59L9,16.17Z" fill="currentColor" />
          </svg>
        </div>
      </button>

      {session && (
        <form id="cardnetForm" action={AUTHORIZE_URL} method="post">
          <input type="hidden" name="SESSION" value={session} />
        </form>
      )}
    </>
  );
}
