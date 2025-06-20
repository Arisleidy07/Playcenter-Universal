import React from "react";
import { Outlet } from "react-router-dom";
import SidebarCategorias from "../components/SidebarCategorias";

function Productos() {
  return (
    <div className="flex flex-col sm:flex-row min-h-screen bg-white mt-[90px] relative z-[1]">
      <SidebarCategorias />
      <main className="flex-1 p-2 sm:p-4">
        <Outlet />
      </main>
    </div>
  );
}

export default Productos;
