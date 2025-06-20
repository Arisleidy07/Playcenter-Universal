// src/components/ProductCard.jsx
import React, { useContext } from 'react';
import { CarritoContext } from '../context/CarritoContext';
import { useNavigate } from 'react-router-dom';
import BotonFavorito from "./BotonFavorito";

const ProductCard = ({ id, nombre, precio, imagen }) => {
    const { agregarAlCarrito } = useContext(CarritoContext);
    const navigate = useNavigate();

    const producto = { id, nombre, precio, imagen };

    const handleCardClick = () => {
    navigate(`/producto/${id}`, {
        state: { producto },
    });
    };

    return (
    <div className="relative bg-white rounded-xl shadow-md overflow-hidden group transition hover:shadow-lg">
      {/* Imagen y navegación */}
        <div onClick={handleCardClick} className="cursor-pointer p-4">
        <img src={imagen} alt={nombre} className="w-full h-40 object-contain mb-2" />
        <h3 className="font-semibold text-gray-800">{nombre}</h3>
        <p className="text-pink-600 font-bold">${precio}</p>
        </div>

      {/* Favoritos y carrito al fondo, como Shein */}
        <div className="flex justify-between items-center px-4 py-2 border-t">
        <BotonFavorito producto={producto} />
        <button
            onClick={(e) => {
            e.stopPropagation(); // Para que NO te mande a la vista del producto
            agregarAlCarrito(producto);
            }}
            className="bg-pink-500 text-white px-3 py-1 rounded-full text-sm hover:bg-pink-600"
        >
            🛒 Agregar
        </button>
        </div>
    </div>
    );
};

export default ProductCard;
