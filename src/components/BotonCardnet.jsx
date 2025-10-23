import { useState, useEffect } from "react";
import "../styles/BotonCardnet.css";

// Detecta automáticamente si estás en localhost o en producción
const API_BASE =
  import.meta.env.DEV
    ? "" // en localhost usamos el proxy de Vite
    : "https://playcenter-universal.onrender.com"; // en producción Render

const AUTHORIZE_URL =
  import.meta.env.DEV
    ? "https://lab.cardnet.com.do/authorize"
    : "https://ecommerce.cardnet.com.do/authorize";

// Función para despertar el servidor (evitar cold start de Render)
const wakeUpServer = async () => {
  if (import.meta.env.DEV) return Promise.resolve();
  
  try {
    await fetch(`${API_BASE}/cardnet/health`, { 
      method: "GET",
      signal: AbortSignal.timeout(5000)
    });
  } catch (e) {
    // Silencioso
  }
};

// Fetch con timeout balanceado y retry inteligente
const fetchWithRetry = async (url, options, maxRetries = 2) => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      // Timeout progresivo: 20s, 25s, 30s
      const timeoutDuration = 20000 + (attempt * 5000);
      const timeout = setTimeout(() => controller.abort(), timeoutDuration);
      
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
      if (attempt === maxRetries) throw error;
      
      // Backoff: 1s, 2s
      const backoff = (attempt + 1) * 1000;
      await new Promise(resolve => setTimeout(resolve, backoff));
    }
  }
};

export default function BotonCardnet({ className, total, label }) {
  const [session, setSession] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const displayAmount = typeof total === 'number' ? total / 100 : null; // total llega en centavos
  const formatted = Number.isFinite(displayAmount)
    ? new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(displayAmount)
    : null;
  const buttonLabel = label || (formatted ? `Comprar ahora • ${formatted}` : 'Comprar ahora');

  // Despertar servidor al montar el componente
  useEffect(() => {
    // Despertar inmediatamente al cargar la página
    wakeUpServer();
    
    // Despertar cada 30 segundos mientras el componente está montado
    const interval = setInterval(wakeUpServer, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const iniciarPago = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    const button = document.querySelector('.pay-btn');
    
    try {
      if (button) {
        button.disabled = true;
        button.classList.add('loading');
      }

      // Despertar servidor y ESPERAR un momento para que se active
      if (!import.meta.env.DEV) {
        await wakeUpServer();
        // Pequeña pausa para que el servidor responda
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Fetch con retry inteligente
      const res = await fetchWithRetry(`${API_BASE}/cardnet/create-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ total })
      });

      const data = await res.json();

      if (!data.SESSION) {
        throw new Error("No se recibió SESSION del servidor");
      }

      setSession(data.SESSION);
      
      // Submit inmediato
      requestAnimationFrame(() => {
        const form = document.getElementById("cardnetForm");
        if (form) {
          form.submit();
        }
      });

    } catch (error) {
      let errorMsg = "No se pudo procesar el pago";
      
      if (error.name === 'AbortError') {
        errorMsg = "El servidor está tardando en responder. Por favor, intenta nuevamente en unos segundos.";
      } else if (error.message.includes('HTTP 504') || error.message.includes('Timeout')) {
        errorMsg = "El servidor no está disponible. Intenta de nuevo en un momento.";
      } else if (error.message.includes('HTTP')) {
        errorMsg = "Error del servidor. Intenta de nuevo.";
      } else if (error.message.includes('Failed to fetch')) {
        errorMsg = "Error de conexión. Verifica tu internet.";
      }
      
      alert(`❌ ${errorMsg}`);
      
      if (button) {
        button.disabled = false;
        button.classList.remove('loading');
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
