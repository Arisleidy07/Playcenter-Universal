import React, { useEffect, useState, useRef } from "react";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { NotificationProvider } from "./context/NotificationContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AnimatedRoutes from "./AnimatedRoutes";
import NavbarInferior from "./components/NavbarInferior";
import AuthModal from "./components/AuthModal";
import ScrollToTop from "./ScrollToTop";
import TopBar from "./components/TopBar";
import { initSecurity } from "./security/hostCheck";
import { useMultiAccount } from "./context/MultiAccountContext";
import { AnimatePresence } from "framer-motion";
import AccountSwitchLoader from "./components/AccountSwitchLoader";
import { autoFixFollowers } from "./utils/autoFixFollowers";
import ConnectionErrorPage from "./pages/ConnectionErrorPage";
import { useConnectionStatus } from "./hooks/useConnectionStatus";

function AppContent() {
  const { theme } = useTheme();
  const { isSwitching } = useMultiAccount();
  const { isOnline, showError, setShowError } = useConnectionStatus();
  const [headerVisible, setHeaderVisible] = useState(true);
  const [headerHeight, setHeaderHeight] = useState(0);
  const lastScrollY = useRef(0);
  const headerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.innerWidth < 1280;
  });

  // Medir altura del header dinámicamente
  useEffect(() => {
    const measureHeader = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight;
        setHeaderHeight(height);
      }
    };

    measureHeader();
    window.addEventListener("resize", measureHeader);
    // Actualizar flag de móvil/desktop en resize
    const handleResize = () => setIsMobile(window.innerWidth < 1280);
    window.addEventListener("resize", handleResize);
    // Medir después de un pequeño delay para asegurar que todo está renderizado
    const timer = setTimeout(measureHeader, 100);

    return () => {
      window.removeEventListener("resize", measureHeader);
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, []);

  return (
    <>
      {/* Mostrar página de error de conexión si no hay internet */}
      {showError ? (
        <ConnectionErrorPage />
      ) : (
        <div
          className={`min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-300`}
        >
          {/* HEADER: fijo solo en móvil (<1280px). En desktop es estático para evitar solapamientos. */}
          <div
            ref={headerRef}
            className="z-[900] w-full flex flex-col shadow-sm transition-transform duration-300 ease-in-out"
            style={{
              position: isMobile ? "fixed" : "static",
              top: isMobile ? 0 : "auto",
              left: isMobile ? 0 : "auto",
              right: isMobile ? 0 : "auto",
              transform: "translateY(0)",
            }}
          >
            <Header />
          </div>

          {/* MAIN: en móvil agregamos padding-top igual a la altura del header fijo; en desktop 0 */}
          <main
            className="flex-grow"
            style={{
              paddingTop: isMobile ? `${headerHeight}px` : "0px",
              "--app-header-height": `${headerHeight}px`,
            }}
          >
            {/* TopBar debe desplazarse con el contenido en móvil */}
            <TopBar />
            <ScrollToTop />
            <AnimatedRoutes />
          </main>
          <Footer />
          <NavbarInferior />
          <AuthModal />
        </div>
      )}

      {/* LOADER FULLSCREEN cuando se cambia de cuenta */}
      <AnimatePresence>
        {isSwitching && <AccountSwitchLoader />}
      </AnimatePresence>
    </>
  );
}

function App() {
  const [securityPassed, setSecurityPassed] = useState(false);

  useEffect(() => {
    // Verificar seguridad al cargar la app
    const isSecure = initSecurity();
    setSecurityPassed(isSecure);

    // Limpiar localStorage de sistema obsoleto de productos eliminados
    try {
      localStorage.removeItem("deletedProductIds");
    } catch (e) {
      // Ignorar errores de localStorage
    }

    // Auto-arreglar contadores de seguidores (solo una vez)
    setTimeout(() => {
      autoFixFollowers().catch((err) => {
        // console.error("Error en auto-fix:", err)
      });
    }, 2000);
  }, []);

  // Si no pasa la verificación de seguridad, no renderizar nada
  if (!securityPassed) {
    return null;
  }

  return (
    <NotificationProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </NotificationProvider>
  );
}

export default App;
