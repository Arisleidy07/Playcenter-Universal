import React, { useState, useEffect } from "react";
import { Store, Settings, ExternalLink, Plus } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { useNavigate } from "react-router-dom";

export default function StoreView({ stats, user, userInfo, store, storeId }) {
  const { convertirseEnVendedor } = useAuth();
  const navigate = useNavigate();
  const hasProducts = (stats?.publicaciones || 0) > 0;
  const [localStoreId, setLocalStoreId] = useState(storeId);
  const [localStore, setLocalStore] = useState(store);
  const [creatingStore, setCreatingStore] = useState(false);

  // Debug: Mostrar información recibida
  console.log("📋 StoreView renderizado con:", {
    hasUser: !!user,
    userId: user?.uid,
    userRole: userInfo?.role,
    isAdmin: userInfo?.isAdmin || userInfo?.admin,
    isSeller: userInfo?.isSeller,
    storeIdProp: storeId,
    storeIdInUserInfo: userInfo?.storeId,
    hasStore: !!store,
  });
  const storeName =
    localStore?.nombre ||
    localStore?.name ||
    store?.nombre ||
    store?.name ||
    userInfo?.storeName ||
    userInfo?.tiendaNombre ||
    userInfo?.displayName ||
    "Mi Tienda";
  const avatar =
    localStore?.logo ||
    localStore?.logoUrl ||
    store?.logo ||
    store?.logoUrl ||
    store?.image ||
    store?.foto ||
    userInfo?.storeImage ||
    userInfo?.tiendaLogoURL ||
    userInfo?.photoURL ||
    userInfo?.fotoURL ||
    "";
  const banner =
    localStore?.banner ||
    localStore?.bannerUrl ||
    store?.banner ||
    store?.bannerUrl ||
    store?.cover ||
    store?.portada ||
    userInfo?.storeBanner ||
    userInfo?.tiendaBannerURL ||
    "";
  const storeDescription =
    localStore?.descripcion ||
    localStore?.description ||
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

  // Buscar tienda automáticamente (incluso si no tiene permisos aún)
  useEffect(() => {
    if (!user) return;

    const findOrCreateStore = async () => {
      try {
        console.log("🔍 Buscando tienda para usuario:", {
          uid: user.uid,
          isAdmin,
          isSeller,
          storeId: userInfo?.storeId,
          email: userInfo?.email,
        });

        // PRIMERO: Si es admin, usar tienda principal Playcenter Universal
        if (isAdmin) {
          console.log("👑 Usuario es ADMIN, buscando playcenter_universal...");
          const mainStoreDoc = await getDoc(
            doc(db, "tiendas", "playcenter_universal")
          );
          if (mainStoreDoc.exists()) {
            console.log("✅ Tienda playcenter_universal encontrada!");
            setLocalStoreId("playcenter_universal");
            setLocalStore({
              id: "playcenter_universal",
              ...mainStoreDoc.data(),
            });

            // Actualizar perfil del admin con storeId si no lo tiene
            if (userInfo?.storeId !== "playcenter_universal") {
              console.log("🔄 Actualizando perfil admin con storeId...");
              const userRef = doc(db, "users", user.uid);
              await updateDoc(userRef, {
                storeId: "playcenter_universal",
                storeName: "Playcenter Universal",
              }).catch(() => {
                console.log("No se pudo actualizar perfil admin");
              });

              // Actualizar productos del admin con el storeId correcto
              try {
                const productosQuery = query(
                  collection(db, "productos"),
                  where("ownerUid", "==", user.uid)
                );
                const productosSnap = await getDocs(productosQuery);

                const updatePromises = productosSnap.docs.map(
                  async (productDoc) => {
                    const productData = productDoc.data();
                    if (productData.storeId !== "playcenter_universal") {
                      return updateDoc(doc(db, "productos", productDoc.id), {
                        storeId: "playcenter_universal",
                        storeName: "Playcenter Universal",
                      });
                    }
                  }
                );

                await Promise.all(updatePromises.filter(Boolean));
                console.log(
                  `✅ Actualizados ${productosSnap.docs.length} productos del admin con storeId`
                );
              } catch (error) {
                console.log(
                  "❌ No se pudieron actualizar productos admin:",
                  error
                );
              }
            } else {
              console.log("✅ Perfil admin ya tiene storeId correcto");
            }
            console.log("🎉 Tienda conectada correctamente!");
            return;
          }
        }

        // SEGUNDO: Si ya tenemos storeId en el perfil, verificar que existe
        if (storeId || localStoreId || userInfo?.storeId) {
          const id = storeId || localStoreId || userInfo?.storeId;
          const storeDoc = await getDoc(doc(db, "tiendas", id));
          if (storeDoc.exists()) {
            setLocalStoreId(id);
            setLocalStore({ id, ...storeDoc.data() });
            return;
          }
        }

        // TERCERO: Buscar tienda por diferentes campos
        const searchFields = ["ownerId", "owner_id", "propietarioId", "userId"];

        for (const field of searchFields) {
          const q = query(
            collection(db, "tiendas"),
            where(field, "==", user.uid)
          );
          const snap = await getDocs(q);

          if (!snap.empty) {
            const foundStore = snap.docs[0];
            setLocalStoreId(foundStore.id);
            setLocalStore({ id: foundStore.id, ...foundStore.data() });

            // Actualizar perfil con el storeId encontrado
            if (userInfo?.storeId !== foundStore.id) {
              const userRef = doc(db, "users", user.uid);
              await updateDoc(userRef, {
                storeId: foundStore.id,
                storeName: foundStore.data().nombre || "Mi Tienda",
              }).catch(() => {});
            }
            return;
          }
        }

        // Si no existe tienda, mostrar que no se encontró
        if (!localStoreId) {
          console.log("⚠️ No se encontró tienda existente");
          console.log("   canManage:", canManage);
          console.log("   isAdmin:", isAdmin);
          console.log("   isSeller:", isSeller);

          if (!canManage) {
            console.log("❌ Usuario no tiene permisos para crear tienda");
            return;
          }

          console.log("✅ Usuario tiene permisos, creando tienda nueva...");
          setCreatingStore(true);
          const newStoreId = `tienda_${user.uid}`;
          const newStoreData = {
            nombre: userInfo?.storeName || userInfo?.displayName || "Mi Tienda",
            descripcion: `Tienda de ${userInfo?.displayName || "productos"}`,
            ownerId: user.uid,
            userId: user.uid,
            owner_id: user.uid,
            propietarioId: user.uid,
            logo: userInfo?.photoURL || userInfo?.fotoURL || "",
            banner: "",
            activo: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          await setDoc(doc(db, "tiendas", newStoreId), newStoreData);

          // Actualizar el perfil del usuario con el storeId
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, {
            storeId: newStoreId,
            storeName: newStoreData.nombre,
            isSeller: true,
            role: userInfo?.role === "admin" ? "admin" : "seller",
          }).catch(() => {
            // Si falla la actualización del perfil, seguir adelante
            console.log("No se pudo actualizar perfil, pero tienda creada");
          });

          // Actualizar productos existentes del usuario con el storeId
          try {
            const productosQuery = query(
              collection(db, "productos"),
              where("ownerUid", "==", user.uid)
            );
            const productosSnap = await getDocs(productosQuery);

            const updatePromises = productosSnap.docs.map(
              async (productDoc) => {
                // Solo actualizar si no tiene storeId o si es diferente
                const productData = productDoc.data();
                if (
                  !productData.storeId ||
                  productData.storeId !== newStoreId
                ) {
                  return updateDoc(doc(db, "productos", productDoc.id), {
                    storeId: newStoreId,
                    storeName: newStoreData.nombre,
                  });
                }
              }
            );

            await Promise.all(updatePromises.filter(Boolean));
            console.log(
              `Actualizados ${productosSnap.docs.length} productos con storeId`
            );
          } catch (error) {
            console.log(
              "No se pudieron actualizar productos existentes:",
              error
            );
          }

          setLocalStoreId(newStoreId);
          setLocalStore({ id: newStoreId, ...newStoreData });
          setCreatingStore(false);
          console.log("✅ Tienda nueva creada exitosamente:", newStoreId);
        }
      } catch (error) {
        console.error("❌ Error finding/creating store:", error);
        setCreatingStore(false);
      }
    };

    findOrCreateStore();
  }, [user, userInfo, storeId, localStoreId, canManage, isAdmin]);

  // Si NO tiene permisos Y NO se encontró tienda, mostrar botón de comenzar
  if (!canManage && !localStoreId) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-200 dark:border-slate-700 shadow-sm p-8 text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Store size={22} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Todavía no tienes una tienda
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Crea tu tienda y empieza a vender en Playcenter Universal.
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
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            Empezar a vender
          </button>
        </div>
      </div>
    );
  }

  // Si tiene tienda pero no tiene permisos actualizados, mostrar mensaje de carga
  if (!canManage && localStoreId) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-200 dark:border-slate-700 shadow-sm p-8 text-center">
          <div className="animate-spin mx-auto mb-4 w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Cargando tu tienda...
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Verificando permisos
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Panel de Vendedor
        </h2>
        {isAdmin && (
          <a
            href="/admin"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            Ir al Dashboard Avanzado →
          </a>
        )}
      </div>

      {/* Card Premium */}
      <div className="group bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-xl border border-gray-100 dark:border-slate-700 transition-all hover:shadow-2xl">
        {/* Banner */}
        <div className="h-48 w-full bg-gray-200 relative overflow-hidden">
          {banner ? (
            <img
              src={banner}
              alt="Portada"
              className="w-full h-full object-contain bg-gray-100 dark:bg-slate-700 transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700" />
          )}
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
        </div>

        {/* Separador - División clara */}
        <div className="h-px bg-gray-200 dark:bg-slate-700" />

        {/* Cuerpo */}
        <div className="px-8 py-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-2xl bg-white dark:bg-slate-800 p-2 shadow-lg border-2 border-gray-100 dark:border-slate-600">
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Logo"
                    className="w-full h-full rounded-xl object-contain bg-gray-50 dark:bg-slate-700"
                  />
                ) : (
                  <div className="w-full h-full rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center">
                    <Store
                      size={32}
                      className="text-blue-600 dark:text-blue-300"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 w-full md:w-auto min-w-0">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 truncate">
                {storeName}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {storeDescription ||
                  `${
                    stats?.publicaciones || 0
                  } productos activos • Calificación 5.0`}
              </p>
            </div>

            {/* Acciones */}
            <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
              <button
                onClick={() => {
                  const targetStoreId = localStoreId || storeId;
                  if (targetStoreId) {
                    navigate(`/tiendas/${targetStoreId}`);
                  } else {
                    navigate("/tiendas");
                  }
                }}
                disabled={creatingStore}
                className="flex-1 md:flex-none flex justify-center items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ExternalLink size={18} />
                <span>{creatingStore ? "Creando..." : "Ver Mi Tienda"}</span>
              </button>
              <button
                onClick={() => navigate("/admin")}
                className="flex-1 md:flex-none flex justify-center items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
              >
                <Settings size={18} />
                <span>Gestionar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* No empty-state CTA requested by user */}
    </div>
  );
}
