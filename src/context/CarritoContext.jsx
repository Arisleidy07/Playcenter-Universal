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

  // Normalizar carrito existente: calcular y rellenar maxStock cuando falte
  useEffect(() => {
    setCarrito((prev) =>
      prev.map((item) => {
        if (item.maxStock !== undefined) return item;
        // Intentar por variante seleccionada
        if (Array.isArray(item.variantes) && item.colorSeleccionado) {
          const v = item.variantes.find((va) => va.color === item.colorSeleccionado);
          if (v && v.cantidad !== undefined) {
            return { ...item, maxStock: Number(v.cantidad) || 0 };
          }
        }
        // Intentar por cantidad del producto si existe en el item
        if (item.cantidadProducto !== undefined) {
          const val = Number(item.cantidadProducto);
          if (!Number.isNaN(val)) return { ...item, maxStock: val };
        }
        // Dejar sin maxStock si no podemos inferir (se tratará como infinito)
        return item;
      })
    );
    // Solo a la carga inicial
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Guardar favoritos en localStorage
  useEffect(() => {
    localStorage.setItem("favoritos", JSON.stringify(favoritos));
  }, [favoritos]);

  // 🚨 Validación con stock máximo (soporta variantes por color)
  const agregarAlCarrito = (producto, colorSeleccionado = null) => {
    setCarrito((prev) => {
      // Identificar variante seleccionada (si aplica)
      const variante = colorSeleccionado && Array.isArray(producto.variantes)
        ? producto.variantes.find(v => v.color === colorSeleccionado)
        : null;

      // Determinar el stock máximo permitido para esta línea (variante o producto)
      const stockMaxCalculado =
        (variante && Number(variante.cantidad)) ??
        (producto.maxStock !== undefined ? Number(producto.maxStock) : undefined) ??
        (producto.cantidad !== undefined ? Number(producto.cantidad) : undefined) ??
        (producto.variantes?.[0]?.cantidad !== undefined ? Number(producto.variantes?.[0]?.cantidad) : undefined) ??
        Infinity;

      // Buscar en carrito por id y, si aplica, mismo color
      const existe = prev.find((item) => item.id === producto.id && (item.colorSeleccionado ?? null) === (colorSeleccionado ?? null));

      if (existe) {
        const tope = (existe.maxStock !== undefined ? Number(existe.maxStock) : stockMaxCalculado);
        if (existe.cantidad < tope) {
          return prev.map((item) =>
            item.id === producto.id && (item.colorSeleccionado ?? null) === (colorSeleccionado ?? null)
              ? { ...item, cantidad: item.cantidad + 1 }
              : item
          );
        }
        return prev; // No sumar más si llegó al límite
      }

      if (stockMaxCalculado > 0) {
        return [
          ...prev,
          {
            ...producto,
            cantidad: 1,
            colorSeleccionado: colorSeleccionado ?? null,
            maxStock: stockMaxCalculado,
          },
        ];
      }

      return prev;
    });
  };

  const eliminarUnidadDelCarrito = (productoId, colorSeleccionado = null) => {
    setCarrito((prev) =>
      prev
        .map((item) =>
          item.id === productoId && (item.colorSeleccionado ?? null) === (colorSeleccionado ?? null)
            ? { ...item, cantidad: item.cantidad - 1 }
            : item
        )
        .filter((item) => item.cantidad > 0)
    );
  };

  const quitarDelCarrito = (productoId, colorSeleccionado = null) => {
    setCarrito((prev) => prev.filter((item) => !(item.id === productoId && (item.colorSeleccionado ?? null) === (colorSeleccionado ?? null))));
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
