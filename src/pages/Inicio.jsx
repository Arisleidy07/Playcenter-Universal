import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaWhatsapp,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa";
import SliderAnuncios from "../components/SliderAnuncios";
import SliderAnunciosMovil from "../components/SliderAnunciosMovil";
import { useProductsByCategories } from "../hooks/useProducts";
import { useTheme } from "../context/ThemeContext";
import Anim from "../components/anim";

// Animación sutil para bloques y banners
const fadeIn = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};

const trailImages = Array.from(
  { length: 17 },
  (_, i) => `/animacion/${i + 1}.png`
);

function Inicio() {
  const { productsByCategory, categories, loading, error } =
    useProductsByCategories();
  const { theme, isDark } = useTheme();
  const videoRef = React.useRef(null);

  // Forzar recarga del video cuando cambie el tema
  React.useEffect(() => {
    const videoSrc =
      theme === "dark"
        ? "/videos/pcu-intro-negro.mp4"
        : "/videos/pcu-intro-blanco.mp4";

    if (videoRef.current) {
      // Cambiar el src directamente
      const source = videoRef.current.querySelector("source");
      if (source) {
        source.src = videoSrc;
      }
      videoRef.current.load();
      videoRef.current
        .play()
        .catch((err) => console.log("Video autoplay:", err));
    }
  }, [theme]);

  // Logging para debug - mostrar categorías disponibles
  React.useEffect(() => {
    if (categories.length > 0) {
      console.log("🎯 CATEGORÍAS DISPONIBLES EN INICIO:");
      console.log("════════════════════════════════════════════════════════");
      console.table(
        categories.map((c) => ({
          "📌 Nombre": c.nombre,
          "🔗 Ruta": c.ruta,
          "🆔 ID": c.id,
          "📦 Productos": (productsByCategory[c.id] || []).length,
        }))
      );
      console.log("════════════════════════════════════════════════════════");
      console.log(
        "💡 COPIA las rutas exactas de arriba para usarlas en getProductsByRoute()"
      );
      console.log("════════════════════════════════════════════════════════");
    }
  }, [categories, productsByCategory]);

  if (loading) {
    return null; // sin animación ni texto durante la carga
  }

  if (error) {
    return (
      <div
        style={{
          backgroundColor: isDark ? "#000000" : "#ffffff",
          minHeight: "100vh",
        }}
      >
        <div className="text-center text-danger">
          <p className="fs-5">Error cargando productos</p>
          <p className="small">{error}</p>
        </div>
      </div>
    );
  }

  // Helpers nube
  const pickUrl = (u) => {
    try {
      if (!u) return "";
      if (typeof u === "string") return u;
      if (typeof u === "object" && u !== null) return u.url || "";
      return String(u || "");
    } catch {
      return "";
    }
  };
  const getMainImage = (p) => {
    // 1) Imagen principal nueva
    const principalNueva = pickUrl(p?.imagenPrincipal?.[0]);
    if (principalNueva) return principalNueva;

    // 2) Legacy principal
    const principalLegacy = pickUrl(p?.imagen);
    if (principalLegacy) return principalLegacy;

    // 3) Media (buscar una imagen)
    const mediaArr = Array.isArray(p?.media) ? p.media : [];
    const mediaImg = mediaArr.find((m) => {
      const t = (m?.type || "").toLowerCase();
      return (
        pickUrl(m) &&
        (!t || t.includes("image") || t === "img" || t === "photo")
      );
    });
    if (mediaImg) return pickUrl(mediaImg);

    // 4) Galería (primera imagen)
    const galArr = Array.isArray(p?.galeriaImagenes) ? p.galeriaImagenes : [];
    const galImg = galArr.find((g) => {
      const t = (g?.type || "").toLowerCase();
      return (
        pickUrl(g) &&
        (!t || t.includes("image") || t === "img" || t === "photo")
      );
    });
    if (galImg) return pickUrl(galImg);

    // 5) Legacy imagenes[] (string)
    const imgsLegacy = Array.isArray(p?.imagenes) ? p.imagenes : [];
    if (imgsLegacy.length > 0) return pickUrl(imgsLegacy[0]);

    // 6) Variantes: intentar imagen principal/legacy/media de la primera variante
    const vars = Array.isArray(p?.variantes) ? p.variantes : [];
    for (const v of vars) {
      const vPrincipal = pickUrl(v?.imagenPrincipal?.[0]);
      if (vPrincipal) return vPrincipal;
      const vLegacy = pickUrl(v?.imagen);
      if (vLegacy) return vLegacy;
      const vMediaArr = Array.isArray(v?.media) ? v.media : [];
      const vMediaImg = vMediaArr.find((mm) => {
        const t = (mm?.type || "").toLowerCase();
        return (
          pickUrl(mm) &&
          (!t || t.includes("image") || t === "img" || t === "photo")
        );
      });
      if (vMediaImg) return pickUrl(vMediaImg);
      const vGalArr = Array.isArray(v?.galeriaImagenes)
        ? v.galeriaImagenes
        : [];
      const vGalImg = vGalArr.find((gg) => {
        const t = (gg?.type || "").toLowerCase();
        return (
          pickUrl(gg) &&
          (!t || t.includes("image") || t === "img" || t === "photo")
        );
      });
      if (vGalImg) return pickUrl(vGalImg);
    }

    return "";
  };
  // Buscar categoría por ruta o por nombre (más flexible)
  const getCategoryByRoute = (rutaBuscada) => {
    // Primero intentar por ruta exacta
    let cat = categories.find((c) => (c?.ruta || "") === rutaBuscada);
    if (cat) return cat;

    // Si no encuentra, intentar por nombre normalizado
    const normalizarTexto = (texto) =>
      (texto || "")
        .toLowerCase()
        .replace(/á/g, "a")
        .replace(/é/g, "e")
        .replace(/í/g, "i")
        .replace(/ó/g, "o")
        .replace(/ú/g, "u")
        .replace(/ñ/g, "n")
        .replace(/[^a-z0-9]/g, "");

    const rutaNormalizada = normalizarTexto(rutaBuscada);
    cat = categories.find((c) => {
      const nombreNormalizado = normalizarTexto(c.nombre);
      const rutaCatNormalizada = normalizarTexto(c.ruta);
      return (
        nombreNormalizado === rutaNormalizada ||
        rutaCatNormalizada === rutaNormalizada ||
        nombreNormalizado.includes(rutaNormalizada) ||
        rutaNormalizada.includes(nombreNormalizado)
      );
    });

    return cat;
  };

  const getProductsByRoute = (ruta) => {
    const cat = getCategoryByRoute(ruta);
    if (!cat) {
      console.warn(`❌ Categoría no encontrada para ruta: "${ruta}"`);
      console.log(
        "💡 Sugerencia: Verifica las categorías disponibles en la tabla arriba"
      );
      return [];
    }
    const productos = productsByCategory[cat.id] || [];
    return productos;
  };

  return (
    <div
      className="min-vh-100"
      style={{
        paddingTop: "var(--content-offset, 120px)",
        backgroundColor: isDark ? "#000000" : "#ffffff",
      }}
    >
      {/* SLIDER MÓVIL - Solo teléfonos (< 640px) */}
      <motion.div
        className="d-block d-sm-none w-100 mx-auto"
        style={{ marginTop: 0, marginBottom: 0, padding: 0 }}
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <SliderAnunciosMovil />
      </motion.div>

      {/* VIDEO EN TABLET Y DESKTOP - Visible desde 640px (sm:) */}
      <div
        className="d-none d-sm-block w-100"
        style={{ marginTop: 0, marginBottom: 0, padding: 0 }}
      >
        <video
          key={theme}
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="w-100 h-auto"
          style={{
            marginTop: 0,
            marginBottom: 0,
            padding: 0,
            display: "block",
            verticalAlign: "top",
            objectFit: "cover",
          }}
        >
          <source
            src={
              theme === "dark"
                ? "/videos/pcu-intro-negro.mp4"
                : "/videos/pcu-intro-blanco.mp4"
            }
            type="video/mp4"
          />
        </video>
      </div>

      {/* SLIDER GRANDE EN TABLET Y DESKTOP - Visible desde 640px (sm:) - MÁS SEPARADO */}
      <motion.div
        className="d-none d-sm-block w-100 container-fluid px-2 px-sm-4 mt-5"
        style={{ maxWidth: "95%", maxWidthLg: "1600px" }}
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <SliderAnuncios />
      </motion.div>

      {/* BLOQUES CUADRADOS - CATEGORÍAS DINÁMICAS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-[95%] lg:max-w-[1600px] mx-auto px-2 sm:px-4 mt-8 sm:mt-16">
        {categories.slice(0, 4).map((category, idx) => {
          const categoryProducts = productsByCategory[category.id] || [];
          const featuredProducts = categoryProducts.slice(0, 4);

          return (
            <motion.div
              key={category.id}
              className="bg-white dark:bg-black rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition min-h-[320px] max-h-[400px] flex flex-col justify-between p-4 sm:p-5 border border-gray-200 dark:border-gray-800"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
            >
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-indigo-700 dark:text-indigo-400 tracking-tight">
                {category.nombre}
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:gap-3 flex-grow">
                {featuredProducts.map((product) => {
                  const img =
                    getMainImage(product) || "/placeholder-product.svg";
                  return (
                    <Link to={`/producto/${product.id}`} key={product.id}>
                      <div
                        className="w-full aspect-[4/3] bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center p-1 sm:p-2"
                        style={{ maxHeight: "120px" }}
                      >
                        <img
                          src={img}
                          alt={product.nombre}
                          className="max-w-full max-h-full w-auto h-auto object-contain group-hover:scale-105 transition-transform"
                          style={{ maxHeight: "110px" }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/placeholder-product.svg";
                          }}
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
              <Link
                to={`/Productos/${category.ruta}`}
                className="text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm mt-2 sm:mt-3 hover:underline font-medium"
              >
                Explora {category.nombre} →
              </Link>
            </motion.div>
          );
        })}
      </section>

      {/* BANNER afisionados - SOLO DESKTOP */}
      <motion.div
        className="d-none d-xl-block container-fluid px-4 mt-5"
        style={{ maxWidth: "1600px" }}
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <Link
          to="/Productos/coleccionables"
          className="d-block overflow-hidden rounded-4 shadow-lg hover-shadow text-decoration-none"
        >
          <img
            src="/ads/aficionados.png"
            alt="Ver Nuestras colecciones"
            className="w-100 h-auto hover-lift"
            style={{ objectFit: "cover" }}
          />
        </Link>
      </motion.div>

      {/* BANNERS GRANDES - SOLO COMPUTADORA */}
      <section
        className="d-none d-xl-block container-fluid px-4 mt-5"
        style={{ maxWidth: "1600px" }}
      >
        <div className="row g-4">
          {[
            {
              to: "/Productos/retro-consolas",
              src: "/ads/retro.png",
              alt: "Retro Consolas",
            },
            {
              to: "/Productos/camaras",
              src: "/ads/camaras.png",
              alt: "Cámaras",
            },
          ].map((banner, idx) => (
            <motion.div
              key={idx}
              className="col-12 col-md-6"
              whileHover={{ scale: 1.01 }}
            >
              <div
                className="overflow-hidden rounded-4 shadow-lg hover-shadow"
                style={{ height: "400px" }}
              >
                <Link
                  to={banner.to}
                  className="d-block w-100 h-100 text-decoration-none"
                >
                  <img
                    src={banner.src}
                    alt={banner.alt}
                    className="w-100 h-100 hover-lift"
                    style={{ objectFit: "cover", objectPosition: "center" }}
                  />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CATEGORÍAS DESTACADAS */}
      <motion.section
        className="container-fluid mt-4 px-3 px-md-4"
        style={{ maxWidth: "1600px" }}
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <div
          className="shadow"
          style={{
            backgroundColor: isDark ? "#1e293b" : "#ffffff",
            border: isDark
              ? "1px solid rgba(255, 255, 255, 0.1)"
              : "1px solid rgba(0, 0, 0, 0.08)",
            borderRadius: "0.5rem",
            height: "auto",
            width: "100%",
          }}
        >
          <div className="card-body p-2 p-md-3">
            <div className="flex items-center justify-between mb-2">
              <h2
                className="h6 fw-bold text-dark dark:text-gray-100 mb-0"
                style={{ fontSize: "clamp(14px, 2vw, 18px)" }}
              >
                Explora nuestras categorías
              </h2>
              <Link
                to="/Productos"
                className="text-primary dark:text-blue-400 text-decoration-none fw-medium text-xs sm:text-sm"
                style={{ fontSize: "clamp(11px, 2vw, 13px)" }}
              >
                Ver todas →
              </Link>
            </div>
            <div
              className="d-flex flex-nowrap gap-2 gap-md-3 overflow-x-auto pb-1"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: isDark ? "#475569 #1e293b" : "#cbd5e1 #f1f5f9",
                WebkitOverflowScrolling: "touch",
                alignItems: "flex-start",
                minHeight: "unset",
              }}
            >
              {[
                {
                  to: "/Productos/audifonos",
                  src: "/ads/audifonoscate.png",
                  alt: "Audífonos",
                },
                {
                  to: "/Productos/mouses",
                  src: "/ads/mousecate.png",
                  alt: "Mouses",
                },
                {
                  to: "/Productos/teclados",
                  src: "/ads/tecladocate.png",
                  alt: "Teclados",
                },
                {
                  to: "/Productos/camaras",
                  src: "/ads/camaracate.png",
                  alt: "Cámaras",
                },
                {
                  to: "/Productos/discos-duros",
                  src: "/ads/discodurocate.png",
                  alt: "Discos Duros",
                },
                {
                  to: "/Productos/controles",
                  src: "/ads/controlcate.png",
                  alt: "Controles",
                },
              ].map((cat, i) => (
                <Link
                  to={cat.to}
                  key={cat.alt}
                  className="text-decoration-none flex-shrink-0"
                >
                  <div
                    className="rounded-3 overflow-hidden d-flex align-items-center justify-content-center w-[140px] h-[140px] md:w-[180px] md:h-[180px]"
                    style={{
                      backgroundColor: isDark
                        ? "rgba(255, 255, 255, 0.03)"
                        : "rgba(0, 0, 0, 0.02)",
                      border: isDark
                        ? "1px solid rgba(255, 255, 255, 0.08)"
                        : "1px solid rgba(0, 0, 0, 0.06)",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <img
                      src={cat.src}
                      alt={cat.alt}
                      className="w-100 h-100 object-contain hover-lift"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* BANNER ESTAFETAS - SOLO DESKTOP */}
      <motion.div
        className="d-none d-xl-block container-fluid px-4 mt-5"
        style={{ maxWidth: "1600px" }}
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <Link
          to="/estafetas"
          className="d-block overflow-hidden rounded-4 shadow-lg hover-shadow text-decoration-none"
        >
          <img
            src="/ads/ESTAFETAS.png"
            alt="Ver Nuestras Estafetas"
            className="w-100 h-auto hover-lift"
            style={{ objectFit: "cover" }}
          />
        </Link>
      </motion.div>

      {/* GALERÍA DESTACADA DE PRODUCTOS */}
      <motion.section
        className="container-fluid mt-4 px-3 px-md-4"
        style={{ maxWidth: "1600px" }}
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <div
          className="shadow"
          style={{
            backgroundColor: isDark ? "#1e293b" : "#ffffff",
            border: isDark
              ? "1px solid rgba(255, 255, 255, 0.1)"
              : "1px solid rgba(0, 0, 0, 0.08)",
            borderRadius: "0.5rem",
            height: "auto",
            width: "100%",
          }}
        >
          <div className="card-body p-2 p-md-3">
            <div className="flex items-center justify-between mb-2">
              <h2
                className="h6 fw-bold text-dark dark:text-gray-100 mb-0"
                style={{ fontSize: "clamp(14px, 2vw, 18px)" }}
              >
                Descubre nuestros productos
              </h2>
              <Link
                to="/Productos"
                className="text-primary dark:text-blue-400 text-decoration-none fw-medium text-xs sm:text-sm"
                style={{ fontSize: "clamp(11px, 2vw, 13px)" }}
              >
                Ver más →
              </Link>
            </div>
            <div
              className="d-flex flex-nowrap gap-2 gap-md-3 overflow-x-auto pb-1"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: isDark ? "#475569 #1e293b" : "#cbd5e1 #f1f5f9",
                WebkitOverflowScrolling: "touch",
                alignItems: "flex-start",
                minHeight: "unset",
              }}
            >
              {Object.values(productsByCategory)
                .flat()
                .slice(0, 10)
                .map((producto) => {
                  const img =
                    getMainImage(producto) || "/placeholder-product.svg";
                  return (
                    <Link
                      to={`/producto/${producto.id}`}
                      key={producto.id}
                      className="text-decoration-none flex-shrink-0"
                      title={producto.nombre}
                    >
                      <div
                        className="rounded-3 overflow-hidden d-flex align-items-center justify-content-center w-[140px] h-[140px] md:w-[180px] md:h-[180px]"
                        style={{
                          backgroundColor: isDark
                            ? "rgba(255, 255, 255, 0.03)"
                            : "rgba(0, 0, 0, 0.02)",
                          border: isDark
                            ? "1px solid rgba(255, 255, 255, 0.08)"
                            : "1px solid rgba(0, 0, 0, 0.06)",
                          backdropFilter: "blur(10px)",
                        }}
                      >
                        <img
                          src={img}
                          alt={producto.nombre}
                          className="w-100 h-100 object-contain hover-lift"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/placeholder-product.svg";
                          }}
                        />
                      </div>
                    </Link>
                  );
                })}
            </div>
          </div>
        </div>
      </motion.section>

      {/* SLIDER HOGAR INTELIGENTE (dinámico desde Firestore) */}
      <motion.section
        className="container-fluid mt-4 px-3 px-md-4"
        style={{ maxWidth: "1600px" }}
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <div
          className="shadow"
          style={{
            backgroundColor: isDark ? "#1e293b" : "#ffffff",
            border: isDark
              ? "1px solid rgba(255, 255, 255, 0.1)"
              : "1px solid rgba(0, 0, 0, 0.08)",
            borderRadius: "0.5rem",
            height: "auto",
            width: "100%",
          }}
        >
          <div className="card-body p-2 p-md-3">
            <div className="flex items-center justify-between mb-2">
              <h2
                className="h6 fw-bold text-dark dark:text-gray-100 mb-0"
                style={{ fontSize: "clamp(12px, 2vw, 16px)" }}
              >
                Hogar Inteligente en Oferta
              </h2>
              <Link
                to="/Productos/hogar-inteligente"
                className="text-primary dark:text-blue-400 text-decoration-none fw-medium text-xs sm:text-sm"
                style={{ fontSize: "clamp(11px, 2vw, 13px)" }}
              >
                Ver más →
              </Link>
            </div>
            <div
              className="d-flex flex-nowrap gap-2 gap-md-3 overflow-x-auto pb-1"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: isDark ? "#475569 #1e293b" : "#cbd5e1 #f1f5f9",
                WebkitOverflowScrolling: "touch",
                alignItems: "flex-start",
                minHeight: "unset",
              }}
            >
              {getProductsByRoute("hogar-inteligente")
                .slice(0, 10)
                .map((p) => {
                  const img = getMainImage(p) || "/placeholder-product.svg";
                  return (
                    <Link
                      to={`/producto/${p.id}`}
                      className="text-decoration-none flex-shrink-0"
                      key={p.id}
                    >
                      <div
                        className="rounded-3 overflow-hidden d-flex align-items-center justify-content-center w-[140px] h-[140px] md:w-[180px] md:h-[180px]"
                        style={{
                          backgroundColor: isDark
                            ? "rgba(255, 255, 255, 0.03)"
                            : "rgba(0, 0, 0, 0.02)",
                          border: isDark
                            ? "1px solid rgba(255, 255, 255, 0.08)"
                            : "1px solid rgba(0, 0, 0, 0.06)",
                          backdropFilter: "blur(10px)",
                        }}
                      >
                        <img
                          src={img}
                          alt={p.nombre}
                          className="w-100 h-100 object-contain hover-lift"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/placeholder-product.svg";
                          }}
                        />
                      </div>
                    </Link>
                  );
                })}
            </div>
          </div>
        </div>
      </motion.section>

      {/* TU RINCÓN VARIADO (dinámico desde Firestore) */}
      <motion.section
        className="container-fluid mt-4 px-3 px-md-4"
        style={{ maxWidth: "1600px" }}
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <div
          className="shadow"
          style={{
            backgroundColor: isDark ? "#1e293b" : "#ffffff",
            border: isDark
              ? "1px solid rgba(255, 255, 255, 0.1)"
              : "1px solid rgba(0, 0, 0, 0.08)",
            borderRadius: "0.5rem",
            height: "auto",
            width: "100%",
          }}
        >
          <div className="card-body p-2 p-md-3">
            <div className="flex items-center justify-between mb-2">
              <h2
                className="h6 fw-bold text-dark dark:text-gray-100 mb-0"
                style={{ fontSize: "clamp(12px, 2vw, 16px)" }}
              >
                Tu Rincón Variado
              </h2>
              <Link
                to="/Productos/tu-rincon-variado"
                className="text-primary dark:text-blue-400 text-decoration-none fw-medium text-xs sm:text-sm"
                style={{ fontSize: "clamp(11px, 2vw, 13px)" }}
              >
                Ver más →
              </Link>
            </div>
            <div
              className="d-flex flex-nowrap gap-2 gap-md-3 overflow-x-auto pb-1"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: isDark ? "#475569 #1e293b" : "#cbd5e1 #f1f5f9",
                WebkitOverflowScrolling: "touch",
                alignItems: "flex-start",
                minHeight: "unset",
              }}
            >
              {getProductsByRoute("tu-rincon-variado")
                .slice(0, 12)
                .map((p) => {
                  const img = getMainImage(p) || "/placeholder-product.svg";
                  return (
                    <Link
                      to={`/producto/${p.id}`}
                      key={p.id}
                      className="text-decoration-none flex-shrink-0"
                      title={p.nombre}
                    >
                      <div
                        className="rounded-3 overflow-hidden d-flex align-items-center justify-content-center w-[140px] h-[140px] md:w-[180px] md:h-[180px]"
                        style={{
                          backgroundColor: isDark
                            ? "rgba(255, 255, 255, 0.03)"
                            : "rgba(0, 0, 0, 0.02)",
                          border: isDark
                            ? "1px solid rgba(255, 255, 255, 0.08)"
                            : "1px solid rgba(0, 0, 0, 0.06)",
                          backdropFilter: "blur(10px)",
                        }}
                      >
                        <img
                          src={img}
                          alt={p.nombre}
                          className="w-100 h-100 object-contain hover-lift"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/placeholder-product.svg";
                          }}
                        />
                      </div>
                    </Link>
                  );
                })}
            </div>
          </div>
        </div>
      </motion.section>

      {/* DOBLE BANNER */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[1600px] mx-auto px-4 mt-16">
        {[
          {
            to: "/Productos/consolas",
            src: "/ads/nintendoswtitchads.png",
            alt: "Consolas",
          },
          {
            to: "/Productos/controles",
            src: "/ads/controlads.png",
            alt: "Controles",
          },
        ].map((banner, idx) => (
          <motion.div
            key={banner.alt}
            className="overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition aspect-[16/9]"
            whileHover={{ scale: 1.01 }}
          >
            <Link to={banner.to} className="block w-full h-full">
              <img
                src={banner.src}
                alt={banner.alt}
                className="w-full h-full object-contain object-center hover:scale-105 transition-transform duration-400 bg-black"
              />
            </Link>
          </motion.div>
        ))}
      </section>

      {/* BLOQUES: Cámaras, Discos Duros, Memorias USB, Cables (dinámicos desde Firestore) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-[95%] lg:max-w-[1600px] mx-auto px-2 sm:px-4 mt-8 sm:mt-16">
        {/* Cámaras de Vigilancia */}
        <motion.div
          className="bg-white dark:bg-black rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition min-h-[320px] max-h-[400px] flex flex-col justify-between p-4 sm:p-5 border border-gray-200 dark:border-gray-800"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
        >
          <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-indigo-700 dark:text-indigo-400 tracking-tight">
            Cámaras de Vigilancia
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 flex-grow">
            {getProductsByRoute("camaras")
              .slice(0, 4)
              .map((p) => (
                <Link to={`/producto/${p.id}`} key={p.id}>
                  <div
                    className="w-full aspect-[4/3] bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center p-1 sm:p-2"
                    style={{ maxHeight: "120px" }}
                  >
                    <img
                      src={getMainImage(p) || "/placeholder-product.svg"}
                      alt={p.nombre}
                      className="max-w-full max-h-full w-auto h-auto object-contain group-hover:scale-105 transition-transform"
                      style={{ maxHeight: "110px" }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/placeholder-product.svg";
                      }}
                    />
                  </div>
                </Link>
              ))}
          </div>
          <Link
            to="/Productos/camaras"
            className="text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm mt-2 sm:mt-3 hover:underline font-medium"
          >
            Explora nuestras Cámaras de Vigilancia →
          </Link>
        </motion.div>

        {/* Discos Duros */}
        <motion.div
          className="bg-white dark:bg-black rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition min-h-[320px] max-h-[400px] flex flex-col justify-between p-4 sm:p-5 border border-gray-200 dark:border-gray-800"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
        >
          <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-indigo-700 dark:text-indigo-400 tracking-tight">
            Discos Duros
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 flex-grow">
            {getProductsByRoute("discos-duros")
              .slice(0, 4)
              .map((p) => (
                <Link to={`/producto/${p.id}`} key={p.id}>
                  <div
                    className="w-full aspect-[4/3] bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center p-1 sm:p-2"
                    style={{ maxHeight: "120px" }}
                  >
                    <img
                      src={getMainImage(p) || "/placeholder-product.svg"}
                      alt={p.nombre}
                      className="max-w-full max-h-full w-auto h-auto object-contain hover:scale-105 transition-transform"
                      style={{ maxHeight: "110px" }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/placeholder-product.svg";
                      }}
                    />
                  </div>
                </Link>
              ))}
          </div>
          <Link
            to="/Productos/discos-duros"
            className="text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm mt-2 sm:mt-3 hover:underline font-medium"
          >
            Explora nuestros Discos Duros →
          </Link>
        </motion.div>

        {/* Memorias USB */}
        <motion.div
          className="bg-white dark:bg-black rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition min-h-[320px] max-h-[400px] flex flex-col justify-between p-4 sm:p-5 border border-gray-200 dark:border-gray-800"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
        >
          <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-indigo-700 dark:text-indigo-400 tracking-tight">
            Memorias USB
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 flex-grow">
            {getProductsByRoute("memorias-usb")
              .slice(0, 4)
              .map((p) => (
                <Link to={`/producto/${p.id}`} key={p.id}>
                  <div
                    className="w-full aspect-[4/3] bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center p-1 sm:p-2"
                    style={{ maxHeight: "120px" }}
                  >
                    <img
                      src={getMainImage(p) || "/placeholder-product.svg"}
                      alt={p.nombre}
                      className="max-w-full max-h-full w-auto h-auto object-contain hover:scale-105 transition-transform"
                      style={{ maxHeight: "110px" }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/placeholder-product.svg";
                      }}
                    />
                  </div>
                </Link>
              ))}
          </div>
          <Link
            to="/Productos/memorias-usb"
            className="text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm mt-2 sm:mt-3 hover:underline font-medium"
          >
            Explora nuestras Memorias USB →
          </Link>
        </motion.div>

        {/* Cables */}
        <motion.div
          className="bg-white dark:bg-black rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition min-h-[320px] max-h-[400px] flex flex-col justify-between p-4 sm:p-5 border border-gray-200 dark:border-gray-800"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
        >
          <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-indigo-700 dark:text-indigo-400 tracking-tight">
            Cables
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 flex-grow">
            {getProductsByRoute("cables")
              .slice(0, 4)
              .map((p) => (
                <Link to={`/producto/${p.id}`} key={p.id}>
                  <div
                    className="w-full aspect-[4/3] bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center p-1 sm:p-2"
                    style={{ maxHeight: "120px" }}
                  >
                    <img
                      src={getMainImage(p) || "/placeholder-product.svg"}
                      alt={p.nombre || "Cable"}
                      className="max-w-full max-h-full w-auto h-auto object-contain hover:scale-105 transition-transform"
                      style={{ maxHeight: "110px" }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/placeholder-product.svg";
                      }}
                    />
                  </div>
                </Link>
              ))}
          </div>
          <Link
            to="/Productos/cables"
            className="text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm mt-2 sm:mt-3 hover:underline font-medium"
          >
            Explora nuestros Cables →
          </Link>
        </motion.div>
      </section>

      {/* ANIMACIÓN */}
      <div className="max-w-[1600px] mx-auto mt-20 px-4">
        <Anim />
      </div>

      {/* CONTACTO - DISEÑO MODERNO */}
      <motion.section
        className="container-fluid px-3 px-md-4 py-5 mt-5"
        style={{ maxWidth: "1400px" }}
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <div className="text-center mb-4 mb-md-5">
          <h2
            className="h3 h2-md fw-bold mb-2 mb-md-3"
            style={{
              color: isDark ? "#f1f5f9" : "#1e293b",
              fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
            }}
          >
            ¿Tienes dudas?{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Contáctanos ahora
            </span>
          </h2>
          <p
            className="text-muted mb-0"
            style={{
              fontSize: "clamp(0.875rem, 2vw, 1.1rem)",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            Atención rápida y profesional. Estamos aquí para ayudarte.
          </p>
        </div>

        {/* Contenedor principal con gradiente */}
        <div
          className="rounded-4 p-3 p-md-4 p-lg-5 shadow-lg"
          style={{
            background: isDark
              ? "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)"
              : "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
            border: `2px solid ${isDark ? "#334155" : "#cbd5e1"}`,
          }}
        >
          {/* Grid de información */}
          <div className="row g-3 g-md-4 mb-4">
            {/* Dirección */}
            <div className="col-12 col-md-6">
              <div
                className="h-100 rounded-3 p-3 p-md-4 d-flex align-items-center gap-3 shadow-sm"
                style={{
                  backgroundColor: isDark ? "#1e293b" : "#ffffff",
                  border: `1px solid ${isDark ? "#475569" : "#e2e8f0"}`,
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 16px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "";
                }}
              >
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: "48px",
                    height: "48px",
                    background:
                      "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                  }}
                >
                  <FaMapMarkerAlt className="text-white" size={20} />
                </div>
                <div className="flex-grow-1">
                  <p className="small text-muted mb-1 fw-medium">Ubicación</p>
                  <p
                    className="mb-0 fw-semibold"
                    style={{
                      color: isDark ? "#f1f5f9" : "#1e293b",
                      fontSize: "clamp(0.8rem, 1.5vw, 0.95rem)",
                    }}
                  >
                    Av. Estrella Sadhalá, Santiago
                  </p>
                </div>
              </div>
            </div>

            {/* Teléfono Tienda */}
            <div className="col-12 col-md-6">
              <div
                className="h-100 rounded-3 p-3 p-md-4 d-flex align-items-center gap-3 shadow-sm"
                style={{
                  backgroundColor: isDark ? "#1e293b" : "#ffffff",
                  border: `1px solid ${isDark ? "#475569" : "#e2e8f0"}`,
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 16px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "";
                }}
              >
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: "48px",
                    height: "48px",
                    background:
                      "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  }}
                >
                  <FaPhone className="text-white" size={18} />
                </div>
                <div className="flex-grow-1">
                  <p className="small text-muted mb-1 fw-medium">Tienda</p>
                  <p
                    className="mb-0 fw-semibold"
                    style={{
                      color: isDark ? "#f1f5f9" : "#1e293b",
                      fontSize: "clamp(0.8rem, 1.5vw, 0.95rem)",
                    }}
                  >
                    +1 (849)-635-7000
                  </p>
                </div>
              </div>
            </div>

            {/* Teléfono Internet */}
            <div className="col-12 col-md-6">
              <div
                className="h-100 rounded-3 p-3 p-md-4 d-flex align-items-center gap-3 shadow-sm"
                style={{
                  backgroundColor: isDark ? "#1e293b" : "#ffffff",
                  border: `1px solid ${isDark ? "#475569" : "#e2e8f0"}`,
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 16px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "";
                }}
              >
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: "48px",
                    height: "48px",
                    background:
                      "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
                  }}
                >
                  <FaPhone className="text-white" size={18} />
                </div>
                <div className="flex-grow-1">
                  <p className="small text-muted mb-1 fw-medium">Internet</p>
                  <p
                    className="mb-0 fw-semibold"
                    style={{
                      color: isDark ? "#f1f5f9" : "#1e293b",
                      fontSize: "clamp(0.8rem, 1.5vw, 0.95rem)",
                    }}
                  >
                    +1 (809)-582-1212
                  </p>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="col-12 col-md-6">
              <div
                className="h-100 rounded-3 p-3 p-md-4 d-flex align-items-center gap-3 shadow-sm"
                style={{
                  backgroundColor: isDark ? "#1e293b" : "#ffffff",
                  border: `1px solid ${isDark ? "#475569" : "#e2e8f0"}`,
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 16px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "";
                }}
              >
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: "48px",
                    height: "48px",
                    background:
                      "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                  }}
                >
                  <FaEnvelope className="text-white" size={18} />
                </div>
                <div className="flex-grow-1">
                  <p className="small text-muted mb-1 fw-medium">Email</p>
                  <p
                    className="mb-0 fw-semibold"
                    style={{
                      color: isDark ? "#f1f5f9" : "#1e293b",
                      fontSize: "clamp(0.8rem, 1.5vw, 0.95rem)",
                    }}
                  >
                    playcenter121@gmail.com
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de WhatsApp */}
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <a
                href="https://wa.me/18496357000?text=Hola%20PlayCenter%2C%20estoy%20interesad%40%20en%20un%20producto%20que%20vi%20en%20su%20página."
                target="_blank"
                rel="noopener noreferrer"
                className="btn w-100 d-flex align-items-center justify-content-center gap-2 py-3 fw-bold shadow-lg"
                style={{
                  background:
                    "linear-gradient(135deg, #25d366 0%, #128c7e 100%)",
                  color: "#ffffff",
                  fontSize: "clamp(0.9rem, 2vw, 1.05rem)",
                  border: "none",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.03)";
                  e.currentTarget.style.boxShadow =
                    "0 10px 25px rgba(37, 211, 102, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "";
                }}
              >
                <FaWhatsapp size={24} />
                WhatsApp Tienda
              </a>
            </div>
            <div className="col-12 col-md-6">
              <a
                href="https://wa.me/18095821212?text=Hola%20PlayCenter%2C%20estoy%20interesad%40%20en%20un%20producto%20que%20vi%20en%20su%20página."
                target="_blank"
                rel="noopener noreferrer"
                className="btn w-100 d-flex align-items-center justify-content-center gap-2 py-3 fw-bold shadow-lg"
                style={{
                  background:
                    "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                  color: "#ffffff",
                  fontSize: "clamp(0.9rem, 2vw, 1.05rem)",
                  border: "none",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.03)";
                  e.currentTarget.style.boxShadow =
                    "0 10px 25px rgba(59, 130, 246, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "";
                }}
              >
                <FaWhatsapp size={24} />
                WhatsApp Internet
              </a>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}

export default Inicio;
