import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Store,
  Package,
  ChevronRight,
  CheckCircle2,
  Shield,
  Globe,
  X,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";

export default function Vender() {
  const navigate = useNavigate();
  const { isDark: darkMode } = useTheme();
  const { usuario, usuarioInfo } = useAuth();
  const [scrollY, setScrollY] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [currentCtaVideoIndex, setCurrentCtaVideoIndex] = useState(0);
  const [verificando, setVerificando] = useState(false);
  const [tieneTienda, setTieneTienda] = useState(false);
  const [nombreTienda, setNombreTienda] = useState("");
  const [storeId, setStoreId] = useState("");
  const [mostrarModalTienda, setMostrarModalTienda] = useState(false);
  const images = ["/vender/2.png", "/vender/3.png", "/vender/4.png"];
  const videos = [
    "/vender/1-.mp4",
    "/vender/2-.mp4",
    "/vender/3-.mp4",
    "/vender/4-.mp4",
    "/vender/5-.mp4",
  ];
  const ctaVideos = [
    "/vender/6-.mp4",
    "/vender/8-.mp4",
    "/vender/9-.mp4",
    "/vender/10-.mp4",
  ];

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cambio automático de imágenes cada 4 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  // Cambio automático de videos cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [videos.length]);

  // Cambio automático de videos CTA cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCtaVideoIndex((prev) => (prev + 1) % ctaVideos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [ctaVideos.length]);

  // Verificar si el usuario ya tiene una tienda
  useEffect(() => {
    const verificarTienda = async () => {
      if (!usuario) {
        setTieneTienda(false);
        setVerificando(false);
        return;
      }

      try {
        setVerificando(true);
        console.log("🔍 Verificando si usuario tiene tienda:", usuario.uid);
        console.log(
          "👤 Info usuario:",
          usuarioInfo?.role,
          usuarioInfo?.isAdmin
        );

        // PRIMERO: Si es ADMIN, verificar tienda Playcenter Universal
        const isAdmin =
          usuarioInfo?.role === "admin" ||
          usuarioInfo?.isAdmin === true ||
          usuarioInfo?.admin === true;

        if (isAdmin) {
          console.log(
            "👑 Usuario es ADMIN, verificando playcenter_universal..."
          );
          const mainStoreDoc = await getDoc(
            doc(db, "tiendas", "playcenter_universal")
          );

          if (mainStoreDoc.exists()) {
            const storeData = mainStoreDoc.data();
            setTieneTienda(true);
            setNombreTienda(
              storeData.nombre || storeData.name || "Playcenter Universal"
            );
            setStoreId("playcenter_universal");
            console.log("✅ Admin tiene tienda: playcenter_universal");
            setVerificando(false);
            return;
          } else {
            console.log("⚠️ Tienda playcenter_universal no encontrada");
          }
        }

        // SEGUNDO: Buscar en la colección "tiendas" (nueva colección principal)
        const searchFields = ["ownerId", "owner_id", "propietarioId", "userId"];

        for (const field of searchFields) {
          const q = query(
            collection(db, "tiendas"),
            where(field, "==", usuario.uid)
          );
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const tiendaData = querySnapshot.docs[0].data();
            const tiendaId = querySnapshot.docs[0].id;
            setTieneTienda(true);
            setNombreTienda(
              tiendaData.nombre || tiendaData.name || "Mi Tienda"
            );
            setStoreId(tiendaId);
            console.log("✅ Usuario tiene tienda en 'tiendas':", tiendaId);
            setVerificando(false);
            return;
          }
        }

        // SEGUNDO: Buscar en la colección "stores" (legacy)
        const storesRef = collection(db, "stores");
        const qStores = query(storesRef, where("ownerUid", "==", usuario.uid));
        const storesSnapshot = await getDocs(qStores);

        if (!storesSnapshot.empty) {
          const tiendaData = storesSnapshot.docs[0].data();
          const tiendaId = storesSnapshot.docs[0].id;
          setTieneTienda(true);
          setNombreTienda(tiendaData.nombre || tiendaData.name || "Mi Tienda");
          setStoreId(tiendaId);
          console.log("✅ Usuario tiene tienda en 'stores':", tiendaId);
          setVerificando(false);
          return;
        }

        // No tiene tienda en ninguna colección
        setTieneTienda(false);
        setStoreId("");
        console.log("❌ Usuario NO tiene tienda");
      } catch (error) {
        console.error("❌ Error verificando tienda:", error);
        setTieneTienda(false);
      } finally {
        setVerificando(false);
      }
    };

    verificarTienda();
  }, [usuario, usuarioInfo]);

  const handleComenzar = () => {
    // Si el usuario ya tiene tienda, mostrar modal
    if (tieneTienda) {
      setMostrarModalTienda(true);
      return;
    }

    // Si no tiene tienda, ir a solicitar
    navigate("/solicitar-vender");
  };

  const handleVisitarTienda = () => {
    setMostrarModalTienda(false);
    // Navegar a la tienda individual del usuario
    if (storeId) {
      navigate(`/tiendas/${storeId}`);
    } else {
      navigate("/admin");
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0 },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        darkMode
          ? "bg-slate-900"
          : "bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50"
      }`}
      style={{ paddingTop: "20px" }}
    >
      {/* HERO SECTION */}
      <section
        className={`relative pt-20 pb-20 lg:pb-32 overflow-x-clip transition-colors duration-500 ${
          darkMode
            ? "bg-slate-900"
            : "bg-gradient-to-br from-blue-100 via-indigo-100 to-slate-100"
        }`}
      >
        {/* Decoración de fondo */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl ${
              darkMode ? "bg-yellow-400/10" : "bg-blue-400/10"
            }`}
          ></div>
          <div
            className={`absolute top-60 -left-40 w-96 h-96 rounded-full blur-3xl ${
              darkMode ? "bg-blue-500/10" : "bg-indigo-400/10"
            }`}
          ></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[45%_55%] gap-8 lg:gap-12 items-center">
            {/* Columna Izquierda - Texto */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="text-left"
            >
              <motion.h1
                variants={fadeInUp}
                className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 transition-colors duration-300 ${
                  darkMode ? "text-white" : "text-slate-900"
                }`}
              >
                Crea una cuenta de vendedor de{" "}
                <span
                  className={darkMode ? "text-yellow-400" : "text-blue-600"}
                >
                  Playcenter Universal
                </span>
              </motion.h1>

              <motion.div
                variants={fadeInUp}
                className="flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-3 sm:gap-4 mb-8"
              >
                <button
                  onClick={handleComenzar}
                  disabled={verificando}
                  className={`group px-6 py-3 sm:px-8 sm:py-3.5 lg:px-10 lg:py-4 rounded-lg font-bold text-sm sm:text-base lg:text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    darkMode
                      ? "bg-yellow-400 text-slate-900 hover:bg-yellow-500 shadow-lg"
                      : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
                  }`}
                >
                  {verificando ? (
                    <>
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Verificando...</span>
                    </>
                  ) : (
                    <>
                      <span>COMENZAR</span>
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
                <button
                  onClick={() =>
                    document
                      .getElementById("beneficios")
                      .scrollIntoView({ behavior: "smooth" })
                  }
                  className={`px-6 py-3 sm:px-8 sm:py-3.5 lg:px-10 lg:py-4 rounded-lg font-semibold text-sm sm:text-base lg:text-lg transition-all duration-300 border-2 ${
                    darkMode
                      ? "border-yellow-400/40 text-yellow-400 hover:bg-yellow-400/10 hover:border-yellow-400/60"
                      : "border-blue-600/40 text-blue-700 hover:bg-blue-600/10 hover:border-blue-600/60"
                  }`}
                >
                  Conocer más
                </button>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                className="flex flex-wrap items-center justify-start gap-4 sm:gap-8"
              >
                <div className="flex items-center space-x-2">
                  <CheckCircle2
                    className={`w-5 h-5 ${
                      darkMode ? "text-yellow-400" : "text-blue-600"
                    }`}
                  />
                  <span
                    className={`text-sm sm:text-base ${
                      darkMode ? "text-gray-200" : "text-gray-600"
                    }`}
                  >
                    Sin costos iniciales
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2
                    className={`w-5 h-5 ${
                      darkMode ? "text-yellow-400" : "text-blue-600"
                    }`}
                  />
                  <span
                    className={`text-sm sm:text-base ${
                      darkMode ? "text-gray-200" : "text-gray-600"
                    }`}
                  >
                    Gestión 100% digital
                  </span>
                </div>
              </motion.div>
            </motion.div>

            {/* Columna Derecha - Imagen */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative flex items-center justify-center lg:justify-start overflow-visible -mr-8 lg:-mr-16"
            >
              <img
                src="/vender/vender.png"
                alt="Vendedor Playcenter"
                className="w-[180%] sm:w-[170%] md:w-[220%] lg:w-[280%] xl:w-[350%] 2xl:w-[400%] h-auto object-contain"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECCIÓN DE BENEFICIOS */}
      <section
        id="beneficios"
        className={`py-20 lg:py-32 transition-colors duration-500 ${
          darkMode
            ? "bg-slate-800"
            : "bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Columna Izquierda - Texto en Recuadro */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className={`p-8 sm:p-10 lg:p-12 rounded-3xl ${
                darkMode ? "bg-slate-900" : "bg-white shadow-xl"
              }`}
            >
              <h2
                className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6 transition-colors duration-300 ${
                  darkMode ? "text-white" : "text-slate-900"
                }`}
              >
                ¿Por qué vender aquí?
              </h2>
              <p
                className={`text-base sm:text-lg md:text-xl mb-8 leading-relaxed transition-colors duration-300 ${
                  darkMode ? "text-gray-100" : "text-gray-700"
                }`}
              >
                Descubre todas las ventajas de unirte al marketplace líder en
                tecnología gaming
              </p>

              <div className="space-y-4">
                {[
                  "Audiencia Gamer: Accede a una comunidad de gamers activos que buscan productos gaming de calidad todos los días.",
                  "Pagos Rápidos: Recibe tus pagos de forma segura y rápida. Procesamiento automático cada semana sin complicaciones.",
                  "Gestión Total: Dashboard completo para gestionar inventario, pedidos, estadísticas y más. Todo en un solo lugar.",
                ].map((text, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2
                      className={`w-6 h-6 flex-shrink-0 mt-1 ${
                        darkMode ? "text-yellow-400" : "text-blue-600"
                      }`}
                    />
                    <p
                      className={`text-sm sm:text-base ${
                        darkMode ? "text-gray-200" : "text-gray-600"
                      }`}
                    >
                      {text}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Columna Derecha - Slideshow de Imágenes */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className={`relative overflow-hidden rounded-3xl aspect-square ${
                darkMode ? "bg-slate-900" : "bg-white shadow-xl"
              }`}
            >
              <div className="relative w-full h-full">
                {images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Beneficio ${index + 1}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                      index === currentImageIndex ? "opacity-100" : "opacity-0"
                    }`}
                  />
                ))}
              </div>

              {/* Indicadores */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentImageIndex
                        ? darkMode
                          ? "bg-yellow-400 w-8"
                          : "bg-blue-600 w-8"
                        : darkMode
                        ? "bg-white/40"
                        : "bg-slate-400/40"
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECCIÓN DE CARACTERÍSTICAS */}
      <section
        className={`py-20 lg:py-32 transition-colors duration-500 ${
          darkMode
            ? "bg-slate-900"
            : "bg-gradient-to-br from-indigo-50 via-blue-50 to-slate-50"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Columna Izquierda - Slideshow de Videos (OCULTO EN MÓVIL) */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className={`hidden lg:block relative overflow-hidden rounded-3xl aspect-square ${
                darkMode ? "bg-slate-800" : "bg-white shadow-xl"
              }`}
            >
              <div className="relative w-full h-full">
                {videos.map((video, index) => (
                  <video
                    key={index}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                      index === currentVideoIndex ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <source src={video} type="video/mp4" />
                  </video>
                ))}
              </div>

              {/* Indicadores */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                {videos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentVideoIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentVideoIndex
                        ? darkMode
                          ? "bg-yellow-400 w-8"
                          : "bg-blue-600 w-8"
                        : darkMode
                        ? "bg-white/40"
                        : "bg-slate-400/40"
                    }`}
                  />
                ))}
              </div>
            </motion.div>

            {/* Columna Derecha - Texto en Recuadro */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className={`p-6 sm:p-8 lg:p-10 rounded-3xl aspect-square flex flex-col justify-center ${
                darkMode ? "bg-slate-800" : "bg-white shadow-xl"
              }`}
            >
              <h2
                className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold mb-3 transition-colors duration-300 ${
                  darkMode ? "text-white" : "text-slate-900"
                }`}
              >
                Todo lo que necesitas para{" "}
                <span
                  className={darkMode ? "text-yellow-400" : "text-blue-600"}
                >
                  vender más
                </span>
              </h2>
              <p
                className={`text-sm sm:text-base md:text-lg mb-4 leading-relaxed transition-colors duration-300 ${
                  darkMode ? "text-gray-100" : "text-gray-700"
                }`}
              >
                Herramientas profesionales diseñadas para que tu negocio crezca
                sin límites
              </p>

              <div className="space-y-3">
                {[
                  {
                    icon: Package,
                    title: "Inventario ilimitado",
                    desc: "Publica todos los productos que quieras",
                  },
                  {
                    icon: Shield,
                    title: "Protección de ventas",
                    desc: "Garantía en cada transacción",
                  },
                  {
                    icon: Globe,
                    title: "Envíos a todo el país",
                    desc: "Logística integrada",
                  },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`flex items-start space-x-3 p-3 rounded-2xl transition-all duration-300 ${
                      darkMode ? "hover:bg-slate-800/50" : "hover:bg-white/50"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
                        darkMode ? "bg-yellow-400" : "bg-blue-600"
                      }`}
                    >
                      <item.icon
                        className={`w-5 h-5 ${
                          darkMode ? "text-gray-900" : "text-white"
                        }`}
                      />
                    </div>
                    <div>
                      <h4
                        className={`text-base sm:text-lg font-bold mb-1 transition-colors duration-300 ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {item.title}
                      </h4>
                      <p
                        className={`text-sm sm:text-base transition-colors duration-300 ${
                          darkMode ? "text-gray-100" : "text-gray-600"
                        }`}
                      >
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECCIÓN FINAL - CTA */}
      <section
        className={`relative py-20 lg:py-32 overflow-hidden transition-colors duration-500 ${
          darkMode
            ? "bg-slate-900"
            : "bg-gradient-to-br from-blue-100 via-indigo-100 to-slate-100"
        }`}
      >
        {/* Decoración de fondo */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl ${
              darkMode ? "bg-yellow-400/20" : "bg-blue-400/20"
            }`}
          ></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Columna Izquierda - Texto */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-left"
            >
              <h2
                className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6 transition-colors duration-300 ${
                  darkMode ? "text-white" : "text-slate-900"
                }`}
              >
                ¿Listo para empezar?
              </h2>
              <p
                className={`text-base sm:text-lg md:text-xl mb-8 transition-colors duration-300 ${
                  darkMode ? "text-gray-100" : "text-gray-700"
                }`}
              >
                Únete a cientos de vendedores que ya están creciendo con
                Playcenter Universal
              </p>

              <button
                onClick={handleComenzar}
                className={`group w-full lg:w-auto px-6 py-3 sm:px-8 sm:py-3.5 lg:px-10 lg:py-4 rounded-lg font-bold text-sm sm:text-base lg:text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl inline-flex items-center justify-center gap-2 ${
                  darkMode
                    ? "bg-yellow-400 text-slate-900 hover:bg-yellow-500 shadow-lg"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
                }`}
              >
                <span>COMENZAR</span>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <p
                className={`mt-8 text-base sm:text-lg transition-colors duration-300 ${
                  darkMode ? "text-gray-200" : "text-gray-600"
                }`}
              >
                Sin costos de registro • Configura tu tienda en minutos •
                Soporte 24/7
              </p>
            </motion.div>

            {/* Columna Derecha - Slideshow de Videos */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className={`relative overflow-hidden rounded-3xl aspect-square ${
                darkMode ? "bg-slate-800" : "bg-white shadow-xl"
              }`}
            >
              <div className="relative w-full h-full">
                {ctaVideos.map((video, index) => (
                  <video
                    key={index}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                      index === currentCtaVideoIndex
                        ? "opacity-100"
                        : "opacity-0"
                    }`}
                  >
                    <source src={video} type="video/mp4" />
                  </video>
                ))}
              </div>

              {/* Indicadores */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                {ctaVideos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentCtaVideoIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentCtaVideoIndex
                        ? darkMode
                          ? "bg-yellow-400 w-8"
                          : "bg-blue-600 w-8"
                        : darkMode
                        ? "bg-white/40"
                        : "bg-slate-400/40"
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Modal: Ya tienes tienda */}
      <AnimatePresence>
        {mostrarModalTienda && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
            onClick={() => setMostrarModalTienda(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative max-w-md w-full rounded-2xl p-6 sm:p-8 shadow-2xl ${
                darkMode ? "bg-slate-800" : "bg-white"
              }`}
            >
              {/* Botón cerrar */}
              <button
                onClick={() => setMostrarModalTienda(false)}
                className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
                  darkMode
                    ? "hover:bg-slate-700 text-gray-300"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
              >
                <X size={20} />
              </button>

              {/* Icono */}
              <div className="flex justify-center mb-6">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    darkMode ? "bg-yellow-400/20" : "bg-blue-100"
                  }`}
                >
                  <Store
                    className={`w-8 h-8 ${
                      darkMode ? "text-yellow-400" : "text-blue-600"
                    }`}
                  />
                </div>
              </div>

              {/* Título */}
              <h2
                className={`text-2xl sm:text-3xl font-bold text-center mb-4 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                ¡Ya tienes una tienda!
              </h2>

              {/* Mensaje */}
              <p
                className={`text-center mb-6 text-base sm:text-lg ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Ya cuentas con tu tienda{" "}
                <span
                  className={`font-bold ${
                    darkMode ? "text-yellow-400" : "text-blue-600"
                  }`}
                >
                  "{nombreTienda}"
                </span>
                . No puedes crear otra tienda con esta cuenta.
              </p>

              {/* Botones */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleVisitarTienda}
                  className={`w-full py-3 px-6 rounded-lg font-bold text-white transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2 ${
                    darkMode
                      ? "bg-yellow-400 hover:bg-yellow-500 text-gray-900"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  <Store size={20} />
                  <span>Ver mi tienda</span>
                  <ExternalLink size={16} />
                </button>

                <button
                  onClick={() => {
                    setMostrarModalTienda(false);
                    navigate("/admin");
                  }}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 border-2 ${
                    darkMode
                      ? "border-yellow-400/40 text-yellow-400 hover:bg-yellow-400/10"
                      : "border-blue-600/40 text-blue-700 hover:bg-blue-600/10"
                  }`}
                >
                  Ir al panel de administración
                </button>

                <button
                  onClick={() => setMostrarModalTienda(false)}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 border-2 ${
                    darkMode
                      ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
