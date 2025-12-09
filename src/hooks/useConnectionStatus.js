import { useState, useEffect } from "react";

export function useConnectionStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showError, setShowError] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowError(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowError(true);
    };

    // Escuchar eventos de conexión
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Verificación periódica de conexión
    const checkConnection = async () => {
      try {
        // Intentar hacer una petición simple
        const response = await fetch("https://www.google.com/favicon.ico", {
          mode: "no-cors",
          cache: "no-cache",
          signal: AbortSignal.timeout(3000), // Timeout de 3 segundos
        });

        // Si llegamos aquí, hay conexión
        if (!isOnline) {
          setIsOnline(true);
          setShowError(false);
        }
      } catch (error) {
        // Si hay error, puede ser por falta de conexión
        if (isOnline) {
          setIsOnline(false);
          setShowError(true);
        }
      }
    };

    // Verificar conexión cada 30 segundos
    const interval = setInterval(checkConnection, 30000);

    // Verificar conexión inmediatamente al montar
    checkConnection();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, [isOnline]);

  return { isOnline, showError, setShowError };
}
