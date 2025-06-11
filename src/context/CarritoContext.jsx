// src/context/CarritoContext.jsx
import React, { createContext, useContext, useState } from 'react';

export const CarritoContext = createContext();

export const CarritoProvider = ({ children }) => {
    const [carrito, setCarrito] = useState([]);
    const [favoritos, setFavoritos] = useState([]);

    const agregarAlCarrito = (producto) => {
    setCarrito((prev) => [...prev, producto]);
    };

    const agregarAFavoritos = (producto) => {
    setFavoritos((prev) => [...prev, producto]);
    };

    const eliminarDelCarrito = (id) => {
    setCarrito((prev) => prev.filter((item) => item.id !== id));
    };

    const eliminarDeFavoritos = (id) => {
    setFavoritos((prev) => prev.filter((item) => item.id !== id));
    };

    return (
    <CarritoContext.Provider
        value={{
        carrito,
        favoritos,
        agregarAlCarrito,
        agregarAFavoritos,
        eliminarDelCarrito,
        eliminarDeFavoritos,
        }}
    >
        {children}
    </CarritoContext.Provider>
    );
};

// 👇 ESTA ES LA PARTE QUE TE FALTABA
export const useCarrito = () => useContext(CarritoContext);
