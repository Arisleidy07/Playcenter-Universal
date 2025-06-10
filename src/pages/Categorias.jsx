// src/pages/Categories.jsx
import React from 'react';

function Categorias() {
    return (
    <div className="min-h-screen p-6">
        <h2 className="text-3xl font-bold mb-4 text-secondary">Categorías</h2>
        <ul className="list-disc ml-6 space-y-2 text-neutral">
        <li>Consolas</li>
        <li>Videojuegos</li>
        <li>VR y Realidad Aumentada</li>
        <li>Componentes de PC</li>
        <li>Accesorios Gamer</li>
        </ul>
    </div>
    );
}

export default Categorias;
5