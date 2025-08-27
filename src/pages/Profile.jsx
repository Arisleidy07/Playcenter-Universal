import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "firebase/auth";
import { subirImagenCloudinary } from "../utils/subirImagenCloudinary";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import Entrega from "../components/Entrega";

export default function Profile() {
  const { usuario, usuarioInfo, actualizarUsuarioInfo, logout } = useAuth();
  const navigate = useNavigate();

  const [modoEdicion, setModoEdicion] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [imgFile, setImgFile] = useState(null);
  const [seccionActiva, setSeccionActiva] = useState("informacion");
  const [formData, setFormData] = useState({
    nombre: usuario?.displayName || "",
    email: usuario?.email || "",
    telefono: "",
    direccion: "",
    metodoEntrega: "",
    fotoURL: usuario?.photoURL || "",
  });

  const [historial, setHistorial] = useState([]);
  const [direcciones, setDirecciones] = useState([]);
  const [modalEntrega, setModalEntrega] = useState(false);
  const [direccionEditar, setDireccionEditar] = useState(null);

  useEffect(() => {
    if (usuarioInfo) {
      setFormData((prev) => ({
        ...prev,
        telefono: usuarioInfo.telefono || "",
        direccion: usuarioInfo.direccion || "",
        metodoEntrega: usuarioInfo.metodoEntrega || "",
      }));
    }
  }, [usuarioInfo]);

  const fetchHistorial = async () => {
    try {
      const q = query(collection(db, "orders"), where("userId", "==", usuario.uid));
      const snap = await getDocs(q);
      setHistorial(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Error fetching historial:", err);
    }
  };

  const fetchDirecciones = async () => {
    try {
      const q = query(collection(db, "direcciones"), where("usuarioId", "==", usuario.uid));
      const snap = await getDocs(q);
      setDirecciones(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Error fetching direcciones:", err);
    }
  };

  useEffect(() => {
    if (!usuario) return;
    fetchHistorial();
    fetchDirecciones();
  }, [usuario]);

  const handleChange = (e) => setFormData((old) => ({ ...old, [e.target.name]: e.target.value }));
  const handleFileChange = (e) => { const file = e.target.files[0]; if (!file) return; setImgFile(file); };

  const handleGuardar = async () => {
    setGuardando(true);
    setMensaje("");
    try {
      let nuevaFotoURL = formData.fotoURL;
      if (imgFile) nuevaFotoURL = await subirImagenCloudinary(imgFile);

      await actualizarUsuarioInfo({
        telefono: formData.telefono,
        direccion: formData.direccion,
        metodoEntrega: formData.metodoEntrega,
      });

      const cambios = {};
      if (usuario.displayName !== formData.nombre) cambios.displayName = formData.nombre;
      if (usuario.photoURL !== nuevaFotoURL) cambios.photoURL = nuevaFotoURL;
      if (Object.keys(cambios).length > 0) await updateProfile(usuario, cambios);

      setFormData((prev) => ({ ...prev, fotoURL: nuevaFotoURL }));
      setMensaje("✅ Perfil actualizado con éxito.");
      setModoEdicion(false);
      setImgFile(null);
    } catch (error) {
      setMensaje("❌ Error guardando perfil.");
      console.error(error);
    } finally { setGuardando(false); }
  };

  const handleLogout = async () => { await logout(); navigate("/"); };

  const handleEditarDireccion = (dir) => {
    setDireccionEditar(dir);
    setModalEntrega(true);
  };

  const handleEliminarDireccion = async (id) => {
    try {
      if (!id) return;
      await deleteDoc(doc(db, "direcciones", id));
      await fetchDirecciones();
    } catch (err) {
      console.error("Error eliminando dirección:", err);
      alert("Error eliminando dirección. Revisa la consola.");
    }
  };

  if (!usuario || !usuarioInfo)
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 to-white">
        <p className="text-lg animate-pulse">Cargando perfil...</p>
      </main>
    );

  const menuItems = [
    { id: "informacion", label: "Mi Perfil" },
    { id: "historial", label: "Historial" },
    { id: "direcciones", label: "Direcciones" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-100 to-white flex flex-col items-center px-6 py-12 font-sans">
      <div className="flex flex-wrap gap-6 justify-center mb-12">
        {menuItems.map(item => (
          <motion.button
            key={item.id}
            onClick={() => setSeccionActiva(item.id)}
            className={`px-12 py-4 rounded-full text-lg font-bold shadow-lg transition-all ${
              seccionActiva === item.id
                ? "bg-sky-500 text-white shadow-inner"
                : "bg-white text-gray-700 hover:bg-sky-100"
            }`}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
          >
            {item.label}
          </motion.button>
        ))}
        <motion.button
          onClick={handleLogout}
          className="px-12 py-4 bg-red-500 text-white rounded-full shadow-lg font-bold hover:bg-red-600"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
        >
          Cerrar Sesión
        </motion.button>
      </div>

      <section className="w-full max-w-5xl">
        <AnimatePresence mode="wait">
          {seccionActiva === "informacion" && (
            <motion.div key="info" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.4 }}>
              <div className="flex flex-col md:flex-row items-center gap-10 bg-gradient-to-r from-sky-50 to-white p-10 rounded-3xl shadow-lg">
                <div className="relative w-44 h-44 rounded-full overflow-hidden shadow-lg">
                  <img src={formData.fotoURL} alt="Perfil" className="object-cover w-full h-full" />
                </div>
                <div className="flex-1 flex flex-col gap-4 text-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <p><span className="font-semibold">Nombre:</span> {formData.nombre}</p>
                    <p><span className="font-semibold">Email:</span> {formData.email}</p>
                    <p><span className="font-semibold">Teléfono:</span> {formData.telefono || "No definido"}</p>
                    <p><span className="font-semibold">Dirección:</span> {formData.direccion || "No definida"}</p>
                    <p><span className="font-semibold">Método de entrega:</span> {formData.metodoEntrega || "No definido"}</p>
                    <p><span className="font-semibold">Código único:</span> <span className="font-mono">{usuarioInfo.codigo || "No asignado"}</span></p>
                  </div>

                  {!modoEdicion && (
                    <motion.button
                      onClick={() => setModoEdicion(true)}
                      className="self-center mt-6 px-10 py-3 bg-sky-500 text-white font-bold rounded-full shadow-lg hover:bg-sky-600"
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Editar Perfil
                    </motion.button>
                  )}
                </div>
              </div>

              {modoEdicion && (
                <motion.form onSubmit={(e) => { e.preventDefault(); handleGuardar(); }} className="mt-10 bg-white p-8 rounded-3xl shadow-lg flex flex-col gap-6">
                  <div>
                    <label className="block font-semibold mb-1">Foto de perfil</label>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="w-full" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {["nombre", "email", "telefono", "direccion"].map(campo => (
                      <div key={campo}>
                        <label className="block font-semibold mb-1 capitalize">{campo}</label>
                        <input
                          name={campo}
                          type={campo === "email" ? "email" : "text"}
                          value={formData[campo]}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                          required
                        />
                      </div>
                    ))}
                    <div>
                      <label className="block font-semibold mb-1">Método de entrega</label>
                      <select
                        name="metodoEntrega"
                        value={formData.metodoEntrega}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                      >
                        <option value="">Selecciona una opción</option>
                        <option value="domicilio">Domicilio</option>
                        <option value="recoger">Recoger en tienda</option>
                      </select>
                    </div>
                  </div>

                  {mensaje && <p className={`text-center ${mensaje.includes("Error") ? "text-red-500" : "text-sky-600"}`}>{mensaje}</p>}

                  <div className="flex justify-center gap-6 mt-4">
                    <motion.button type="submit" disabled={guardando} className="px-10 py-3 bg-sky-500 text-white rounded-full font-bold shadow-lg hover:bg-sky-600"
                      whileHover={{ scale: guardando ? 1 : 1.08 }}
                      whileTap={{ scale: guardando ? 1 : 0.95 }}
                    >
                      {guardando ? "Guardando..." : "Guardar Cambios"}
                    </motion.button>
                    <motion.button type="button" onClick={() => setModoEdicion(false)} className="px-10 py-3 bg-gray-100 text-gray-800 rounded-full shadow hover:bg-gray-200 font-bold"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Cancelar
                    </motion.button>
                  </div>
                </motion.form>
              )}
            </motion.div>
          )}

          {seccionActiva === "historial" && (
            <motion.div key="historial" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.4 }}>
              <h2 className="text-2xl font-bold text-sky-700 mb-6">Historial de compras</h2>
              {historial.length === 0 ? <p className="text-gray-500 italic">No hay compras registradas.</p> :
                <div className="flex flex-col gap-4">
                  {historial.map(compra => (
                    <div key={compra.id} className="p-6 rounded-2xl bg-gradient-to-r from-white to-sky-50 shadow hover:shadow-md transition">
                      <p><strong>Fecha:</strong> {compra.fecha?.seconds ? new Date(compra.fecha.seconds * 1000).toLocaleDateString() : "Sin fecha"}</p>
                      <p><strong>Total:</strong> RD${compra.total || "?"}</p>
                      <p><strong>Estado:</strong> {compra.estado || "Pendiente"}</p>
                      <ul className="list-disc ml-6 mt-2 text-gray-700">
                        {compra.productos?.map((prod, idx) => (
                          <li key={idx}>{prod.nombre} ({prod.cantidad} x RD${prod.precio})</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>}
            </motion.div>
          )}

          {seccionActiva === "direcciones" && (
            <motion.div key="direcciones" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.4 }}>
              <h2 className="text-2xl font-bold text-sky-700 mb-4 flex justify-between items-center">
                Direcciones
                <motion.button
                  onClick={() => { setDireccionEditar(null); setModalEntrega(true); }}
                  className="px-6 py-3 bg-sky-500 text-white rounded-full shadow hover:bg-sky-600 font-bold"
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                >
                  Añadir Dirección
                </motion.button>
              </h2>
              <div className="flex flex-col gap-3">
                <div className="p-5 rounded-2xl bg-gradient-to-r from-white to-sky-50 shadow flex justify-between items-start opacity-80 cursor-not-allowed">
                  <div>
                    <p><strong>Dirección:</strong> Av. Salvador Estrella Sadhalá No. 55, Altos (Los Guandules), Santiago de los Caballeros, República Dominicana</p>
                    <p><strong>Método:</strong> Tienda física Playcenter Universal</p>
                  </div>
                </div>

                {direcciones.length === 0 ? <p className="text-gray-500 italic">No tienes direcciones guardadas.</p> :
                  direcciones.map(dir => (
                    <div key={dir.id} className="p-5 rounded-2xl bg-gradient-to-r from-white to-sky-50 shadow hover:shadow-md transition flex justify-between items-start">
                      <div>
                        <p><strong>Dirección:</strong> {dir.direccionCompleta || `${dir.numeroCalle || ""} ${dir.numeroCasa ? "Casa "+dir.numeroCasa : ""}, ${dir.ciudad || ""}, ${dir.provincia || ""}`}</p>
                        <p><strong>Método:</strong> {dir.metodoEntrega}</p>
                        {dir.referencia && <p><strong>Ref:</strong> {dir.referencia}</p>}
                        {dir.ubicacion && (
                          <p className="mt-1">
                            <strong>Ubicación:</strong>{" "}
                            <a href={dir.ubicacion} target="_blank" rel="noreferrer" className="underline text-sky-700">Ver en Maps</a>
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <button onClick={() => handleEditarDireccion(dir)} className="px-3 py-1 bg-yellow-300 rounded hover:bg-yellow-400 font-semibold">Editar</button>
                        <button onClick={() => handleEliminarDireccion(dir.id)} className="px-3 py-1 bg-red-400 rounded hover:bg-red-500 font-semibold text-white">Eliminar</button>
                      </div>
                    </div>
                  ))
                }
              </div>

              {modalEntrega && (
                <Entrega
                  abierto={modalEntrega}
                  onClose={() => { setModalEntrega(false); }} // Profile ya no hace fetch extra al cerrar
                  usuarioId={usuario.uid}
                  direccionEditar={direccionEditar}
                  actualizarLista={fetchDirecciones}
                />
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </section>
    </main>
  );
}
