// src/components/Entrega.jsx
import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../firebase";
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
      alert("Error de autenticación. Recarga la página e intenta de nuevo.");
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
          alert("Completa provincia, ciudad y calle/número.");
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
      // console.error("handleGuardarDireccion error:", err);
      alert(`Error guardando dirección: ${err?.message || err}`);
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
      // console.error("handleSeleccionarDireccion error:", err);
      setShowVanAnimation(false);
      alert(`Error seleccionando dirección: ${err?.message || err}`);
    }
  };

  const eliminarDireccion = async (id) => {
    try {
      await deleteDoc(doc(db, "direcciones", id));
      await fetchDirecciones();
      if (typeof actualizarLista === "function") actualizarLista();
      alert("Dirección eliminada correctamente.");
    } catch (err) {
      // console.error("eliminarDireccion:", err);
      alert(`Error eliminando dirección: ${err?.message || err}`);
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
      alert("Geolocalización no soportada en este navegador.");
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

        alert(mensaje);
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

      {/* Modern Loading Animation with Dark Mode Support */}
      <AnimatePresence>
        {showVanAnimation && (
          <motion.div
            className="loaderOverlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="status"
            aria-live="polite"
          >
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
              <motion.div
                className="loaderText"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                ¡Dirección seleccionada!
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
