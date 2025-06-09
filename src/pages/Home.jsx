// src/pages/Home.jsx
import React from 'react';

function Home() {
    return (
    <div className="min-h-screen p-6">
        <h1 className="text-4xl font-bold text-center mb-6 text-primary">Bienvenido a Playcenter Universal</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <div className="bg-purple-100 p-4 rounded-lg shadow hover:scale-105 transition">
            Consolas
        </div>
        <div className="bg-blue-100 p-4 rounded-lg shadow hover:scale-105 transition">
            Juegos
        </div>
        <div className="bg-green-100 p-4 rounded-lg shadow hover:scale-105 transition">
            Accesorios
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg shadow hover:scale-105 transition">
            Tecnología
        </div>
        </div>
    </div>
    );
}

export default Home;
