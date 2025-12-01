import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import UserCard from "../components/UserCard";
import { motion } from "framer-motion";
import { Users, Store, Search, TrendingUp, Filter } from "lucide-react";

/**
 * PÁGINA DE EXPLORAR USUARIOS Y TIENDAS
 * Muestra todos los usuarios con sistema de seguimiento
 * Stats se actualizan en tiempo real
 */
export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, sellers, users
  const [sortBy, setSortBy] = useState("followers"); // followers, products, recent

  // ═══════════════════════════════════════════════════════════
  // CARGAR USUARIOS EN TIEMPO REAL
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    let q = collection(db, "users");

    // Filtrar por tipo
    if (filterType === "sellers") {
      q = query(q, where("isSeller", "==", true));
    }

    // Ordenar según criterio
    if (sortBy === "followers") {
      q = query(q, orderBy("stats.seguidores", "desc"), limit(50));
    } else if (sortBy === "products") {
      q = query(q, orderBy("stats.publicaciones", "desc"), limit(50));
    } else {
      q = query(q, orderBy("createdAt", "desc"), limit(50));
    }

    // Listener en tiempo real
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const usersData = snapshot.docs.map((doc) => ({
          uid: doc.id,
          ...doc.data(),
        }));
        setUsers(usersData);
        setLoading(false);
      },
      (error) => {
        console.error("Error cargando usuarios:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [filterType, sortBy]);

  // ═══════════════════════════════════════════════════════════
  // FILTRAR POR BÚSQUEDA
  // ═══════════════════════════════════════════════════════════
  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.displayName?.toLowerCase().includes(searchLower) ||
      user.storeName?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower)
    );
  });

  // ═══════════════════════════════════════════════════════════
  // LOADING STATE
  // ═══════════════════════════════════════════════════════════
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Cargando usuarios...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <Users size={36} className="text-blue-600" />
            Explorar Usuarios y Tiendas
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Descubre vendedores, tiendas y usuarios. ¡Síguelos para ver sus
            publicaciones!
          </p>
        </motion.div>

        {/* Filtros y búsqueda */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8"
        >
          {/* Barra de búsqueda */}
          <div className="relative mb-6">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar por nombre, tienda o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-4">
            {/* Tipo de usuario */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Filter size={16} />
                Tipo
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">Todos</option>
                <option value="sellers">Solo Tiendas</option>
                <option value="users">Solo Usuarios</option>
              </select>
            </div>

            {/* Ordenar por */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <TrendingUp size={16} />
                Ordenar por
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="followers">Más Seguidores</option>
                <option value="products">Más Productos</option>
                <option value="recent">Más Recientes</option>
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Mostrando {filteredUsers.length}{" "}
              {filteredUsers.length === 1 ? "usuario" : "usuarios"}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {users.filter((u) => u.isSeller).length} tiendas activas
            </span>
          </div>
        </motion.div>

        {/* Grid de usuarios */}
        {filteredUsers.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredUsers.map((user, index) => (
              <motion.div
                key={user.uid}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <UserCard user={user} variant="default" />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Users size={64} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No se encontraron usuarios
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm
                ? `No hay resultados para "${searchTerm}"`
                : "Ajusta los filtros para ver más usuarios"}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
