import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import SidebarCategorias from '../components/SidebarCategorias';
import ProductCard from '../components/ProductCard';
import productos from '../data/productosAll'; // asumiendo que los tienes todos aquí

function Productos() {
  const location = useLocation();
  const enRutaGeneral = location.pathname === '/productos';

  return (
    <div className="flex pt-20 min-h-screen bg-white">
      <SidebarCategorias />

      <main className="flex-1 p-4">
        {enRutaGeneral ? (
          <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {productos.map((prod) => (
              <ProductCard
                key={prod.id}
                nombre={prod.nombre}
                precio={prod.precio}
                imagen={prod.imagen}
                id={prod.id}
              />
            ))}
          </section>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}

export default Productos;
