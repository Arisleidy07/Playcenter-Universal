import React from "react";

export default function Tiendas() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ paddingTop: 'var(--content-offset, 100px)' }}
    >
      <div className="max-w-2xl w-full text-center">
        <div className="bg-white rounded-3xl shadow-2xl p-12 border-2 border-gray-100">
          <div className="mb-6">
            <svg
              className="w-24 h-24 mx-auto text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
            Función No Disponible
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            La opción de <strong>Tiendas</strong> no está disponible en este momento.
          </p>
          <p className="text-md text-gray-500">
            Por favor, vuelva más tarde. Estamos trabajando para habilitarla pronto.
          </p>
          <div className="mt-10">
            <a
              href="/"
              className="inline-block px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Volver al Inicio
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
