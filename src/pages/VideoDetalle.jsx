import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import {
  collection,
  query,
  where,
  limit,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";

const fadeIn = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

/* ── Web Share API ───────────────────────────────────────── */
async function shareVideo(video) {
  const url = window.location.href;
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

export default function VideoDetalle() {
  const { videoId } = useParams();
  const { isDark } = useTheme();

  const [video, setVideo] = useState(null);
  const [otrosVideos, setOtrosVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  /* Cargar video por slug */
  useEffect(() => {
    const q = query(
      collection(db, "videosTutoriales"),
      where("slug", "==", videoId),
      where("estado", "==", "publicado"),
      limit(1),
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setVideo(
          snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() },
        );
        setLoading(false);
      },
      () => setLoading(false),
    );
    return unsub;
  }, [videoId]);

  /* Otros videos */
  useEffect(() => {
    const q = query(
      collection(db, "videosTutoriales"),
      where("estado", "==", "publicado"),
      orderBy("createdAt", "desc"),
    );
    const unsub = onSnapshot(q, (snap) => {
      setOtrosVideos(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((v) => v.slug !== videoId)
          .slice(0, 4),
      );
    });
    return unsub;
  }, [videoId]);

  /* Meta tags OG para vista previa al compartir */
  useEffect(() => {
    if (!video) return;
    const setMeta = (prop, content, isName = false) => {
      const sel = isName ? `meta[name="${prop}"]` : `meta[property="${prop}"]`;
      let el = document.querySelector(sel);
      if (!el) {
        el = document.createElement("meta");
        isName
          ? el.setAttribute("name", prop)
          : el.setAttribute("property", prop);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    document.title = `${video.titulo} | Videos Soporte — Playcenter Universal`;
    setMeta("og:title", `${video.titulo} | Playcenter Universal`);
    setMeta("og:description", video.descripcionCorta || "");
    setMeta("og:image", video.thumbnailUrl || "");
    setMeta("og:url", window.location.href);
    setMeta("og:type", "video.other");
    setMeta("og:site_name", "Playcenter Universal");
    setMeta("twitter:card", "summary_large_image", true);
    setMeta("twitter:title", `${video.titulo} | Playcenter Universal`, true);
    setMeta("twitter:description", video.descripcionCorta || "", true);
    setMeta("twitter:image", video.thumbnailUrl || "", true);
    setMeta("description", video.descripcionCorta || "", true);
    return () => {
      document.title = "Playcenter Universal";
    };
  }, [video]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${isDark ? "bg-[#0f1117]" : "bg-white"}`}
      >
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
    );
  }

  /* ── Not found ── */
  if (!video) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center px-6 ${isDark ? "bg-[#0f1117]" : "bg-white"}`}
      >
        <p
          className="text-sm mb-4"
          style={{ color: isDark ? "#4b5563" : "#94a3b8" }}
        >
          Video no encontrado.
        </p>
        <Link
          to="/videos-soporte"
          className="text-sm font-semibold no-underline"
          style={{ color: "#2563eb" }}
        >
          ← Ver todos los videos
        </Link>
      </div>
    );
  }

  const isHTML = video.contenido && /<[a-z][\s\S]*>/i.test(video.contenido);

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-[#0f1117]" : "bg-white"}`}
    >
      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
        {/* Volver — discreto */}
        <Link
          to="/videos-soporte"
          className="inline-flex items-center gap-1.5 text-xs font-medium mb-8 no-underline transition-opacity duration-150"
          style={{ color: isDark ? "#4b5563" : "#94a3b8" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#2563eb")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = isDark ? "#4b5563" : "#94a3b8")
          }
        >
          <svg
            width="12"
            height="12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Videos de soporte
        </Link>

        {/* Categoría + Título */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.3 }}
        >
          {video.categoria && (
            <span
              className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full mb-3"
              style={{
                background: isDark
                  ? "rgba(37,99,235,0.15)"
                  : "rgba(219,234,254,1)",
                color: isDark ? "#93c5fd" : "#1d4ed8",
              }}
            >
              {video.categoria}
            </span>
          )}
          <h1
            className="text-2xl sm:text-3xl font-bold tracking-tight leading-snug mb-4"
            style={{ color: isDark ? "#f9fafb" : "#0f172a" }}
          >
            {video.titulo}
          </h1>
          {video.descripcionCorta && (
            <p
              className="text-base mb-6"
              style={{ color: isDark ? "#6b7280" : "#64748b" }}
            >
              {video.descripcionCorta}
            </p>
          )}

          {/* Acciones */}
          <div className="flex items-center gap-3 mb-8">
            <button
              type="button"
              onClick={() => shareVideo(video)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150"
              style={{
                background: isDark
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(0,0,0,0.04)",
                color: isDark ? "#e2e8f0" : "#1e293b",
                border: isDark
                  ? "1px solid rgba(255,255,255,0.08)"
                  : "1px solid #e2e8f0",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.07)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isDark
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(0,0,0,0.04)";
              }}
            >
              <svg
                width="15"
                height="15"
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

        {/* Video player */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="rounded-xl overflow-hidden mb-8"
          style={{
            background: "#000",
            boxShadow: isDark
              ? "0 4px 32px rgba(0,0,0,0.6)"
              : "0 4px 24px rgba(0,0,0,0.1)",
          }}
        >
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <iframe
              src={video.videoUrl}
              title={video.titulo}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
              style={{ border: 0 }}
            />
          </div>
        </motion.div>

        {/* Contenido / descripción detallada */}
        {(video.contenido || video.descripcionCorta) && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="mb-10"
          >
            <div
              className={`text-sm leading-relaxed${isHTML ? " prose max-w-none" : ""}`}
              style={{ color: isDark ? "#cbd5e1" : "#334155" }}
            >
              {isHTML ? (
                <div dangerouslySetInnerHTML={{ __html: video.contenido }} />
              ) : (
                (video.contenido || video.descripcionCorta || "")
                  .split("\n\n")
                  .filter(Boolean)
                  .map((p, i) => (
                    <p key={i} className="mb-4 last:mb-0">
                      {p.trim()}
                    </p>
                  ))
              )}
            </div>
          </motion.div>
        )}

        {/* Otros videos */}
        {otrosVideos.length > 0 && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.35, delay: 0.15 }}
          >
            <div
              className={`border-t pt-8 ${isDark ? "border-white/[0.06]" : "border-gray-100"}`}
            >
              <h2
                className="text-sm font-semibold mb-5"
                style={{ color: isDark ? "#94a3b8" : "#64748b" }}
              >
                Más videos
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {otrosVideos.map((v) => (
                  <Link
                    key={v.id}
                    to={`/videos-soporte/${v.slug}`}
                    className="flex gap-3 group no-underline rounded-lg p-2 transition-colors duration-150"
                    style={{ background: "transparent" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = isDark
                        ? "rgba(255,255,255,0.04)"
                        : "rgba(0,0,0,0.03)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <div
                      className="flex-shrink-0 rounded-lg overflow-hidden"
                      style={{
                        width: 80,
                        height: 52,
                        background: isDark ? "#0d1117" : "#f1f5f9",
                      }}
                    >
                      <img
                        src={v.thumbnailUrl}
                        alt={v.titulo}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs font-semibold leading-snug line-clamp-2 transition-colors duration-150 group-hover:text-blue-500"
                        style={{ color: isDark ? "#e2e8f0" : "#1e293b" }}
                      >
                        {v.titulo}
                      </p>
                      {v.categoria && (
                        <p
                          className="text-[11px] mt-1"
                          style={{ color: isDark ? "#4b5563" : "#94a3b8" }}
                        >
                          {v.categoria}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
