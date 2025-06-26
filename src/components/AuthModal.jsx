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
      alert("Completa todos los campos");
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
      console.error("🔥 Firebase error:", error);
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
            <p className="title">Welcome back</p>
            <form className="form" onSubmit={handleSubmit}>
              <input
                type="email"
                className="input"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                className="input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="page-link">
                <span className="page-link-label">Forgot Password?</span>
              </p>
              <button type="submit" className="form-btn">Log in</button>
            </form>
            <p className="sign-up-label">
              Don't have an account?{" "}
              <span className="sign-up-link" onClick={() => setIsLogin(false)}>
                Sign up
              </span>
            </p>
          </>
        ) : (
          <>
            <p className="title">Create account</p>
            <p className="sub-title">Let's get started with your 30 days free trial</p>
            <form className="form" onSubmit={handleSubmit}>
              <input
                type="text"
                className="input"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                type="email"
                className="input"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                className="input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit" className="form-btn">Create account</button>
            </form>
            <p className="sign-up-label">
              Already have an account?{" "}
              <span className="sign-up-link" onClick={() => setIsLogin(true)}>
                Log in
              </span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
