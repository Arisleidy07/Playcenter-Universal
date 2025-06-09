// src/pages/Products.jsx
import React from 'react';

function Productos() {
    return (
    <div className="min-h-screen p-6">
        <h2 className="text-3xl font-bold mb-4 text-accent">Productos Destacados</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div className="p-4 border rounded shadow hover:shadow-xl transition">
            <h3 className="text-lg font-bold">PlayStation 5</h3>
            <p>$499.99</p>
        </div>
        <div className="p-4 border rounded shadow hover:shadow-xl transition">
            <h3 className="text-lg font-bold">Nintendo Switch</h3>
            <p>$299.99</p>
        </div>
        <div className="p-4 border rounded shadow hover:shadow-xl transition">
            <h3 className="text-lg font-bold">Xbox Series X</h3>
            <p>$499.99</p>
        </div>
        </div>
    </div>
    );
}

export default Productos;
