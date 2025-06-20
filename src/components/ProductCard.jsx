// src/components/ProductCard.jsx
import React, { useContext } from 'react';
import { CarritoContext } from '../context/CarritoContext';
import { useNavigate } from 'react-router-dom';
import BotonFavorito from "./BotonFavorito"; // ⬅️ Importamos el botón favorito

const ProductCard = ({ id, nombre, precio, imagen }) => {
    const { agregarAlCarrito } = useContext(CarritoContext);
    const navigate = useNavigate();

    const producto = { id, nombre, precio, imagen };

    const handleClick = () => {
    navigate(`/producto/${id}`, {
        state: { producto },
    });
    };

    return (
    <div onClick={handleClick} className="card cursor-pointer relative">
        <div className="bg"></div>
        <div className="blob"></div>

      {/* Botón favorito arriba a la derecha */}
        <div className="absolute top-2 right-2 z-20">
        <BotonFavorito producto={producto} />
        </div>

        <div className="z-10 text-center">
        <img src={imagen} alt={nombre} className="w-24 h-24 mx-auto mb-2" />
        <h3 className="font-semibold">{nombre}</h3>
        <p className="text-pink-600 font-bold">${precio}</p>
        </div>

        <div className="z-10 flex gap-2 justify-center mt-3">
        <button
            onClick={(e) => {
            e.stopPropagation();
            agregarAlCarrito(producto);
            }}
            className="bg-pink-500 text-white px-3 py-1 rounded-full text-sm hover:bg-pink-600"
        >
            🛒
        </button>
        </div>
    </div>
    );
};

export default ProductCard;
