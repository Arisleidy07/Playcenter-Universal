import { useState } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";
import "../styles/BotonCardnet.css";

// URL de Cardnet LAB (cambiar a producción cuando esté listo)
const AUTHORIZE_URL = "https://lab.cardnet.com.do/authorize";

export default function BotonCardnet({ className, total, label, items }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  
  const displayAmount = typeof total === 'number' ? total / 100 : null; // total llega en centavos
  const formatted = Number.isFinite(displayAmount)
    ? new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(displayAmount)
    : null;
  const buttonLabel = label || (formatted ? `Comprar ahora • ${formatted}` : 'Comprar ahora');

  const iniciarPago = async () => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      setError(null);
      
      // Validar monto
      if (!total || total <= 0) {
        throw new Error('Monto inválido');
      }
      
      // Generar ORDER ID único
      const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('📤 Creando sesión de Cardnet...', {
        amount: displayAmount,
        orderId,
        items: items?.length || 0
      });
      
      // Llamar a Firebase Function para crear sesión con timeout
      const createSession = httpsCallable(functions, 'createCardnetSession');
      
      // Timeout de 20 segundos para la función
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Tiempo de espera agotado. Intenta de nuevo.')), 20000)
      );
      
      const result = await Promise.race([
        createSession({
          amount: displayAmount,
          orderId,
          items: items || []
        }),
        timeoutPromise
      ]);
      
      if (!result.data.success || !result.data.session) {
        throw new Error('No se pudo crear la sesión de pago');
      }
      
      console.log('✅ Sesión creada:', result.data.session);
      
      // Guardar sessionKey en sessionStorage para verificar después
      sessionStorage.setItem('cardnetSessionKey', result.data.sessionKey);
      sessionStorage.setItem('cardnetOrderId', result.data.orderId);
      sessionStorage.setItem('cardnetTransactionId', result.data.transactionId);
      
      // Crear form y enviar a Cardnet con solo el SESSION
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = AUTHORIZE_URL;
      
      // Solo enviar SESSION según especificaciones de Cardnet
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'SESSION';
      input.value = result.data.session;
      form.appendChild(input);
      
      // Enviar form
      document.body.appendChild(form);
      form.submit();
      
    } catch (err) {
      console.error('❌ Error al iniciar pago:', err);
      
      let errorMessage = 'Error al procesar el pago';
      
      if (err.code === 'deadline-exceeded') {
        errorMessage = 'La pasarela de pago tardó mucho en responder. Por favor intenta de nuevo.';
      } else if (err.code === 'failed-precondition') {
        errorMessage = 'Hay un problema con la configuración de pagos. Contacta a soporte.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setIsProcessing(false);
      
      alert(`⚠️ Error:\n\n${errorMessage}\n\nPor favor, intenta de nuevo en unos segundos.`);
    }
  };

  return (
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
  );
}
