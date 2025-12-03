import React, { createContext, useContext, useEffect, useState } from "react";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./AuthContext";

export const CarritoContext = createContext();

// Helper para limpiar valores undefined antes de guardar en Firestore
const cleanForFirestore = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map((item) => cleanForFirestore(item));
  }
  if (obj && typeof obj === "object") {
    const cleaned = {};
    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      if (value !== undefined) {
        cleaned[key] = cleanForFirestore(value);
      }
    });
    return cleaned;
  }
  return obj;
};

export const CarritoProvider = ({ children }) => {
  const { usuario } = useAuth();
  const [carrito, setCarrito] = useState(() => {
    const guardado = localStorage.getItem("carrito");
    return guardado ? JSON.parse(guardado) : [];
  });

  const [favoritos, setFavoritos] = useState(() => {
    const guardado = localStorage.getItem("favoritos");
    return guardado ? JSON.parse(guardado) : [];
  });

  const [cargandoCarrito, setCargandoCarrito] = useState(false);
  const [carritoMigrado, setCarritoMigrado] = useState(false);

  // Limpiar carrito cuando el usuario cierra sesión
  useEffect(() => {
    // Si el usuario es null (cerró sesión), limpiar el carrito
    if (usuario === null) {
      setCarrito([]);
      setFavoritos([]);
      setCarritoMigrado(false);
      // console.log("🗑️ Carrito limpiado al cerrar sesión");
    }
  }, [usuario]);

  // Migrar carrito de localStorage a Firestore cuando el usuario inicia sesión
  useEffect(() => {
    if (!usuario?.uid || carritoMigrado) {
      return;
    }

    const carritoLocal = localStorage.getItem("carrito");
    if (carritoLocal) {
      try {
        const items = JSON.parse(carritoLocal);
        if (items.length > 0) {
          const carritoRef = doc(
            db,
            "usuarios",
            usuario.uid,
            "carrito",
            "items"
          );
          const cleanedItems = cleanForFirestore(items);
          setDoc(carritoRef, { items: cleanedItems }, { merge: true })
            .then(() => {
              // console.log("✅ Carrito migrado a Firestore");
              setCarritoMigrado(true);
            })
            .catch((error) => {
              // console.error("❌ Error al migrar carrito:", error);
            });
        }
      } catch (error) {
        // console.error("Error al parsear carrito local:", error);
      }
    }
  }, [usuario?.uid, carritoMigrado]);

  // Sincronizar carrito con Firestore EN TIEMPO REAL cuando el usuario está autenticado
  useEffect(() => {
    if (!usuario?.uid) {
      // Si no hay usuario, solo usar localStorage
      return;
    }

    setCargandoCarrito(true);

    // Listener en tiempo real del carrito del usuario
    const carritoRef = doc(db, "usuarios", usuario.uid, "carrito", "items");

    const unsubscribe = onSnapshot(
      carritoRef,
      (doc) => {
        if (doc.exists()) {
          const carritoFirestore = doc.data().items || [];
          setCarrito(carritoFirestore);
          localStorage.setItem("carrito", JSON.stringify(carritoFirestore));
        }
        setCargandoCarrito(false);
      },
      (error) => {
        // console.error("Error al escuchar carrito:", error);
        setCargandoCarrito(false);
      }
    );

    return () => unsubscribe();
  }, [usuario?.uid]);

  // Guardar carrito en Firestore Y localStorage
  useEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(carrito));

    // Si hay usuario, guardar también en Firestore
    if (usuario?.uid && !cargandoCarrito) {
      const carritoRef = doc(db, "usuarios", usuario.uid, "carrito", "items");
      const cleanedCarrito = cleanForFirestore(carrito);
      setDoc(carritoRef, { items: cleanedCarrito }, { merge: true }).catch(
        (error) => {
          // console.error("Error al guardar carrito en Firestore:", error);
        }
      );
    }
  }, [carrito, usuario?.uid, cargandoCarrito]);

  // Normalizar carrito existente: calcular y rellenar maxStock cuando falte
  // Solo se ejecuta al inicio y NO cuando se está sincronizando con Firestore
  useEffect(() => {
    if (cargandoCarrito || usuario?.uid) {
      // No normalizar si se está cargando desde Firestore o si hay usuario (Firestore ya tiene los datos normalizados)
      return;
    }

    setCarrito((prev) =>
      prev.map((item) => {
        if (item.maxStock !== undefined) return item;
        // Intentar por variante seleccionada
        if (Array.isArray(item.variantes) && item.colorSeleccionado) {
          const v = item.variantes.find(
            (va) => va.color === item.colorSeleccionado
          );
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
    // Solo a la carga inicial y cuando no hay usuario
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cargandoCarrito, usuario?.uid]);

  // Deduplicar por (id + colorSeleccionado) al cargar, sumando cantidades
  // Solo se ejecuta al inicio y NO cuando se está sincronizando con Firestore
  useEffect(() => {
    if (cargandoCarrito || usuario?.uid) {
      // No deduplicar si se está cargando desde Firestore o si hay usuario
      return;
    }

    setCarrito((prev) => {
      const map = new Map();
      for (const it of prev) {
        const key = `${it.id}__${it.colorSeleccionado ?? ""}`;
        const existing = map.get(key);
        if (existing) {
          map.set(key, {
            ...existing,
            cantidad:
              (Number(existing.cantidad) || 0) + (Number(it.cantidad) || 0),
            // conser vars y tomar el mayor maxStock conocido
            maxStock:
              Math.max(
                Number(existing.maxStock ?? 0) || 0,
                Number(it.maxStock ?? 0) || 0
              ) ||
              existing.maxStock ||
              it.maxStock,
          });
        } else {
          map.set(key, { ...it });
        }
      }
      return Array.from(map.values());
    });
    // Solo a la carga inicial y cuando no hay usuario
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cargandoCarrito, usuario?.uid]);

  // Sincronizar favoritos con Firestore EN TIEMPO REAL cuando el usuario está autenticado
  useEffect(() => {
    if (!usuario?.uid) {
      return;
    }

    const favoritosRef = doc(db, "usuarios", usuario.uid, "favoritos", "items");

    const unsubscribe = onSnapshot(
      favoritosRef,
      (doc) => {
        if (doc.exists()) {
          const favoritosFirestore = doc.data().items || [];
          setFavoritos(favoritosFirestore);
          localStorage.setItem("favoritos", JSON.stringify(favoritosFirestore));
        }
      },
      (error) => {
        // console.error("Error al escuchar favoritos:", error);
      }
    );

    return () => unsubscribe();
  }, [usuario?.uid]);

  // Guardar favoritos en Firestore Y localStorage
  useEffect(() => {
    localStorage.setItem("favoritos", JSON.stringify(favoritos));

    // Si hay usuario, guardar también en Firestore
    if (usuario?.uid) {
      const favoritosRef = doc(
        db,
        "usuarios",
        usuario.uid,
        "favoritos",
        "items"
      );
      const cleanedFavoritos = cleanForFirestore(favoritos);
      setDoc(favoritosRef, { items: cleanedFavoritos }, { merge: true }).catch(
        (error) => {
          // console.error("Error al guardar favoritos en Firestore:", error);
        }
      );
    }
  }, [favoritos, usuario?.uid]);

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
      const variante =
        colorKey && Array.isArray(producto.variantes)
          ? producto.variantes.find((v) => normalizeColor(v.color) === colorKey)
          : null;

      // Determinar el stock máximo permitido para esta línea (variante o producto)
      const stockMaxCalculado =
        (variante && Number(variante.cantidad)) ??
        (producto.maxStock !== undefined
          ? Number(producto.maxStock)
          : undefined) ??
        (producto.cantidad !== undefined
          ? Number(producto.cantidad)
          : undefined) ??
        Infinity;

      // Buscar en carrito por id y, si aplica, mismo color
      const existe = prev.find(
        (item) =>
          item.id === producto.id &&
          normalizeColor(item.colorSeleccionado) === colorKey
      );

      if (existe) {
        // Usar SIEMPRE el tope más reciente calculado
        const topeActual = Number.isFinite(stockMaxCalculado)
          ? stockMaxCalculado
          : Infinity;
        const tope = topeActual;

        if (existe.cantidad < tope) {
          return prev.map((item) =>
            item.id === producto.id &&
            normalizeColor(item.colorSeleccionado) === colorKey
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
          item.id === productoId &&
          normalizeColor(item.colorSeleccionado) === colorKey
            ? { ...item, cantidad: item.cantidad - 1 }
            : item
        )
        .filter((item) => item.cantidad > 0)
    );
  };

  const quitarDelCarrito = (productoId, colorSeleccionado = null) => {
    const colorKey = normalizeColor(colorSeleccionado);
    setCarrito((prev) =>
      prev.filter(
        (item) =>
          !(
            item.id === productoId &&
            normalizeColor(item.colorSeleccionado) === colorKey
          )
      )
    );
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
        cargandoCarrito,
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
};

export const useCarrito = () => useContext(CarritoContext);
