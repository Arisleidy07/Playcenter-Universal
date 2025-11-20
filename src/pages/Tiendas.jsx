import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
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

  useEffect(() => {
    fetchTiendas();
  }, []);

  const fetchTiendas = async () => {
    try {
      console.log(" Buscando tiendas...");

      // Consulta simple sin orderBy problemático
      const q = query(
        collection(db, "tiendas"),
        where("estado", "==", "activa")
      );

      const snapshot = await getDocs(q);
      console.log(" Tiendas encontradas:", snapshot.size);

      let tiendasData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Ordenar manualmente: principal primero
      tiendasData.sort((a, b) => {
        if (a.principal && !b.principal) return -1;
        if (!a.principal && b.principal) return 1;
        return 0;
      });

      console.log(" Tiendas procesadas:", tiendasData);
      setTiendas(tiendasData);
    } catch (error) {
      console.error(" Error al cargar tiendas:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ paddingTop: "var(--content-offset, 120px)" }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando tiendas...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        paddingTop: "calc(var(--content-offset, 120px) + 16px)",
        backgroundColor: isDark ? "#000000" : "#f9fafb",
      }}
    >
      {/* FULL SCREEN - CON PADDING MÍNIMO */}
      <div className="w-full px-2 py-4 md:px-3">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
              {tiendas.map((tienda, index) => (
                <TiendaCard key={tienda.id} tienda={tienda} index={index} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente TiendaCard - Diseño limpio y profesional
function TiendaCard({ tienda, index }) {
  const { usuario } = useAuth();
  const { isDark } = useTheme();
  const [siguiendo, setSiguiendo] = useState(false);
  const [seguidores, setSeguidores] = useState(tienda.seguidores || 0);
  const [loadingSeguir, setLoadingSeguir] = useState(false);

  // Verificar si usuario sigue esta tienda EN TIEMPO REAL
  useEffect(() => {
    if (!usuario || !tienda.id) return;

    const seguidorRef = doc(
      db,
      "tiendas",
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
        console.error("Error verificando seguidor:", error);
      }
    );

    return () => unsubscribe();
  }, [usuario, tienda.id]);

  // Escuchar cambios en el contador de seguidores EN TIEMPO REAL
  useEffect(() => {
    if (!tienda.id) return;

    const tiendaRef = doc(db, "tiendas", tienda.id);
    const unsubscribe = onSnapshot(
      tiendaRef,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setSeguidores(data.seguidores || 0);
        }
      },
      (error) => {
        console.error("Error escuchando seguidores:", error);
      }
    );

    return () => unsubscribe();
  }, [tienda.id]);

  const handleSeguir = async (e) => {
    e.preventDefault(); // Evitar navegación
    e.stopPropagation();

    if (!usuario) {
      alert("Debes iniciar sesión para seguir tiendas");
      return;
    }

    setLoadingSeguir(true);

    try {
      const tiendaRef = doc(db, "tiendas", tienda.id);
      const seguidorRef = doc(
        db,
        "tiendas",
        tienda.id,
        "seguidores",
        usuario.uid
      );
      const usuarioRef = doc(db, "usuarios", usuario.uid);

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
      console.error("Error al seguir/dejar de seguir:", error);
      alert("Error al procesar la acción. Intenta de nuevo.");
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
        aria-label={`Ver tienda ${tienda.nombre}`}
      >
        <div
          className="rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-3 hover:scale-[1.02] h-full border"
          style={{
            backgroundColor: isDark ? "#1e293b" : "#ffffff",
            borderColor: isDark ? "#334155" : "#e5e7eb",
          }}
        >
          {/* Banner HORIZONTAL - ULTRA HORIZONTAL con efecto hover */}
          <div
            className="relative w-full flex justify-center items-center overflow-hidden"
            style={{
              backgroundColor: isDark ? "#2d3748" : "#f5f5f5",
              minHeight: "200px",
            }}
          >
            {tienda.banner ? (
              <img
                src={tienda.banner}
                alt={`Banner de ${tienda.nombre}`}
                className="w-full h-auto object-contain transition-all duration-500 group-hover:scale-105"
                style={{
                  objectFit: "contain",
                  imageRendering: "auto",
                  opacity: 1,
                  visibility: "visible",
                  display: "block",
                }}
                loading="eager"
                onLoad={(e) => {
                  e.target.style.opacity = 1;
                  e.target.style.visibility = "visible";
                }}
              />
            ) : (
              <div className="w-full h-48 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 group-hover:from-blue-600 group-hover:to-purple-700 transition-all duration-300">
                <Store
                  size={64}
                  className="text-white opacity-40 group-hover:opacity-60 transition-opacity duration-300"
                />
              </div>
            )}
            {/* Overlay sutil en hover */}
            <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 transition-all duration-300" />
          </div>

          {/* Zona inferior: Logo + Nombre + Botón - PERFECTAMENTE BALANCEADO */}
          <div className="p-4 md:p-5">
            <div className="flex items-center gap-3 mb-3">
              {/* Logo circular perfectamente proporcional con efecto hover */}
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white dark:bg-gray-700 rounded-full shadow-lg border-2 border-gray-200 dark:border-gray-600 flex-shrink-0 overflow-hidden flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:border-blue-500 dark:group-hover:border-blue-400">
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
                      className="text-gray-400 dark:text-gray-500 transition-colors duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                    />
                  </div>
                )}
              </div>

              {/* Nombre de la tienda responsive */}
              <div className="flex-1 min-w-0">
                <h2
                  className="text-lg md:text-xl font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200"
                  style={{ textDecoration: "none" }}
                >
                  {tienda.nombre}
                </h2>
                {tienda.descripcion && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                    {tienda.descripcion}
                  </p>
                )}
              </div>
            </div>

            {/* Estadísticas y Botón Seguir */}
            <div className="flex items-center justify-between gap-2 mt-3">
              {/* Badges de estadísticas */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full text-xs font-semibold">
                  <Users className="w-3 h-3" />
                  <span>{seguidores}</span>
                </div>
                <div className="flex items-center gap-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 px-2 py-1 rounded-full text-xs font-semibold">
                  <Package className="w-3 h-3" />
                  <span>{tienda.productos || 0}</span>
                </div>
              </div>

              {/* Botón Seguir */}
              {usuario && (
                <button
                  onClick={handleSeguir}
                  disabled={loadingSeguir}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg ${
                    siguiendo
                      ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                      : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                  } ${loadingSeguir ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {loadingSeguir ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : siguiendo ? (
                    <>
                      <UserCheck size={16} />
                      <span className="hidden sm:inline">Siguiendo</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} />
                      <span className="hidden sm:inline">Seguir</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
