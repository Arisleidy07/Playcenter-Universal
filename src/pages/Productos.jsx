// src/pages/Productos.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import SidebarCategorias from '../components/SidebarCategorias';

function Productos() {
    return (
    <div className="flex pt-20 min-h-screen bg-white">
      {/* Barra lateral fija */}
        <SidebarCategorias />

      {/* Aquí se renderiza la categoría activa */}
        <main className="flex-1 p-4">
        <Outlet />
        </main>
    </div>
    );
}

export default Productos;
