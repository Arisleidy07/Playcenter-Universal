import React, { useState } from "react";
import { FaThList } from "react-icons/fa";
import SidebarCategorias from "../components/SidebarCategorias";
import { useLocation } from "react-router-dom";
import { Outlet } from "react-router-dom";

function Productos() {
  const [mostrarCategorias, setMostrarCategorias] = useState(false);
  const location = useLocation();

  return (
    <div className="flex flex-col sm:flex-row min-h-screen bg-white">
      {/* Botón fijo arriba en móvil */}
      {!mostrarCategorias && (
        <div className="sm:hidden fixed top-[76px] left-4 z-[9999]">
          <button
            onClick={() => setMostrarCategorias(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#4FC3F7] text-white rounded-full shadow-lg font-semibold text-sm"
            aria-expanded={mostrarCategorias}
            aria-controls="sidebar-categorias"
          >
            <FaThList />
            Categorías
          </button>
        </div>
      )}

      {/* Sidebar */}
      <SidebarCategorias
        mostrarEnMovil={mostrarCategorias}
        setMostrarEnMovil={setMostrarCategorias}
      />

      <main className="flex-1 p-2 sm:p-4 relative z-[1]">
        {location.pathname === "/productos" ? (
          <p className="text-center text-gray-500 mt-10">
            Selecciona una categoría para ver productos.
          </p>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}

export default Productos;
