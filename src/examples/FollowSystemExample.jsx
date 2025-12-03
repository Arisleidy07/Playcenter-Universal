import React, { useState, useEffect } from "react";
import { collection, query, limit, getDocs, where } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import FollowButton from "../components/ui/FollowButton";
import { Store, Users, TrendingUp, ExternalLink } from "lucide-react";

/**
 * EJEMPLO DE USO DEL SISTEMA DE FOLLOW/UNFOLLOW
 *
 * Este componente muestra cómo usar FollowButton en diferentes contextos:
 * 1. Tarjetas de tiendas/usuarios (variant="default")
 * 2. Lista compacta (variant="compact")
 * 3. Lista densa (variant="icon-only")
 */
export default function FollowSystemExample() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsuariosEjemplo();
  }, []);

  const fetchUsuariosEjemplo = async () => {
    try {
      // Obtener algunos usuarios de ejemplo
      const usersRef = collection(db, "users");
      const q = query(usersRef, limit(5));
      const snapshot = await getDocs(q);

      const users = snapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      }));

      setUsuarios(users);
    } catch (error) {
      // console.error("Error cargando usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* ═══════════════════════════════════════════════════════════ */}
        {/* BANNER NAVEGACIÓN */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-xl">
          <h2 className="text-2xl font-bold mb-4">🚀 Páginas del Sistema</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate("/usuarios")}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur px-4 py-3 rounded-lg transition-all font-semibold"
            >
              <Users size={20} />
              Explorar Usuarios
              <ExternalLink size={16} className="ml-auto" />
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur px-4 py-3 rounded-lg transition-all font-semibold"
            >
              <Store size={20} />
              Mi Perfil
              <ExternalLink size={16} className="ml-auto" />
            </button>
            <button
              onClick={() =>
                usuarios.length > 0 && navigate(`/user/${usuarios[0].uid}`)
              }
              disabled={usuarios.length === 0}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur px-4 py-3 rounded-lg transition-all font-semibold disabled:opacity-50"
            >
              <TrendingUp size={20} />
              Ver Perfil de Usuario
              <ExternalLink size={16} className="ml-auto" />
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* SECCIÓN 1: TARJETAS DE TIENDAS (Variant Default) */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Store className="text-blue-600" />
            Ejemplo 1: Tarjetas de Tiendas (Default)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {usuarios.slice(0, 3).map((usuario) => (
              <div
                key={usuario.uid}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                {/* Avatar */}
                <div className="flex flex-col items-center mb-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mb-3">
                    {usuario.displayName?.charAt(0) || "?"}
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    {usuario.displayName || "Usuario"}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {usuario.storeName || usuario.email}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex justify-around py-3 border-t border-b border-gray-200 dark:border-gray-700 mb-4">
                  <div className="text-center">
                    <div className="font-bold text-gray-900 dark:text-white">
                      {usuario.stats?.seguidores || 0}
                    </div>
                    <div className="text-xs text-gray-500">Seguidores</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-gray-900 dark:text-white">
                      {usuario.stats?.publicaciones || 0}
                    </div>
                    <div className="text-xs text-gray-500">Productos</div>
                  </div>
                </div>

                {/* FollowButton - Variant Default */}
                <FollowButton
                  targetUserId={usuario.uid}
                  variant="default"
                  customClass="w-full"
                />
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <code className="text-sm">
              {`<FollowButton targetUserId={usuario.uid} variant="default" />`}
            </code>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* SECCIÓN 2: LISTA COMPACTA (Variant Compact) */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Users className="text-green-600" />
            Ejemplo 2: Lista Compacta (Compact)
          </h2>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            {usuarios.map((usuario, index) => (
              <div
                key={usuario.uid}
                className={`
                  flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors
                  ${
                    index !== usuarios.length - 1
                      ? "border-b border-gray-200 dark:border-gray-700"
                      : ""
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar pequeño */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-bold">
                    {usuario.displayName?.charAt(0) || "?"}
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {usuario.displayName || "Usuario"}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {usuario.stats?.seguidores || 0} seguidores
                    </p>
                  </div>
                </div>

                {/* FollowButton - Variant Compact */}
                <FollowButton targetUserId={usuario.uid} variant="compact" />
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <code className="text-sm">
              {`<FollowButton targetUserId={usuario.uid} variant="compact" />`}
            </code>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* SECCIÓN 3: LISTA DENSA (Variant Icon-Only) */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <TrendingUp className="text-purple-600" />
            Ejemplo 3: Lista Densa (Icon Only)
          </h2>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
            <div className="space-y-2">
              {usuarios.map((usuario) => (
                <div
                  key={usuario.uid}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {/* Avatar mini */}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-xs font-bold">
                      {usuario.displayName?.charAt(0) || "?"}
                    </div>

                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {usuario.displayName || "Usuario"}
                    </span>
                  </div>

                  {/* FollowButton - Variant Icon-Only */}
                  <FollowButton
                    targetUserId={usuario.uid}
                    variant="icon-only"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <code className="text-sm">
              {`<FollowButton targetUserId={usuario.uid} variant="icon-only" />`}
            </code>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* INSTRUCCIONES */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">🚀 Cómo Usar</h3>
          <div className="space-y-3 text-sm">
            <p>
              <strong>1. Import:</strong>{" "}
              <code className="bg-white/20 px-2 py-1 rounded">
                import FollowButton from "../components/ui/FollowButton";
              </code>
            </p>
            <p>
              <strong>2. Uso básico:</strong>{" "}
              <code className="bg-white/20 px-2 py-1 rounded">
                {`<FollowButton targetUserId={usuario.uid} />`}
              </code>
            </p>
            <p>
              <strong>3. Variants disponibles:</strong>{" "}
              <code className="bg-white/20 px-2 py-1 rounded">default</code>{" "}
              <code className="bg-white/20 px-2 py-1 rounded">compact</code>{" "}
              <code className="bg-white/20 px-2 py-1 rounded">icon-only</code>
            </p>
            <p>
              <strong>4. Props opcionales:</strong>{" "}
              <code className="bg-white/20 px-2 py-1 rounded">customClass</code>{" "}
              para estilos adicionales
            </p>
          </div>

          <div className="mt-6 p-4 bg-white/10 rounded-lg">
            <p className="font-semibold mb-2">✨ Características:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Optimistic UI - Cambio instantáneo</li>
              <li>Operaciones atómicas con increment()</li>
              <li>Rollback automático si falla</li>
              <li>Actualizaciones en tiempo real</li>
              <li>No puedes seguirte a ti mismo</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
