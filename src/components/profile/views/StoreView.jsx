import React from "react";
import { Store, Settings, ExternalLink, Plus } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../../firebase";

export default function StoreView({ stats, user, userInfo, store, storeId }) {
  const { convertirseEnVendedor } = useAuth();
  const navigate = useNavigate();
  const hasProducts = (stats?.publicaciones || 0) > 0;

  // Usar DIRECTAMENTE los props sin estado local
  const storeName =
    store?.nombre ||
    store?.name ||
    userInfo?.storeName ||
    userInfo?.displayName ||
    "Mi Tienda";

  const avatar =
    store?.logo ||
    store?.logoUrl ||
    store?.logoURL ||
    store?.tiendaLogo ||
    store?.storeImage ||
    store?.image ||
    store?.imageUrl ||
    store?.foto ||
    store?.fotoUrl ||
    store?.fotoURL ||
    "";

  const banner =
    store?.banner ||
    store?.bannerUrl ||
    store?.bannerURL ||
    store?.tiendaBanner ||
    store?.storeBanner ||
    store?.cover ||
    store?.portada ||
    store?.coverUrl ||
    store?.coverURL ||
    "";

  // Fallback: si no llegan imágenes en props, intentar leerlas directo desde Firestore
  const [resolvedImgs, setResolvedImgs] = React.useState({
    id: "",
    logo: "",
    banner: "",
  });
  React.useEffect(() => {
    let alive = true;
    const run = async () => {
      try {
        const needLogo = !avatar;
        const needBanner = !banner;
        if (!needLogo && !needBanner) return;

        let foundId = storeId || store?.id || userInfo?.storeId || "";
        let data = null;

        const readById = async (col, id) => {
          try {
            const snap = await getDoc(doc(db, col, id));
            if (snap.exists()) return snap.data();
          } catch (_) {}
          return null;
        };

        const searchByField = async (col, fields, value) => {
          for (const field of fields) {
            try {
              const qRef = query(
                collection(db, col),
                where(field, "==", value)
              );
              const snap = await getDocs(qRef);
              if (!snap.empty) {
                const d = snap.docs[0];
                return { id: d.id, data: d.data() };
              }
            } catch (_) {}
          }
          return null;
        };

        if (foundId) {
          data =
            (await readById("tiendas", foundId)) ||
            (await readById("stores", foundId));
        }

        if (!data) {
          const uidCandidates = [
            user?.uid,
            userInfo?.uid,
            userInfo?.ownerUid,
            userInfo?.storeOwnerId,
          ].filter(Boolean);
          const email = (userInfo?.email || user?.email || "")
            .toLowerCase()
            .trim();

          const tiendaFields = [
            "ownerId",
            "owner_id",
            "propietarioId",
            "propietario_id",
            "userId",
            "createdBy",
          ];
          const storeFields = [
            "ownerUid",
            "ownerId",
            "owner_id",
            "userId",
            "createdBy",
          ];

          for (const uid of uidCandidates) {
            if (data) break;
            const fromTiendas = await searchByField(
              "tiendas",
              tiendaFields,
              uid
            );
            if (fromTiendas) {
              foundId = fromTiendas.id;
              data = fromTiendas.data;
              break;
            }
            const fromStores = await searchByField("stores", storeFields, uid);
            if (fromStores) {
              foundId = fromStores.id;
              data = fromStores.data;
              break;
            }
          }

          if (!data && email) {
            const byEmail = await searchByField(
              "stores",
              ["ownerEmail"],
              email
            );
            if (byEmail) {
              foundId = byEmail.id;
              data = byEmail.data;
            }
          }
        }

        if (!data) return;

        const logo =
          data.logo ||
          data.logoUrl ||
          data.logoURL ||
          data.tiendaLogo ||
          data.storeImage ||
          data.image ||
          data.imageUrl ||
          data.foto ||
          data.fotoUrl ||
          data.fotoURL ||
          "";
        const bannerImg =
          data.banner ||
          data.bannerUrl ||
          data.bannerURL ||
          data.tiendaBanner ||
          data.storeBanner ||
          data.cover ||
          data.portada ||
          data.coverUrl ||
          data.coverURL ||
          "";

        if (alive) setResolvedImgs({ id: foundId, logo, banner: bannerImg });
      } catch (_) {}
    };
    run();
    return () => {
      alive = false;
    };
  }, [
    storeId,
    store?.id,
    userInfo?.storeId,
    avatar,
    banner,
    user?.uid,
    userInfo?.uid,
    userInfo?.email,
  ]);

  const bannerSrc = banner || resolvedImgs.banner;
  const logoSrc = avatar || resolvedImgs.logo;

  const storeDescription =
    store?.descripcion ||
    store?.description ||
    userInfo?.storeDescription ||
    `Tienda de ${userInfo?.displayName || "productos"}. ${
      stats?.publicaciones || 0
    } productos disponibles.`;

  const isAdmin =
    userInfo?.role === "admin" ||
    userInfo?.admin === true ||
    userInfo?.isAdmin === true;
  const isSeller = userInfo?.role === "seller" || userInfo?.isSeller === true;
  const canManage = isAdmin || isSeller;

  // Si NO tiene tienda, mostrar botón de comenzar
  if (!store && !storeId) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4">
        <div className="rounded-2xl md:rounded-3xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-900 shadow-sm ring-1 ring-black/5 dark:ring-white/5 p-6 md:p-8 text-center">
          <div className="mx-auto mb-3 md:mb-4 w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 flex items-center justify-center ring-1 ring-black/5 dark:ring-white/5">
            <Store size={20} className="md:w-[22px] md:h-[22px]" />
          </div>
          <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-2">
            Todavía no tienes una tienda
          </h3>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mb-4 md:mb-6">
            Crea tu tienda y empieza a vender.
          </p>
          <button
            onClick={async () => {
              try {
                await convertirseEnVendedor({
                  storeName: userInfo?.displayName || "Mi Tienda",
                });
                window.location.href = "/admin";
              } catch (_) {}
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 md:px-5 md:py-2.5 bg-blue-600 text-white rounded-lg md:rounded-xl font-semibold text-sm md:text-base shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} className="md:w-[18px] md:h-[18px]" />
            Empezar a vender
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-8">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <img
            src="/logos/perfil/6.jpg"
            alt=""
            className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full object-cover"
          />
          Mi Tienda
        </h2>
        {isAdmin && (
          <a
            href="/admin"
            className="text-xs md:text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 hidden md:inline"
          >
            Dashboard →
          </a>
        )}
      </div>

      {/* Card Premium - Versión simplificada para no administradores */}
      {isAdmin ? (
        // Vista completa para administradores
        <div className="group bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl overflow-hidden shadow-lg md:shadow-xl border border-slate-200/80 dark:border-slate-700/80 ring-1 ring-black/5 dark:ring-white/5">
          {/* Banner */}
          <div className="h-32 md:h-48 w-full bg-slate-100 dark:bg-slate-800/60 relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 w-full h-full bg-slate-50 dark:bg-slate-900/20" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/10 to-slate-900/20 dark:via-slate-900/35 dark:to-slate-900/55" />
            {bannerSrc && (
              <img
                src={bannerSrc}
                alt="Portada"
                className="relative z-10 w-full h-full object-cover"
                onError={(e) => {
                  try {
                    e.currentTarget.style.display = "none";
                  } catch (_) {}
                }}
              />
            )}
          </div>

          {/* Cuerpo */}
          <div className="px-4 py-4 md:px-8 md:py-6">
            <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center">
              {/* Avatar */}
              <div className="flex-shrink-0 mx-auto md:mx-0">
                <div className="w-16 h-16 md:w-24 md:h-24 rounded-xl md:rounded-2xl bg-white dark:bg-slate-900 p-1.5 md:p-2 shadow-md md:shadow-lg border border-slate-200/80 dark:border-slate-700/70 ring-1 ring-black/5 dark:ring-white/5">
                  {/* Fallback visible cuando no hay imagen o si falla la carga */}
                  <div className="logo-fallback w-full h-full rounded-lg md:rounded-xl bg-slate-50 dark:bg-slate-800/70 flex items-center justify-center">
                    <Store
                      size={24}
                      className="text-slate-400 dark:text-slate-300 md:w-8 md:h-8"
                    />
                  </div>
                  {logoSrc && (
                    <img
                      src={logoSrc}
                      alt="Logo"
                      className="w-full h-full rounded-lg md:rounded-xl object-contain bg-slate-50 dark:bg-slate-800/70"
                      onLoad={(e) => {
                        try {
                          const parent = e.currentTarget.parentElement;
                          const fb =
                            parent && parent.querySelector(".logo-fallback");
                          if (fb) fb.style.display = "none";
                        } catch (_) {}
                      }}
                      onError={(e) => {
                        try {
                          const parent = e.currentTarget.parentElement;
                          const fb =
                            parent && parent.querySelector(".logo-fallback");
                          if (fb) fb.style.display = "";
                          e.currentTarget.style.display = "none";
                        } catch (_) {}
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 w-full md:w-auto min-w-0 text-center md:text-left">
                <h3 className="text-lg md:text-2xl font-bold text-slate-900 dark:text-white mb-1 md:mb-2 truncate">
                  {storeName}
                </h3>
                <div className="mt-1">
                  <p className="text-[11px] md:text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">
                    Descripción
                  </p>
                  <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-2">
                    {storeDescription ||
                      `${
                        stats?.publicaciones || 0
                      } productos activos • Calificación 5.0`}
                  </p>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 justify-center md:justify-start">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] md:text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/70">
                    {stats?.publicaciones || 0} productos
                  </span>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex flex-col md:flex-row gap-2 md:gap-3 w-full md:w-auto">
                <button
                  onClick={() => {
                    const targetId = storeId || store?.id || resolvedImgs?.id;
                    if (targetId) {
                      navigate(`/tiendas/${targetId}`);
                    } else {
                      navigate("/tiendas");
                    }
                  }}
                  className="flex justify-center items-center gap-1.5 px-3 py-2 md:px-5 md:py-2.5 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/70 rounded-lg md:rounded-xl font-medium md:font-semibold text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm ring-1 ring-black/5 dark:ring-white/5"
                >
                  <ExternalLink size={16} className="md:w-[18px] md:h-[18px]" />
                  <span className="text-xs md:text-sm">Ver Tienda</span>
                </button>
                <button
                  onClick={() => navigate("/admin")}
                  className="flex justify-center items-center gap-1.5 px-3 py-2 md:px-5 md:py-2.5 bg-blue-600 text-white rounded-lg md:rounded-xl font-medium md:font-semibold text-sm shadow-md md:shadow-lg shadow-blue-600/20 md:shadow-blue-600/30 hover:bg-blue-700 transition-colors"
                >
                  <Settings size={16} className="md:w-[18px] md:h-[18px]" />
                  <span className="text-xs md:text-sm">Gestionar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Vista simplificada para no administradores
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl shadow-lg md:shadow-xl border border-slate-200/80 dark:border-slate-700/80 ring-1 ring-black/5 dark:ring-white/5 p-6 md:p-8">
          {/* Solo nombre y botones para no administradores */}
          <div className="text-center md:text-left">
            <h3 className="text-lg md:text-2xl font-bold text-slate-900 dark:text-white mb-2 md:mb-3">
              {storeName}
            </h3>
            <div className="mt-1">
              <p className="text-[11px] md:text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">
                Descripción
              </p>
              <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-2">
                {storeDescription ||
                  `${
                    stats?.publicaciones || 0
                  } productos activos • Calificación 5.0`}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2 justify-center md:justify-start">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] md:text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/70">
                  {stats?.publicaciones || 0} productos
                </span>
              </div>
            </div>

            {/* Botones */}
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-center md:justify-start">
              <button
                onClick={() => {
                  const targetId = storeId || store?.id || resolvedImgs?.id;
                  if (targetId) {
                    navigate(`/tiendas/${targetId}`);
                  } else {
                    navigate("/tiendas");
                  }
                }}
                className="flex justify-center items-center gap-2 px-4 py-2.5 md:px-6 md:py-3 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/70 rounded-lg md:rounded-xl font-medium text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm ring-1 ring-black/5 dark:ring-white/5"
              >
                <ExternalLink size={18} />
                <span>Ver Tienda</span>
              </button>
              <button
                onClick={() => navigate("/admin")}
                className="flex justify-center items-center gap-2 px-4 py-2.5 md:px-6 md:py-3 bg-blue-600 text-white rounded-lg md:rounded-xl font-medium text-sm shadow-md md:shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-colors"
              >
                <Settings size={18} />
                <span>Gestionar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No empty-state CTA requested by user */}
    </div>
  );
}
