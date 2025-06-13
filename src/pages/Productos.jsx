import React from "react";
import "../styles/blobCard.css";
import { Outlet, useLocation } from "react-router-dom";
import SidebarCategorias from "../components/SidebarCategorias";

function Productos() {
  const location = useLocation();
  const esVistaGeneral = location.pathname === "/productos";

  return (
    <div className="flex pt-20 min-h-screen bg-white">
      <SidebarCategorias />

      <main className="flex-1 p-4">
        {esVistaGeneral && (
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Todos los productos</h1>
        )}
        <Outlet />
      </main>
    </div>
  );
}

export default Productos;
