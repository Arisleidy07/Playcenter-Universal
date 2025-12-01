import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import FollowButton from "../components/ui/FollowButton";
import FollowersModal from "../components/FollowersModal";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Package,
  Users,
  UserCheck,
  Store,
  Mail,
  Phone,
} from "lucide-react";

/**
 * PÁGINA DE PERFIL DE OTRO USUARIO
 * Permite ver el perfil de cualquier usuario/tienda y seguirlo
 */
export default function UserProfile() {
  const { userId } = useParams();
  const { usuario: currentUser } = useAuth();
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    seguidores: 0,
    seguidos: 0,
    publicaciones: 0,
  });
  const [productos, setProductos] = useState([]);

  // Estados para modales de seguidores/seguidos
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [followersModalType, setFollowersModalType] = useState("seguidores");

  // ═══════════════════════════════════════════════════════════
  // LISTENER EN TIEMPO REAL DEL USUARIO
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (!userId) return;

    // Redirigir si intenta ver su propio perfil
    if (currentUser && userId === currentUser.uid) {
      navigate("/profile");
      return;
    }

    const userRef = doc(db, "users", userId);

    // Listener en tiempo real
    const unsubscribe = onSnapshot(
      userRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);

          // Actualizar stats en tiempo real
          setStats({
            seguidores: data.stats?.seguidores || 0,
            seguidos: data.stats?.seguidos || 0,
            publicaciones: data.stats?.publicaciones || 0,
          });
        } else {
          console.error("Usuario no encontrado");
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error al cargar usuario:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId, currentUser, navigate]);

  // ═══════════════════════════════════════════════════════════
  // CARGAR PRODUCTOS DEL USUARIO
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (!userId) return;

    const fetchProductos = async () => {
      try {
        const q = query(
          collection(db, "productos"),
          where("usuario_id", "==", userId),
          where("activo", "==", true)
        );
        const snapshot = await getDocs(q);
        const prods = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProductos(prods);
      } catch (error) {
        console.error("Error cargando productos:", error);
      }
    };

    fetchProductos();
  }, [userId]);

  // ═══════════════════════════════════════════════════════════
  // AVATAR
  // ═══════════════════════════════════════════════════════════
  const avatarSrc =
    userData?.photoURL ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      userData?.displayName || "Usuario"
    )}&size=200&background=2563eb&color=fff&bold=true`;

  const displayName =
    userData?.displayName || userData?.email?.split("@")[0] || "Usuario";

  // ═══════════════════════════════════════════════════════════
  // LOADING STATE
  // ═══════════════════════════════════════════════════════════
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Users size={64} className="text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Usuario no encontrado
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            El perfil que buscas no existe o fue eliminado
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      {/* Header fijo con botón volver */}
      <div className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-700 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {displayName}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {stats.publicaciones} publicaciones
            </p>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Perfil Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <img
                src={avatarSrc}
                alt={displayName}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-blue-500 shadow-xl"
              />
              {userData.isSeller && (
                <div className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full shadow-lg">
                  <Store size={20} />
                </div>
              )}
            </div>

            {/* Info y FollowButton */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {displayName}
                </h2>

                {/* FOLLOW BUTTON - SE ACTUALIZA EN TIEMPO REAL */}
                {currentUser && userId !== currentUser.uid && (
                  <FollowButton
                    targetUserId={userId}
                    variant="default"
                    customClass="md:ml-auto"
                  />
                )}
              </div>

              {userData.storeName && (
                <div className="flex items-center justify-center md:justify-start gap-2 text-blue-600 dark:text-blue-400 mb-4">
                  <Store size={18} />
                  <span className="font-semibold">{userData.storeName}</span>
                </div>
              )}

              {/* Stats en tiempo real - CLICABLES */}
              <div className="flex justify-center md:justify-start gap-8 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.publicaciones}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Publicaciones
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFollowersModalType("seguidores");
                    setFollowersModalOpen(true);
                  }}
                  className="text-center hover:opacity-75 transition-opacity group"
                >
                  <div className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {stats.seguidores}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Seguidores
                  </div>
                </button>
                <button
                  onClick={() => {
                    setFollowersModalType("seguidos");
                    setFollowersModalOpen(true);
                  }}
                  className="text-center hover:opacity-75 transition-opacity group"
                >
                  <div className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {stats.seguidos}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Siguiendo
                  </div>
                </button>
              </div>

              {/* Información adicional */}
              <div className="space-y-2 text-gray-600 dark:text-gray-400">
                {userData.email && (
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <Mail size={16} />
                    <span className="text-sm">{userData.email}</span>
                  </div>
                )}
                {userData.telefono && (
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <Phone size={16} />
                    <span className="text-sm">{userData.telefono}</span>
                  </div>
                )}
                {userData.direccion && (
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <MapPin size={16} />
                    <span className="text-sm">{userData.direccion}</span>
                  </div>
                )}
                {userData.createdAt && (
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <Calendar size={16} />
                    <span className="text-sm">
                      Miembro desde{" "}
                      {new Date(
                        userData.createdAt.seconds * 1000
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Productos del usuario */}
        {productos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Package size={24} />
              Productos de {displayName}
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {productos.map((producto) => {
                const imagen =
                  producto.imagen ||
                  producto.imagenes?.[0] ||
                  "/placeholder.png";

                return (
                  <motion.div
                    key={producto.id}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => navigate(`/producto/${producto.id}`)}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all cursor-pointer overflow-hidden"
                  >
                    <img
                      src={imagen}
                      alt={producto.nombre}
                      className="w-full h-48 object-contain bg-gray-100 dark:bg-gray-700"
                    />
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">
                        {producto.nombre}
                      </h4>
                      <p className="text-blue-600 dark:text-blue-400 font-bold">
                        RD$ {producto.precio?.toFixed(2)}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {productos.length === 0 && (
          <div className="text-center py-12">
            <Package size={64} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {displayName} aún no tiene productos publicados
            </p>
          </div>
        )}
      </div>

      {/* Modal de Seguidores/Seguidos */}
      <FollowersModal
        isOpen={followersModalOpen}
        onClose={() => setFollowersModalOpen(false)}
        userId={userId}
        type={followersModalType}
      />
    </div>
  );
}
