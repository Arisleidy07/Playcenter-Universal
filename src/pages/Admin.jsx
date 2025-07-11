import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

const ADMIN_UID = "ZeiFzBgosCd0apv9cXL6aQZCYyu2";

export default function Admin() {
  const { usuario } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!usuario || usuario.uid !== ADMIN_UID) return;

    async function fetchUsuarios() {
      setLoading(true);
      setError("");

      try {
        const snap = await getDocs(collection(db, "users"));
        const lista = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsuarios(lista);
      } catch (err) {
        console.error("❌ Error cargando usuarios:", err);
        setError("Error cargando usuarios.");
      }

      setLoading(false);
    }

    fetchUsuarios();
  }, [usuario]);

  if (!usuario) {
    return <div className="p-8 text-center">Inicia sesión para acceder.</div>;
  }

  if (usuario.uid !== ADMIN_UID) {
    return (
      <div className="p-8 text-center text-red-600 font-bold">
        No tienes acceso a esta página
      </div>
    );
  }

  const usuariosFiltrados = usuarios.filter((u) => {
    const filtroLower = filtro.toLowerCase();
    return (
      (u.displayName || "").toLowerCase().includes(filtroLower) ||
      (u.email || "").toLowerCase().includes(filtroLower) ||
      (u.telefono || "").toLowerCase().includes(filtroLower) ||
      (u.direccion || "").toLowerCase().includes(filtroLower) ||
      (u.codigo || "").toLowerCase().includes(filtroLower)
    );
  });

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Panel Admin - Usuarios trados</h1>

      <input
        type="text"
        placeholder="Buscar por nombre, email, teléfono, dirección o código"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="w-full mb-6 px-4 py-2 border border-gray-300 rounded"
      />

      {loading && <p>Cargando usuarios...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && usuariosFiltrados.length === 0 && (
        <p>No hay usuarios que coincidan con la búsqueda.</p>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {usuariosFiltrados.map((u) => (
          <div
            key={u.id}
            className="border p-4 rounded shadow hover:shadow-lg transition"
          >
            <p>
              <strong>ID:</strong> {u.id}
            </p>
            <p>
              <strong>Nombre:</strong> {u.displayName || "Sin nombre"}
            </p>
            <p>
              <strong>Email:</strong> {u.email || "Sin email"}
            </p>
            <p>
              <strong>Teléfono:</strong> {u.telefono || "Sin teléfono"}
            </p>
            <p>
              <strong>Dirección:</strong> {u.direccion || "Sin dirección"}
            </p>
            <p>
              <strong>Código:</strong> {u.codigo || "Sin código"}
            </p>
            <p>
              <strong>Admin:</strong> {u.admin ? "Sí" : "No"}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
