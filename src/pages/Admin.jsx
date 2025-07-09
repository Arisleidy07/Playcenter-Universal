import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // Asegúrate que aquí apunta bien
import { useAuth } from "../context/AuthContext";

const ADMIN_UID = "ZeiFzBgosCd0apv9cXL6aQZCYyu2"; // TU UID DE ADMIN

export default function Admin() {
  const { usuario } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!usuario) {
      console.log("No hay usuario logueado.");
      setLoading(false);
      return;
    }

    if (usuario.uid !== ADMIN_UID) {
      console.log("UID no coincide. No eres admin.");
      setLoading(false);
      return;
    }

    async function fetchUsuarios() {
      setLoading(true);
      try {
        const usuariosSnapshot = await getDocs(collection(db, "users"));
        const listaUsuarios = usuariosSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsuarios(listaUsuarios);
        console.log("Usuarios cargados:", listaUsuarios);
      } catch (error) {
        console.error("Error cargando usuarios:", error);
      }
      setLoading(false);
    }

    fetchUsuarios();
  }, [usuario]);

  if (!usuario) {
    return (
      <div className="p-8 text-center">
        Debes iniciar sesión para ver esta página.
      </div>
    );
  }

  if (usuario.uid !== ADMIN_UID) {
    return (
      <div className="p-8 text-center text-red-600 font-bold">
        No tienes acceso a esta página.
      </div>
    );
  }

  return (
    <main className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        Panel Admin - Lista Completa de Usuarios
      </h1>

      {loading && <p>Cargando usuarios...</p>}

      {!loading && usuarios.length === 0 && (
        <p>No hay usuarios registrados en Firestore.</p>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {usuarios.map((u) => (
          <div
            key={u.id}
            className="border p-4 rounded shadow hover:shadow-lg transition"
          >
            <p><strong>ID:</strong> {u.id}</p>
            <p><strong>Nombre:</strong> {u.displayName || "Sin nombre"}</p>
            <p><strong>Email:</strong> {u.email || "Sin email"}</p>
            <p><strong>Teléfono:</strong> {u.telefono || "Sin teléfono"}</p>
            <p><strong>Dirección:</strong> {u.direccion || "Sin dirección"}</p>
            <p><strong>Código:</strong> {u.codigo || "Sin código"}</p>
            <p><strong>Admin:</strong> {u.admin ? "Sí" : "No"}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
