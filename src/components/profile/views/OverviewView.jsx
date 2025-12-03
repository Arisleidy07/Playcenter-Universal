import React from "react";
import { Edit2 } from "lucide-react";

export default function OverviewView({
  user,
  info,
  stats,
  onEdit,
  onOpenFollowers,
  onOpenFollowing,
}) {
  const name = info?.displayName || user?.displayName || "Usuario";

  return (
    <div className="space-y-8">
      {/* Layout estilo YouTube: Avatar izquierda, info derecha */}
      <div className="flex gap-6 items-start pb-6 border-b border-gray-200 dark:border-gray-700">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl md:text-3xl font-bold shadow-lg">
            {info?.fotoURL || user?.photoURL ? (
              <img
                src={info?.fotoURL || user?.photoURL}
                alt={name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{name?.charAt(0)?.toUpperCase() || "U"}</span>
            )}
          </div>
        </div>

        {/* Nombre y estadísticas */}
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {name}
          </h2>

          {/* Estadísticas en línea estilo YouTube - CLICABLES */}
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-600 dark:text-gray-400">
            <button
              onClick={onOpenFollowers}
              className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors cursor-pointer"
            >
              <span className="font-semibold">{stats?.seguidores || 0}</span>{" "}
              seguidores
            </button>
            <span>·</span>
            <button
              onClick={onOpenFollowing}
              className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors cursor-pointer"
            >
              <span className="font-semibold">{stats?.seguidos || 0}</span>{" "}
              seguidos
            </button>
            <span>·</span>
            <span>
              <span className="font-semibold">{stats?.publicaciones || 0}</span>{" "}
              publicaciones
            </span>
          </div>

          {/* Botón editar */}
          <button
            onClick={onEdit}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-medium text-sm hover:opacity-90 transition-opacity"
          >
            <Edit2 size={14} />
            <span>Editar Perfil</span>
          </button>
        </div>
      </div>

      {/* Información Personal - Diseño Profesional y Moderno */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Información Personal
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Administra tu información de contacto
          </p>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">
          {/* Correo Electrónico */}
          <div className="group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
                  Correo Electrónico
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors">
                    <svg
                      className="w-5 h-5 text-gray-600 dark:text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-medium text-gray-900 dark:text-white break-all">
                      {info?.email || user?.email || "No configurado"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Teléfono */}
          <div className="group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
                  Teléfono
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors">
                    <svg
                      className="w-5 h-5 text-gray-600 dark:text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {info?.telefono || (
                        <span className="text-gray-400 dark:text-gray-500">
                          Sin agregar
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dirección Principal */}
          <div className="group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
                  Dirección Principal
                </label>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors">
                    <svg
                      className="w-5 h-5 text-gray-600 dark:text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    {info?.direccion ? (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          info.direccion
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-2 group/link"
                      >
                        <span className="border-b border-transparent group-hover/link:border-blue-600 dark:group-hover/link:border-blue-400">
                          {info.direccion}
                        </span>
                        <svg
                          className="w-4 h-4 opacity-0 group-hover/link:opacity-100 transition-opacity"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    ) : (
                      <p className="text-base font-medium text-gray-400 dark:text-gray-500">
                        Sin dirección configurada
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer con información adicional */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Para actualizar tu información, haz clic en "Editar Perfil"
          </p>
        </div>
      </div>
    </div>
  );
}
