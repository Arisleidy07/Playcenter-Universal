import React from "react";
import { useFollow } from "../../hooks/useFollow";
import { UserPlus, Check, Loader2 } from "lucide-react";

/**
 * Botón de Seguir/Dejar de Seguir estilo Instagram/Twitter
 *
 * Estados visuales:
 * - No siguiendo: Botón azul "Seguir" con icono UserPlus
 * - Siguiendo: Botón gris "Siguiendo" con check, hover muestra "Dejar de seguir" en rojo
 * - Loading: Skeleton loader
 *
 * @param {string} targetUserId - UID del usuario/tienda a seguir
 * @param {string} variant - "default" | "compact" | "icon-only"
 * @param {string} customClass - Clases CSS adicionales
 */
export default function FollowButton({
  targetUserId,
  variant = "default",
  customClass = "",
}) {
  const { isFollowing, toggleFollow, loading } = useFollow(targetUserId);
  const [isHovered, setIsHovered] = React.useState(false);

  // ═══════════════════════════════════════════════════════════
  // LOADING STATE (Skeleton)
  // ═══════════════════════════════════════════════════════════
  if (loading) {
    return (
      <div
        className={`
          bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse
          ${variant === "compact" ? "w-16 h-7" : "w-24 h-9"}
          ${customClass}
        `}
      />
    );
  }

  // ═══════════════════════════════════════════════════════════
  // VARIANT: ICON ONLY (Para espacios pequeños)
  // ═══════════════════════════════════════════════════════════
  if (variant === "icon-only") {
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleFollow();
        }}
        className={`
          p-2 rounded-full transition-all duration-200
          ${
            isFollowing
              ? "bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-500"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }
          ${customClass}
        `}
        title={isFollowing ? "Dejar de seguir" : "Seguir"}
      >
        {isFollowing ? <Check size={18} /> : <UserPlus size={18} />}
      </button>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // VARIANT: DEFAULT & COMPACT
  // ═══════════════════════════════════════════════════════════
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFollow();
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        font-semibold rounded-lg transition-all duration-200 
        flex items-center justify-center gap-2
        ${variant === "compact" ? "px-4 py-1.5 text-xs" : "px-6 py-2 text-sm"}
        ${
          isFollowing
            ? `
            bg-transparent border border-gray-300 text-gray-700
            hover:border-red-500 hover:text-red-500 hover:bg-red-50
            dark:border-gray-600 dark:text-gray-300
            dark:hover:border-red-400 dark:hover:text-red-400 dark:hover:bg-red-950
          `
            : `
            bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg
            dark:bg-blue-500 dark:hover:bg-blue-600
          `
        }
        active:scale-95
        ${customClass}
      `}
    >
      {/* ═══════════════════════════════════════════════════ */}
      {/* ESTADO: SIGUIENDO */}
      {/* ═══════════════════════════════════════════════════ */}
      {isFollowing ? (
        <>
          {isHovered ? (
            <>
              {/* En hover: "Dejar de seguir" en rojo */}
              <span className="text-xs md:text-sm">✕</span>
              <span>Dejar de seguir</span>
            </>
          ) : (
            <>
              {/* Normal: "Siguiendo" con check */}
              <Check size={variant === "compact" ? 14 : 16} />
              <span>Siguiendo</span>
            </>
          )}
        </>
      ) : (
        <>
          {/* ═══════════════════════════════════════════════════ */}
          {/* ESTADO: NO SIGUIENDO */}
          {/* ═══════════════════════════════════════════════════ */}
          <UserPlus size={variant === "compact" ? 14 : 16} />
          <span>Seguir</span>
        </>
      )}
    </button>
  );
}
