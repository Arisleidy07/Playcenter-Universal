import React from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AnimatedRoutes from "./AnimatedRoutes";
import NavbarInferior from "./components/NavbarInferior";
import AuthModal from "./components/AuthModal";
import ScrollToTop from "./ScrollToTop"; 

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <ScrollToTop /> 
        <AnimatedRoutes />
        <NavbarInferior />
        <AuthModal />
      </main>
      <Footer />
    </div>
  );
}

export default App;
