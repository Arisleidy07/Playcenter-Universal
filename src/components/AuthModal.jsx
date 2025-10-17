import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useAuthModal } from "../context/AuthModalContext";
import { motion } from "framer-motion";
import { FaUser, FaUserPlus } from "react-icons/fa";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function AuthModal() {
  const {
    modalAbierto,
    setModalAbierto,
    modo: modoGlobal,
    setModo,
  } = useAuthModal();
  const { login, signup, usuario } = useAuth();

  const [modo, setModoLocal] = useState(modoGlobal);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setModoLocal(modoGlobal);
    setError("");
    setEmail("");
    setPassword("");
    setName("");
  }, [modalAbierto, modoGlobal]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      if (modo === "login") {
        await login(email, password);
      } else {
        // Registrarse
        const nuevoUsuario = await signup(email, password);

        // Guardar nombre y datos iniciales en Firestore
        await setDoc(doc(db, "users", nuevoUsuario.uid), {
          displayName: name || "Usuario",
          email,
          telefono: "",
          direccion: "",
          codigo: "",
          metodoEntrega: "",
          admin: false,
          createdAt: new Date(),
        });

        // Actualizar displayName en Firebase Auth
        if (name) {
          await updateProfile(nuevoUsuario, { displayName: name });
        }
      }
      setModalAbierto(false);
    } catch (e) {
      setError("Error: " + e.message);
    }
  }

  if (!modalAbierto) return null;

  return (
    <div
      onClick={() => setModalAbierto(false)}
      className="fixed inset-0 bg-gradient-to-br from-black/90 to-gray-900/90 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="relative bg-[#0f172a] text-white rounded-xl shadow-2xl w-full max-w-md p-6 border border-[#3b82f6]/40"
      >
        <button
          onClick={() => setModalAbierto(false)}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-4 text-center flex items-center justify-center gap-2">
          {modo === "login" ? (
            <>
              <FaUser className="text-[#3b82f6]" /> Iniciar Sesión
            </>
          ) : (
            <>
              <FaUserPlus className="text-[#3b82f6]" /> Registrarse
            </>
          )}
        </h2>

        {error && (
          <p className="text-red-400 mb-4 text-center font-semibold">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {modo === "signup" && (
            <div>
              <label className="block text-sm mb-1">Nombre de usuario</label>
              <input
                type="text"
                required
                className="w-full bg-[#1e293b] border border-[#3b82f6]/40 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-sm mb-1">Correo electrónico</label>
            <input
              type="email"
              required
              className="w-full bg-[#1e293b] border border-[#3b82f6]/40 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Contraseña</label>
            <input
              type="password"
              required
              className="w-full bg-[#1e293b] border border-[#3b82f6]/40 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold py-2 rounded-lg shadow-lg transition transform hover:scale-105"
          >
            {modo === "login" ? "Iniciar sesión" : "Registrarse"}
          </button>
        </form>

        <p
          className="mt-4 text-center text-sm cursor-pointer text-[#3b82f6] hover:underline select-none"
          onClick={() => {
            setError("");
            const nuevoModo = modo === "login" ? "signup" : "login";
            setModoLocal(nuevoModo);
            setModo(nuevoModo);
          }}
        >
          {modo === "login"
            ? "¿No tienes una cuenta? Regístrate"
            : "¿Ya tienes cuenta? Inicia sesión"}
        </p>
      </motion.div>
    </div>
  );
}
