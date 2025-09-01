import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "firebase/auth";
import { subirImagenCloudinary } from "../utils/subirImagenCloudinary";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import Entrega from "../components/Entrega";
import "../styles/Profile.css";

/* =========================
   CONSTS & HELPERS
   ========================= */

const TIENDA_PLAYCENTER = {
  provincia: "Santiago",
  ciudad: "Santiago de los Caballeros",
  numeroCalle: "Av. Juan Pablo Duarte 68",
  direccionCompleta:
    "Playcenter Universal, Av. Juan Pablo Duarte 68, Santiago de los Caballeros 51000, República Dominicana",
  ubicacion: "https://maps.app.goo.gl/kszSTHedLYWCby1E7",
  metodoEntrega: "tienda",
};

const nameToInitial = (v = "") =>
  String(v || "").trim() ? String(v).trim().charAt(0).toUpperCase() : "?";
const stringToHexColor = (str = "") => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  const r = (hash >> 0) & 0xff;
  const g = (hash >> 8) & 0xff;
  const b = (hash >> 16) & 0xff;
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
};
const avatarDataUrl = (seed = "", size = 512) => {
  const initial = nameToInitial(seed);
  const bg = stringToHexColor(seed || initial);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'>
    <rect width='100%' height='100%' fill='${bg}' rx='${Math.floor(size * 0.12)}' />
    <text x='50%' y='50%' dy='.04em' font-family='Inter, system-ui, Arial' font-size='${Math.floor(
      size * 0.42
    )}' fill='#fff' text-anchor='middle' alignment-baseline='middle'>${initial}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const pageVariant = {
  hidden: { opacity: 0, y: 10 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.36, ease: [0.2, 0.8, 0.2, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.25 } },
};
const itemFade = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.26 } } };

function Icon({ name }) {
  const icons = {
    perfil: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    ),
    historial: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M21 12a9 9 0 1 1-3-6.7L21 7"></path>
        <path d="M12 7v6l4 2"></path>
      </svg>
    ),
    direcciones: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    ),
    logout: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <path d="M16 17l5-5-5-5"></path>
        <path d="M21 12H9"></path>
      </svg>
    ),
  };
  return <span className="icon">{icons[name]}</span>;
}

