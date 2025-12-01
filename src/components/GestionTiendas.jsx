import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  addDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import {
  Store,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Plus,
  Search,
  AlertTriangle,
} from "lucide-react";

export default function GestionTiendas() {
  const { usuarioInfo } = useAuth();
  const [tiendas, setTiendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("");
  const [eliminando, setEliminando] = useState(null);

  // SOLO para super admin
  const isSuperAdmin = usuarioInfo?.email === "arisleidy0712@gmail.com";

  useEffect(() => {
    if (!isSuperAdmin) return;

    const cargarTodasTiendas = async () => {
      try {
        // Obtener de "tiendas" (principal - solo playcenter_universal)
        const snapshotTiendas = await getDocs(collection(db, "tiendas"));
        const tiendasViejas = snapshotTiendas.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          coleccion: "tiendas",
          principal: doc.id === "playcenter_universal", // SOLO esta es principal
          activa: doc.data().estado === "activa",
        }));

        // Obtener de "stores" (vendedores)
        const snapshotStores = await getDocs(collection(db, "stores"));
        const tiendasNuevas = snapshotStores.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          coleccion: "stores",
          principal: false, // Ninguna de stores es principal
        }));

        // Combinar y ordenar
        const todas = [...tiendasViejas, ...tiendasNuevas];
        todas.sort((a, b) => {
          if (a.principal && !b.principal) return -1;
          if (!a.principal && b.principal) return 1;
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB - dateA;
        });

        setTiendas(todas);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    cargarTodasTiendas();
  }, [isSuperAdmin]);

  const eliminarTienda = async (tienda) => {
    if (tienda.id === "playcenter_universal") {
      alert("No puedes eliminar la tienda principal de Playcenter Universal");
      return;
    }

    const confirmar = window.confirm(
      `¿Estás segura de eliminar la tienda "${tienda.nombre}"?\n\nEsto también:\n- Eliminará la tienda de la vista pública\n- El usuario perderá acceso de vendedor\n- Los productos NO se eliminarán (puedes hacerlo manual)\n\n¿Continuar?`
    );

    if (!confirmar) return;

    setEliminando(tienda.id);

    try {
      // Eliminar de la colección correcta
      const coleccion = tienda.coleccion || "stores";
      await deleteDoc(doc(db, coleccion, tienda.id));

      // Actualizar usuario (quitarle rol de seller)
      if (tienda.ownerUid) {
        try {
          await updateDoc(doc(db, "users", tienda.ownerUid), {
            role: "user",
            isSeller: false,
            storeId: null,
            storeName: null,
          });
        } catch (error) {
          // Error silencioso
        }
      }

      alert(`Tienda "${tienda.nombre}" eliminada correctamente`);

      // Recargar lista
      const cargarTodasTiendas = async () => {
        const snapshotTiendas = await getDocs(collection(db, "tiendas"));
        const tiendasViejas = snapshotTiendas.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          coleccion: "tiendas",
          principal: doc.id === "playcenter_universal",
          activa: doc.data().estado === "activa",
        }));

        const snapshotStores = await getDocs(collection(db, "stores"));
        const tiendasNuevas = snapshotStores.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          coleccion: "stores",
          principal: false,
        }));

        const todas = [...tiendasViejas, ...tiendasNuevas];
        todas.sort((a, b) => {
          if (a.principal && !b.principal) return -1;
          if (!a.principal && b.principal) return 1;
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB - dateA;
        });

        setTiendas(todas);
      };
      cargarTodasTiendas();
    } catch (error) {
      alert("Error al eliminar la tienda. Intenta de nuevo.");
    } finally {
      setEliminando(null);
    }
  };

  const toggleActiva = async (tienda) => {
    try {
      const coleccion = tienda.coleccion || "stores";

      if (coleccion === "tiendas") {
        // Para tiendas viejas, actualizar el campo "estado"
        await updateDoc(doc(db, "tiendas", tienda.id), {
          estado: tienda.activa ? "inactiva" : "activa",
        });
      } else {
        // Para stores nuevas, actualizar el campo "activa"
        await updateDoc(doc(db, "stores", tienda.id), {
          activa: !tienda.activa,
        });
      }

      alert(
        `Tienda "${tienda.nombre}" ${
          tienda.activa ? "desactivada" : "activada"
        }`
      );
    } catch (error) {
      alert("Error al cambiar el estado de la tienda.");
    }
  };

  const crearNuevaTienda = async () => {
    alert(
      "Para crear una nueva tienda de vendedor:\n\n1. El usuario debe ir a /solicitar-vender\n2. Llenar el formulario de solicitud\n3. Tú aprobarás la solicitud desde la pestaña 'Solicitudes'\n4. La tienda se creará automáticamente\n\nEste panel es solo para VER y GESTIONAR las tiendas existentes."
    );
  };

  if (!isSuperAdmin) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 font-semibold">
          Acceso denegado. Solo el super admin puede gestionar tiendas.
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

  const tiendasFiltradas = tiendas.filter(
    (t) =>
      t.nombre?.toLowerCase().includes(filtro.toLowerCase()) ||
      t.ownerEmail?.toLowerCase().includes(filtro.toLowerCase()) ||
      t.ownerName?.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestión de Tiendas
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Administra todas las tiendas de la plataforma
          </p>
        </div>
        <button
          onClick={crearNuevaTienda}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          ¿Cómo crear tienda?
        </button>
      </div>

      {/* Buscador */}
      <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          placeholder="Buscar por nombre, email o dueño..."
          className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white"
        />
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-2xl font-bold text-blue-900">{tiendas.length}</p>
          <p className="text-sm text-blue-700">Total de Tiendas</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-2xl font-bold text-green-900">
            {tiendas.filter((t) => t.activa).length}
          </p>
          <p className="text-sm text-green-700">Tiendas Activas</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-2xl font-bold text-red-900">
            {tiendas.filter((t) => !t.activa).length}
          </p>
          <p className="text-sm text-red-700">Tiendas Inactivas</p>
        </div>
      </div>

      {/* Lista de Tiendas */}
      <div className="space-y-4">
        {tiendasFiltradas.length === 0 ? (
          <div className="text-center py-12 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
            <Store className="w-16 h-16 mx-auto text-yellow-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {filtro ? "No se encontraron tiendas" : "No hay tiendas creadas"}
            </h3>
            {!filtro && (
              <p className="text-gray-600 mb-4">
                Haz clic en "Crear Tienda Principal" para empezar
              </p>
            )}
          </div>
        ) : (
          tiendasFiltradas.map((tienda) => (
            <motion.div
              key={tienda.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 p-6 ${
                tienda.principal
                  ? "border-yellow-400 bg-yellow-50/50 dark:bg-yellow-900/10"
                  : tienda.activa
                  ? "border-green-300"
                  : "border-red-300"
              }`}
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Imágenes */}
                <div className="flex gap-4">
                  {tienda.logo && (
                    <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200 flex-shrink-0">
                      <img
                        src={tienda.logo}
                        alt="Logo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {tienda.banner && (
                    <div className="w-40 h-20 rounded-lg overflow-hidden border-2 border-gray-200 flex-shrink-0">
                      <img
                        src={tienda.banner}
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
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          <Store className="w-5 h-5 inline mr-2 text-blue-600" />
                          {tienda.nombre}
                        </h3>
                        {tienda.principal && (
                          <span className="px-2 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold">
                            ⭐ PRINCIPAL
                          </span>
                        )}
                      </div>
                      {tienda.eslogan && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 italic mt-1">
                          "{tienda.eslogan}"
                        </p>
                      )}
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        tienda.activa
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {tienda.activa ? "Activa" : "Inactiva"}
                    </span>
                  </div>

                  {tienda.descripcion && (
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      {tienda.descripcion}
                    </p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <p className="text-gray-600 dark:text-gray-400">
                      <strong>Dueño:</strong> {tienda.ownerName}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <strong>Email:</strong> {tienda.ownerEmail}
                    </p>
                    {tienda.telefono && (
                      <p className="text-gray-600 dark:text-gray-400">
                        <strong>Teléfono:</strong> {tienda.telefono}
                      </p>
                    )}
                    {tienda.direccion && (
                      <p className="text-gray-600 dark:text-gray-400">
                        <strong>Dirección:</strong> {tienda.direccion}
                      </p>
                    )}
                    <p className="text-gray-600 dark:text-gray-400">
                      <strong>Creada:</strong>{" "}
                      {tienda.createdAt?.toDate
                        ? tienda.createdAt.toDate().toLocaleDateString()
                        : "N/A"}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <strong>ID:</strong>{" "}
                      <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {tienda.id}
                      </code>
                    </p>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-3 pt-3">
                    <button
                      onClick={() => toggleActiva(tienda)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                        tienda.activa
                          ? "bg-orange-600 text-white hover:bg-orange-700"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      {tienda.activa ? (
                        <>
                          <EyeOff className="w-4 h-4" />
                          Desactivar
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" />
                          Activar
                        </>
                      )}
                    </button>

                    <a
                      href={`/tiendas/${tienda.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Ver Tienda
                    </a>

                    {!tienda.principal && (
                      <button
                        onClick={() => eliminarTienda(tienda)}
                        disabled={eliminando === tienda.id}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {eliminando === tienda.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Eliminando...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4" />
                            Eliminar
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {tienda.principal && (
                    <div className="flex items-start gap-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 rounded-lg p-3 mt-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>Tienda Principal:</strong> Esta es la tienda
                        oficial de Playcenter. No se puede eliminar.
                      </p>
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
