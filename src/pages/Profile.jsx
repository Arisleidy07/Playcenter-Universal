import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { subirImagenCloudinary } from "../utils/subirImagenCloudinary";

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
        await usuario.updateProfile(cambios);
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

  if (!usuario) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#121212] text-white text-xl font-semibold">
        Por favor inicia sesión para ver tu perfil.
      </div>
    );
  }

  if (!usuarioInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0F1117] text-white text-xl font-medium">
        Cargando perfil...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0F1117] text-gray-300 flex flex-col items-center py-16 px-6">
      <section className="max-w-3xl w-full bg-[#1E222A] rounded-2xl shadow-lg p-10 ring-1 ring-[#4FC3F7] animate-slideUp">
        <h1 className="text-4xl font-extrabold text-[#4FC3F7] mb-8 tracking-wide">Mi Cuenta</h1>

        {!modoEdicion ? (
          <>
            <div className="flex flex-col sm:flex-row gap-8 mb-8 items-center">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#4FC3F7]">
                {previewImg ? (
                  <img src={previewImg} alt="Foto de perfil" className="object-cover w-full h-full" />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-[#292E3B] text-[#4FC3F7] font-bold text-3xl">
                    {formData.nombre[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </div>

              <div className="flex flex-col flex-1 gap-4">
                <div><h3 className="text-[#75D6FF] font-semibold mb-1">Nombre</h3><p className="text-lg">{formData.nombre}</p></div>
                <div><h3 className="text-[#75D6FF] font-semibold mb-1">Correo</h3><p className="text-lg">{formData.email}</p></div>
                <div><h3 className="text-[#75D6FF] font-semibold mb-1">Teléfono</h3><p className="text-lg">{formData.telefono || "No definido"}</p></div>
                <div><h3 className="text-[#75D6FF] font-semibold mb-1">Dirección</h3><p className="text-lg">{formData.direccion || "No definida"}</p></div>
              </div>
            </div>

            <button onClick={() => setModoEdicion(true)} className="bg-[#4FC3F7] hover:bg-[#3BB0F3] transition rounded-full px-8 py-3 font-semibold text-black shadow-lg hover:shadow-xl transform hover:scale-105">
              Editar Perfil
            </button>
          </>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); handleGuardar(); }} className="space-y-6">
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#4FC3F7] relative cursor-pointer hover:brightness-110 transition">
                {previewImg ? (
                  <img src={previewImg} alt="Preview" className="object-cover w-full h-full" />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-[#292E3B] text-[#4FC3F7] font-bold text-3xl">
                    {formData.nombre[0]?.toUpperCase() || "U"}
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" title="Subir nueva foto" />
              </div>
              <small className="text-[#5A90B2]">Haz click en la imagen para cambiarla</small>
            </div>

            {["nombre", "email", "telefono", "direccion"].map((campo) => (
              <div key={campo}>
                <label htmlFor={campo} className="block text-[#75D6FF] font-semibold mb-2">
                  {campo.charAt(0).toUpperCase() + campo.slice(1)}
                </label>
                <input
                  id={campo}
                  name={campo}
                  type={campo === "email" ? "email" : "text"}
                  value={formData[campo]}
                  onChange={handleChange}
                  placeholder={campo === "telefono" ? "+1 809 123 4567" : ""}
                  className="w-full bg-[#292E3B] border border-[#4FC3F7] rounded-lg px-4 py-2 text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4FC3F7]"
                  required
                  autoComplete="off"
                />
              </div>
            ))}

            {mensaje && <p className={`text-sm font-semibold ${mensaje.includes("Error") ? "text-red-500" : "text-green-400"}`}>{mensaje}</p>}

            <div className="flex gap-4">
              <button type="submit" disabled={guardando} className="bg-[#4FC3F7] hover:bg-[#3BB0F3] transition rounded-full px-6 py-3 font-semibold text-black shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-60">
                {guardando ? "Guardando..." : "Guardar Cambios"}
              </button>
              <button type="button" disabled={guardando} onClick={() => {
                setModoEdicion(false);
                setMensaje("");
                setPreviewImg(formData.fotoURL);
                setImgFile(null);
              }} className="bg-[#2C313C] hover:bg-[#414A5A] transition rounded-full px-6 py-3 font-semibold text-gray-300">
                Cancelar
              </button>
            </div>
          </form>
        )}

        <footer className="mt-12 text-center text-gray-500 text-sm select-none">
          <p>Playcenter Universal</p>
          <p>Tu universo de tecnología, estilo e innovación en Santiago, R.D.</p>
          <p>+1 (809) 582-1212</p>
          <p>info@playcenteruniversal.com</p>
        </footer>
      </section>
    </main>
  );
}
