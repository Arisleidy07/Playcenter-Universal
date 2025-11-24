// src/components/PrivateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children }) {
  const { usuario } = useAuth();

  if (!usuario) {
    // Redirigir al inicio si no hay usuario logueado
    return <Navigate to="/" replace />;
  }

  return children;
}
