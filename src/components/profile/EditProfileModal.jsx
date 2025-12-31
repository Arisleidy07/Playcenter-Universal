import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactDOM from "react-dom";
import {
  Camera,
  X,
  Loader2,
  AlertCircle,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import useDeviceDetection from "../../hooks/useDeviceDetection";

export default function EditProfileModal({
  isOpen,
  open,
  onClose,
  initialInfo,
  initialData,
  onSave,
  saving,
  onOpenAddressModal,
}) {
  // Compatibilidad con ambos nombres de prop
  const modalOpen = isOpen !== undefined ? isOpen : open;
  // Usar initialData si existe, sino initialInfo
  const data = initialData || initialInfo || {};

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [email, setEmail] = useState("");
  const [newPhoto, setNewPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [errors, setErrors] = useState({});
  const [fileError, setFileError] = useState("");
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const { isMobile, isTablet, isMobileOrTablet } = useDeviceDetection();

  // Precargar TODOS los datos cuando el modal se abre - CRÍTICO
  useEffect(() => {
    if (modalOpen) {
      // Cargar todos los datos actuales del usuario - NUNCA dejar vacío si existe
      const displayName = data?.displayName || data?.nombre || "";
      const telefonoValue = data?.telefono || "";
      const direccionValue = data?.direccion || data?.direccionCompleta || "";
      // CRÍTICO: Email SIEMPRE debe mostrarse si existe
      const emailValue = data?.email || "";

      // SIEMPRE actualizar con los datos disponibles
      setNombre(displayName);
      setTelefono(telefonoValue);
      setDireccion(direccionValue);
      setEmail(emailValue);

      // CRÍTICO: Cargar foto actual
      // Priorizar fotoURL de Firestore (puede ser string vacío si se eliminó)
      // Si fotoURL está definido en Firestore (incluso si es ""), usarlo
      // Solo usar photoURL de Auth si fotoURL NO está definido en Firestore
      let currentPhoto = null;
      if (data?.hasOwnProperty("fotoURL")) {
        // Si fotoURL existe en Firestore (puede ser "" si se eliminó)
        if (data.fotoURL && data.fotoURL !== "") {
          currentPhoto = data.fotoURL;
        }
        // Si fotoURL es "", no usar photoURL de Auth (foto fue eliminada intencionalmente)
      } else if (data?.photoURL && data?.photoURL !== "") {
        // Solo usar photoURL de Auth si fotoURL no está en Firestore
        currentPhoto = data.photoURL;
      }

      setPhotoPreview(currentPhoto);
      setNewPhoto(null);
      setRemovePhoto(false);
      setErrors({});
      setFileError("");
    }
  }, [modalOpen, data]);

  // Bloquear scroll del body y manejar ESC
  useEffect(() => {
    if (!modalOpen) return;

    // Bloquear scroll
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    // Manejar ESC para cerrar
    const handleEscape = (e) => {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      // Restaurar scroll
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      window.scrollTo(0, scrollY);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [modalOpen, onClose]);

  const validateFile = (file) => {
    if (!file.type.startsWith("image/")) {
      return "Solo se permiten archivos de imagen";
    }
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return "La imagen es muy grande. Máximo 5MB";
    }
    return null;
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      setFileError(error);
      setNewPhoto(null);
      setPhotoPreview(null);
      // limpiar el input que disparó el evento
      try {
        e.target.value = "";
      } catch {}
      return;
    }

    setFileError("");
    setNewPhoto(file);
    setRemovePhoto(false);
    // cerrar sheet si estaba abierto
    setShowPhotoOptions(false);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
    // permitir volver a seleccionar el mismo archivo después
    try {
      e.target.value = "";
    } catch {}
  };

  const handleRemovePhoto = () => {
    setNewPhoto(null);
    setPhotoPreview(null);
    setRemovePhoto(true);
    setFileError("");
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  const openCamera = () => {
    // fallback por si el label no dispara en algún navegador
    if (cameraInputRef.current) cameraInputRef.current.click();
  };

  const openGallery = () => {
    if (galleryInputRef.current) galleryInputRef.current.click();
  };

  const validateForm = () => {
    const newErrors = {};

    if (!nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    } else if (nombre.trim().length < 2) {
      newErrors.nombre = "El nombre debe tener al menos 2 caracteres";
    }

    if (telefono && telefono.trim()) {
      const phoneRegex = /^[\d\s\-\(\)]+$/;
      if (!phoneRegex.test(telefono.trim())) {
        newErrors.telefono = "Formato de teléfono inválido";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    onSave({
      displayName: nombre.trim(),
      telefono: telefono.trim(),
      direccion: direccion.trim(),
      newPhoto,
      removePhoto,
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  if (!modalOpen) return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      {modalOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2147483646] bg-slate-950/55 backdrop-blur-sm"
            onClick={onClose}
          />

          <div className="fixed inset-0 z-[2147483647] flex items-stretch md:items-center justify-center p-0 md:p-4">
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={handlePhotoChange}
              className="hidden"
            />
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full h-full md:hidden flex flex-col pointer-events-auto bg-white dark:bg-slate-900/95 rounded-none shadow-none border-0"
              style={{
                height: "min(100svh, 100dvh, 100vh)",
                maxHeight: "min(100svh, 100dvh, 100vh)",
              }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Editar perfil"
            >
              <div
                className="sticky top-0 bg-white/95 dark:bg-slate-900/95 pb-2 z-20 border-b border-slate-200/80 dark:border-slate-700/60 flex-shrink-0 backdrop-blur"
                style={{ paddingTop: "max(env(safe-area-inset-top), 12px)" }}
              >
                <div className="flex items-center justify-between px-5 pb-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Editar Perfil
                  </h3>
                  <button
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    onClick={onClose}
                    aria-label="Cerrar"
                    type="button"
                  >
                    <X
                      size={18}
                      className="text-slate-600 dark:text-slate-400"
                    />
                  </button>
                </div>
              </div>

              <div
                className="flex-1 overflow-y-auto overflow-x-hidden px-5 py-4"
                style={{
                  minHeight: 0,
                  WebkitOverflowScrolling: "touch",
                  overscrollBehavior: "contain",
                }}
              >
                <div className="space-y-4 pb-6">
                  <div className="flex flex-col items-center py-2">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-700 dark:bg-slate-600 flex items-center justify-center text-white text-2xl font-semibold shadow-md border-2 border-slate-200 dark:border-slate-700">
                      {photoPreview && !removePhoto ? (
                        <img
                          src={photoPreview}
                          alt="Profile"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <span>{(nombre?.charAt(0) || "U").toUpperCase()}</span>
                      )}
                    </div>

                    <div className="mt-3 flex flex-col items-center gap-2">
                      <button
                        onClick={() =>
                          isMobile || isTablet
                            ? setShowPhotoOptions(true)
                            : openGallery()
                        }
                        disabled={saving}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-xs transition-colors flex items-center gap-1.5 shadow-sm hover:shadow-md disabled:opacity-50"
                        type="button"
                      >
                        <Camera size={14} />
                        Cambiar imagen
                      </button>

                      <button
                        onClick={handleRemovePhoto}
                        disabled={saving || !photoPreview || removePhoto}
                        className="px-4 py-2 border border-slate-200/80 dark:border-slate-700/60 bg-white dark:bg-slate-800/40 text-slate-700 dark:text-slate-200 rounded-lg font-medium text-xs hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-all disabled:opacity-50"
                        type="button"
                      >
                        Quitar
                      </button>

                      {newPhoto && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
                          {newPhoto.name} ({formatFileSize(newPhoto.size)})
                        </div>
                      )}

                      {fileError && (
                        <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
                          <AlertCircle size={12} />
                          <span>{fileError}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Nombre completo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className={`w-full px-3 py-2.5 border rounded-lg text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.nombre
                          ? "border-red-500 focus:ring-red-500"
                          : "border-slate-200/80 dark:border-slate-700/60"
                      }`}
                      value={nombre}
                      onChange={(e) => {
                        setNombre(e.target.value);
                        if (errors.nombre) {
                          setErrors({ ...errors, nombre: "" });
                        }
                      }}
                      placeholder="Tu nombre completo"
                      disabled={saving}
                    />
                    {errors.nombre && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle size={11} />
                        {errors.nombre}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2.5 border rounded-lg text-sm text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/60 cursor-not-allowed"
                      value={email || "No disponible"}
                      disabled
                      readOnly
                    />
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      El email no se puede cambiar
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      className={`w-full px-3 py-2.5 border rounded-lg text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.telefono
                          ? "border-red-500 focus:ring-red-500"
                          : "border-slate-200/80 dark:border-slate-700/60"
                      }`}
                      value={telefono}
                      onChange={(e) => {
                        setTelefono(e.target.value);
                        if (errors.telefono) {
                          setErrors({ ...errors, telefono: "" });
                        }
                      }}
                      placeholder="809-555-1234"
                      disabled={saving}
                    />
                    {errors.telefono && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle size={11} />
                        {errors.telefono}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Dirección completa
                    </label>
                    <div className="flex items-start gap-2">
                      <textarea
                        className="flex-1 px-3 py-2.5 border rounded-lg text-sm text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/60 resize-none cursor-not-allowed"
                        rows={2}
                        value={direccion}
                        readOnly
                        placeholder="Tu dirección completa"
                        disabled={saving}
                      />
                      {onOpenAddressModal && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (onClose) {
                              onClose();
                            }
                            setTimeout(() => {
                              if (onOpenAddressModal) {
                                onOpenAddressModal();
                              }
                            }, 200);
                          }}
                          className="px-2.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800/50 border border-slate-300/80 dark:border-slate-700/60 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all whitespace-nowrap flex-shrink-0 cursor-pointer"
                          title="Cambiar dirección"
                        >
                          Cambiar
                        </button>
                      )}
                    </div>
                    {!direccion && (
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        No hay dirección configurada
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div
                className="sticky bottom-0 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200/80 dark:border-slate-700/60 px-5 py-3 flex gap-2.5 backdrop-blur"
                style={{
                  paddingBottom: "max(env(safe-area-inset-bottom), 12px)",
                }}
              >
                <button
                  onClick={onClose}
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 border border-slate-200/80 dark:border-slate-700/60 bg-white dark:bg-slate-800/40 text-slate-700 dark:text-slate-200 rounded-lg font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-all disabled:opacity-50"
                  type="button"
                >
                  Cancelar
                </button>
                <button
                  disabled={saving || Object.keys(errors).length > 0}
                  onClick={handleSave}
                  className="flex-1 px-4 py-2.5 text-white bg-blue-600 hover:bg-blue-700 border border-blue-600 rounded-lg font-semibold text-sm transition-colors shadow-sm hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5"
                  type="button"
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>Guardar</span>
                  )}
                </button>
              </div>
            </motion.div>

            {/* Action Sheet: elegir origen de la foto */}
            <AnimatePresence>
              {showPhotoOptions && isMobileOrTablet && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[2147483647] flex items-end md:items-center justify-center pointer-events-auto"
                >
                  <div
                    className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                    onClick={() => setShowPhotoOptions(false)}
                  />
                  <motion.div
                    initial={{ y: 16, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 16, opacity: 0 }}
                    transition={{ type: "spring", damping: 24, stiffness: 280 }}
                    className="w-full md:w-auto md:min-w-[360px] bg-white dark:bg-slate-900 rounded-t-2xl md:rounded-2xl border border-slate-200/70 dark:border-slate-700/60 shadow-2xl overflow-hidden"
                    style={{
                      paddingBottom: "max(env(safe-area-inset-bottom), 8px)",
                    }}
                  >
                    <div className="p-4">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                        Cambiar imagen
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                        Elige el origen de la foto
                      </p>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={openGallery}
                          className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-semibold"
                        >
                          <ImageIcon size={16} /> Fototeca
                        </button>
                        <button
                          type="button"
                          onClick={openCamera}
                          className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors text-sm font-semibold"
                        >
                          <Camera size={16} /> Cámara
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPhotoOptions(false)}
                        className="mt-3 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-semibold"
                      >
                        Cancelar
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="hidden md:block relative w-full max-w-3xl bg-white dark:bg-slate-900/95 rounded-2xl shadow-2xl border border-slate-200/70 dark:border-slate-700/60 overflow-hidden pointer-events-auto flex flex-col"
              style={{ maxHeight: "90vh" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-700 dark:bg-slate-600 flex items-center justify-center text-white text-xl font-semibold shadow-md border border-slate-200 dark:border-slate-700 flex-shrink-0">
                    {photoPreview && !removePhoto ? (
                      <img
                        src={photoPreview}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <span>{(nombre?.charAt(0) || "U").toUpperCase()}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate">
                      {nombre || "Editar Perfil"}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                      {email || ""}
                    </p>
                  </div>
                </div>
                <button
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors"
                  onClick={onClose}
                  aria-label="Cerrar"
                  type="button"
                >
                  <X size={18} className="text-slate-600 dark:text-slate-400" />
                </button>
              </div>

              <div
                className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-5"
                style={{ minHeight: 0, WebkitOverflowScrolling: "touch" }}
              >
                <div className="space-y-5 pb-6">
                  <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-800/35 p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                          Recomendado: imagen cuadrada, máximo 5MB.
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={openGallery}
                            disabled={saving}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-xs font-semibold transition-colors disabled:opacity-60"
                          >
                            <Camera size={14} />
                            Cambiar imagen
                          </button>

                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            disabled={saving || !photoPreview || removePhoto}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200/80 dark:border-slate-700/60 bg-white dark:bg-slate-800/40 text-slate-700 dark:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 text-xs font-semibold transition-colors disabled:opacity-60"
                          >
                            <Trash2 size={14} />
                            Quitar
                          </button>
                        </div>
                      </div>
                    </div>

                    {newPhoto && (
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {newPhoto.name} ({formatFileSize(newPhoto.size)})
                      </div>
                    )}

                    {fileError && (
                      <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
                        <AlertCircle size={12} />
                        <span>{fileError}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Nombre completo <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className={`w-full px-3 py-2.5 border rounded-lg text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors.nombre
                            ? "border-red-500 focus:ring-red-500"
                            : "border-slate-200 dark:border-slate-700"
                        }`}
                        value={nombre}
                        onChange={(e) => {
                          setNombre(e.target.value);
                          if (errors.nombre) {
                            setErrors({ ...errors, nombre: "" });
                          }
                        }}
                        placeholder="Tu nombre completo"
                        disabled={saving}
                      />
                      {errors.nombre && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                          <AlertCircle size={11} />
                          {errors.nombre}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        className="w-full px-3 py-2.5 border rounded-lg text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 cursor-not-allowed"
                        value={email || "No disponible"}
                        disabled
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        className={`w-full px-3 py-2.5 border rounded-lg text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors.telefono
                            ? "border-red-500 focus:ring-red-500"
                            : "border-slate-200 dark:border-slate-700"
                        }`}
                        value={telefono}
                        onChange={(e) => {
                          setTelefono(e.target.value);
                          if (errors.telefono) {
                            setErrors({ ...errors, telefono: "" });
                          }
                        }}
                        placeholder="809-555-1234"
                        disabled={saving}
                      />
                      {errors.telefono && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                          <AlertCircle size={11} />
                          {errors.telefono}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Dirección completa
                      </label>
                      <div className="flex items-start gap-2">
                        <textarea
                          className="flex-1 px-3 py-2.5 border rounded-lg text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 resize-none cursor-not-allowed"
                          rows={2}
                          value={direccion}
                          readOnly
                          placeholder="Tu dirección completa"
                          disabled={saving}
                        />
                        {onOpenAddressModal && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (onClose) {
                                onClose();
                              }
                              setTimeout(() => {
                                if (onOpenAddressModal) {
                                  onOpenAddressModal();
                                }
                              }, 200);
                            }}
                            className="px-2.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all whitespace-nowrap flex-shrink-0 cursor-pointer"
                            title="Cambiar dirección"
                          >
                            Cambiar
                          </button>
                        )}
                      </div>
                      {!direccion && (
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          No hay dirección configurada
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200/80 dark:border-slate-700/60 px-6 py-4 flex justify-end gap-2.5 flex-shrink-0 backdrop-blur">
                <button
                  onClick={onClose}
                  disabled={saving}
                  className="px-4 py-2.5 border border-slate-200/80 dark:border-slate-700/60 bg-white dark:bg-slate-800/40 text-slate-700 dark:text-slate-200 rounded-lg font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-all disabled:opacity-50"
                  type="button"
                >
                  Cancelar
                </button>
                <button
                  disabled={saving || Object.keys(errors).length > 0}
                  onClick={handleSave}
                  className="px-4 py-2.5 text-white bg-blue-600 hover:bg-blue-700 border border-blue-600 rounded-lg font-semibold text-sm transition-colors shadow-sm hover:shadow-md disabled:opacity-50 flex items-center gap-1.5"
                  type="button"
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>Guardar cambios</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
