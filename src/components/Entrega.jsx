import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";

const provinciasRD = [
  "Azua","Bahoruco","Barahona","Dajabón","Distrito Nacional","Duarte",
  "Elías Piña","El Seibo","Espaillat","Hato Mayor","Hermanas Mirabal",
  "Independencia","La Altagracia","La Romana","La Vega",
  "María Trinidad Sánchez","Monseñor Nouel","Monte Cristi","Monte Plata",
  "Pedernales","Peravia","Puerto Plata","Samaná","San Cristóbal","San José de Ocoa",
  "San Juan","San Pedro de Macorís","Sánchez Ramírez","Santiago","Santiago Rodríguez","Santo Domingo","Valverde"
];

export default function Entrega({
  abierto,
  onClose,
  direccionEditar = null,
  actualizarLista,
  usuarioId = null,
}) {
  const { usuario, actualizarUsuarioInfo } = useAuth();

  const [metodoEntrega, setMetodoEntrega] = useState("domicilio");
  const [provincia, setProvincia] = useState("");
  const [ciudad, setCiudad] = useState("");
  // Campo principal: numeroCalle (ej: "Av. 27 de Febrero #45")
  const [numeroCalle, setNumeroCalle] = useState("");
  const [numeroCasa, setNumeroCasa] = useState("");
  const [sector, setSector] = useState("");
  const [referencia, setReferencia] = useState("");
  const [direccionCompleta, setDireccionCompleta] = useState("");
  const [ubicacion, setUbicacion] = useState(""); // link google maps
  const [guardando, setGuardando] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

  const uid = usuarioId || usuario?.uid;
  const usingUbicacion = Boolean(ubicacion);

  useEffect(() => {
    if (direccionEditar) {
      setProvincia(direccionEditar.provincia || "");
      setCiudad(direccionEditar.ciudad || "");
      setNumeroCalle(direccionEditar.numeroCalle || "");
      setNumeroCasa(direccionEditar.numeroCasa || "");
      setSector(direccionEditar.sector || "");
      setReferencia(direccionEditar.referencia || "");
      setDireccionCompleta(direccionEditar.direccionCompleta || "");
      setUbicacion(direccionEditar.ubicacion || "");
      setMetodoEntrega(direccionEditar.metodoEntrega || "domicilio");
    } else {
      setProvincia(""); setCiudad(""); setNumeroCalle(""); setNumeroCasa("");
      setSector(""); setReferencia(""); setDireccionCompleta(""); setUbicacion("");
      setMetodoEntrega("domicilio");
    }
  }, [direccionEditar, abierto]);

  const validar = () => {
    if (metodoEntrega === "domicilio" && !usingUbicacion) {
      if (!provincia || !ciudad || !numeroCalle) return "Completa provincia, ciudad y número/calle.";
    }
    if (!uid) return "Usuario no identificado.";
    return null;
  };

  const armarDireccionCompleta = () => {
    if (usingUbicacion) return ubicacion;
    const partes = [];
    if (numeroCalle) partes.push(numeroCalle);
    if (numeroCasa) partes.push(`Casa ${numeroCasa}`);
    if (sector) partes.push(sector);
    if (ciudad) partes.push(ciudad);
    if (provincia) partes.push(provincia);
    if (referencia) partes.push(`Ref: ${referencia}`);
    return partes.filter(Boolean).join(", ");
  };

  const handleGuardar = async () => {
    const errorValid = validar();
    if (errorValid) {
      alert(errorValid);
      return;
    }

    if (guardando) return;
    setGuardando(true);

    try {
      console.groupCollapsed("Entrega.handleGuardar - START");
      console.log("usuarioId (uid):", uid);
      const completa = (direccionCompleta || armarDireccionCompleta() || "").trim();
      console.log("direccionCompleta calculada:", completa);

      if (!completa) {
        throw new Error("La dirección resultante está vacía. Completa los campos o usa 'Agregar ubicación'.");
      }

      const nuevaDireccion = {
        metodoEntrega,
        provincia: usingUbicacion ? null : (provincia || null),
        ciudad: usingUbicacion ? null : (ciudad || null),
        numeroCalle: usingUbicacion ? null : (numeroCalle || null),
        numeroCasa: numeroCasa || null,
        sector: sector || null,
        referencia: referencia || null,
        direccionCompleta: completa,
        ubicacion: ubicacion || null,
        usuarioId: uid,
        updatedAt: new Date(),
      };

      console.log("nuevaDireccion object:", nuevaDireccion);

      if (!uid) {
        throw new Error("Usuario no autenticado (uid faltante). Revisa AuthContext.");
      }

      let snapExist = null;
      if (nuevaDireccion.direccionCompleta) {
        const qExist = query(
          collection(db, "direcciones"),
          where("usuarioId", "==", uid),
          where("direccionCompleta", "==", nuevaDireccion.direccionCompleta)
        );
        snapExist = await getDocs(qExist);
        console.log("snapExist.size:", snapExist.size);
      }

      if (direccionEditar && direccionEditar.id) {
        console.log("Actualizando documento existente (editar) id:", direccionEditar.id);
        const docRef = doc(db, "direcciones", direccionEditar.id);
        await updateDoc(docRef, { ...nuevaDireccion });
        console.log("Update ok");
      } else if (snapExist && !snapExist.empty) {
        const existingDoc = snapExist.docs[0];
        console.log("Dirección idéntica encontrada. Actualizando doc id:", existingDoc.id);
        const docRef = doc(db, "direcciones", existingDoc.id);
        await updateDoc(docRef, { ...nuevaDireccion });
        console.log("Update existing ok");
      } else {
        console.log("Creando nueva dirección en Firestore");
        await addDoc(collection(db, "direcciones"), { ...nuevaDireccion, createdAt: new Date() });
        console.log("Creación ok");
      }

      try {
        await actualizarUsuarioInfo({
          direccion: nuevaDireccion.direccionCompleta,
          metodoEntrega: nuevaDireccion.metodoEntrega,
        });
        console.log("actualizarUsuarioInfo ok");
      } catch (errUi) {
        console.warn("actualizarUsuarioInfo falló (no crítico):", errUi?.message || errUi);
      }

      if (typeof actualizarLista === "function") await actualizarLista();
      if (typeof onClose === "function") onClose();

      console.groupEnd();
    } catch (err) {
      console.groupEnd();
      console.error("Entrega.handleGuardar - ERROR:", err);
      const userMsg = err?.message || String(err);
      alert("Error guardando dirección: " + userMsg);
    } finally {
      setGuardando(false);
    }
  };

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
        setDireccionCompleta(link);
        setReferencia((prev) => prev ? prev + " | Ubicación añadida" : "Ubicación añadida");
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
    if (direccionCompleta === ubicacion) setDireccionCompleta("");
  };

  return (
    <AnimatePresence>
      {abierto && (
        <motion.div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="bg-white p-6 rounded-3xl shadow-xl w-full max-w-xl mx-4 relative"
            initial={{ y: -20, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: -20, scale: 0.98 }} transition={{ duration: 0.25 }}>
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 text-2xl hover:text-gray-700">×</button>
            <h2 className="text-2xl font-bold text-center mb-4">{direccionEditar ? "Editar Dirección" : "Añadir Dirección"}</h2>

            {/* OPCIONES DE MÉTODO */}
            <div className="flex flex-col gap-3 mb-3">
              {["domicilio", "tienda"].map(option => (
                <button key={option} onClick={() => setMetodoEntrega(option)}
                  className={`w-full py-2 rounded-xl font-semibold transition ${
                    metodoEntrega === option ? "bg-sky-200 text-sky-800" : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                  }`}>
                  {option === "domicilio" ? "Entrega a domicilio" : "Recoger en tienda"}
                </button>
              ))}
            </div>

            {/* BOTÓN DE UBICACIÓN: ABAJO de las opciones, color rojo claro, icono pin */}
            <div className="mb-4">
              <div className="flex gap-2">
                <button onClick={agregarUbicacionActual}
                  className="flex items-center gap-2 px-4 py-2 rounded-md bg-red-100 hover:bg-red-200 text-red-700 font-medium"
                  aria-label="Agregar mi ubicación actual" disabled={geoLoading || guardando}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 21s8-4.5 8-11a8 8 0 10-16 0c0 6.5 8 11 8 11z" />
                    <circle cx="12" cy="10" r="2.5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                  </svg>
                  {geoLoading ? "Obteniendo ubicación..." : "Agregar mi ubicación actual"}
                </button>

                {ubicacion && (
                  <>
                    <a href={ubicacion} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-md bg-sky-50 hover:bg-sky-100 text-sky-700 font-medium">
                      Ver en Maps
                    </a>
                    <button onClick={quitarUbicacion} className="px-4 py-2 rounded-md bg-red-50 hover:bg-red-100 text-red-700">
                      Quitar ubicación
                    </button>
                  </>
                )}
              </div>
              {usingUbicacion && <p className="text-xs text-gray-500 mt-2">Se usará la ubicación actual — no hace falta llenar los campos de dirección.</p>}
            </div>

            {metodoEntrega === "domicilio" && (
              <div className="flex flex-col gap-3">
                <select value={provincia} onChange={e => setProvincia(e.target.value)} className="w-full px-4 py-2 border rounded-md" disabled={usingUbicacion}>
                  <option value="">Selecciona una provincia</option>
                  {provinciasRD.map(p => <option key={p} value={p}>{p}</option>)}
                </select>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input placeholder="Ciudad" value={ciudad} onChange={e => setCiudad(e.target.value)} className="w-full px-4 py-2 border rounded-md" disabled={usingUbicacion} />
                  <input placeholder="Sector / Barrio (opcional)" value={sector} onChange={e => setSector(e.target.value)} className="w-full px-4 py-2 border rounded-md" disabled={usingUbicacion} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input placeholder="Calle / Av. y número (ej: Av. 27 de Febrero #45)" value={numeroCalle} onChange={e => setNumeroCalle(e.target.value)} className="w-full px-4 py-2 border rounded-md" disabled={usingUbicacion} />
                  <input placeholder="Número de casa (opcional)" value={numeroCasa} onChange={e => setNumeroCasa(e.target.value)} className="w-full px-4 py-2 border rounded-md" disabled={usingUbicacion} />
                </div>

                <input placeholder="Referencia (ej: cerca de la iglesia)" value={referencia} onChange={e => setReferencia(e.target.value)} className="w-full px-4 py-2 border rounded-md" disabled={usingUbicacion} />

                <textarea placeholder="Dirección completa (opcional - se autocompleta si queda vacío)"
                  value={direccionCompleta}
                  onChange={e => setDireccionCompleta(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md"
                  rows="2" />
              </div>
            )}

            <div className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-100 text-sm">
              <strong>Vista previa:</strong>
              <p className="mt-2 break-words">{armarDireccionCompleta() || "Se mostrará la dirección completa aquí cuando completes los campos."}</p>
            </div>

            <motion.button onClick={handleGuardar} className="mt-5 w-full py-3 bg-sky-500 text-white rounded-full font-bold shadow-md hover:bg-sky-600 disabled:opacity-60"
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} disabled={guardando}>
              {guardando ? "Guardando..." : "Guardar Dirección"}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
