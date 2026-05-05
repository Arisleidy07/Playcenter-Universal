import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  Store,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Send,
  Clock,
  AlertTriangle,
  X,
} from "lucide-react";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import ToastNotification from "../components/ToastNotification";
import { NotificationHelpers } from "../hooks/useNotifications";

export default function SolicitarVender() {
  const navigate = useNavigate();
  const { usuario, usuarioInfo } = useAuth();
  const { darkMode } = useTheme();
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

  // Sistema de notificaciones
  const [notifications, setNotifications] = useState([]);

  const showNotification = (message, type = "info", title = null) => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { id, message, type, title }]);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Refs para enfocar campos cuando falten
  const nombreRef = useRef(null);
  const emailRef = useRef(null);
  const nombreContactoRef = useRef(null);

  // Estados de validación visual
  const [errors, setErrors] = useState({});
  const [validation, setValidation] = useState({
    open: false,
    title: "Completa los campos obligatorios",
    items: [],
    focusKey: null,
  });

  useEffect(() => {
    if (typeof document === "undefined") return;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const scrollBarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, []);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email || "").trim());
  };

  const validateStepFields = (step) => {
    const errs = {};
    const items = [];
    let focusKey = null;

    if (step === 1) {
      if (!formData.nombre || !formData.nombre.trim()) {
        errs.nombre = "El nombre de tu tienda es obligatorio";
        items.push("Ingresa el nombre de tu tienda");
        focusKey = focusKey || "nombre";
      } else if (formData.nombre.trim().length < 3) {
        errs.nombre = "El nombre debe tener al menos 3 caracteres";
        items.push("El nombre de la tienda debe tener al menos 3 caracteres");
        focusKey = focusKey || "nombre";
      }
    }

    if (step === 3) {
      if (!formData.email || !formData.email.trim()) {
        errs.email = "El email es obligatorio";
        items.push("Ingresa tu email de contacto");
        focusKey = focusKey || "email";
      } else if (!validateEmail(formData.email)) {
        errs.email = "Ingresa un email válido";
        items.push("El email debe tener un formato válido");
        focusKey = focusKey || "email";
      }

      if (!formData.nombreContacto || !formData.nombreContacto.trim()) {
        errs.nombreContacto = "El nombre de contacto es obligatorio";
        items.push("Ingresa tu nombre completo");
        focusKey = focusKey || "nombreContacto";
      }
    }

    return { valid: items.length === 0, errs, items, focusKey };
  };

  const openValidationModal = ({ items, focusKey, errs, title }) => {
    setErrors((prev) => ({ ...prev, ...errs }));
    setValidation({
      open: true,
      title: title || "Completa los campos obligatorios",
      items,
      focusKey: focusKey || null,
    });
    if (focusKey === "nombre") setPaso(1);
    if (focusKey === "email" || focusKey === "nombreContacto") setPaso(3);
  };

  const closeValidationModal = () => {
    setValidation((prev) => ({ ...prev, open: false }));
  };

  // Enfocar campo correspondiente al cerrar el modal
  useEffect(() => {
    if (!validation.open && validation.focusKey) {
      const map = {
        nombre: nombreRef,
        email: emailRef,
        nombreContacto: nombreContactoRef,
      };
      const target = map[validation.focusKey];
      if (target && target.current) {
        setTimeout(() => {
          try {
            target.current.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
            target.current.focus();
          } catch (_) {}
        }, 50);
      }
    }
  }, [validation.open]);

  const handleImageChange = (e, tipo) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showNotification(
        "La imagen no debe superar 5MB. Por favor elige una imagen más pequeña.",
        "warning",
        "Imagen muy grande",
      );
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

    // Validar todos los pasos requeridos
    const v1 = validateStepFields(1);
    const v3 = validateStepFields(3);
    const combined = {
      items: [...v1.items, ...v3.items],
      errs: { ...v1.errs, ...v3.errs },
      focusKey: v1.focusKey || v3.focusKey || null,
    };
    if (combined.items.length > 0) {
      openValidationModal(combined);
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

      const docRef = await addDoc(
        collection(db, "solicitudes_vendedor"),
        solicitudData,
      );

      // 2.5 Notificar al admin (in-app)
      try {
        await NotificationHelpers.newSellerRequest({
          id: docRef.id,
          tiendaNombre: formData.nombre,
          nombreContacto: formData.nombreContacto,
          email: formData.email,
        });
      } catch (notifErr) {
        // No crítico — la solicitud se creó igual
        console.warn("No se pudo crear notificación al admin:", notifErr);
      }

      // 3. Mostrar mensaje de éxito
      showNotification(
        "¡Solicitud enviada exitosamente!",
        "success",
        "¡Éxito!",
      );
      setTimeout(() => setEnviado(true), 500);
    } catch (error) {
      showNotification(
        "Hubo un error al enviar tu solicitud. Por favor intenta de nuevo.",
        "error",
        "Error al enviar",
      );
    } finally {
      setLoading(false);
    }
  };

  const pasoAnterior = () => {
    if (paso > 1) setPaso(paso - 1);
  };

  const pasoSiguiente = () => {
    if (paso === 1) {
      const v = validateStepFields(1);
      if (!v.valid) {
        openValidationModal(v);
        return;
      }
    }
    if (paso < 3) setPaso(paso + 1);
  };

  // Pantalla de éxito
  if (enviado) {
    const successOverlay = (
      <motion.div
        className="fixed inset-0 z-[10000] overflow-y-auto bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center py-12 px-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center border border-gray-200 dark:border-slate-700"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
            ¡Solicitud Enviada!
          </h1>

          <div className="bg-blue-50 border border-blue-200 dark:bg-slate-800 dark:border-slate-700 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3 text-left">
              <Clock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-blue-900 dark:text-white mb-2">
                  Playcenter Universal evaluará tu solicitud
                </h3>
                <p className="text-sm text-blue-700 dark:text-slate-300">
                  Te enviaremos la respuesta a <strong>{formData.email}</strong>{" "}
                  en las próximas 24-48 horas.
                </p>
              </div>
            </div>
          </div>

          <p className="text-gray-600 dark:text-slate-300 mb-8">
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
      </motion.div>
    );

    if (typeof document === "undefined") return successOverlay;
    return createPortal(successOverlay, document.body);
  }

  const formOverlay = (
    <motion.div
      className="fixed inset-0 z-[10000] overflow-y-auto bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-12 px-4"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-blue-600 rounded-full overflow-hidden mb-4">
            <img
              src="/logos/perfil/6.jpg"
              alt="Perfil"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
            Solicita Vender en Playcenter
          </h1>
          <p className="text-lg text-gray-600 dark:text-slate-300">
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
                    : "bg-gray-200 text-gray-400 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                {paso > num ? <CheckCircle2 className="w-6 h-6" /> : num}
              </div>
              {num < 3 && (
                <div
                  className={`w-16 h-1 ${
                    paso > num ? "bg-blue-600" : "bg-gray-200 dark:bg-slate-700"
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
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-slate-700"
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
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    Nombre de tu Tienda *
                  </label>
                  <input
                    type="text"
                    ref={nombreRef}
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    placeholder="Ej: TecnoStore, GameZone, FashionHub"
                    aria-invalid={Boolean(errors.nombre)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 border-gray-300 dark:border-slate-600 dark:focus:ring-blue-400 dark:focus:border-blue-400 ${
                      errors.nombre ? "border-red-400 dark:border-red-500" : ""
                    }`}
                    required
                  />
                  {errors.nombre && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.nombre}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                    Eslogan (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.eslogan}
                    onChange={(e) =>
                      setFormData({ ...formData, eslogan: e.target.value })
                    }
                    placeholder="Ej: Los mejores productos gaming de RD"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) =>
                      setFormData({ ...formData, descripcion: e.target.value })
                    }
                    placeholder="Cuéntanos sobre tu negocio..."
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 dark:focus:ring-blue-400 dark:focus:border-blue-400 resize-none"
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
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    Logo de la Tienda
                  </label>
                  <div className="flex flex-col items-center">
                    {previewLogo ? (
                      <div className="relative">
                        <img
                          src={previewLogo}
                          alt="Preview Logo"
                          className="w-32 h-32 rounded-full object-cover border-4 border-blue-600 dark:border-blue-500 shadow-lg bg-white dark:bg-slate-700"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewLogo(null);
                            setFormData({ ...formData, logo: null });
                          }}
                          className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 dark:bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-600 dark:hover:bg-red-700 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <label className="w-32 h-32 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-full flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors bg-white dark:bg-slate-700">
                        <Upload className="w-8 h-8 text-gray-400 dark:text-slate-500 mb-2" />
                        <span className="text-xs text-gray-500 dark:text-slate-400">
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
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    Banner de la Tienda
                  </label>
                  <div className="flex flex-col items-center">
                    {previewBanner ? (
                      <div className="relative w-full">
                        <img
                          src={previewBanner}
                          alt="Preview Banner"
                          className="w-full h-48 rounded-xl object-cover border-4 border-blue-600 dark:border-blue-500 shadow-lg bg-white dark:bg-slate-700"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewBanner(null);
                            setFormData({ ...formData, banner: null });
                          }}
                          className="absolute top-2 right-2 w-8 h-8 bg-red-500 dark:bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-600 dark:hover:bg-red-700 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <label className="w-full h-48 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors bg-white dark:bg-slate-700">
                        <Upload className="w-8 h-8 text-gray-400 dark:text-slate-500 mb-2" />
                        <span className="text-sm text-gray-500 dark:text-slate-400">
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
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                    Email de Contacto *
                  </label>
                  <input
                    type="email"
                    ref={emailRef}
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="tu@email.com"
                    aria-invalid={Boolean(errors.email)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 border-gray-300 dark:border-slate-600 dark:focus:ring-blue-400 dark:focus:border-blue-400 ${
                      errors.email ? "border-red-400 dark:border-red-500" : ""
                    }`}
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Te enviaremos la respuesta a este email
                  </p>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    ref={nombreContactoRef}
                    value={formData.nombreContacto}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nombreContacto: e.target.value,
                      })
                    }
                    placeholder="Tu nombre completo"
                    aria-invalid={Boolean(errors.nombreContacto)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 border-gray-300 dark:border-slate-600 dark:focus:ring-blue-400 dark:focus:border-blue-400 ${
                      errors.nombreContacto
                        ? "border-red-400 dark:border-red-500"
                        : ""
                    }`}
                    required
                  />
                  {errors.nombreContacto && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.nombreContacto}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                    Teléfono de Contacto
                  </label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) =>
                      setFormData({ ...formData, telefono: e.target.value })
                    }
                    placeholder="809-123-4567"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={formData.direccion}
                    onChange={(e) =>
                      setFormData({ ...formData, direccion: e.target.value })
                    }
                    placeholder="Santiago, República Dominicana"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 dark:bg-slate-800 dark:border-slate-700 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 dark:text-white mb-2">
                    Proceso de Aprobación
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-slate-300">
                    Playcenter Universal revisará tu solicitud. Te contactaremos
                    en 24-48 horas con la respuesta.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Botones de Navegación - RESPONSIVE MEJORADO */}
            <div className="flex flex-row items-stretch sm:items-center justify-between gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
              {paso > 1 ? (
                <button
                  type="button"
                  onClick={pasoAnterior}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-3 text-gray-600 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white font-semibold"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Anterior
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-3 text-gray-600 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white font-semibold"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Cancelar
                </button>
              )}

              {paso < 3 ? (
                <button
                  type="button"
                  onClick={pasoSiguiente}
                  className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 rounded-lg font-semibold transition-colors ${
                    darkMode
                      ? "bg-yellow-400 text-slate-900 hover:bg-yellow-500"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 sm:flex-none px-4 sm:px-8 py-3 rounded-lg font-bold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                    darkMode
                      ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 hover:from-yellow-500 hover:to-yellow-600"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
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

        {/* Sistema de notificaciones */}
        <ToastNotification
          notifications={notifications}
          onRemove={removeNotification}
        />

        {/* Modal de validación de campos obligatorios */}
        <AnimatePresence>
          {validation.open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
              role="presentation"
              onClick={closeValidationModal}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", duration: 0.35 }}
                onClick={(e) => e.stopPropagation()}
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="validation-modal-title"
                className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="w-10 h-10 rounded-full bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <h3
                    id="validation-modal-title"
                    className="text-base sm:text-lg font-bold text-slate-900 dark:text-white"
                  >
                    {validation.title}
                  </h3>
                  <button
                    onClick={closeValidationModal}
                    className="ml-auto p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label="Cerrar"
                  >
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5">
                  {validation.items && validation.items.length > 0 ? (
                    <ul className="list-disc list-inside space-y-2 text-sm text-slate-700 dark:text-slate-300">
                      {validation.items.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      Completa los campos resaltados para continuar.
                    </p>
                  )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
                  <button
                    onClick={closeValidationModal}
                    className="px-4 py-2 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    Entendido
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );

  if (typeof document === "undefined") return formOverlay;
  return createPortal(formOverlay, document.body);
}
