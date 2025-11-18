import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useAuthModal } from "../context/AuthModalContext";
import { useTheme } from "../context/ThemeContext";
import { motion } from "framer-motion";
import {
  FaUser,
  FaUserPlus,
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaLock,
  FaPhone,
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
  const { login, signup, usuario } = useAuth();
  const { isDark } = useTheme();

  const [modo, setModoLocal] = useState(modoGlobal);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [telefono, setTelefono] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setModoLocal(modoGlobal);
    setError("");
    setEmail("");
    setPassword("");
    setName("");
    setTelefono("");
  }, [modalAbierto, modoGlobal]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (modo === "login") {
        await login(email, password);
      } else {
        // Validar teléfono
        if (!telefono.trim()) {
          setError("El número de teléfono es requerido");
          setLoading(false);
          return;
        }
        // Registrarse
        const nuevoUsuario = await signup(email, password);

        // Guardar nombre y datos iniciales en Firestore
        await setDoc(doc(db, "users", nuevoUsuario.uid), {
          displayName: name || "Usuario",
          email,
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
          email,
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
      }
      setModalAbierto(false);
    } catch (e) {
      setError("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  if (!modalAbierto) return null;

  return (
    <div
      onClick={() => setModalAbierto(false)}
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
      style={{
        backgroundColor: "#000000",
        zIndex: 9999,
      }}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 50 }}
        transition={{ duration: 0.4, type: "spring", damping: 25 }}
        className="position-relative w-100 shadow-lg rounded-4 overflow-hidden"
        style={{
          maxWidth: "420px",
          backgroundColor: isDark ? "#1f2937" : "#ffffff",
          border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
        }}
      >
        {/* Header elegante y profesional */}
        <div
          className="text-center py-4 px-4 position-relative border-bottom"
          style={{
            backgroundColor: isDark ? "#111827" : "#ffffff",
            borderBottomColor: isDark ? "#374151" : "#e5e7eb",
          }}
        >
          <button
            onClick={() => setModalAbierto(false)}
            className="position-absolute top-0 end-0 m-3 btn btn-sm p-2"
            style={{
              backgroundColor: isDark ? "#374151" : "#f3f4f6",
              color: isDark ? "#9ca3af" : "#6b7280",
              border: "none",
              borderRadius: "8px",
              width: "32px",
              height: "32px",
            }}
          >
            ×
          </button>

          <div className="d-flex align-items-center justify-content-center gap-3 mb-2">
            {modo === "login" ? (
              <FaUser
                className="fs-5"
                style={{ color: isDark ? "#f9fafb" : "#111827" }}
              />
            ) : (
              <FaUserPlus
                className="fs-5"
                style={{ color: isDark ? "#f9fafb" : "#111827" }}
              />
            )}
            <h2
              className="h4 fw-bold mb-0"
              style={{ color: isDark ? "#f9fafb" : "#111827" }}
            >
              {modo === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
            </h2>
          </div>
          <p
            className="small mb-0"
            style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
          >
            {modo === "login"
              ? "Accede a tu cuenta"
              : "Regístrate para continuar"}
          </p>
        </div>

        {/* Contenido del formulario */}
        <div className="p-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="alert alert-danger d-flex align-items-center gap-2 mb-4"
              style={{
                backgroundColor: isDark ? "#dc2626" : "#fee2e2",
                borderColor: isDark ? "#ef4444" : "#fecaca",
                color: isDark ? "#ffffff" : "#dc2626",
              }}
            >
              <i className="fas fa-exclamation-triangle"></i>
              <span className="small fw-medium">{error}</span>
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
                  style={{ color: isDark ? "#f9fafb" : "#374151" }}
                >
                  <FaUser className="me-2" />
                  Nombre de usuario
                </label>
                <input
                  type="text"
                  required
                  className="form-control form-control-lg"
                  style={{
                    backgroundColor: isDark ? "#374151" : "#f9fafb",
                    borderColor: isDark ? "#4b5563" : "#d1d5db",
                    color: isDark ? "#f9fafb" : "#111827",
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
                  style={{ color: isDark ? "#f9fafb" : "#374151" }}
                >
                  <FaPhone className="me-2" />
                  Número de teléfono
                </label>
                <input
                  type="tel"
                  required
                  className="form-control form-control-lg"
                  style={{
                    backgroundColor: isDark ? "#374151" : "#f9fafb",
                    borderColor: isDark ? "#4b5563" : "#d1d5db",
                    color: isDark ? "#f9fafb" : "#111827",
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
                style={{ color: isDark ? "#f9fafb" : "#374151" }}
              >
                <FaEnvelope className="me-2" />
                Correo electrónico
              </label>
              <input
                type="email"
                required
                className="form-control form-control-lg"
                style={{
                  backgroundColor: isDark ? "#374151" : "#f9fafb",
                  borderColor: isDark ? "#4b5563" : "#d1d5db",
                  color: isDark ? "#f9fafb" : "#111827",
                }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
              />
            </div>

            <div className="mb-4">
              <label
                className="form-label fw-semibold small"
                style={{ color: isDark ? "#f9fafb" : "#374151" }}
              >
                <FaLock className="me-2" />
                Contraseña
              </label>
              <div className="position-relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="form-control form-control-lg pe-5"
                  style={{
                    backgroundColor: isDark ? "#374151" : "#f9fafb",
                    borderColor: isDark ? "#4b5563" : "#d1d5db",
                    color: isDark ? "#f9fafb" : "#111827",
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
                    color: isDark ? "#9ca3af" : "#6b7280",
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
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn btn-lg w-100 fw-bold py-3 mb-4 d-flex align-items-center justify-content-center gap-2"
              style={{
                backgroundColor: isDark ? "#1f2937" : "#111827",
                border: `1px solid ${isDark ? "#374151" : "#d1d5db"}`,
                color: "#ffffff",
              }}
            >
              {loading ? (
                <>
                  <div
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  >
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                  Procesando...
                </>
              ) : (
                <>
                  {modo === "login" ? <FaUser /> : <FaUserPlus />}
                  {modo === "login" ? "Iniciar sesión" : "Crear cuenta"}
                </>
              )}
            </motion.button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setError("");
                const nuevoModo = modo === "login" ? "signup" : "login";
                setModoLocal(nuevoModo);
                setModo(nuevoModo);
              }}
              className="btn btn-link p-0 text-decoration-none fw-medium"
              style={{
                color: isDark ? "#60a5fa" : "#3b82f6",
              }}
            >
              {modo === "login"
                ? "¿No tienes cuenta? Regístrate aquí"
                : "¿Ya tienes cuenta? Inicia sesión"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
