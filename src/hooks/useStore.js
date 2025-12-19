import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

/**
 * Hook para gestionar el estado de la tienda del usuario
 * Similar a cómo Facebook maneja "Pages"
 */
export function useStore() {
  const { usuario, usuarioInfo } = useAuth();
  const [tienda, setTienda] = useState(null);
  const [loadingTienda, setLoadingTienda] = useState(true);
  const [modoActual, setModoActual] = useState("personal"); // "personal" | "tienda"

  useEffect(() => {
    if (!usuario) {
      setTienda(null);
      setLoadingTienda(false);
      return;
    }

    // Suscripción en tiempo real a la tienda del usuario
    const storesRef = collection(db, "stores");
    const q = query(storesRef, where("ownerUid", "==", usuario.uid));

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        if (!snapshot.empty) {
          const storeData = {
            id: snapshot.docs[0].id,
            ...snapshot.docs[0].data(),
          };
          setTienda(storeData);

          // CRÍTICO: Sincronizar storeId con el documento del usuario
          // para que ProductManagement y SellerAdminPanel funcionen
          if (usuario?.uid && storeData.id) {
            const currentStoreId = usuarioInfo?.storeId;
            const currentStoreName = usuarioInfo?.storeName;
            const newStoreName = storeData.nombre || storeData.name || "";

            // Solo actualizar si el storeId o storeName cambió
            if (
              currentStoreId !== storeData.id ||
              currentStoreName !== newStoreName
            ) {
              try {
                const userRef = doc(db, "users", usuario.uid);
                await updateDoc(userRef, {
                  storeId: storeData.id,
                  storeName: newStoreName,
                  isSeller: true,
                  role: "seller",
                });
              } catch (err) {
                // Error silencioso - el usuario puede no tener permisos
              }
            }
          }

          // Si el usuario tiene rol de seller, cargar en modo tienda por defecto
          // SOLO si está en rutas de admin
          const isAdminRoute = window.location.pathname.startsWith("/admin");
          if (
            isAdminRoute &&
            (usuarioInfo?.isSeller || usuarioInfo?.role === "seller")
          ) {
            setModoActual("tienda");
          }
        } else {
          setTienda(null);
        }
        setLoadingTienda(false);
      },
      (error) => {
        // console.error("Error al cargar tienda:", error);
        setTienda(null);
        setLoadingTienda(false);
      }
    );

    return () => unsubscribe();
  }, [usuario, usuarioInfo]);

  // Función para cambiar entre modo personal y modo tienda
  const cambiarModo = (nuevoModo) => {
    if (nuevoModo === "tienda" && !tienda) {
      // console.warn("No se puede cambiar a modo tienda sin tener una tienda");
      return false;
    }
    setModoActual(nuevoModo);
    localStorage.setItem("modoActual", nuevoModo);
    return true;
  };

  // Verificar si el usuario tiene tienda
  const tieneTienda = Boolean(tienda);

  // Verificar si está en modo vendedor
  const esVendedor = modoActual === "tienda" && tieneTienda;

  return {
    tienda,
    tieneTienda,
    loadingTienda,
    modoActual,
    cambiarModo,
    esVendedor,
  };
}

/**
 * Hook para obtener productos de una tienda específica
 */
export function useStoreProducts(storeId) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!storeId) {
      setProductos([]);
      setLoading(false);
      return;
    }

    const productosRef = collection(db, "productos");
    const q = query(productosRef, where("storeId", "==", storeId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const prods = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProductos(prods);
        setLoading(false);
      },
      (error) => {
        // console.error("Error al cargar productos de la tienda:", error);
        setProductos([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [storeId]);

  return { productos, loading };
}

/**
 * Hook para obtener órdenes de una tienda específica
 */
export function useStoreOrders(storeId) {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!storeId) {
      setOrdenes([]);
      setLoading(false);
      return;
    }

    const ordersRef = collection(db, "orders");

    // Suscripción a TODAS las órdenes
    const unsubscribe = onSnapshot(
      ordersRef,
      (snapshot) => {
        // Filtrar órdenes que contengan productos de esta tienda
        const orders = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((order) => {
            // Verificar si algún producto de la orden pertenece a esta tienda
            return order.productos?.some((prod) => prod.storeId === storeId);
          });

        setOrdenes(orders);
        setLoading(false);
      },
      (error) => {
        // console.error("Error al cargar órdenes de la tienda:", error);
        setOrdenes([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [storeId]);

  return { ordenes, loading };
}