/* Loader: truck animation */
function Loader({ visible, text = "Cargando..." }) {
  if (!visible) return null;
  return (
    <div className="loaderOverlay" role="status" aria-live="polite">
      <div className="loaderInner">
        <div className="loader">
          <div className="truckWrapper">
            <div className="truckBody">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 198 93"
                className="trucksvg"
              >
                <path
                  strokeWidth="3"
                  stroke="#282828"
                  fill="#F83D3D"
                  d="M135 22.5H177.264C178.295 22.5 179.22 23.133 179.594 24.0939L192.33 56.8443C192.442 57.1332 192.5 57.4404 192.5 57.7504V89C192.5 90.3807 191.381 91.5 190 91.5H135C133.619 91.5 132.5 90.3807 132.5 89V25C132.5 23.6193 133.619 22.5 135 22.5Z"
                ></path>
                <path
                  strokeWidth="3"
                  stroke="#282828"
                  fill="#7D7C7C"
                  d="M146 33.5H181.741C182.779 33.5 183.709 34.1415 184.078 35.112L190.538 52.112C191.16 53.748 189.951 55.5 188.201 55.5H146C144.619 55.5 143.5 54.3807 143.5 53V36C143.5 34.6193 144.619 33.5 146 33.5Z"
                ></path>
                <path
                  strokeWidth="2"
                  stroke="#282828"
                  fill="#282828"
                  d="M150 65C150 65.39 149.763 65.8656 149.127 66.2893C148.499 66.7083 147.573 67 146.5 67C145.427 67 144.501 66.7083 143.873 66.2893C143.237 65.8656 143 65.39 143 65C143 64.61 143.237 64.1344 143.873 63.7107C144.501 63.2917 145.427 63 146.5 63C147.573 63 148.499 63.2917 149.127 63.7107C149.763 64.1344 150 64.61 150 65Z"
                ></path>
                <rect
                  strokeWidth="2"
                  stroke="#282828"
                  fill="#FFFCAB"
                  rx="1"
                  height="7"
                  width="5"
                  y="63"
                  x="187"
                ></rect>
                <rect
                  strokeWidth="2"
                  stroke="#282828"
                  fill="#282828"
                  rx="1"
                  height="11"
                  width="4"
                  y="81"
                  x="193"
                ></rect>
                <rect
                  strokeWidth="3"
                  stroke="#282828"
                  fill="#DFDFDF"
                  rx="2.5"
                  height="90"
                  width="121"
                  y="1.5"
                  x="6.5"
                ></rect>
                <rect
                  strokeWidth="2"
                  stroke="#282828"
                  fill="#DFDFDF"
                  rx="2"
                  height="4"
                  width="6"
                  y="84"
                  x="1"
                ></rect>
              </svg>
            </div>
            <div className="truckTires">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 30 30"
                className="tiresvg"
              >
                <circle
                  strokeWidth="3"
                  stroke="#282828"
                  fill="#282828"
                  r="13.5"
                  cy="15"
                  cx="15"
                ></circle>
                <circle fill="#DFDFDF" r="7" cy="15" cx="15"></circle>
              </svg>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 30 30"
                className="tiresvg"
              >
                <circle
                  strokeWidth="3"
                  stroke="#282828"
                  fill="#282828"
                  r="13.5"
                  cy="15"
                  cx="15"
                ></circle>
                <circle fill="#DFDFDF" r="7" cy="15" cx="15"></circle>
              </svg>
            </div>
            <div className="road"></div>
            <svg
              xmlSpace="preserve"
              viewBox="0 0 453.459 453.459"
              xmlns="http://www.w3.org/2000/svg"
              className="lampPost"
              fill="#000000"
            >
              <path
                d="M252.882,0c-37.781,0-68.686,29.953-70.245,67.358h-6.917v8.954c-26.109,2.163-45.463,10.011-45.463,19.366h9.993
c-1.65,5.146-2.507,10.54-2.507,16.017c0,28.956,23.558,52.514,52.514,52.514c28.956,0,52.514-23.558,52.514-52.514
c0-5.478-0.856-10.872-2.506-16.017h9.992c0-9.354-19.352-17.204-45.463-19.366v-8.954h-6.149C200.189,38.779,223.924,16,252.882,16
c29.952,0,54.32,24.368,54.32,54.32c0,28.774-11.078,37.009-25.105,47.437c-17.444,12.968-37.216,27.667-37.216,78.884v113.914
h-0.797c-5.068,0-9.174,4.108-9.174,9.177c0,2.844,1.293,5.383,3.321,7.066c-3.432,27.933-26.851,95.744-8.226,115.459v11.202h45.75
v-11.202c18.625-19.715-4.794-87.527-8.227-115.459c2.029-1.683,3.322-4.223,3.322-7.066c0-5.068-4.107-9.177-9.176-9.177h-0.795
V196.641c0-43.174,14.942-54.283,30.762-66.043c14.793-10.997,31.559-23.461,31.559-60.277C323.202,31.545,291.656,0,252.882,0z
M232.77,111.694c0,23.442-19.071,42.514-42.514,42.514c-23.442,0-42.514-19.072-42.514-42.514c0-5.531,1.078-10.957,3.141-16.017
h78.747C231.693,100.736,232.77,106.162,232.77,111.694z"
              ></path>
            </svg>
          </div>
        </div>
        <div className="loaderText">{text}</div>
      </div>
    </div>
  );
}

function ConfirmModal({ abierto, titulo, descripcion, onCancel, onConfirm, dangerText = "Confirmar" }) {
  if (!abierto) return null;
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <motion.div className="modal-card card" initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }}>
        <h3 id="modal-title" className="modal-title">{titulo}</h3>
        <p className="modal-desc">{descripcion}</p>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel}>Cancelar</button>
          <button className="btn btn-danger" onClick={onConfirm}>{dangerText}</button>
        </div>
      </motion.div>
    </div>
  );
}

/* =========================
   PROFILE PAGE
   ========================= */
