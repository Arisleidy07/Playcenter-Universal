import React from "react";
import { Outlet } from "react-router-dom";
import SidebarCategorias from "../components/SidebarCategorias";


function Productos() {
  return (
    <div className="flex flex-col sm:flex-row min-h-screen bg-white pt-[90px]">
      <SidebarCategorias />
      <main className="flex-1 p-2 sm:p-4 relative z-[1]">
        <Outlet />
      </main>
    </div>
  );
}

export default Productos;