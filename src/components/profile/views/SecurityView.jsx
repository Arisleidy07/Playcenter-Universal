import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Key,
  Mail,
  User,
  Lock,
  Phone,
  CheckCircle,
  Eye,
  EyeOff,
  ChevronRight,
  ArrowLeft,
  Smartphone,
  Fingerprint,
  X,
  Edit3,
  AlertCircle,
} from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import { useAuth } from "../../../context/AuthContext";
import { getFunctions, httpsCallable } from "firebase/functions";
import {
  updatePassword,
  updateEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db, auth } from "../../../firebase";

const functions = getFunctions();

// Spinner estilo iOS
const Spinner = ({ size = 28 }) => {
  const blades = Array.from({ length: 12 }, (_, i) => i);

  return (
    <>
      <style>{`
        .ios-spinner {
          position: relative;
          display: inline-block;
          width: ${size}px;
          height: ${size}px;
        }
        .ios-spinner .blade {
          position: absolute;
          left: ${size * 0.4629}px;
          bottom: 0;
          width: ${size * 0.074}px;
          height: ${size * 0.2777}px;
          border-radius: ${size * 0.0555}px;
          background-color: transparent;
          transform-origin: center ${size * -0.2222}px;
          animation: ios-spinner-fade 1s infinite linear;
        }
        .ios-spinner .blade:nth-child(1) { animation-delay: 0s; transform: rotate(0deg); }
        .ios-spinner .blade:nth-child(2) { animation-delay: 0.083s; transform: rotate(30deg); }
        .ios-spinner .blade:nth-child(3) { animation-delay: 0.166s; transform: rotate(60deg); }
        .ios-spinner .blade:nth-child(4) { animation-delay: 0.249s; transform: rotate(90deg); }
        .ios-spinner .blade:nth-child(5) { animation-delay: 0.332s; transform: rotate(120deg); }
        .ios-spinner .blade:nth-child(6) { animation-delay: 0.415s; transform: rotate(150deg); }
        .ios-spinner .blade:nth-child(7) { animation-delay: 0.498s; transform: rotate(180deg); }
        .ios-spinner .blade:nth-child(8) { animation-delay: 0.581s; transform: rotate(210deg); }
        .ios-spinner .blade:nth-child(9) { animation-delay: 0.664s; transform: rotate(240deg); }
        .ios-spinner .blade:nth-child(10) { animation-delay: 0.747s; transform: rotate(270deg); }
        .ios-spinner .blade:nth-child(11) { animation-delay: 0.83s; transform: rotate(300deg); }
        .ios-spinner .blade:nth-child(12) { animation-delay: 0.913s; transform: rotate(330deg); }
        @keyframes ios-spinner-fade {
          0% { background-color: #69717d; }
          100% { background-color: transparent; }
        }
      `}</style>
      <div className="ios-spinner">
        {blades.map((i) => (
          <div key={i} className="blade" />
        ))}
      </div>
    </>
  );
};

// Alerta de éxito
const SuccessModal = ({ message, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[99999] flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4"
  >
    <motion.div
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0.9 }}
      className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 text-center"
    >
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
        <CheckCircle size={32} className="text-green-600 dark:text-green-400" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        ¡Listo!
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
      <button
        onClick={onClose}
        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors"
      >
        Aceptar
      </button>
    </motion.div>
  </motion.div>
);

