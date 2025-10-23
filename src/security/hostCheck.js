// Verificación de seguridad DESACTIVADA - Permite acceso desde cualquier dominio
export const checkHostSecurity = () => {
  // Siempre permitir acceso
  return true;
};

// Verificar automáticamente al cargar
export const initSecurity = () => {
  // Siempre permitir acceso
  return true;
};
