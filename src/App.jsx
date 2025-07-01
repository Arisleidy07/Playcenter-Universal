// src/App.jsx
import React from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AnimatedRoutes from "./AnimatedRoutes";import NavbarInferior from "./components/NavbarInferior";





function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <AnimatedRoutes />
        <NavbarInferior />
      </main>
      <Footer />
    </div>
  );
}

export default App;
