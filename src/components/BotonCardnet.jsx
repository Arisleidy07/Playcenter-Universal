import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";
import "../styles/BotonCardnet.css";

// ⚠️ USANDO LAB PARA PRUEBAS EN PRODUCCIÓN
// Cambiar a "https://ecommerce.cardnet.com.do/authorize" cuando esté listo para producción real
const AUTHORIZE_URL = "https://lab.cardnet.com.do/authorize";

// Merchant ID de Cardnet LAB
const MERCHANT_ID = "351100011";
const MERCHANT_KEY = "111111";

export default function BotonCardnet({ className, total, label }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const displayAmount = typeof total === 'number' ? total / 100 : null; // total llega en centavos
  const formatted = Number.isFinite(displayAmount)
    ? new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(displayAmount)
    : null;
  const buttonLabel = label || (formatted ? `Comprar ahora • ${formatted}` : 'Comprar ahora');

  const iniciarPago = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      // Obtener datos del carrito desde sessionStorage
      const payloadStr = sessionStorage.getItem("checkoutPayload");
      const payload = payloadStr ? JSON.parse(payloadStr) : null;
      
      // Verificar que el usuario esté autenticado
      const user = auth.currentUser;
      if (!user) {
        alert("Debes iniciar sesión para completar la compra");
        setIsProcessing(false);
        return;
      }

      // Generar ORDER ID único
      const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Crear orden en Firestore (esto dispara el email automáticamente)
      const orderData = {
        numeroOrden: orderId,
        userId: user.uid,
        userEmail: user.email,
        email: user.email, // Para el trigger de email
        customerEmail: user.email,
        customerName: user.displayName || user.email,
        productos: payload?.items || [],
        total: (total / 100), // Convertir centavos a pesos
        estado: "Pendiente",
        metodoPago: "CardNet",
        fecha: serverTimestamp(),
        createdAt: serverTimestamp(),
        emailSent: false
      };

      // Guardar en Firestore
      await addDoc(collection(db, "orders"), orderData);

      // Ahora enviar a Cardnet
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = AUTHORIZE_URL;
    
    // Parámetros CORRECTOS requeridos por Cardnet LAB
    const params = {
      'MerchantId': MERCHANT_ID,
      'MerchantName': 'Playcenter Universal',
      'MerchantType': '0027', // Código correcto para eCommerce en Cardnet
      'Amount': (total / 100).toFixed(2), // Convertir centavos a pesos
      'OrderNumber': orderId,
      'Currency': '214', // Código ISO 4217 para DOP
      'ITBIS': '0.00', // Impuesto (0 para pruebas)
      'ApprovedUrl': `${window.location.origin}/payment/success`,
      'DeclinedUrl': `${window.location.origin}/payment/cancel`,
      'CancelUrl': `${window.location.origin}/payment/cancel`,
      'PendingUrl': `${window.location.origin}/payment/pending`,
      'AcquirerRefData': '1',
      'CustomerData': 'email=cliente@pcu.com.do',
      'ForceKey': MERCHANT_KEY,
      'Language': 'ES' // Idioma español
    };
    
    // Agregar inputs al form
    Object.entries(params).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });
    
      // Agregar al DOM y enviar INMEDIATAMENTE
      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      console.error("Error al procesar pago:", error);
      alert("Hubo un error al procesar tu pago. Por favor intenta de nuevo.");
      setIsProcessing(false);
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
