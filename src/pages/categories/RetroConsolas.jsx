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
    <div className="pt-[0px] sm:pt-[0px] px-4 pb-10 bg-white min-h-screen">
      <h1 className="titulo-categoria">Retro Consolas</h1>
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
