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
    // Política responsive del proyecto: desktop solo desde xl (≥1280px)
    return window.innerWidth < 1280;
  });
  const isDesktop = !isMobile;

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
    // Actualizar flag de móvil/desktop en resize (xl breakpoint)
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

  // Ocultar header al hacer scroll hacia abajo y mostrar al subir (TODOS los dispositivos)
  useEffect(() => {
    if (typeof window === "undefined") return;

    let ticking = false;
    const threshold = 8; // px mínimos para considerar cambio

    const onScroll = () => {
      const y = window.scrollY || 0;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const last = lastScrollY.current || 0;
          // Siempre mostrar si estamos muy arriba
          if (y <= 0 || y < headerHeight) {
            setHeaderVisible(true);
            lastScrollY.current = y;
            ticking = false;
            return;
          }
          if (Math.abs(y - last) > threshold) {
            if (y > last && y > headerHeight + 10) {
              // Scroll hacia abajo → ocultar
              setHeaderVisible(false);
            } else {
              // Scroll hacia arriba → mostrar
              setHeaderVisible(true);
            }
            lastScrollY.current = y;
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [headerHeight]);

  return (
    <>
      {/* Mostrar página de error de conexión si no hay internet */}
      {showError ? (
        <ConnectionErrorPage />
      ) : (
        <div
          className={`min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-300`}
        >
          {/* HEADER + TopBar: fijos en todas las vistas. Se ocultan al bajar y aparecen al subir. */}
          <div
            ref={headerRef}
            className="z-[900] w-full flex flex-col shadow-sm transition-transform duration-300 ease-in-out"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              transform: !headerVisible
                ? `translateY(-${headerHeight}px)`
                : "translateY(0)",
              willChange: "transform",
            }}
          >
            <Header />
            {/* TopBar debe estar SIEMPRE debajo del Header y seguir su visibilidad */}
            <TopBar />
          </div>

          {/* MAIN: agregar padding-top igual a la altura del header fijo (Header + TopBar) para evitar solapamientos */}
          <main
            className="flex-grow"
            style={{
              paddingTop: `${headerHeight}px`,
              "--app-header-height": `${headerHeight}px`,
            }}
          >
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
