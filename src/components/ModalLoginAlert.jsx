// src/components/ModalLoginAlert.jsx
import React from "react";

function ModalLoginAlert({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center shadow-lg">
        <h2 className="text-xl font-bold mb-4">¡Atención!</h2>
        <p className="mb-6">Debes iniciar sesión para agregar productos al carrito o favoritos.</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
          >
            Cerrar
          </button>
          <a
            href="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Iniciar sesión
          </a>
        </div>
      </div>
    </div>
  );
}

export default ModalLoginAlert;
