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

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function VideosSoporte() {
  const { isDark } = useTheme();
  const [categoriaActiva, setCategoriaActiva] = useState("Todas");
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

  const categorias = [
    "Todas",
    ...Array.from(new Set(videosData.map((v) => v.categoria).filter(Boolean))),
  ];

  const videosFiltrados =
    categoriaActiva === "Todas"
      ? videosData
      : videosData.filter((v) => v.categoria === categoriaActiva);

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Header de sección */}
      <div
        className={`border-b ${
          isDark ? "border-gray-700/60" : "border-gray-200"
        }`}
        style={{
          background: isDark
            ? "linear-gradient(135deg, rgba(17,24,39,0.98) 0%, rgba(31,41,55,0.98) 100%)"
            : "linear-gradient(135deg, rgba(239,246,255,1) 0%, rgba(255,255,255,1) 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="flex items-center justify-center rounded-xl"
                style={{
                  width: 44,
                  height: 44,
                  background:
                    "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                  boxShadow: "0 4px 12px rgba(59,130,246,0.35)",
                }}
              >
                <svg
                  width="22"
                  height="22"
                  fill="none"
                  stroke="#fff"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1
                className={`text-2xl sm:text-3xl font-bold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Videos Soporte
              </h1>
            </div>
            <p
              className={`text-sm sm:text-base max-w-xl ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Encuentra videos con información útil, recomendaciones y guías
              relacionadas con nuestros servicios.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex flex-col xl:flex-row gap-8">
          {/* ── Columna izquierda: lista de videos ── */}
          <div className="flex-1 min-w-0">
            {/* Filtro de categorías */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categorias.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoriaActiva(cat)}
                  className="px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200"
                  style={{
                    background:
                      categoriaActiva === cat
                        ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
                        : isDark
                          ? "rgba(55,65,81,0.7)"
                          : "rgba(229,231,235,0.8)",
                    color:
                      categoriaActiva === cat
                        ? "#ffffff"
                        : isDark
                          ? "#d1d5db"
                          : "#374151",
                    border:
                      categoriaActiva === cat
                        ? "none"
                        : "1px solid transparent",
                    boxShadow:
                      categoriaActiva === cat
                        ? "0 2px 8px rgba(59,130,246,0.4)"
                        : "none",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Grid de tarjetas de video */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {videosFiltrados.map((video, i) => (
                <motion.div
                  key={video.id}
                  initial="hidden"
                  animate="visible"
                  variants={fadeInUp}
                  transition={{ duration: 0.35, delay: i * 0.07 }}
                >
                  <Link
                    to={`/videos-soporte/${video.slug}`}
                    className="block group rounded-xl overflow-hidden transition-all duration-200 no-underline"
                    style={{
                      background: isDark ? "#1f2937" : "#ffffff",
                      border: isDark
                        ? "1px solid rgba(55,65,81,0.8)"
                        : "1px solid rgba(229,231,235,1)",
                      boxShadow: isDark
                        ? "0 2px 8px rgba(0,0,0,0.3)"
                        : "0 1px 4px rgba(0,0,0,0.06)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = isDark
                        ? "0 6px 20px rgba(59,130,246,0.2)"
                        : "0 6px 20px rgba(59,130,246,0.15)";
                      e.currentTarget.style.borderColor = isDark
                        ? "rgba(59,130,246,0.4)"
                        : "rgba(59,130,246,0.35)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = isDark
                        ? "0 2px 8px rgba(0,0,0,0.3)"
                        : "0 1px 4px rgba(0,0,0,0.06)";
                      e.currentTarget.style.borderColor = isDark
                        ? "rgba(55,65,81,0.8)"
                        : "rgba(229,231,235,1)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    {/* Thumbnail */}
                    <div
                      className="relative overflow-hidden"
                      style={{ aspectRatio: "16/9" }}
                    >
                      <img
                        src={video.thumbnailUrl}
                        alt={video.titulo}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        style={{ display: "block" }}
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=640&q=80";
                        }}
                      />
                      {/* Play overlay */}
                      <div
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        style={{ background: "rgba(0,0,0,0.3)" }}
                      >
                        <div
                          className="flex items-center justify-center rounded-full"
                          style={{
                            width: 48,
                            height: 48,
                            background: "rgba(255,255,255,0.9)",
                            boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
                          }}
                        >
                          <svg
                            width="20"
                            height="20"
                            fill="#2563eb"
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                      {/* Categoría badge */}
                      <span
                        className="absolute top-2 left-2 text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{
                          background: "rgba(37,99,235,0.85)",
                          color: "#fff",
                          fontSize: 10,
                        }}
                      >
                        {video.categoria}
                      </span>
                    </div>

                    {/* Texto */}
                    <div className="p-4">
                      <h3
                        className="font-semibold text-sm sm:text-base leading-snug mb-1.5 line-clamp-2"
                        style={{ color: isDark ? "#f3f4f6" : "#111827" }}
                      >
                        {video.titulo}
                      </h3>
                      <p
                        className="text-xs sm:text-sm leading-relaxed line-clamp-2"
                        style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
                      >
                        {video.descripcionCorta}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {loadingVideos && (
              <div className="col-span-2 flex justify-center py-16">
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

            {!loadingVideos && videosFiltrados.length === 0 && (
              <div className="text-center py-16">
                <svg
                  className="mx-auto mb-4 opacity-30"
                  width="56"
                  height="56"
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
                <p
                  className="text-sm"
                  style={{ color: isDark ? "#6b7280" : "#9ca3af" }}
                >
                  No hay videos en esta categoría.
                </p>
              </div>
            )}
          </div>

          {/* ── Columna derecha: panel de ayuda ── */}
          <aside className="xl:w-72 xl:flex-shrink-0">
            <div className="sticky top-8 flex flex-col gap-4">
              {/* Panel de contacto */}
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
                <div className="flex items-center gap-2.5 mb-4">
                  <div
                    className="flex items-center justify-center rounded-lg flex-shrink-0"
                    style={{
                      width: 36,
                      height: 36,
                      background:
                        "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      fill="none"
                      stroke="#fff"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <h2
                    className="font-semibold text-sm"
                    style={{ color: isDark ? "#f3f4f6" : "#111827" }}
                  >
                    ¿Necesitas ayuda?
                  </h2>
                </div>
                <p
                  className="text-xs leading-relaxed mb-4"
                  style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
                >
                  Nuestro equipo de soporte está listo para ayudarte con
                  cualquier consulta técnica o de servicio.
                </p>
                <Link
                  to="/contacto"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200 no-underline"
                  style={{
                    background:
                      "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    boxShadow: "0 2px 8px rgba(59,130,246,0.35)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "0.9";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "1";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
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
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Contáctanos
                </Link>
              </motion.div>

              {/* Panel enlaces útiles */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ duration: 0.4, delay: 0.2 }}
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
                <h2
                  className="font-semibold text-sm mb-3"
                  style={{ color: isDark ? "#f3f4f6" : "#111827" }}
                >
                  Recursos útiles
                </h2>
                <ul className="flex flex-col gap-2.5">
                  {[
                    {
                      label: "Nosotros",
                      to: "/nosotros",
                      icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                    },
                    {
                      label: "Estafetas",
                      to: "/estafetas",
                      icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z",
                    },
                    {
                      label: "Nuestras tiendas",
                      to: "/tiendas",
                      icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5",
                    },
                    {
                      label: "Contáctanos",
                      to: "/contacto",
                      icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
                    },
                  ].map((item) => (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        className="flex items-center gap-2.5 text-xs py-1.5 px-1 rounded-lg transition-all duration-150 no-underline"
                        style={{ color: isDark ? "#9ca3af" : "#4b5563" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "#3b82f6";
                          e.currentTarget.style.background = isDark
                            ? "rgba(59,130,246,0.08)"
                            : "rgba(59,130,246,0.06)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = isDark
                            ? "#9ca3af"
                            : "#4b5563";
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          className="flex-shrink-0"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={item.icon}
                          />
                        </svg>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Panel de total videos */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="rounded-xl p-4 text-center"
                style={{
                  background: isDark
                    ? "rgba(59,130,246,0.08)"
                    : "rgba(239,246,255,1)",
                  border: isDark
                    ? "1px solid rgba(59,130,246,0.2)"
                    : "1px solid rgba(191,219,254,1)",
                }}
              >
                <p className="text-2xl font-bold" style={{ color: "#2563eb" }}>
                  {videosData.length}
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: isDark ? "#93c5fd" : "#3b82f6" }}
                >
                  videos disponibles
                </p>
              </motion.div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
