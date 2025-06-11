// src/components/ProductCard.jsx
import React, { useContext } from 'react';
import { CarritoContext } from '../context/CarritoContext';

const ProductCard = ({ id, nombre, precio, imagen }) => {
    const { agregarAlCarrito, agregarAFavoritos } = useContext(CarritoContext);

    const producto = { id, nombre, precio, imagen };

    return (
    <div className="bg-white rounded-xl shadow-lg p-4 hover:scale-[1.02] transition-all flex flex-col items-center text-center">
        <img src={imagen} alt={nombre} className="w-32 h-32 object-cover mb-2" />
        <h3 className="font-semibold">{nombre}</h3>
        <p className="text-pink-600 font-bold mb-2">${precio}</p>
        <div className="flex gap-3">
        <button
            onClick={() => agregarAlCarrito(producto)}
            className="bg-pink-500 text-white px-3 py-1 rounded-full text-sm hover:bg-pink-600"
        >
            🛒
        </button>
        <button
            onClick={() => agregarAFavoritos(producto)}
            className="border border-pink-500 text-pink-500 px-3 py-1 rounded-full text-sm hover:bg-pink-100"
        >
            ❤️
        </button>
        </div>
    </div>
    );
};

export default ProductCard;
