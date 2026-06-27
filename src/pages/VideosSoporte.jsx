import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

/* ── Web Share API helper ────────────────────────────────── */
async function shareVideo(video, e) {
  e.preventDefault();
  e.stopPropagation();
  const url = `${window.location.origin}/videos-soporte/${video.slug}`;
  const shareData = {
    title: video.titulo,
    text: video.descripcionCorta || "",
    url,
  };
  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (_) {}
  } else {
    try {
      await navigator.clipboard.writeText(url);
      /* toast simple */
      const toast = document.createElement("div");
      toast.textContent = "Enlace copiado";
      Object.assign(toast.style, {
        position: "fixed",
        bottom: "24px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "#1e293b",
        color: "#fff",
        padding: "10px 20px",
        borderRadius: "8px",
        fontSize: "14px",
        zIndex: "99999",
        pointerEvents: "none",
      });
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2200);
    } catch (_) {}
  }
}

export default function VideosSoporte() {
  const { isDark } = useTheme();
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [videosData, setVideosData] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "videosTutoriales"),
      where("estado", "==", "publicado"),
      orderBy("createdAt", "desc"),
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setVideosData(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoadingVideos(false);
      },
      () => setLoadingVideos(false),
    );
    return unsub;
  }, []);

  const categorias = Array.from(
    new Set(videosData.map((v) => v.categoria).filter(Boolean)),
  );

  const videosFiltrados =
    categoriaActiva === null
      ? videosData
      : videosData.filter((v) => v.categoria === categoriaActiva);

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? "bg-[#0f1117]" : "bg-white"
      }`}
    >
      {/* ── Encabezado limpio ── */}
      <div
        className={`border-b ${isDark ? "border-white/[0.06]" : "border-gray-100"}`}
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.35 }}
          >
            <h1
              className="text-2xl sm:text-3xl font-bold tracking-tight mb-2"
              style={{ color: isDark ? "#f9fafb" : "#0f172a" }}
            >
              Videos de soporte
            </h1>
            <p
              className="text-sm sm:text-base"
              style={{ color: isDark ? "#6b7280" : "#64748b" }}
            >
              Guías y tutoriales sobre nuestros productos y servicios.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Contenido ── */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8">
        {/* Filtro categorías — solo si existen */}
        {!loadingVideos && categorias.length > 0 && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.3 }}
            className="flex flex-wrap gap-2 mb-8"
          >
            <button
              type="button"
              onClick={() => setCategoriaActiva(null)}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150"
              style={{
                background:
                  categoriaActiva === null
                    ? "#2563eb"
                    : isDark
                      ? "rgba(255,255,255,0.07)"
                      : "rgba(0,0,0,0.05)",
                color:
                  categoriaActiva === null
                    ? "#fff"
                    : isDark
                      ? "#9ca3af"
                      : "#64748b",
              }}
            >
              Todas
            </button>
            {categorias.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setCategoriaActiva(cat)}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150"
                style={{
                  background:
                    categoriaActiva === cat
                      ? "#2563eb"
                      : isDark
                        ? "rgba(255,255,255,0.07)"
                        : "rgba(0,0,0,0.05)",
                  color:
                    categoriaActiva === cat
                      ? "#fff"
                      : isDark
                        ? "#9ca3af"
                        : "#64748b",
                }}
              >
                {cat}
              </button>
            ))}
          </motion.div>
        )}

        {/* Spinner */}
        {loadingVideos && (
          <div className="flex justify-center py-20">
            <svg
              className="animate-spin w-8 h-8 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
        )}

        {/* Grid de videos */}
        {!loadingVideos && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {videosFiltrados.map((video, i) => (
                <motion.div
                  key={video.id}
                  initial="hidden"
                  animate="visible"
                  variants={fadeIn}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="flex flex-col rounded-xl overflow-hidden"
                  style={{
                    background: isDark ? "#161b27" : "#fff",
                    border: isDark
                      ? "1px solid rgba(255,255,255,0.07)"
                      : "1px solid #e2e8f0",
                    boxShadow: isDark ? "none" : "0 1px 3px rgba(0,0,0,0.06)",
                  }}
                >
                  {/* Thumbnail - object-contain para no cortar */}
                  <Link
                    to={`/videos-soporte/${video.slug}`}
                    className="block relative overflow-hidden group no-underline flex-shrink-0"
                    style={{
                      aspectRatio: "16/9",
                      background: isDark ? "#0d1117" : "#f1f5f9",
                    }}
                  >
                    <img
                      src={video.thumbnailUrl}
                      alt={video.titulo}
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                    {/* Play overlay */}
                    <div
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      style={{ background: "rgba(0,0,0,0.28)" }}
                    >
                      <div
                        className="flex items-center justify-center rounded-full"
                        style={{
                          width: 44,
                          height: 44,
                          background: "rgba(255,255,255,0.92)",
                        }}
                      >
                        <svg
                          width="18"
                          height="18"
                          fill="#2563eb"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                    {video.categoria && (
                      <span
                        className="absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          background: "rgba(37,99,235,0.88)",
                          color: "#fff",
                        }}
                      >
                        {video.categoria}
                      </span>
                    )}
                  </Link>

                  {/* Info */}
                  <div className="flex flex-col flex-1 p-4">
                    <Link
                      to={`/videos-soporte/${video.slug}`}
                      className="block no-underline flex-1"
                    >
                      <h3
                        className="font-semibold text-sm leading-snug mb-1.5 line-clamp-2"
                        style={{ color: isDark ? "#f1f5f9" : "#0f172a" }}
                      >
                        {video.titulo}
                      </h3>
                      {video.descripcionCorta && (
                        <p
                          className="text-xs leading-relaxed line-clamp-2"
                          style={{ color: isDark ? "#64748b" : "#94a3b8" }}
                        >
                          {video.descripcionCorta}
                        </p>
                      )}
                    </Link>

                    {/* Botón compartir */}
                    <button
                      type="button"
                      onClick={(e) => shareVideo(video, e)}
                      className="flex items-center gap-1.5 mt-3 text-xs font-medium transition-opacity duration-150 self-start"
                      style={{
                        color: isDark ? "#60a5fa" : "#2563eb",
                        background: "none",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.opacity = "0.7")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.opacity = "1")
                      }
                    >
                      <svg
                        width="13"
                        height="13"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                        />
                      </svg>
                      Compartir
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {videosFiltrados.length === 0 && (
              <div className="text-center py-20">
                <p
                  className="text-sm"
                  style={{ color: isDark ? "#4b5563" : "#94a3b8" }}
                >
                  {videosData.length === 0
                    ? "Aún no hay videos publicados."
                    : "No hay videos en esta categoría."}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
