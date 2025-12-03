import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Store,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Send,
  Clock,
} from "lucide-react";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";

export default function SolicitarVender() {
  const navigate = useNavigate();
  const { usuario, usuarioInfo } = useAuth();
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [paso, setPaso] = useState(1);
  const [previewLogo, setPreviewLogo] = useState(null);
  const [previewBanner, setPreviewBanner] = useState(null);

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    logo: null,
    banner: null,
    telefono: "",
    direccion: "",
    eslogan: "",
    email: "",
    nombreContacto: "",
  });

  const handleImageChange = (e, tipo) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen no debe superar 5MB");
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      if (tipo === "logo") {
        setPreviewLogo(reader.result);
        setFormData({ ...formData, logo: file });
      } else {
        setPreviewBanner(reader.result);
        setFormData({ ...formData, banner: file });
      }
    };
    reader.readAsDataURL(file);
  };

  const subirImagen = async (file, carpeta) => {
    if (!file) return null;
    const storageRef = ref(storage, `${carpeta}/${Date.now()}.jpg`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre.trim()) {
      alert("El nombre de la tienda es obligatorio");
      return;
    }

    if (!formData.email.trim()) {
      alert("El email es obligatorio para enviarte la respuesta");
      return;
    }

    setLoading(true);

    try {
      // 1. Subir imágenes a Firebase Storage (temporal)
      const logoUrl = formData.logo
        ? await subirImagen(formData.logo, "solicitudes/logos")
        : "";
      const bannerUrl = formData.banner
        ? await subirImagen(formData.banner, "solicitudes/banners")
        : "";

      // 2. Crear SOLICITUD (no tienda todavía)
      const solicitudData = {
        // Datos de la tienda propuesta
        tiendaNombre: formData.nombre,
        tiendaDescripcion: formData.descripcion,
        tiendaEslogan: formData.eslogan,
        tiendaLogo: logoUrl,
        tiendaBanner: bannerUrl,
        tiendaTelefono: formData.telefono,
        tiendaDireccion: formData.direccion,

        // Datos del solicitante
        email: formData.email,
        nombreContacto: formData.nombreContacto,
        userId: usuario?.uid || null,

        // Metadatos
        fechaSolicitud: new Date(),
        estado: "pendiente", // pendiente | aprobada | rechazada
        revisadoPor: null,
        fechaRevision: null,
        notasAdmin: "",
      };

      await addDoc(collection(db, "solicitudes_vendedor"), solicitudData);

      // 3. Mostrar mensaje de éxito
      setEnviado(true);
    } catch (error) {
      // console.error("Error al enviar solicitud:", error);
      alert("Hubo un error al enviar tu solicitud. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const pasoAnterior = () => {
    if (paso > 1) setPaso(paso - 1);
  };

  const pasoSiguiente = () => {
    if (paso === 1 && !formData.nombre.trim()) {
      alert("Por favor ingresa el nombre de tu tienda");
      return;
    }
    if (paso < 3) setPaso(paso + 1);
  };

  // Pantalla de éxito
  if (enviado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
            ¡Solicitud Enviada!
          </h1>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3 text-left">
              <Clock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-blue-900 mb-2">
                  Playcenter Universal evaluará tu solicitud
                </h3>
                <p className="text-sm text-blue-700">
                  Te enviaremos la respuesta a <strong>{formData.email}</strong>{" "}
                  en las próximas 24-48 horas.
                </p>
              </div>
            </div>
          </div>

          <p className="text-gray-600 mb-8">
            Gracias por tu interés en vender con nosotros. Revisaremos tu
            información y te contactaremos pronto.
          </p>

          <button
            onClick={() => navigate("/")}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Volver al Inicio
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Solicita Vender en Playcenter
          </h1>
          <p className="text-lg text-gray-600">
            Completa el formulario y nos pondremos en contacto contigo
          </p>
        </motion.div>

        {/* Indicador de Pasos */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((num) => (
            <React.Fragment key={num}>
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                  paso >= num
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {paso > num ? <CheckCircle2 className="w-6 h-6" /> : num}
              </div>
              {num < 3 && (
                <div
                  className={`w-16 h-1 ${
                    paso > num ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Formulario */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <form onSubmit={handleSubmit}>
            {/* PASO 1: Información Básica */}
            {paso === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    Nombre de tu Tienda *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    placeholder="Ej: TecnoStore, GameZone, FashionHub"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Eslogan (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.eslogan}
                    onChange={(e) =>
                      setFormData({ ...formData, eslogan: e.target.value })
                    }
                    placeholder="Ej: Los mejores productos gaming de RD"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) =>
                      setFormData({ ...formData, descripcion: e.target.value })
                    }
                    placeholder="Cuéntanos sobre tu negocio..."
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                  />
                </div>
              </motion.div>
            )}

            {/* PASO 2: Imágenes */}
            {paso === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Logo */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    Logo de la Tienda
                  </label>
                  <div className="flex flex-col items-center">
                    {previewLogo ? (
                      <div className="relative">
                        <img
                          src={previewLogo}
                          alt="Preview Logo"
                          className="w-32 h-32 rounded-full object-cover border-4 border-blue-600 shadow-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewLogo(null);
                            setFormData({ ...formData, logo: null });
                          }}
                          className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <label className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-full flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-xs text-gray-500">
                          Subir Logo
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageChange(e, "logo")}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Banner */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    Banner de la Tienda
                  </label>
                  <div className="flex flex-col items-center">
                    {previewBanner ? (
                      <div className="relative w-full">
                        <img
                          src={previewBanner}
                          alt="Preview Banner"
                          className="w-full h-48 rounded-xl object-cover border-4 border-blue-600 shadow-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewBanner(null);
                            setFormData({ ...formData, banner: null });
                          }}
                          className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <label className="w-full h-48 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">
                          Subir Banner (1200x400px recomendado)
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageChange(e, "banner")}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* PASO 3: Contacto */}
            {paso === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email de Contacto *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="tu@email.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Te enviaremos la respuesta a este email
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.nombreContacto}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nombreContacto: e.target.value,
                      })
                    }
                    placeholder="Tu nombre completo"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Teléfono de Contacto
                  </label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) =>
                      setFormData({ ...formData, telefono: e.target.value })
                    }
                    placeholder="809-123-4567"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={formData.direccion}
                    onChange={(e) =>
                      setFormData({ ...formData, direccion: e.target.value })
                    }
                    placeholder="Santiago, República Dominicana"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    📋 Proceso de Aprobación
                  </h4>
                  <p className="text-sm text-blue-700">
                    Playcenter Universal revisará tu solicitud. Te contactaremos
                    en 24-48 horas con la respuesta.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Botones de Navegación */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              {paso > 1 ? (
                <button
                  type="button"
                  onClick={pasoAnterior}
                  className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 font-semibold"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Anterior
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 font-semibold"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Cancelar
                </button>
              )}

              {paso < 3 ? (
                <button
                  type="button"
                  onClick={pasoSiguiente}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Enviar Solicitud
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
