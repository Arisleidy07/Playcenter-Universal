import React from "react";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AnimatedRoutes from "./AnimatedRoutes";
import NavbarInferior from "./components/NavbarInferior";
import AuthModal from "./components/AuthModal";
import ScrollToTop from "./ScrollToTop";
import TopBar from "./components/TopBar";

function AppContent() {
  const { theme } = useTheme();
  
  return (
    <div className={`min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-300`}>
      <Header />
      <TopBar />
      <main className="flex-grow">
        <ScrollToTop />
        <AnimatedRoutes />
      </main>
      <Footer />
      <NavbarInferior />
      <AuthModal />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
