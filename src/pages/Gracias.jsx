import React from "react";
import { Link } from "react-router-dom";

function Gracias() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-yellow-50 p-4">
      <h1 className="text-3xl font-bold mb-4">¡Gracias por tu compra!</h1>
      <p className="mb-6">Tu pedido fue procesado con éxito.</p>
      <Link
        to="/"
        className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 rounded text-black font-semibold"
      >
        Volver al inicio
      </Link>
    </div>
  );
}

export default Gracias;