export default function SecurityView() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { usuario, usuarioInfo, actualizarUsuarioInfo } = useAuth();
  const passwordInputRef = useRef(null);
  const codeInputRef = useRef(null);

  const [isVerified, setIsVerified] = useState(false);
  const [currentStep, setCurrentStep] = useState("loading");
  const [hasPasswordProvider, setHasPasswordProvider] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [userData, setUserData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    photoURL: "",
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [verifyingPassword, setVerifyingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [verificationCode, setVerificationCode] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [codeError, setCodeError] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  const [newPasswordForReset, setNewPasswordForReset] = useState("");
  const [confirmPasswordForReset, setConfirmPasswordForReset] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showEditNewPassword, setShowEditNewPassword] = useState(false);
  const [showEditConfirmPassword, setShowEditConfirmPassword] = useState(false);
  const [savingChanges, setSavingChanges] = useState(false);
  const [editError, setEditError] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      const currentUser = auth.currentUser || usuario;
      if (currentUser) {
        // Verificar si hay sesión de verificación válida (2 horas)
        const savedVerification = localStorage.getItem(
          `security_verified_${currentUser.uid}`
        );
        let alreadyVerified = false;
        if (savedVerification) {
          try {
            const { timestamp } = JSON.parse(savedVerification);
            const twoHours = 2 * 60 * 60 * 1000;
            if (Date.now() - timestamp < twoHours) {
              setIsVerified(true);
              setCurrentStep("verified");
              alreadyVerified = true;
            }
          } catch (e) {
            localStorage.removeItem(`security_verified_${currentUser.uid}`);
          }
        }

        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData({
              nombre:
                data.nombre ||
                data.displayName ||
                currentUser.displayName ||
                "",
              email: data.email || currentUser.email || "",
              telefono: data.telefono || data.phone || "",
              photoURL:
                data.fotoURL ||
                data.photoURL ||
                usuarioInfo?.fotoURL ||
                currentUser.photoURL ||
                usuarioInfo?.photoURL ||
                "",
            });
          } else {
            setUserData({
              nombre: currentUser.displayName || "",
              email: currentUser.email || "",
              telefono: "",
              photoURL:
                usuarioInfo?.fotoURL ||
                currentUser.photoURL ||
                usuarioInfo?.photoURL ||
                "",
            });
          }
        } catch (error) {
          console.error("Error cargando datos:", error);
        }

        const providers =
          currentUser.providerData?.map((p) => p.providerId) || [];
        const hasPassword = providers.includes("password");
        setHasPasswordProvider(hasPassword);

        // Si NO está verificado, mostrar opción de contraseña
        if (!alreadyVerified) {
          setCurrentStep("password");
        }
      } else {
        // Sin usuario, ir directo a password
        setCurrentStep("password");
      }
    };
    loadUserData();
  }, [usuario?.uid, usuarioInfo]);

  useEffect(() => {
    if (usuarioInfo) {
      setUserData((prev) => ({
        nombre: usuarioInfo.nombre || usuarioInfo.displayName || prev.nombre,
        email: usuarioInfo.email || auth.currentUser?.email || prev.email,
        telefono: usuarioInfo.telefono || usuarioInfo.phone || prev.telefono,
        photoURL:
          usuarioInfo.fotoURL ||
          usuarioInfo.photoURL ||
          auth.currentUser?.photoURL ||
          prev.photoURL,
      }));
    }
  }, [usuarioInfo]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep === "password" && passwordInputRef.current)
        passwordInputRef.current.focus();
      if (currentStep === "code" && codeInputRef.current)
        codeInputRef.current.focus();
    }, 150);
    return () => clearTimeout(timer);
  }, [currentStep]);

  const showSuccessModal = (msg) => {
    setSuccessMsg(msg);
    setShowSuccess(true);
  };

  const sendCodeAuto = async (email) => {
    if (!email || codeSent) return;
    setSendingCode(true);
    try {
      const sendVerificationCode = httpsCallable(
        functions,
        "sendVerificationCode"
      );
      await sendVerificationCode({
        email,
        userName: userData.nombre || "Usuario",
      });
      setCodeSent(true);
    } catch (error) {
      console.error("Error enviando código:", error);
      setCodeError("Error al enviar código");
    } finally {
      setSendingCode(false);
    }
  };

  const handleClose = () => navigate("/perfil");

  const saveVerification = () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      localStorage.setItem(
        `security_verified_${currentUser.uid}`,
        JSON.stringify({ timestamp: Date.now() })
      );
    }
  };

  const handleVerifyPassword = async () => {
    // Si el usuario no tiene proveedor de contraseña, enviar código automáticamente
    if (!hasPasswordProvider) {
      const email = auth.currentUser?.email || userData.email;
      setCurrentStep("code");
      if (email && !codeSent) {
        sendCodeAuto(email);
      }
      return;
    }

    if (!currentPassword.trim()) {
      setPasswordError("Ingresa tu contraseña");
      return;
    }
    setVerifyingPassword(true);
    setPasswordError("");
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setPasswordError("Sesión expirada");
        return;
      }
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);
      saveVerification();
      setIsVerified(true);
      showSuccessModal("Identidad verificada");
    } catch (error) {
      console.error("Error auth:", error);
      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password"
      ) {
        // Cambiar a verificación por código si falla la credencial
        setPasswordError(
          "Contraseña incorrecta. Prueba con el código por email."
        );
        setCurrentStep("code");
        sendCodeAuto(auth.currentUser?.email || userData.email);
      } else if (error.code === "auth/too-many-requests") {
        setPasswordError("Demasiados intentos. Usa código por email.");
        setCurrentStep("code");
        sendCodeAuto(auth.currentUser?.email || userData.email);
      } else {
        setPasswordError("Error de autenticación");
      }
    } finally {
      setVerifyingPassword(false);
    }
  };

  const handleSendCode = async () => {
    const email = auth.currentUser?.email || userData.email;
    if (!email) return;
    setSendingCode(true);
    setCodeError("");
    try {
      const sendVerificationCode = httpsCallable(
        functions,
        "sendVerificationCode"
      );
      await sendVerificationCode({
        email,
        userName: userData.nombre || "Usuario",
      });
      setCodeSent(true);
      setCurrentStep("code");
    } catch (error) {
      console.error("Error enviando código:", error);
      setCodeError("Error al enviar código");
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      setCodeError("El código debe tener 6 dígitos");
      return;
    }
    setVerifyingCode(true);
    setCodeError("");
    try {
      const email = auth.currentUser?.email || userData.email;
      const verifyCode = httpsCallable(functions, "verifyCode");
      const result = await verifyCode({ email, code: verificationCode });
      if (result.data.success) {
        // Si viene de "olvidé contraseña" (currentStep era code después de password)
        if (hasPasswordProvider && currentStep === "code") {
          setCurrentStep("newPassword");
        } else {
          // Verificación exitosa - guardar y entrar
          saveVerification();
          setIsVerified(true);
          showSuccessModal("Identidad verificada");
        }
      } else {
        setCodeError(result.data.error || "Código inválido");
      }
    } catch (error) {
      console.error("Error verificando código:", error);
      setCodeError("Error al verificar");
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleSetNewPassword = async () => {
    if (newPasswordForReset.length < 6) {
      setCodeError("Mínimo 6 caracteres");
      return;
    }
    if (newPasswordForReset !== confirmPasswordForReset) {
      setCodeError("Las contraseñas no coinciden");
      return;
    }
    setResettingPassword(true);
    setCodeError("");
    try {
      const email = auth.currentUser?.email || userData.email;
      const resetUserPassword = httpsCallable(functions, "resetUserPassword");
      const result = await resetUserPassword({
        email,
        code: verificationCode,
        newPassword: newPasswordForReset,
      });
      if (result.data.success) {
        saveVerification();
        setIsVerified(true);
        setHasPasswordProvider(true); // Ahora tiene contraseña
        showSuccessModal("Contraseña actualizada");
      } else {
        setCodeError(result.data.error || "Error");
      }
    } catch (error) {
      console.error("Error:", error);
      setCodeError("Error al cambiar contraseña");
    } finally {
      setResettingPassword(false);
    }
  };

  const handleSaveName = async () => {
    if (!editValue.trim()) return;
    setSavingChanges(true);
    setEditError("");
    try {
      const uid = auth.currentUser?.uid || usuario?.uid;
      await updateDoc(doc(db, "users", uid), {
        nombre: editValue.trim(),
        displayName: editValue.trim(),
      });
      setUserData((prev) => ({ ...prev, nombre: editValue.trim() }));
      actualizarUsuarioInfo?.({
        nombre: editValue.trim(),
        displayName: editValue.trim(),
      });
      showSuccessModal("Nombre actualizado");
      setEditingField(null);
    } catch (error) {
      setEditError("Error al actualizar");
    } finally {
      setSavingChanges(false);
    }
  };

  const handleSaveEmail = async () => {
    if (!editValue.includes("@")) return;
    setSavingChanges(true);
    setEditError("");
    try {
      const currentUser = auth.currentUser;
      if (currentUser) await updateEmail(currentUser, editValue.trim());
      const uid = currentUser?.uid || usuario?.uid;
      await updateDoc(doc(db, "users", uid), { email: editValue.trim() });
      setUserData((prev) => ({ ...prev, email: editValue.trim() }));
      showSuccessModal("Email actualizado");
      setEditingField(null);
    } catch (error) {
      setEditError("Error al actualizar email");
    } finally {
      setSavingChanges(false);
    }
  };

  const handleSavePhone = async () => {
    setSavingChanges(true);
    setEditError("");
    try {
      const uid = auth.currentUser?.uid || usuario?.uid;
      await updateDoc(doc(db, "users", uid), {
        telefono: editValue.trim(),
        phone: editValue.trim(),
      });
      setUserData((prev) => ({ ...prev, telefono: editValue.trim() }));
      actualizarUsuarioInfo?.({
        telefono: editValue.trim(),
        phone: editValue.trim(),
      });
      showSuccessModal("Teléfono actualizado");
      setEditingField(null);
    } catch (error) {
      setEditError("Error al actualizar");
    } finally {
      setSavingChanges(false);
    }
  };

  const handleSavePassword = async () => {
    if (newPassword.length < 6) {
      setEditError("Mínimo 6 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      setEditError("Las contraseñas no coinciden");
      return;
    }
    setSavingChanges(true);
    setEditError("");
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await updatePassword(currentUser, newPassword);
        showSuccessModal("Contraseña actualizada");
        setEditingField(null);
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      setEditError("Error al actualizar");
    } finally {
      setSavingChanges(false);
    }
  };

  const openEdit = (field) => {
    setEditingField(field);
    setEditError("");
    if (field === "name") setEditValue(userData.nombre);
    else if (field === "email") setEditValue(userData.email);
    else if (field === "phone") setEditValue(userData.telefono);
  };

  // Loading
  if (currentStep === "loading") {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <Spinner size={40} />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  // Verificación
  if (!isVerified) {
    return (
      <>
        <AnimatePresence>
          {showSuccess && (
            <SuccessModal
              message={successMsg}
              onClose={() => setShowSuccess(false)}
            />
          )}
        </AnimatePresence>

        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700"
          >
            {/* Password */}
            {currentStep === "password" && (
              <>
                <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                      <Shield
                        size={24}
                        className="text-blue-600 dark:text-blue-400"
                      />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        Verificar identidad
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Para proteger tu cuenta
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  {verifyingPassword ? (
                    <div className="py-12 flex flex-col items-center">
                      <Spinner size={36} />
                      <p className="mt-4 text-gray-600 dark:text-gray-400">
                        Verificando...
                      </p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                          Contraseña
                        </label>
                        <div className="relative">
                          <input
                            ref={passwordInputRef}
                            type={showCurrentPassword ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => {
                              setCurrentPassword(e.target.value);
                              setPasswordError("");
                            }}
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleVerifyPassword()
                            }
                            placeholder="Tu contraseña"
                            className={`w-full px-4 py-3 pr-12 rounded-xl border ${
                              passwordError
                                ? "border-red-500 bg-red-50 dark:bg-red-900/10"
                                : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                            } text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          />
                          <button
                            onClick={() =>
                              setShowCurrentPassword(!showCurrentPassword)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                          >
                            {showCurrentPassword ? (
                              <EyeOff size={20} className="text-gray-500" />
                            ) : (
                              <Eye size={20} className="text-gray-500" />
                            )}
                          </button>
                        </div>
                        {passwordError && (
                          <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                            <AlertCircle size={14} /> {passwordError}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={handleVerifyPassword}
                        disabled={!currentPassword}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white font-semibold rounded-xl transition-colors"
                      >
                        Continuar
                      </button>

                      <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                        </div>
                        <div className="relative flex justify-center">
                          <span className="px-3 text-sm bg-white dark:bg-gray-800 text-gray-500">
                            o
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={handleSendCode}
                        disabled={sendingCode}
                        className="w-full py-3 rounded-xl font-medium bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 flex items-center justify-center gap-2 transition-colors"
                      >
                        {sendingCode ? (
                          <Spinner size={20} />
                        ) : (
                          <Mail size={20} />
                        )}
                        {sendingCode ? "Enviando..." : "Verificar con email"}
                      </button>
                    </>
                  )}
                </div>
              </>
            )}

            {/* Code */}
            {currentStep === "code" && (
              <>
                <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                  {hasPasswordProvider && (
                    <button
                      onClick={() => setCurrentStep("password")}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <ArrowLeft size={20} className="text-gray-500" />
                    </button>
                  )}
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      Código de verificación
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {userData.email}
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  {sendingCode || verifyingCode ? (
                    <div className="py-12 flex flex-col items-center">
                      <Spinner size={36} />
                      <p className="mt-4 text-gray-600 dark:text-gray-400">
                        {sendingCode ? "Enviando código..." : "Verificando..."}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="text-center py-4">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                          <Mail
                            size={32}
                            className="text-blue-600 dark:text-blue-400"
                          />
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                          {codeSent
                            ? "Revisa tu correo"
                            : "Te enviaremos un código"}
                        </p>
                      </div>

                      <input
                        ref={codeInputRef}
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={verificationCode}
                        onChange={(e) => {
                          setVerificationCode(
                            e.target.value.replace(/\D/g, "")
                          );
                          setCodeError("");
                        }}
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          verificationCode.length === 6 &&
                          handleVerifyCode()
                        }
                        placeholder="000000"
                        className={`w-full text-center text-3xl font-mono tracking-widest px-4 py-4 rounded-xl border ${
                          codeError
                            ? "border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      {codeError && (
                        <p className="text-sm text-red-600 dark:text-red-400 text-center flex items-center justify-center gap-1">
                          <AlertCircle size={14} /> {codeError}
                        </p>
                      )}

                      <button
                        onClick={handleVerifyCode}
                        disabled={verificationCode.length !== 6}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white font-semibold rounded-xl transition-colors"
                      >
                        Verificar código
                      </button>

                      <button
                        onClick={handleSendCode}
                        disabled={sendingCode}
                        className="w-full py-2 text-blue-600 dark:text-blue-400 font-medium hover:underline"
                      >
                        Reenviar código
                      </button>
                    </>
                  )}
                </div>
              </>
            )}

            {/* New Password */}
            {currentStep === "newPassword" && (
              <>
                <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                      <Key
                        size={24}
                        className="text-blue-600 dark:text-blue-400"
                      />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        Nueva contraseña
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Crea una contraseña segura
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  {resettingPassword ? (
                    <div className="py-12 flex flex-col items-center">
                      <Spinner size={36} />
                      <p className="mt-4 text-gray-600 dark:text-gray-400">
                        Guardando...
                      </p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                          Nueva contraseña
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={newPasswordForReset}
                            onChange={(e) =>
                              setNewPasswordForReset(e.target.value)
                            }
                            placeholder="Mínimo 6 caracteres"
                            className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                          <button
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                          >
                            {showNewPassword ? (
                              <EyeOff size={20} className="text-gray-500" />
                            ) : (
                              <Eye size={20} className="text-gray-500" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                          Confirmar
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPasswordForReset}
                            onChange={(e) =>
                              setConfirmPasswordForReset(e.target.value)
                            }
                            placeholder="Repite la contraseña"
                            className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                          <button
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                          >
                            {showConfirmPassword ? (
                              <EyeOff size={20} className="text-gray-500" />
                            ) : (
                              <Eye size={20} className="text-gray-500" />
                            )}
                          </button>
                        </div>
                      </div>

                      {codeError && (
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                          <AlertCircle size={14} /> {codeError}
                        </p>
                      )}

                      <button
                        onClick={handleSetNewPassword}
                        disabled={
                          newPasswordForReset.length < 6 ||
                          newPasswordForReset !== confirmPasswordForReset
                        }
                        className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={20} />
                        Guardar contraseña
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </div>
      </>
    );
  }

  // Panel verificado
  return (
    <>
      <AnimatePresence>
        {showSuccess && (
          <SuccessModal
            message={successMsg}
            onClose={() => setShowSuccess(false)}
          />
        )}
      </AnimatePresence>

      <div className="space-y-6 pb-6">
        {/* Header - Inicio de sesión y seguridad */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Key size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Inicio de sesión y seguridad
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Administra tu contraseña y acceso a la cuenta
              </p>
            </div>
          </div>
        </div>

        <style>{`
          .security-card {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 16px;
            overflow: hidden;
          }
          .dark .security-card {
            background: linear-gradient(145deg, #1f2937 0%, #111827 100%);
            border-color: rgba(75, 85, 99, 0.4);
          }
          .security-card-header {
            padding: 16px;
            border-bottom: 1px solid #e5e7eb;
            background: #f9fafb;
          }
          .dark .security-card-header {
            border-color: rgba(75, 85, 99, 0.3);
            background: rgba(31, 41, 55, 0.5);
          }
          .security-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px;
            width: 100%;
            border: none;
            background: transparent;
            cursor: pointer;
            transition: all 0.2s ease;
            text-align: left;
          }
          .security-item:hover {
            background: rgba(59, 130, 246, 0.04);
          }
          .dark .security-item:hover {
            background: rgba(96, 165, 250, 0.06);
          }
          .security-icon-box {
            padding: 10px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .security-icon-box.blue {
            background: rgba(59, 130, 246, 0.1);
          }
          .dark .security-icon-box.blue {
            background: rgba(59, 130, 246, 0.15);
          }
          .security-icon-box.purple {
            background: rgba(139, 92, 246, 0.1);
          }
          .dark .security-icon-box.purple {
            background: rgba(139, 92, 246, 0.15);
          }
          .security-icon-box.green {
            background: rgba(34, 197, 94, 0.1);
          }
          .dark .security-icon-box.green {
            background: rgba(34, 197, 94, 0.15);
          }
          .security-icon-box.orange {
            background: rgba(249, 115, 22, 0.1);
          }
          .dark .security-icon-box.orange {
            background: rgba(249, 115, 22, 0.15);
          }
          .security-icon-box.pink {
            background: rgba(236, 72, 153, 0.1);
          }
          .dark .security-icon-box.pink {
            background: rgba(236, 72, 153, 0.15);
          }
          .security-icon-box.cyan {
            background: rgba(6, 182, 212, 0.1);
          }
          .dark .security-icon-box.cyan {
            background: rgba(6, 182, 212, 0.15);
          }
          .security-divider {
            height: 1px;
            background: #f3f4f6;
            margin: 0 16px;
          }
          .dark .security-divider {
            background: rgba(75, 85, 99, 0.3);
          }
        `}</style>

        {/* Información personal */}
        <div className="security-card">
          <div className="security-card-header">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                <User size={20} className="text-blue-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Información personal
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Datos de tu cuenta
                </p>
              </div>
            </div>
          </div>

          <div>
            {[
              {
                icon: User,
                label: "Nombre",
                value: userData.nombre,
                field: "name",
                color: "blue",
                iconColor: "text-blue-500",
              },
              {
                icon: Mail,
                label: "Email",
                value: userData.email,
                field: "email",
                color: "blue",
                iconColor: "text-blue-500",
              },
              {
                icon: Phone,
                label: "Teléfono",
                value: userData.telefono,
                field: "phone",
                color: "blue",
                iconColor: "text-blue-500",
              },
              {
                icon: Lock,
                label: "Contraseña",
                value: "••••••••",
                field: "password",
                color: "blue",
                iconColor: "text-blue-500",
              },
            ].map((item, index, arr) => (
              <div key={item.field}>
                <button
                  onClick={() => openEdit(item.field)}
                  className="security-item"
                >
                  <div className="flex items-center gap-3">
                    <div className={`security-icon-box ${item.color}`}>
                      <item.icon size={20} className={item.iconColor} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.label}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {item.value || "No configurado"}
                      </p>
                    </div>
                  </div>
                  <Edit3
                    size={16}
                    className="text-gray-400 dark:text-gray-500"
                  />
                </button>
                {index < arr.length - 1 && <div className="security-divider" />}
              </div>
            ))}
          </div>
        </div>

        {/* Opciones de seguridad */}
        <div className="security-card">
          <div className="security-card-header">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <Shield
                  size={20}
                  className="text-gray-600 dark:text-gray-300"
                />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Opciones de seguridad
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Protección adicional
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="security-item" style={{ cursor: "default" }}>
              <div className="flex items-center gap-3">
                <div className="security-icon-box blue">
                  <Smartphone size={20} className="text-blue-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Verificación en dos pasos
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Protección extra
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setTwoFactorEnabled(!twoFactorEnabled);
                  showSuccessModal(
                    twoFactorEnabled ? "Desactivado" : "Activado"
                  );
                }}
                className={`w-12 h-7 rounded-full transition-all relative ${
                  twoFactorEnabled
                    ? "bg-blue-500"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                    twoFactorEnabled ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>

            <div className="security-divider" />

            <button
              onClick={() => showSuccessModal("Próximamente")}
              className="security-item"
            >
              <div className="flex items-center gap-3">
                <div className="security-icon-box blue">
                  <Fingerprint size={20} className="text-blue-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Clave de acceso
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Huella o Face ID
                  </p>
                </div>
              </div>
              <ChevronRight
                size={18}
                className="text-gray-400 dark:text-gray-500"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Modal edición */}
      <AnimatePresence>
        {editingField && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl"
            >
              <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {editingField === "name" && "Editar nombre"}
                  {editingField === "email" && "Editar email"}
                  {editingField === "phone" && "Editar teléfono"}
                  {editingField === "password" && "Cambiar contraseña"}
                </h2>
                <button
                  onClick={() => setEditingField(null)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {savingChanges ? (
                  <div className="py-12 flex flex-col items-center">
                    <Spinner size={36} />
                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                      Guardando...
                    </p>
                  </div>
                ) : (
                  <>
                    {editingField === "password" ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            Nueva contraseña
                          </label>
                          <div className="relative">
                            <input
                              type={showEditNewPassword ? "text" : "password"}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Mínimo 6 caracteres"
                              className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              onClick={() =>
                                setShowEditNewPassword(!showEditNewPassword)
                              }
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                            >
                              {showEditNewPassword ? (
                                <EyeOff size={20} className="text-gray-500" />
                              ) : (
                                <Eye size={20} className="text-gray-500" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            Confirmar
                          </label>
                          <div className="relative">
                            <input
                              type={
                                showEditConfirmPassword ? "text" : "password"
                              }
                              value={confirmPassword}
                              onChange={(e) =>
                                setConfirmPassword(e.target.value)
                              }
                              placeholder="Repite la contraseña"
                              className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              onClick={() =>
                                setShowEditConfirmPassword(
                                  !showEditConfirmPassword
                                )
                              }
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                            >
                              {showEditConfirmPassword ? (
                                <EyeOff size={20} className="text-gray-500" />
                              ) : (
                                <Eye size={20} className="text-gray-500" />
                              )}
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                          {editingField === "name" && "Nombre"}
                          {editingField === "email" && "Email"}
                          {editingField === "phone" && "Teléfono"}
                        </label>
                        <input
                          type={
                            editingField === "email"
                              ? "email"
                              : editingField === "phone"
                              ? "tel"
                              : "text"
                          }
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}

                    {editError && (
                      <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle size={14} /> {editError}
                      </p>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => setEditingField(null)}
                        className="flex-1 py-3 rounded-xl font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => {
                          if (editingField === "name") handleSaveName();
                          else if (editingField === "email") handleSaveEmail();
                          else if (editingField === "phone") handleSavePhone();
                          else if (editingField === "password")
                            handleSavePassword();
                        }}
                        className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
                      >
                        Guardar
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
