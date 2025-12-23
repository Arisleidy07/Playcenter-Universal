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
    <div className="space-y-6 sm:space-y-8 lg:space-y-10 w-full max-w-full overflow-hidden">
      {/* Layout estilo YouTube: Avatar izquierda, info derecha - ESTILO PREMIUM */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-8 items-start pb-4 sm:pb-6 border-b border-slate-200 dark:border-slate-700">
        {/* Avatar - CÍRCULO CON INICIAL */}
        <div className="flex-shrink-0">
          <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden bg-slate-700 dark:bg-slate-600 flex items-center justify-center text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold shadow-lg border-2 border-slate-200 dark:border-slate-700">
            {/* CRÍTICO: Priorizar fotoURL de Firestore. Si es "" (string vacío), significa que se eliminó intencionalmente */}
            {(() => {
              const fotoURL = info?.hasOwnProperty('fotoURL') 
                ? (info.fotoURL && info.fotoURL !== "" ? info.fotoURL : null)
                : (user?.photoURL && user.photoURL !== "" ? user.photoURL : null);
              
              return fotoURL ? (
                <img
                  src={fotoURL}
                  alt={name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) {
                      e.target.nextSibling.style.display = 'flex';
                    }
                  }}
                />
              ) : (
                <span className="flex items-center justify-center w-full h-full">{(name?.charAt(0) || "U").toUpperCase()}</span>
              );
            })()}
          </div>
        </div>

        {/* Nombre y estadísticas - TIPOGRAFÍA ELEGANTE */}
        <div className="flex-1 min-w-0 w-full sm:w-auto">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white break-words tracking-tight">
            {name}
          </h2>

          {/* Estadísticas en línea estilo YouTube - CLICABLES - ESTILO PREMIUM */}
          <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            <button
              onClick={onOpenFollowers}
              className="hover:text-blue-700 dark:hover:text-blue-400 hover:underline transition-colors cursor-pointer whitespace-nowrap font-semibold"
            >
              <span className="font-bold text-slate-900 dark:text-white">{stats?.seguidores || 0}</span>{" "}
              seguidores
            </button>
            <span className="text-slate-400">·</span>
            <button
              onClick={onOpenFollowing}
              className="hover:text-blue-700 dark:hover:text-blue-400 hover:underline transition-colors cursor-pointer whitespace-nowrap font-semibold"
            >
              <span className="font-bold text-slate-900 dark:text-white">{stats?.seguidos || 0}</span>{" "}
              seguidos
            </button>
            <span className="text-slate-400">·</span>
            <span className="whitespace-nowrap font-semibold">
              <span className="font-bold text-slate-900 dark:text-white">{stats?.publicaciones || 0}</span>{" "}
              publicaciones
            </span>
          </div>

          {/* Botón editar - ESTILO PREMIUM EJECUTIVO */}
          <button
            onClick={onEdit}
            className="mt-4 sm:mt-6 flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-800 text-white rounded-xl font-semibold text-sm sm:text-base hover:from-blue-700 hover:to-indigo-800 dark:hover:from-blue-600 dark:hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Edit2 size={16} className="sm:w-4 sm:h-4" />
            <span>Editar Perfil</span>
          </button>
        </div>
      </div>

      {/* Información Personal - Diseño Premium Ejecutivo */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden shadow-lg">
        {/* Header - ESTILO PREMIUM */}
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-800 dark:to-blue-900/10">
          <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Información Personal
          </h3>
          <p className="text-xs sm:text-sm lg:text-base text-slate-600 dark:text-slate-400 mt-1 sm:mt-2 font-medium">
            Administra tu información de contacto
          </p>
        </div>

        {/* Contenido */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Correo Electrónico - ESTILO PREMIUM */}
          <div className="group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <label className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 sm:mb-3 block">
                  Correo Electrónico
                </label>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl flex items-center justify-center group-hover:from-blue-100 group-hover:to-indigo-100 dark:group-hover:from-blue-900/30 dark:group-hover:to-indigo-900/30 transition-all duration-200 shadow-sm">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 text-blue-700 dark:text-blue-400"
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
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base lg:text-lg font-semibold text-slate-900 dark:text-white break-words">
                      {info?.email || user?.email || "No configurado"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Teléfono - ESTILO PREMIUM */}
          <div className="group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
                  Teléfono
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl flex items-center justify-center group-hover:from-blue-100 group-hover:to-indigo-100 dark:group-hover:from-blue-900/30 dark:group-hover:to-indigo-900/30 transition-all duration-200 shadow-sm">
                    <svg
                      className="w-5 h-5 text-blue-700 dark:text-blue-400"
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
                    <p className="text-base font-semibold text-slate-900 dark:text-white">
                      {info?.telefono || (
                        <span className="text-slate-400 dark:text-slate-500">
                          Sin agregar
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dirección Principal - ESTILO PREMIUM */}
          <div className="group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
                  Dirección Principal
                </label>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl flex items-center justify-center group-hover:from-blue-100 group-hover:to-indigo-100 dark:group-hover:from-blue-900/30 dark:group-hover:to-indigo-900/30 transition-all duration-200 shadow-sm">
                    <svg
                      className="w-5 h-5 text-blue-700 dark:text-blue-400"
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
                        className="text-base font-semibold text-slate-900 dark:text-white hover:text-blue-700 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-2 group/link"
                      >
                        <span className="border-b border-transparent group-hover/link:border-blue-700 dark:group-hover/link:border-blue-400">
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
                      <p className="text-base font-semibold text-slate-400 dark:text-slate-500">
                        Sin dirección configurada
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer con información adicional - ESTILO PREMIUM */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2 font-medium">
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
