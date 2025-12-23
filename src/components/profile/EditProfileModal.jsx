import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, Loader2, CheckCircle2, AlertCircle, Trash2 } from "lucide-react";

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
  const fileInputRef = useRef(null);

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
      if (data?.hasOwnProperty('fotoURL')) {
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
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }
    
    setFileError("");
    setNewPhoto(file);
    setRemovePhoto(false);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setNewPhoto(null);
    setPhotoPreview(null);
    setRemovePhoto(true);
    setFileError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  if (!modalOpen) return null;

  return (
    <AnimatePresence>
      {modalOpen && (
        <>
          {/* Backdrop - Click fuera para cerrar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal Container */}
          <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center p-0 md:p-4 pointer-events-none">
            {/* Mobile: Bottom Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl md:hidden flex flex-col pointer-events-auto"
              style={{ maxHeight: '95vh', minHeight: '50vh' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle bar - Sticky */}
              <div className="sticky top-0 bg-white dark:bg-slate-900 pt-3 pb-2 z-20 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                <div className="mx-auto h-1.5 w-16 bg-slate-300 dark:bg-slate-600 rounded-full mb-3" />
                {/* Header */}
                <div className="flex items-center justify-between px-5 pb-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Editar Perfil
                  </h3>
                  <button
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    onClick={onClose}
                    aria-label="Cerrar"
                  >
                    <X size={18} className="text-slate-600 dark:text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden px-5 py-4" style={{ minHeight: 0, WebkitOverflowScrolling: 'touch' }}>
                <div className="space-y-4 pb-6">
                  {/* Profile Photo Section - Compact */}
                  <div className="flex flex-col items-center py-2">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-700 dark:bg-slate-600 flex items-center justify-center text-white text-2xl font-semibold shadow-md border-2 border-slate-200 dark:border-slate-700">
                        {photoPreview && !removePhoto ? (
                          <img
                            src={photoPreview}
                            alt="Profile"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <span>{(nombre?.charAt(0) || "U").toUpperCase()}</span>
                        )}
                      </div>
                      {/* Botón eliminar - Mostrar si hay foto */}
                      {photoPreview && !removePhoto && (
                        <button
                          onClick={handleRemovePhoto}
                          className="absolute -top-1 -right-1 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all shadow-md hover:scale-110 z-10"
                          aria-label="Eliminar foto"
                          type="button"
                        >
                          <X size={14} />
                        </button>
                      )}
                      {removePhoto && (
                        <div className="absolute -top-1 -right-1 w-7 h-7 bg-slate-400 rounded-full flex items-center justify-center z-10">
                          <X size={14} className="text-white" />
                        </div>
                      )}
                    </div>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    
                    <div className="mt-3 flex flex-col items-center gap-1.5">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={saving}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-lg font-medium text-xs transition-all flex items-center gap-1.5 shadow-sm hover:shadow-md disabled:opacity-50"
                      >
                        <Camera size={14} />
                        {photoPreview && !removePhoto ? "Cambiar" : "Subir foto"}
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

                  {/* Form Fields - Compact */}
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

                  <div>
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
                            // Cerrar modal de perfil primero
                            if (onClose) {
                              onClose();
                            }
                            // Abrir modal de dirección después de un breve delay para que el modal anterior se cierre
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

              {/* Action Buttons - Sticky at bottom */}
              <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 px-5 py-3 flex gap-2.5">
                <button
                  onClick={onClose}
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  disabled={saving || Object.keys(errors).length > 0}
                  onClick={handleSave}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-lg font-medium text-sm transition-all shadow-sm hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Guardar</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>

            {/* Desktop: Centered Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="hidden md:block relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden pointer-events-auto flex flex-col"
              style={{ maxHeight: '90vh' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header - Sticky */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Editar Perfil
                </h3>
                <button
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  onClick={onClose}
                  aria-label="Cerrar"
                >
                  <X size={18} className="text-slate-600 dark:text-slate-400" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden px-5 py-4" style={{ minHeight: 0, WebkitOverflowScrolling: 'touch' }}>
                <div className="space-y-4 pb-6">
                  {/* Profile Photo Section - Compact */}
                  <div className="flex flex-col items-center py-2">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-700 dark:bg-slate-600 flex items-center justify-center text-white text-3xl font-semibold shadow-md border-2 border-slate-200 dark:border-slate-700">
                        {photoPreview && !removePhoto ? (
                          <img
                            src={photoPreview}
                            alt="Profile"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <span>{(nombre?.charAt(0) || "U").toUpperCase()}</span>
                        )}
                      </div>
                      {/* Botón eliminar - Mostrar si hay foto */}
                      {photoPreview && !removePhoto && (
                        <button
                          onClick={handleRemovePhoto}
                          className="absolute -top-1 -right-1 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all shadow-md hover:scale-110 z-10"
                          aria-label="Eliminar foto"
                          type="button"
                        >
                          <X size={14} />
                        </button>
                      )}
                      {removePhoto && (
                        <div className="absolute -top-1 -right-1 w-7 h-7 bg-slate-400 rounded-full flex items-center justify-center z-10">
                          <X size={14} className="text-white" />
                        </div>
                      )}
                    </div>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    
                    <div className="mt-3 flex flex-col items-center gap-1.5">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={saving}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-lg font-medium text-xs transition-all flex items-center gap-1.5 shadow-sm hover:shadow-md disabled:opacity-50"
                      >
                        <Camera size={14} />
                        {photoPreview && !removePhoto ? "Cambiar foto" : "Subir foto"}
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

                  {/* Form Fields - Compact */}
                  <div className="space-y-4">
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

                    <div>
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
                              // Cerrar modal de perfil primero
                              if (onClose) {
                                onClose();
                              }
                              // Abrir modal de dirección después de un breve delay para que el modal anterior se cierre
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

              {/* Action Buttons - Sticky at bottom */}
              <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 px-5 py-3 flex justify-end gap-2.5 flex-shrink-0">
                <button
                  onClick={onClose}
                  disabled={saving}
                  className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  disabled={saving || Object.keys(errors).length > 0}
                  onClick={handleSave}
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-lg font-medium text-sm transition-all shadow-sm hover:shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Guardar cambios</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
