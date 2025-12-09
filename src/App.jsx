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

  // Medir altura del header dinámicamente
  useEffect(() => {
    const measureHeader = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight;
        setHeaderHeight(height + 8);
      }
    };

    measureHeader();
    window.addEventListener("resize", measureHeader);
    // Medir después de un pequeño delay para asegurar que todo está renderizado
    const timer = setTimeout(measureHeader, 100);

    return () => {
      window.removeEventListener("resize", measureHeader);
      clearTimeout(timer);
    };
  }, []);

  // Scroll hide/show para el header
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScroll = window.pageYOffset;
          const lastScroll = lastScrollY.current;

          // Si baja más de 50px: ocultar
          if (currentScroll > lastScroll && currentScroll > 50) {
            setHeaderVisible(false);
          }
          // Si sube aunque sea un poquito o está en el top: mostrar INMEDIATAMENTE
          else if (currentScroll < lastScroll || currentScroll === 0) {
            setHeaderVisible(true);
          }

          lastScrollY.current = currentScroll;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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
          {/* HEADER FIXED - Siempre pegado arriba, se oculta/muestra con translateY */}
          <div
            ref={headerRef}
            className="fixed top-0 left-0 right-0 z-40 w-full flex flex-col shadow-sm transition-transform duration-300 ease-in-out"
            style={{
              transform: headerVisible ? "translateY(0)" : "translateY(-100%)",
            }}
          >
            <Header />
            <TopBar />
          </div>

          {/* MAIN con padding-top dinámico para que el contenido NUNCA se tape */}
          <main
            className="flex-grow"
            style={{ paddingTop: `${headerHeight}px` }}
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
