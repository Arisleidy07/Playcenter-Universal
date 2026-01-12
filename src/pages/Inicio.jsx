import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaWhatsapp,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaChevronRight,
  FaChevronLeft,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import SliderAnuncios from "../components/SliderAnuncios";
import SliderAnunciosMovil from "../components/SliderAnunciosMovil";
import { useProductsByCategories } from "../hooks/useProducts";
import { useTheme } from "../context/ThemeContext";
import Anim from "../components/anim";
import "../styles/Inicio.css";
import { getHistory, recordProduct } from "../lib/history";

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
  const cat1Ref = React.useRef(null);
  const [cat1Scrolled, setCat1Scrolled] = React.useState(false);
  const cat2Ref = React.useRef(null);
  const [cat2Scrolled, setCat2Scrolled] = React.useState(false);
  const [cat1CanLeft, setCat1CanLeft] = React.useState(false);
  const [cat1CanRight, setCat1CanRight] = React.useState(false);
  const [cat2CanLeft, setCat2CanLeft] = React.useState(false);
  const [cat2CanRight, setCat2CanRight] = React.useState(false);
  const [exploraCount, setExploraCount] = React.useState(4);
  const [descubreCount, setDescubreCount] = React.useState(4);
  const [hogarCount, setHogarCount] = React.useState(4);
  const [rinconCount, setRinconCount] = React.useState(4);
  const [seguirCount, setSeguirCount] = React.useState(4);
  const [recientesCount, setRecientesCount] = React.useState(4);

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
      videoRef.current.play().catch((err) => {
        // Error silencioso en autoplay de video
      });
    }
  }, [theme]);

  // Historial de navegación (última categoría y productos vistos)
  const [lastCat, setLastCat] = React.useState("");
  const [recentIds, setRecentIds] = React.useState([]);
  const [lastSearch, setLastSearch] = React.useState("");
  const [historyTick, setHistoryTick] = React.useState(0);

  React.useEffect(() => {
    try {
      const lc = localStorage.getItem("ultimaCategoriaVista") || "";
      const rpRaw = localStorage.getItem("recentProducts") || "[]";
      const rp = JSON.parse(rpRaw);
      setLastCat(lc);
      setRecentIds(Array.isArray(rp) ? rp : []);
      const hb = JSON.parse(localStorage.getItem("historialBusquedas") || "[]");
      if (Array.isArray(hb) && hb.length > 0) setLastSearch(hb[0]);
    } catch {}
  }, []);

  // Escuchar actualizaciones del historial unificado
  React.useEffect(() => {
    const onHist = () => setHistoryTick((t) => t + 1);
    if (typeof window !== "undefined") {
      window.addEventListener("pcu-history-updated", onHist);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("pcu-history-updated", onHist);
      }
    };
  }, []);

  const trackCategoryView = (rutaCat) => {
    try {
      localStorage.setItem("ultimaCategoriaVista", rutaCat || "");
      setLastCat(rutaCat || "");
    } catch {}
  };

  const trackProductView = (id) => {
    try {
      const key = "recentProducts";
      const prev = JSON.parse(localStorage.getItem(key) || "[]");
      const next = [id, ...prev.filter((x) => x !== id)].slice(0, 20);
      localStorage.setItem(key, JSON.stringify(next));
      setRecentIds(next);
      try {
        recordProduct(id);
      } catch {}
    } catch {}
  };

  const updateScrollIndicators = React.useCallback((el, setLeft, setRight) => {
    try {
      if (!el) return;
      const threshold = 8;
      const canLeft = el.scrollLeft > threshold;
      const canRight =
        el.scrollLeft + el.clientWidth < el.scrollWidth - threshold;
      setLeft(!!canLeft);
      setRight(!!canRight);
    } catch {}
  }, []);

  React.useEffect(() => {
    const el1 = cat1Ref.current;
    const el2 = cat2Ref.current;
    updateScrollIndicators(el1, setCat1CanLeft, setCat1CanRight);
    updateScrollIndicators(el2, setCat2CanLeft, setCat2CanRight);
  }, [categories, productsByCategory, updateScrollIndicators]);

  React.useEffect(() => {
    const onResize = () => {
      const el1 = cat1Ref.current;
      const el2 = cat2Ref.current;
      updateScrollIndicators(el1, setCat1CanLeft, setCat1CanRight);
      updateScrollIndicators(el2, setCat2CanLeft, setCat2CanRight);
    };
    if (typeof window !== "undefined") {
      window.addEventListener("resize", onResize);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", onResize);
      }
    };
  }, [updateScrollIndicators]);

  const allProductsFlat = React.useMemo(
    () => Object.values(productsByCategory).flat(),
    [productsByCategory]
  );

  const productosRecientes = React.useMemo(() => {
    if (!recentIds || recentIds.length === 0) return [];
    const map = new Map(allProductsFlat.map((p) => [p.id, p]));
    const out = [];
    for (const id of recentIds) {
      const prod = map.get(id);
      if (prod) out.push(prod);
      if (out.length >= 12) break;
    }
    return out;
  }, [recentIds, allProductsFlat]);

  const lastCatObj = React.useMemo(() => {
    if (!lastCat) return null;
    const exact = categories.find((c) => (c?.ruta || "") === lastCat);
    if (exact) return exact;
    const normalize = (texto) =>
      (texto || "")
        .toLowerCase()
        .replace(/á/g, "a")
        .replace(/é/g, "e")
        .replace(/í/g, "i")
        .replace(/ó/g, "o")
        .replace(/ú/g, "u")
        .replace(/ñ/g, "n")
        .replace(/[^a-z0-9]/g, "");
    const rn = normalize(lastCat);
    const fallback = categories.find((c) => {
      const nn = normalize(c.nombre);
      const rr = normalize(c.ruta);
      return nn === rn || rr === rn || nn.includes(rn) || rn.includes(nn);
    });
    return fallback || null;
  }, [lastCat, categories]);

  const seguirComprando = React.useMemo(() => {
    if (!lastCatObj) return [];
    const list = productsByCategory[lastCatObj.id] || [];
    return list.slice(0, 12);
  }, [lastCatObj, productsByCategory]);

  const productosBusqueda = React.useMemo(() => {
    if (!lastSearch) return [];
    const norm = (t) =>
      (t || "")
        .toString()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
    const raw = (lastSearch || "").toString();
    const parts = raw.split(/\s+en\s+/i);
    const term = norm(parts[0] || "");
    if (!term) return [];
    const out = [];
    for (const p of allProductsFlat) {
      const n = norm(p?.nombre);
      const c = norm(p?.categoria || p?.categoriaId);
      const m = norm(p?.empresa || p?.marca);
      if (
        (n && n.includes(term)) ||
        (c && c.includes(term)) ||
        (m && m.includes(term))
      ) {
        out.push(p);
        if (out.length >= 12) break;
      }
    }
    return out;
  }, [lastSearch, allProductsFlat]);

  // Unified history blocks (Amazon-like)
  const historyItems = React.useMemo(() => getHistory(), [historyTick]);

  const norm = React.useCallback(
    (t) =>
      (t || "")
        .toString()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim(),
    []
  );

  const groupedBlocks = React.useMemo(() => {
    // Local resolver to avoid referencing helpers declared later
    const findCat = (rutaBuscada) => {
      if (!rutaBuscada) return null;
      // Exact by id or ruta
      let cat = categories.find((c) => (c?.id || "") === rutaBuscada);
      if (cat) return cat;
      cat = categories.find((c) => (c?.ruta || "") === rutaBuscada);
      if (cat) return cat;
      // Fallback by normalized nombre/ruta
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
      const rn = normalizarTexto(rutaBuscada);
      cat = categories.find((c) => {
        const nn = normalizarTexto(c.nombre);
        const rr = normalizarTexto(c.ruta);
        return nn === rn || rr === rn || nn.includes(rn) || rn.includes(nn);
      });
      return cat || null;
    };

    // Priority: search > product > category
    const byType = {
      search: new Map(),
      product: new Map(),
      category: new Map(),
    };
    for (const item of historyItems) {
      if (!byType[item.type]) continue;
      const prev = byType[item.type].get(item.key);
      if (!prev || Number(item.timestamp) > Number(prev.timestamp)) {
        byType[item.type].set(item.key, item);
      }
    }

    const sortDesc = (a, b) => Number(b.timestamp) - Number(a.timestamp);
    const searches = Array.from(byType.search.values()).sort(sortDesc);
    const products = Array.from(byType.product.values()).sort(sortDesc);
    const categories = Array.from(byType.category.values()).sort(sortDesc);

    // Rule: don't show single product interaction only
    const totalProductCount = historyItems.filter(
      (h) => h.type === "product"
    ).length;

    const pick = [];
    for (const s of searches) {
      if (pick.length < 5) pick.push(s);
    }
    if (totalProductCount >= 2) {
      for (const p of products) {
        if (pick.length < 5) pick.push(p);
      }
    }
    for (const c of categories) {
      if (pick.length < 5) pick.push(c);
    }

    const blocks = [];
    for (const g of pick) {
      let label = g.key;
      let moreHref = undefined;
      let list = [];
      if (g.type === "search") {
        moreHref = `/buscar?q=${encodeURIComponent(g.key)}`;
        const termParts = String(g.key || "").split(/\s+en\s+/i);
        const term = norm(termParts[0] || "");
        if (term) {
          for (const p of allProductsFlat) {
            const n = norm(p?.nombre);
            const c = norm(p?.categoria || p?.categoriaId);
            const m = norm(p?.empresa || p?.marca);
            if (
              (n && n.includes(term)) ||
              (c && c.includes(term)) ||
              (m && m.includes(term))
            ) {
              list.push(p);
              if (list.length >= 4) break;
            }
          }
        }
      } else if (g.type === "product") {
        const prod = allProductsFlat.find(
          (p) => String(p.id) === String(g.key)
        );
        const catName = prod?.categoria || prod?.categoriaId || "";
        const catObj = catName ? findCat(catName) : null;
        if (catObj) {
          label = catObj.nombre || catName;
          moreHref = `/Productos/${catObj.ruta}`;
          const arr = productsByCategory[catObj.id] || [];
          list = arr.filter((p) => String(p.id) !== String(g.key)).slice(0, 4);
        }
      } else if (g.type === "category") {
        const catObj = findCat(g.key) || null;
        if (catObj) {
          label = catObj.nombre || g.key;
          moreHref = `/Productos/${catObj.ruta}`;
          list = (productsByCategory[catObj.id] || []).slice(0, 4);
        }
      }
      if (list.length >= 2) {
        blocks.push({
          type: g.type,
          key: g.key,
          label,
          products: list,
          moreHref,
        });
      }
      if (blocks.length >= 5) break;
    }
    return blocks;
  }, [historyItems, allProductsFlat, productsByCategory, categories, norm]);

  const lastSearchTermDisplay = React.useMemo(() => {
    if (!lastSearch) return "";
    const raw = (lastSearch || "").toString();
    const parts = raw.split(/\s+en\s+/i);
    return (parts[0] || "").trim();
  }, [lastSearch]);

  const MIN_SEARCH_ITEMS = 5;
  const MIN_CATEGORY_ITEMS = 4;
  const MIN_RECENT_ITEMS = 3;
  const disableLegacyRows = groupedBlocks.length > 0;

  const searchIds = React.useMemo(
    () => new Set(productosBusqueda.map((p) => p.id)),
    [productosBusqueda]
  );
  const seguirComprandoFiltered = React.useMemo(
    () => (seguirComprando || []).filter((p) => !searchIds.has(p.id)),
    [seguirComprando, searchIds]
  );
  const catIds = React.useMemo(
    () => new Set(seguirComprandoFiltered.map((p) => p.id)),
    [seguirComprandoFiltered]
  );
  const productosRecientesFiltered = React.useMemo(
    () =>
      (productosRecientes || []).filter(
        (p) => !searchIds.has(p.id) && !catIds.has(p.id)
      ),
    [productosRecientes, searchIds, catIds]
  );

  // Logging para debug - mostrar categorías disponibles (DESACTIVADO)
  // React.useEffect(() => {
  //   if (categories.length > 0) {
  //     console.log("🎯 CATEGORÍAS DISPONIBLES EN INICIO:");
  //     console.log("════════════════════════════════════════════════════════");
  //     console.table(
  //       categories.map((c) => ({
  //         "📌 Nombre": c.nombre,
  //         "🔗 Ruta": c.ruta,
  //         " ID": c.id,
  //         " Productos": (productsByCategory[c.id] || []).length,
  //       }))
  //     );
  //     console.log("════════════════════════════════════════════════════════");
  //     console.log(
  //       " COPIA las rutas exactas de arriba para usarlas en getProductsByRoute()"
  //     );
  //     console.log("════════════════════════════════════════════════════════");
  //   }
  // }, [categories, productsByCategory]);

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
      // console.warn(` Categoría no encontrada para ruta: "${ruta}"`);
      // console.log(
      //   " Sugerencia: Verifica las categorías disponibles en la tabla arriba"
      // );
      return [];
    }
    const productos = productsByCategory[cat.id] || [];
    return productos;
  };
  return (
    <div
      className="min-vh-100"
      style={{
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
      <section className="max-w-[95%] lg:max-w-[1600px] mx-auto px-2 sm:px-4 mt-8 sm:mt-16">
        <div className="relative">
          <div
            ref={cat1Ref}
            onScroll={(e) => {
              const el = e.currentTarget;
              if (!cat1Scrolled && el.scrollLeft > 8) {
                setCat1Scrolled(true);
              }
              updateScrollIndicators(el, setCat1CanLeft, setCat1CanRight);
            }}
            className="flex flex-nowrap overflow-x-auto gap-4 sm:gap-1 lg:grid lg:grid-cols-4 lg:overflow-visible lg:snap-none lg:scroll-auto lg:gap-8 pb-2"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: isDark ? "#475569 #1e293b" : "#cbd5e1 #f1f5f9",
              WebkitOverflowScrolling: "touch",
              touchAction: "pan-x",
              overscrollBehaviorX: "contain",
            }}
          >
            {categories.slice(0, 4).map((category, idx) => {
              const categoryProducts = productsByCategory[category.id] || [];
              const featuredProducts = categoryProducts.slice(0, 4);

              return (
                <div
                  key={category.id}
                  className="snap-start flex-shrink-0 w-[88vw] sm:w-[340px] lg:w-auto"
                  style={{ flex: "0 0 auto" }}
                >
                  <motion.div
                    className="relative bg-white dark:bg-black rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition min-h-[320px] max-h-[400px] flex flex-col justify-between p-4 sm:p-5 border border-gray-200 dark:border-gray-600 overflow-hidden"
                    variants={fadeIn}
                    initial="hidden"
                    animate="visible"
                  >
                    <h3 className="relative z-10 text-base sm:text-lg font-bold mb-2 sm:mb-3 text-indigo-700 dark:text-indigo-400 leading-tight">
                      {category?.nombre ||
                        category?.ruta ||
                        category?.id ||
                        "Categoría"}
                    </h3>
                    <div className="grid grid-cols-2 gap-2 sm:gap-1 flex-grow">
                      {featuredProducts.map((product) => {
                        const img =
                          getMainImage(product) || "/placeholder-product.svg";
                        return (
                          <Link
                            to={`/producto/${product.id}`}
                            key={product.id}
                            onClick={() => trackProductView(product.id)}
                          >
                            <div className="w-full aspect-square bg-transparent rounded-lg overflow-hidden flex items-center justify-center p-0 sm:p-1">
                              <img
                                src={img}
                                alt={product.nombre}
                                className="w-full h-full object-contain transition-transform"
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
                      className="relative z-10 text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm mt-2 sm:mt-3 hover:underline font-medium leading-tight whitespace-normal"
                      onClick={() => trackCategoryView(category.ruta)}
                    >
                      Explora{" "}
                      {category?.nombre ||
                        category?.ruta ||
                        category?.id ||
                        "categoría"}{" "}
                      →
                    </Link>
                  </motion.div>
                </div>
              );
            })}
          </div>
          {(cat1CanLeft || cat1CanRight) && (
            <div
              className={`sm:hidden pointer-events-none absolute ${
                cat1CanRight && !cat1CanLeft
                  ? "right-2"
                  : cat1CanLeft && !cat1CanRight
                  ? "left-2"
                  : "right-2"
              } top-1/2 -translate-y-1/2 opacity-90`}
              aria-hidden="true"
            >
              <motion.div
                animate={{ x: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                className="text-gray-400 dark:text-gray-300"
              >
                {cat1CanRight && !cat1CanLeft ? (
                  <FaChevronRight size={22} />
                ) : cat1CanLeft && !cat1CanRight ? (
                  <FaChevronLeft size={22} />
                ) : (
                  <FaChevronRight size={22} />
                )}
              </motion.div>
            </div>
          )}
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

      {/* DOBLE BANNER */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[1600px] mx-auto px-4 mt-16">
        {[
          {
            to: "/Productos/retro-consolas",
            src: "/ads/ads-videos/Retro-consolas.mp4",
            alt: "Retro Consolas",
            isVideo: true,
          },
          {
            to: "/Productos/camaras",
            src: "/ads/camaras.png",
            alt: "Cámaras",
            isVideo: false,
          },
        ].map((banner, idx) => (
          <div
            key={banner.alt}
            className="overflow-hidden rounded-2xl shadow-lg border-2 border-gray-300 dark:border-gray-600 aspect-[16/9]"
          >
            <Link to={banner.to} className="block w-full h-full">
              {banner.isVideo ? (
                <video
                  src={banner.src}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <img
                  src={banner.src}
                  alt={banner.alt}
                  className="w-full h-full object-cover rounded-2xl"
                />
              )}
            </Link>
          </div>
        ))}
      </section>

      {/* CATEGORÍAS DESTACADAS */}
      <motion.section
        className="container-fluid mt-4 px-3 px-md-4"
        style={{ maxWidth: "1600px" }}
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <div className="d-block d-sm-none">
          <div className="grid grid-cols-2 gap-3">
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
            ]
              .slice(0, exploraCount)
              .map((cat) => (
                <Link
                  to={cat.to}
                  key={cat.alt}
                  className="text-decoration-none"
                >
                  <div className="w-full aspect-square overflow-hidden rounded-xl">
                    <img
                      src={cat.src}
                      alt={cat.alt}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="mt-1 text-sm text-gray-800 dark:text-gray-100 font-medium truncate">
                    {cat.alt}
                  </div>
                </Link>
              ))}
          </div>
          {6 > 4 && (
            <button
              type="button"
              onClick={() =>
                exploraCount < 6
                  ? setExploraCount((c) => Math.min(c + 2, 6))
                  : setExploraCount(4)
              }
              className="mt-2 text-primary dark:text-blue-400 text-sm inline-flex items-center gap-1"
            >
              {exploraCount < 6 ? "Ver más" : "Ver menos"}{" "}
              {exploraCount < 6 ? (
                <FaChevronDown size={16} />
              ) : (
                <FaChevronUp size={16} />
              )}
            </button>
          )}
        </div>
        <div
          className="shadow d-none d-sm-block"
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
              className="d-flex flex-nowrap gap-2 gap-md-2 overflow-x-auto pb-1"
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
                    className="rounded-3 overflow-hidden d-flex align-items-center justify-content-center w-[140px] h-[140px] md:w-[170px] md:h-[170px] lg:w-[180px] lg:h-[180px]"
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
        <div className="d-block d-sm-none">
          <div className="mb-2">
            <h2
              className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-0"
              style={{
                fontFamily:
                  "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              Descubre nuestros productos
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Object.values(productsByCategory)
              .flat()
              .slice(0, descubreCount)
              .map((producto) => {
                const img =
                  getMainImage(producto) || "/placeholder-product.svg";
                return (
                  <Link
                    to={`/producto/${producto.id}`}
                    key={producto.id}
                    className="text-decoration-none"
                    title={producto.nombre}
                    onClick={() => trackProductView(producto.id)}
                  >
                    <div className="w-full aspect-square overflow-hidden rounded-xl">
                      <img
                        src={img}
                        alt={producto.nombre}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/placeholder-product.svg";
                        }}
                      />
                    </div>
                    <div className="mt-1 text-sm text-gray-800 dark:text-gray-100 font-medium truncate">
                      {producto.nombre}
                    </div>
                  </Link>
                );
              })}
          </div>
          {Object.values(productsByCategory).flat().length > 4 && (
            <button
              type="button"
              onClick={() =>
                descubreCount < Object.values(productsByCategory).flat().length
                  ? setDescubreCount((c) =>
                      Math.min(
                        c + 2,
                        Object.values(productsByCategory).flat().length
                      )
                    )
                  : setDescubreCount(4)
              }
              className="mt-2 text-primary dark:text-blue-400 text-sm inline-flex items-center gap-1"
            >
              {descubreCount < Object.values(productsByCategory).flat().length
                ? "Ver más"
                : "Ver menos"}{" "}
              {descubreCount <
              Object.values(productsByCategory).flat().length ? (
                <FaChevronDown size={16} />
              ) : (
                <FaChevronUp size={16} />
              )}
            </button>
          )}
        </div>
        <div
          className="shadow d-none d-sm-block"
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
                style={{
                  fontSize: "clamp(16px, 3vw, 20px)",
                  fontFamily:
                    "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                }}
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
              className="d-flex flex-nowrap gap-2 gap-md-2 overflow-x-auto pb-1"
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
                      onClick={() => trackProductView(producto.id)}
                    >
                      <div
                        className="rounded-3 overflow-hidden d-flex align-items-center justify-content-center w-[140px] h-[140px] md:w-[170px] md:h-[170px] lg:w-[180px] lg:h-[180px]"
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
        <div className="d-block d-sm-none">
          <div className="mb-2">
            <h2
              className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-0"
              style={{
                fontFamily:
                  "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              Hogar Inteligente
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {getProductsByRoute("hogar-inteligente")
              .slice(0, hogarCount)
              .map((p) => {
                const img = getMainImage(p) || "/placeholder-product.svg";
                return (
                  <Link
                    to={`/producto/${p.id}`}
                    className="text-decoration-none"
                    key={p.id}
                    onClick={() => trackProductView(p.id)}
                  >
                    <div className="w-full aspect-square overflow-hidden rounded-xl">
                      <img
                        src={img}
                        alt={p.nombre}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/placeholder-product.svg";
                        }}
                      />
                    </div>
                    <div className="mt-1 text-sm text-gray-800 dark:text-gray-100 font-medium truncate">
                      {p.nombre}
                    </div>
                  </Link>
                );
              })}
          </div>
          {getProductsByRoute("hogar-inteligente").length > 4 && (
            <button
              type="button"
              onClick={() =>
                hogarCount < getProductsByRoute("hogar-inteligente").length
                  ? setHogarCount((c) =>
                      Math.min(
                        c + 2,
                        getProductsByRoute("hogar-inteligente").length
                      )
                    )
                  : setHogarCount(4)
              }
              className="mt-2 text-primary dark:text-blue-400 text-sm inline-flex items-center gap-1"
            >
              {hogarCount < getProductsByRoute("hogar-inteligente").length
                ? "Ver más"
                : "Ver menos"}{" "}
              {hogarCount < getProductsByRoute("hogar-inteligente").length ? (
                <FaChevronDown size={16} />
              ) : (
                <FaChevronUp size={16} />
              )}
            </button>
          )}
        </div>
        <div
          className="shadow d-none d-sm-block"
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
                style={{
                  fontSize: "clamp(16px, 3vw, 20px)",
                  fontFamily:
                    "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                }}
              >
                Hogar Inteligente
              </h2>
              <Link
                to="/Productos/hogar-inteligente"
                className="text-primary dark:text-blue-400 text-decoration-none fw-medium text-xs sm:text-sm"
                style={{ fontSize: "clamp(11px, 2vw, 13px)" }}
                onClick={() => trackCategoryView("hogar-inteligente")}
              >
                Ver más →
              </Link>
            </div>
            <div
              className="d-flex flex-nowrap gap-2 gap-md-2 overflow-x-auto pb-1"
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
                      key={p.id}
                      className="text-decoration-none flex-shrink-0"
                      onClick={() => trackProductView(p.id)}
                    >
                      <div
                        className="rounded-3 overflow-hidden d-flex align-items-center justify-content-center w-[140px] h-[140px] md:w-[170px] md:h-[170px] lg:w-[180px] lg:h-[180px]"
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
        <div className="d-block d-sm-none">
          <div className="mb-2">
            <h2
              className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-0"
              style={{
                fontFamily:
                  "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              Tu Rincón Variado
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {getProductsByRoute("tu-rincon-variado")
              .slice(0, rinconCount)
              .map((p) => {
                const img = getMainImage(p) || "/placeholder-product.svg";
                return (
                  <Link
                    to={`/producto/${p.id}`}
                    key={p.id}
                    className="text-decoration-none"
                    title={p.nombre}
                    onClick={() => trackProductView(p.id)}
                  >
                    <div className="w-full aspect-square overflow-hidden rounded-xl">
                      <img
                        src={img}
                        alt={p.nombre}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/placeholder-product.svg";
                        }}
                      />
                    </div>
                    <div className="mt-1 text-sm text-gray-800 dark:text-gray-100 font-medium truncate">
                      {p.nombre}
                    </div>
                  </Link>
                );
              })}
          </div>
          {getProductsByRoute("tu-rincon-variado").length > 4 && (
            <button
              type="button"
              onClick={() =>
                rinconCount < getProductsByRoute("tu-rincon-variado").length
                  ? setRinconCount((c) =>
                      Math.min(
                        c + 2,
                        getProductsByRoute("tu-rincon-variado").length
                      )
                    )
                  : setRinconCount(4)
              }
              className="mt-2 text-primary dark:text-blue-400 text-sm inline-flex items-center gap-1"
            >
              {rinconCount < getProductsByRoute("tu-rincon-variado").length
                ? "Ver más"
                : "Ver menos"}{" "}
              {rinconCount < getProductsByRoute("tu-rincon-variado").length ? (
                <FaChevronDown size={16} />
              ) : (
                <FaChevronUp size={16} />
              )}
            </button>
          )}
        </div>
        <div
          className="shadow d-none d-sm-block"
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
                style={{
                  fontSize: "clamp(16px, 3vw, 20px)",
                  fontFamily:
                    "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                }}
              >
                Tu Rincón Variado
              </h2>
              <Link
                to="/Productos/tu-rincon-variado"
                className="text-primary dark:text-blue-400 text-decoration-none fw-medium text-xs sm:text-sm"
                style={{ fontSize: "clamp(11px, 2vw, 13px)" }}
                onClick={() => trackCategoryView("tu-rincon-variado")}
              >
                Ver más →
              </Link>
            </div>
            <div
              className="d-flex flex-nowrap gap-2 gap-md-2 overflow-x-auto pb-1"
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
                      onClick={() => trackProductView(p.id)}
                    >
                      <div
                        className="rounded-3 overflow-hidden d-flex align-items-center justify-content-center w-[140px] h-[140px] md:w-[170px] md:h-[170px] lg:w-[180px] lg:h-[180px]"
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
            to: "/Productos/hogar-inteligente",
            src: "/ads/ads-videos/smart.mp4",
            alt: "Smart Home",
            isVideo: true,
          },
          {
            to: "/Productos/controles",
            src: "/ads/controlads.png",
            alt: "Controles",
            isVideo: false,
          },
        ].map((banner, idx) => (
          <div
            key={banner.alt}
            className="overflow-hidden rounded-2xl shadow-lg border-2 border-gray-300 dark:border-gray-600 aspect-[16/9]"
          >
            <Link to={banner.to} className="block w-full h-full">
              {banner.isVideo ? (
                <video
                  src={banner.src}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <img
                  src={banner.src}
                  alt={banner.alt}
                  className="w-full h-full object-cover rounded-2xl"
                />
              )}
            </Link>
          </div>
        ))}
      </section>

      {/* BLOQUES: Cámaras, Discos Duros, Memorias USB, Cables (dinámicos desde Firestore) */}
      <section className="relative max-w-[95%] lg:max-w-[1600px] mx-auto px-2 sm:px-4 mt-8 sm:mt-16">
        <div
          ref={cat2Ref}
          onScroll={(e) => {
            const el = e.currentTarget;
            updateScrollIndicators(el, setCat2CanLeft, setCat2CanRight);
          }}
          className="flex flex-nowrap overflow-x-auto gap-4 sm:grid sm:grid-cols-2 sm:overflow-visible sm:snap-none sm:scroll-auto sm:gap-3 sm:[&>div]:w-full lg:grid lg:grid-cols-4 lg:overflow-visible lg:snap-none lg:scroll-auto lg:gap-8 pb-2"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: isDark ? "#475569 #1e293b" : "#cbd5e1 #f1f5f9",
            WebkitOverflowScrolling: "touch",
            touchAction: "pan-x",
            overscrollBehaviorX: "contain",
          }}
        >
          {/* Cámaras de Vigilancia */}
          <div
            className="snap-start flex-shrink-0 w-[88vw] sm:w-[340px] lg:w-auto"
            style={{ flex: "0 0 auto" }}
          >
            <motion.div
              className="relative bg-white dark:bg-black rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition min-h-[320px] max-h-[400px] flex flex-col justify-between p-4 sm:p-5 border border-gray-200 dark:border-gray-600 overflow-hidden"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
            >
              <h3 className="relative z-10 text-base sm:text-lg font-bold mb-2 sm:mb-3 text-indigo-700 dark:text-indigo-400 leading-tight">
                Cámaras de Vigilancia
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:gap-1 flex-grow">
                {getProductsByRoute("camaras")
                  .slice(0, 4)
                  .map((p) => (
                    <Link
                      to={`/producto/${p.id}`}
                      key={p.id}
                      onClick={() => trackProductView(p.id)}
                    >
                      <div className="w-full aspect-square bg-transparent rounded-lg overflow-hidden flex items-center justify-center p-0 sm:p-1">
                        <img
                          src={getMainImage(p) || "/placeholder-product.svg"}
                          alt={p.nombre}
                          className="w-full h-full object-contain transition-transform"
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
                className="relative z-10 text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm mt-2 sm:mt-3 hover:underline font-medium leading-tight whitespace-normal"
                onClick={() => trackCategoryView("camaras")}
              >
                Explora nuestras Cámaras de Vigilancia →
              </Link>
            </motion.div>
          </div>

          {/* Discos Duros */}
          <div
            className="snap-start flex-shrink-0 w-[88vw] sm:w-[340px] lg:w-auto"
            style={{ flex: "0 0 auto" }}
          >
            <motion.div
              className="relative bg-white dark:bg-black rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition min-h-[320px] max-h-[400px] flex flex-col justify-between p-4 sm:p-5 border border-gray-200 dark:border-gray-600 overflow-hidden"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
            >
              <h3 className="relative z-10 text-base sm:text-lg font-bold mb-2 sm:mb-3 text-indigo-700 dark:text-indigo-400 leading-tight">
                Discos Duros
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:gap-1 flex-grow">
                {getProductsByRoute("discos-duros")
                  .slice(0, 4)
                  .map((p) => (
                    <Link
                      to={`/producto/${p.id}`}
                      key={p.id}
                      onClick={() => trackProductView(p.id)}
                    >
                      <div className="w-full aspect-square bg-transparent rounded-lg overflow-hidden flex items-center justify-center p-0 sm:p-1">
                        <img
                          src={getMainImage(p) || "/placeholder-product.svg"}
                          alt={p.nombre}
                          className="w-full h-full object-contain transition-transform"
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
                className="relative z-10 text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm mt-2 sm:mt-3 hover:underline font-medium leading-tight whitespace-normal"
                onClick={() => trackCategoryView("discos-duros")}
              >
                Explora nuestros Discos Duros →
              </Link>
            </motion.div>
          </div>

          {/* Memorias USB */}
          <div
            className="snap-start flex-shrink-0 w-[88vw] sm:w-[340px] lg:w-auto"
            style={{ flex: "0 0 auto" }}
          >
            <motion.div
              className="relative bg-white dark:bg-black rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition min-h-[320px] max-h-[400px] flex flex-col justify-between p-4 sm:p-5 border border-gray-200 dark:border-gray-600 overflow-hidden"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
            >
              <h3 className="relative z-10 text-base sm:text-lg font-bold mb-2 sm:mb-3 text-indigo-700 dark:text-indigo-400 leading-tight">
                Memorias USB
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:gap-1 flex-grow">
                {getProductsByRoute("memorias-usb")
                  .slice(0, 4)
                  .map((p) => (
                    <Link
                      to={`/producto/${p.id}`}
                      key={p.id}
                      onClick={() => trackProductView(p.id)}
                    >
                      <div className="w-full aspect-square bg-transparent rounded-lg overflow-hidden flex items-center justify-center p-0 sm:p-1">
                        <img
                          src={getMainImage(p) || "/placeholder-product.svg"}
                          alt={p.nombre}
                          className="w-full h-full object-contain transition-transform"
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
                className="relative z-10 text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm mt-2 sm:mt-3 hover:underline font-medium leading-tight whitespace-normal"
                onClick={() => trackCategoryView("memorias-usb")}
              >
                Explora nuestras Memorias USB →
              </Link>
            </motion.div>
          </div>

          {/* Cables */}
          <div
            className="snap-start flex-shrink-0 w-[88vw] sm:w-[340px] lg:w-auto"
            style={{ flex: "0 0 auto" }}
          >
            <motion.div
              className="relative bg-white dark:bg-black rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition min-h-[320px] max-h-[400px] flex flex-col justify-between p-4 sm:p-5 border border-gray-200 dark:border-gray-600 overflow-hidden"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
            >
              <h3 className="relative z-10 text-base sm:text-lg font-bold mb-2 sm:mb-3 text-indigo-700 dark:text-indigo-400 leading-tight">
                Cables
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:gap-1 flex-grow">
                {getProductsByRoute("cables")
                  .slice(0, 4)
                  .map((p) => (
                    <Link
                      to={`/producto/${p.id}`}
                      key={p.id}
                      onClick={() => trackProductView(p.id)}
                    >
                      <div className="w-full aspect-square bg-transparent rounded-lg overflow-hidden flex items-center justify-center p-0 sm:p-1">
                        <img
                          src={getMainImage(p) || "/placeholder-product.svg"}
                          alt={p.nombre || "Cable"}
                          className="w-full h-full object-contain transition-transform"
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
                className="relative z-10 text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm mt-2 sm:mt-3 hover:underline font-medium leading-tight whitespace-normal"
                onClick={() => trackCategoryView("cables")}
              >
                Explora nuestros Cables →
              </Link>
            </motion.div>
          </div>
        </div>
        {(cat2CanLeft || cat2CanRight) && (
          <div
            className={`sm:hidden pointer-events-none absolute ${
              cat2CanRight && !cat2CanLeft
                ? "right-2"
                : cat2CanLeft && !cat2CanRight
                ? "left-2"
                : "right-2"
            } top-1/2 -translate-y-1/2 opacity-90`}
            aria-hidden="true"
          >
            <motion.div
              animate={{ x: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className="text-gray-400 dark:text-gray-300"
            >
              {cat2CanRight && !cat2CanLeft ? (
                <FaChevronRight size={22} />
              ) : cat2CanLeft && !cat2CanRight ? (
                <FaChevronLeft size={22} />
              ) : (
                <FaChevronRight size={22} />
              )}
            </motion.div>
          </div>
        )}
      </section>

      {/* Seguir comprando - basado en última categoría vista */}
      {!disableLegacyRows &&
        lastCatObj &&
        seguirComprandoFiltered.length >= MIN_CATEGORY_ITEMS && (
          <motion.section
            className="container-fluid mt-4 px-3 px-md-4"
            style={{ maxWidth: "1600px" }}
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            <div className="d-block d-sm-none">
              <div className="flex items-center justify-between mb-2">
                <h2
                  className="h6 fw-bold text-dark dark:text-gray-100 mb-0"
                  style={{
                    fontSize: "clamp(16px, 3vw, 20px)",
                    fontFamily:
                      "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    fontWeight: 600,
                    letterSpacing: "-0.01em",
                  }}
                >
                  Seguir comprando
                </h2>
                <Link
                  to={`/Productos/${lastCatObj?.ruta || ""}`}
                  className="text-primary dark:text-blue-400 text-decoration-none fw-medium text-xs sm:text-sm"
                  style={{ fontSize: "clamp(11px, 2vw, 13px)" }}
                  onClick={() => trackCategoryView(lastCatObj?.ruta)}
                >
                  Ver historial
                </Link>
              </div>
              {/* Mobile: 3x2 grid - sin fondo, con nombre truncado */}
              <div className="grid grid-cols-3 gap-1 mb-2">
                {seguirComprandoFiltered.slice(0, 6).map((p) => {
                  const img = getMainImage(p) || "/placeholder-product.svg";
                  return (
                    <Link
                      to={`/producto/${p.id}`}
                      key={p.id}
                      className="text-decoration-none"
                      title={p.nombre}
                      onClick={() => trackProductView(p.id)}
                    >
                      <div
                        className="rounded-2 overflow-hidden d-flex align-items-center justify-content-center w-full aspect-square"
                        style={{
                          border: isDark
                            ? "1px solid rgba(255, 255, 255, 0.08)"
                            : "1px solid rgba(0, 0, 0, 0.06)",
                        }}
                      >
                        <img
                          src={img}
                          alt={p.nombre}
                          className="w-100 h-100 object-contain"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/placeholder-product.svg";
                          }}
                        />
                      </div>
                      <p className="mt-1 text-[10px] leading-tight text-gray-700 dark:text-gray-300 truncate">
                        {p.nombre}
                      </p>
                    </Link>
                  );
                })}
              </div>
              <Link
                to="/profile"
                className="w-full text-primary dark:text-blue-400 text-sm inline-flex items-center justify-center"
              >
                Ver historial de búsqueda
              </Link>
            </div>
            <div
              className="shadow d-none d-sm-block"
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
                    style={{
                      fontSize: "clamp(16px, 3vw, 20px)",
                      fontFamily:
                        "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                      fontWeight: 600,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Seguir comprando
                  </h2>
                  <Link
                    to={`/Productos/${lastCatObj?.ruta || ""}`}
                    className="text-primary dark:text-blue-400 text-decoration-none fw-medium text-xs sm:text-sm"
                    style={{ fontSize: "clamp(11px, 2vw, 13px)" }}
                    onClick={() => trackCategoryView(lastCatObj?.ruta)}
                  >
                    Ver historial
                  </Link>
                </div>
                <div className="d-none" />

                {/* Tablet/Desktop: Horizontal scroll */}
                <div
                  className="d-none d-sm-flex flex-nowrap gap-2 gap-md-2 overflow-x-auto pb-1"
                  style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: isDark
                      ? "#475569 #1e293b"
                      : "#cbd5e1 #f1f5f9",
                    WebkitOverflowScrolling: "touch",
                    alignItems: "flex-start",
                    minHeight: "unset",
                  }}
                >
                  {seguirComprandoFiltered.map((p) => {
                    const img = getMainImage(p) || "/placeholder-product.svg";
                    return (
                      <Link
                        to={`/producto/${p.id}`}
                        key={p.id}
                        className="text-decoration-none flex-shrink-0"
                        title={p.nombre}
                        onClick={() => trackProductView(p.id)}
                      >
                        <div
                          className="rounded-3 overflow-hidden d-flex align-items-center justify-content-center w-[140px] h-[140px] md:w-[170px] md:h-[170px] lg:w-[180px] lg:h-[180px]"
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
        )}

      {/* Relacionado con tu búsqueda */}
      {!disableLegacyRows &&
        lastSearchTermDisplay &&
        productosBusqueda.length >= MIN_SEARCH_ITEMS && (
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
                    style={{
                      fontSize: "clamp(16px, 3vw, 20px)",
                      fontFamily:
                        "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                      fontWeight: 600,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Relacionado con tu búsqueda: {lastSearchTermDisplay}
                  </h2>
                  <Link
                    to={`/buscar?q=${encodeURIComponent(lastSearch)}`}
                    className="text-primary dark:text-blue-400 text-decoration-none fw-medium text-xs sm:text-sm"
                    style={{ fontSize: "clamp(11px, 2vw, 13px)" }}
                  >
                    Ver más →
                  </Link>
                </div>
                <div
                  className="d-flex flex-nowrap gap-2 gap-md-2 overflow-x-auto pb-1"
                  style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: isDark
                      ? "#475569 #1e293b"
                      : "#cbd5e1 #f1f5f9",
                    WebkitOverflowScrolling: "touch",
                    alignItems: "flex-start",
                    minHeight: "unset",
                  }}
                >
                  {productosBusqueda.map((p) => {
                    const img = getMainImage(p) || "/placeholder-product.svg";
                    return (
                      <Link
                        to={`/producto/${p.id}`}
                        key={p.id}
                        className="text-decoration-none flex-shrink-0"
                        title={p.nombre}
                        onClick={() => trackProductView(p.id)}
                      >
                        <div
                          className="rounded-3 overflow-hidden d-flex align-items-center justify-content-center w-[140px] h-[140px] md:w-[170px] md:h-[170px] lg:w-[180px] lg:h-[180px]"
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
        )}

      {/* Vistos recientemente */}
      {!disableLegacyRows &&
        productosRecientesFiltered.length >= MIN_RECENT_ITEMS && (
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
                    Vistos recientemente
                  </h2>
                </div>
                <div
                  className="d-flex flex-nowrap gap-2 gap-md-2 overflow-x-auto pb-1"
                  style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: isDark
                      ? "#475569 #1e293b"
                      : "#cbd5e1 #f1f5f9",
                    WebkitOverflowScrolling: "touch",
                    alignItems: "flex-start",
                    minHeight: "unset",
                  }}
                >
                  {productosRecientesFiltered.map((p) => {
                    const img = getMainImage(p) || "/placeholder-product.svg";
                    return (
                      <Link
                        to={`/producto/${p.id}`}
                        key={p.id}
                        className="text-decoration-none flex-shrink-0"
                        title={p.nombre}
                        onClick={() => trackProductView(p.id)}
                      >
                        <div
                          className="rounded-3 overflow-hidden d-flex align-items-center justify-content-center w-[140px] h-[140px] md:w-[170px] md:h-[170px] lg:w-[180px] lg:h-[180px]"
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
        )}

      {/* Bloques del historial unificado (búsquedas, productos, categorías) */}
      {groupedBlocks.length > 0 &&
        groupedBlocks.map((blk) => (
          <motion.section
            key={`${blk.type}:${blk.key}`}
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
                    style={{
                      fontSize: "clamp(12px, 2vw, 16px)",
                      fontFamily:
                        "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                      fontWeight: 600,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Seguir comprando {blk.label}
                  </h2>
                  {blk.moreHref && (
                    <Link
                      to={blk.moreHref}
                      className="text-primary dark:text-blue-400 text-decoration-none fw-medium text-xs sm:text-sm"
                      style={{ fontSize: "clamp(11px, 2vw, 13px)" }}
                    >
                      Ver historial
                    </Link>
                  )}
                </div>
                <div
                  className="d-flex flex-nowrap gap-2 gap-md-2 overflow-x-auto pb-1"
                  style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: isDark
                      ? "#475569 #1e293b"
                      : "#cbd5e1 #f1f5f9",
                    WebkitOverflowScrolling: "touch",
                    alignItems: "flex-start",
                    minHeight: "unset",
                  }}
                >
                  {blk.products.map((p) => {
                    const img = getMainImage(p) || "/placeholder-product.svg";
                    return (
                      <Link
                        to={`/producto/${p.id}`}
                        key={p.id}
                        className="text-decoration-none flex-shrink-0"
                        title={p.nombre}
                        onClick={() => trackProductView(p.id)}
                      >
                        <div
                          className="rounded-3 overflow-hidden d-flex align-items-center justify-content-center w-[140px] h-[140px] md:w-[170px] md:h-[170px] lg:w-[180px] lg:h-[180px]"
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
        ))}

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
                    className="mb-1 fw-semibold"
                    style={{
                      color: isDark ? "#f1f5f9" : "#1e293b",
                      fontSize: "clamp(0.85rem, 1.6vw, 1rem)",
                    }}
                  >
                    Av. Estrella Sadhalá, Santiago de los Caballeros, RD
                  </p>
                  <a
                    href="https://www.google.com/maps?q=19.437,-70.6898056"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-decoration-none"
                    style={{
                      color: isDark ? "#60a5fa" : "#2563eb",
                      fontSize: "clamp(0.75rem, 1.3vw, 0.9rem)",
                    }}
                    aria-label="Ver ubicación en Google Maps"
                    title="Ver en Google Maps"
                  >
                    Ver en Google Maps →
                  </a>
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
                className="w-100 d-flex align-items-center justify-content-center gap-3 py-3 fw-semibold rounded-3 shadow-sm text-decoration-none"
                style={{
                  background: isDark
                    ? "linear-gradient(180deg, rgba(15,23,42,0.6), rgba(15,23,42,0.85))"
                    : "linear-gradient(180deg, rgba(248,250,252,0.7), rgba(239,246,255,0.95))",
                  border: `1px solid ${isDark ? "#334155" : "#cbd5e1"}`,
                  color: isDark ? "#e2e8f0" : "#0f172a",
                  fontSize: "clamp(0.9rem, 2vw, 1.05rem)",
                  backdropFilter: "blur(8px)",
                  transition: "all 0.2s ease",
                }}
                aria-label="Contactar por WhatsApp Tienda"
                title="WhatsApp Tienda"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = isDark
                    ? "0 8px 16px rgba(2,6,23,0.6)"
                    : "0 8px 16px rgba(15,23,42,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "";
                }}
              >
                <span
                  className="d-inline-flex align-items-center justify-content-center rounded-circle"
                  style={{
                    width: 36,
                    height: 36,
                    background: "linear-gradient(135deg, #22c55e, #16a34a)",
                    color: "#fff",
                  }}
                >
                  <FaWhatsapp size={18} />
                </span>
                <span>WhatsApp Tienda</span>
              </a>
            </div>
            <div className="col-12 col-md-6">
              <a
                href="https://wa.me/18095821212?text=Hola%20PlayCenter%2C%20estoy%20interesad%40%20en%20un%20producto%20que%20vi%20en%20su%20página."
                target="_blank"
                rel="noopener noreferrer"
                className="w-100 d-flex align-items-center justify-content-center gap-3 py-3 fw-semibold rounded-3 shadow-sm text-decoration-none"
                style={{
                  background: isDark
                    ? "linear-gradient(180deg, rgba(15,23,42,0.6), rgba(15,23,42,0.85))"
                    : "linear-gradient(180deg, rgba(248,250,252,0.7), rgba(239,246,255,0.95))",
                  border: `1px solid ${isDark ? "#334155" : "#cbd5e1"}`,
                  color: isDark ? "#e2e8f0" : "#0f172a",
                  fontSize: "clamp(0.9rem, 2vw, 1.05rem)",
                  backdropFilter: "blur(8px)",
                  transition: "all 0.2s ease",
                }}
                aria-label="Contactar por WhatsApp Internet"
                title="WhatsApp Internet"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = isDark
                    ? "0 8px 16px rgba(2,6,23,0.6)"
                    : "0 8px 16px rgba(15,23,42,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "";
                }}
              >
                <span
                  className="d-inline-flex align-items-center justify-content-center rounded-circle"
                  style={{
                    width: 36,
                    height: 36,
                    background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                    color: "#fff",
                  }}
                >
                  <FaWhatsapp size={18} />
                </span>
                <span>WhatsApp Internet</span>
              </a>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}

export default Inicio;
