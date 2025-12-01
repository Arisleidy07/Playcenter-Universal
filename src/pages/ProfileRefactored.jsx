import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuthModal } from "../context/AuthModalContext";

// UI Components
import ProfileSidebar from "../components/profile/ProfileSidebar";
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
import PaymentsView from "../components/profile/views/PaymentsView";
import StoreView from "../components/profile/views/StoreView";
import EditProfileModal from "../components/profile/EditProfileModal";
import OrderDetailsSheet from "../components/profile/OrderDetailsSheet";
import FollowersModal from "../components/FollowersModal";

export default function Profile() {
  const { usuario, usuarioInfo, logout, actualizarUsuarioInfo } = useAuth();
  const navigate = useNavigate();
  const { abrirModal } = useAuthModal();

  // Estado de Vista
  const [activeView, setActiveView] = useState("perfil");
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [modalEntregaOpen, setModalEntregaOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [direccionEditar, setDireccionEditar] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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
        console.error("ProfileRefactored fetchData:", e);
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
        console.error("ProfileRefactored loadAddresses:", e);
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

    const listenStoreDoc = (id) => {
      try {
        unsub = onSnapshot(doc(db, "tiendas", id), (snap) => {
          if (snap.exists()) {
            setStoreId(snap.id);
            setStore({ id: snap.id, ...snap.data() });
          }
        });
      } catch (e) {
        console.error("listenStoreDoc:", e);
      }
    };

    const fetchStore = async () => {
      try {
        if (usuarioInfo?.storeId) {
          listenStoreDoc(usuarioInfo.storeId);
          return;
        }

        const tryField = async (field) => {
          const q = query(
            collection(db, "tiendas"),
            where(field, "==", usuario.uid)
          );
          const snap = await getDocs(q);
          if (!snap.empty) {
            const d = snap.docs[0];
            setStoreId(d.id);
            setStore({ id: d.id, ...d.data() });
            listenStoreDoc(d.id);
            return true;
          }
          return false;
        };

        if (await tryField("ownerId")) return;
        if (await tryField("owner_id")) return;
        if (await tryField("propietarioId")) return;
        if (await tryField("propietario_id")) return;
        if (await tryField("createdBy")) return;

        // Fallback para administradores: tienda principal Playcenter Universal
        const isAdminUser =
          usuarioInfo?.role === "admin" ||
          usuarioInfo?.isAdmin === true ||
          usuarioInfo?.admin === true;
        if (isAdminUser) {
          setStoreId("playcenter_universal");
          listenStoreDoc("playcenter_universal");
          return;
        }
      } catch (e) {
        console.error("fetchStore:", e);
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
    const unsub = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setStats((prev) => ({
          ...prev,
          seguidores: data.stats?.seguidores || 0,
          seguidos: data.stats?.seguidos || 0,
        }));
      }
    });

    return () => {
      try {
        unsub();
      } catch (_) {}
    };
  }, [usuario]);

  // Stats de publicaciones en tiempo real según tienda
  useEffect(() => {
    if (!storeId) return;
    const productosQuery = query(
      collection(db, "productos"),
      where("tienda_id", "==", storeId)
    );
    const unsub = onSnapshot(productosQuery, (snap) => {
      setStats((prev) => ({ ...prev, publicaciones: snap.docs.length }));
    });
    return () => {
      try {
        unsub();
      } catch (_) {}
    };
  }, [storeId]);

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
          {/* Sidebar Desktop */}
          <aside className="hidden xl:block w-72 flex-shrink-0">
            <div
              style={{
                height: "100vh",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div className="flex-shrink-0">
                <ProfileHeader
                  user={usuario}
                  userInfo={usuarioInfo}
                  simple={true}
                  onLogout={() => setShowLogoutConfirm(true)}
                  onAddAccount={() => abrirModal("login")}
                  setView={setActiveView}
                />
              </div>
              <div className="flex-1 overflow-y-auto">
                <ProfileSidebar
                  activeView={activeView}
                  setView={setActiveView}
                  onLogout={() => setShowLogoutConfirm(true)}
                  onAddAccount={() => abrirModal("login")}
                  user={usuario}
                  userInfo={usuarioInfo}
                />
              </div>
            </div>
          </aside>

          {/* Contenido Principal */}
          <main className="flex-1 w-full p-4 md:p-6 lg:p-8 overflow-x-hidden min-w-0">
            {/* Header + Mobile Nav (solo móvil) */}
            <div className="xl:hidden mb-6 overflow-visible">
              <ProfileHeader
                user={usuario}
                userInfo={usuarioInfo}
                onLogout={() => setShowLogoutConfirm(true)}
                onAddAccount={() => abrirModal("login")}
                setView={setActiveView}
              />
              <div className="mt-4">
                <ProfileMobileNav
                  activeView={activeView}
                  setView={setActiveView}
                  userInfo={usuarioInfo}
                />
              </div>
            </div>

            {/* Vistas dinámicas */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-full max-w-5xl mx-auto"
              >
                {activeView === "perfil" && (
                  <OverviewView
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
                        console.error("delete address:", e);
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
                        console.error("set default address:", e);
                      }
                    }}
                  />
                )}
                {activeView === "configuracion" && <SettingsView />}
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
            await actualizarUsuarioInfo({
              displayName: data.displayName,
              telefono: data.telefono,
              direccion: data.direccion,
            });
            // Persist also to users and usuarios for parity with legacy logic
            const payload = {
              displayName: data.displayName,
              telefono: data.telefono,
              direccion: data.direccion,
              updatedAt: new Date(),
            };
            await setDoc(doc(db, "users", usuario.uid), payload, {
              merge: true,
            });
            await setDoc(doc(db, "usuarios", usuario.uid), payload, {
              merge: true,
            });
            setEditModalOpen(false);
          } catch (e) {
            console.error("save profile:", e);
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
