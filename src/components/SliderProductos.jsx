import React from "react";
import TarjetaProducto from "./TarjetaProducto";

function SliderProductos({ productos }) {
  return (
    <div className="relative w-full overflow-x-auto pb-4">
      <div
        className="flex gap-4 px-4 pb-2 snap-x snap-mandatory overflow-x-auto scroll-smooth scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-transparent"
      >
        {productos.map((producto, index) => (
          <div
            key={index}
            className="snap-start flex-shrink-0 w-[230px] sm:w-[250px] md:w-[260px] lg:w-[280px] xl:w-[300px] transition-transform duration-300"
          >
            <TarjetaProducto producto={producto} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default SliderProductos;
