import React from "react";
import { useNavigate } from "react-router-dom";
import FollowButton from "./ui/FollowButton";
import { Store, MapPin, Package } from "lucide-react";
import { motion } from "framer-motion";

/**
 * TARJETA DE USUARIO/TIENDA CON FOLLOW BUTTON
 * Muestra información del usuario y permite seguirlo
 * Stats se actualizan en tiempo real automáticamente
 */
export default function UserCard({ user, variant = "default" }) {
  const navigate = useNavigate();

  if (!user) return null;

  const avatarSrc =
    user.photoURL ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user.displayName || "Usuario"
    )}&size=200&background=2563eb&color=fff&bold=true`;

  const displayName =
    user.displayName || user.email?.split("@")[0] || "Usuario";

  // ═══════════════════════════════════════════════════════════
  // VARIANT: COMPACT (Para listas)
  // ═══════════════════════════════════════════════════════════
  if (variant === "compact") {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700"
      >
        <div
          className="flex items-center gap-3 flex-1 cursor-pointer"
          onClick={() => navigate(`/user/${user.uid}`)}
        >
          <img
            src={avatarSrc}
            alt={displayName}
            className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
          />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {displayName}
            </h3>
            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <span>{user.stats?.seguidores || 0} seguidores</span>
              {user.isSeller && (
                <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                  <Store size={14} />
                  Tienda
                </span>
              )}
            </div>
          </div>
        </div>

        <FollowButton targetUserId={user.uid} variant="compact" />
      </motion.div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // VARIANT: DEFAULT (Tarjeta completa)
  // ═══════════════════════════════════════════════════════════
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all overflow-hidden border border-gray-200 dark:border-gray-700"
    >
      {/* Header con avatar */}
      <div className="relative h-32 bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
          <img
            src={avatarSrc}
            alt={displayName}
            className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-xl cursor-pointer hover:scale-105 transition-transform"
            onClick={() => navigate(`/user/${user.uid}`)}
          />
        </div>
        {user.isSeller && (
          <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg">
            <Store size={14} />
            Tienda
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="pt-16 pb-6 px-6 text-center">
        <h3
          className="text-xl font-bold text-gray-900 dark:text-white mb-1 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          onClick={() => navigate(`/user/${user.uid}`)}
        >
          {displayName}
        </h3>

        {user.storeName && (
          <p className="text-sm text-blue-600 dark:text-blue-400 mb-3 font-medium">
            {user.storeName}
          </p>
        )}

        {/* Stats en tiempo real */}
        <div className="flex justify-center gap-6 py-4 border-y border-gray-200 dark:border-gray-700 mb-4">
          <div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {user.stats?.publicaciones || 0}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Productos
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {user.stats?.seguidores || 0}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Seguidores
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {user.stats?.seguidos || 0}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Siguiendo
            </div>
          </div>
        </div>

        {/* Información adicional */}
        {(user.direccion || user.ciudad) && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
            <MapPin size={14} />
            <span>{user.ciudad || user.direccion}</span>
          </div>
        )}

        {/* FollowButton */}
        <FollowButton
          targetUserId={user.uid}
          variant="default"
          customClass="w-full"
        />

        {/* Botón Ver Perfil */}
        <button
          onClick={() => navigate(`/user/${user.uid}`)}
          className="w-full mt-3 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
        >
          Ver Perfil Completo
        </button>
      </div>
    </motion.div>
  );
}
