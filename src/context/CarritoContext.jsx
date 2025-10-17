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

  // Deduplicar por (id + colorSeleccionado) al cargar, sumando cantidades
  useEffect(() => {
    setCarrito((prev) => {
      const map = new Map();
      for (const it of prev) {
        const key = `${it.id}__${it.colorSeleccionado ?? ''}`;
        const existing = map.get(key);
        if (existing) {
          map.set(key, {
            ...existing,
            cantidad: (Number(existing.cantidad) || 0) + (Number(it.cantidad) || 0),
            // conser vars y tomar el mayor maxStock conocido
            maxStock: Math.max(
              Number(existing.maxStock ?? 0) || 0,
              Number(it.maxStock ?? 0) || 0
            ) || existing.maxStock || it.maxStock,
          });
        } else {
          map.set(key, { ...it });
        }
      }
      return Array.from(map.values());
    });
    // Solo a la carga inicial
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Guardar favoritos en localStorage
  useEffect(() => {
    localStorage.setItem("favoritos", JSON.stringify(favoritos));
  }, [favoritos]);

  const normalizeColor = (c) => {
    try {
      const s = (c ?? "").toString().trim();
      return s ? s : null;
    } catch {
      return null;
    }
  };

  // 🚨 Validación con stock máximo (soporta variantes por color)
  const agregarAlCarrito = (producto, colorSeleccionado = null) => {
    setCarrito((prev) => {
      const colorKey = normalizeColor(colorSeleccionado);
      // Identificar variante seleccionada (si aplica)
      const variante = colorKey && Array.isArray(producto.variantes)
        ? producto.variantes.find(v => normalizeColor(v.color) === colorKey)
        : null;

      // Determinar el stock máximo permitido para esta línea (variante o producto)
      const stockMaxCalculado =
        (variante && Number(variante.cantidad)) ??
        (producto.maxStock !== undefined ? Number(producto.maxStock) : undefined) ??
        (producto.cantidad !== undefined ? Number(producto.cantidad) : undefined) ??
        Infinity;

      // Buscar en carrito por id y, si aplica, mismo color
      const existe = prev.find((item) => item.id === producto.id && normalizeColor(item.colorSeleccionado) === colorKey);

      if (existe) {
        // Usar SIEMPRE el tope más reciente calculado
        const topeActual = Number.isFinite(stockMaxCalculado) ? stockMaxCalculado : Infinity;
        const tope = topeActual;

        if (existe.cantidad < tope) {
          return prev.map((item) =>
            item.id === producto.id && normalizeColor(item.colorSeleccionado) === colorKey
              ? { ...item, cantidad: item.cantidad + 1, maxStock: topeActual }
              : item
          );
        }
        // Sin cambios si alcanzó el límite
        return prev;
      }

      if (stockMaxCalculado > 0) {
        return [
          ...prev,
          {
            ...producto,
            cantidad: 1,
            colorSeleccionado: colorKey,
            maxStock: stockMaxCalculado,
          },
        ];
      }

      return prev;
    });
  };

  const eliminarUnidadDelCarrito = (productoId, colorSeleccionado = null) => {
    const colorKey = normalizeColor(colorSeleccionado);
    setCarrito((prev) =>
      prev
        .map((item) =>
          item.id === productoId && normalizeColor(item.colorSeleccionado) === colorKey
            ? { ...item, cantidad: item.cantidad - 1 }
            : item
        )
        .filter((item) => item.cantidad > 0)
    );
  };

  const quitarDelCarrito = (productoId, colorSeleccionado = null) => {
    const colorKey = normalizeColor(colorSeleccionado);
    setCarrito((prev) => prev.filter((item) => !(item.id === productoId && normalizeColor(item.colorSeleccionado) === colorKey)));
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
