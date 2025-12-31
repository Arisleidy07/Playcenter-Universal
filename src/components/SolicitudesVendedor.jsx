import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  setDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useAuth } from "../context/AuthContext";
import { notify } from "../utils/notificationBus";
import {
  createNotification,
  NotificationHelpers,
} from "../hooks/useNotifications";
import {
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  Store,
  User,
  Calendar,
  Image as ImageIcon,
  Send,
  Bell,
} from "lucide-react";

// Inicializar Firebase Functions
const functions = getFunctions();

export default function SolicitudesVendedor() {
  const { usuarioInfo } = useAuth();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("pendiente"); // pendiente | aprobada | rechazada | todas
  const [procesando, setProcesando] = useState(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [solicitudSinUserId, setSolicitudSinUserId] = useState(null);

  // Modal para rechazo con motivo
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [solicitudARechazar, setSolicitudARechazar] = useState(null);

  // SOLO para admin (arisleidy0712@gmail.com)
  const isSuperAdmin = usuarioInfo?.email === "arisleidy0712@gmail.com";

  useEffect(() => {
    if (!isSuperAdmin) return;

    const solicitudesRef = collection(db, "solicitudes_vendedor");
    const q = query(solicitudesRef, orderBy("fechaSolicitud", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const solicitudesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSolicitudes(solicitudesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isSuperAdmin]);

  const aprobarSolicitud = async (solicitud) => {
    setProcesando(solicitud.id);

    try {
      // VALIDAR: Verificar que tenemos userId
      if (!solicitud.userId) {
        setSolicitudSinUserId(solicitud);
        setShowWarningModal(true);
        setProcesando(null);
        return;
      }

      // 1. Crear la tienda en la colección "stores"
      const storeData = {
        nombre: solicitud.tiendaNombre,
        descripcion: solicitud.tiendaDescripcion || "",
        eslogan: solicitud.tiendaEslogan || "",
        logo: solicitud.tiendaLogo || "",
        banner: solicitud.tiendaBanner || "",
        telefono: solicitud.tiendaTelefono || "",
        direccion: solicitud.tiendaDireccion || "",
        ownerUid: solicitud.userId,
        ownerEmail: solicitud.email,
        ownerName: solicitud.nombreContacto,
        createdAt: new Date(),
        activa: true,
        stats: {
          productos: 0,
          ventas: 0,
          calificacion: 5.0,
        },
      };

      const storeRef = await addDoc(collection(db, "stores"), storeData);

      // 2. Si el solicitante tiene userId, actualizar su documento de usuario
      //    para que quede enlazado con la tienda recién creada
      if (solicitud.userId) {
        await setDoc(
          doc(db, "users", solicitud.userId),
          {
            role: "seller",
            isSeller: true,
            storeId: storeRef.id,
            storeName: storeData.nombre || storeData.name || "",
          },
          { merge: true }
        );
      }

      // 3. Marcar la solicitud como aprobada
      await updateDoc(doc(db, "solicitudes_vendedor", solicitud.id), {
        estado: "aprobada",
        revisadoPor: usuarioInfo.email,
        fechaRevision: new Date(),
        storeId: storeRef.id,
      });
      console.log(" Solicitud marcada como aprobada");

      // 4. Enviar email de aprobación con Resend
      console.log(" Paso 4/4: Enviando email con Resend...");
      try {
        const sendStoreApprovedEmail = httpsCallable(
          functions,
          "sendStoreApprovedEmail"
        );
        await sendStoreApprovedEmail({
          email: solicitud.email,
          nombreContacto: solicitud.nombreContacto,
          tiendaNombre: solicitud.tiendaNombre,
          storeId: storeRef.id,
        });
        console.log(" Email de aprobación enviado exitosamente");
      } catch (emailError) {
        console.error("⚠️ Error al enviar email (no crítico):", emailError);
        // No fallar si el email no se pudo enviar
      }

      // 5. Crear notificación en la app para el usuario
      if (solicitud.userId) {
        try {
          await NotificationHelpers.sellerApproved(
            solicitud.userId,
            solicitud.tiendaNombre,
            storeRef.id
          );
          console.log(" Notificación in-app creada");
        } catch (notifError) {
          console.error("⚠️ Error al crear notificación:", notifError);
        }
      }

      // Mensaje detallado para el admin
      const mensaje = solicitud.userId
        ? ` Tienda "${solicitud.tiendaNombre}" aprobada exitosamente!\n\n El vendedor ahora puede:\n Ver su tienda en /tiendas\n Acceder a su panel en /admin\n Subir productos\n\n Email enviado a: ${solicitud.email}\n Notificación enviada`
        : ` Tienda "${solicitud.tiendaNombre}" CREADA!\n\n⚠️ NOTA: El solicitante NO estaba logueado.\n\n La tienda es visible en /tiendas\n Pero debes vincular manualmente al usuario\n\n Email enviado a: ${solicitud.email}`;

      notify(mensaje, "success", "Solicitud aprobada");
    } catch (error) {
      notify(
        `Error al aprobar la solicitud: ${error.message}`,
        "error",
        "Error"
      );
    } finally {
      setProcesando(null);
    }
  };

  const openRejectModal = (sol) => {
    setSolicitudARechazar(sol);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const confirmarRechazo = async () => {
    if (!solicitudARechazar) return;
    const motivo = rejectReason.trim();
    if (!motivo) {
      notify("Debes indicar el motivo del rechazo.", "error", "Falta motivo");
      return;
    }
    await rechazarSolicitud(solicitudARechazar, motivo);
    setRejectModalOpen(false);
    setRejectReason("");
    setSolicitudARechazar(null);
  };

  const rechazarSolicitud = async (solicitud, motivo) => {
    const motivoRechazo = (motivo || "").trim();
    if (!motivoRechazo) {
      notify("Debes indicar el motivo del rechazo.", "error", "Falta motivo");
      return;
    }

    setProcesando(solicitud.id);

    try {
      // 1. Marcar la solicitud como rechazada
      await updateDoc(doc(db, "solicitudes_vendedor", solicitud.id), {
        estado: "rechazada",
        revisadoPor: usuarioInfo.email,
        fechaRevision: new Date(),
        notasAdmin: motivoRechazo || "Rechazada sin motivo especificado",
      });

      // 2. Enviar email de rechazo con Resend
      console.log(" Enviando email de rechazo con Resend...");
      try {
        const sendStoreRejectedEmail = httpsCallable(
          functions,
          "sendStoreRejectedEmail"
        );
        await sendStoreRejectedEmail({
          email: solicitud.email,
          nombreContacto: solicitud.nombreContacto,
          tiendaNombre: solicitud.tiendaNombre,
          motivo: motivoRechazo || "",
        });
        console.log(" Email de rechazo enviado exitosamente");
      } catch (emailError) {
        console.error("⚠️ Error al enviar email (no crítico):", emailError);
      }

      // 3. Crear notificación in-app para el usuario
      if (solicitud.userId) {
        try {
          await NotificationHelpers.sellerRejected(
            solicitud.userId,
            solicitud.tiendaNombre,
            motivoRechazo
          );
          console.log(" Notificación in-app creada");
        } catch (notifError) {
          console.error("⚠️ Error al crear notificación:", notifError);
        }
      }

      notify(
        `Solicitud rechazada.\n Email enviado a: ${solicitud.email}`,
        "info",
        "Solicitud procesada"
      );
    } catch (error) {
      notify("Hubo un error al rechazar la solicitud.", "error", "Error");
    } finally {
      setProcesando(null);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 font-semibold">
          ⛔ Acceso denegado. Solo el super admin puede ver las solicitudes.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const solicitudesFiltradas = solicitudes.filter((s) => {
    if (filtro === "todas") return true;
    return s.estado === filtro;
  });

  const estadisticas = {
    pendientes: solicitudes.filter((s) => s.estado === "pendiente").length,
    aprobadas: solicitudes.filter((s) => s.estado === "aprobada").length,
    rechazadas: solicitudes.filter((s) => s.estado === "rechazada").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Solicitudes de Vendedor
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Aprueba o rechaza las solicitudes para vender en Playcenter
          </p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold text-yellow-900">
                {estadisticas.pendientes}
              </p>
              <p className="text-sm text-yellow-700">Pendientes</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-900">
                {estadisticas.aprobadas}
              </p>
              <p className="text-sm text-green-700">Aprobadas</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <XCircle className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-2xl font-bold text-red-900">
                {estadisticas.rechazadas}
              </p>
              <p className="text-sm text-red-700">Rechazadas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {[
          { valor: "pendiente", label: "Pendientes", color: "yellow" },
          { valor: "aprobada", label: "Aprobadas", color: "green" },
          { valor: "rechazada", label: "Rechazadas", color: "red" },
          { valor: "todas", label: "Todas", color: "gray" },
        ].map((f) => (
          <button
            key={f.valor}
            onClick={() => setFiltro(f.valor)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filtro === f.valor
                ? `bg-${f.color}-600 text-white`
                : `bg-${f.color}-100 text-${f.color}-700 hover:bg-${f.color}-200`
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista de Solicitudes */}
      <div className="space-y-4">
        {solicitudesFiltradas.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              No hay solicitudes {filtro !== "todas" && filtro}
            </p>
          </div>
        ) : (
          solicitudesFiltradas.map((solicitud) => (
            <motion.div
              key={solicitud.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-xl shadow-sm border-2 p-6 ${
                solicitud.estado === "pendiente"
                  ? "border-yellow-300"
                  : solicitud.estado === "aprobada"
                  ? "border-green-300"
                  : "border-red-300"
              }`}
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Imágenes */}
                <div className="flex gap-4">
                  {solicitud.tiendaLogo && (
                    <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-200 flex-shrink-0">
                      <img
                        src={solicitud.tiendaLogo}
                        alt="Logo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {solicitud.tiendaBanner && (
                    <div className="w-48 h-24 rounded-lg overflow-hidden border-2 border-gray-200 flex-shrink-0">
                      <img
                        src={solicitud.tiendaBanner}
                        alt="Banner"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Información */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Store className="w-5 h-5 text-blue-600" />
                        {solicitud.tiendaNombre}
                      </h3>
                      {solicitud.tiendaEslogan && (
                        <p className="text-sm text-gray-600 italic mt-1">
                          "{solicitud.tiendaEslogan}"
                        </p>
                      )}
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        solicitud.estado === "pendiente"
                          ? "bg-yellow-100 text-yellow-800"
                          : solicitud.estado === "aprobada"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {solicitud.estado === "pendiente"
                        ? " Pendiente"
                        : solicitud.estado === "aprobada"
                        ? " Aprobada"
                        : " Rechazada"}
                    </span>
                  </div>

                  {solicitud.tiendaDescripcion && (
                    <p className="text-gray-700">
                      {solicitud.tiendaDescripcion}
                    </p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="w-4 h-4" />
                      <span>{solicitud.nombreContacto}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{solicitud.email}</span>
                    </div>
                    {solicitud.tiendaTelefono && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{solicitud.tiendaTelefono}</span>
                      </div>
                    )}
                    {solicitud.tiendaDireccion && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{solicitud.tiendaDireccion}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {solicitud.fechaSolicitud?.toDate
                          ? solicitud.fechaSolicitud
                              .toDate()
                              .toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  {solicitud.estado === "pendiente" && (
                    <div className="flex gap-3 pt-3">
                      <button
                        onClick={() => aprobarSolicitud(solicitud)}
                        disabled={procesando === solicitud.id}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {procesando === solicitud.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Procesando...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Aprobar
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => openRejectModal(solicitud)}
                        disabled={procesando === solicitud.id}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XCircle className="w-4 h-4" />
                        Rechazar
                      </button>
                    </div>
                  )}

                  {/* Info de revisión */}
                  {solicitud.estado !== "pendiente" && (
                    <div className="pt-3 border-t text-sm text-gray-600">
                      <p>
                        <strong>Revisado por:</strong> {solicitud.revisadoPor}
                      </p>
                      <p>
                        <strong>Fecha:</strong>{" "}
                        {solicitud.fechaRevision?.toDate
                          ? solicitud.fechaRevision.toDate().toLocaleString()
                          : "N/A"}
                      </p>
                      {solicitud.notasAdmin && (
                        <p className="mt-2">
                          <strong>Notas:</strong> {solicitud.notasAdmin}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
      {/* Modal de rechazo */}
      <AnimatePresence>
        {rejectModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setRejectModalOpen(false)}
            />
            <motion.div
              className="relative z-10 w-full max-w-md bg-white rounded-xl shadow-xl p-6"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <h3 className="text-lg font-bold text-gray-900">
                Rechazar solicitud
              </h3>
              {solicitudARechazar && (
                <p className="text-sm text-gray-600 mt-1">
                  Tienda: <strong>{solicitudARechazar.tiendaNombre}</strong>
                </p>
              )}
              <label className="block text-sm font-medium text-gray-700 mt-4">
                Motivo del rechazo
              </label>
              <textarea
                className="mt-1 w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                rows={4}
                placeholder="Escribe el motivo del rechazo..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    setRejectModalOpen(false);
                    setRejectReason("");
                    setSolicitudARechazar(null);
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700"
                  onClick={confirmarRechazo}
                  disabled={!!procesando}
                >
                  Confirmar rechazo
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
