// src/pages/Contact.jsx
import React from 'react';

function Contact() {
    return (
    <div className="min-h-screen p-6">
        <h2 className="text-3xl font-bold mb-4 text-indigo-600">Contáctanos</h2>
        <form className="space-y-4 max-w-md">
        <input type="text" placeholder="Nombre" className="w-full p-2 border rounded" />
        <input type="email" placeholder="Correo electrónico" className="w-full p-2 border rounded" />
        <textarea placeholder="Tu mensaje..." className="w-full p-2 border rounded"></textarea>
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-800">Enviar</button>
        </form>
    </div>
    );
}

export default Contact;
