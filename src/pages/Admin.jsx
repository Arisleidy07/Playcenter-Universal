import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

const ADMIN_UID = "ZeiFzBgosCd0apv9cXL6aQZCYyu2";

// Puedes agregar una función para initials de usuario
function getInitials(name = "") {
  if (!name) return "👤";
  const names = name.split(" ");
  return (
    (names[0]?.[0] || "") + (names[1]?.[0] || "")
  ).toUpperCase();
}

function UsuarioModal({ usuario, onClose }) {
  const [compras, setCompras] = useState([]);
  const [loadingCompras, setLoadingCompras] = useState(true);

  useEffect(() => {
    async function fetchCompras() {
      setLoadingCompras(true);
      try {
        const q = query(collection(db, "orders"), where("userId", "==", usuario.id));
        const snap = await getDocs(q);
        const lista = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCompras(lista);
      } catch (err) {
        setCompras([]);
      }
      setLoadingCompras(false);
    }
    if (usuario) fetchCompras();
  }, [usuario]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-100/80 via-white/80 to-pink-100/80 backdrop-blur-2xl">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-8 relative animate__animated animate__fadeIn flex flex-col">
        <button
          className="absolute top-4 right-4 text-pink-500 text-3xl font-bold hover:bg-pink-100 transition rounded-full px-2"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>
        <div className="flex items-center gap-5 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-pink-400 flex items-center justify-center text-white text-3xl font-bold shadow-lg border-4 border-white">
            {getInitials(usuario.displayName)}
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-blue-700">{usuario.displayName || "Usuario sin nombre"}</h2>
            <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-3 py-1 font-bold shadow-sm">
              ID: <span className="font-mono">{usuario.id}</span>
            </span>
          </div>
        </div>
        {/* Info usuario */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-blue-50/70 rounded-lg p-6 mb-6 border border-blue-100 shadow-inner">
          <div>
            <p className="font-semibold text-gray-700">Email:</p>
            <p>{usuario.email || <span className="italic text-gray-400">Sin email</span>}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-700">Teléfono:</p>
            <p>{usuario.telefono || <span className="italic text-gray-400">Sin teléfono</span>}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-700">Dirección:</p>
            <p>{usuario.direccion || <span className="italic text-gray-400">Sin dirección</span>}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-700">Código:</p>
            <p>{usuario.codigo || <span className="italic text-gray-400">Sin código</span>}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-700">Admin:</p>
            <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-inner ${usuario.admin ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}`}>
              {usuario.admin ? "Sí" : "No"}
            </span>
          </div>
        </div>
        <hr className="my-4" />
        {/* Historial */}
        <h3 className="font-black mb-4 text-pink-600 text-xl text-center tracking-wider">Historial de compras</h3>
        {loadingCompras ? (
          <div className="flex items-center gap-2 justify-center text-pink-500 font-bold">
            <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="4"/></svg>
            Cargando compras...
          </div>
        ) : compras.length === 0 ? (
          <div className="text-gray-400 italic text-center">No hay compras registradas.</div>
        ) : (
          <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
            {compras.map((compra) => (
              <div key={compra.id} className="border-l-4 border-pink-400 bg-pink-50 rounded-2xl p-4 shadow-sm hover:shadow-lg transition group">
                <div className="flex flex-wrap gap-6 mb-2">
                  <span className="font-bold text-sm text-pink-700 group-hover:text-pink-900 transition">
                    <svg className="inline-block mr-1 h-4 w-4 text-pink-400" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor"/></svg>
                    Fecha: {compra.fecha ? new Date(compra.fecha.seconds * 1000).toLocaleString() : "Sin fecha"}
                  </span>
                  <span className="font-bold text-sm text-yellow-700 group-hover:text-yellow-900 transition">
                    Total: RD${compra.total || "?"}
                  </span>
                  {compra.estado &&
                    <span className={`px-2 py-1 rounded text-xs font-bold ${compra.estado === "completado" ? "bg-green-200 text-green-700" : "bg-yellow-200 text-yellow-700"}`}>
                      Estado: {compra.estado}
                    </span>
                  }
                </div>
                <div>
                  <strong className="text-gray-600 text-sm">Productos:</strong>
                  <ul className="list-disc ml-6 text-sm mt-1">
                    {compra.productos?.map((prod, idx) => (
                      <li key={idx}>
                        <span className="font-bold text-pink-700">{prod.nombre}</span> <span className="text-gray-500">({prod.cantidad} x RD${prod.precio})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Admin() {
  const { usuario } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("");
  const [error, setError] = useState("");
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

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
        setError("Error cargando usuarios.");
      }
      setLoading(false);
    }

    fetchUsuarios();
  }, [usuario]);

  if (!usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 to-pink-100">
        <div className="p-10 bg-white rounded-2xl shadow text-xl text-blue-700 font-bold text-center">
          Inicia sesión para acceder.
        </div>
      </div>
    );
  }

  if (usuario.uid !== ADMIN_UID) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-200 to-blue-100">
        <div className="p-10 bg-white rounded-2xl shadow text-xl text-red-600 font-bold text-center">
          No tienes acceso a esta página
        </div>
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
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 p-0">
      <div className="max-w-7xl mx-auto py-0 px-4">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-blue-800 drop-shadow tracking-tight">
          Panel <span className="text-pink-500">Admin</span> Usuarios
        </h1>
        <div className="bg-white/80 rounded-xl shadow-lg p-6 mb-10 border border-blue-100 flex items-center gap-3">
          <input
            type="text"
            placeholder="Buscar por nombre, email, teléfono, dirección o código"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-400 transition text-lg"
          />
          <svg className="w-7 h-7 text-pink-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        {loading && <p className="py-10 text-center text-blue-500 font-extrabold text-xl">Cargando usuarios...</p>}
        {error && <p className="text-red-600 font-bold text-center">{error}</p>}
        {!loading && usuariosFiltrados.length === 0 && (
          <p className="text-gray-500 text-center py-8 text-lg">No hay usuarios que coincidan con la búsqueda.</p>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {usuariosFiltrados.map((u) => (
            <div
              key={u.id}
              className="relative border rounded-2xl shadow hover:shadow-2xl transition cursor-pointer bg-gradient-to-br from-blue-50 to-pink-50 p-7 group"
              onClick={() => setUsuarioSeleccionado(u)}
              title="Ver historial y detalles"
            >
              <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition">
                <svg className="w-7 h-7 text-pink-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12l-3 3m0 0l-3-3m3 3V6" />
                </svg>
              </div>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-blue-400 flex items-center justify-center text-white text-xl font-bold shadow border-2 border-white">
                  {getInitials(u.displayName)}
                </div>
                <span className="font-black text-lg text-blue-700">{u.displayName || "Sin nombre"}</span>
                {u.admin && <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full font-bold">Admin</span>}
              </div>
              <p className="text-gray-600 mb-1"><strong>Email:</strong> <span>{u.email || <span className="italic text-gray-400">Sin email</span>}</span></p>
              <p className="text-gray-600 mb-1"><strong>Teléfono:</strong> <span>{u.telefono || <span className="italic text-gray-400">Sin teléfono</span>}</span></p>
              <p className="text-gray-600 mb-1"><strong>Dirección:</strong> <span>{u.direccion || <span className="italic text-gray-400">Sin dirección</span>}</span></p>
              <p className="text-gray-600 mb-1"><strong>Código:</strong> <span>{u.codigo || <span className="italic text-gray-400">Sin código</span>}</span></p>
              <button
                className="mt-4 w-full bg-pink-500 text-white font-bold rounded-xl py-2 hover:bg-pink-600 transition shadow text-lg"
              >
                Ver historial &rarr;
              </button>
            </div>
          ))}
        </div>
      </div>

      {usuarioSeleccionado && (
        <UsuarioModal
          usuario={usuarioSeleccionado}
          onClose={() => setUsuarioSeleccionado(null)}
        />
      )}
    </main>
  );
}