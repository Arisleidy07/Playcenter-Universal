import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "../firebase";
import { notify } from "../utils/notificationBus";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuthModal } from "../context/AuthModalContext";
import {
  User,
  ShoppingBag,
  MapPin,
  CreditCard,
  Settings,
  Store,
  Shield,
  Bell,
  Headset,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

// UI Components
import ProfileMobileNav from "../components/profile/ProfileMobileNav";
import ProfileHeader from "../components/profile/ProfileHeader";
import LogoutModal from "../components/profile/LogoutModal";
import { Loader } from "../components/ui/Loader";
import Entrega from "../components/Entrega";

// Views
import OverviewView from "../components/profile/views/OverviewView";
import OrdersView from "../components/profile/views/OrdersView";
import AddressesView from "../components/profile/views/AddressesView";
import SettingsView from "../components/profile/views/SettingsView";
import NotificationsView from "../components/profile/views/NotificationsView";
import SecurityView from "../components/profile/views/SecurityView";
import PaymentsView from "../components/profile/views/PaymentsView";
import StoreView from "../components/profile/views/StoreView";
import CustomerServiceView from "../components/profile/views/CustomerServiceView";
import EditProfileModal from "../components/profile/EditProfileModal";
import OrderDetailsSheet from "../components/profile/OrderDetailsSheet";
import FollowersModal from "../components/FollowersModal";

export default function Profile() {
  const { usuario, usuarioInfo, logout, actualizarUsuarioInfo } = useAuth();
  const navigate = useNavigate();
  const { abrirModal } = useAuthModal();

  // Estado de Vista
  // "menu" = nivel 1 (tarjetas tipo Amazon)
  // resto de ids = nivel 2 (sub-páginas)
  const [activeView, setActiveView] = useState("menu");
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [modalEntregaOpen, setModalEntregaOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [direccionEditar, setDireccionEditar] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Estados para modales de seguidores/seguidos
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [followersModalType, setFollowersModalType] = useState("seguidores");

  // Estado de Datos (Data Fetching)
  const [historial, setHistorial] = useState([]);
  const [direcciones, setDirecciones] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [orderSheetOpen, setOrderSheetOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [stats, setStats] = useState({
    seguidos: 0,
    seguidores: 0,
    publicaciones: 0,
  });
  const [store, setStore] = useState(null);
  const [storeId, setStoreId] = useState(null);

  // Menú principal tipo Amazon (nivel 1)
  const mainMenuItems = [
    {
      id: "perfil",
      title: "Información Personal",
      description: "Editar nombre, celular y correo electrónico.",
      icon: User,
    },
    {
      id: "pedidos",
      title: "Mis Pedidos",
      description: "Rastrear envíos, devoluciones y compras pasadas.",
      icon: ShoppingBag,
    },
    {
      id: "ubicaciones",
      title: "Direcciones",
      description: "Preferencias de envío y lugares de entrega.",
      icon: MapPin,
    },
    {
      id: "pagos",
      title: "Pagos y Billetera",
      description: "Gestionar tarjetas, saldos y cupones.",
      icon: CreditCard,
    },
    {
      id: "soporte",
      title: "Servicio al Cliente",
      description: "Ayuda y soporte de Playcenter Universal.",
      icon: Headset,
    },
    {
      id: "tiendas",
      title: "Mi Tienda",
      description: "Panel de vendedor y estadísticas.",
      icon: Store,
    },
    {
      id: "seguridad",
      title: "Inicio de Sesión y Seguridad",
      description: "Cambiar contraseña y proteger la cuenta.",
      icon: Shield,
    },
    {
      id: "configuracion",
      title: "Ajustes",
      description: "Configuración general de la app.",
      icon: Settings,
    },
  ];

  // Cargar Datos Iniciales
  useEffect(() => {
    if (!usuario) return;

    const loadOrders = async () => {
      try {
        setLoadingOrders(true);
        // Pedidos del usuario
        const qOrders = query(
          collection(db, "orders"),
          where("userId", "==", usuario.uid)
        );
        const snapOrders = await getDocs(qOrders);
        setHistorial(snapOrders.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        // console.error("ProfileRefactored fetchData:", e);
      } finally {
        setLoadingOrders(false);
      }
    };
    const loadAddresses = async () => {
      try {
        setLoadingAddresses(true);
        const qAddress = query(
          collection(db, "direcciones"),
          where("usuarioId", "==", usuario.uid)
        );
        const snapAddress = await getDocs(qAddress);
        setDirecciones(
          snapAddress.docs.map((d) => ({ id: d.id, ...d.data() }))
        );
      } catch (e) {
        // console.error("ProfileRefactored loadAddresses:", e);
      } finally {
        setLoadingAddresses(false);
      }
    };

    loadOrders();
    loadAddresses();

    return () => {};
  }, [usuario]);

  // Cargar tienda del usuario desde Firestore
  useEffect(() => {
    if (!usuario) return;
    let unsub = null;

    const listenStoreDoc = (collectionName, id) => {
      try {
        if (unsub) unsub();
        unsub = onSnapshot(doc(db, collectionName, id), (snap) => {
          if (snap.exists()) {
            const storeData = { id: snap.id, ...snap.data() };
            setStoreId(snap.id);
            setStore(storeData);
          }
        });
      } catch (e) {
        // Error silencioso
      }
    };

    const fetchStore = async () => {
      try {
        if (usuarioInfo?.storeId) {
          // Intentar en 'tiendas' primero
          try {
            const s1 = await getDoc(doc(db, "tiendas", usuarioInfo.storeId));
            if (s1.exists()) {
              setStoreId(s1.id);
              setStore({ id: s1.id, ...s1.data() });
              listenStoreDoc("tiendas", usuarioInfo.storeId);
              return;
            }
          } catch (_) {}

          // Luego intentar en 'stores' (vendedores)
          try {
            const s2 = await getDoc(doc(db, "stores", usuarioInfo.storeId));
            if (s2.exists()) {
              setStoreId(s2.id);
              setStore({ id: s2.id, ...s2.data() });
              listenStoreDoc("stores", usuarioInfo.storeId);
              return;
            }
          } catch (_) {}
        }

        const tryField = async (field) => {
          const q = query(
            collection(db, "tiendas"),
            where(field, "==", usuario.uid)
          );
          const snap = await getDocs(q);
          if (!snap.empty) {
            const d = snap.docs[0];
            const storeData = { id: d.id, ...d.data() };
            setStoreId(d.id);
            setStore(storeData);
            listenStoreDoc("tiendas", d.id);
            return true;
          }
          return false;
        };

        if (await tryField("ownerId")) return;
        if (await tryField("owner_id")) return;
        if (await tryField("propietarioId")) return;
        if (await tryField("propietario_id")) return;
        if (await tryField("createdBy")) return;
        if (await tryField("userId")) return;

        // Buscar también en colección "stores" (vendedores/new)
        const tryStores = async () => {
          const fields = [
            "ownerUid",
            "ownerId",
            "owner_id",
            "userId",
            "createdBy",
          ];
          for (const f of fields) {
            const qStores = query(
              collection(db, "stores"),
              where(f, "==", usuario.uid)
            );
            const snapStores = await getDocs(qStores);
            if (!snapStores.empty) {
              const d = snapStores.docs[0];
              const storeData = { id: d.id, ...d.data() };
              setStoreId(d.id);
              setStore(storeData);
              listenStoreDoc("stores", d.id);
              try {
                await setDoc(
                  doc(db, "users", usuario.uid),
                  {
                    storeId: d.id,
                    storeName: storeData.nombre || storeData.name || "",
                    role: "seller",
                    isSeller: true,
                  },
                  { merge: true }
                );
              } catch (_) {}
              return true;
            }
          }
          // Fallback: buscar por correo del propietario
          if (usuario.email) {
            try {
              const email = (usuario.email || "").toLowerCase().trim();
              const qEmail = query(
                collection(db, "stores"),
                where("ownerEmail", "==", email)
              );
              const snapEmail = await getDocs(qEmail);
              if (!snapEmail.empty) {
                const d = snapEmail.docs[0];
                const storeData = { id: d.id, ...d.data() };
                setStoreId(d.id);
                setStore(storeData);
                listenStoreDoc("stores", d.id);
                return true;
              }
            } catch (_) {}
          }
          return false;
        };

        if (await tryStores()) return;

        // Fallback para administradores: tienda principal Playcenter Universal
        const isAdminUser =
          usuarioInfo?.role === "admin" ||
          usuarioInfo?.isAdmin === true ||
          usuarioInfo?.admin === true;
        if (isAdminUser) {
          setStoreId("playcenter_universal");
          listenStoreDoc("tiendas", "playcenter_universal");
          return;
        }
      } catch (e) {
        // console.error("fetchStore:", e);
      }
    };

    fetchStore();

    return () => {
      try {
        if (unsub) unsub();
      } catch (_) {}
    };
  }, [
    usuario?.uid,
    usuarioInfo?.storeId,
    usuarioInfo?.role,
    usuarioInfo?.isAdmin,
    usuarioInfo?.admin,
  ]);

  // Stats de seguidores/seguidos en tiempo real del usuario
  useEffect(() => {
    if (!usuario) return;

    const userRef = doc(db, "users", usuario.uid);
    const unsub = onSnapshot(userRef, async (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        let seguidoresCount = data.stats?.seguidores || 0;
        let seguidosCount = data.stats?.seguidos || 0;

        // Si los contadores están en 0, contar desde las subcolecciones
        if (seguidoresCount === 0 || seguidosCount === 0) {
          try {
            // Contar seguidores reales
            const followersRef = collection(
              db,
              `users/${usuario.uid}/followers`
            );
            const followersSnap = await getDocs(followersRef);
            const realSeguidores = followersSnap.size;

            // Contar seguidos reales
            const followingRef = collection(
              db,
              `users/${usuario.uid}/following`
            );
            const followingSnap = await getDocs(followingRef);
            const realSeguidos = followingSnap.size;

            // Usar el mayor entre el valor guardado y el conteo real
            seguidoresCount = Math.max(seguidoresCount, realSeguidores);
            seguidosCount = Math.max(seguidosCount, realSeguidos);
          } catch (error) {
            // Error silencioso
          }
        }

        setStats((prev) => ({
          ...prev,
          seguidores: seguidoresCount,
          seguidos: seguidosCount,
        }));
      }
    });

    return () => {
      try {
        unsub();
      } catch (_) {}
    };
  }, [usuario]);

  // Stats de publicaciones en tiempo real - buscar por múltiples campos
  useEffect(() => {
    if (!usuario) return;

    const fetchPublicaciones = async () => {
      try {
        const productIds = new Set();

        // Buscar por creadoPor (usuario que creó el producto)
        const qCreadoPor = query(
          collection(db, "productos"),
          where("creadoPor", "==", usuario.uid)
        );
        const snapCreadoPor = await getDocs(qCreadoPor);
        snapCreadoPor.docs.forEach((doc) => {
          if (doc.data().activo !== false) productIds.add(doc.id);
        });

        // Buscar por ownerUid
        const qOwnerUid = query(
          collection(db, "productos"),
          where("ownerUid", "==", usuario.uid)
        );
        const snapOwnerUid = await getDocs(qOwnerUid);
        snapOwnerUid.docs.forEach((doc) => {
          if (doc.data().activo !== false) productIds.add(doc.id);
        });

        // Si hay storeId, buscar también por storeId
        if (storeId) {
          const qStoreId = query(
            collection(db, "productos"),
            where("storeId", "==", storeId)
          );
          const snapStoreId = await getDocs(qStoreId);
          snapStoreId.docs.forEach((doc) => {
            if (doc.data().activo !== false) productIds.add(doc.id);
          });

          // Buscar por tiendaId
          const qTiendaId = query(
            collection(db, "productos"),
            where("tiendaId", "==", storeId)
          );
          const snapTiendaId = await getDocs(qTiendaId);
          snapTiendaId.docs.forEach((doc) => {
            if (doc.data().activo !== false) productIds.add(doc.id);
          });

          // Buscar por tienda_id (legacy)
          const qTiendaIdLegacy = query(
            collection(db, "productos"),
            where("tienda_id", "==", storeId)
          );
          const snapTiendaIdLegacy = await getDocs(qTiendaIdLegacy);
          snapTiendaIdLegacy.docs.forEach((doc) => {
            if (doc.data().activo !== false) productIds.add(doc.id);
          });
        }

        setStats((prev) => ({ ...prev, publicaciones: productIds.size }));
      } catch (error) {
        // Error silencioso
      }
    };

    fetchPublicaciones();
  }, [usuario, storeId]);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      navigate("/", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  if (!usuario) return <Loader visible={true} />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Container Principal */}
      <div className="max-w-[1920px] mx-auto">
        <div className="flex gap-0">
          {/* Contenido Principal a pantalla completa (sin sidebar lateral) */}
          <main className="flex-1 w-full px-3 py-4 md:px-6 md:py-6 lg:px-10 lg:py-8 overflow-x-hidden min-w-0">
            {/* Header (solo móvil / tablet). En desktop manda el título "Hola" del menú. */}
            <div className="xl:hidden mb-4 overflow-visible">
              <ProfileHeader
                key={refreshKey}
                user={usuario}
                userInfo={usuarioInfo}
                onLogout={() => setShowLogoutConfirm(true)}
                onAddAccount={() => abrirModal("login")}
                setView={setActiveView}
              />
            </div>

            {/* Vistas dinámicas */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-full max-w-6xl mx-auto"
              >
                {/* Nivel 1: Menú principal tipo Amazon */}
                {activeView === "menu" && (
                  <div className="space-y-4">
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-50">
                        Hola,{" "}
                        {usuarioInfo?.displayName ||
                          usuario?.displayName ||
                          usuario?.email ||
                          "Usuario"}
                      </h1>
                      <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-400">
                        Gestiona tu cuenta de Playcenter Universal
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 mt-5">
                      {mainMenuItems.map((item) => {
                        const Icon = item.icon;

                        // Colores específicos para cada tarjeta en modo oscuro
                        const getDarkModeColors = (id) => {
                          switch (id) {
                            case "perfil":
                              return {
                                bg: "dark:bg-blue-900/20",
                                border: "dark:border-blue-700/50",
                                iconBg: "dark:from-blue-400 dark:to-blue-600",
                              };
                            case "pedidos":
                              return {
                                bg: "dark:bg-green-900/20",
                                border: "dark:border-green-700/50",
                                iconBg: "dark:from-green-400 dark:to-green-600",
                              };
                            case "ubicaciones":
                              return {
                                bg: "dark:bg-orange-900/20",
                                border: "dark:border-orange-700/50",
                                iconBg:
                                  "dark:from-orange-400 dark:to-orange-600",
                              };
                            case "pagos":
                              return {
                                bg: "dark:bg-purple-900/20",
                                border: "dark:border-purple-700/50",
                                iconBg:
                                  "dark:from-purple-400 dark:to-purple-600",
                              };
                            case "soporte":
                              return {
                                bg: "dark:bg-teal-900/20",
                                border: "dark:border-teal-700/50",
                                iconBg: "dark:from-teal-400 dark:to-teal-600",
                              };
                            case "tiendas":
                              return {
                                bg: "dark:bg-indigo-900/20",
                                border: "dark:border-indigo-700/50",
                                iconBg:
                                  "dark:from-indigo-400 dark:to-indigo-600",
                              };
                            case "seguridad":
                              return {
                                bg: "dark:bg-red-900/20",
                                border: "dark:border-red-700/50",
                                iconBg: "dark:from-red-400 dark:to-red-600",
                              };
                            case "configuracion":
                              return {
                                bg: "dark:bg-gray-800/50",
                                border: "dark:border-gray-600/50",
                                iconBg: "dark:from-gray-400 dark:to-gray-600",
                              };
                            default:
                              return {
                                bg: "dark:bg-[#1b1b1f]",
                                border: "dark:border-[#333]",
                                iconBg: "dark:from-blue-500 dark:to-indigo-500",
                              };
                          }
                        };

                        const darkColors = getDarkModeColors(item.id);

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setActiveView(item.id)}
                            className={`group flex items-center gap-4 px-5 py-7 rounded-3xl border border-gray-200 bg-white/95 shadow-sm hover:shadow-md hover:border-blue-300 transition-all text-left ${darkColors.bg} ${darkColors.border} min-h-[140px]`}
                          >
                            <div
                              className={`flex-shrink-0 w-14 h-14 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center shadow-sm group-hover:shadow-md transition-all ${darkColors.iconBg}`}
                            >
                              <Icon size={26} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-lg md:text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
                                {item.title}
                              </p>
                              <p className="mt-1.5 text-sm md:text-base leading-snug text-gray-600 dark:text-gray-400 line-clamp-2">
                                {item.description}
                              </p>
                            </div>
                            <ArrowRight
                              size={18}
                              className="text-gray-300 dark:text-gray-500 flex-shrink-0 mt-1 transition-transform group-hover:translate-x-1"
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Nivel 2: Vistas detalle con botón de volver */}
                {activeView !== "menu" && (
                  <div className="mb-5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveView("menu")}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-gray-300 bg-white text-xs md:text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:shadow-md transition-all dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                    >
                      <ArrowLeft size={16} className="flex-shrink-0" />
                      <span>Volver al menú</span>
                    </button>
                  </div>
                )}

                {activeView === "perfil" && (
                  <OverviewView
                    key={refreshKey}
                    user={usuario}
                    info={usuarioInfo}
                    stats={stats}
                    onEdit={() => setEditModalOpen(true)}
                    onOpenFollowers={() => {
                      setFollowersModalType("seguidores");
                      setFollowersModalOpen(true);
                    }}
                    onOpenFollowing={() => {
                      setFollowersModalType("seguidos");
                      setFollowersModalOpen(true);
                    }}
                  />
                )}
                {activeView === "pedidos" && (
                  <OrdersView
                    orders={historial}
                    loading={loadingOrders}
                    onOpenOrder={(order) => {
                      setSelectedOrder(order);
                      setOrderSheetOpen(true);
                    }}
                  />
                )}
                {activeView === "ubicaciones" && (
                  <AddressesView
                    addresses={direcciones}
                    userId={usuario.uid}
                    defaultDireccion={usuarioInfo?.direccion}
                    defaultMetodoEntrega={usuarioInfo?.metodoEntrega}
                    loading={loadingAddresses}
                    onAdd={() => {
                      setDireccionEditar(null);
                      setModalEntregaOpen(true);
                    }}
                    onEdit={(addr) => {
                      setDireccionEditar(addr);
                      setModalEntregaOpen(true);
                    }}
                    onDelete={async (id) => {
                      try {
                        await deleteDoc(doc(db, "direcciones", id));
                        const qAddress = query(
                          collection(db, "direcciones"),
                          where("usuarioId", "==", usuario.uid)
                        );
                        const snapAddress = await getDocs(qAddress);
                        setDirecciones(
                          snapAddress.docs.map((d) => ({
                            id: d.id,
                            ...d.data(),
                          }))
                        );
                      } catch (e) {
                        // console.error("delete address:", e);
                      }
                    }}
                    onSetDefault={async (addr) => {
                      try {
                        const direccionCompleta = addr?.direccionCompleta || "";
                        const metodo = addr?.metodoEntrega || "domicilio";
                        await actualizarUsuarioInfo({
                          direccion: direccionCompleta,
                          metodoEntrega: metodo,
                        });
                        const payload = {
                          direccion: direccionCompleta,
                          metodoEntrega: metodo,
                          updatedAt: new Date(),
                        };
                        await setDoc(doc(db, "users", usuario.uid), payload, {
                          merge: true,
                        });
                        await setDoc(
                          doc(db, "usuarios", usuario.uid),
                          payload,
                          { merge: true }
                        );
                      } catch (e) {
                        // console.error("set default address:", e);
                      }
                    }}
                  />
                )}
                {activeView === "configuracion" && <SettingsView />}
                {activeView === "notificaciones" && <NotificationsView />}
                {activeView === "soporte" && <CustomerServiceView />}
                {activeView === "seguridad" && <SecurityView />}
                {activeView === "pagos" && <PaymentsView />}
                {activeView === "tiendas" && (
                  <StoreView
                    stats={stats}
                    user={usuario}
                    userInfo={usuarioInfo}
                    store={store}
                    storeId={storeId}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Edit Profile Modal (wired) */}
      <EditProfileModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        initialInfo={usuarioInfo}
        saving={savingProfile}
        onSave={async (data) => {
          try {
            setSavingProfile(true);

            let photoURL = usuarioInfo?.fotoURL;

            // Handle photo upload
            if (data.newPhoto) {
              const storageRef = ref(
                storage,
                `usuarios/${usuario.uid}/profile.jpg`
              );
              await uploadBytes(storageRef, data.newPhoto);
              photoURL = await getDownloadURL(storageRef);
            }

            // Handle photo removal
            if (data.removePhoto) {
              photoURL = null;
              // Try to delete from storage (ignore errors if doesn't exist)
              try {
                const storageRef = ref(
                  storage,
                  `usuarios/${usuario.uid}/profile.jpg`
                );
                await deleteObject(storageRef);
              } catch (err) {
                // Photo might not exist, that's okay
              }
            }

            await actualizarUsuarioInfo({
              displayName: data.displayName,
              telefono: data.telefono,
              direccion: data.direccion,
              fotoURL: photoURL,
            });

            // Persist also to users and usuarios for parity with legacy logic
            const payload = {
              displayName: data.displayName,
              telefono: data.telefono,
              direccion: data.direccion,
              fotoURL: photoURL,
              updatedAt: new Date(),
            };
            await setDoc(doc(db, "users", usuario.uid), payload, {
              merge: true,
            });
            await setDoc(doc(db, "usuarios", usuario.uid), payload, {
              merge: true,
            });

            // Force component refresh to show new photo immediately
            setRefreshKey((prev) => prev + 1);
            setEditModalOpen(false);
          } catch (e) {
            notify("Error al guardar: " + e.message, "error", "Error");
          } finally {
            setSavingProfile(false);
          }
        }}
      />

      {/* Entrega Modal for addresses */}
      {modalEntregaOpen && (
        <Entrega
          abierto={modalEntregaOpen}
          onClose={async () => {
            setModalEntregaOpen(false);
            setDireccionEditar(null);
            // Refresh addresses on close
            try {
              const qAddress = query(
                collection(db, "direcciones"),
                where("usuarioId", "==", usuario.uid)
              );
              const snapAddress = await getDocs(qAddress);
              setDirecciones(
                snapAddress.docs.map((d) => ({ id: d.id, ...d.data() }))
              );
            } catch (_) {}
          }}
          actualizarUsuarioInfo={actualizarUsuarioInfo}
          usuarioId={usuario.uid}
          direccionEditar={direccionEditar}
          actualizarLista={async () => {
            try {
              const qAddress = query(
                collection(db, "direcciones"),
                where("usuarioId", "==", usuario.uid)
              );
              const snapAddress = await getDocs(qAddress);
              setDirecciones(
                snapAddress.docs.map((d) => ({ id: d.id, ...d.data() }))
              );
            } catch (_) {}
          }}
        />
      )}

      {/* Mobile bottom sheet for order details */}
      <OrderDetailsSheet
        open={orderSheetOpen}
        order={selectedOrder}
        onClose={() => {
          setOrderSheetOpen(false);
          setSelectedOrder(null);
        }}
      />

      <LogoutModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={async () => {
          setShowLogoutConfirm(false);
          await handleLogout();
        }}
      />

      {/* Modal de Seguidores/Seguidos */}
      <FollowersModal
        isOpen={followersModalOpen}
        onClose={() => setFollowersModalOpen(false)}
        userId={usuario?.uid}
        type={followersModalType}
      />

      <Loader visible={loading} />
    </div>
  );
}
