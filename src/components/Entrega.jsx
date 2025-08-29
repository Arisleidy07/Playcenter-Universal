// src/components/Entrega.jsx
import React, { useState, useEffect, useMemo } from "react";
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
} from "lucide-react";

/* =====================
   Provincias RD
   ===================== */
const provinciasRD = [
  "Distrito Nacional", "Santo Domingo", "Santiago", "La Vega",
  "Puerto Plata", "San Cristóbal", "Duarte", "La Romana",
  "San Pedro de Macorís", "Espaillat", "Hermanas Mirabal", "Monte Plata",
  "San Juan", "Azua", "Peravia", "Monseñor Nouel", "Barahona",
  "Sánchez Ramírez", "Valverde", "María Trinidad Sánchez", "Monte Cristi",
  "Samaná", "El Seibo", "Hato Mayor", "Independencia", "Pedernales",
  "Elías Piña", "Dajabón", "Baoruco"
];

/* =====================
   Playcenter fijo
   ===================== */
const TIENDA_PLAYCENTER = {
  provincia: "Santiago",
  ciudad: "Santiago de los Caballeros",
  numeroCalle: "Av. Juan Pablo Duarte 68",
  direccionCompleta:
    "Playcenter Universal, Av. Juan Pablo Duarte 68, Santiago de los Caballeros 51000, República Dominicana",
  ubicacion: "https://maps.app.goo.gl/kszSTHedLYWCby1E7",
  metodoEntrega: "tienda",
};

/* =====================
   ProvinciaPicker (bottom sheet / slider)
   ===================== */
