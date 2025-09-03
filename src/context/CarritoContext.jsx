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

  // Guardar carrito en localStorage
  useEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }, [carrito]);

  // Guardar favoritos en localStorage
  useEffect(() => {
    localStorage.setItem("favoritos", JSON.stringify(favoritos));
  }, [favoritos]);

  // 🚨 Validación con stock máximo
  const agregarAlCarrito = (producto) => {
    setCarrito((prev) => {
      const existe = prev.find((item) => item.id === producto.id);

      // Buscar stock disponible: primero en variante, luego en producto.cantidad
      const stockDisponible =
        producto.cantidad ??
        producto.variantes?.[0]?.cantidad ??
        Infinity;

      if (existe) {
        // Si ya existe en carrito, verificar que no pase del stock
        if (existe.cantidad < stockDisponible) {
          return prev.map((item) =>
            item.id === producto.id
              ? { ...item, cantidad: item.cantidad + 1 }
              : item
          );
        }
        return prev; // No sumar más si llegó al límite
      }

      // Si no existe en carrito, agregar solo si hay stock
      if (stockDisponible > 0) {
        return [...prev, { ...producto, cantidad: 1 }];
      }

      return prev; // No agregar si no hay stock
    });
  };

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

  const vaciarCarrito = () => {
    setCarrito([]);
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
        vaciarCarrito,
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
};

export const useCarrito = () => useContext(CarritoContext);
