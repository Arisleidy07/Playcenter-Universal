import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../firebase";

/**
 * Cambiar contraseña de usuario autenticado
 * @param {Object} user - Usuario autenticado
 * @param {string} currentPassword - Contraseña actual
 * @param {string} newPassword - Nueva contraseña
 */
export async function changePassword(user, currentPassword, newPassword) {
  try {
    // Reautenticar primero (Firebase requiere esto si la sesión es vieja)
    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword
    );
    await reauthenticateWithCredential(user, credential);

    // Cambiar contraseña
    await updatePassword(user, newPassword);
    
    return { success: true, message: "Contraseña actualizada correctamente" };
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    
    // Mensajes de error específicos
    let errorMessage = "Error al cambiar la contraseña";
    
    switch (error.code) {
      case "auth/wrong-password":
        errorMessage = "La contraseña actual es incorrecta";
        break;
      case "auth/weak-password":
        errorMessage = "La nueva contraseña es muy débil (mínimo 6 caracteres)";
        break;
      case "auth/requires-recent-login":
        errorMessage = "Por seguridad, vuelve a iniciar sesión antes de cambiar tu contraseña";
        break;
      case "auth/too-many-requests":
        errorMessage = "Demasiados intentos. Intenta más tarde";
        break;
      default:
        errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
}

/**
 * Enviar email de recuperación de contraseña
 * @param {string} email - Email del usuario
 */
export async function sendPasswordReset(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    return {
      success: true,
      message: "Te hemos enviado un correo con instrucciones para restablecer tu contraseña",
    };
  } catch (error) {
    console.error("Error al enviar email de recuperación:", error);
    
    let errorMessage = "Error al enviar el correo";
    
    switch (error.code) {
      case "auth/user-not-found":
        errorMessage = "No existe una cuenta con este correo electrónico";
        break;
      case "auth/invalid-email":
        errorMessage = "El correo electrónico no es válido";
        break;
      case "auth/too-many-requests":
        errorMessage = "Demasiados intentos. Intenta más tarde";
        break;
      default:
        errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
}

/**
 * Validar contraseña (mínimo 6 caracteres, recomendado 8+)
 * @param {string} password - Contraseña a validar
 */
export function validatePassword(password) {
  const errors = [];
  
  if (!password || password.length < 6) {
    errors.push("La contraseña debe tener al menos 6 caracteres");
  }
  
  if (password.length < 8) {
    errors.push("Recomendamos usar al menos 8 caracteres para mayor seguridad");
  }
  
  // Recomendaciones adicionales (opcional)
  if (!/[A-Z]/.test(password)) {
    errors.push("Recomendamos incluir al menos una letra mayúscula");
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push("Recomendamos incluir al menos un número");
  }
  
  return {
    isValid: errors.length === 0 || password.length >= 6,
    errors,
    strength: password.length >= 12 ? "fuerte" : password.length >= 8 ? "media" : "débil",
  };
}
