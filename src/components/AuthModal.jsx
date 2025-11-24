import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useAuthModal } from "../context/AuthModalContext";
import { useTheme } from "../context/ThemeContext";
import { motion } from "framer-motion";
import {
  FaUser,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaUserPlus,
  FaLock,
  FaPhone,
  FaGoogle,
  FaChevronRight,
} from "react-icons/fa";
import { doc, setDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { db } from "../firebase";

export default function AuthModal() {
  const {
    modalAbierto,
    setModalAbierto,
    modo: modoGlobal,
    setModo,
  } = useAuthModal();
  const {
    login,
    signup,
    usuario,
    loginWithGoogle,
    resetPassword,
    checkSignInMethods,
  } = useAuth();
  const { isDark } = useTheme();

  const [modo, setModoLocal] = useState(modoGlobal);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [telefono, setTelefono] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberedEmail, setRememberedEmail] = useState("");
  const [rememberedUser, setRememberedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quickLoginMode, setQuickLoginMode] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [showGoogleAccountWarning, setShowGoogleAccountWarning] =
    useState(false);

  // Cargar último usuario y verificar si hay sesión activa
  useEffect(() => {
    const lastEmail = localStorage.getItem("lastLoginEmail");
    const lastUserData = localStorage.getItem("lastUserData");

    if (lastEmail) {
      setRememberedEmail(lastEmail);
    }

    if (lastUserData) {
      try {
        const userData = JSON.parse(lastUserData);
        setRememberedUser(userData);
        console.log("✅ Usuario guardado encontrado:", userData.email);
      } catch (e) {
        console.error("Error al parsear userData:", e);
      }
    }
  }, []);

  useEffect(() => {
    setModoLocal(modoGlobal);
    setError("");
    setEmail("");
    setPassword("");
    setName("");
    setTelefono("");
    setQuickLoginMode(false);
    setForgotPasswordMode(false);
    setResetEmailSent(false);
    setShowGoogleAccountWarning(false);
  }, [modalAbierto, modoGlobal]);

  // Función para recuperar contraseña
  async function handleForgotPassword() {
    if (!email || !email.trim()) {
      setError("Por favor ingresa tu correo electrónico primero");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await resetPassword(email.trim().toLowerCase());
      setResetEmailSent(true);
      setError("");
      console.log("✅ Email de recuperación enviado");
    } catch (e) {
      console.error("❌ Error al enviar email:", e);
      if (e.code === "auth/user-not-found") {
        setError("No existe una cuenta con este correo electrónico.");
      } else if (e.code === "auth/invalid-email") {
        setError("El correo electrónico no es válido.");
      } else if (e.code === "auth/too-many-requests") {
        setError("Demasiados intentos. Por favor intenta más tarde.");
      } else {
        setError("Error al enviar el email. Por favor intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  }

  // Función para "Continuar con email" - LOGIN AUTOMÁTICO CON UN CLICK
  async function handleQuickLogin() {
    setError("");
    setLoading(true);
    setQuickLoginMode(true);

    try {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("🚀 QUICK LOGIN - UN SOLO CLICK");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      // Si ya hay un usuario conectado en Firebase, simplemente cerrar el modal
      if (usuario) {
        console.log("✅ Usuario ya conectado:", usuario.email);
        setModalAbierto(false);
        return;
      }

      // Si hay email recordado, iniciar automáticamente
      if (rememberedEmail) {
        console.log("📧 Email recordado:", rememberedEmail);

        // Verificar qué métodos de login tiene esta cuenta
        const methods = await checkSignInMethods(rememberedEmail);
        console.log("🔍 Métodos disponibles:", methods);

        if (methods.includes("google.com")) {
          // Es cuenta de Google - Abrir popup automáticamente
          console.log("🚀 Cuenta de Google - Iniciando automáticamente...");
          setError("Iniciando sesión con Google...");

          try {
            const userCredential = await loginWithGoogle();
            console.log("✅ Login con Google exitoso!");

            // Guardar datos
            if (userCredential?.user?.email) {
              const emailFromGoogle = userCredential.user.email.toLowerCase();
              const userData = {
                email: emailFromGoogle,
                loginMethod: "google",
                timestamp: new Date().toISOString(),
              };
              localStorage.setItem("lastLoginEmail", emailFromGoogle);
              localStorage.setItem("lastUserData", JSON.stringify(userData));
            }

            setModalAbierto(false);
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            console.log("✅ QUICK LOGIN COMPLETADO");
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            return;
          } catch (googleError) {
            console.error("❌ Error en login con Google:", googleError);
            if (googleError.code === "auth/popup-closed-by-user") {
              setError("Popup cerrado. Intenta de nuevo.");
            } else {
              setError("Error al iniciar con Google. Intenta de nuevo.");
            }
          }
        } else if (methods.includes("password")) {
          // Es cuenta con contraseña - Pedir contraseña
          console.log("🔑 Cuenta con contraseña - Solicitando...");
          setEmail(rememberedEmail);
          setQuickLoginMode(false);
          setError("Por favor ingresa tu contraseña para continuar.");
          setTimeout(() => {
            document.querySelector('input[type="password"]')?.focus();
          }, 100);
        } else {
          setError("No se pudo verificar el método de inicio de sesión.");
        }
      } else {
        setError("No hay cuenta guardada.");
      }

      setQuickLoginMode(false);
    } catch (e) {
      console.error("❌ Error en quick login:", e);
      setError("Error al iniciar sesión. Intenta de nuevo.");
      setQuickLoginMode(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // IMPORTANTE: Solo limpiar espacios del EMAIL, NO de la contraseña
    // La contraseña puede tener espacios intencionalmente
    const emailLimpio = email.trim().toLowerCase();
    const passwordFinal = password; // NO hacer trim a la contraseña

    // Validaciones básicas
    if (!emailLimpio) {
      setError("Por favor ingresa tu correo electrónico");
      setLoading(false);
      return;
    }

    if (!passwordFinal) {
      setError("Por favor ingresa tu contraseña");
      setLoading(false);
      return;
    }

    if (passwordFinal.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setLoading(false);
      return;
    }

    try {
      if (modo === "login") {
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("🔐 INTENTO DE LOGIN INTELIGENTE");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("📧 Email ingresado:", email);
        console.log("📧 Email procesado:", emailLimpio);
        console.log(
          "🔑 Longitud de contraseña:",
          passwordFinal.length,
          "caracteres"
        );
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        // PASO 1: Intentar login con email/password
        try {
          await login(emailLimpio, passwordFinal);
          console.log("✅ Login exitoso con email/password");

          // Guardar datos completos del usuario para quick login
          const userData = {
            email: emailLimpio,
            loginMethod: "email",
            timestamp: new Date().toISOString(),
          };
          localStorage.setItem("lastLoginEmail", emailLimpio);
          localStorage.setItem("lastUserData", JSON.stringify(userData));
          console.log("💾 Usuario guardado para quick login");
        } catch (loginError) {
          // PASO 2: Si falla con invalid-credential, probablemente es cuenta de Google
          console.log("⚠️ Login con password falló");
          console.log("⚠️ Error code:", loginError.code);

          if (loginError.code === "auth/invalid-credential") {
            console.log(
              "🚀 Error de credenciales inválidas - Asumiendo cuenta de Google"
            );

            // Mostrar banner sugiriendo login con Google
            setShowGoogleAccountWarning(true);
            setError("");
            setLoading(false);

            // Hacer que el botón de Google pulse para llamar atención
            setTimeout(() => {
              const googleBtn = document.querySelector(".google-login-btn");
              if (googleBtn) {
                googleBtn.style.animation = "pulse 1.5s ease-in-out 3";
                googleBtn.style.border = "3px solid #4285f4";
              }
            }, 500);

            return; // No continuar con el error
          } else {
            // Otro tipo de error, lanzar para manejarlo en catch externo
            console.log("❌ Error diferente, lanzando:", loginError.code);
            throw loginError;
          }
        }
      } else {
        // Validar teléfono
        if (!telefono.trim()) {
          setError("El número de teléfono es requerido");
          setLoading(false);
          return;
        }
        // Registrarse con valores limpios (email) y password sin modificar
        const nuevoUsuario = await signup(emailLimpio, passwordFinal);

        // Guardar nombre y datos iniciales en Firestore (con email en minúsculas)
        await setDoc(doc(db, "users", nuevoUsuario.uid), {
          displayName: name || "Usuario",
          email: emailLimpio, // Usar email en minúsculas
          telefono: telefono || "",
          direccion: "",
          codigo: "",
          metodoEntrega: "",
          admin: false,
          createdAt: new Date(),
        });

        // También guardar en la colección "usuarios" para el panel admin
        await setDoc(doc(db, "usuarios", nuevoUsuario.uid), {
          displayName: name || "Usuario",
          email: emailLimpio, // Usar email en minúsculas
          telefono: telefono || "",
          direccion: "",
          codigo: "",
          metodoEntrega: "",
          admin: false,
          createdAt: new Date(),
          uid: nuevoUsuario.uid,
        });

        // Actualizar displayName en Firebase Auth
        if (name) {
          await updateProfile(nuevoUsuario, { displayName: name });
        }
        // Guardar email y datos del usuario en localStorage (en minúsculas)
        const userData = {
          email: emailLimpio,
          loginMethod: "email",
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem("lastLoginEmail", emailLimpio);
        localStorage.setItem("lastUserData", JSON.stringify(userData));
        console.log("💾 Usuario registrado y guardado para quick login");
      }
      setModalAbierto(false);
    } catch (e) {
      console.error("❌ Error en login/signup:", e);
      console.error("❌ Error code:", e.code);
      console.error("❌ Error message:", e.message);

      // Mensajes de error user-friendly
      if (
        e.code === "auth/invalid-credential" ||
        e.code === "auth/wrong-password"
      ) {
        // Si es error de credenciales, asumir que es cuenta de Google
        console.log("✅✅✅ BANNER DE GOOGLE ACTIVADO (catch externo)");
        setShowGoogleAccountWarning(true);
        setError(""); // Limpiar error
        setLoading(false);

        // Sugerir visualmente el botón de Google
        setTimeout(() => {
          const googleBtn = document.querySelector(".google-login-btn");
          if (googleBtn) {
            console.log("🎯 Animando botón de Google");
            googleBtn.style.animation = "pulse 1.5s ease-in-out 3";
            googleBtn.style.border = "3px solid #4285f4";
          }
        }, 500);
      } else if (e.code === "auth/user-not-found") {
        console.log("⚠️ Usuario no encontrado");
        setError(
          "No existe una cuenta con este correo. " +
            "Por favor crea una cuenta nueva o verifica el correo electrónico."
        );
      } else if (e.code === "auth/invalid-login-credentials") {
        setError(
          "Credenciales incorrectas. Si olvidaste tu contraseña, usa '¿Olvidaste tu contraseña?'"
        );
      } else if (e.code === "auth/email-already-in-use") {
        setError(
          "Este correo ya está registrado. Intenta iniciar sesión en lugar de crear una cuenta nueva."
        );
      } else if (e.code === "auth/weak-password") {
        setError("La contraseña debe tener al menos 6 caracteres.");
      } else if (e.code === "auth/invalid-email") {
        setError(
          "El formato del correo electrónico no es válido. Ejemplo: usuario@ejemplo.com"
        );
      } else if (e.code === "auth/too-many-requests") {
        setError(
          "Demasiados intentos fallidos. Espera unos minutos e intenta de nuevo, o usa 'Recuperar contraseña'."
        );
      } else if (e.code === "auth/network-request-failed") {
        setError(
          "Error de conexión a internet. Verifica tu conexión e intenta de nuevo."
        );
      } else {
        setError(
          `Error al iniciar sesión. Por favor intenta de nuevo. (${
            e.code || "Error desconocido"
          })`
        );
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setLoading(true);
    try {
      const userCredential = await loginWithGoogle();
      // Guardar email y datos si está disponible
      if (userCredential?.user?.email) {
        const emailLimpio = userCredential.user.email.toLowerCase();
        const userData = {
          email: emailLimpio,
          loginMethod: "google",
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem("lastLoginEmail", emailLimpio);
        localStorage.setItem("lastUserData", JSON.stringify(userData));
        console.log("💾 Usuario Google guardado para quick login");
      }
      setModalAbierto(false);
    } catch (e) {
      console.error("Error Google login:", e);

      if (e.code === "auth/popup-closed-by-user") {
        setError("Inicio de sesión cancelado.");
      } else if (e.code === "auth/popup-blocked") {
        setError(
          "Las ventanas emergentes están bloqueadas. Por favor permítelas en tu navegador."
        );
      } else if (e.code === "auth/network-request-failed") {
        setError("Error de conexión. Verifica tu internet e intenta de nuevo.");
      } else if (e.code === "auth/too-many-requests") {
        setError("Demasiados intentos. Por favor intenta más tarde.");
      } else {
        setError(
          "Error al iniciar sesión con Google. Por favor intenta de nuevo."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  if (!modalAbierto) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{
        background: isDark ? "#111827" : "#ffffff",
        zIndex: 9999,
        overflowY: "auto",
        padding: "15px",
      }}
    >
      <div
        className="w-100 d-flex flex-column justify-content-center"
        style={{
          maxWidth: "500px",
          margin: "auto",
          minHeight: "100%",
        }}
      >
        {/* Header Estilo eBay - Logo Izquierda, X Derecha */}
        <div
          className="d-flex align-items-center justify-content-between py-3 px-4 flex-shrink-0"
          style={{
            borderBottom: `2px solid ${
              isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)"
            }`,
          }}
        >
          {/* Logo PCU a la IZQUIERDA */}
          <motion.div
            className="d-flex align-items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <img
              src="/play.png"
              alt="Playcenter"
              className="auth-modal-logo"
              style={{
                width: "auto",
                height: "42px",
                maxWidth: "130px",
                objectFit: "contain",
                filter: isDark ? "brightness(1.1)" : "brightness(0.95)",
              }}
            />
          </motion.div>

          {/* Botón X a la DERECHA - Moderno y Centrado */}
          <motion.button
            onClick={() => setModalAbierto(false)}
            whileHover={{
              scale: 1.05,
              backgroundColor: isDark
                ? "rgba(239, 68, 68, 0.15)"
                : "rgba(239, 68, 68, 0.1)",
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="btn btn-close-modal p-0 d-flex align-items-center justify-content-center"
            style={{
              background: isDark
                ? "rgba(255, 255, 255, 0.08)"
                : "rgba(0, 0, 0, 0.04)",
              color: isDark ? "#ef4444" : "#dc2626",
              border: `1.5px solid ${
                isDark ? "rgba(239, 68, 68, 0.3)" : "rgba(239, 68, 68, 0.2)"
              }`,
              fontSize: "20px",
              fontWeight: "400",
              width: "40px",
              height: "40px",
              lineHeight: "1",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            aria-label="Cerrar"
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "100%",
              }}
            >
              ✕
            </span>
          </motion.button>
        </div>

        {/* Título Centrado */}
        <div className="text-center py-4 px-4" style={{ marginTop: "8px" }}>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="h3 fw-bold mb-3"
            style={{
              color: isDark ? "#ffffff" : "#111827",
              fontSize: "1.85rem",
              letterSpacing: "-0.6px",
              fontWeight: "700",
            }}
          >
            {modo === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-0"
            style={{
              color: isDark ? "#9ca3af" : "#6b7280",
              fontSize: "15px",
              lineHeight: "1.5",
            }}
          >
            {modo === "login"
              ? "Ingresa tus credenciales para continuar"
              : "Completa el formulario para registrarte"}
          </motion.p>
        </div>

        {/* Banner de advertencia: Cuenta vinculada con Google */}
        {showGoogleAccountWarning && modo === "login" && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="mx-4 mb-4"
            style={{
              background: isDark
                ? "linear-gradient(135deg, rgba(66, 133, 244, 0.15) 0%, rgba(66, 133, 244, 0.08) 100%)"
                : "linear-gradient(135deg, rgba(66, 133, 244, 0.12) 0%, rgba(66, 133, 244, 0.05) 100%)",
              border: `2px solid ${
                isDark ? "rgba(66, 133, 244, 0.4)" : "rgba(66, 133, 244, 0.3)"
              }`,
              borderRadius: "16px",
              padding: "20px",
              boxShadow: isDark
                ? "0 8px 32px rgba(66, 133, 244, 0.25)"
                : "0 8px 32px rgba(66, 133, 244, 0.15)",
            }}
          >
            <div className="d-flex align-items-start gap-3">
              {/* Ícono de Google grande */}
              <div
                style={{
                  minWidth: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                }}
              >
                <svg width="28" height="28" viewBox="0 0 48 48">
                  <path
                    fill="#FFC107"
                    d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                  />
                  <path
                    fill="#FF3D00"
                    d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                  />
                </svg>
              </div>

              {/* Contenido del mensaje */}
              <div className="flex-grow-1">
                <div
                  className="fw-bold mb-2"
                  style={{
                    fontSize: "16px",
                    color: isDark ? "#ffffff" : "#1f2937",
                    lineHeight: "1.4",
                  }}
                >
                  ⚠️ Esta cuenta está registrada en esta página como una de
                  Google
                </div>
                <div
                  className="mb-3"
                  style={{
                    fontSize: "14px",
                    color: isDark ? "rgba(255, 255, 255, 0.85)" : "#4b5563",
                    lineHeight: "1.6",
                  }}
                >
                  La cuenta <strong>{email}</strong> está registrada en esta
                  página como una cuenta de Google.{" "}
                  <strong>Así que continúa con Google</strong> usando el botón
                  más abajo.
                </div>

                {/* Botón para cerrar el aviso */}
                <button
                  type="button"
                  onClick={() => {
                    setShowGoogleAccountWarning(false);
                    setEmail("");
                    setPassword("");
                  }}
                  className="btn btn-sm px-3"
                  style={{
                    background: isDark
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.05)",
                    border: `1px solid ${
                      isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)"
                    }`,
                    color: isDark ? "#ffffff" : "#1f2937",
                    fontSize: "13px",
                    fontWeight: "500",
                    borderRadius: "8px",
                  }}
                >
                  Entendido
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Contenido del formulario */}
        <div
          className="px-4 pb-5 flex-grow-1 d-flex flex-column justify-content-start"
          style={{
            overflowY: "auto",
            maxWidth: "100%",
            paddingTop: "0.5rem",
          }}
        >
          {/* Botón: Continuar con cuenta recordada - PROFESIONAL */}
          {modo === "login" && rememberedEmail && !quickLoginMode && (
            <motion.button
              type="button"
              onClick={handleQuickLogin}
              disabled={loading}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="btn w-100 fw-semibold py-3 mb-4 d-flex align-items-center justify-content-between"
              style={{
                background: isDark
                  ? "rgba(59, 130, 246, 0.1)"
                  : "rgba(59, 130, 246, 0.08)",
                border: `2px solid ${
                  isDark
                    ? "rgba(59, 130, 246, 0.25)"
                    : "rgba(59, 130, 246, 0.2)"
                }`,
                color: isDark ? "#60a5fa" : "#1e40af",
                borderRadius: "12px",
              }}
            >
              <div className="d-flex align-items-center gap-3">
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: isDark
                      ? "rgba(59, 130, 246, 0.2)"
                      : "rgba(59, 130, 246, 0.15)",
                  }}
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        repeat: Infinity,
                        duration: 1,
                        ease: "linear",
                      }}
                      style={{
                        width: "18px",
                        height: "18px",
                        border: "2px solid rgba(59, 130, 246, 0.3)",
                        borderTopColor: isDark ? "#60a5fa" : "#1e40af",
                        borderRadius: "50%",
                      }}
                    />
                  ) : (
                    <FaUser size={18} />
                  )}
                </div>
                <div className="text-start flex-grow-1">
                  <div className="fw-bold mb-1" style={{ fontSize: "15px" }}>
                    {rememberedUser?.loginMethod === "google"
                      ? "Continuar con Google"
                      : "Continuar como"}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      opacity: 0.9,
                      wordBreak: "break-all",
                      lineHeight: "1.3",
                    }}
                  >
                    {rememberedEmail}
                  </div>
                </div>
              </div>
              <FaChevronRight size={16} />
            </motion.button>
          )}

          {/* Botón para usar otra cuenta */}
          {modo === "login" && rememberedEmail && !quickLoginMode && (
            <div className="text-center mb-3">
              <button
                type="button"
                onClick={() => {
                  setRememberedEmail("");
                  setRememberedUser(null);
                  localStorage.removeItem("lastLoginEmail");
                  localStorage.removeItem("lastUserData");
                }}
                className="btn btn-link text-decoration-none p-0"
                style={{
                  fontSize: "13px",
                  color: isDark ? "#9ca3af" : "#6b7280",
                  fontWeight: "500",
                }}
              >
                Usar otra cuenta
              </button>
            </div>
          )}

          {modo === "login" && rememberedEmail && !quickLoginMode && (
            <div className="d-flex align-items-center gap-3 mb-4">
              <div
                className="flex-grow-1"
                style={{
                  height: "1px",
                  background: isDark
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.1)",
                }}
              />
              <span
                style={{
                  color: isDark ? "#9ca3af" : "#6b7280",
                  fontSize: "13px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                o usa otra cuenta
              </span>
              <div
                className="flex-grow-1"
                style={{
                  height: "1px",
                  background: isDark
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.1)",
                }}
              />
            </div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="alert d-flex align-items-start gap-3 mb-4"
              style={{
                backgroundColor: isDark
                  ? "rgba(239, 68, 68, 0.1)"
                  : "rgba(254, 226, 226, 0.9)",
                borderLeft: `4px solid ${isDark ? "#ef4444" : "#dc2626"}`,
                borderRadius: "12px",
                padding: "14px 16px",
                color: isDark ? "#fecaca" : "#991b1b",
                boxShadow: isDark
                  ? "0 4px 12px rgba(239, 68, 68, 0.15)"
                  : "0 4px 12px rgba(239, 68, 68, 0.1)",
              }}
            >
              <div
                style={{
                  fontSize: "20px",
                  marginTop: "2px",
                  color: isDark ? "#ef4444" : "#dc2626",
                }}
              >
                ⚠️
              </div>
              <div className="flex-grow-1">
                <div className="fw-semibold mb-1" style={{ fontSize: "14px" }}>
                  Error al iniciar sesión
                </div>
                <div
                  style={{ fontSize: "13px", lineHeight: "1.5", opacity: 0.95 }}
                >
                  {error}
                </div>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            {modo === "signup" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-4"
              >
                <label
                  className="form-label fw-semibold small"
                  style={{ color: isDark ? "#ffffff" : "#000000" }}
                >
                  <FaUser className="me-2" />
                  Nombre de usuario
                </label>
                <input
                  type="text"
                  required
                  className="form-control modern-input"
                  style={{
                    backgroundColor: isDark ? "rgba(0, 0, 0, 0.5)" : "#ffffff",
                    borderColor: isDark ? "#000000" : "#000000",
                    color: isDark ? "#ffffff" : "#000000",
                    borderRadius: "12px",
                    borderWidth: "2px",
                  }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre completo"
                />
              </motion.div>
            )}

            {modo === "signup" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-4"
              >
                <label
                  className="form-label fw-semibold small"
                  style={{ color: isDark ? "#ffffff" : "#000000" }}
                >
                  <FaPhone className="me-2" />
                  Número de teléfono
                </label>
                <input
                  type="tel"
                  required
                  className="form-control modern-input"
                  style={{
                    backgroundColor: isDark ? "rgba(0, 0, 0, 0.5)" : "#ffffff",
                    borderColor: isDark ? "#000000" : "#000000",
                    color: isDark ? "#ffffff" : "#000000",
                    borderRadius: "12px",
                    borderWidth: "2px",
                  }}
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="(809) 123-4567"
                />
              </motion.div>
            )}

            <div className="mb-4">
              <label
                className="form-label fw-semibold small"
                style={{ color: isDark ? "#ffffff" : "#000000" }}
              >
                <FaEnvelope className="me-2" />
                Correo electrónico
              </label>
              <input
                type="email"
                required
                className="form-control modern-input"
                style={{
                  backgroundColor: isDark ? "rgba(0, 0, 0, 0.5)" : "#ffffff",
                  borderColor: isDark ? "#000000" : "#000000",
                  color: isDark ? "#ffffff" : "#000000",
                  borderRadius: "12px",
                  borderWidth: "2px",
                }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
              />
            </div>

            <div className="mb-4">
              <label
                className="form-label fw-semibold small"
                style={{ color: isDark ? "#ffffff" : "#000000" }}
              >
                <FaLock className="me-2" />
                Contraseña
              </label>
              <div className="position-relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="form-control pe-5 modern-input"
                  style={{
                    backgroundColor: isDark ? "rgba(0, 0, 0, 0.5)" : "#ffffff",
                    borderColor: isDark ? "#000000" : "#000000",
                    color: isDark ? "#ffffff" : "#000000",
                    borderRadius: "12px",
                    borderWidth: "2px",
                  }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="position-absolute top-50 end-0 translate-middle-y me-3 btn btn-sm p-0"
                  style={{
                    color: isDark ? "#ffffff" : "#000000",
                    backgroundColor: "transparent",
                    border: "none",
                  }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400 }}
              className="btn w-100 fw-bold py-2 mb-3 d-flex align-items-center justify-content-center gap-2 position-relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #000000 0%, #000000 100%)",
                border: "none",
                color: "#ffffff",
                borderRadius: "12px",
                boxShadow:
                  "0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)",
                transition: "all 0.3s ease",
              }}
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 1,
                      ease: "linear",
                    }}
                    style={{
                      width: "18px",
                      height: "18px",
                      border: "2px solid rgba(255, 255, 255, 0.3)",
                      borderTopColor: "#ffffff",
                      borderRadius: "50%",
                    }}
                  />
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                <>
                  {modo === "login" ? <FaUser /> : <FaUserPlus />}
                  <span>
                    {modo === "login" ? "Iniciar sesión" : "Crear cuenta"}
                  </span>
                </>
              )}
            </motion.button>

            {/* Enlace de recuperación de contraseña */}
            {modo === "login" && (
              <div className="text-center mt-3 mb-2">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={loading}
                  className="btn btn-link text-decoration-none p-0 forgot-password-btn"
                  style={{
                    fontSize: "13px",
                    color: isDark ? "#60a5fa" : "#1e40af",
                    fontWeight: "500",
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}
          </form>

          {/* Mensaje de éxito al enviar email de recuperación */}
          {resetEmailSent && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="alert d-flex align-items-start gap-3 mb-4"
              style={{
                backgroundColor: isDark
                  ? "rgba(34, 197, 94, 0.1)"
                  : "rgba(220, 252, 231, 0.9)",
                borderLeft: `4px solid ${isDark ? "#22c55e" : "#16a34a"}`,
                borderRadius: "12px",
                padding: "14px 16px",
                color: isDark ? "#86efac" : "#15803d",
                boxShadow: isDark
                  ? "0 4px 12px rgba(34, 197, 94, 0.15)"
                  : "0 4px 12px rgba(34, 197, 94, 0.1)",
              }}
            >
              <div
                style={{
                  fontSize: "20px",
                  marginTop: "2px",
                  color: isDark ? "#22c55e" : "#16a34a",
                }}
              >
                ✅
              </div>
              <div className="flex-grow-1">
                <div className="fw-semibold mb-1" style={{ fontSize: "14px" }}>
                  Email enviado
                </div>
                <div
                  style={{ fontSize: "13px", lineHeight: "1.5", opacity: 0.95 }}
                >
                  Revisa tu correo ({email}) para restablecer tu contraseña.
                </div>
              </div>
            </motion.div>
          )}

          {/* Separador ultra moderno */}
          <motion.div
            className="d-flex align-items-center gap-3 mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div
              className="flex-grow-1 position-relative"
              style={{
                height: "2px",
                background: isDark
                  ? "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)"
                  : "linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.2) 50%, transparent 100%)",
              }}
            />
            <span
              className="fw-semibold"
              style={{
                color: isDark ? "#ffffff" : "#000000",
                fontSize: "13px",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              o continúa con
            </span>
            <div
              className="flex-grow-1"
              style={{
                height: "2px",
                background: isDark
                  ? "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)"
                  : "linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.2) 50%, transparent 100%)",
              }}
            />
          </motion.div>

          {/* Botones de Login Social - Ultra Modernos */}
          <motion.div
            className="d-flex flex-column flex-sm-row gap-2 mb-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {/* Botón Google - Estilo Premium */}
            <motion.button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400 }}
              className="btn w-100 fw-semibold py-2 d-flex align-items-center justify-content-center gap-2 position-relative overflow-hidden google-login-btn"
              style={{
                background: isDark
                  ? "linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)"
                  : "#ffffff",
                border: isDark
                  ? "1px solid rgba(255, 255, 255, 0.2)"
                  : "2px solid #f3f4f6",
                color: isDark ? "#f9fafb" : "#1f2937",
                borderRadius: "12px",
                boxShadow: isDark
                  ? "0 4px 15px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                  : "0 4px 15px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.05)",
                backdropFilter: "blur(10px)",
              }}
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="d-flex align-items-center justify-content-center"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 48 48"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="#FFC107"
                    d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                  />
                  <path
                    fill="#FF3D00"
                    d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                  />
                </svg>
              </motion.div>
              <span className="d-none d-sm-inline" style={{ fontSize: "14px" }}>
                Google
              </span>
            </motion.button>
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <motion.button
              type="button"
              onClick={() => {
                setError("");
                const nuevoModo = modo === "login" ? "signup" : "login";
                setModoLocal(nuevoModo);
                setModo(nuevoModo);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn p-0 text-decoration-none fw-semibold"
              style={{
                color: isDark ? "#ffffff" : "#000000",
                background: "transparent",
                border: "none",
                fontSize: "14px",
              }}
            >
              {modo === "login" ? (
                <span>
                  ¿No tienes cuenta?{" "}
                  <span
                    style={{
                      color: isDark ? "#ffffff" : "#000000",
                      fontWeight: "700",
                    }}
                  >
                    Regístrate aquí
                  </span>
                </span>
              ) : (
                <span>
                  ¿Ya tienes cuenta?{" "}
                  <span
                    style={{
                      color: isDark ? "#ffffff" : "#000000",
                      fontWeight: "700",
                    }}
                  >
                    Inicia sesión
                  </span>
                </span>
              )}
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
