import React from "react";
import { useProductsByCategory } from "../hooks/useProducts";
import TarjetaProducto from "./TarjetaProducto";

function ListaConsolas() {
  // Asumiendo que el ID/slug de la categoría es "consolas"
  const { products, loading, error } = useProductsByCategory("consolas");

  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-600 p-6">Error cargando consolas</p>;
  }

  if (!products || products.length === 0) {
    return <p className="text-center text-gray-600 p-6">No hay productos en esta categoría.</p>;
  }

  return (
    <div className="flex flex-wrap gap-6 justify-center p-8 bg-gray-50 min-h-screen">
      {products.map((producto) => (
        <TarjetaProducto key={producto.id} producto={producto} />
      ))}
    </div>
  );
}

export default ListaConsolas;