function ProvinciaPicker({ abierto, onClose, onPick, valorActual }) {
  const [busqueda, setBusqueda] = useState("");

  const lista = useMemo(() => {
    if (!busqueda) return provinciasRD;
    const q = busqueda.toLowerCase();
    return provinciasRD.filter(p => p.toLowerCase().includes(q));
  }, [busqueda]);

  return (
    <AnimatePresence>
      {abierto && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed z-[101] left-0 right-0 bottom-0 md:inset-0 md:m-auto md:max-w-xl"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
          >
            <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-xl p-4 max-h-[80vh] overflow-hidden">
              <div className="h-1.5 w-14 bg-gray-300 rounded-full mx-auto mb-3 md:hidden" />
              <div className="flex items-center justify-between">
                <h4 className="text-base font-semibold">Seleccionar provincia</h4>
                <button onClick={onClose} className="text-gray-600 hover:text-black text-xl">✕</button>
              </div>

              <div className="mt-3">
                <input
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Buscar provincia..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>

              <div className="mt-3 overflow-y-auto" style={{ maxHeight: "60vh" }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {lista.map((p) => {
                    const activo = p === valorActual;
                    return (
                      <button
                        key={p}
                        onClick={() => { onPick(p); onClose(); }}
                        className={`text-left px-4 py-3 rounded-xl border transition ${activo ? "border-sky-500 bg-sky-50" : "border-gray-200 hover:bg-gray-50"}`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
                {lista.length === 0 && <p className="text-sm text-gray-500 mt-4">No hay coincidencias.</p>}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* =====================
   Componente principal Entrega
   ===================== */
/**
 * Props:
 * - abierto
 * - onClose
 * - usuarioId
 * - direccionEditar (opcional)
 * - actualizarLista (opcional)
 */
export default function Entrega({
  abierto,
  onClose,
  usuarioId: usuarioIdProp,
  direccionEditar = null,
  actualizarLista = null,
}) {
  const { usuario, actualizarUsuarioInfo } = useAuth();
  const uid = usuarioIdProp || usuario?.uid;

  // Estados
  const [direcciones, setDirecciones] = useState([]);
  const [loadingDirecciones, setLoadingDirecciones] = useState(false);

  const [editandoId, setEditandoId] = useState(null);
  const [metodoEntrega, setMetodoEntrega] = useState("domicilio");
  const [provincia, setProvincia] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [sector, setSector] = useState("");
  const [numeroCalle, setNumeroCalle] = useState("");
  const [numeroCasa, setNumeroCasa] = useState("");
  const [referencia, setReferencia] = useState("");
  const [guardando, setGuardando] = useState(false);

  // picker
  const [pickerAbierto, setPickerAbierto] = useState(false);

  const resumenDireccion = (direccion) => {
    if (!direccion) return "";
    return direccion.length > 40 ? direccion.slice(0, 37) + "..." : direccion;
  };

  // geoloc (solo para UI)
  const [ubicacion, setUbicacion] = useState("");
  const [geoLoading, setGeoLoading] = useState(false);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  // bandera para saber si pusimos los datos de la tienda para no "pegarlos" al volver a domicilio
  const [tiendaActiva, setTiendaActiva] = useState(false);

  /* Fetch direcciones (todas del usuario) */
  const fetchDirecciones = async () => {
    if (!uid) {
      setDirecciones([]);
      return;
    }
    setLoadingDirecciones(true);
    try {
      const q = query(collection(db, "direcciones"), where("usuarioId", "==", uid));
      const snap = await getDocs(q);
      const dirs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setDirecciones(dirs);
    } catch (err) {
      console.error("fetchDirecciones error:", err);
      setDirecciones([]);
    } finally {
      setLoadingDirecciones(false);
    }
  };

  useEffect(() => {
    if (abierto && uid) fetchDirecciones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, uid]);

  // Si se abre con direccionEditar, precargamos el formulario
  useEffect(() => {
    if (direccionEditar && abierto) {
      setEditandoId(direccionEditar.id || null);
      setMetodoEntrega(direccionEditar.metodoEntrega || "domicilio");
      setProvincia(direccionEditar.provincia || "");
      setCiudad(direccionEditar.ciudad || "");
      setSector(direccionEditar.sector || "");
      setNumeroCalle(direccionEditar.numeroCalle || "");
      setNumeroCasa(direccionEditar.numeroCasa || "");
      setReferencia(direccionEditar.referencia || "");
      setUbicacion(direccionEditar.ubicacion || "");
      setLatitude(direccionEditar.latitude != null ? String(direccionEditar.latitude) : "");
      setLongitude(direccionEditar.longitude != null ? String(direccionEditar.longitude) : "");
      setTiendaActiva(direccionEditar.metodoEntrega === "tienda");
    }
    if (!direccionEditar && abierto) {
      // limpiar formularios al abrir para crear nueva
      setEditandoId(null);
      setMetodoEntrega("domicilio");
      setProvincia("");
      setCiudad("");
      setSector("");
      setNumeroCalle("");
      setNumeroCasa("");
      setReferencia("");
      setUbicacion("");
      setLatitude("");
      setLongitude("");
      setTiendaActiva(false);
    }
  }, [direccionEditar, abierto]);

  /* Elegir método */
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
      setLatitude("");
      setLongitude("");
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

  /* Armar dirección de domicilio desde campos */
  const armarDireccionDomicilio = () => {
    return [
      numeroCalle,
      numeroCasa ? `Casa ${numeroCasa}` : "",
      sector,
      ciudad,
      provincia,
      referencia ? `Ref: ${referencia}` : ""
    ].filter(Boolean).join(", ").trim();
  };

  /* Guardar o actualizar dirección */
  const handleGuardarDireccion = async () => {
    if (!uid) {
      alert("Usuario no detectado.");
      return;
    }

    setGuardando(true);
    try {
      if (metodoEntrega === "tienda") {
        await actualizarUsuarioInfo({
          direccion: resumenDireccion(TIENDA_PLAYCENTER.direccionCompleta),
          metodoEntrega: "tienda",
        });
        if (onClose) onClose();
        if (typeof actualizarLista === "function") actualizarLista();
        setGuardando(false);
        return;
      }

      const tieneCoords = (latitude && longitude) || (ubicacion && /q=/.test(ubicacion));
      if (!tieneCoords) {
        const dirFinalCheck = armarDireccionDomicilio();
        if (!provincia || !ciudad || !numeroCalle || !dirFinalCheck) {
          alert("Completa provincia, ciudad y calle/número.");
          setGuardando(false);
          return;
        }
      }

      let lat = latitude || null;
      let lon = longitude || null;
      if ((!lat || !lon) && ubicacion) {
        const qMatch = ubicacion.match(/[?&]q=([+-]?\d+(\.\d+)?),([+-]?\d+(\.\d+)?)/);
        const atMatch = ubicacion.match(/@([+-]?\d+(\.\d+)?),([+-]?\d+(\.\d+)?)/);
        if (qMatch) {
          lat = qMatch[1];
          lon = qMatch[3];
        } else if (atMatch) {
          lat = atMatch[1];
          lon = atMatch[3];
        }
      }

      let dirFinal;
      if (tieneCoords) {
        const parts = [];
        if (provincia) parts.push(provincia);
        if (ciudad) parts.push(ciudad);
        if (numeroCalle) parts.push(numeroCalle);
        parts.push(`Coordenadas: ${lat || (ubicacion ? ubicacion : "ver ubicación")}`);
        dirFinal = parts.join(", ");
      } else {
        dirFinal = armarDireccionDomicilio();
      }

      const payload = {
        metodoEntrega: "domicilio",
        provincia: provincia || null,
        ciudad: ciudad || null,
        numeroCalle: numeroCalle || null,
        numeroCasa: numeroCasa || null,
        sector: sector || null,
        referencia: referencia || null,
        direccionCompleta: dirFinal,
        ubicacion: ubicacion || null,
        latitude: lat ? Number(lat) : null,
        longitude: lon ? Number(lon) : null,
        usuarioId: uid,
        updatedAt: new Date(),
      };

      if (editandoId) {
        const docRef = doc(db, "direcciones", editandoId);
        await updateDoc(docRef, { ...payload });
      } else {
        await addDoc(collection(db, "direcciones"), { ...payload, createdAt: new Date() });
      }

      await actualizarUsuarioInfo({
        direccion: resumenDireccion(dirFinal),
        metodoEntrega: "domicilio",
      });

      await fetchDirecciones();
      if (typeof actualizarLista === "function") actualizarLista();

      setEditandoId(null);
      if (onClose) onClose();
    } catch (err) {
      console.error("handleGuardarDireccion error:", err);
      alert(`Error guardando dirección: ${err?.message || err}`);
    } finally {
      setGuardando(false);
    }
  };

  /* Seleccionar dirección (refleja en perfil y cierra) */
  const handleSeleccionarDireccion = async (dir) => {
    try {
      await actualizarUsuarioInfo({
        direccion: resumenDireccion(dir.direccionCompleta),
        metodoEntrega: dir.metodoEntrega || "domicilio",
      });
      if (onClose) onClose();
      if (typeof actualizarLista === "function") actualizarLista();
    } catch (err) {
      console.error("handleSeleccionarDireccion error:", err);
      alert(`Error seleccionando dirección: ${err?.message || err}`);
    }
  };

  /* Borrar */
  const handleEliminarDireccion = async (id) => {
    try {
      await deleteDoc(doc(db, "direcciones", id));
      await fetchDirecciones();
      if (typeof actualizarLista === "function") actualizarLista();
    } catch (err) {
      console.error("handleEliminarDireccion error:", err);
      alert("Error al eliminar. Revisa la consola.");
    }
  };

  /* Comenzar a editar (carga campos en formulario) */
  const comenzarEditar = (dir) => {
    if (!dir || dir.metodoEntrega === "tienda") return;
    setEditandoId(dir.id);
    setMetodoEntrega("domicilio");
    setProvincia(dir.provincia || "");
    setCiudad(dir.ciudad || "");
    setSector(dir.sector || "");
    setNumeroCalle(dir.numeroCalle || "");
    setNumeroCasa(dir.numeroCasa || "");
    setReferencia(dir.referencia || "");
    setUbicacion(dir.ubicacion || "");
    setLatitude(dir.latitude != null ? String(dir.latitude) : "");
    setLongitude(dir.longitude != null ? String(dir.longitude) : "");
    setTiendaActiva(false);
  };

  /* Geolocalización: set ubicacion y pone coordenadas en formulario */
  const agregarUbicacionActual = () => {
    if (!navigator.geolocation) {
      alert("Geolocalización no soportada en este navegador.");
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const link = `https://www.google.com/maps?q=${lat},${lon}`;
        setUbicacion(link);
        setLatitude(String(lat));
        setLongitude(String(lon));
        setNumeroCalle(`${lat}, ${lon}`);
        setGeoLoading(false);
      },
      (err) => {
        console.error("Error geolocalización:", err);
        alert("No fue posible obtener la ubicación. Revisa permisos.");
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const quitarUbicacion = () => {
    setUbicacion("");
    setLatitude("");
    setLongitude("");
    if (numeroCalle && /^\s*-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?\s*$/.test(numeroCalle)) {
      setNumeroCalle("");
    }
  };

  /* Render */
  if (!abierto) return null;

  const direccionesUsuario = direcciones.filter(d => d.metodoEntrega !== "tienda");

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
        <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl p-5 mx-4 overflow-auto max-h-[90vh]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Método de entrega</h3>
            <button onClick={onClose} className="text-gray-600 hover:text-black text-xl">✕</button>
          </div>

          <div className="flex gap-3 mb-4">
            <button
              onClick={() => elegirMetodo("domicilio")}
              className={`px-3 py-1.5 rounded-lg font-semibold ${metodoEntrega === "domicilio" ? "bg-sky-500 text-white" : "bg-gray-100"}`}
            >
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                <span>A domicilio</span>
              </div>
            </button>

            <button
              onClick={() => elegirMetodo("tienda")}
              className={`px-3 py-1.5 rounded-lg font-semibold ${metodoEntrega === "tienda" ? "bg-sky-500 text-white" : "bg-gray-100"}`}
            >
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4" />
                <span>Recoger en tienda</span>
              </div>
            </button>
          </div>

          {/* Usar ubicación actual */}
          <div className="mb-4">
            <button
              onClick={agregarUbicacionActual}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-100 hover:bg-green-200 text-green-800 font-medium"
              disabled={geoLoading || guardando}
            >
              {geoLoading ? (
                <>
                  <LocateFixed className="w-5 h-5 animate-pulse" />
                  Obteniendo ubicación...
                </>
              ) : (
                <>
                  <LocateFixed className="w-5 h-5" />
                  Usar ubicación actual
                </>
              )}
            </button>

            {ubicacion && (
              <div className="flex gap-2 mt-2">
                <a
                  href={ubicacion}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-sky-50 hover:bg-sky-100 text-sky-700 font-medium"
                >
                  <MapIcon className="w-4 h-4" />
                  Ver en Maps
                </a>
                <button
                  onClick={quitarUbicacion}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-50 hover:bg-red-100 text-red-700"
                >
                  <XCircle className="w-4 h-4" />
                  Quitar
                </button>
              </div>
            )}
          </div>

          {/* Formulario o info de tienda */}
          <div className="mb-3">
            {metodoEntrega === "domicilio" ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPickerAbierto(true)}
                  className="col-span-2 px-3 py-3 border rounded text-left font-medium"
                >
                  {provincia ? `Provincia: ${provincia}` : "Selecciona provincia"}
                </button>

                <input placeholder="Ciudad" value={ciudad} onChange={e => setCiudad(e.target.value)} className="px-3 py-2 border rounded" />
                <input placeholder="Sector / Barrio" value={sector} onChange={e => setSector(e.target.value)} className="px-3 py-2 border rounded" />
                <input placeholder="Calle / Av. y número" value={numeroCalle} onChange={e => setNumeroCalle(e.target.value)} className="px-3 py-2 border rounded" />
                <input placeholder="Número de casa" value={numeroCasa} onChange={e => setNumeroCasa(e.target.value)} className="px-3 py-2 border rounded" />
                <input placeholder="Referencia (opcional)" value={referencia} onChange={e => setReferencia(e.target.value)} className="col-span-2 px-3 py-2 border rounded" />

                <input readOnly placeholder="Latitud" value={latitude} className="px-3 py-2 border rounded" />
                <input readOnly placeholder="Longitud" value={longitude} className="px-3 py-2 border rounded" />

                <div className="col-span-2 text-sm text-gray-500">
                  Nota: si usas "Usar ubicación actual" las coordenadas se completan automáticamente y puedes guardar incluso si no completas provincia/ciudad/calle.
                </div>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 rounded text-sm">
                <p className="font-medium">Recoger en:</p>
                <p className="text-sm">{TIENDA_PLAYCENTER.direccionCompleta}</p>
                <a href={TIENDA_PLAYCENTER.ubicacion} target="_blank" rel="noreferrer" className="text-sky-600 underline text-sm">Ver en Maps</a>
              </div>
            )}
          </div>

          {/* Acción principal */}
          <div className="mb-4">
            <button
              onClick={handleGuardarDireccion}
              disabled={guardando}
              className="w-full bg-sky-600 text-white py-2 rounded-lg font-semibold disabled:opacity-60"
            >
              {metodoEntrega === "tienda" ? "Seleccionar Playcenter (Recoger en tienda)" : (editandoId ? "Actualizar dirección" : "Guardar dirección")}
            </button>
          </div>

          {/* Lista de direcciones guardadas */}
          <div>
            <h4 className="font-bold mb-2">Direcciones guardadas</h4>

            {loadingDirecciones ? (
              <p className="text-gray-600">Cargando direcciones...</p>
            ) : (
              <>
                {/* Mostrar Playcenter fijo (no editable) */}
                <div className="mt-2 p-3 rounded-lg border bg-white flex items-center justify-between">
                  <div>
                    <p className="font-medium">Recoger en: Playcenter Universal</p>
                    <p className="text-sm">{TIENDA_PLAYCENTER.direccionCompleta}</p>
                    <a href={TIENDA_PLAYCENTER.ubicacion} target="_blank" rel="noreferrer" className="text-sky-600 underline text-sm">Ver en Maps</a>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        await actualizarUsuarioInfo({
                          direccion: resumenDireccion(TIENDA_PLAYCENTER.direccionCompleta),
                          metodoEntrega: "tienda",
                        });
                        if (onClose) onClose();
                        if (typeof actualizarLista === "function") actualizarLista();
                      }}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                    >
                      Seleccionar
                    </button>
                  </div>
                </div>

                {/* Direcciones del usuario (editable/selectable) */}
                {direccionesUsuario.length === 0 ? (
                  <p className="text-gray-500 italic mt-3">No tienes direcciones guardadas.</p>
                ) : (
                  <div className="flex flex-col gap-2 mt-3">
                    {direccionesUsuario.map(dir => (
                      <div key={dir.id} className="p-3 rounded-lg border bg-gray-50 flex justify-between items-center gap-3">
                        <div className="min-w-0">
                          <p className="font-medium truncate">Entregar en: {resumenDireccion(dir.direccionCompleta)}</p>
                          {dir.ubicacion && (
                            <a href={dir.ubicacion} target="_blank" rel="noreferrer" className="text-sky-600 underline text-sm">Ver en Maps</a>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 shrink-0">
                          <button onClick={() => comenzarEditar(dir)} className="px-2 py-1 bg-yellow-500 text-white rounded text-sm inline-flex items-center gap-1">
                            <Pencil className="w-4 h-4" /> Editar
                          </button>

                          <button onClick={() => handleSeleccionarDireccion(dir)} className="px-2 py-1 bg-green-600 text-white rounded text-sm inline-flex items-center gap-1">
                            <Check className="w-4 h-4" /> Seleccionar
                          </button>

                          <button onClick={() => handleEliminarDireccion(dir.id)} className="px-2 py-1 bg-red-500 text-white rounded text-sm inline-flex items-center gap-1">
                            <Trash2 className="w-4 h-4" /> Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <ProvinciaPicker abierto={pickerAbierto} onClose={() => setPickerAbierto(false)} onPick={(p) => setProvincia(p)} valorActual={provincia} />
    </>
  );
}
