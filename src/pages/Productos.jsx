// src/pages/Productos.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SidebarCategorias from '../components/SidebarCategorias';
import productos from '../data/productosAll';

function Productos() {
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');

  const productosFiltrados =
    categoriaActiva === 'Todos'
      ? productos
      : productos.filter((p) => p.categoria === categoriaActiva);

  return (
    <div className="flex pt-20 min-h-screen bg-white">
      <SidebarCategorias setCategoriaActiva={setCategoriaActiva} />
      <main className="flex-1 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {productosFiltrados.map((producto) => (
            <div key={producto.id} className="p-4 bg-white shadow rounded">
              <img src={producto.imagen} alt={producto.nombre} className="w-full h-40 object-contain" />
              <h2 className="font-semibold mt-2">{producto.nombre}</h2>
              <p className="text-pink-600 font-bold">${producto.precio}</p>
            </div>
          ))}
        </div>
        <Outlet />
      </main>
    </div>
  );
}

export default Productos;
