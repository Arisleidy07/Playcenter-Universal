import React from "react";
import { Store, Settings, ExternalLink, Plus } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

export default function StoreView({ stats, user, userInfo, store, storeId }) {
  const { convertirseEnVendedor } = useAuth();
  const hasProducts = (stats?.publicaciones || 0) > 0;
  const storeName =
    store?.nombre ||
    store?.name ||
    userInfo?.storeName ||
    userInfo?.tiendaNombre ||
    "Mi Tienda";
  const avatar =
    store?.logo ||
    store?.logoUrl ||
    store?.image ||
    store?.foto ||
    userInfo?.storeImage ||
    userInfo?.tiendaLogoURL ||
    "";
  const banner =
    store?.banner ||
    store?.bannerUrl ||
    store?.cover ||
    store?.portada ||
    userInfo?.storeBanner ||
    userInfo?.tiendaBannerURL ||
    "";
  const storeDescription =
    store?.descripcion ||
    store?.description ||
    userInfo?.storeDescription ||
    "";

  const isAdmin =
    userInfo?.role === "admin" ||
    userInfo?.admin === true ||
    userInfo?.isAdmin === true;
  const isSeller = userInfo?.role === "seller" || userInfo?.isSeller === true;
  const canManage = isAdmin || isSeller;

  if (!canManage) {
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
              <a
                href={storeId ? `/tiendas/${storeId}` : "/tiendas"}
                className="flex-1 md:flex-none flex justify-center items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors shadow-sm"
              >
                <ExternalLink size={18} />
                <span>Ver Tienda</span>
              </a>
              <a
                href="/admin"
                className="flex-1 md:flex-none flex justify-center items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
              >
                <Settings size={18} />
                <span>Gestionar</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* No empty-state CTA requested by user */}
    </div>
  );
}
