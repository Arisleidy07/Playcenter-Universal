import React from "react";
import TarjetaProducto from "./TarjetaProducto";

function SliderProductos({ productos }) {
  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex gap-6 px-6 pb-6">
        {productos.map((producto, index) => (
          <div key={index} className="min-w-[220px] flex-shrink-0">
            <TarjetaProducto producto={producto} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default SliderProductos;