export default function Profile() {
  const { usuario, usuarioInfo, actualizarUsuarioInfo, logout } = useAuth();
  const navigate = useNavigate();

  const [vista, setVista] = useState("perfil");
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ text: "", tipo: "" });

  const [form, setForm] = useState({
    nombre: usuario?.displayName || "",
    email: usuario?.email || "",
    telefono: "",
    direccion: "",
    fotoURL: usuario?.photoURL || "",
  });

  const [localFile, setLocalFile] = useState(null);
  const [localPreview, setLocalPreview] = useState(null);

  const [historial, setHistorial] = useState([]);
  const [direcciones, setDirecciones] = useState([]);
  const [modalEntregaOpen, setModalEntregaOpen] = useState(false);
  const [direccionEditar, setDireccionEditar] = useState(null);

  const [confirmRemoveImageOpen, setConfirmRemoveImageOpen] = useState(false);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [showFullLoader, setShowFullLoader] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  useEffect(() => {
    if (usuarioInfo) {
      setForm((p) => ({
        ...p,
        telefono: usuarioInfo.telefono || "",
        direccion: usuarioInfo.direccion || "",
        fotoURL: usuarioInfo.fotoURL || usuario?.photoURL || "",
      }));
    } else {
      setForm((p) => ({ ...p, fotoURL: usuario?.photoURL || "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuarioInfo, usuario?.photoURL]);

  useEffect(() => {
    if (!usuario) return;
    fetchHistorial();
    fetchDirecciones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario]);

  const fetchHistorial = async () => {
    try {
      const q = query(collection(db, "orders"), where("userId", "==", usuario.uid));
      const snap = await getDocs(q);
      setHistorial(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("fetchHistorial:", err);
    }
  };

  const fetchDirecciones = async () => {
    try {
      const q = query(collection(db, "direcciones"), where("usuarioId", "==", usuario.uid));
      const snap = await getDocs(q);
      setDirecciones(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("fetchDirecciones:", err);
    }
  };

  const avatarSrc = useMemo(() => {
    if (localPreview) return localPreview;
    if (form.fotoURL) return form.fotoURL;
    const fallback = form.nombre || form.email || usuario?.email || "U";
    return avatarDataUrl(fallback, 512);
  }, [localPreview, form.fotoURL, form.nombre, form.email, usuario?.email]);

  const publicName = useMemo(() => {
    if (form.nombre && form.nombre.trim()) return form.nombre;
    const e = form.email || usuario?.email || "";
    const local = e.split("@")[0] || "Usuario";
    return local.charAt(0).toUpperCase() + local.slice(1);
  }, [form.nombre, form.email, usuario?.email]);

  const toast = (text, tipo = "info", ms = 3500) => {
    setMensaje({ text, tipo });
    if (ms) setTimeout(() => setMensaje({ text: "", tipo: "" }), ms);
  };

  const handleLogout = async () => {
    try {
      setConfirmLogoutOpen(false);
      await logout();
      navigate("/");
    } catch (err) {
      console.error("logout:", err);
      toast("Error cerrando sesión.", "error", 5000);
    }
  };

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setLocalFile(f);
    const url = URL.createObjectURL(f);
    setLocalPreview(url);
  };

  const cancelLocalPreview = () => {
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalFile(null);
    setLocalPreview(null);
  };

  const uploadLocalImage = async () => {
    if (!localFile) return toast("Selecciona una imagen primero.", "error");
    setLoading(true);
    try {
      const url = await subirImagenCloudinary(localFile);
      await actualizarUsuarioInfo({ fotoURL: url });
      await updateProfile(usuario, { photoURL: url });
      setForm((p) => ({ ...p, fotoURL: url }));
      cancelLocalPreview();
      toast("Foto actualizada.", "success");
    } catch (err) {
      console.error("uploadLocalImage:", err);
      toast("Error subiendo imagen.", "error", 5000);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      // Actualizar información en Firestore incluyendo displayName
      await actualizarUsuarioInfo({ 
        telefono: form.telefono, 
        direccion: form.direccion,
        displayName: form.nombre  // Agregar displayName a Firestore
      });
      
      // Actualizar displayName en Firebase Auth si cambió
      const cambios = {};
      if (usuario.displayName !== form.nombre) cambios.displayName = form.nombre;
      if (Object.keys(cambios).length) await updateProfile(usuario, cambios);
      
      setEditMode(false);
      toast("Perfil guardado.", "success");
    } catch (err) {
      console.error("Error guardando perfil:", err);
      toast("Error guardando perfil.", "error");
    } finally {
      setLoading(false);
    }
  };

  const confirmRemoveImage = async () => {
    setLoading(true);
    try {
      await updateProfile(usuario, { photoURL: "" });
      await actualizarUsuarioInfo({ fotoURL: "" });
      setForm((p) => ({ ...p, fotoURL: "" }));
      cancelLocalPreview();
      toast("Imagen de perfil removida.", "success");
    } catch (err) {
      console.error("confirmRemoveImage:", err);
      toast("Error removiendo imagen.", "error");
    } finally {
      setLoading(false);
      setConfirmRemoveImageOpen(false);
    }
  };

  const handleSeleccionarDireccion = async (dir) => {
    try {
      const direccionCompleta = typeof dir === "string" ? dir : dir?.direccionCompleta || "";
      const metodo = dir && dir.metodoEntrega ? dir.metodoEntrega : "domicilio";

      setShowFullLoader(true);

      await actualizarUsuarioInfo({
        direccion: direccionCompleta,
        metodoEntrega: metodo,
      });

      const payload = { direccion: direccionCompleta, metodoEntrega: metodo, updatedAt: new Date() };
      try {
        await setDoc(doc(db, "users", usuario.uid), payload, { merge: true });
      } catch (err) {
        console.warn("No se pudo escribir users/{uid}:", err);
      }
      try {
        await setDoc(doc(db, "usuarios", usuario.uid), payload, { merge: true });
      } catch (err) {
        console.warn("No se pudo escribir usuarios/{uid}:", err);
      }

      try {
        let snap = await getDoc(doc(db, "users", usuario.uid));
        if (!snap.exists()) snap = await getDoc(doc(db, "usuarios", usuario.uid));
        if (snap && snap.exists()) {
          const data = snap.data() || {};
          await actualizarUsuarioInfo({
            direccion: data.direccion || direccionCompleta,
            metodoEntrega: data.metodoEntrega || metodo,
          });
        }
      } catch (err) {
        console.warn("No se pudo releer documento de usuario:", err);
      }

      if (modalEntregaOpen) setModalEntregaOpen(false);
      await fetchDirecciones();
      setForm((p) => ({ ...p, direccion: direccionCompleta }));

      toast("Dirección seleccionada y guardada.", "success");
      
      // Reload page immediately - animation covers the reload
      window.location.reload();
    } catch (err) {
      console.error("handleSeleccionarDireccion error:", err);
      setShowFullLoader(false);
      toast("Error seleccionando dirección.", "error", 5000);
    }
  };

  const eliminarDireccion = async (id) => {
    try {
      await deleteDoc(doc(db, "direcciones", id));
      await fetchDirecciones();
      toast("Dirección eliminada correctamente.", "success");
    } catch (err) {
      console.error("eliminarDireccion:", err);
      toast("Error eliminando dirección.", "error");
    }
  };

  const confirmarEliminar = (id) => {
    setDeleteTargetId(id);
    setShowDeleteConfirm(true);
  };

  const cancelarEliminar = () => {
    setShowDeleteConfirm(false);
    setDeleteTargetId(null);
  };

  const procederEliminar = () => {
    if (deleteTargetId) {
      eliminarDireccion(deleteTargetId);
      setShowDeleteConfirm(false);
      setDeleteTargetId(null);
    }
  };

  if (!usuario || !usuarioInfo) {
    return (
      <main className="min-h-screen flex items-start justify-center bg-slate-50 pt-28">
        <p className="text-lg animate-pulse">Cargando perfil...</p>
      </main>
    );
  }

  return (
    <motion.main className="profile-page" variants={pageVariant} initial="hidden" animate="enter" exit="exit">
      {/* NAVEGACIÓN SEPARADA */}
      <div className="navigation-container">
        <nav className="profile-dock" aria-label="Navegación de perfil">
          <button
            className={`dock-btn ${vista === "perfil" ? "active" : ""}`}
            onClick={() => setVista("perfil")}
            aria-label="Perfil"
          >
            <Icon name="perfil" />
            <span>Perfil</span>
          </button>

          <button
            className={`dock-btn ${vista === "historial" ? "active" : ""}`}
            onClick={() => setVista("historial")}
            aria-label="Historial"
          >
            <Icon name="historial" />
            <span>Historial</span>
          </button>

          <button
            className={`dock-btn ${vista === "direcciones" ? "active" : ""}`}
            onClick={() => setVista("direcciones")}
            aria-label="Direcciones"
          >
            <Icon name="direcciones" />
            <span>Direcciones</span>
          </button>

          <button
            className="dock-btn danger"
            onClick={() => setConfirmLogoutOpen(true)}
            aria-label="Cerrar sesión"
          >
            <Icon name="logout" />
            <span>Salir</span>
          </button>
        </nav>
      </div>

      {/* CONTENIDO SEPARADO */}
      <main className="main-content">
        <div className="main-card">

          <AnimatePresence mode="wait">
            {vista === "perfil" && (
              <motion.section key="perfil" variants={itemFade} initial="hidden" animate="show" exit="hidden">
                <div className="profile-header big">
                  <div className="avatar-block large">
                    <img src={avatarSrc} alt="Avatar" className="avatar-img" />
                  </div>
                  <div className="profile-meta big">
                    <h1 className="profile-name">{publicName}</h1>
                    <p className="profile-email">{form.email}</p>
                    <p className="muted small">
                      UID: <span className="mono">{usuario.uid}</span>
                    </p>

                    <div className="profile-actions">
                      <label className="btn btn-primary upload-btn">
                        Subir foto
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleFile}
                          className="hidden"
                          aria-label="Subir foto"
                        />
                      </label>
                      <button
                        className="btn btn-ghost"
                        onClick={() => setConfirmRemoveImageOpen(true)}
                      >
                        Quitar
                      </button>
                      {localPreview && (
                        <>
                          <button className="btn btn-success" onClick={uploadLocalImage} disabled={loading}>
                            Guardar foto
                          </button>
                          <button className="btn btn-outline" onClick={cancelLocalPreview}>
                            Cancelar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-grid big">
                  <div className="form-row">
                    <label>Nombre</label>
                    <input name="nombre" value={form.nombre} onChange={handleChange} disabled={!editMode} />
                  </div>
                  <div className="form-row">
                    <label>Email</label>
                    <input name="email" value={form.email} disabled />
                  </div>
                  <div className="form-row">
                    <label>Teléfono</label>
                    <input name="telefono" value={form.telefono} onChange={handleChange} disabled={!editMode} />
                  </div>
                  <div className="form-row full">
                    <label>Dirección completa</label>
                    <textarea name="direccion" value={form.direccion} onChange={handleChange} disabled={!editMode} rows={4} />
                    <p className="muted hint">Pulsa "Editar" para modificar.</p>
                  </div>

                  <div className="form-actions">
                    {!editMode ? (
                      <button onClick={() => setEditMode(true)} className="btn btn-primary">Editar perfil</button>
                    ) : (
                      <>
                        <button onClick={saveProfile} className="btn btn-success" disabled={loading}>Guardar</button>
                        <button onClick={() => { setEditMode(false); cancelLocalPreview(); }} className="btn btn-ghost">Cancelar</button>
                      </>
                    )}
                  </div>
                </div>
                </motion.section>
              )}

              {vista === "historial" && (
                <motion.section key="historial" variants={itemFade} initial="hidden" animate="show" exit="hidden">
                  <h2 className="section-title large">Historial de compras</h2>
                  <div className="cards-list">
                    {historial.length === 0 ? (
                      <div className="empty">No hay compras registradas.</div>
                    ) : (
                      historial.map((h) => (
                        <div key={h.id} className="order-card large">
                          <div className="order-left">
                            <div className="order-status">{h.estado || "Pendiente"}</div>
                            <div className="muted">
                              {h.fecha?.seconds ? new Date(h.fecha.seconds * 1000).toLocaleDateString() : "Sin fecha"}
                            </div>
                          </div>
                          <div className="order-right">
                            <div className="order-total">RD${h.total ?? "?"}</div>
                            <div className="muted">{h.productos?.length ?? 0} items</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.section>
              )}

              {vista === "direcciones" && (
                <motion.section key="direcciones" variants={itemFade} initial="hidden" animate="show" exit="hidden">
                  <div className="direcciones-head">
                    <h2 className="section-title large">Direcciones</h2>
                    <div>
                      <button
                        className="btn btn-primary"
                        onClick={() => { setDireccionEditar(null); setModalEntregaOpen(true); }}
                      >
                        Añadir dirección
                      </button>
                    </div>
                  </div>

                  <div className="cards-list">
                    <div className="address-card large">
                      <div className="address-content">
                        <div className="address-title">Recoger en: Playcenter Universal Santiago</div>
                        <div className="muted break-words">{TIENDA_PLAYCENTER.direccionCompleta}</div>
                        <a href={TIENDA_PLAYCENTER.ubicacion} target="_blank" rel="noreferrer" className="link">Ver en Maps</a>
                      </div>
                      <div className="address-actions">
                        <button onClick={() => handleSeleccionarDireccion(TIENDA_PLAYCENTER)} className="btn btn-success">Seleccionar</button>
                      </div>
                    </div>

                    {direcciones.length === 0 ? (
                      <div className="empty">No tienes direcciones guardadas.</div>
                    ) : (
                      direcciones.map((d) => (
                        <div key={d.id} className="address-card large">
                          <div className="address-content">
                            <div className="address-title break-words">
                              {d.direccionCompleta || `${d.numeroCalle || ""} ${d.numeroCasa ? "Casa " + d.numeroCasa : ""}, ${d.ciudad || ""}, ${d.provincia || ""}`}
                            </div>
                            <div className="muted">Método: {d.metodoEntrega || "domicilio"}</div>
                            {d.referencia && <div className="muted">Ref: {d.referencia}</div>}
                            {d.ubicacion && <a href={d.ubicacion} target="_blank" rel="noreferrer" className="link">Ver en Maps</a>}
                          </div>

                          <div className="address-actions">
                            <button onClick={() => { setDireccionEditar(d); setModalEntregaOpen(true); }} className="btn btn-ghost">Editar</button>
                            <button onClick={() => handleSeleccionarDireccion(d)} className="btn btn-success">Seleccionar</button>
                            <button onClick={() => confirmarEliminar(d.id)} className="btn btn-danger">Eliminar</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {modalEntregaOpen && (
                    <Entrega
                      abierto={modalEntregaOpen}
                      onClose={async () => { setModalEntregaOpen(false); setDireccionEditar(null); await fetchDirecciones(); }}
                      usuarioId={usuario.uid}
                      direccionEditar={direccionEditar}
                      actualizarLista={fetchDirecciones}
                    />
                  )}
                </motion.section>
              )}
            </AnimatePresence>
        </div>
      </main>

      {/* Modales y loader */}
      <ConfirmModal
        abierto={confirmRemoveImageOpen}
        titulo="Quitar imagen de perfil"
        descripcion="Se quitará la URL de tu perfil (no borra el archivo en Cloudinary)."
        onCancel={() => setConfirmRemoveImageOpen(false)}
        onConfirm={confirmRemoveImage}
        dangerText="Quitar imagen"
      />

      <ConfirmModal
        abierto={confirmLogoutOpen}
        titulo="Cerrar sesión"
        descripcion="¿Estás seguro que quieres cerrar sesión?"
        onCancel={() => setConfirmLogoutOpen(false)}
        onConfirm={handleLogout}
        dangerText="Cerrar sesión"
      />

      <Loader visible={showFullLoader} text="Guardando..." />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 999999
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                maxWidth: '400px',
                width: '90%',
                textAlign: 'center',
                zIndex: 9999999
              }}
            >
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '1rem'
              }}>
                ¿Eliminar dirección?
              </h3>
              <p style={{
                color: '#6b7280',
                marginBottom: '2rem',
                lineHeight: '1.5'
              }}>
                ¿Estás seguro que quieres eliminar esta dirección? Esta acción no se puede deshacer.
              </p>
              <div style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center'
              }}>
                <button
                  onClick={cancelarEliminar}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb',
                    backgroundColor: 'white',
                    color: '#374151',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#f9fafb'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                >
                  Cancelar
                </button>
                <button
                  onClick={procederEliminar}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {mensaje.text && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`toast ${
            mensaje.tipo === "success" ? "toast-success" : mensaje.tipo === "error" ? "toast-error" : "toast-info"
          }`}
        >
          {mensaje.text}
        </motion.div>
      )}
    </motion.main>
  );
}
