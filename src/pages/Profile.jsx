import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "firebase/auth";
import { subirImagenCloudinary } from "../utils/subirImagenCloudinary";
import { motion } from "framer-motion";

export default function Profile() {
  const { usuario, usuarioInfo, actualizarUsuarioInfo } = useAuth();

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
    <main className="min-h-screen bg-white text-gray-300 flex flex-col items-center py-24 px-6">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl w-full bg-white rounded-3xl shadow-xl p-10 ring-2 ring-[#4FC3F7]"
      >
        <h1 className="text-5xl font-extrabold text-[#4FC3F7] mb-10 tracking-wide text-center">
          Mi Cuenta
        </h1>
                {!modoEdicion ? (
          <>
            <div className="flex flex-col sm:flex-row gap-12 mb-10 items-center">
              <div className="w-40 h-40 rounded-full overflow-hidden border-8 border-[#4FC3F7]">
                {previewImg ? (
                  <img
                    src={previewImg}
                    alt="Foto de perfil"
                    className="object-cover w-full h-full rounded-full"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-[#292E3B] text-[#4FC3F7] font-bold text-6xl rounded-full">
                    {formData.nombre[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </div>

              <div className="flex flex-col flex-1 gap-6 text-lg">
                <div>
                  <h3 className="text-[#75D6FF] font-semibold mb-1">Nombre</h3>
                  <p>{formData.nombre}</p>
                </div>
                <div>
                  <h3 className="text-[#75D6FF] font-semibold mb-1">Correo</h3>
                  <p>{formData.email}</p>
                </div>
                <div>
                  <h3 className="text-[#75D6FF] font-semibold mb-1">Teléfono</h3>
                  <p>{formData.telefono || "No definido"}</p>
                </div>
                <div>
                  <h3 className="text-[#75D6FF] font-semibold mb-1">Dirección</h3>
                  <p>{formData.direccion || "No definida"}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => setModoEdicion(true)}
                className="bg-[#4FC3F7] hover:bg-[#3BB0F3] transition rounded-full px-10 py-4 font-semibold text-black shadow-lg hover:shadow-xl"
              >
                Editar Perfil
              </button>
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
              <div className="w-40 h-40 rounded-full overflow-hidden border-8 border-[#4FC3F7] relative cursor-pointer hover:brightness-110 transition">
                {previewImg ? (
                  <img
                    src={previewImg}
                    alt="Preview"
                    className="object-cover w-full h-full rounded-full"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-[#292E3B] text-[#4FC3F7] font-bold text-6xl rounded-full">
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
                  className="block text-[#75D6FF] font-semibold mb-2"
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
                  className="w-full bg-[#292E3B] border border-[#4FC3F7] rounded-lg px-5 py-3 text-gray-300 focus:outline-none focus:ring-4 focus:ring-[#4FC3F7] transition"
                  required
                  autoComplete="off"
                />
              </div>
            ))}

            {mensaje && (
              <p
                className={`text-center text-sm font-semibold ${
                  mensaje.includes("Error") ? "text-red-500" : "text-green-400"
                }`}
              >
                {mensaje}
              </p>
            )}

            <div className="flex justify-center gap-8 max-w-lg mx-auto">
              <button
                type="submit"
                disabled={guardando}
                className="bg-[#4FC3F7] hover:bg-[#3BB0F3] transition rounded-full px-8 py-3 font-semibold text-black shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-60"
              >
                {guardando ? "Guardando..." : "Guardar Cambios"}
              </button>

              <button
                type="button"
                disabled={guardando}
                onClick={() => {
                  setModoEdicion(false);
                  setMensaje("");
                  setPreviewImg(formData.fotoURL);
                  setImgFile(null);
                }}
                className="bg-[#2C313C] hover:bg-[#414A5A] transition rounded-full px-8 py-3 font-semibold text-gray-300"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </motion.section>
    </main>
  );
}

