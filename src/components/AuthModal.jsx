import React, { useState } from "react";
import "./AuthModal.css";

export default function AuthModal({ onClose, onLogin, onSignup }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // Solo para registro

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || (!isLogin && !name)) {
      alert("Por favor, completa todos los campos");
      return;
    }

    try {
      if (isLogin) {
        await onLogin(email, password);
      } else {
        await onSignup(email, password, name);
      }
      onClose();
    } catch (error) {
      console.error("🔥 Error Firebase:", error);
      alert(error.message || "Ocurrió un error");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="form-container" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose} aria-label="Cerrar modal">
          &times;
        </button>

        {isLogin ? (
          <>
            <p className="title">Bienvenido de nuevo</p>
            <form className="form" onSubmit={handleSubmit}>
              <input
                type="email"
                className="input"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                className="input"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="page-link">
                <span className="page-link-label">¿Olvidaste la contraseña?</span>
              </p>
              <button type="submit" className="form-btn">Iniciar sesión</button>
            </form>
            <p className="sign-up-label">
              ¿No tienes cuenta?{" "}
              <span className="sign-up-link" onClick={() => setIsLogin(false)}>
                Regístrate
              </span>
            </p>
          </>
        ) : (
          <>
            <p className="title">Crear cuenta</p>
            <p className="sub-title">Comienza con tu prueba gratuita de 30 días</p>
            <form className="form" onSubmit={handleSubmit}>
              <input
                type="text"
                className="input"
                placeholder="Nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                type="email"
                className="input"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                className="input"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit" className="form-btn">Crear cuenta</button>
            </form>
            <p className="sign-up-label">
              ¿Ya tienes cuenta?{" "}
              <span className="sign-up-link" onClick={() => setIsLogin(true)}>
                Inicia sesión
              </span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
