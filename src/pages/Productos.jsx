import React from "react";
import "../styles/blobCard.css"; // Tus estilos para las tarjetas
import { Outlet, useLocation } from "react-router-dom";
import SidebarCategorias from "../components/SidebarCategorias";

function Productos() {
  const location = useLocation();
  // Verifica si estás en la ruta exacta "/productos"
  const esVistaGeneral = location.pathname === "/productos";

  return (
    <div className="flex pt-20 min-h-screen bg-white">
      {/* Barra lateral con las categorías */}
      <SidebarCategorias />

      {/* Contenido principal, área donde se renderizan los productos o subcategorías */}
      <main className="flex-1 p-4">
        {/* Título solo si estás en la vista general de productos */}
        {esVistaGeneral && (
          <h1 className="text-2xl font-bold mb-6 text-gray-800">
            Todos los productos
          </h1>
        )}
        {/* Aquí se renderiza el contenido anidado, ej: ProductosTodos o categoría */}
        <Outlet />
      </main>
    </div>
  );
}

export default Productos;
