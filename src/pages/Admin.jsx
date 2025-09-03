import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, doc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import "../styles/Admin.css";

// Colores base
const COLOR_PRIMARIO = "bg-blue-700";
const COLOR_SECUNDARIO = "bg-blue-100";
const COLOR_TEXTO = "text-blue-900";
const COLOR_TEXTO_HEADER = "text-white";
const COLOR_HEADER = "bg-blue-800";
const COLOR_BADGE = "bg-blue-200 text-blue-900";
const COLOR_BADGE_ADMIN = "bg-green-200 text-green-900";
const COLOR_BADGE_USER = "bg-blue-200 text-blue-900";

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

function UsuarioFullView({ usuario, onClose }) {
  const [compras, setCompras] = useState([]);
  const [loadingCompras, setLoadingCompras] = useState(true);
  const [usuarioData, setUsuarioData] = useState(usuario);

  // Sincronización en tiempo real de datos del usuario
  useEffect(() => {
    if (!usuario?.id) return;
    const unsubscribeUsers = onSnapshot(doc(db, "users", usuario.id), (docSnap) => {
      if (docSnap.exists()) {
        setUsuarioData(prev => ({ ...prev, ...docSnap.data() }));
      }
    });
    const unsubscribeUsuarios = onSnapshot(doc(db, "usuarios", usuario.id), (docSnap) => {
      if (docSnap.exists()) {
        setUsuarioData(prev => ({ ...prev, ...docSnap.data() }));
      }
    });
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
        return dateB - dateA;
      }));
      setLoadingCompras(false);
    }, () => {
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="fixed top-0 left-0 w-full h-full max-h-none !rounded-none !shadow-none bg-white overflow-y-auto flex flex-col"
        style={{ zIndex: 10000 }}
        onClick={e => e.stopPropagation()}
      >
        <header className={`flex justify-between items-center px-6 py-4 shadow ${COLOR_HEADER}`}>
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-blue-700/20 flex items-center justify-center text-2xl font-bold text-white">{getInitials(usuarioData.displayName)}</div>
            <div>
              <h2 className={`text-2xl font-bold ${COLOR_TEXTO_HEADER}`}>{usuarioData.displayName || "Usuario Sin Nombre"}</h2>
              <p className="text-blue-100 text-xs">ID: {usuarioData.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="w-10 h-10 rounded-full bg-white/30 hover:bg-white/50 flex items-center justify-center text-2xl font-bold text-blue-900 hover:scale-110 transition-all"
            style={{marginLeft: "auto"}}
          >
            ✕
          </button>
        </header>
        <div className="flex-1 px-2 sm:px-8 py-4 sm:py-8 space-y-7 bg-gray-50">
          {/* Información Personal */}
          <section className="bg-white rounded-xl border shadow p-4 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-700 font-bold">👤</span>
              </div>
              <h3 className={`text-xl font-bold ${COLOR_TEXTO}`}>Información Personal</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <InfoItem label="Nombre Completo" value={usuarioData.displayName || "No especificado"} />
              <InfoItem label="Email" value={usuarioData.email || "No especificado"} />
              <InfoItem label="Teléfono" value={usuarioData.telefono || "No especificado"} />
              <InfoItem label="Código de Usuario" value={usuarioData.codigo || "No asignado"} />
              <InfoItem label="Método de Entrega" value={usuarioData.metodoEntrega || "No especificado"} />
              <InfoItem label="Fecha de Registro" value={usuarioData.createdAt ? formatDate(usuarioData.createdAt) : "No disponible"} />
            </div>
            <div className="mt-6 flex items-center gap-4 flex-wrap">
              <span className={`px-4 py-2 rounded-full text-sm font-bold ${usuarioData.admin ? COLOR_BADGE_ADMIN : COLOR_BADGE_USER}`}>
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
          {/* Dirección y Ubicación */}
          <section className="bg-white rounded-xl border shadow p-4 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-700 font-bold">📍</span>
              </div>
              <h3 className={`text-xl font-bold ${COLOR_TEXTO}`}>Dirección y Ubicación</h3>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <h4 className="font-bold text-lg mb-3 text-blue-900">📍 Dirección Completa</h4>
              <p className="text-base text-blue-900 mb-4">{direccionTexto || "No se ha registrado dirección"}</p>
              {ubicacionLink && (
                <div className="flex flex-wrap gap-3">
                  <a
                    href={ubicacionLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                  >
                    🗺️ Ver en Google Maps
                  </a>
                  <div className="text-sm text-blue-800 bg-white rounded-lg px-3 py-2 border">
                    <span className="font-medium">Link:</span> {ubicacionLink}
                  </div>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <InfoItem label="Provincia" value={usuarioData.provincia || "No especificada"} />
              <InfoItem label="Ciudad" value={usuarioData.ciudad || "No especificada"} />
              <InfoItem label="Sector/Barrio" value={usuarioData.sector || "No especificado"} />
              <InfoItem label="Calle/Número" value={usuarioData.numeroCalle || "No especificada"} />
              <InfoItem label="Número de Casa" value={usuarioData.numeroCasa || "No especificado"} />
              <InfoItem label="Referencia" value={usuarioData.referencia || "No especificada"} />
            </div>
          </section>
          {/* Historial de Compras */}
          <section className="bg-white rounded-xl border shadow p-4 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-700 font-bold">🛒</span>
              </div>
              <h3 className={`text-xl font-bold ${COLOR_TEXTO}`}>Historial de Compras</h3>
              <span className="bg-blue-100 text-blue-900 px-3 py-1 rounded-full text-sm font-bold">
                {compras.length} {compras.length === 1 ? "compra" : "compras"}
              </span>
            </div>
            {loadingCompras ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
                <span className="ml-3 text-blue-700">Cargando historial...</span>
              </div>
            ) : compras.length === 0 ? (
              <div className="text-center py-12 bg-blue-50 rounded-xl">
                <div className="text-6xl mb-4">🛍️</div>
                <p className="text-xl text-blue-700 font-medium">No hay compras registradas</p>
                <p className="text-blue-400 mt-2">Este usuario aún no ha realizado ninguna compra</p>
              </div>
            ) : (
              <div className="space-y-4">
                {compras.map((c, index) => (
                  <div
                    key={c.id}
                    className="bg-blue-50 rounded-xl p-6 border border-blue-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-700">
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-bold text-lg text-blue-900">Orden: {c.id}</p>
                          <p className="text-sm text-blue-800">📅 {c.fecha ? formatDate(c.fecha) : "Sin fecha"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-900">RD${c.total ?? "0"}</p>
                          <p className="text-sm text-blue-800">{c.productos?.length || 0} productos</p>
                        </div>
                        {c.estado && (
                          <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                            c.estado === "completado" ? "bg-green-100 text-green-900" :
                            c.estado === "pendiente" ? "bg-yellow-100 text-yellow-800" :
                            c.estado === "cancelado" ? "bg-red-100 text-red-800" :
                            COLOR_BADGE
                          }`}>
                            {c.estado.charAt(0).toUpperCase() + c.estado.slice(1)}
                          </span>
                        )}
                      </div>
                    </div>
                    {c.productos && c.productos.length > 0 && (
                      <div className="bg-white rounded-lg p-4 border">
                        <h5 className="font-bold text-blue-900 mb-3">📦 Productos:</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {c.productos.map((p, i) => (
                            <div key={i} className="flex items-center justify-between bg-blue-50 rounded-lg p-3">
                              <div>
                                <p className="font-medium text-blue-900">{p.nombre || "Producto sin nombre"}</p>
                                <p className="text-sm text-blue-800">Cantidad: {p.cantidad || 1}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-blue-900">RD${p.precio || 0}</p>
                                <p className="text-xs text-blue-800">c/u</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {(c.metodoPago || c.direccionEntrega || c.notas) && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {c.metodoPago && (
                          <div className="bg-white rounded-lg p-3 border">
                            <p className="text-xs text-blue-700 mb-1">💳 Método de Pago</p>
                            <p className="font-medium text-blue-900">{c.metodoPago}</p>
                          </div>
                        )}
                        {c.direccionEntrega && (
                          <div className="bg-white rounded-lg p-3 border">
                            <p className="text-xs text-blue-700 mb-1">📍 Dirección de Entrega</p>
                            <p className="font-medium text-blue-900 text-sm">{c.direccionEntrega}</p>
                          </div>
                        )}
                        {c.notas && (
                          <div className="bg-white rounded-lg p-3 border">
                            <p className="text-xs text-blue-700 mb-1">📝 Notas</p>
                            <p className="font-medium text-blue-900 text-sm">{c.notas}</p>
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

function InfoItem({label, value}) {
  return (
    <div className="bg-blue-50 rounded-xl p-3">
      <p className="font-semibold text-blue-700 text-xs mb-1">{label}</p>
      <p className="text-base font-medium text-blue-900 break-all">{value}</p>
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
    const unsubscribeUsers = onSnapshot(query(collection(db, "users")), (snap) => {
      const usersData = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsuarios(prev => {
        const merged = [...usersData];
        prev.forEach(existingUser => {
          const index = merged.findIndex(u => u.id === existingUser.id);
          if (index >= 0) {
            merged[index] = { ...merged[index], ...existingUser };
          }
        });
        return merged;
      });
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
    });
    return () => {
      unsubscribeUsers();
      unsubscribeUsuarios();
    };
  }, [usuario]);

  if (!usuario) return <div className="flex items-center justify-center min-h-screen bg-blue-50">Inicia sesión</div>;
  if (usuario.uid !== ADMIN_UID) return <div className="flex items-center justify-center min-h-screen bg-blue-50">Sin acceso</div>;

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
    <main className="min-h-screen bg-blue-50 p-2 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-3 text-blue-900">
            Panel Administrativo
          </h1>
          <p className="text-base sm:text-xl text-blue-700 font-medium">Gestión Completa de Usuarios</p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
            <span className="bg-blue-100 text-blue-900 px-4 py-2 rounded-full text-sm font-bold">
              👥 {usuarios.length} {usuarios.length === 1 ? "usuario" : "usuarios"} registrados
            </span>
            <span className="bg-green-100 text-green-900 px-4 py-2 rounded-full text-sm font-bold">
              🔄 Sincronización en tiempo real
            </span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-xl p-3 sm:p-6 mb-8 border border-blue-100">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">🔍</span>
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre, email, teléfono, dirección o código..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="flex-1 px-4 py-3 text-base border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all"
            />
          </div>
        </div>
        {usuariosFiltrados.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg">
            <div className="text-7xl mb-6">👤</div>
            <h3 className="text-2xl font-bold text-blue-900 mb-2">No se encontraron usuarios</h3>
            <p className="text-blue-600 text-lg">Intenta ajustar los términos de búsqueda</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-4">
            {usuariosFiltrados.map((u) => (
              <div
                key={u.id}
                className="bg-white border-2 border-blue-100 rounded-xl shadow-sm hover:shadow-lg hover:border-blue-400 transition-all duration-200 cursor-pointer p-3 group flex flex-col items-center"
                onClick={() => setUsuarioSeleccionado(u)}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === "Enter") setUsuarioSeleccionado(u); }}
              >
                <div className="w-14 h-14 rounded-xl bg-blue-700 flex items-center justify-center text-2xl font-bold text-white mb-2 shadow">
                  {getInitials(u.displayName)}
                </div>
                <div className="w-full flex-1 flex flex-col items-center text-center">
                  <h3 className="font-bold text-base text-blue-900 truncate w-full">{u.displayName || "Usuario Sin Nombre"}</h3>
                  <p className="text-xs text-blue-700 break-all truncate w-full">ID: {u.id}</p>
                  <div className="mt-1 mb-2 w-full">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      u.admin ? COLOR_BADGE_ADMIN : COLOR_BADGE_USER
                    }`}>
                      {u.admin ? "🛡️ Admin" : "👤"}
                    </span>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-2 w-full mb-1">
                    <p className="text-xs text-blue-700 mb-1">📧 {u.email || "No email"}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-2 w-full mb-1">
                    <p className="text-xs text-blue-700">📱 {u.telefono || "No tel."}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-2 w-full mb-2">
                    <p className="text-xs text-blue-700 line-clamp-2">📍 {u.direccion || u.direccionCompleta || "No especificada"}</p>
                  </div>
                </div>
                <span className="text-xs text-blue-400">
                  Ver detalles →
                </span>
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