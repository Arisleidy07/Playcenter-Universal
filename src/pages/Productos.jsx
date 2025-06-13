import React from "react";
import SidebarCategorias from "../components/SidebarCategorias";
import productosAll from "../data/productosAll";

function Productos() {
  // Unir todos los productos de todas las categorías
  const productos = productosAll.flatMap((cat) =>
    cat.productos.map((prod) => ({
      ...prod,
      categoria: cat.categoria,
    }))
  );

  return (
    <div className="flex pt-20 min-h-screen bg-white">
      <SidebarCategorias />

      <main className="flex-1 p-4">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Todos los productos</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {productos.map((producto) => (
            <div
              key={producto.id}
              className="p-4 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <img
                src={producto.imagen}
                alt={producto.nombre}
                className="w-full h-40 object-contain mb-3"
              />
              <h2 className="text-lg font-semibold text-gray-900 mb-1">{producto.nombre}</h2>
              <p className="text-pink-600 font-bold">${producto.precio}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Productos;
