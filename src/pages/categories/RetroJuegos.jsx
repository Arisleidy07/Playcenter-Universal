import React from "react";
import TarjetaProducto from "../../components/TarjetaProducto";
import productosAll from "../../data/productosAll";
import { normalizar } from "../../utils/normalizarCategoria";

function RetroJuegos() {
  const categoria = productosAll.find(
    (cat) => cat.categoria === "Retro Juegos"
  );
  const productos = categoria ? categoria.productos : [];

  return (
    <div className="pt-[66px] sm:pt-[80px] px-4 pb-10 bg-white min-h-screen">
      <h1 className="titulo-categoria">Retro Juegos</h1>
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

export default RetroJuegos;
