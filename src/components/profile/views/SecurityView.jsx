import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  CheckCircle,
  Eye,
  EyeOff,
  Edit3,
  AlertCircle,
  KeyRound,
  UserRound,
  Shield,
  X,
  Mail as MailIcon,
  Smartphone as PhoneIcon,
} from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import { useAuth } from "../../../context/AuthContext";
import { getFunctions, httpsCallable } from "firebase/functions";
import {
  updatePassword,
  updateEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification,
} from "firebase/auth";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db, auth } from "../../../firebase";

const functions = getFunctions();

const scorePassword = (p) => {
  if (!p) return 0;
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return Math.max(0, Math.min(s, 4));
};

const strengthLabel = (score) => {
  return score <= 1
    ? "Débil"
    : score === 2
    ? "Media"
    : score === 3
    ? "Fuerte"
    : "Muy fuerte";
};

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

const SecurityItem = ({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
  showDivider = true,
}) => (
  <>
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-4 min-w-0">
        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 ring-1 ring-black/5 dark:ring-white/5 flex-shrink-0">
          <Icon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight truncate">
            {description}
          </p>
        </div>
      </div>
      {action && (
        <button
          onClick={action}
          className="px-3 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
    {showDivider && (
      <div className="border-t border-slate-200/80 dark:border-slate-700/80"></div>
    )}
  </>
);

export default function SecurityView({ onVerified }) {
  const {
    usuario,
    actualizarUsuarioInfo,
    linkPasswordToAccount,
    checkSignInMethods,
  } = useAuth();
  const navigate = useNavigate();

  // Refs
  const passwordInputRef = useRef(null);
  const codeInputRef = useRef(null);

  // User data state
  const [userData, setUserData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    photoURL: "",
    emailVerified: false,
  });

  // Password change state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showEditNewPassword, setShowEditNewPassword] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [savingChanges, setSavingChanges] = useState(false);
  const [editError, setEditError] = useState("");

  // Verification state
  const [verificationCode, setVerificationCode] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [verifyingPassword, setVerifyingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [codeError, setCodeError] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [currentStep, setCurrentStep] = useState("send");
  const [verificationChecked, setVerificationChecked] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  // Password reset state
  const [newPasswordForReset, setNewPasswordForReset] = useState("");
  const [confirmPasswordForReset, setConfirmPasswordForReset] = useState("");
  const [resettingPassword, setResettingPassword] = useState(false);

  // Two-factor auth state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [hasPasswordProvider, setHasPasswordProvider] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef([]);

  useEffect(() => {
    if (showVerificationModal) {
      if (currentStep === "code") {
        const idx = Math.max(
          0,
          otp.findIndex((d) => !d)
        );
        if (otpRefs.current[idx]) otpRefs.current[idx].focus();
      } else if (currentStep === "password" && passwordInputRef.current) {
        passwordInputRef.current.focus();
      }
    }
  }, [showVerificationModal, currentStep, otp]);

  const handleOtpChange = (index, value) => {
    const v = (value || "").replace(/\D/g, "");
    if (v.length === 0) {
      setOtp((prev) => {
        const next = [...prev];
        next[index] = "";
        setVerificationCode(next.join(""));
        return next;
      });
      return;
    }
    if (v.length > 1) {
      const chars = v.slice(0, 6).split("");
      const next = ["", "", "", "", "", ""];
      for (let i = 0; i < 6; i++) next[i] = chars[i] || "";
      setOtp(next);
      setVerificationCode(next.join(""));
      const idx = Math.min(
        5,
        next.findIndex((d) => !d) === -1 ? 5 : next.findIndex((d) => !d)
      );
      if (otpRefs.current[idx]) otpRefs.current[idx].focus();
      return;
    }
    setOtp((prev) => {
      const next = [...prev];
      next[index] = v;
      setVerificationCode(next.join(""));
      return next;
    });
    if (index < 5 && otpRefs.current[index + 1])
      otpRefs.current[index + 1].focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        if (otpRefs.current[index - 1]) otpRefs.current[index - 1].focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      if (otpRefs.current[index - 1]) otpRefs.current[index - 1].focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      if (otpRefs.current[index + 1]) otpRefs.current[index + 1].focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = (e.clipboardData.getData("text") || "").replace(/\D/g, "");
    if (!pasted) return;
    e.preventDefault();
    const chars = pasted.slice(0, 6).split("");
    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < 6; i++) next[i] = chars[i] || "";
    setOtp(next);
    setVerificationCode(next.join(""));
    const idx = Math.min(
      5,
      next.findIndex((d) => !d) === -1 ? 5 : next.findIndex((d) => !d)
    );
    if (otpRefs.current[idx]) otpRefs.current[idx].focus();
  };

  const showSuccessModal = (message) => {
    setSuccessMsg(message);
    setShowSuccess(true);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsLoading(true);
    try {
      await updatePassword(usuario, newPassword);
      setSuccess("Contraseña actualizada correctamente");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setShowChangePassword(false), 2000);
    } catch (err) {
      console.error("Error al cambiar contraseña:", err);
      setError(
        "Error al cambiar la contraseña. Asegúrate de que la contraseña actual sea correcta."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      const currentUser = auth.currentUser || usuario;
      if (currentUser) {
        // Verificar si hay sesión de verificación válida (1 hora)
        const savedVerification = localStorage.getItem(
          `security_verified_${currentUser.uid}`
        );
        const savedVerificationAlias = localStorage.getItem(
          `last_identity_verification_${currentUser.uid}`
        );
        let alreadyVerified = false;
        const parseTs = (raw) => {
          try {
            const { timestamp } = JSON.parse(raw);
            return typeof timestamp === "number" ? timestamp : 0;
          } catch (_) {
            return 0;
          }
        };
        const tsMain = savedVerification ? parseTs(savedVerification) : 0;
        const tsAlias = savedVerificationAlias
          ? parseTs(savedVerificationAlias)
          : 0;
        const latestTs = Math.max(tsMain, tsAlias);
        if (latestTs) {
          try {
            const oneHour = 60 * 60 * 1000;
            if (Date.now() - latestTs < oneHour) {
              setIsVerified(true);
              setCurrentStep("verified");
              alreadyVerified = true;
            }
          } catch (e) {
            localStorage.removeItem(`security_verified_${currentUser.uid}`);
            localStorage.removeItem(
              `last_identity_verification_${currentUser.uid}`
            );
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
                data.fotoURL || data.photoURL || currentUser.photoURL || "",
              emailVerified: !!currentUser.emailVerified,
            });
          } else {
            setUserData({
              nombre: currentUser.displayName || "",
              email: currentUser.email || "",
              telefono: "",
              photoURL: currentUser.photoURL || "",
              emailVerified: !!currentUser.emailVerified,
            });
          }
        } catch (error) {
          console.error("Error cargando datos:", error);
        }

        const email = (currentUser.email || "").trim().toLowerCase();
        let hasPassword = false;
        try {
          if (typeof currentUser.reload === "function") {
            await currentUser.reload();
          }
          if (email && typeof checkSignInMethods === "function") {
            const methods = await checkSignInMethods(email);
            hasPassword = Array.isArray(methods)
              ? methods.includes("password")
              : false;
          }
        } catch (e) {
          // fallback abajo
        }

        if (!hasPassword) {
          const providers =
            (auth.currentUser || currentUser).providerData?.map(
              (p) => p.providerId
            ) || [];
          hasPassword = providers.includes("password");
        }

        setHasPasswordProvider(hasPassword);

        if (!alreadyVerified) {
          setCurrentStep("send");
          setShowVerificationModal(true);
        }
        setVerificationChecked(true);
      } else {
        setCurrentStep("send");
        setVerificationChecked(true);
      }
    };
    loadUserData();
  }, [usuario?.uid]);

  useEffect(() => {
    if (usuario) {
      setUserData((prev) => ({
        nombre: usuario.displayName || prev.nombre,
        email: usuario.email || prev.email,
        telefono: usuario.phoneNumber || prev.telefono,
        photoURL: usuario.photoURL || prev.photoURL,
        emailVerified:
          typeof usuario.emailVerified === "boolean"
            ? usuario.emailVerified
            : prev.emailVerified,
      }));
    }
  }, [usuario]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep === "password" && passwordInputRef.current) {
        passwordInputRef.current.focus();
      } else if (currentStep === "code" && codeInputRef.current) {
        codeInputRef.current.focus();
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [currentStep]);

  // Cerrar modales con Escape
  useEffect(() => {
    if (!showVerificationModal) return;
    const onKey = (e) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showVerificationModal]);

  useEffect(() => {
    if (!editingField) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeEdit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editingField]);

  // Bloquear scroll del body cuando cualquier modal esté abierto
  useEffect(() => {
    const anyOpen = showVerificationModal || !!editingField || showSuccess;
    if (!anyOpen) return;
    const scrollY = window.scrollY;
    const prev = {
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
      overflow: document.body.style.overflow,
    };
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.position = prev.position || "";
      document.body.style.top = prev.top || "";
      document.body.style.width = prev.width || "";
      document.body.style.overflow = prev.overflow || "";
      window.scrollTo(0, scrollY);
    };
  }, [showVerificationModal, editingField, showSuccess]);

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      setCodeError("El código debe tener 6 dígitos");
      return;
    }

    setVerifyingCode(true);
    setCodeError("");

    try {
      const email = (auth.currentUser?.email || userData.email || "")
        .trim()
        .toLowerCase();
      if (!email) {
        setCodeError("No se encontró el correo del usuario");
        return;
      }

      const verifyCode = httpsCallable(functions, "verifyCode");
      const result = await verifyCode({
        email,
        code: verificationCode,
      });

      if (result?.data?.success) {
        saveVerification();
        setIsVerified(true);
        setCurrentStep("verified");
        setShowVerificationModal(false);
        setShowSuccess(true);
        setSuccessMsg("Identidad verificada");
        if (onVerified) onVerified({ email, code: verificationCode });
      } else {
        setCodeError(result?.data?.error || "Código inválido o expirado");
      }
    } catch (error) {
      console.error("Error verificando código:", error);
      setCodeError("Error al verificar. Intenta de nuevo.");
    } finally {
      setVerifyingCode(false);
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
      // Alias requerido por reglas: last_identity_verification
      localStorage.setItem(
        `last_identity_verification_${currentUser.uid}`,
        JSON.stringify({ timestamp: Date.now() })
      );
    }
  };

  const handleVerifyPassword = async () => {
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

      // Intentar verificar con contraseña para cualquier tipo de cuenta (incluyendo Google)
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      saveVerification();
      setIsVerified(true);
      setCurrentStep("verified");
      setShowVerificationModal(false);
      showSuccessModal("Identidad verificada");
    } catch (error) {
      console.error("Error auth:", error);
      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password"
      ) {
        setPasswordError("Contraseña incorrecta");
      } else {
        setPasswordError("Error al verificar contraseña");
      }
    } finally {
      setVerifyingPassword(false);
    }
  };

  const handleSendCode = async () => {
    const email = (auth.currentUser?.email || userData.email || "")
      .trim()
      .toLowerCase();
    if (!email) return;

    setSendingCode(true);
    setCodeError("");
    try {
      const sendVerificationCode = httpsCallable(
        functions,
        "sendVerificationCode"
      );
      const deviceInfo = {
        browser: navigator.userAgent.includes("Chrome")
          ? "Google Chrome"
          : navigator.userAgent.includes("Firefox")
          ? "Firefox"
          : navigator.userAgent.includes("Safari")
          ? "Safari"
          : navigator.userAgent.includes("Android")
          ? "Android"
          : navigator.userAgent.includes("iPhone")
          ? "iOS"
          : "Desconocido",
        os: navigator.userAgent.includes("Mac")
          ? "macOS"
          : navigator.userAgent.includes("Windows")
          ? "Windows"
          : navigator.userAgent.includes("Android")
          ? "Android"
          : navigator.userAgent.includes("iPhone")
          ? "iOS"
          : "Desconocido",
      };

      await sendVerificationCode({
        email,
        userName: userData.nombre || "Usuario",
        deviceInfo,
        purpose: "identity_verification",
      });

      setCodeSent(true);
      setVerificationCode("");
      setCurrentStep("code");
    } catch (error) {
      console.error("Error enviando código:", error);
      setCodeError("Error al enviar el código. Intenta de nuevo.");
    } finally {
      setSendingCode(false);
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
      actualizarUsuarioInfo?.({
        email: editValue.trim(),
      });
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
        // Si el usuario ya tiene proveedor de contraseña, reautenticar con la contraseña actual
        if (hasPasswordProvider) {
          try {
            if (!currentPassword || !currentPassword.trim()) {
              setSavingChanges(false);
              setEditError("Ingresa tu contraseña actual");
              return;
            }
            const credential = EmailAuthProvider.credential(
              currentUser.email,
              currentPassword
            );
            await reauthenticateWithCredential(currentUser, credential);
          } catch (reauthErr) {
            const code = reauthErr?.code || "";
            if (
              code === "auth/invalid-credential" ||
              code === "auth/wrong-password"
            ) {
              setSavingChanges(false);
              setEditError("Contraseña actual incorrecta");
              return;
            }
            // Si requiere login reciente o cualquier otro error, mostrar mensaje genérico
            if (code === "auth/requires-recent-login") {
              setSavingChanges(false);
              setEditError(
                "Vuelve a iniciar sesión para cambiar la contraseña"
              );
              return;
            }
          }
          await updatePassword(currentUser, newPassword);
        } else {
          // Para cuentas sin contraseña (ej. Google), crear contraseña
          await linkPasswordToAccount(newPassword);
          setHasPasswordProvider(true);
        }

        // Notificar al admin sobre el cambio de contraseña
        try {
          const notifyAdminPasswordChange = httpsCallable(
            functions,
            "notifyAdminPasswordChange"
          );
          await notifyAdminPasswordChange({
            userEmail: currentUser.email,
            userName: userData.nombre || currentUser.displayName || "Usuario",
          });
        } catch (notifyError) {
          console.error("Error notificando al admin:", notifyError);
          // No fallar si la notificación no se envía
        }

        showSuccessModal(
          hasPasswordProvider ? "Contraseña actualizada" : "Contraseña creada"
        );
        setEditingField(null);
        setNewPassword("");
        setConfirmPassword("");
        setCurrentPassword("");
      }
    } catch (error) {
      const code = error?.code || "";
      if (code === "auth/credential-already-in-use") {
        setEditError(
          "Ya existe una contraseña para este correo. Usa 'Olvidé mi contraseña' o inicia sesión con correo y contraseña."
        );
      } else if (code === "auth/email-already-in-use") {
        setEditError(
          "Este correo ya tiene una cuenta con contraseña. Usa 'Olvidé mi contraseña' o inicia sesión con correo y contraseña."
        );
      } else if (code === "auth/requires-recent-login") {
        setEditError("Vuelve a iniciar sesión para cambiar la contraseña");
      } else {
        setEditError("Error al actualizar");
      }
    } finally {
      setSavingChanges(false);
    }
  };

  const openEdit = (field) => {
    // Permitir editar nombre sin verificación de identidad
    if (field === "name") {
      setEditingField("name");
      setEditError("");
      setEditValue(userData.nombre);
      return;
    }

    // Revalidar TTL en tiempo real antes de permitir cambios sensibles
    const currentUser = auth.currentUser || usuario;
    if (currentUser) {
      const savedVerification = localStorage.getItem(
        `security_verified_${currentUser.uid}`
      );
      let stillValid = false;
      if (savedVerification) {
        try {
          const { timestamp } = JSON.parse(savedVerification);
          const oneHour = 60 * 60 * 1000;
          stillValid = Date.now() - timestamp < oneHour;
        } catch (_) {
          // ignore parse errors
        }
      }
      if (!stillValid) {
        setIsVerified(false);
        setShowVerificationModal(true);
        setCurrentStep(codeSent ? "code" : "send");
        return;
      }
    }

    if (verificationChecked && !isVerified) {
      setShowVerificationModal(true);
      setCurrentStep(codeSent ? "code" : "send");
      return;
    }
    setEditingField(field);
    setEditError("");
    if (field === "email") setEditValue(userData.email);
    else if (field === "phone") setEditValue(userData.telefono);
  };

  const renderVerificationModal = () => {
    if (!(verificationChecked && !isVerified)) return null;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-white dark:bg-slate-900"
          role="dialog"
          aria-modal="true"
          aria-labelledby="verify-title"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md sm:max-w-lg lg:max-w-xl rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden"
          >
            <div className="relative px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-200/70 dark:border-slate-700/70 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-900">
              <button
                onClick={handleClose}
                className="absolute top-2 right-2 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                type="button"
                aria-label="Cerrar"
              >
                <X size={18} className="text-slate-600 dark:text-slate-300" />
              </button>
              <div className="flex flex-col items-center text-center gap-3 sm:flex-row sm:items-center sm:justify-start sm:text-left sm:pr-10 pr-0">
                <img
                  src="/logos/perfil/7.jpg"
                  alt=""
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover flex-shrink-0 ring-2 ring-blue-200 dark:ring-blue-800 shadow-md mx-auto sm:mx-0"
                />
                <div className="min-w-0">
                  <p
                    id="verify-title"
                    className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight"
                  >
                    Verifica tu identidad
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                    Necesario para cambios sensibles (correo, contraseña, etc.).
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 lg:p-7">
              {currentStep === "send" && (
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Te enviaremos un código de 6 dígitos
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Presiona “Enviar código” y revisa tu correo para continuar.
                  </p>

                  <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700/70 bg-slate-50/70 dark:bg-slate-950/40 p-3">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Tu correo
                    </p>
                    <p className="mt-1 text-sm sm:text-base font-bold text-slate-900 dark:text-white break-all">
                      {userData.email}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 items-center sm:justify-center">
                    <button
                      onClick={handleSendCode}
                      disabled={sendingCode}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors disabled:opacity-60"
                      type="button"
                    >
                      <MailIcon size={16} />
                      {sendingCode ? "Enviando..." : "Enviar código"}
                    </button>

                    {codeSent && (
                      <button
                        onClick={() => setCurrentStep("code")}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        type="button"
                      >
                        <KeyRound size={16} />
                        Ya tengo el código
                      </button>
                    )}
                  </div>

                  {hasPasswordProvider && (
                    <div className="pt-1 flex justify-center">
                      <button
                        onClick={() => setCurrentStep("password")}
                        type="button"
                        className="px-4 py-2.5 rounded-xl font-semibold text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        Verificar con contraseña
                      </button>
                    </div>
                  )}

                  {codeError && (
                    <div className="mt-2 text-sm text-rose-700 dark:text-rose-300">
                      {codeError}
                    </div>
                  )}
                </div>
              )}

              {currentStep === "code" && (
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Ingresa el código de 6 dígitos
                  </p>
                  <div
                    className="flex justify-center gap-2 sm:gap-3"
                    onPaste={handleOtpPaste}
                  >
                    {Array.from({ length: 6 }).map((_, i) => (
                      <input
                        key={i}
                        ref={(el) => (otpRefs.current[i] = el)}
                        inputMode="numeric"
                        maxLength={1}
                        value={otp[i]}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-semibold rounded-xl border bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                          codeError
                            ? "border-rose-400 dark:border-rose-500 focus:ring-rose-500/30"
                            : "border-slate-300 dark:border-slate-700 focus:ring-blue-500/30"
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={handleVerifyCode}
                    disabled={verifyingCode || verificationCode.length !== 6}
                    className="w-full py-2.5 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors disabled:opacity-60"
                    type="button"
                  >
                    {verifyingCode ? "Verificando..." : "Verificar"}
                  </button>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleSendCode}
                      disabled={sendingCode}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-60"
                      type="button"
                    >
                      <MailIcon size={16} />
                      {sendingCode ? "Reenviando..." : "Reenviar código"}
                    </button>

                    {hasPasswordProvider && (
                      <button
                        onClick={() => setCurrentStep("password")}
                        type="button"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        Verificar con contraseña
                      </button>
                    )}
                  </div>

                  {codeError && (
                    <div className="mt-2 text-sm text-rose-700 dark:text-rose-300">
                      {codeError}
                    </div>
                  )}
                </div>
              )}

              {currentStep === "password" && (
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Verifica con tu contraseña
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      ref={passwordInputRef}
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => {
                        setCurrentPassword(e.target.value);
                        setPasswordError("");
                      }}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none"
                      placeholder="Tu contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword((v) => !v)}
                      className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      aria-label="Mostrar u ocultar"
                    >
                      {showCurrentPassword ? (
                        <EyeOff
                          size={18}
                          className="text-slate-600 dark:text-slate-300"
                        />
                      ) : (
                        <Eye
                          size={18}
                          className="text-slate-600 dark:text-slate-300"
                        />
                      )}
                    </button>
                  </div>
                  {passwordError && (
                    <div className="text-sm text-rose-700 dark:text-rose-300">
                      {passwordError}
                    </div>
                  )}
                  <button
                    onClick={handleVerifyPassword}
                    disabled={verifyingPassword}
                    className="w-full py-2.5 rounded-xl font-semibold text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-60"
                    type="button"
                  >
                    {verifyingPassword
                      ? "Verificando..."
                      : "Verificar con contraseña"}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  const closeEdit = () => {
    setEditingField(null);
    setEditError("");
    setEditValue("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const renderEditModal = () => {
    if (!editingField) return null;

    const isPassword = editingField === "password";
    const title =
      editingField === "name"
        ? "Editar nombre"
        : editingField === "email"
        ? "Editar correo"
        : editingField === "phone"
        ? "Editar teléfono"
        : "Cambiar contraseña";

    const primaryAction = async () => {
      if (editingField === "name") return handleSaveName();
      if (editingField === "email") return handleSaveEmail();
      if (editingField === "phone") return handleSavePhone();
      if (editingField === "password") return handleSavePassword();
    };

    const pwScore = scorePassword(newPassword);
    const reqLen = newPassword.length >= 6;
    const reqUpperLower =
      /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword);
    const reqNumber = /\d/.test(newPassword);
    const reqSpecial = /[^A-Za-z0-9]/.test(newPassword);
    const reqMatch =
      confirmPassword.length > 0 && confirmPassword === newPassword;

    const disableSave = isPassword
      ? savingChanges ||
        !reqLen ||
        !reqMatch ||
        (hasPasswordProvider && !currentPassword.trim())
      : savingChanges;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm"
          onClick={closeEdit}
        >
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/5"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-title"
          >
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200/70 dark:border-slate-700/70 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-900">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="hidden sm:flex w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 items-center justify-center ring-1 ring-blue-100/60 dark:ring-blue-800/40">
                    <Lock size={18} />
                  </div>
                  <div className="min-w-0">
                    <p
                      id="edit-title"
                      className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight"
                    >
                      {title}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                      Cambios sensibles requieren verificación.
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeEdit}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  type="button"
                  aria-label="Cerrar"
                >
                  <X size={18} className="text-slate-600 dark:text-slate-300" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              {!isPassword ? (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Nuevo valor
                  </label>
                  <input
                    value={editValue}
                    onChange={(e) => {
                      setEditValue(e.target.value);
                      setEditError("");
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 dark:focus:ring-blue-400/15"
                    placeholder={
                      editingField === "email"
                        ? "tu@email.com"
                        : editingField === "phone"
                        ? "+1 809..."
                        : "Tu nombre"
                    }
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {hasPasswordProvider && (
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        Contraseña actual
                      </label>
                      <div className="mt-0 flex items-center gap-2">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => {
                            setCurrentPassword(e.target.value);
                            setEditError("");
                          }}
                          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 dark:focus:ring-blue-400/15"
                          placeholder="Tu contraseña actual"
                          aria-invalid={
                            !currentPassword.trim() && savingChanges
                              ? true
                              : undefined
                          }
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword((v) => !v)}
                          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          aria-label="Mostrar u ocultar"
                        >
                          {showCurrentPassword ? (
                            <EyeOff
                              size={18}
                              className="text-slate-600 dark:text-slate-300"
                            />
                          ) : (
                            <Eye
                              size={18}
                              className="text-slate-600 dark:text-slate-300"
                            />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                  {!hasPasswordProvider && (
                    <div className="sm:col-span-2 -mt-1">
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        Tu cuenta no tiene contraseña. Puedes crear una ahora
                        para iniciar también con correo y contraseña. Google
                        seguirá funcionando.
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Nueva contraseña
                    </label>
                    <div className="mt-0 flex items-center gap-2">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setEditError("");
                        }}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 dark:focus:ring-blue-400/15"
                        placeholder="Mín. 6 caracteres"
                        aria-invalid={
                          !reqLen && newPassword.length > 0 ? true : undefined
                        }
                        aria-describedby="password-reqs password-strength"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((v) => !v)}
                        className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        aria-label="Mostrar u ocultar"
                      >
                        {showNewPassword ? (
                          <EyeOff
                            size={18}
                            className="text-slate-600 dark:text-slate-300"
                          />
                        ) : (
                          <Eye
                            size={18}
                            className="text-slate-600 dark:text-slate-300"
                          />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Confirmar
                    </label>
                    <div className="mt-0 flex items-center gap-2">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setEditError("");
                        }}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 dark:focus:ring-blue-400/15"
                        placeholder="Repite la contraseña"
                        aria-invalid={
                          confirmPassword.length > 0 && !reqMatch
                            ? true
                            : undefined
                        }
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        aria-label="Mostrar u ocultar"
                      >
                        {showConfirmPassword ? (
                          <EyeOff
                            size={18}
                            className="text-slate-600 dark:text-slate-300"
                          />
                        ) : (
                          <Eye
                            size={18}
                            className="text-slate-600 dark:text-slate-300"
                          />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {editError && (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="rounded-xl border border-rose-200/80 dark:border-rose-500/30 bg-rose-50/80 dark:bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-200"
                >
                  {editError}
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                <button
                  onClick={closeEdit}
                  type="button"
                  className="px-4 py-2.5 rounded-xl font-semibold text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  disabled={savingChanges}
                >
                  Cancelar
                </button>
                <button
                  onClick={primaryAction}
                  type="button"
                  className="px-4 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors disabled:opacity-60"
                  disabled={disableSave}
                >
                  {savingChanges ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
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

  // Main render
  if (verificationChecked && !isVerified) {
    return renderVerificationModal();
  }

  if (!verificationChecked) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-slate-900">
        <div className="text-center">
          <Spinner size={40} />
          <p className="mt-4 text-slate-600 dark:text-slate-400">
            Preparando verificación...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {showSuccess && (
          <SuccessModal
            message={successMsg}
            onClose={() => setShowSuccess(false)}
          />
        )}
      </AnimatePresence>

      {renderVerificationModal()}
      {renderEditModal()}

      <div className="space-y-1">
        <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <img
            src="/logos/perfil/7.jpg"
            alt=""
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover"
          />
          Inicio de sesión y seguridad
        </h2>
        <p className="text-sm lg:text-base text-slate-600 dark:text-slate-400">
          Administra tu información de inicio de sesión, verifica tu identidad y
          protege tu cuenta.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-900 shadow-sm overflow-hidden ring-1 ring-black/5 dark:ring-white/5">
        <div className="px-5 sm:px-6 lg:px-8 py-5 sm:py-6 border-b border-slate-200/70 dark:border-slate-700/70 bg-gradient-to-r from-slate-50 to-slate-50/30 dark:from-slate-900 dark:to-slate-900">
          <p className="text-base lg:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Tu información
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Edita los datos de tu cuenta. Los cambios sensibles requieren
            verificación.
          </p>
        </div>

        <div className="px-5 sm:px-6 lg:px-8 py-2">
          <SecurityItem
            icon={UserRound}
            title="Nombre"
            description={userData?.nombre || "Sin nombre"}
            action={() => openEdit("name")}
            actionLabel="Editar"
          />
          <SecurityItem
            icon={MailIcon}
            title="Correo"
            description={userData?.email || "Sin correo"}
            action={() => openEdit("email")}
            actionLabel="Editar"
          />
          <SecurityItem
            icon={PhoneIcon}
            title="Teléfono"
            description={userData?.telefono || "Sin teléfono"}
            action={() => openEdit("phone")}
            actionLabel="Editar"
          />
          <SecurityItem
            icon={Lock}
            title="Contraseña"
            description={
              hasPasswordProvider
                ? "••••••••••••"
                : "Tu cuenta no tiene contraseña"
            }
            action={() => openEdit("password")}
            actionLabel={hasPasswordProvider ? "Cambiar" : "Crear"}
            showDivider={false}
          />
        </div>
      </div>
    </div>
  );
}
