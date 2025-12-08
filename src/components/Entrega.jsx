// src/components/Entrega.jsx
import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../firebase";
import { notify } from "../utils/notificationBus";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import {
  Home,
  Store,
  LocateFixed,
  Map as MapIcon,
  XCircle,
  Trash2,
  Pencil,
  Check,
  ChevronDown,
} from "lucide-react";
import "../styles/Entrega.css";

/* Provincias RD */
const provinciasRD = [
  "Distrito Nacional",
  "Santo Domingo",
  "Santiago",
  "La Vega",
  "Puerto Plata",
  "San Cristóbal",
  "Duarte",
  "La Romana",
  "San Pedro de Macorís",
  "Espaillat",
  "Hermanas Mirabal",
  "Monte Plata",
  "San Juan",
  "Azua",
  "Peravia",
  "Monseñor Nouel",
  "Barahona",
  "Sánchez Ramírez",
  "Valverde",
  "María Trinidad Sánchez",
  "Monte Cristi",
  "Samaná",
  "El Seibo",
  "Hato Mayor",
  "Independencia",
  "Pedernales",
  "Elías Piña",
  "Dajabón",
  "Baoruco",
];

const TIENDA_PLAYCENTER = {
  provincia: "Santiago",
  ciudad: "Santiago de los Caballeros",
  numeroCalle: "Av. Juan Pablo Duarte 68",
  direccionCompleta:
    "Playcenter Universal, Av. Juan Pablo Duarte 68, Santiago de los Caballeros 51000, República Dominicana",
  ubicacion: "https://maps.app.goo.gl/kszSTHedLYWCby1E7",
  metodoEntrega: "tienda",
};

/* ============================
   ProvinciaPicker (CENTRADO en viewport)
   - Siempre aparece en el centro (vertical + horizontal)
   - Usa portal y backdrop, z-index alto para que NADA lo tape
   ============================ */
