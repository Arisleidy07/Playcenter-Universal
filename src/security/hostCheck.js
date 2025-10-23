// Configuración de seguridad - Solo localhost y PC1
const ALLOWED_HOSTS = [
  'localhost',
  '127.0.0.1',
  '::1',
  'PC1', // Tu PC específico
  // Agrega aquí cualquier otro hostname que necesites
];

const ALLOWED_PORTS = [
  '5173', // Vite dev server
  '5174', // Vite alternativo
  '3000', // React dev server
  '8080', // Servidor local alternativo
];

export const checkHostSecurity = () => {
  const currentHost = window.location.hostname;
  const currentPort = window.location.port;
  
  // Verificar si el host está permitido
  const isHostAllowed = ALLOWED_HOSTS.includes(currentHost);
  
  // Verificar si el puerto está permitido (solo para localhost)
  const isPortAllowed = ALLOWED_PORTS.includes(currentPort) || currentPort === '';
  
  // Si no está en localhost o PC1, bloquear acceso
  if (!isHostAllowed) {
    console.error('🚫 ACCESO DENEGADO: Host no autorizado');
    document.body.innerHTML = `
      <div style="
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        background: #000;
        color: #fff;
        font-family: Arial, sans-serif;
        text-align: center;
      ">
        <div>
          <h1 style="color: #ff4444; font-size: 3rem; margin-bottom: 1rem;">🚫 ACCESO DENEGADO</h1>
          <p style="font-size: 1.2rem; margin-bottom: 2rem;">Esta aplicación solo funciona en localhost y PC autorizado.</p>
          <p style="color: #888; font-size: 0.9rem;">Host actual: ${currentHost}</p>
          <p style="color: #888; font-size: 0.9rem;">Contacta al administrador para acceso.</p>
        </div>
      </div>
    `;
    throw new Error('Host no autorizado');
  }
  
  return true;
};

// Verificar automáticamente al cargar
export const initSecurity = () => {
  try {
    checkHostSecurity();
    console.log('✅ Verificación de seguridad pasada');
    return true;
  } catch (error) {
    console.error('❌ Verificación de seguridad falló:', error);
    return false;
  }
};
