import React from "react";

export default function Vender() {
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
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
            Función No Disponible
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            La opción de <strong>Vender</strong> no está disponible en este momento.
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
