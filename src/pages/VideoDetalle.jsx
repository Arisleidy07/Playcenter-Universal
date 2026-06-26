import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function VideoDetalle() {
  const { videoId } = useParams();
  const { isDark } = useTheme();
  const navigate = useNavigate();

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
        if (!snap.empty) {
          setVideo({ id: snap.docs[0].id, ...snap.docs[0].data() });
        } else {
          setVideo(null);
        }
        setLoading(false);
      },
      () => setLoading(false),
    );
    return unsub;
  }, [videoId]);

  /* Cargar otros videos para el panel lateral */
  useEffect(() => {
    const q = query(
      collection(db, "videosTutoriales"),
      where("estado", "==", "publicado"),
      orderBy("createdAt", "desc"),
    );
    const unsub = onSnapshot(q, (snap) => {
      const lista = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((v) => v.slug !== videoId)
        .slice(0, 4);
      setOtrosVideos(lista);
    });
    return unsub;
  }, [videoId]);

  useEffect(() => {
    if (!video) return;
    // Actualizar meta tags para compartir en redes sociales
    const setMeta = (prop, content, isName = false) => {
      const selector = isName
        ? `meta[name="${prop}"]`
        : `meta[property="${prop}"]`;
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement("meta");
        if (isName) el.setAttribute("name", prop);
        else el.setAttribute("property", prop);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    document.title = `${video.titulo} | Videos Soporte - Playcenter Universal`;
    setMeta("og:title", `${video.titulo} | Playcenter Universal`);
    setMeta("og:description", video.descripcionCorta || "");
    setMeta("og:image", video.thumbnailUrl || "");
    setMeta("og:url", window.location.href);
    setMeta("og:type", "video.other");
    setMeta("twitter:card", "summary_large_image", true);
    setMeta("twitter:title", `${video.titulo} | Playcenter Universal`, true);
    setMeta("twitter:description", video.descripcionCorta || "", true);
    setMeta("twitter:image", video.thumbnailUrl || "", true);
    setMeta("description", video.descripcionCorta || "", true);

    return () => {
      document.title = "Playcenter Universal";
    };
  }, [video]);

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
      >
        <svg
          className="animate-spin w-10 h-10 text-blue-500"
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

  if (!video) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center px-4 ${
          isDark ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <svg
          className="mb-5 opacity-30"
          width="64"
          height="64"
          fill="none"
          stroke={isDark ? "#9ca3af" : "#374151"}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 10l4.553-2.069A1 1 0 0121 8.868v6.264a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"
          />
        </svg>
        <h1
          className="text-xl font-bold mb-2 text-center"
          style={{ color: isDark ? "#f3f4f6" : "#111827" }}
        >
          Video no encontrado
        </h1>
        <p
          className="text-sm mb-6 text-center"
          style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
        >
          El video que buscas no existe o fue removido.
        </p>
        <Link
          to="/videos-soporte"
          className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white no-underline"
          style={{
            background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
          }}
        >
          Ver todos los videos
        </Link>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Breadcrumb */}
      <div
        className={`border-b ${
          isDark ? "border-gray-700/60" : "border-gray-200"
        }`}
        style={{
          background: isDark ? "rgba(17,24,39,0.98)" : "rgba(249,250,251,0.98)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-1.5 text-xs flex-wrap">
            <Link
              to="/"
              className="no-underline hover:text-blue-500 transition-colors"
              style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
            >
              Inicio
            </Link>
            <svg
              width="12"
              height="12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: isDark ? "#6b7280" : "#9ca3af" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <Link
              to="/videos-soporte"
              className="no-underline hover:text-blue-500 transition-colors"
              style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
            >
              Videos Soporte
            </Link>
            <svg
              width="12"
              height="12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: isDark ? "#6b7280" : "#9ca3af" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <span
              className="font-medium truncate max-w-[200px] sm:max-w-xs"
              style={{ color: isDark ? "#e5e7eb" : "#374151" }}
            >
              {video.titulo}
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex flex-col xl:flex-row gap-8">
          {/* ── Columna principal ── */}
          <div className="flex-1 min-w-0">
            {/* Video embed */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.4 }}
              className="rounded-2xl overflow-hidden"
              style={{
                boxShadow: isDark
                  ? "0 4px 24px rgba(0,0,0,0.5)"
                  : "0 4px 24px rgba(0,0,0,0.12)",
              }}
            >
              <div
                className="relative w-full"
                style={{ paddingBottom: "56.25%", background: "#000" }}
              >
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

            {/* Título y metadatos */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.4, delay: 0.08 }}
              className="mt-5"
            >
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span
                  className="text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{
                    background: isDark
                      ? "rgba(59,130,246,0.15)"
                      : "rgba(219,234,254,1)",
                    color: isDark ? "#93c5fd" : "#1d4ed8",
                  }}
                >
                  {video.categoria}
                </span>
                <span
                  className="text-xs flex items-center gap-1"
                  style={{ color: isDark ? "#6b7280" : "#9ca3af" }}
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {video.categoria}
                </span>
              </div>

              <h1
                className="text-xl sm:text-2xl font-bold leading-snug mb-2"
                style={{ color: isDark ? "#f9fafb" : "#111827" }}
              >
                {video.titulo}
              </h1>
            </motion.div>

            {/* Descripción larga */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.4, delay: 0.14 }}
              className="mt-6 rounded-xl p-5 sm:p-6"
              style={{
                background: isDark ? "#1f2937" : "#ffffff",
                border: isDark
                  ? "1px solid rgba(55,65,81,0.8)"
                  : "1px solid rgba(229,231,235,1)",
                boxShadow: isDark
                  ? "0 2px 8px rgba(0,0,0,0.3)"
                  : "0 1px 4px rgba(0,0,0,0.06)",
              }}
            >
              <h2
                className="text-base font-semibold mb-3 flex items-center gap-2"
                style={{ color: isDark ? "#f3f4f6" : "#111827" }}
              >
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  stroke="#3b82f6"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Descripción
              </h2>
              {(video.contenido || video.descripcionCorta || "")
                .split("\n\n")
                .filter(Boolean)
                .map((parrafo, i) => (
                  <p
                    key={i}
                    className="text-sm leading-relaxed mb-3 last:mb-0"
                    style={{ color: isDark ? "#d1d5db" : "#374151" }}
                  >
                    {parrafo.trim()}
                  </p>
                ))}
            </motion.div>

            {/* Información adicional */}
            {/* infoAdicional removed - field not in Firestore schema */}
            {false && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="mt-5 rounded-xl p-5 sm:p-6"
                style={{
                  background: isDark
                    ? "rgba(59,130,246,0.06)"
                    : "rgba(239,246,255,1)",
                  border: isDark
                    ? "1px solid rgba(59,130,246,0.2)"
                    : "1px solid rgba(191,219,254,1)",
                }}
              >
                <h2
                  className="text-base font-semibold mb-4 flex items-center gap-2"
                  style={{ color: isDark ? "#93c5fd" : "#1d4ed8" }}
                >
                  <svg
                    width="18"
                    height="18"
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
                  Consejos importantes
                </h2>
                <ul className="flex flex-col gap-2.5">
                  {video.infoAdicional.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <div
                        className="flex-shrink-0 rounded-full mt-0.5"
                        style={{
                          width: 20,
                          height: 20,
                          background: isDark
                            ? "rgba(59,130,246,0.2)"
                            : "rgba(219,234,254,1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <svg
                          width="10"
                          height="10"
                          fill="none"
                          stroke={isDark ? "#93c5fd" : "#2563eb"}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <span
                        className="text-sm leading-relaxed"
                        style={{ color: isDark ? "#d1d5db" : "#374151" }}
                      >
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Etiquetas */}
            {/* etiquetas removed - field not in Firestore schema */}
            {false && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ duration: 0.4, delay: 0.26 }}
                className="mt-5 flex flex-wrap gap-2 items-center"
              >
                <span
                  className="text-xs font-medium"
                  style={{ color: isDark ? "#6b7280" : "#9ca3af" }}
                >
                  Etiquetas:
                </span>
                {video.etiquetas.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-full"
                    style={{
                      background: isDark
                        ? "rgba(55,65,81,0.7)"
                        : "rgba(229,231,235,0.8)",
                      color: isDark ? "#d1d5db" : "#374151",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </motion.div>
            )}
          </div>

          {/* ── Columna lateral ── */}
          <aside className="xl:w-72 xl:flex-shrink-0">
            <div className="flex flex-col gap-5">
              {/* Botón volver */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ duration: 0.4 }}
              >
                <button
                  onClick={() => navigate("/videos-soporte")}
                  className="flex items-center gap-2 text-sm font-medium transition-colors duration-150"
                  style={{
                    color: isDark ? "#93c5fd" : "#2563eb",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  <svg
                    width="16"
                    height="16"
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
                  Todos los videos
                </button>
              </motion.div>

              {/* Panel contacto */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="rounded-xl p-5"
                style={{
                  background: isDark ? "#1f2937" : "#ffffff",
                  border: isDark
                    ? "1px solid rgba(55,65,81,0.8)"
                    : "1px solid rgba(229,231,235,1)",
                  boxShadow: isDark
                    ? "0 2px 8px rgba(0,0,0,0.3)"
                    : "0 1px 4px rgba(0,0,0,0.06)",
                }}
              >
                <h3
                  className="font-semibold text-sm mb-2"
                  style={{ color: isDark ? "#f3f4f6" : "#111827" }}
                >
                  ¿No resolviste tu duda?
                </h3>
                <p
                  className="text-xs leading-relaxed mb-4"
                  style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
                >
                  Nuestros técnicos pueden ayudarte directamente con cualquier
                  problema técnico o consulta de servicio.
                </p>
                <Link
                  to="/contacto"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-semibold text-white no-underline transition-opacity duration-150"
                  style={{
                    background:
                      "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    boxShadow: "0 2px 8px rgba(59,130,246,0.35)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  Contactar soporte
                </Link>
              </motion.div>

              {/* Otros videos */}
              {otrosVideos.length > 0 && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={fadeInUp}
                  transition={{ duration: 0.4, delay: 0.18 }}
                  className="rounded-xl p-5"
                  style={{
                    background: isDark ? "#1f2937" : "#ffffff",
                    border: isDark
                      ? "1px solid rgba(55,65,81,0.8)"
                      : "1px solid rgba(229,231,235,1)",
                    boxShadow: isDark
                      ? "0 2px 8px rgba(0,0,0,0.3)"
                      : "0 1px 4px rgba(0,0,0,0.06)",
                  }}
                >
                  <h3
                    className="font-semibold text-sm mb-3"
                    style={{ color: isDark ? "#f3f4f6" : "#111827" }}
                  >
                    Más videos
                  </h3>
                  <ul className="flex flex-col gap-3">
                    {otrosVideos.map((v) => (
                      <li key={v.id}>
                        <Link
                          to={`/videos-soporte/${v.slug}`}
                          className="flex gap-3 group no-underline"
                        >
                          <div
                            className="flex-shrink-0 rounded-lg overflow-hidden"
                            style={{ width: 72, height: 48 }}
                          >
                            <img
                              src={v.thumbnailUrl}
                              alt={v.titulo}
                              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                              onError={(e) => {
                                e.target.src =
                                  "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=200&q=80";
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-xs font-medium leading-snug line-clamp-2 transition-colors duration-150 group-hover:text-blue-500"
                              style={{ color: isDark ? "#e5e7eb" : "#374151" }}
                            >
                              {v.titulo}
                            </p>
                            <p
                              className="text-xs mt-1"
                              style={{ color: isDark ? "#6b7280" : "#9ca3af" }}
                            >
                              {v.categoria}
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/videos-soporte"
                    className="flex items-center justify-center gap-1.5 mt-4 text-xs font-medium no-underline transition-colors duration-150"
                    style={{ color: isDark ? "#93c5fd" : "#2563eb" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.opacity = "0.75")
                    }
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  >
                    Ver todos
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
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </motion.div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
