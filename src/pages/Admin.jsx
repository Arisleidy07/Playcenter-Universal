// src/components/Admin.jsx
import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, doc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

const ADMIN_UID = "ZeiFzBgosCd0apv9cXL6aQZCYyu2";

function getInitials(name = "") {
  if (!name) return "👤";
  const parts = name.trim().split(" ");
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
}

function extractFirstUrl(text = "") {
  if (!text) return null;
  const httpMatch = text.match(/(https?:\/\/[^\s]+)/i);
  if (httpMatch) return httpMatch[1];
  const mapsMatch = text.match(/(maps\.app\.[^\s]+|goo\.gl\/[^\s]+|google\.com\/maps[^\s]*)/i);
  if (mapsMatch) {
    const candidate = mapsMatch[0];
    return candidate.startsWith("http") ? candidate : `https://${candidate}`;
  }
  return null;
}

function formatDate(ts) {
  if (!ts) return null;
  if (typeof ts === "object" && ts.seconds) {
    return new Date(ts.seconds * 1000).toLocaleString();
  }
  const d = new Date(ts);
  if (!isNaN(d.getTime())) return d.toLocaleString();
  return String(ts);
}

/* Full-screen user detail view */
function UsuarioFullView({ usuario, onClose }) {
  const [compras, setCompras] = useState([]);
  const [loadingCompras, setLoadingCompras] = useState(true);
  const [usuarioData, setUsuarioData] = useState(usuario);

  // Real-time user data synchronization
  useEffect(() => {
    if (!usuario?.id) return;
    
    // Listen to both 'users' and 'usuarios' collections for real-time updates
    const unsubscribeUsers = onSnapshot(doc(db, "users", usuario.id), (docSnap) => {
      if (docSnap.exists()) {
        setUsuarioData(prev => ({ ...prev, ...docSnap.data() }));
      }
    }, (err) => console.error("users doc onSnapshot error:", err));

    const unsubscribeUsuarios = onSnapshot(doc(db, "usuarios", usuario.id), (docSnap) => {
      if (docSnap.exists()) {
        setUsuarioData(prev => ({ ...prev, ...docSnap.data() }));
      }
    }, (err) => console.error("usuarios doc onSnapshot error:", err));

    return () => {
      unsubscribeUsers();
      unsubscribeUsuarios();
    };
  }, [usuario?.id]);

  useEffect(() => {
    if (!usuario) return;
    const q = query(collection(db, "orders"));
    const unsubscribe = onSnapshot(q, (snap) => {
      const lista = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((o) => String(o.userId) === String(usuario.id));
      setCompras(lista.sort((a, b) => {
        const dateA = a.fecha?.seconds || 0;
        const dateB = b.fecha?.seconds || 0;
        return dateB - dateA; // Most recent first
      }));
      setLoadingCompras(false);
    }, (err) => {
      console.error("orders onSnapshot error:", err);
      setCompras([]);
      setLoadingCompras(false);
    });
    return () => unsubscribe();
  }, [usuario]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const direccionTexto = usuarioData?.direccion || usuarioData?.direccionCompleta || "";
  const ubicacionLink = usuarioData?.ubicacion || extractFirstUrl(direccionTexto);

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative max-w-7xl mx-auto my-4 bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white flex justify-between items-center px-8 py-6 shadow-lg z-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-bold">
              {getInitials(usuarioData.displayName)}
            </div>
            <div>
              <h2 className="text-3xl font-bold">
                {usuarioData.displayName || "Usuario Sin Nombre"}
              </h2>
              <p className="text-blue-100 text-sm">ID: {usuarioData.id}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 flex items-center justify-center text-2xl font-bold hover:scale-110"
          >
            ✕
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 bg-gray-50">
          {/* Información Personal Completa */}
          <section className="bg-white rounded-2xl border-0 shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold">👤</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Información Personal</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-600 text-sm mb-1">Nombre Completo</p>
                <p className="text-lg font-medium text-gray-900">{usuarioData.displayName || "No especificado"}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-600 text-sm mb-1">Email</p>
                <p className="text-lg font-medium text-gray-900 break-all">{usuarioData.email || "No especificado"}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-600 text-sm mb-1">Teléfono</p>
                <p className="text-lg font-medium text-gray-900">{usuarioData.telefono || "No especificado"}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-600 text-sm mb-1">Código de Usuario</p>
                <p className="text-lg font-medium text-gray-900">{usuarioData.codigo || "No asignado"}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-600 text-sm mb-1">Método de Entrega</p>
                <p className="text-lg font-medium text-gray-900">{usuarioData.metodoEntrega || "No especificado"}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-600 text-sm mb-1">Fecha de Registro</p>
                <p className="text-lg font-medium text-gray-900">{usuarioData.createdAt ? formatDate(usuarioData.createdAt) : "No disponible"}</p>
              </div>
            </div>
            
            {/* Rol y Estado */}
            <div className="mt-6 flex items-center gap-4">
              <span className={`px-4 py-2 rounded-full text-sm font-bold ${usuarioData.admin ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}>
                {usuarioData.admin ? "🛡️ Administrador" : "👤 Usuario Regular"}
              </span>
              {usuarioData.photoURL && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Foto de perfil:</span>
                  <img src={usuarioData.photoURL} alt="Avatar" className="w-8 h-8 rounded-full" />
                </div>
              )}
            </div>
          </section>

          {/* Dirección y Ubicación Completa */}
          <section className="bg-white rounded-2xl border-0 shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-bold">📍</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Dirección y Ubicación</h3>
            </div>

            {/* Dirección Principal */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
              <h4 className="font-bold text-lg mb-3 text-gray-800">📍 Dirección Completa</h4>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                {direccionTexto || "No se ha registrado dirección"}
              </p>
              
              {ubicacionLink && (
                <div className="flex flex-wrap gap-3">
                  <a 
                    href={ubicacionLink} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    🗺️ Ver en Google Maps
                  </a>
                  <div className="text-sm text-gray-600 bg-white rounded-lg px-3 py-2 border">
                    <span className="font-medium">Link:</span> {ubicacionLink}
                  </div>
                </div>
              )}
            </div>

            {/* Detalles de Dirección */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-600 text-sm mb-1">🏛️ Provincia</p>
                <p className="text-lg font-medium text-gray-900">{usuarioData.provincia || "No especificada"}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-600 text-sm mb-1">🏙️ Ciudad</p>
                <p className="text-lg font-medium text-gray-900">{usuarioData.ciudad || "No especificada"}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-600 text-sm mb-1">🏘️ Sector/Barrio</p>
                <p className="text-lg font-medium text-gray-900">{usuarioData.sector || "No especificado"}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-600 text-sm mb-1">🛣️ Calle/Número</p>
                <p className="text-lg font-medium text-gray-900">{usuarioData.numeroCalle || "No especificada"}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-600 text-sm mb-1">🏠 Número de Casa</p>
                <p className="text-lg font-medium text-gray-900">{usuarioData.numeroCasa || "No especificado"}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-600 text-sm mb-1">📝 Referencia</p>
                <p className="text-lg font-medium text-gray-900">{usuarioData.referencia || "No especificada"}</p>
              </div>
            </div>
          </section>

          {/* Historial de Compras Completo */}
          <section className="bg-white rounded-2xl border-0 shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 font-bold">🛒</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Historial de Compras</h3>
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-bold">
                {compras.length} {compras.length === 1 ? 'compra' : 'compras'}
              </span>
            </div>
            
            {loadingCompras ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-3 text-gray-600">Cargando historial...</span>
              </div>
            ) : compras.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <div className="text-6xl mb-4">🛍️</div>
                <p className="text-xl text-gray-500 font-medium">No hay compras registradas</p>
                <p className="text-gray-400 mt-2">Este usuario aún no ha realizado ninguna compra</p>
              </div>
            ) : (
              <div className="space-y-4">
                {compras.map((c, index) => (
                  <div key={c.id} className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-bold text-lg text-gray-800">Orden: {c.id}</p>
                          <p className="text-sm text-gray-600">📅 {c.fecha ? formatDate(c.fecha) : "Sin fecha"}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">RD${c.total ?? "0"}</p>
                          <p className="text-sm text-gray-500">{c.productos?.length || 0} productos</p>
                        </div>
                        {c.estado && (
                          <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                            c.estado === "completado" ? "bg-green-100 text-green-800" : 
                            c.estado === "pendiente" ? "bg-yellow-100 text-yellow-800" : 
                            c.estado === "cancelado" ? "bg-red-100 text-red-800" : 
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {c.estado.charAt(0).toUpperCase() + c.estado.slice(1)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Productos */}
                    {c.productos && c.productos.length > 0 && (
                      <div className="bg-white rounded-lg p-4 border">
                        <h5 className="font-bold text-gray-700 mb-3">📦 Productos:</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {c.productos.map((p, i) => (
                            <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                              <div>
                                <p className="font-medium text-gray-800">{p.nombre || "Producto sin nombre"}</p>
                                <p className="text-sm text-gray-600">Cantidad: {p.cantidad || 1}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-gray-800">RD${p.precio || 0}</p>
                                <p className="text-xs text-gray-500">c/u</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Información adicional si existe */}
                    {(c.metodoPago || c.direccionEntrega || c.notas) && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {c.metodoPago && (
                          <div className="bg-white rounded-lg p-3 border">
                            <p className="text-xs text-gray-500 mb-1">💳 Método de Pago</p>
                            <p className="font-medium text-gray-800">{c.metodoPago}</p>
                          </div>
                        )}
                        {c.direccionEntrega && (
                          <div className="bg-white rounded-lg p-3 border">
                            <p className="text-xs text-gray-500 mb-1">📍 Dirección de Entrega</p>
                            <p className="font-medium text-gray-800 text-sm">{c.direccionEntrega}</p>
                          </div>
                        )}
                        {c.notas && (
                          <div className="bg-white rounded-lg p-3 border">
                            <p className="text-xs text-gray-500 mb-1">📝 Notas</p>
                            <p className="font-medium text-gray-800 text-sm">{c.notas}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default function Admin() {
  const { usuario } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  useEffect(() => {
    if (!usuario || usuario.uid !== ADMIN_UID) return;
    
    // Listen to both collections for complete user data
    const unsubscribeUsers = onSnapshot(query(collection(db, "users")), (snap) => {
      const usersData = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsuarios(prev => {
        const merged = [...usersData];
        // Merge with usuarios collection data if exists
        prev.forEach(existingUser => {
          const index = merged.findIndex(u => u.id === existingUser.id);
          if (index >= 0) {
            merged[index] = { ...merged[index], ...existingUser };
          }
        });
        return merged;
      });
    }, (err) => {
      console.error("users onSnapshot error:", err);
    });

    const unsubscribeUsuarios = onSnapshot(query(collection(db, "usuarios")), (snap) => {
      const usuariosData = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsuarios(prev => {
        const merged = [...prev];
        usuariosData.forEach(userData => {
          const index = merged.findIndex(u => u.id === userData.id);
          if (index >= 0) {
            merged[index] = { ...merged[index], ...userData };
          } else {
            merged.push(userData);
          }
        });
        return merged;
      });
    }, (err) => {
      console.error("usuarios onSnapshot error:", err);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeUsuarios();
    };
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
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Panel Administrativo
          </h1>
          <p className="text-xl text-gray-600 font-medium">Gestión Completa de Usuarios</p>
          <div className="mt-4 flex items-center justify-center gap-4">
            <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-bold">
              👥 {usuarios.length} {usuarios.length === 1 ? 'usuario' : 'usuarios'} registrados
            </span>
            <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-bold">
              🔄 Sincronización en tiempo real
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">🔍</span>
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre, email, teléfono, dirección o código..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="flex-1 px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all"
            />
          </div>
        </div>

        {usuariosFiltrados.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <div className="text-8xl mb-6">👤</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No se encontraron usuarios</h3>
            <p className="text-gray-500 text-lg">Intenta ajustar los términos de búsqueda</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {usuariosFiltrados.map((u) => (
              <div
                key={u.id}
                className="bg-white border-2 border-gray-100 rounded-2xl shadow-lg hover:shadow-2xl hover:border-blue-200 transition-all duration-300 cursor-pointer p-6 group hover:scale-105"
                onClick={() => setUsuarioSeleccionado(u)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") setUsuarioSeleccionado(u); }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                    {getInitials(u.displayName)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-gray-800 group-hover:text-blue-600 transition-colors">
                      {u.displayName || "Usuario Sin Nombre"}
                    </h3>
                    <p className="text-sm text-gray-500">ID: {u.id}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">📧 Email</p>
                    <p className="font-medium text-gray-800 text-sm break-all">{u.email || "No especificado"}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">📱 Teléfono</p>
                    <p className="font-medium text-gray-800">{u.telefono || "No especificado"}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">📍 Dirección</p>
                    <p className="font-medium text-gray-800 text-sm line-clamp-2">
                      {u.direccion || u.direccionCompleta || "No especificada"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      u.admin ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                    }`}>
                      {u.admin ? "🛡️ Admin" : "👤 Usuario"}
                    </span>
                    <span className="text-xs text-gray-400">
                      Click para ver detalles →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {usuarioSeleccionado && (
          <UsuarioFullView usuario={usuarioSeleccionado} onClose={() => setUsuarioSeleccionado(null)} />
        )}
      </div>
    </main>
  );
}
