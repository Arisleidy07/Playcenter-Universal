import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  setDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
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
} from "lucide-react";

export default function SolicitudesVendedor() {
  const { usuarioInfo } = useAuth();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("pendiente"); // pendiente | aprobada | rechazada | todas
  const [procesando, setProcesando] = useState(null);

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
        const continuar = window.confirm(
          `⚠️ ADVERTENCIA: Esta solicitud NO tiene userId.\n\nEsto significa que la persona NO estaba logueada cuando aplicó.\n\n¿Deseas continuar de todos modos?\n\n- Se creará la tienda\n- Pero NO se actualizará el usuario automáticamente\n- Tendrás que vincularlo manualmente`
        );
        if (!continuar) {
          setProcesando(null);
          return;
        }
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
      if (solicitud.userId) {
        await setDoc(
          doc(db, "users", solicitud.userId),
          {
            role: "seller",
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
      console.log("✅ Solicitud marcada como aprobada");

      // 4. OPCIONAL: Enviar notificación por email
      console.log("📧 Paso 4/4: Encolando email...");
      // Esto se puede implementar con Firebase Functions + SendGrid/Mailgun
      // Por ahora guardamos la notificación en Firestore para procesarla después
      try {
        await addDoc(collection(db, "mail_queue"), {
          to: solicitud.email,
          subject: "¡Tu tienda ha sido aprobada en Playcenter!",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #2563eb;">¡Felicidades! 🎉</h1>
              <p>Hola <strong>${solicitud.nombreContacto}</strong>,</p>
              <p>Tu solicitud para crear la tienda <strong>"${solicitud.tiendaNombre}"</strong> ha sido aprobada.</p>
              <h2 style="color: #16a34a;">¿Qué sigue?</h2>
              <ol>
                <li>Inicia sesión en <a href="https://playcenter.com">Playcenter</a></li>
                <li>Ve a tu panel de administración</li>
                <li>Empieza a subir tus productos</li>
                <li>Comienza a vender</li>
              </ol>
              <p style="margin-top: 30px;">
                <a href="https://playcenter.com/admin" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Ir a mi panel</a>
              </p>
              <p style="color: #666; margin-top: 30px; font-size: 14px;">Si tienes alguna pregunta, contáctanos.</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              <p style="color: #999; font-size: 12px; text-align: center;">
                © 2024 Playcenter Universal. Todos los derechos reservados.
              </p>
            </div>
          `,
          sentAt: null,
          status: "pending",
          createdAt: new Date(),
        });
      } catch (emailError) {
        // No fallar si el email no se pudo enviar
      }

      // Mensaje detallado
      const mensaje = solicitud.userId
        ? `✅ Tienda "${solicitud.tiendaNombre}" aprobada exitosamente!\n\n🎉 El vendedor ahora puede:\n✅ Ver su tienda en /tiendas\n✅ Acceder a su panel en /admin\n✅ Subir productos\n\n📧 Se envió email a: ${solicitud.email}`
        : `✅ Tienda "${solicitud.tiendaNombre}" CREADA!\n\n⚠️ NOTA: El solicitante NO estaba logueado.\n\n✅ La tienda es visible en /tiendas\n❌ Pero debes vincular manualmente al usuario\n\n📧 Email encolado para: ${solicitud.email}`;

      alert(mensaje);
    } catch (error) {
      alert(`❌ Error al aprobar la solicitud:\n\n${error.message}`);
    } finally {
      setProcesando(null);
    }
  };

  const rechazarSolicitud = async (solicitud, motivo = "") => {
    const motivoRechazo = motivo || prompt("Motivo del rechazo (opcional):");

    setProcesando(solicitud.id);

    try {
      await updateDoc(doc(db, "solicitudes_vendedor", solicitud.id), {
        estado: "rechazada",
        revisadoPor: usuarioInfo.email,
        fechaRevision: new Date(),
        notasAdmin: motivoRechazo || "Rechazada sin motivo especificado",
      });

      alert(`❌ Solicitud rechazada.`);
    } catch (error) {
      console.error("Error al rechazar solicitud:", error);
      alert("Hubo un error al rechazar la solicitud.");
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
                        ? "⏳ Pendiente"
                        : solicitud.estado === "aprobada"
                        ? "✅ Aprobada"
                        : "❌ Rechazada"}
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
                        onClick={() => rechazarSolicitud(solicitud)}
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
    </div>
  );
}
