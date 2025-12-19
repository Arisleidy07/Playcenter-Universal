import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import ToastNotification from "../components/ToastNotification";
import {
  Store,
  Star,
  Package,
  MapPin,
  UserPlus,
  UserCheck,
  Users,
} from "lucide-react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  increment,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Tiendas() {
  const [tiendas, setTiendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();

  // Sistema de notificaciones
  const [notifications, setNotifications] = useState([]);

  const showNotification = (message, type = "info", title = null) => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { id, message, type, title }]);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  useEffect(() => {
    fetchTiendas();
  }, []);

  const fetchTiendas = async () => {
    try {
      // Obtener de colección "tiendas" (tienda principal antigua)
      const qTiendas = query(
        collection(db, "tiendas"),
        where("estado", "==", "activa")
      );
      const snapshotTiendas = await getDocs(qTiendas);
      const tiendasAntiguasData = snapshotTiendas.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        principal: doc.id === "playcenter_universal", // SOLO esta es principal
      }));

      // Obtener de colección "stores" (tiendas de vendedores)
      const qStores = query(
        collection(db, "stores"),
        where("activa", "==", true)
      );
      const snapshotStores = await getDocs(qStores);
      const storesData = snapshotStores.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        principal: false, // Ninguna de stores es principal
      }));

      // Combinar ambas
      let todasTiendas = [...tiendasAntiguasData, ...storesData];

      // Ordenar: principal primero, luego por fecha
      todasTiendas.sort((a, b) => {
        if (a.principal && !b.principal) return -1;
        if (!a.principal && b.principal) return 1;
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      });

      setTiendas(todasTiendas);
    } catch (error) {
      // Error silencioso
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <LoadingSpinner size="xlarge" color="blue" variant="pulse" />
          <p className="text-gray-700 dark:text-gray-300 text-xl font-semibold mt-6 animate-pulse">
            Cargando tiendas...
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
            Un momento por favor
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        paddingTop: "10px",
        backgroundColor: isDark ? "#000000" : "#f9fafb",
      }}
    >
      {/* FULL SCREEN - CON PADDING MÍNIMO */}
      <div className="w-full px-2 py-2 md:px-3">
        {/* Tiendas Grid - FULL SCREEN, SIN MÁRGENES */}
        {tiendas.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 px-4"
          >
            <Store size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No hay tiendas disponibles
            </h3>
            <p className="text-gray-500">Pronto habrá tiendas para explorar</p>
          </motion.div>
        ) : (
          <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {tiendas.map((tienda, index) => (
                <TiendaCard
                  key={tienda.id}
                  tienda={tienda}
                  index={index}
                  showNotification={showNotification}
                />
              ))}
            </div>
          </div>
        )}

        {/* Sistema de notificaciones */}
        <ToastNotification
          notifications={notifications}
          onRemove={removeNotification}
        />
      </div>
    </div>
  );
}

