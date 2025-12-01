import React, { useEffect } from "react";
import { useAuthModal } from "../context/AuthModalContext";

export default function LoginRedirect() {
  const { abrirModal } = useAuthModal();

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const email = (params.get("email") || "").trim().toLowerCase();
      if (email) {
        const userData = {
          email,
          loginMethod: "email",
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem("lastLoginEmail", email);
        localStorage.setItem("lastUserData", JSON.stringify(userData));
      }
    } catch (_) {}
    abrirModal("login");
  }, [abrirModal]);

  return (
    <div className="min-h-[40vh] flex items-center justify-center p-6">
      <div className="text-center text-gray-500 dark:text-gray-400">
        <p className="text-sm">Abriendo inicio de sesión…</p>
      </div>
    </div>
  );
}
