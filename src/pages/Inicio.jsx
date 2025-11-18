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
  const { theme } = useTheme();

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
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-primary bg-gradient">
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
      className="bg-transparent min-vh-100"
      style={{ paddingTop: "var(--content-offset, 100px)" }}
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
          src={
            theme === "dark"
              ? "/videos/pcu-intro-negro.mp4"
              : "/videos/pcu-intro-blanco.mp4"
          }
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
        />
      </div>

      {/* SLIDER GRANDE EN TABLET Y DESKTOP - Visible desde 640px (sm:) - MÁS SEPARADO */}
      <motion.div
        className="d-none d-sm-block w-100 container-fluid px-2 px-sm-4 mt-5"
        style={{ maxWidth: "95%", maxWidthLg: "1600px" }}
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <div className="rounded-4 overflow-hidden shadow-lg border border-primary border-opacity-25">
          <SliderAnuncios />
        </div>
      </motion.div>

      {/* BLOQUES CUADRADOS - CATEGORÍAS DINÁMICAS */}
      <section
        className="container-fluid px-2 px-sm-4 mt-4 mt-sm-5"
        style={{ maxWidth: "95%", maxWidthLg: "1600px" }}
      >
        <div className="row g-3 g-sm-4 g-lg-5">
          {categories.slice(0, 4).map((category, idx) => {
            const categoryProducts = productsByCategory[category.id] || [];
            const featuredProducts = categoryProducts.slice(0, 4);

            return (
              <motion.div
                key={category.id}
                className="col-12 col-sm-6 col-lg-4 col-xl-3"
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.1 * idx }}
              >
                <div className="card h-100 shadow hover-lift border-2 border-light">
                  <div className="card-body d-flex flex-column justify-content-between p-4 p-sm-5">
                    <h3 className="fs-5 fs-sm-4 fw-bold mb-2 mb-sm-3 text-primary">
                      {category.nombre}
                    </h3>
                    <div className="row g-2 g-sm-3 flex-grow-1">
                      {featuredProducts.map((product, i) => {
                        const img =
                          getMainImage(product) || "/placeholder-product.svg";
                        return (
                          <div className="col-6" key={product.id}>
                            <Link to={`/producto/${product.id}`}>
                              <div
                                className="bg-light rounded-3 overflow-hidden d-flex align-items-center justify-content-center p-1 p-sm-2"
                                style={{ aspectRatio: "4/3" }}
                              >
                                <img
                                  src={img}
                                  alt={product.nombre}
                                  className="w-100 h-100"
                                  style={{
                                    objectFit: "contain",
                                    transition: "transform 0.2s",
                                  }}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "/placeholder-product.svg";
                                  }}
                                />
                              </div>
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                    <Link
                      to={`/Productos/${category.ruta}`}
                      className="text-primary small mt-2 mt-sm-3 text-decoration-none fw-medium"
                    >
                      Explora {category.nombre} →
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
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
        className="container-fluid mt-5 px-4"
        style={{ maxWidth: "1600px" }}
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <div className="card shadow border-2 border-light">
          <div className="card-body p-4 p-lg-5">
            <h2 className="h2 h1-lg fw-bold mb-4 text-dark">
              Explora nuestras categorías
            </h2>
            <div className="row g-3 g-sm-4">
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
                <div className="col-6 col-sm-4 col-md-3 col-xl-2" key={cat.alt}>
                  <Link to={cat.to} className="text-decoration-none">
                    <img
                      src={cat.src}
                      alt={cat.alt}
                      className="w-100 rounded-3 hover-lift shadow-sm"
                      style={{ aspectRatio: "1/1", objectFit: "cover" }}
                    />
                  </Link>
                </div>
              ))}
            </div>
            <div className="text-end mt-4">
              <Link
                to="/Productos"
                className="text-primary text-decoration-none fw-medium"
              >
                Ver todas las categorías →
              </Link>
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
        className="container-fluid mt-5 px-4"
        style={{ maxWidth: "1600px" }}
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <div className="card shadow border-2 border-light">
          <div className="card-body p-4 p-lg-5">
            <h2 className="h2 h1-lg fw-bold mb-4 text-dark">
              Descubre nuestros productos
            </h2>
            <div className="row g-3 g-sm-4">
              {Object.values(productsByCategory)
                .flat()
                .slice(0, 6)
                .map((producto) => (
                  <div
                    className="col-6 col-sm-4 col-md-3 col-xl-2"
                    key={producto.id}
                  >
                    <Link
                      to={`/producto/${producto.id}`}
                      className="text-decoration-none"
                    >
                      <div className="card border-2 border-light shadow-sm hover-lift">
                        <div
                          className="card-body p-2 d-flex align-items-center justify-content-center overflow-hidden"
                          style={{ aspectRatio: "1/1" }}
                        >
                          <img
                            src={
                              getMainImage(producto) ||
                              "/placeholder-product.svg"
                            }
                            alt={producto.nombre}
                            className="w-100 h-100"
                            style={{ objectFit: "contain" }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/placeholder-product.svg";
                            }}
                          />
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
            </div>
            <div className="text-end mt-4">
              <Link
                to="/Productos"
                className="text-primary text-decoration-none fw-medium"
              >
                Explora nuestros productos →
              </Link>
            </div>
          </div>
        </div>
      </motion.section>

      {/* SLIDER HOGAR INTELIGENTE (dinámico desde Firestore) */}
      <motion.section
        className="container-fluid mt-5 px-4"
        style={{ maxWidth: "1600px" }}
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <div className="card shadow border-2 border-light">
          <div className="card-body p-4 p-lg-5">
            <h2 className="h2 h1-lg fw-bold mb-4 text-dark">
              Hogar Inteligente en Oferta
            </h2>
            <div
              className="d-flex gap-3 overflow-auto pb-3"
              style={{ scrollbarWidth: "none" }}
            >
              {getProductsByRoute("hogar-inteligente")
                .slice(0, 10)
                .map((p) => {
                  const img = getMainImage(p) || "/placeholder-product.svg";
                  return (
                    <Link
                      to={`/producto/${p.id}`}
                      className="text-decoration-none flex-shrink-0 px-2"
                      style={{ minWidth: "180px" }}
                      key={p.id}
                    >
                      <div
                        className="bg-light rounded-3 overflow-hidden d-flex align-items-center justify-content-center p-2"
                        style={{ width: "100%", height: "180px" }}
                      >
                        <img
                          src={img}
                          alt={p.nombre}
                          className="w-100 h-100 hover-lift"
                          style={{ objectFit: "contain" }}
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
            <div className="text-end mt-4">
              <Link
                to="/Productos/hogar-inteligente"
                className="text-primary text-decoration-none fw-medium"
              >
                Descubre cómo transformar tu casa en un hogar inteligente →
              </Link>
            </div>
          </div>
        </div>
      </motion.section>

      {/* TU RINCÓN VARIADO (dinámico desde Firestore) */}
      <motion.section
        className="container-fluid mt-5 px-4"
        style={{ maxWidth: "1600px" }}
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <div className="card shadow border-2 border-light">
          <div className="card-body p-4 p-lg-5">
            <h2 className="h2 h1-lg fw-bold mb-4 text-dark">
              Tu Rincón Variado
            </h2>
            <div
              className="d-flex gap-3 overflow-auto pb-3"
              style={{ scrollbarWidth: "none" }}
            >
              {getProductsByRoute("tu-rincon-variado")
                .slice(0, 12)
                .map((p) => {
                  const img = getMainImage(p) || "/placeholder-product.svg";
                  return (
                    <Link
                      to={`/producto/${p.id}`}
                      key={p.id}
                      className="text-decoration-none flex-shrink-0 px-2"
                      style={{ minWidth: "180px" }}
                      title={p.nombre}
                    >
                      <div
                        className="bg-light rounded-3 overflow-hidden d-flex align-items-center justify-content-center p-2"
                        style={{ width: "100%", height: "180px" }}
                      >
                        <img
                          src={img}
                          alt={p.nombre}
                          className="w-100 h-100 hover-lift"
                          style={{ objectFit: "contain" }}
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
            <div className="text-end mt-4">
              <Link
                to="/Productos/tu-rincon-variado"
                className="text-primary text-decoration-none fw-medium"
              >
                Explora nuestro Rincón Variado →
              </Link>
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
          className="bg-white dark:bg-black rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition min-h-[380px] sm:h-[440px] flex flex-col justify-between p-4 sm:p-5 border border-gray-200 dark:border-gray-800"
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
                  <div className="w-full aspect-[4/3] bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center p-1 sm:p-2">
                    <img
                      src={getMainImage(p) || "/placeholder-product.svg"}
                      alt={p.nombre}
                      className="max-w-full max-h-full w-auto h-auto object-contain group-hover:scale-105 transition-transform"
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
          className="bg-white dark:bg-black rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition min-h-[380px] sm:h-[440px] flex flex-col justify-between p-4 sm:p-5 border border-gray-200 dark:border-gray-800"
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
                  <div className="w-full aspect-[4/3] bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center p-1 sm:p-2">
                    <img
                      src={getMainImage(p) || "/placeholder-product.svg"}
                      alt={p.nombre}
                      className="max-w-full max-h-full w-auto h-auto object-contain hover:scale-105 transition-transform"
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
          className="bg-white dark:bg-black rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition min-h-[380px] sm:h-[440px] flex flex-col justify-between p-4 sm:p-5 border border-gray-200 dark:border-gray-800"
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
                  <div className="w-full aspect-[4/3] bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center p-1 sm:p-2">
                    <img
                      src={getMainImage(p) || "/placeholder-product.svg"}
                      alt={p.nombre}
                      className="max-w-full max-h-full w-auto h-auto object-contain hover:scale-105 transition-transform"
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
          className="bg-white dark:bg-black rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition min-h-[380px] sm:h-[440px] flex flex-col justify-between p-4 sm:p-5 border border-gray-200 dark:border-gray-800"
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
                  <div className="w-full aspect-[4/3] bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center p-1 sm:p-2">
                    <img
                      src={getMainImage(p) || "/placeholder-product.svg"}
                      alt={p.nombre || "Cable"}
                      className="max-w-full max-h-full w-auto h-auto object-contain hover:scale-105 transition-transform"
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

      {/* CONTACTO */}
      <motion.section
        className="max-w-4xl mx-auto px-6 py-20 text-center mt-10"
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-6 text-gray-800 dark:text-gray-100">
          ¿Tienes dudas?{" "}
          <span className="text-indigo-700">Contáctanos ahora</span>
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-10 max-w-xl mx-auto">
          Nuestro equipo está listo para ayudarte por WhatsApp, teléfono o
          correo. Atención rápida y profesional.
        </p>
        <div className="bg-white dark:bg-black shadow-2xl rounded-2xl p-10 max-w-3xl mx-auto flex flex-col gap-6 border border-indigo-100 dark:border-gray-800 transition-colors duration-300">
          <p className="flex items-center justify-center text-gray-700 dark:text-gray-300 gap-3">
            <FaMapMarkerAlt className="text-indigo-700" />
            <span>Av. Estrella Sadhalá, Santiago, República Dominicana</span>
          </p>
          <p className="flex items-center justify-center text-gray-700 dark:text-gray-300 gap-3">
            <FaPhone className="text-indigo-700" />
            <span>+1 (849)-635-7000 (Tienda)</span>
          </p>
          <p className="flex items-center justify-center text-gray-700 dark:text-gray-300 gap-3">
            <FaPhone className="text-indigo-700" />
            <span>+1 (809)-582-1212 (Internet)</span>
          </p>
          <p className="flex items-center justify-center text-gray-700 dark:text-gray-300 gap-3">
            <FaEnvelope className="text-indigo-700" />
            <span>playcenter121@gmail.com</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center mt-4">
            <a
              href="https://wa.me/18496357000?text=Hola%20PlayCenter%2C%20estoy%20interesad%40%20en%20un%20producto%20que%20vi%20en%20su%20página."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-700 text-white rounded-lg shadow-md hover:bg-indigo-800 transition w-full sm:w-auto"
            >
              <FaWhatsapp className="text-xl" />
              WhatsApp Tienda
            </a>
            <a
              href="https://wa.me/18095821212?text=Hola%20PlayCenter%2C%20estoy%20interesad%40%20en%20un%20producto%20que%20vi%20en%20su%20página."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-lg shadow-md hover:bg-gray-800 transition w-full sm:w-auto"
            >
              <FaWhatsapp className="text-xl" />
              WhatsApp Internet
            </a>
          </div>
        </div>
      </motion.section>
    </div>
  );
}

export default Inicio;
