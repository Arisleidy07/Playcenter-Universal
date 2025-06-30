    import React, { createContext, useContext, useEffect, useState } from "react";

    export const CarritoContext = createContext();

    export const CarritoProvider = ({ children }) => {
    const [carrito, setCarrito] = useState(() => {
        const guardado = localStorage.getItem("carrito");
        return guardado ? JSON.parse(guardado) : [];
    });

    const [favoritos, setFavoritos] = useState(() => {
        const guardado = localStorage.getItem("favoritos");
        return guardado ? JSON.parse(guardado) : [];
    });

    useEffect(() => {
        localStorage.setItem("carrito", JSON.stringify(carrito));
    }, [carrito]);

    useEffect(() => {
        localStorage.setItem("favoritos", JSON.stringify(favoritos));
    }, [favoritos]);

    const agregarAlCarrito = (producto) => {
        setCarrito((prev) => {
        const existe = prev.find((item) => item.id === producto.id);
        if (existe) {
            return prev.map((item) =>
            item.id === producto.id
                ? { ...item, cantidad: item.cantidad + 1 }
                : item
            );
        }
        return [...prev, { ...producto, cantidad: 1 }];
        });
    };

    // Resta una unidad, y elimina si cantidad queda 0
    const eliminarUnidadDelCarrito = (productoId) => {
        setCarrito((prev) =>
        prev
            .map((item) =>
            item.id === productoId
                ? { ...item, cantidad: item.cantidad - 1 }
                : item
            )
            .filter((item) => item.cantidad > 0)
        );
    };

    // Quita el producto completo del carrito
    const quitarDelCarrito = (productoId) => {
        setCarrito((prev) => prev.filter((item) => item.id !== productoId));
    };

    const toggleCarrito = (producto) => {
        setCarrito((prev) => {
        const existe = prev.find((item) => item.id === producto.id);
        if (existe) {
            return prev.filter((item) => item.id !== producto.id);
        }
        return [...prev, { ...producto, cantidad: 1 }];
        });
    };

    const agregarAFavoritos = (producto) => {
        setFavoritos((prev) =>
        prev.find((p) => p.id === producto.id) ? prev : [...prev, producto]
        );
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
            eliminarUnidadDelCarrito,
            quitarDelCarrito,
            toggleCarrito,
            agregarAFavoritos,
            eliminarDeFavoritos,
        }}
        >
        {children}
        </CarritoContext.Provider>
    );
    };

    export const useCarrito = () => useContext(CarritoContext);
