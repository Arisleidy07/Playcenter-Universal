import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "firebase/auth";
import { subirImagenCloudinary } from "../utils/subirImagenCloudinary";
import { motion } from "framer-motion";

export default function Profile() {
  const { usuario, usuarioInfo, actualizarUsuarioInfo, logout } = useAuth();

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

  if (!usuario || !usuarioInfo) return null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#e6f7ff] to-[#f0faff] text-[#0f172a] flex flex-col items-center py-24 px-6 font-sans">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-3xl w-full bg-white rounded-3xl shadow-2xl p-10 ring-4 ring-[#3dd9c4] relative"
      >
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-10 tracking-tight text-center text-[#0f172a] select-none">
          Mi Cuenta
        </h1>

        {!modoEdicion ? (
          <>
            <div className="flex flex-col sm:flex-row gap-12 mb-10 items-center">
              <div className="w-40 h-40 rounded-full overflow-hidden border-8 border-[#3dd9c4] shadow-lg">
                {previewImg ? (
                  <img
                    src={previewImg}
                    alt="Foto de perfil"
                    className="object-cover w-full h-full rounded-full"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-[#c5f0e8] text-[#0f172a] font-extrabold text-6xl rounded-full">
                    {formData.nombre[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </div>

              <div className="flex flex-col flex-1 gap-6 text-lg">
                <div>
                  <h3 className="text-[#3dd9c4] font-semibold mb-1">Nombre</h3>
                  <p className="text-[#0f172a]">{formData.nombre}</p>
                </div>
                <div>
                  <h3 className="text-[#3dd9c4] font-semibold mb-1">Correo</h3>
                  <p className="text-[#0f172a]">{formData.email}</p>
                </div>
                <div>
                  <h3 className="text-[#3dd9c4] font-semibold mb-1">Teléfono</h3>
                  <p className="text-[#0f172a]">{formData.telefono || "No definido"}</p>
                </div>
                <div>
                  <h3 className="text-[#3dd9c4] font-semibold mb-1">Dirección</h3>
                  <p className="text-[#0f172a]">{formData.direccion || "No definida"}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
              <motion.button
                onClick={() => setModoEdicion(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#3dd9c4] text-[#0f172a] rounded-full px-10 py-3 font-semibold shadow-md hover:shadow-xl transition"
              >
                Editar Perfil
              </motion.button>
              <motion.button
                onClick={logout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#f87171] text-white rounded-full px-10 py-3 font-semibold shadow-md hover:bg-[#ef4444] transition"
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
            className="space-y-8"
          >
            <div className="flex flex-col items-center gap-6 mb-8">
              <div className="w-40 h-40 rounded-full overflow-hidden border-8 border-[#3dd9c4] relative cursor-pointer hover:brightness-110 transition">
                {previewImg ? (
                  <img
                    src={previewImg}
                    alt="Preview"
                    className="object-cover w-full h-full rounded-full"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-[#0f172a] text-[#3dd9c4] font-extrabold text-6xl rounded-full">
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
              <div key={campo} className="max-w-lg mx-auto">
                <label
                  htmlFor={campo}
                  className="block text-[#3dd9c4] font-semibold mb-2"
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
                  className="w-full bg-white border border-[#3dd9c4] rounded-lg px-5 py-3 text-[#0f172a] focus:outline-none focus:ring-4 focus:ring-[#3dd9c4] transition"
                  required
                  autoComplete="off"
                />
              </div>
            ))}

            {mensaje && (
              <p
                className={`text-center text-sm font-semibold ${
                  mensaje.includes("Error") ? "text-red-500" : "text-green-500"
                }`}
              >
                {mensaje}
              </p>
            )}

            <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-lg mx-auto mt-6">
              <motion.button
                type="submit"
                disabled={guardando}
                whileHover={{ scale: guardando ? 1 : 1.05 }}
                whileTap={{ scale: guardando ? 1 : 0.95 }}
                className="bg-[#3dd9c4] text-[#0f172a] rounded-full px-10 py-3 font-semibold shadow-md hover:shadow-xl transition disabled:opacity-60"
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
                className="bg-[#0f172a] text-white rounded-full px-10 py-3 font-semibold hover:bg-[#1e293b] transition disabled:opacity-60"
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
