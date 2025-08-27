// src/components/Admin.jsx
import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

const ADMIN_UID = "ZeiFzBgosCd0apv9cXL6aQZCYyu2";

function getInitials(name = "") {
  if (!name) return "👤";
  const parts = name.trim().split(" ");
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
}

// -------- VISTA FULL SCREEN DE USUARIO --------
function UsuarioFullView({ usuario, onClose }) {
  const [compras, setCompras] = useState([]);
  const [loadingCompras, setLoadingCompras] = useState(true);

  useEffect(() => {
    if (!usuario) return;
    const q = query(collection(db, "orders"), where("userId", "==", usuario.id));
    const unsubscribe = onSnapshot(q, (snap) => {
      const lista = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCompras(lista);
      setLoadingCompras(false);
    });
    return () => unsubscribe();
  }, [usuario]);

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      {/* HEADER */}
      <header className="sticky top-0 bg-gray-100 border-b flex justify-between items-center px-6 py-4 shadow-md">
        <h2 className="text-2xl font-bold text-gray-800">
          Perfil de {usuario.displayName || "Usuario"}
        </h2>
        <button
          onClick={onClose}
          className="text-3xl font-bold text-red-500 hover:bg-red-100 rounded-full px-3 transition"
        >
          ×
        </button>
      </header>

      {/* CONTENIDO */}
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        {/* Datos Personales */}
        <section className="bg-white rounded-xl shadow-md border p-6">
          <h3 className="text-xl font-bold mb-4 text-blue-700">Datos Personales</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div><p className="font-semibold">Nombre:</p><p>{usuario.displayName || "No registrado"}</p></div>
            <div><p className="font-semibold">Email:</p><p>{usuario.email || "No registrado"}</p></div>
            <div><p className="font-semibold">Teléfono:</p><p>{usuario.telefono || "No registrado"}</p></div>
          </div>
        </section>

        {/* Dirección y Entrega */}
        <section className="bg-white rounded-xl shadow-md border p-6">
          <h3 className="text-xl font-bold mb-4 text-blue-700">Dirección y Entrega</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div><p className="font-semibold">Dirección:</p><p>{usuario.direccion || "No registrada"}</p></div>
            <div><p className="font-semibold">Método Entrega:</p><p>{usuario.metodoEntrega || "No registrado"}</p></div>
            <div><p className="font-semibold">Código:</p><p>{usuario.codigo || "No registrado"}</p></div>
          </div>
        </section>

        {/* Rol */}
        <section className="bg-white rounded-xl shadow-md border p-6">
          <h3 className="text-xl font-bold mb-4 text-blue-700">Rol</h3>
          <span
            className={`px-4 py-2 rounded-full text-sm font-bold ${
              usuario.admin ? "bg-green-200 text-green-700" : "bg-red-200 text-red-700"
            }`}
          >
            {usuario.admin ? "Administrador" : "Usuario"}
          </span>
        </section>

        {/* Compras */}
        <section className="bg-white rounded-xl shadow-md border p-6">
          <h3 className="text-xl font-bold mb-4 text-blue-700">Historial de Compras</h3>
          {loadingCompras ? (
            <p className="text-gray-500">Cargando compras...</p>
          ) : compras.length === 0 ? (
            <p className="text-gray-400 italic">No hay compras registradas.</p>
          ) : (
            <div className="space-y-6">
              {compras.map((c) => (
                <div key={c.id} className="border rounded-lg p-4 shadow">
                  <div className="flex flex-wrap gap-6 mb-2 text-sm">
                    <span className="font-semibold">
                      Fecha: {c.fecha ? new Date(c.fecha.seconds * 1000).toLocaleDateString() : "Sin fecha"}
                    </span>
                    <span className="font-semibold">Total: RD${c.total || "?"}</span>
                    {c.estado && (
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          c.estado === "completado"
                            ? "bg-green-200 text-green-700"
                            : "bg-yellow-200 text-yellow-700"
                        }`}
                      >
                        {c.estado}
                      </span>
                    )}
                  </div>
                  <ul className="list-disc ml-6 text-sm">
                    {c.productos?.map((p, i) => (
                      <li key={i}>
                        {p.nombre} ({p.cantidad} x RD${p.precio})
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Futuro */}
        <section className="bg-white rounded-xl shadow-md border p-6">
          <h3 className="text-xl font-bold mb-2 text-blue-700">Más información</h3>
          <p className="text-gray-500">Aquí podrás agregar notas, direcciones múltiples, devoluciones, etc.</p>
        </section>
      </div>
    </div>
  );
}

// -------- PANEL PRINCIPAL --------
export default function Admin() {
  const { usuario } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  useEffect(() => {
    if (!usuario || usuario.uid !== ADMIN_UID) return;
    const q = query(collection(db, "users"));
    const unsubscribe = onSnapshot(q, (snap) => {
      const lista = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsuarios(lista);
    });
    return () => unsubscribe();
  }, [usuario]);

  if (!usuario) return <div className="flex items-center justify-center min-h-screen">Inicia sesión</div>;
  if (usuario.uid !== ADMIN_UID) return <div className="flex items-center justify-center min-h-screen">Sin acceso</div>;

  const usuariosFiltrados = usuarios.filter((u) => {
    const f = filtro.toLowerCase();
    return (
      (u.displayName || "").toLowerCase().includes(f) ||
      (u.email || "").toLowerCase().includes(f) ||
      (u.telefono || "").toLowerCase().includes(f) ||
      (u.direccion || "").toLowerCase().includes(f) ||
      (u.codigo || "").toLowerCase().includes(f)
    );
  });

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-blue-800">
        Panel <span className="text-pink-500">Admin</span> Usuarios
      </h1>

      {/* Buscador */}
      <div className="bg-white rounded-xl shadow p-4 mb-8 flex items-center gap-3">
        <input
          type="text"
          placeholder="Buscar usuario..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-400"
        />
      </div>

      {/* Lista */}
      {usuariosFiltrados.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No hay usuarios</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {usuariosFiltrados.map((u) => (
            <div
              key={u.id}
              className="border rounded-2xl shadow hover:shadow-2xl transition cursor-pointer bg-white p-6"
              onClick={() => setUsuarioSeleccionado(u)}
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center text-lg font-bold text-blue-700">
                  {getInitials(u.displayName)}
                </div>
                <span className="font-bold text-lg">{u.displayName || "Sin nombre"}</span>
              </div>
              <p className="text-gray-600 text-sm"><b>Email:</b> {u.email || "Sin email"}</p>
              <p className="text-gray-600 text-sm"><b>Teléfono:</b> {u.telefono || "Sin teléfono"}</p>
              <p className="text-gray-600 text-sm"><b>Dirección:</b> {u.direccion || "Sin dirección"}</p>
            </div>
          ))}
        </div>
      )}

      {usuarioSeleccionado && (
        <UsuarioFullView usuario={usuarioSeleccionado} onClose={() => setUsuarioSeleccionado(null)} />
      )}
    </main>
  );
}
