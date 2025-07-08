import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "firebase/auth";
import { subirImagenCloudinary } from "../utils/subirImagenCloudinary";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { usuario, usuarioInfo, actualizarUsuarioInfo, logout } = useAuth();
  const navigate = useNavigate();

  const [modoEdicion, setModoEdicion] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [imgFile, setImgFile] = useState(null);

  const [formData, setFormData] = useState({
    nombre: usuario?.displayName || "",
    email: usuario?.email || "",
    telefono: "",
    direccion: "",
    fotoURL: usuario?.photoURL || "",
  });

  const [previewImg, setPreviewImg] = useState(formData.fotoURL);

  useEffect(() => {
    if (usuarioInfo) {
      setFormData((prev) => ({
        ...prev,
        telefono: usuarioInfo.telefono || "",
        direccion: usuarioInfo.direccion || "",
      }));
    }
  }, [usuarioInfo]);

  useEffect(() => {
    setPreviewImg(formData.fotoURL);
  }, [formData.fotoURL]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((old) => ({ ...old, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImgFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewImg(reader.result);
    reader.readAsDataURL(file);
  };

  const handleGuardar = async () => {
    setGuardando(true);
    setMensaje("");

    try {
      let nuevaFotoURL = formData.fotoURL;

      if (imgFile) {
        nuevaFotoURL = await subirImagenCloudinary(imgFile);
      }

      await actualizarUsuarioInfo({
        telefono: formData.telefono,
        direccion: formData.direccion,
      });

      const cambios = {};
      if (usuario.displayName !== formData.nombre) cambios.displayName = formData.nombre;
      if (usuario.photoURL !== nuevaFotoURL) cambios.photoURL = nuevaFotoURL;

      if (Object.keys(cambios).length > 0) {
        await updateProfile(usuario, cambios);
      }

      setFormData((prev) => ({ ...prev, fotoURL: nuevaFotoURL }));
      setMensaje("✅ Perfil actualizado con éxito.");
      setModoEdicion(false);
      setImgFile(null);
    } catch (error) {
      setMensaje("❌ Error guardando perfil.");
      console.error(error);
    } finally {
      setGuardando(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (!usuario || !usuarioInfo) return null;

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 flex flex-col items-center py-20 px-6 font-sans">
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="max-w-4xl w-full bg-white rounded-lg shadow-lg p-12 border border-gray-200"
      >
        <h1 className="text-4xl font-semibold mb-8 border-b border-gray-300 pb-4 select-none">
          Mi Cuenta
        </h1>

        {!modoEdicion ? (
          <>
            <div className="flex gap-12 mb-10 items-center">
              <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-gray-300 shadow-md">
                {previewImg ? (
                  <img
                    src={previewImg}
                    alt="Foto de perfil"
                    className="object-cover w-full h-full rounded-full"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gray-300 text-gray-700 font-bold text-5xl rounded-full">
                    {formData.nombre[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-6 text-lg flex-1">
                <div>
                  <h3 className="text-gray-600 font-semibold mb-1">Nombre</h3>
                  <p className="text-gray-900">{formData.nombre}</p>
                </div>
                <div>
                  <h3 className="text-gray-600 font-semibold mb-1">Correo</h3>
                  <p className="text-gray-900">{formData.email}</p>
                </div>
                <div>
                  <h3 className="text-gray-600 font-semibold mb-1">Teléfono</h3>
                  <p className="text-gray-900">{formData.telefono || "No definido"}</p>
                </div>
                <div>
                  <h3 className="text-gray-600 font-semibold mb-1">Dirección</h3>
                  <p className="text-gray-900">{formData.direccion || "No definida"}</p>
                </div>
                <div>
                  <h3 className="text-gray-600 font-semibold mb-1">Código Único</h3>
                  <p className="text-gray-900 font-mono tracking-widest">{usuarioInfo.codigo || "No asignado"}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <motion.button
                onClick={() => setModoEdicion(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-yellow-500 text-white rounded px-8 py-3 font-semibold shadow-md hover:bg-yellow-600 transition"
              >
                Editar Perfil
              </motion.button>

              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-red-600 text-white rounded px-8 py-3 font-semibold shadow-md hover:bg-red-700 transition"
              >
                Cerrar Sesión
              </motion.button>
            </div>
          </>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGuardar();
            }}
            className="space-y-8 mt-4"
          >
            <div className="flex flex-col items-center gap-6 mb-8">
              <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-gray-300 relative cursor-pointer hover:brightness-110 transition">
                {previewImg ? (
                  <img
                    src={previewImg}
                    alt="Preview"
                    className="object-cover w-full h-full rounded-full"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gray-300 text-gray-700 font-bold text-5xl rounded-full">
                    {formData.nombre[0]?.toUpperCase() || "U"}
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  title="Subir nueva foto"
                />
              </div>
            </div>

            {["nombre", "email", "telefono", "direccion"].map((campo) => (
              <div key={campo} className="max-w-xl mx-auto">
                <label
                  htmlFor={campo}
                  className="block text-gray-700 font-semibold mb-2"
                >
                  {campo.charAt(0).toUpperCase() + campo.slice(1)}
                </label>
                <input
                  id={campo}
                  name={campo}
                  type={campo === "email" ? "email" : "text"}
                  value={formData[campo]}
                  onChange={handleChange}
                  placeholder={campo === "telefono" ? "+1 809 000 0000" : ""}
                  className="w-full border border-gray-300 rounded px-5 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                  required
                  autoComplete="off"
                />
              </div>
            ))}

            {mensaje && (
              <p
                className={`text-center text-sm font-semibold ${
                  mensaje.includes("Error") ? "text-red-600" : "text-green-600"
                }`}
              >
                {mensaje}
              </p>
            )}

            <div className="flex justify-center gap-6 max-w-xl mx-auto">
              <motion.button
                type="submit"
                disabled={guardando}
                whileHover={{ scale: guardando ? 1 : 1.05 }}
                whileTap={{ scale: guardando ? 1 : 0.95 }}
                className="bg-yellow-500 text-white rounded px-12 py-3 font-semibold shadow-md hover:bg-yellow-600 transition disabled:opacity-50"
              >
                {guardando ? "Guardando..." : "Guardar Cambios"}
              </motion.button>

              <motion.button
                type="button"
                disabled={guardando}
                onClick={() => {
                  setModoEdicion(false);
                  setMensaje("");
                  setPreviewImg(formData.fotoURL);
                  setImgFile(null);
                }}
                whileHover={{ scale: guardando ? 1 : 1.05 }}
                whileTap={{ scale: guardando ? 1 : 0.95 }}
                className="bg-gray-700 text-white rounded px-12 py-3 font-semibold hover:bg-gray-900 transition disabled:opacity-50"
              >
                Cancelar
              </motion.button>
            </div>
          </form>
        )}
      </motion.section>
    </main>
  );
}