function ProvinciaPicker({ abierto, onClose, onPick, valorActual }) {
  const [busqueda, setBusqueda] = useState("");

  const lista = useMemo(() => {
    if (!busqueda) return provinciasRD;
    const q = busqueda.toLowerCase();
    return provinciasRD.filter((p) => p.toLowerCase().includes(q));
  }, [busqueda]);

  useEffect(() => {
    if (!abierto) setBusqueda("");
  }, [abierto]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {abierto && (
        <>
          <motion.div
            className="prov-picker-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="prov-picker-modal"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="prov-dark-card">
              <div className="prov-dark-header">
                <h3 className="prov-dark-title">Seleccionar Provincia</h3>
                <button onClick={onClose} className="prov-close-white">
                  ✕
                </button>
              </div>
              <div className="prov-search-dark">
                <input
                  type="text"
                  placeholder="Buscar provincia..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="prov-input-dark"
                  autoFocus
                />
              </div>
              <div className="prov-list-dark">
                {lista.length > 0 ? (
                  lista.map((prov) => (
                    <div
                      key={prov}
                      className={`prov-item-dark ${
                        valorActual === prov ? "active" : ""
                      }`}
                      onClick={() => {
                        onPick(prov);
                        onClose();
                      }}
                    >
                      {prov}
                    </div>
                  ))
                ) : (
                  <div className="prov-empty-dark">
                    No se encontraron provincias
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default function Entrega({
  abierto,
  onClose,
  actualizarUsuarioInfo,
  actualizarLista,
  direccionEditar,
  usuarioId,
}) {
  const { uid, usuario } = useAuth();

  const [metodoEntrega, setMetodoEntrega] = useState("domicilio");
  const [direcciones, setDirecciones] = useState([]);
  const [loadingDirecciones, setLoadingDirecciones] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  const [provincia, setProvincia] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [sector, setSector] = useState("");
  const [numeroCalle, setNumeroCalle] = useState("");
  const [numeroCasa, setNumeroCasa] = useState("");
  const [telefono, setTelefono] = useState("");

  const [referencia, setReferencia] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [showVanAnimation, setShowVanAnimation] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [phoneError, setPhoneError] = useState("");

  const [pickerAbierto, setPickerAbierto] = useState(false);
  const formatoDireccionCompleta = (direccion) => direccion || "";

  const [ubicacion, setUbicacion] = useState("");
  const [coords, setCoords] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [tiendaActiva, setTiendaActiva] = useState(false);

  const fetchDirecciones = async () => {
    const currentUid = usuarioId || uid || usuario?.uid;
    if (!currentUid) {
      setDirecciones([]);
      return;
    }
    setLoadingDirecciones(true);
    try {
      const q = query(
        collection(db, "direcciones"),
        where("usuarioId", "==", currentUid)
      );
      const snap = await getDocs(q);
      const dirs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setDirecciones(dirs);
    } catch (err) {
      // console.error("fetchDirecciones error:", err);
      setDirecciones([]);
    } finally {
      setLoadingDirecciones(false);
    }
  };

  useEffect(() => {
    const currentUid = usuarioId || uid || usuario?.uid;
    if (abierto && currentUid) fetchDirecciones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, uid, usuario, usuarioId]);

  useEffect(() => {
    if (abierto) {
      fetchDirecciones();
      if (direccionEditar) {
        // Pre-fill form when editing
        setEditandoId(direccionEditar.id);
        setMetodoEntrega(direccionEditar.metodoEntrega || "domicilio");
        setProvincia(direccionEditar.provincia || "");
        setCiudad(direccionEditar.ciudad || "");
        setSector(direccionEditar.sector || "");
        setNumeroCalle(direccionEditar.numeroCalle || "");
        setNumeroCasa(direccionEditar.numeroCasa || "");
        setTelefono(direccionEditar.telefono || "");
        setReferencia(direccionEditar.referencia || "");
        setUbicacion(direccionEditar.ubicacion || "");
        setTiendaActiva(direccionEditar.metodoEntrega === "tienda");
      } else {
        // Clear form for new address
        setEditandoId(null);
        setMetodoEntrega("domicilio");
        setProvincia("");
        setCiudad("");
        setSector("");
        setNumeroCalle("");
        setNumeroCasa("");
        setTelefono("");
        setReferencia("");
        setUbicacion("");
        setCoords(null);
        setTiendaActiva(false);
      }
    }
  }, [abierto, direccionEditar]);

  // Handle Escape key to close modal and prevent body scroll
  useEffect(() => {
    if (!abierto) return;

    const handleEscape = (e) => {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
    };

    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [abierto, onClose]);

  const elegirMetodo = (m) => {
    if (m === "tienda") {
      setMetodoEntrega("tienda");
      setProvincia(TIENDA_PLAYCENTER.provincia);
      setCiudad(TIENDA_PLAYCENTER.ciudad);
      setNumeroCalle(TIENDA_PLAYCENTER.numeroCalle);
      setSector("");
      setNumeroCasa("");
      setReferencia("");
      setEditandoId(null);
      setUbicacion("");
      setCoords(null);
      setTiendaActiva(true);
      return;
    }

    if (m === "domicilio") {
      setMetodoEntrega("domicilio");
      if (tiendaActiva) {
        setProvincia("");
        setCiudad("");
        if (!editandoId) {
          setNumeroCalle("");
          setSector("");
          setNumeroCasa("");
          setReferencia("");
        }
        setTiendaActiva(false);
      }
      return;
    }

    setMetodoEntrega(m);
  };

  const armarDireccionDomicilio = () =>
    [
      numeroCalle,
      numeroCasa ? `Casa ${numeroCasa}` : "",
      sector,
      ciudad,
      provincia,
      referencia ? `Ref: ${referencia}` : "",
    ]
      .filter(Boolean)
      .join(", ")
      .trim();

  const handleGuardarDireccion = async () => {
    const currentUid = uid || usuario?.uid;
    // console.log("Auth check:", { uid, usuario: usuario?.uid, currentUid });

    if (!currentUid) {
      notify(
        "Error de autenticación. Recarga la página e intenta de nuevo.",
        "error",
        "Error de autenticación"
      );
      return;
    }
    setGuardando(true);
    try {
      if (metodoEntrega === "tienda") {
        if (!telefono || telefono.trim() === "") {
          setPhoneError(
            "El número de teléfono es obligatorio para recoger en tienda"
          );
          setGuardando(false);
          return;
        }

        const tiendaPayload = {
          direccion: formatoDireccionCompleta(
            TIENDA_PLAYCENTER.direccionCompleta
          ),
          metodoEntrega: "tienda",
          telefono: telefono,
          updatedAt: new Date(),
        };

        if (typeof actualizarUsuarioInfo === "function") {
          await actualizarUsuarioInfo({ ...tiendaPayload });
        }
        try {
          const currentUid = uid || usuario?.uid;
          if (currentUid) {
            await setDoc(doc(db, "users", currentUid), tiendaPayload, {
              merge: true,
            });
            await setDoc(doc(db, "usuarios", currentUid), tiendaPayload, {
              merge: true,
            });
          }
        } catch (err) {
          // console.warn("No se pudo persistir tiendaPayload en users/usuarios:", err);
        }

        if (onClose) onClose();
        if (typeof actualizarLista === "function") actualizarLista();
        setGuardando(false);
        return;
      }

      // Phone number validation for ALL delivery methods
      if (!telefono || telefono.trim() === "") {
        setPhoneError("El número de teléfono es obligatorio");
        setGuardando(false);
        return;
      }

      const tieneUbicacion = !!coords;
      if (!tieneUbicacion) {
        const dirFinalCheck = armarDireccionDomicilio();
        if (!dirFinalCheck) {
          notify(
            "Completa provincia, ciudad y calle/número.",
            "warning",
            "Campos requeridos"
          );
          setGuardando(false);
          return;
        }
      }

      const dirFinal = tieneUbicacion
        ? `${
            armarDireccionDomicilio() ? armarDireccionDomicilio() + ", " : ""
          }Ubicación: ${ubicacion} (${coords?.lat}, ${coords?.lon})`
        : armarDireccionDomicilio();

      const payload = {
        metodoEntrega: "domicilio",
        provincia: provincia || null,
        ciudad: ciudad || null,
        numeroCalle: numeroCalle || null,
        numeroCasa: numeroCasa || null,
        sector: sector || null,
        referencia: referencia || null,
        telefono: telefono || null,
        direccionCompleta: dirFinal,
        ubicacion: ubicacion || null,
        coords: coords || null,
        usuarioId: currentUid,
        updatedAt: new Date(),
      };

      if (editandoId) {
        const docRef = doc(db, "direcciones", editandoId);
        await updateDoc(docRef, { ...payload });
      } else {
        await addDoc(collection(db, "direcciones"), {
          ...payload,
          createdAt: new Date(),
        });
      }

      if (typeof actualizarUsuarioInfo === "function") {
        await actualizarUsuarioInfo({
          direccion: formatoDireccionCompleta(dirFinal),
          metodoEntrega: "domicilio",
        });
      }

      // Show van animation like Profile.jsx
      setShowVanAnimation(true);

      // Save phone number to profile as well
      const savePayload = {
        direccion: formatoDireccionCompleta(dirFinal),
        metodoEntrega: "domicilio",
        telefono: telefono,
        updatedAt: new Date(),
      };

      // Save to user profile collections
      try {
        await setDoc(doc(db, "users", currentUid), savePayload, {
          merge: true,
        });
      } catch (err) {
        // console.warn("No se pudo escribir users/{uid}:", err);
      }
      try {
        await setDoc(doc(db, "usuarios", currentUid), savePayload, {
          merge: true,
        });
      } catch (err) {
        // console.warn("No se pudo escribir usuarios/{uid}:", err);
      }

      // Also update user context if available
      if (typeof actualizarUsuarioInfo === "function") {
        await actualizarUsuarioInfo({
          telefono: telefono,
        });
      }

      await fetchDirecciones();
      if (typeof actualizarLista === "function") actualizarLista();

      setEditandoId(null);
      if (onClose) onClose();

      // Reload page immediately - animation covers the reload
      window.location.reload();
    } catch (err) {
      notify(
        `Error guardando dirección: ${err?.message || err}`,
        "error",
        "Error"
      );
    } finally {
      setGuardando(false);
    }
  };

  const handleSeleccionarDireccion = async (dir) => {
    try {
      const direccionCompleta =
        typeof dir === "string" ? dir : dir?.direccionCompleta || "";
      const metodo = dir && dir.metodoEntrega ? dir.metodoEntrega : "domicilio";
      const currentUid = uid || usuario?.uid;

      setShowVanAnimation(true);

      if (typeof actualizarUsuarioInfo === "function") {
        await actualizarUsuarioInfo({
          direccion: direccionCompleta,
          metodoEntrega: metodo,
          telefono: telefono,
        });
      }

      // Same Firestore operations as Profile.jsx
      const payload = {
        direccion: direccionCompleta,
        metodoEntrega: metodo,
        telefono: telefono,
        updatedAt: new Date(),
      };
      try {
        await setDoc(doc(db, "users", currentUid), payload, { merge: true });
      } catch (err) {
        // console.warn("No se pudo escribir users/{uid}:", err);
      }
      try {
        await setDoc(doc(db, "usuarios", currentUid), payload, { merge: true });
      } catch (err) {
        // console.warn("No se pudo escribir usuarios/{uid}:", err);
      }

      try {
        let snap = await getDoc(doc(db, "users", currentUid));
        if (!snap.exists())
          snap = await getDoc(doc(db, "usuarios", currentUid));
        if (snap && snap.exists()) {
          const data = snap.data() || {};
          if (typeof actualizarUsuarioInfo === "function") {
            await actualizarUsuarioInfo({
              direccion: data.direccion || direccionCompleta,
              metodoEntrega: data.metodoEntrega || metodo,
            });
          }
        }
      } catch (err) {
        // console.warn("No se pudo releer documento de usuario:", err);
      }

      await fetchDirecciones();
      if (typeof actualizarLista === "function") actualizarLista();

      if (onClose) onClose();

      // Reload page immediately - animation covers the reload
      window.location.reload();
    } catch (err) {
      setShowVanAnimation(false);
      notify(
        `Error seleccionando dirección: ${err?.message || err}`,
        "error",
        "Error"
      );
    }
  };

  const eliminarDireccion = async (id) => {
    try {
      await deleteDoc(doc(db, "direcciones", id));
      await fetchDirecciones();
      if (typeof actualizarLista === "function") actualizarLista();
      notify("Dirección eliminada correctamente.", "success", "Eliminada");
    } catch (err) {
      notify(
        `Error eliminando dirección: ${err?.message || err}`,
        "error",
        "Error"
      );
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

  const handleEliminarDireccion = (id) => {
    confirmarEliminar(id);
  };

  const comenzarEditar = (dir) => {
    if (!dir || dir.metodoEntrega === "tienda") return;
    setEditandoId(dir.id);
    setMetodoEntrega("domicilio");
    setProvincia(dir.provincia || "");
    setCiudad(dir.ciudad || "");
    setSector(dir.sector || "");
    setNumeroCalle(dir.numeroCalle || "");
    setNumeroCasa(dir.numeroCasa || "");
    setTelefono(dir.telefono || "");
    setReferencia(dir.referencia || "");
    setUbicacion(dir.ubicacion || "");
    setCoords(dir.coords || null);
    setTiendaActiva(false);
  };

  const agregarUbicacionActual = () => {
    if (!navigator.geolocation) {
      notify(
        "Geolocalización no soportada en este navegador.",
        "warning",
        "Advertencia"
      );
      return;
    }
    setGeoLoading(true);

    // Clear any cached position and force fresh location
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lon = pos.coords.longitude.toFixed(6);

        // Create direct Google Maps link with coordinates
        const googleMapsLink = `https://www.google.com/maps?q=${lat},${lon}`;

        // Set the location as the direct link
        setUbicacion(googleMapsLink);
        setCoords({ lat: lat, lon: lon });

        // Also update the street field with coordinates for easy reference
        setNumeroCalle(`${lat}, ${lon}`);

        setGeoLoading(false);
      },
      (err) => {
        // console.error("Error geolocalización:", err);
        let mensaje = "No se pudo obtener la ubicación.";

        switch (err.code) {
          case err.PERMISSION_DENIED:
            mensaje =
              "Permisos denegados. Haz clic en el candado 🔒 junto a la URL y permite la ubicación.";
            break;
          case err.POSITION_UNAVAILABLE:
            mensaje =
              "Ubicación no disponible. Asegúrate de estar conectado a internet y tener servicios de ubicación activados.";
            break;
          case err.TIMEOUT:
            mensaje = "Tiempo agotado. Intenta de nuevo.";
            break;
          default:
            mensaje = "Error desconocido. Verifica permisos del navegador.";
        }

        notify(mensaje, "error", "Error de ubicación");
        setGeoLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0, // Force fresh location, no cache
      }
    );
  };

  const quitarUbicacion = () => {
    setUbicacion("");
    setCoords(null);
    if (
      numeroCalle &&
      /^\s*-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?\s*$/.test(numeroCalle)
    ) {
      setNumeroCalle("");
    }
  };

  if (!abierto) return null;

  const direccionesUsuario = direcciones.filter(
    (d) => d.metodoEntrega !== "tienda"
  );

  return createPortal(
    <>
      {/* Backdrop */}
      <motion.div
        className="entrega-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Fullscreen Modal */}
      <motion.div
        className="entrega-slider"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="entrega-slider-content" aria-labelledby="entrega-title">
          {/* Drag Handle */}
          <div className="entrega-drag-handle" />
          <div className="entrega-header">
            <div className="entrega-header-content">
              <div className="entrega-icon-wrapper">
                <div className="entrega-icon">🚚</div>
              </div>
              <div className="entrega-title-section">
                <h3 id="entrega-title" className="entrega-title">
                  Método de entrega
                </h3>
                <p className="entrega-subtitle">
                  Elige cómo quieres recibir tu pedido
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="entrega-close-btn"
              aria-label="Cerrar"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="entrega-methods">
            <motion.button
              type="button"
              onClick={() => elegirMetodo("domicilio")}
              className={`method-card ${
                metodoEntrega === "domicilio" ? "active" : ""
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-pressed={metodoEntrega === "domicilio"}
            >
              <div className="method-icon domicilio-icon">
                <Home className="w-6 h-6" />
              </div>
              <div className="method-info">
                <h4 className="method-title">A domicilio</h4>
                <p className="method-desc">Entrega en tu dirección</p>
              </div>
              {metodoEntrega === "domicilio" && (
                <motion.div
                  className="method-check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                >
                  <Check className="w-5 h-5" />
                </motion.div>
              )}
            </motion.button>

            <motion.button
              type="button"
              onClick={() => elegirMetodo("tienda")}
              className={`method-card ${
                metodoEntrega === "tienda" ? "active" : ""
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-pressed={metodoEntrega === "tienda"}
            >
              <div className="method-icon tienda-icon">
                <Store className="w-6 h-6" />
              </div>
              <div className="method-info">
                <h4 className="method-title">Recoger en tienda</h4>
                <p className="method-desc">Playcenter Universal</p>
              </div>
              {metodoEntrega === "tienda" && (
                <motion.div
                  className="method-check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                >
                  <Check className="w-5 h-5" />
                </motion.div>
              )}
            </motion.button>
          </div>

          <AnimatePresence mode="wait">
            {metodoEntrega === "domicilio" && (
              <motion.button
                key="location-btn"
                type="button"
                onClick={agregarUbicacionActual}
                className={`location-btn ${geoLoading ? "loading" : ""}`}
                disabled={geoLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, height: 0, y: 10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{
                  duration: 0.3,
                  ease: [0.4, 0, 0.2, 1],
                }}
              >
                <LocateFixed
                  className={`w-5 h-5 ${geoLoading ? "animate-pulse" : ""}`}
                />
                <span>
                  {geoLoading
                    ? "Obteniendo ubicación..."
                    : "Usar mi ubicación actual"}
                </span>
              </motion.button>
            )}

            {metodoEntrega === "tienda" && (
              <motion.div
                key="tienda-form"
                className="tienda-phone-form"
                initial={{ opacity: 0, height: 0, y: 20 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -20 }}
                transition={{
                  duration: 0.4,
                  ease: [0.4, 0, 0.2, 1],
                  height: { duration: 0.4 },
                }}
              >
                <div className="form-group">
                  <label className="form-label">Teléfono de contacto *</label>
                  <input
                    type="tel"
                    placeholder="Ej: 809-555-1234"
                    value={telefono}
                    onChange={(e) => {
                      setTelefono(e.target.value);
                      if (phoneError) setPhoneError("");
                    }}
                    className="form-input"
                    required
                  />
                  {phoneError && (
                    <div className="phone-error-message">
                      <span>⚠️ {phoneError}</span>
                    </div>
                  )}
                  <p className="form-note">
                    📞 Te contactaremos cuando tu pedido esté listo para recoger
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="entrega-form">
            <AnimatePresence>
              {coords && (
                <motion.div
                  className="coords-display"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="coords-header">
                    <MapIcon className="w-5 h-5 text-green-600" />
                    <span className="coords-title">Ubicación detectada</span>
                    <button
                      onClick={quitarUbicacion}
                      className="coords-remove"
                      aria-label="Quitar ubicación"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="coords-info">
                    <div className="coord-item">
                      <span className="coord-label">Lat:</span>
                      <span className="coord-value">{coords.lat}</span>
                    </div>
                    <div className="coord-item">
                      <span className="coord-label">Lng:</span>
                      <span className="coord-value">{coords.lon}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {metodoEntrega === "domicilio" ? (
                <motion.div
                  key="domicilio-form"
                  className="address-form"
                  initial={{ opacity: 0, height: 0, y: 20 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -20 }}
                  transition={{
                    duration: 0.4,
                    ease: [0.4, 0, 0.2, 1],
                    height: { duration: 0.4 },
                  }}
                >
                  <div className="form-section">
                    <label className="form-label">Provincia *</label>
                    <button
                      type="button"
                      onClick={() => setPickerAbierto(true)}
                      className="province-selector"
                      aria-haspopup="dialog"
                      aria-expanded={pickerAbierto}
                    >
                      <span
                        className={`province-text ${
                          !provincia ? "placeholder" : ""
                        }`}
                      >
                        {provincia || "Selecciona tu provincia"}
                      </span>
                      <ChevronDown className="province-chevron" />
                    </button>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Ciudad *</label>
                      <input
                        placeholder="Ej: Santiago"
                        value={ciudad}
                        onChange={(e) => setCiudad(e.target.value)}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Sector</label>
                      <input
                        placeholder="Ej: Los Jardines"
                        value={sector}
                        onChange={(e) => setSector(e.target.value)}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Calle y número *</label>
                    <input
                      placeholder="Ej: Av. Juan Pablo Duarte #123"
                      value={numeroCalle}
                      onChange={(e) => setNumeroCalle(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Número de casa</label>
                      <input
                        placeholder="Ej: 45-B"
                        value={numeroCasa}
                        onChange={(e) => setNumeroCasa(e.target.value)}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Teléfono *</label>
                      <input
                        type="tel"
                        placeholder="Ej: 809-555-1234"
                        value={telefono}
                        onChange={(e) => {
                          setTelefono(e.target.value);
                          if (phoneError) setPhoneError("");
                        }}
                        className="form-input"
                        required
                      />
                      {phoneError && (
                        <div className="phone-error-message">
                          <span>⚠️ {phoneError}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Referencia</label>
                    <input
                      placeholder="Ej: Casa azul"
                      value={referencia}
                      onChange={(e) => setReferencia(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  {!coords && (
                    <div className="form-note">
                      💡 <strong>Tip:</strong> Usa "Mi ubicación actual" para
                      completar automáticamente las coordenadas
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="tienda-info"
                  className="store-info"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="store-header">
                    <Store className="w-6 h-6 text-orange-500" />
                    <h4 className="store-title">Playcenter Universal</h4>
                  </div>
                  <p className="store-address">
                    {TIENDA_PLAYCENTER.direccionCompleta}
                  </p>
                  <a
                    href={TIENDA_PLAYCENTER.ubicacion}
                    target="_blank"
                    rel="noreferrer"
                    className="store-map-link"
                  >
                    <MapIcon className="w-4 h-4" />
                    Ver en Google Maps
                  </a>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              onClick={handleGuardarDireccion}
              disabled={guardando}
              className={`save-btn ${guardando ? "loading" : ""}`}
              whileHover={{ scale: guardando ? 1 : 1.02 }}
              whileTap={{ scale: guardando ? 1 : 0.98 }}
            >
              {guardando ? (
                <>
                  <div className="loading-spinner" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>
                    {metodoEntrega === "tienda"
                      ? "Seleccionar Playcenter"
                      : editandoId
                      ? "Actualizar dirección"
                      : "Guardar dirección"}
                  </span>
                </>
              )}
            </motion.button>
          </div>

          <div className="saved-addresses">
            <h4 className="saved-title">Direcciones guardadas</h4>

            {loadingDirecciones ? (
              <div className="loading-state">
                <div className="loading-spinner" />
                <span>Cargando direcciones...</span>
              </div>
            ) : (
              <>
                {/* Playcenter Option */}
                <motion.div
                  className="address-card store-card"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="address-info">
                    <div className="address-header">
                      <Store className="w-5 h-5 text-orange-500" />
                      <span className="address-type">Recoger en tienda</span>
                    </div>
                    <p className="address-name">Playcenter Universal</p>
                    <p className="address-details">
                      {TIENDA_PLAYCENTER.direccionCompleta}
                    </p>
                    <a
                      href={TIENDA_PLAYCENTER.ubicacion}
                      target="_blank"
                      rel="noreferrer"
                      className="address-map-link"
                    >
                      <MapIcon className="w-4 h-4" />
                      Ver ubicación
                    </a>
                  </div>
                  <button
                    onClick={() =>
                      handleSeleccionarDireccion(TIENDA_PLAYCENTER)
                    }
                    className="address-select-btn store-select"
                  >
                    <Check className="w-4 h-4" />
                    Seleccionar
                  </button>
                </motion.div>

                {/* User Addresses */}
                <AnimatePresence>
                  {direccionesUsuario.length === 0 ? (
                    <motion.div
                      className="empty-state"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Home className="w-12 h-12 text-gray-300" />
                      <p className="empty-text">
                        No tienes direcciones guardadas
                      </p>
                      <p className="empty-subtext">
                        Agrega una dirección para entregas futuras
                      </p>
                    </motion.div>
                  ) : (
                    <div className="addresses-list">
                      {direccionesUsuario.map((dir, index) => (
                        <motion.div
                          key={dir.id}
                          className="address-card"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.01 }}
                        >
                          <div className="address-info">
                            <div className="address-header">
                              <Home className="w-5 h-5 text-blue-500" />
                              <span className="address-type">Domicilio</span>
                            </div>
                            <p className="address-details">
                              {dir.direccionCompleta}
                            </p>
                            {dir.ubicacion && (
                              <a
                                href={dir.ubicacion}
                                target="_blank"
                                rel="noreferrer"
                                className="address-map-link"
                              >
                                <MapIcon className="w-4 h-4" />
                                Ver ubicación
                              </a>
                            )}
                          </div>
                          <div className="address-actions">
                            <button
                              onClick={() => comenzarEditar(dir)}
                              className="address-action-btn edit-btn"
                              aria-label="Editar dirección"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleSeleccionarDireccion(dir)}
                              className="address-action-btn select-btn"
                              aria-label="Seleccionar dirección"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => confirmarEliminar(dir.id)}
                              className="address-action-btn delete-btn"
                              aria-label="Eliminar dirección"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Spinner Loading Animation with Dark Mode Support */}
      <AnimatePresence>
        {showVanAnimation && (
          <motion.div
            className="spinner-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="status"
            aria-live="polite"
          >
            <div className="spinner-container">
              <div className="spinner">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>
              <motion.div
                className="spinner-text"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Procesando entrega...
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 999999,
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                backgroundColor: "white",
                padding: "2rem",
                borderRadius: "12px",
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                maxWidth: "400px",
                width: "90%",
                textAlign: "center",
                zIndex: 9999999,
              }}
            >
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "600",
                  color: "#1f2937",
                  marginBottom: "1rem",
                }}
              >
                ¿Eliminar dirección?
              </h3>
              <p
                style={{
                  color: "#6b7280",
                  marginBottom: "2rem",
                  lineHeight: "1.5",
                }}
              >
                ¿Estás seguro que quieres eliminar esta dirección? Esta acción
                no se puede deshacer.
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  justifyContent: "center",
                }}
              >
                <button
                  onClick={cancelarEliminar}
                  style={{
                    padding: "0.75rem 1.5rem",
                    borderRadius: "8px",
                    border: "2px solid #e5e7eb",
                    backgroundColor: "white",
                    color: "#374151",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) =>
                    (e.target.style.backgroundColor = "#f9fafb")
                  }
                  onMouseOut={(e) => (e.target.style.backgroundColor = "white")}
                >
                  Cancelar
                </button>
                <button
                  onClick={procederEliminar}
                  style={{
                    padding: "0.75rem 1.5rem",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "#ef4444",
                    color: "white",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) =>
                    (e.target.style.backgroundColor = "#dc2626")
                  }
                  onMouseOut={(e) =>
                    (e.target.style.backgroundColor = "#ef4444")
                  }
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ProvinciaPicker
        abierto={pickerAbierto}
        onClose={() => setPickerAbierto(false)}
        onPick={(p) => setProvincia(p)}
        valorActual={provincia}
      />
    </>,
    document.body
  );
}
