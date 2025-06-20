import React from "react";
import "../styles/blobCard.css";
import { Outlet } from "react-router-dom";
import SidebarCategorias from "../components/SidebarCategorias";

function Productos() {
  return (
    <div className="flex flex-col sm:flex-row  min-h-screen bg-white">
      <SidebarCategorias />

      <main className="flex-1 p-2 sm:p-4">
        <Outlet />
      </main>
    </div>
  );
}

export default Productos;
