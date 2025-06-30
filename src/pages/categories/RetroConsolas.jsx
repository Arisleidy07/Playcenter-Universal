import React from "react";
import TarjetaProducto from "../../components/TarjetaProducto";
import productosAll from "../../data/productosAll";
import { normalizar } from "../../utils/normalizarCategoria";

function RetroConsolas() {
  const categoria = productosAll.find(
    (cat) => cat.categoria === "Retro Consolas"
  );
  const productos = categoria ? categoria.productos : [];

  return (
    <div className="p-6 pt-28 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Retro Consolas</h1>
      <div className="flex flex-wrap gap-6 justify-between">
        {productos.map((producto) => (
          <div key={producto.id} className="w-full sm:w-[48%]">
            <TarjetaProducto producto={producto} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default RetroConsolas;