// Componente TiendaCard - Diseño limpio y profesional
function TiendaCard({ tienda, index, showNotification }) {
  const { usuario } = useAuth();
  const { isDark } = useTheme();
  const [siguiendo, setSiguiendo] = useState(false);
  const [seguidores, setSeguidores] = useState(tienda.seguidores || 0);
  const [productosCount, setProductosCount] = useState(tienda.productos || 0);
  const [loadingSeguir, setLoadingSeguir] = useState(false);

  // Determinar la colección correcta (tiendas antiguas vs stores nuevas)
  const tiendaCollection = tienda.principal ? "tiendas" : "stores";

  // ═══════════════════════════════════════════════════════════
  // CONTAR PRODUCTOS REALES DE LA TIENDA
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (!tienda.id) return;

    const fetchProductCount = async () => {
      try {
        const productIds = new Set();

        // Buscar productos por storeId (activos)
        const qStoreIdActivo = query(
          collection(db, "productos"),
          where("storeId", "==", tienda.id),
          where("activo", "==", true)
        );
        const snapStoreIdActivo = await getDocs(qStoreIdActivo);
        snapStoreIdActivo.docs.forEach((doc) => productIds.add(doc.id));

        // Buscar productos por storeId (sin filtro activo, por si no tienen el campo)
        const qStoreId = query(
          collection(db, "productos"),
          where("storeId", "==", tienda.id)
        );
        const snapStoreId = await getDocs(qStoreId);
        snapStoreId.docs.forEach((doc) => {
          const data = doc.data();
          // Solo agregar si activo es true o no está definido
          if (data.activo !== false) {
            productIds.add(doc.id);
          }
        });

        // También buscar por tiendaId (compatibilidad)
        const qTiendaId = query(
          collection(db, "productos"),
          where("tiendaId", "==", tienda.id)
        );
        const snapTiendaId = await getDocs(qTiendaId);
        snapTiendaId.docs.forEach((doc) => {
          const data = doc.data();
          if (data.activo !== false) {
            productIds.add(doc.id);
          }
        });

        // Buscar por tienda_id (legacy)
        const qLegacy = query(
          collection(db, "productos"),
          where("tienda_id", "==", tienda.id)
        );
        const snapLegacy = await getDocs(qLegacy);
        snapLegacy.docs.forEach((doc) => {
          const data = doc.data();
          if (data.activo !== false) {
            productIds.add(doc.id);
          }
        });

        setProductosCount(productIds.size);
      } catch (error) {
        // Error silencioso, mantener el valor inicial
      }
    };

    fetchProductCount();
  }, [tienda.id]);

  // Verificar si usuario sigue esta tienda EN TIEMPO REAL
  useEffect(() => {
    if (!usuario || !tienda.id) return;

    const seguidorRef = doc(
      db,
      tiendaCollection,
      tienda.id,
      "seguidores",
      usuario.uid
    );
    const unsubscribe = onSnapshot(
      seguidorRef,
      (doc) => {
        setSiguiendo(doc.exists());
      },
      (error) => {
        // Error silencioso
      }
    );

    return () => unsubscribe();
  }, [usuario, tienda.id, tiendaCollection]);

  // Escuchar cambios en el contador de seguidores EN TIEMPO REAL
  useEffect(() => {
    if (!tienda.id) return;

    const tiendaRef = doc(db, tiendaCollection, tienda.id);
    const unsubscribe = onSnapshot(
      tiendaRef,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setSeguidores(data.seguidores || 0);
        }
      },
      (error) => {
        // Error silencioso
      }
    );

    return () => unsubscribe();
  }, [tienda.id, tiendaCollection]);

  const handleSeguir = async (e) => {
    e.preventDefault(); // Evitar navegación
    e.stopPropagation();

    if (!usuario) {
      showNotification(
        "Debes iniciar sesión para seguir tiendas",
        "warning",
        "Iniciar sesión"
      );
      return;
    }

    setLoadingSeguir(true);

    try {
      const tiendaRef = doc(db, tiendaCollection, tienda.id);
      const seguidorRef = doc(
        db,
        tiendaCollection,
        tienda.id,
        "seguidores",
        usuario.uid
      );
      const usuarioRef = doc(db, "users", usuario.uid);

      if (siguiendo) {
        // Dejar de seguir
        await deleteDoc(seguidorRef);
        await updateDoc(tiendaRef, {
          seguidores: increment(-1),
        });

        const usuarioSnap = await getDoc(usuarioRef);
        if (usuarioSnap.exists()) {
          const tiendasSeguidas = usuarioSnap.data().tiendasSeguidas || [];
          await updateDoc(usuarioRef, {
            tiendasSeguidas: tiendasSeguidas.filter((t) => t !== tienda.id),
          });
        }

        setSiguiendo(false);
        setSeguidores((prev) => Math.max(0, prev - 1));
      } else {
        // Seguir
        await setDoc(seguidorRef, {
          usuarioId: usuario.uid,
          fechaSeguimiento: new Date(),
        });
        await updateDoc(tiendaRef, {
          seguidores: increment(1),
        });

        const usuarioSnap = await getDoc(usuarioRef);
        if (usuarioSnap.exists()) {
          const tiendasSeguidas = usuarioSnap.data().tiendasSeguidas || [];
          if (!tiendasSeguidas.includes(tienda.id)) {
            await updateDoc(usuarioRef, {
              tiendasSeguidas: [...tiendasSeguidas, tienda.id],
            });
          }
        } else {
          await setDoc(
            usuarioRef,
            {
              tiendasSeguidas: [tienda.id],
            },
            { merge: true }
          );
        }

        setSiguiendo(true);
        setSeguidores((prev) => prev + 1);
      }
    } catch (error) {
      showNotification(
        "Error al procesar la acción. Intenta de nuevo.",
        "error",
        "Error"
      );
    } finally {
      setLoadingSeguir(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, type: "spring", stiffness: 100 }}
      className="group"
    >
      <Link
        to={`/tiendas/${tienda.id}`}
        className="block h-full"
        style={{ textDecoration: "none" }}
        aria-label={`Ver tienda ${tienda.nombre}`}
      >
        <div
          className="rounded-3xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 h-full"
          style={{
            backgroundColor: isDark ? "#1e293b" : "#ffffff",
            border: isDark
              ? "1px solid rgba(59, 130, 246, 0.2)"
              : "1px solid rgba(229, 231, 235, 0.8)",
          }}
        >
          {/* Banner HORIZONTAL - COMPACTO con efecto hover */}
          <div
            className="relative w-full flex justify-center items-center overflow-hidden"
            style={{
              backgroundColor: "transparent",
              minHeight: "140px",
              maxHeight: "140px",
            }}
          >
            {tienda.banner ? (
              <img
                src={tienda.banner}
                alt={`Banner de ${tienda.nombre}`}
                className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-105"
                style={{
                  objectFit: "contain",
                  imageRendering: "auto",
                  opacity: 1,
                  visibility: "visible",
                  display: "block",
                }}
                loading="eager"
              />
            ) : (
              <div className="w-full h-48 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                <Store size={64} className="text-white opacity-40" />
              </div>
            )}
          </div>

          {/* Zona inferior: Logo + Nombre + Botón - COMPACTO */}
          <div className="p-3 md:p-4">
            <div className="flex items-center gap-3 mb-3">
              {/* Logo circular más pequeño y compacto */}
              <div className="w-14 h-14 md:w-16 md:h-16 bg-white dark:bg-gray-700 rounded-full shadow-lg border-2 border-gray-200 dark:border-gray-600 flex-shrink-0 overflow-hidden flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl">
                {tienda.logo ? (
                  <img
                    src={tienda.logo}
                    alt={`Logo de ${tienda.nombre}`}
                    className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-110"
                    style={{
                      imageRendering: "auto",
                    }}
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full">
                    <Store
                      size={24}
                      className="text-gray-400 dark:text-gray-500"
                    />
                  </div>
                )}
              </div>

              {/* Nombre de la tienda responsive */}
              <div className="flex-1 min-w-0">
                <h2
                  className="text-lg md:text-xl font-bold text-gray-900 dark:text-white transition-colors duration-200 tracking-tight line-clamp-1"
                  style={{
                    textDecoration: "none",
                    borderBottom: "none",
                    border: "none",
                    overflow: "hidden",
                    fontFamily:
                      "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    letterSpacing: "-0.02em",
                    lineHeight: "1.2",
                  }}
                >
                  {tienda.nombre}
                </h2>
                {tienda.descripcion && (
                  <p
                    className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-snug line-clamp-2"
                    style={{
                      overflow: "hidden",
                      textDecoration: "none",
                      borderBottom: "none",
                      fontFamily:
                        "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                      lineHeight: "1.4",
                    }}
                  >
                    {tienda.descripcion}
                  </p>
                )}
              </div>
            </div>

            {/* Estadísticas y Botón Seguir */}
            <div className="flex items-center justify-between gap-2 mt-3">
              {/* Badges de estadísticas */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full text-xs font-semibold shadow-sm">
                  <Users className="w-3.5 h-3.5" />
                  <span
                    style={{
                      fontFamily:
                        "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
                    }}
                  >
                    {seguidores}
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-gradient-to-r from-cyan-100 to-cyan-50 dark:from-cyan-900/40 dark:to-cyan-900/20 text-cyan-700 dark:text-cyan-300 px-2 py-1 rounded-full text-xs font-semibold shadow-sm">
                  <Package className="w-3.5 h-3.5" />
                  <span
                    style={{
                      fontFamily:
                        "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
                    }}
                  >
                    {productosCount}
                  </span>
                </div>
              </div>

              {/* Botón Seguir - Visible para TODOS */}
              <button
                onClick={
                  usuario
                    ? handleSeguir
                    : () => {
                        // Redirigir a login o mostrar modal de login
                        window.location.href = "/login";
                      }
                }
                disabled={loadingSeguir}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold text-xs transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg ${
                  siguiendo
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                    : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                } ${loadingSeguir ? "opacity-50 cursor-not-allowed" : ""}`}
                style={{
                  fontFamily:
                    "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
                }}
              >
                {loadingSeguir ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                ) : usuario ? (
                  siguiendo ? (
                    <>
                      <UserCheck size={14} />
                      <span className="hidden sm:inline">Siguiendo</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={14} />
                      <span className="hidden sm:inline">Seguir</span>
                    </>
                  )
                ) : (
                  <>
                    <UserPlus size={14} />
                    <span className="hidden sm:inline">Seguir</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
