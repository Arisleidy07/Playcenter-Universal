// src/pages/Registro.jsx
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Registro() {
  const { registro } = useAuth();
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const manejarRegistro = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await registro(email, password);
      navigate("/");
    } catch (err) {
      setError("Error al crear la cuenta.");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#f0f0f0] px-4">
      <div className="form-container">
        <p className="title">Create account</p>
        <p className="sub-title">Let's get started with your 30 days free trial</p>
        <form className="form" onSubmit={manejarRegistro}>
          <input
            type="text"
            className="input"
            placeholder="Name"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
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
          <button type="submit" className="form-btn">
            Create account
          </button>
        </form>
        {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
        <p className="sign-up-label">
          Already have an account?{" "}
          <span
            className="sign-up-link"
            onClick={() => navigate("/login")}
          >
            Log in
          </span>
        </p>
        <div className="buttons-container">
          <div className="apple-login-button">
            <span>Sign up with Apple</span>
          </div>
          <div className="google-login-button">
            <span>Sign up with Google</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Registro;
