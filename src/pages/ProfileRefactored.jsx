import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useMultiAccount } from "../context/MultiAccountContext";
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
import { db, storage, auth } from "../firebase";
import { updateProfile } from "firebase/auth";
import { notify } from "../utils/notificationBus";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuthModal } from "../context/AuthModalContext";
import "../styles/Profile.css";
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
  ChevronDown,
  LogOut,
  Plus,
} from "lucide-react";
import AccountMenu from "../components/profile/AccountMenu";

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
  const { usuario, usuarioInfo, logout, actualizarUsuarioInfo, subirImagen } =
    useAuth();
  const navigate = useNavigate();
  const { abrirModal } = useAuthModal();

  // Estado de Vista
  // "menu" = nivel 1 (tarjetas tipo Amazon)
  // resto de ids = nivel 2 (sub-páginas)
  const [activeView, setActiveView] = useState("menu");
  const [loading, setLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [modalEntregaOpen, setModalEntregaOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [refreshProfile, setRefreshProfile] = useState(0);
  const [direccionEditar, setDireccionEditar] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [postVerifyAction, setPostVerifyAction] = useState(null);
  const [verificationContext, setVerificationContext] = useState(null);

  const hasValidSecuritySession = () => {
    try {
      const uid = usuario?.uid;
      if (!uid) return false;
      const raw = localStorage.getItem(`security_verified_${uid}`);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      const ts = parsed?.timestamp;
      if (!ts) return false;
      const twoHours = 2 * 60 * 60 * 1000;
      return Date.now() - ts < twoHours;
    } catch (_) {
      return false;
    }
  };

  // Estados para modales de seguidores/seguidos
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [followersModalType, setFollowersModalType] = useState("seguidores");

  // Estado para el menú de cambio de cuentas (dropdown como antes)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const { switchAccount, savedAccounts } = useMultiAccount();

  // Cerrar sesión
  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    setAccountMenuOpen(false);
    await logout();
    navigate("/");
  };

  // (El cambio de cuenta se maneja desde AccountMenu con cierre del dropdown)

  // Manejar agregar cuenta (flujo anterior: abrir AuthModal)
  const handleAddAccount = () => {
    setAccountMenuOpen(false);
    // Guardar el UID/email actual para que, al iniciar sesión con otra cuenta,
    // se guarde en la lista de la cuenta actual
    if (usuario?.uid) {
      try {
        localStorage.setItem("pcu_adding_account_from", usuario.uid);
        localStorage.setItem("pcu_adding_account_email", usuario.email || "");
      } catch (_) {}
    }
    abrirModal("login");
  };

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

  // Cache y utilidades para resolver imágenes de productos en detalles del pedido
  const detailImageCacheRef = React.useRef({}); // id -> url
  const pickUrl = (u) => {
    try {
      if (!u) return "";
      if (typeof u === "string") return u;
      if (typeof u === "object") return u.url || u.src || "";
      return String(u || "");
    } catch {
      return "";
    }
  };
  const firstImageFromMedia = (arr) => {
    const list = Array.isArray(arr) ? arr : [];
    for (const m of list) {
      const t = String(m?.type || "").toLowerCase();
      const url = pickUrl(m);
      if (url && (!t || t.includes("image") || t === "img" || t === "photo")) {
        return url;
      }
    }
    return "";
  };
  const resolveProductImageFromDoc = (data) => {
    if (!data || typeof data !== "object") return "";
    return (
      pickUrl(Array.isArray(data.imagenPrincipal) && data.imagenPrincipal[0]) ||
      pickUrl(data.imagen) ||
      firstImageFromMedia(data.media) ||
      pickUrl(Array.isArray(data.galeriaImagenes) && data.galeriaImagenes[0]) ||
      pickUrl(Array.isArray(data.imagenes) && data.imagenes[0]) ||
      (() => {
        const vars = Array.isArray(data.variantes) ? data.variantes : [];
        for (const v of vars) {
          const url =
            pickUrl(
              Array.isArray(v?.imagenPrincipal) && v.imagenPrincipal[0]
            ) ||
            pickUrl(v?.imagen) ||
            firstImageFromMedia(v?.media);
          if (url) return url;
        }
        return "";
      })()
    );
  };
  const resolveImageFromOrderItem = (p) => {
    if (!p) return "";
    return (
      pickUrl(Array.isArray(p?.imagenPrincipal) && p.imagenPrincipal[0]) ||
      pickUrl(p?.imagen) ||
      firstImageFromMedia(p?.media) ||
      pickUrl(Array.isArray(p?.galeriaImagenes) && p.galeriaImagenes[0]) ||
      pickUrl(Array.isArray(p?.imagenes) && p.imagenes[0]) ||
      ""
    );
  };
  const getPid = (p) =>
    p?.id ||
    p?.productId ||
    p?.productoId ||
    p?.pid ||
    p?.productID ||
    p?.product_id;

  const prepareOrderForDetails = async (ord) => {
    try {
      const productos = Array.isArray(ord?.productos) ? ord.productos : [];
      const missing = [];
      productos.forEach((p) => {
        const pid = getPid(p);
        const fromOrder = resolveImageFromOrderItem(p);
        if (pid && !fromOrder && !detailImageCacheRef.current[pid]) {
          missing.push(pid);
        }
      });

      // Fetch en serie para simplicidad (listas pequeñas)
      for (const id of missing) {
        try {
          const snap = await getDoc(doc(db, "productos", id));
          if (snap.exists()) {
            const url = resolveProductImageFromDoc(snap.data());
            if (url) detailImageCacheRef.current[id] = url;
          }
        } catch (_) {}
      }

      const enhanced = {
        ...ord,
        productos: productos.map((p) => {
          const pid = getPid(p);
          const fromOrder = resolveImageFromOrderItem(p);
          const url =
            fromOrder ||
            (pid && detailImageCacheRef.current[pid]) ||
            "/Copia de play.png";
          return { ...p, imagen: url };
        }),
      };
      return enhanced;
    } catch (_) {
      return ord;
    }
  };

  // Evitar scroll del fondo cuando el modal de pedido está abierto
  useEffect(() => {
    const prev = document.body.style.overflow;
    if (orderSheetOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [orderSheetOpen]);

  // Menú principal tipo Amazon (nivel 1)
  // Mapa de iconos personalizados (desde /public/logos/perfil)
  const profileIconMap = {
    perfil: "/logos/perfil/1.jpg",
    pedidos: "/logos/perfil/2.jpg",
    ubicaciones: "/logos/perfil/3.jpg",
    pagos: "/logos/perfil/4.jpg",
    soporte: "/logos/perfil/5.jpg",
    tiendas: "/logos/perfil/6.jpg",
    seguridad: "/logos/perfil/7.jpg",
    configuracion: "/logos/perfil/8.jpg",
  };

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

  // Colores modernos y profesionales - Estilo limpio y elegante
  const getCardColors = (id) => {
    const base = {
      bg: "bg-gradient-to-br from-white to-slate-50/60 dark:from-slate-900 dark:to-slate-900",
      border: "border-slate-200/80 dark:border-slate-700/80",
      hoverBg:
        "hover:from-white hover:to-slate-50 dark:hover:from-slate-900 dark:hover:to-slate-800/60",
      hoverBorder: "hover:border-slate-300/90 dark:hover:border-slate-600/90",
      shadow: "shadow-sm hover:shadow-lg",
    };

    const accents = {
      perfil: {
        iconBg: "bg-blue-50 dark:bg-blue-500/10",
        iconColor: "text-blue-700 dark:text-blue-300",
      },
      pedidos: {
        iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
        iconColor: "text-emerald-700 dark:text-emerald-300",
      },
      ubicaciones: {
        iconBg: "bg-indigo-50 dark:bg-indigo-500/10",
        iconColor: "text-indigo-700 dark:text-indigo-300",
      },
      pagos: {
        iconBg: "bg-violet-50 dark:bg-violet-500/10",
        iconColor: "text-violet-700 dark:text-violet-300",
      },
      soporte: {
        iconBg: "bg-sky-50 dark:bg-sky-500/10",
        iconColor: "text-sky-700 dark:text-sky-300",
      },
      tiendas: {
        iconBg: "bg-amber-50 dark:bg-amber-500/10",
        iconColor: "text-amber-700 dark:text-amber-300",
      },
      seguridad: {
        iconBg: "bg-rose-50 dark:bg-rose-500/10",
        iconColor: "text-rose-700 dark:text-rose-300",
      },
      configuracion: {
        iconBg: "bg-slate-100 dark:bg-slate-800",
        iconColor: "text-slate-700 dark:text-slate-300",
      },
    };

    return {
      ...base,
      ...(accents[id] || accents.configuracion),
    };
  };

  // Manejar clic en tarjeta del menú
  const handleCardClick = (id) => {
    setActiveView(id);
  };

  // Renderizar vista según activeView
  const renderView = () => {
    switch (activeView) {
      case "menu":
        return (
          <div className="w-full">
            {/* Título flotante y botón de cambiar cuenta - Solo en desktop */}
            <div className="hidden lg:block max-w-7xl mx-auto px-6 xl:px-8 pt-2 pb-0">
              <div className="flex items-center justify-between mb-2">
                {/* Título flotante */}
                <div className="flex items-center gap-3">
                  {activeView !== "menu" && (
                    <button
                      onClick={() => setActiveView("menu")}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      aria-label="Volver al menú"
                    >
                      <ArrowLeft
                        size={20}
                        className="text-slate-700 dark:text-slate-300"
                      />
                    </button>
                  )}
                  <h1 className="text-xl xl:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    {activeView !== "menu" && (
                      <img
                        src={profileIconMap[activeView]}
                        alt=""
                        className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full object-cover"
                      />
                    )}
                    {activeView === "menu"
                      ? "Mi Cuenta"
                      : mainMenuItems.find((item) => item.id === activeView)
                          ?.title || "Mi Cuenta"}
                  </h1>
                </div>

                {/* Botón de cambiar cuenta flotante - Con imagen del usuario - ESTILO PREMIUM */}
                <div className="relative">
                  <button
                    onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                    className="flex items-center space-x-2.5 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg"
                    aria-label="Cambiar cuenta"
                  >
                    {/* Imagen del usuario */}
                    <div className="flex-shrink-0">
                      {(() => {
                        // CRÍTICO: Priorizar fotoURL de Firestore. Si es "" (string vacío), significa que se eliminó intencionalmente
                        const fotoURL = usuarioInfo?.hasOwnProperty("fotoURL")
                          ? usuarioInfo.fotoURL && usuarioInfo.fotoURL !== ""
                            ? usuarioInfo.fotoURL
                            : null
                          : usuario?.photoURL && usuario.photoURL !== ""
                          ? usuario.photoURL
                          : null;

                        return fotoURL ? (
                          <img
                            src={fotoURL}
                            className="w-8 h-8 rounded-full object-cover border-2 border-slate-200 dark:border-slate-600 shadow-sm"
                            alt="Usuario"
                            onError={(e) => {
                              e.target.style.display = "none";
                              if (e.target.nextSibling) {
                                e.target.nextSibling.style.display = "flex";
                              }
                            }}
                          />
                        ) : null;
                      })()}
                      <div
                        className={`w-8 h-8 rounded-full overflow-hidden bg-slate-700 dark:bg-slate-600 flex items-center justify-center text-white text-sm font-semibold border-2 border-slate-200 dark:border-slate-600 shadow-sm ${(() => {
                          const fotoURL = usuarioInfo?.hasOwnProperty("fotoURL")
                            ? usuarioInfo.fotoURL && usuarioInfo.fotoURL !== ""
                              ? usuarioInfo.fotoURL
                              : null
                            : usuario?.photoURL && usuario.photoURL !== ""
                            ? usuario.photoURL
                            : null;
                          return fotoURL ? "hidden" : "flex";
                        })()}`}
                      >
                        {(
                          (
                            usuarioInfo?.displayName ||
                            usuario?.displayName ||
                            usuario?.email
                          )?.charAt(0) || "U"
                        ).toUpperCase()}
                      </div>
                    </div>
                    <span className="font-semibold">Cambiar cuenta</span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 ${
                        accountMenuOpen ? "rotate-180" : ""
                      } text-slate-500 dark:text-slate-400`}
                    />
                  </button>
                  {/* Menú desplegable de cuentas - Desktop */}
                  {accountMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setAccountMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-[380px] bg-white dark:bg-slate-900 rounded-xl shadow-2xl z-50 border border-slate-200 dark:border-slate-700 max-h-[80vh] overflow-y-auto backdrop-blur-sm">
                        <AccountMenu
                          currentUser={{
                            uid: usuario?.uid,
                            email: usuario?.email,
                            displayName:
                              usuarioInfo?.displayName ||
                              usuario?.displayName ||
                              "Usuario",
                            photoURL: usuarioInfo?.fotoURL || usuario?.photoURL,
                          }}
                          onAddAccount={handleAddAccount}
                          onLogout={() => setShowLogoutConfirm(true)}
                          onClose={() => setAccountMenuOpen(false)}
                          onSwitchAccount={(switchFn) => {
                            setAccountMenuOpen(false);
                            setTimeout(switchFn, 50);
                          }}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Contenedor principal con padding responsive - COMPACTO */}
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-5 lg:px-6 xl:px-8 pt-0 pb-4 sm:pb-5 md:pb-6 lg:pb-8">
              {/* Grid de tarjetas - 1 col móvil, 2 col tablet, 3 col desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                {mainMenuItems.map((item, index) => {
                  const iconSrc = profileIconMap[item.id];
                  const colors = getCardColors(item.id);

                  return (
                    <motion.div
                      key={item.id}
                      className={`group relative ${colors.bg} ${colors.border} rounded-2xl border p-4 sm:p-4 md:p-5 lg:p-7 text-left ${colors.hoverBg} ${colors.hoverBorder} ${colors.shadow} transition-all duration-200 cursor-pointer w-full`}
                      onClick={() => handleCardClick(item.id)}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02, duration: 0.15 }}
                      whileHover={{ y: -3, scale: 1.01 }}
                      whileTap={{ scale: 0.995 }}
                    >
                      {/* Horizontal en móvil/tablet, vertical solo en desktop */}
                      <div className="flex flex-row lg:flex-col items-center lg:items-start gap-3 lg:gap-0 w-full">
                        <div
                          className={`flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center overflow-hidden transition-all duration-200 ${colors.iconBg} group-hover:scale-[1.06] lg:mb-4 shadow-sm ring-1 ring-black/5 dark:ring-white/5`}
                        >
                          <img
                            src={iconSrc}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div
                          className="flex-1 min-w-0 w-full"
                          style={{
                            overflow: "hidden",
                            maxWidth: "100%",
                            width: "100%",
                          }}
                        >
                          <h3
                            className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-white mb-1 leading-tight tracking-tight"
                            style={{
                              wordBreak: "break-word",
                              overflowWrap: "break-word",
                              overflow: "hidden",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              maxWidth: "100%",
                              width: "100%",
                            }}
                            title={item.title}
                          >
                            {item.title}
                          </h3>
                          <p
                            className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed"
                            style={{
                              wordBreak: "break-word",
                              overflowWrap: "break-word",
                              overflow: "hidden",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              maxWidth: "100%",
                              width: "100%",
                            }}
                            title={item.description}
                          >
                            {item.description}
                          </p>
                        </div>

                        <div className="flex-shrink-0 lg:hidden">
                          <ArrowRight
                            size={16}
                            className="text-blue-600 dark:text-blue-400 transition-transform group-hover:translate-x-1"
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case "perfil":
        return (
          <OverviewView
            user={usuario}
            info={usuarioInfo}
            stats={stats}
            onEdit={() => {
              // Abrir el modal de edición directamente; no forzar verificación aquí
              setEditModalOpen(true);
            }}
            onOpenFollowers={() => {
              setFollowersModalType("seguidores");
              setFollowersModalOpen(true);
            }}
            onOpenFollowing={() => {
              setFollowersModalType("seguidos");
              setFollowersModalOpen(true);
            }}
          />
        );

      case "pedidos":
        return (
          <OrdersView
            orders={historial}
            loading={loadingOrders}
            onOpenOrder={async (order) => {
              const enhanced = await prepareOrderForDetails(order);
              setSelectedOrder(enhanced);
              setOrderSheetOpen(true);
            }}
          />
        );

      case "ubicaciones":
        return (
          <AddressesView
            addresses={direcciones}
            userId={usuario?.uid}
            loading={loadingAddresses}
            onAdd={() => {
              setDireccionEditar(null);
              setModalEntregaOpen(true);
            }}
            onEdit={(addr) => {
              setDireccionEditar(addr);
              setModalEntregaOpen(true);
            }}
            onDelete={async (addrId) => {
              try {
                await deleteDoc(doc(db, "direcciones", addrId));
                setRefreshKey((k) => k + 1);
                notify.success("Dirección eliminada");
              } catch (error) {
                notify.error("Error al eliminar la dirección");
              }
            }}
            onSetDefault={async (selection) => {
              try {
                if (selection === "tienda") {
                  await actualizarUsuarioInfo({ metodoEntrega: "tienda" });
                  setRefreshKey((k) => k + 1);
                  notify.success("Dirección de tienda seleccionada");
                } else {
                  const addr = direcciones.find((a) => a.id === selection);
                  if (addr) {
                    await actualizarUsuarioInfo({
                      metodoEntrega: "domicilio",
                      direccionPrincipal: addr,
                    });
                    setRefreshKey((k) => k + 1);
                    notify.success("Dirección principal actualizada");
                  } else {
                    notify.warning?.("Dirección no encontrada");
                  }
                }
              } catch (error) {
                notify.error("Error al actualizar la dirección principal");
              }
            }}
            defaultDireccion={
              usuarioInfo?.direccionPrincipal?.direccionCompleta || ""
            }
            defaultMetodoEntrega={usuarioInfo?.metodoEntrega || ""}
          />
        );

      case "pagos":
        return <PaymentsView />;

      case "soporte":
        return <CustomerServiceView />;

      case "tiendas":
        return (
          <StoreView
            store={store}
            storeId={storeId}
            stats={stats}
            user={usuario}
            userInfo={usuarioInfo}
          />
        );

      case "seguridad":
        return (
          <SecurityView
            onVerified={(ctx) => {
              setVerificationContext(ctx || null);
              if (postVerifyAction === "edit_profile") {
                setActiveView("perfil");
                setEditModalOpen(true);
              }
              setPostVerifyAction(null);
            }}
            onOpenEditProfile={() => {
              setActiveView("perfil");
              setEditModalOpen(true);
            }}
          />
        );

      case "configuracion":
        return <SettingsView />;

      default:
        return null;
    }
  };

  if (!usuario) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader visible={true} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-transparent">
      <div className="pointer-events-none absolute inset-0 z-0 hidden dark:block">
        <div className="absolute inset-0">
          <div className="profile-animated-bg" />
        </div>
        <div className="absolute inset-0 dark:bg-gradient-to-br dark:from-slate-950/18 dark:via-slate-950/8 dark:to-blue-950/18" />
      </div>

      <div className="relative z-10 isolate pb-0">
        {/* Header flotante solo para móvil/tablet */}
        <div className="lg:hidden sticky top-0 z-40 bg-white/95 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-transparent shadow-sm dark:shadow-none backdrop-blur">
          <div className="max-w-7xl mx-auto px-3 sm:px-4">
            <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-3">
              {/* Título y botón volver */}
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                {activeView !== "menu" && (
                  <button
                    onClick={() => setActiveView("menu")}
                    className="flex-shrink-0 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95"
                    aria-label="Volver al menú"
                  >
                    <ArrowLeft
                      size={20}
                      className="text-slate-700 dark:text-slate-300"
                    />
                  </button>
                )}
                {activeView === "menu" ? (
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate tracking-tight">
                    Mi Cuenta
                  </h1>
                ) : null}
              </div>

              {/* Botón de cambio de cuentas - CON ICONO DE USUARIO VISIBLE */}
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className="flex items-center space-x-2 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md"
                  aria-label="Cambiar cuenta"
                >
                  {/* Icono/Avatar del usuario - SIEMPRE VISIBLE */}
                  <div className="flex-shrink-0">
                    {(() => {
                      // CRÍTICO: Priorizar fotoURL de Firestore. Si es "" (string vacío), significa que se eliminó intencionalmente
                      const fotoURL = usuarioInfo?.hasOwnProperty("fotoURL")
                        ? usuarioInfo.fotoURL && usuarioInfo.fotoURL !== ""
                          ? usuarioInfo.fotoURL
                          : null
                        : usuario?.photoURL && usuario.photoURL !== ""
                        ? usuario.photoURL
                        : null;

                      return fotoURL ? (
                        <img
                          src={fotoURL}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-slate-200 dark:border-slate-600 shadow-sm"
                          alt="Usuario"
                          onError={(e) => {
                            e.target.style.display = "none";
                            if (e.target.nextSibling) {
                              e.target.nextSibling.style.display = "flex";
                            }
                          }}
                        />
                      ) : null;
                    })()}
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-slate-700 dark:bg-slate-600 flex items-center justify-center text-white text-xs sm:text-sm font-semibold border-2 border-slate-200 dark:border-slate-600 shadow-sm ${(() => {
                        const fotoURL = usuarioInfo?.hasOwnProperty("fotoURL")
                          ? usuarioInfo.fotoURL && usuarioInfo.fotoURL !== ""
                            ? usuarioInfo.fotoURL
                            : null
                          : usuario?.photoURL && usuario.photoURL !== ""
                          ? usuario.photoURL
                          : null;
                        return fotoURL ? "hidden" : "flex";
                      })()}`}
                    >
                      {(
                        (
                          usuarioInfo?.displayName ||
                          usuario?.displayName ||
                          usuario?.email
                        )?.charAt(0) || "U"
                      ).toUpperCase()}
                    </div>
                  </div>
                  <span className="hidden sm:inline font-semibold">
                    Cuentas
                  </span>
                  <ChevronDown
                    size={14}
                    className={`sm:w-4 sm:h-4 transition-transform duration-200 ${
                      accountMenuOpen ? "rotate-180" : ""
                    } text-slate-500 dark:text-slate-400`}
                  />
                </button>
                {/* Menú desplegable de cuentas - Mobile */}
                {accountMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setAccountMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-[360px] sm:w-[380px] bg-white dark:bg-slate-900 rounded-xl shadow-2xl z-50 border border-slate-200 dark:border-slate-700 max-h-[85vh] overflow-y-auto backdrop-blur-sm">
                      <AccountMenu
                        currentUser={{
                          uid: usuario?.uid,
                          email: usuario?.email,
                          displayName:
                            usuarioInfo?.displayName ||
                            usuario?.displayName ||
                            "Usuario",
                          photoURL: usuarioInfo?.fotoURL || usuario?.photoURL,
                        }}
                        onAddAccount={handleAddAccount}
                        onLogout={() => setShowLogoutConfirm(true)}
                        onClose={() => setAccountMenuOpen(false)}
                        onSwitchAccount={(switchFn) => {
                          setAccountMenuOpen(false);
                          setTimeout(switchFn, 50);
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal - Más grande y responsive en desktop */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="w-full"
            >
              {/* Contenedor responsive para todas las vistas - Solo para vistas que no son el menú */}
              {activeView === "menu" ? (
                renderView()
              ) : (
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-5 lg:px-6 xl:px-8 pt-0 pb-3 sm:pb-4 md:pb-5 lg:pb-6">
                  {/* Botón volver - Solo en desktop (en móvil está en el header sticky) */}
                  <div className="hidden lg:block mt-2 mb-4">
                    <button
                      onClick={() => setActiveView("menu")}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-200 active:scale-95"
                      aria-label="Volver al menú"
                    >
                      <ArrowLeft
                        size={18}
                        className="text-slate-600 dark:text-slate-400"
                      />
                      <span>Volver</span>
                    </button>
                  </div>
                  <div className="w-full max-w-full overflow-visible">
                    {renderView()}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Modales y componentes adicionales */}
        <EditProfileModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          verificationContext={verificationContext}
          onOpenAddressModal={() => {
            setModalEntregaOpen(true);
          }}
          onSave={async (data) => {
            setSavingProfile(true);
            try {
              let fotoURL = usuarioInfo?.fotoURL || usuario?.photoURL || null;
              let photoChanged = false;

              // Si hay una nueva foto, subirla primero
              if (data.newPhoto) {
                try {
                  fotoURL = await subirImagen(data.newPhoto);
                  photoChanged = true;
                  notify.success("Foto de perfil actualizada");
                } catch (error) {
                  console.error("Error al subir imagen:", error);
                  notify.error("Error al subir la imagen. Intenta de nuevo.");
                  setSavingProfile(false);
                  return;
                }
              }

              // Si se solicita eliminar la foto
              if (data.removePhoto) {
                fotoURL = ""; // String vacío explícito
                photoChanged = true;
                try {
                  // Eliminar de Firebase Auth
                  await updateProfile(usuario, { photoURL: "" });
                  // Actualizar usuario local
                  setUsuario(auth.currentUser);

                  // Intentar eliminar del storage si existe
                  try {
                    const oldPhotoRef = ref(
                      storage,
                      `usuarios/${usuario.uid}/perfil.jpg`
                    );
                    await deleteObject(oldPhotoRef);
                  } catch (storageError) {
                    // Si no existe en storage, no es un error crítico
                    console.warn(
                      "Foto no encontrada en storage o ya eliminada"
                    );
                  }
                } catch (error) {
                  console.warn("Error al eliminar foto:", error);
                  // Continuar aunque falle
                }
              }

              // Actualizar información del usuario
              const updateData = {
                displayName: data.displayName || "",
                telefono: data.telefono || "",
                direccion: data.direccion || "",
              };

              // CRÍTICO: Actualizar fotoURL si cambió (nueva foto o eliminación)
              // Si se elimina, guardar string vacío explícitamente para que no se vuelva a cargar de Google
              if (photoChanged) {
                updateData.fotoURL = fotoURL === null ? "" : fotoURL;
              }

              // Actualizar también displayName en Firebase Auth si cambió
              if (
                data.displayName &&
                data.displayName !== (usuario?.displayName || "")
              ) {
                try {
                  await updateProfile(usuario, {
                    displayName: data.displayName,
                  });
                  setUsuario(auth.currentUser);
                } catch (error) {
                  console.warn(
                    "Error al actualizar displayName en auth:",
                    error
                  );
                }
              }

              // Guardar en Firestore
              const updatedInfo = await actualizarUsuarioInfo(updateData);

              // CRÍTICO: Forzar actualización del estado local para que el header se actualice inmediatamente
              // El onSnapshot debería actualizar automáticamente, pero forzamos para asegurar sincronización
              if (updatedInfo) {
                // El estado ya se actualiza en actualizarUsuarioInfo, pero forzamos re-render
                setRefreshKey((k) => k + 1);
              }

              setEditModalOpen(false);
              notify.success("Perfil actualizado correctamente");
            } catch (error) {
              console.error("Error al actualizar el perfil:", error);
              notify.error("Error al actualizar el perfil. Intenta de nuevo.");
            } finally {
              setSavingProfile(false);
            }
          }}
          initialInfo={{
            // CRÍTICO: Cargar TODOS los datos disponibles - nunca dejar vacío si existe
            displayName: usuarioInfo?.displayName || usuario?.displayName || "",
            nombre: usuarioInfo?.displayName || usuario?.displayName || "",
            telefono: usuarioInfo?.telefono || "",
            direccion:
              usuarioInfo?.direccion || usuarioInfo?.direccionCompleta || "",
            direccionCompleta:
              usuarioInfo?.direccion || usuarioInfo?.direccionCompleta || "",
            email: usuario?.email || usuarioInfo?.email || "",
            // CRÍTICO: Priorizar fotoURL de Firestore (puede ser "" si se eliminó)
            // Solo usar photoURL de Auth si fotoURL no existe en Firestore
            fotoURL: usuarioInfo?.hasOwnProperty("fotoURL")
              ? usuarioInfo.fotoURL
              : usuario?.photoURL || "",
            photoURL: usuario?.photoURL || "",
          }}
          key={`edit-modal-${usuarioInfo?.displayName || ""}-${
            usuarioInfo?.telefono || ""
          }-${usuarioInfo?.direccion || ""}`}
          saving={savingProfile}
        />

        <Entrega
          abierto={modalEntregaOpen}
          onClose={() => {
            setModalEntregaOpen(false);
            setDireccionEditar(null);
          }}
          direccionEditar={direccionEditar}
          onSave={() => {
            setModalEntregaOpen(false);
            setDireccionEditar(null);
            setRefreshKey((k) => k + 1);
            // Forzar actualización del perfil después de cambiar dirección
          }}
          actualizarUsuarioInfo={actualizarUsuarioInfo}
        />

        <OrderDetailsSheet
          isOpen={orderSheetOpen}
          onClose={() => {
            setOrderSheetOpen(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
        />

        <LogoutModal
          isOpen={showLogoutConfirm}
          onClose={() => setShowLogoutConfirm(false)}
          onConfirm={handleLogout}
        />

        <FollowersModal
          isOpen={followersModalOpen}
          onClose={() => setFollowersModalOpen(false)}
          userId={usuario?.uid}
          type={followersModalType}
        />

        <Loader visible={loading} />
      </div>
    </div>
  );
}
