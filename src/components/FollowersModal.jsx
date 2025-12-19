import React, { useState, useEffect } from "react";
import { X, Store, User, ShoppingBag, Users } from "lucide-react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import FollowButton from "./ui/FollowButton";
import LoadingSpinner from "./LoadingSpinner";

export default function FollowersModal({
  isOpen,
  onClose,
  userId,
  type = "seguidores",
}) {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("todos"); // todos, tiendas, usuarios

  useEffect(() => {
    if (!isOpen || !userId) return;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        let usersList = [];
        const collectionName =
          type === "seguidores" ? "followers" : "following";
        const usersRef = collection(db, `users/${userId}/${collectionName}`);
        const snapshot = await getDocs(usersRef);

        const promises = snapshot.docs.map(async (docSnap) => {
          const targetUserId = docSnap.id;
          const userRef = doc(db, "users", targetUserId);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();

            // Determinar si es tienda o usuario normal
            const isStore = !!(
              userData.storeName ||
              userData.storeId ||
              userData.role === "vendedor" ||
              userData.isVendedor ||
              userData.tiendaId
            );

            // Buscar info de la tienda si es vendedor
            let storeInfo = null;
            if (isStore && userData.storeId) {
              try {
                // Buscar en stores
                const storeDoc = await getDoc(
                  doc(db, "stores", userData.storeId)
                );
                if (storeDoc.exists()) {
                  storeInfo = storeDoc.data();
                } else {
                  // Buscar en tiendas
                  const tiendaDoc = await getDoc(
                    doc(db, "tiendas", userData.storeId)
                  );
                  if (tiendaDoc.exists()) {
                    storeInfo = tiendaDoc.data();
                  }
                }
              } catch (e) {
                // Error silencioso
              }
            }

            return {
              uid: targetUserId,
              ...userData,
              isStore,
              storeInfo,
              seguidoEn: docSnap.data().seguidoEn,
            };
          }
          return null;
        });

        usersList = (await Promise.all(promises)).filter(Boolean);

        // Ordenar: tiendas primero, luego usuarios
        usersList.sort((a, b) => {
          if (a.isStore && !b.isStore) return -1;
          if (!a.isStore && b.isStore) return 1;
          return 0;
        });

        setUsers(usersList);
      } catch (error) {
        // Error silencioso
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isOpen, userId, type]);

  if (!isOpen) return null;

  const title = type === "seguidores" ? "Seguidores" : "Siguiendo";
  const subtitle =
    type === "seguidores"
      ? "Personas y tiendas que te siguen"
      : "Personas y tiendas que sigues";

  // Filtrar usuarios según el filtro seleccionado
  const filteredUsers = users.filter((user) => {
    if (filter === "todos") return true;
    if (filter === "tiendas") return user.isStore;
    if (filter === "usuarios") return !user.isStore;
    return true;
  });

  // Contar tiendas y usuarios
  const storeCount = users.filter((u) => u.isStore).length;
  const userCount = users.filter((u) => !u.isStore).length;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 px-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X size={22} className="text-gray-500" />
            </button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>

          {/* Filtros */}
          {!loading && users.length > 0 && (
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setFilter("todos")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  filter === "todos"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                <Users size={14} />
                Todos ({users.length})
              </button>
              <button
                onClick={() => setFilter("tiendas")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  filter === "tiendas"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                <Store size={14} />
                Tiendas ({storeCount})
              </button>
              <button
                onClick={() => setFilter("usuarios")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  filter === "usuarios"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                <User size={14} />
                Usuarios ({userCount})
              </button>
            </div>
          )}
        </div>

        {/* Lista de usuarios */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <LoadingSpinner size="large" color="blue" variant="dots" />
              <p className="text-gray-600 dark:text-gray-400 text-base font-medium mt-4">
                Cargando {type}...
              </p>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <Users size={36} className="text-gray-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-center font-medium">
                {type === "seguidores"
                  ? "Aún no tienes seguidores"
                  : "Aún no sigues a nadie"}
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm text-center mt-1">
                {type === "seguidores"
                  ? "Cuando alguien te siga, aparecerá aquí"
                  : "Explora tiendas y usuarios para seguir"}
              </p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <p className="text-gray-500 dark:text-gray-400 text-center">
                No hay {filter === "tiendas" ? "tiendas" : "usuarios"} en esta
                lista
              </p>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {filteredUsers.map((user) => (
                <div
                  key={user.uid}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div
                    className="flex items-center gap-3 flex-1 cursor-pointer min-w-0"
                    onClick={() => {
                      // Si es tienda, ir a la tienda; si no, ir al perfil
                      if (user.isStore && user.storeId) {
                        navigate(`/tienda/${user.storeId}`);
                      } else {
                        navigate(`/user/${user.uid}`);
                      }
                      onClose();
                    }}
                  >
                    {/* Avatar con indicador de tipo */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={
                          user.photoURL ||
                          user.storeInfo?.logo ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            user.displayName || user.storeName || "User"
                          )}&size=200&background=${
                            user.isStore ? "7c3aed" : "2563eb"
                          }&color=fff&bold=true`
                        }
                        alt={user.displayName || user.storeName}
                        className={`w-12 h-12 rounded-full object-cover border-2 ${
                          user.isStore ? "border-purple-500" : "border-blue-500"
                        }`}
                      />
                      {/* Badge de tipo */}
                      <div
                        className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${
                          user.isStore ? "bg-purple-500" : "bg-blue-500"
                        }`}
                      >
                        {user.isStore ? (
                          <Store size={10} className="text-white" />
                        ) : (
                          <User size={10} className="text-white" />
                        )}
                      </div>
                    </div>

                    {/* Info del usuario/tienda */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {user.displayName || user.storeName || "Usuario"}
                        </h3>
                      </div>

                      {/* Subtítulo según tipo */}
                      {user.isStore ? (
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded-full">
                            Tienda
                          </span>
                          {user.storeName &&
                            user.storeName !== user.displayName && (
                              <span className="text-xs text-gray-500 truncate">
                                {user.storeName}
                              </span>
                            )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                            Usuario
                          </span>
                          {user.email && (
                            <span className="text-xs text-gray-400 truncate">
                              {user.email.split("@")[0]}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botón de seguir */}
                  <div className="flex-shrink-0 ml-2">
                    <FollowButton targetUserId={user.uid} variant="compact" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
