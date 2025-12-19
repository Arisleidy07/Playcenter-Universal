import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../hooks/useStore";
import { notify } from "../utils/notificationBus";
import LoadingSpinner from "./LoadingSpinner";
import { FiEye, FiEyeOff, FiCopy, FiTrash2, FiPackage } from "react-icons/fi";
import { addPhantomProduct } from "../utils/phantomProductsCleaner";

const ProductManagement = ({ onAddProduct, onEditProduct }) => {
  const { usuario, usuarioInfo } = useAuth();
  const { tienda, tieneTienda } = useStore();
  const { isDark } = useTheme();
  const isAdmin = usuarioInfo?.isAdmin === true;
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("nombre");
  const [phantomProductIds, setPhantomProductIds] = useState(() => {
    // Inicializar desde localStorage
    try {
      const stored = localStorage.getItem("phantomProducts");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Verificar permisos al cargar
  useEffect(() => {
    if (!usuario) {
      // Usuario no autenticado
    }
  }, [usuario]);
  const [sortOrder, setSortOrder] = useState("asc");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [editingQuantity, setEditingQuantity] = useState(null);
  const [editingPrice, setEditingPrice] = useState(null);

  // Filtros avanzados
  const [statusFilter, setStatusFilter] = useState(""); // '' | 'activo' | 'inactivo'
  const [stockFilter, setStockFilter] = useState(""); // '' | 'agotado' | 'bajo' | 'disponible'
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [dateFrom, setDateFrom] = useState(""); // yyyy-mm-dd
  const [dateTo, setDateTo] = useState(""); // yyyy-mm-dd
  const [companyFilter, setCompanyFilter] = useState(""); // solo admin
  const [storeFilter, setStoreFilter] = useState(""); // Filtro por tienda (solo admin)
  const [availableStores, setAvailableStores] = useState([]); // Lista de tiendas

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    const unsub = loadProducts();
    return () => {
      if (typeof unsub === "function") unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario?.uid, usuarioInfo?.isAdmin, usuarioInfo?.storeId, tienda?.id]);

  // Sincronizar estado de fantasmas con localStorage
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "phantomProducts") {
        try {
          const newPhantoms = e.newValue ? JSON.parse(e.newValue) : [];
          setPhantomProductIds(newPhantoms);
        } catch (error) {
          // Error silencioso
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const loadCategories = async () => {
    try {
      const categoriasSnap = await getDocs(collection(db, "categorias"));
      const categoriasData = categoriasSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCategories(categoriasData);
    } catch (error) {
      // Error silencioso
    }
  };

  const loadProducts = () => {
    try {
      let qRef;

      // CASO 1: Super Admin - Ve TODOS los productos
      if (isAdmin) {
        qRef = query(
          collection(db, "productos"),
          orderBy("fechaCreacion", "desc")
        );
      }
      // CASO 2: Vendedor con storeId - Solo ve sus productos (filtrado por storeId)
      // Usar storeId del usuario O del hook useStore como fallback
      else if (usuarioInfo?.storeId || tienda?.id) {
        const effectiveStoreId = usuarioInfo?.storeId || tienda?.id;
        qRef = query(
          collection(db, "productos"),
          where("storeId", "==", effectiveStoreId),
          orderBy("fechaCreacion", "desc")
        );
      }
      // CASO 3: Vendedor SIN storeId - No muestra nada
      else {
        // No cargar productos, mostrar mensaje vacío
        setProducts([]);
        setLoading(false);
        return () => {}; // Retornar función vacía
      }

      const unsubscribe = onSnapshot(
        qRef,
        (snapshot) => {
          // USAR ESTADO LOCAL en lugar de localStorage para evitar race conditions
          setPhantomProductIds((currentPhantoms) => {
            // Filtrar productos: excluir fantasmas y verificar que existan
            const productsData = [];

            snapshot.docs.forEach((doc) => {
              const isPhantom = currentPhantoms.includes(doc.id);

              if (!isPhantom && doc.exists()) {
                productsData.push({
                  id: doc.id,
                  ...doc.data(),
                });
              }
            });

            setProducts(productsData);
            setLoading(false);

            // Retornar el estado sin cambios
            return currentPhantoms;
          });
        },
        (error) => {
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (error) {
      setLoading(false);
      return null;
    }
  };

  // Opciones de empresas (solo admin): a partir de ownerName/empresa presentes
  const companyOptions = useMemo(() => {
    if (!isAdmin) return [];
    const set = new Set();
    products.forEach((p) => {
      const name = (p.ownerName || p.empresa || "").trim();
      if (name) set.add(name);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [isAdmin, products]);

  // Opciones de tiendas (solo admin): extraer tiendas únicas de los productos
  const storeOptions = useMemo(() => {
    if (!isAdmin) return [];
    const storesMap = new Map();
    products.forEach((p) => {
      if (p.storeId && p.storeName) {
        storesMap.set(p.storeId, p.storeName);
      }
    });
    return Array.from(storesMap.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [isAdmin, products]);

  const getTotalStock = (p) => {
    try {
      if (typeof p?.cantidad === "number") return Number(p.cantidad) || 0;
      if (Array.isArray(p?.variantes) && p.variantes.length) {
        return p.variantes.reduce(
          (acc, v) => acc + (parseInt(v?.cantidad) || 0),
          0
        );
      }
      return Number.POSITIVE_INFINITY; // si no está definido, considerar disponible
    } catch {
      return Number.POSITIVE_INFINITY;
    }
  };

  const toggleProductStatus = async (productId, currentStatus) => {
    try {
      const productRef = doc(db, "productos", productId);

      // Verificar que el producto existe
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) {
        // Eliminar del estado local si no existe en Firebase
        setProducts((prevProducts) =>
          prevProducts.filter((p) => p.id !== productId)
        );
        notify(
          "Este producto no existe en la base de datos y ha sido eliminado de la lista.",
          "info",
          "Producto eliminado"
        );
        return;
      }

      await updateDoc(productRef, {
        activo: !currentStatus,
        fechaActualizacion: new Date(),
      });
    } catch (error) {
      notify(
        `Error al actualizar el estado del producto: ${error.message}`,
        "error",
        "Error"
      );
    }
  };

  const duplicateProduct = async (product) => {
    try {
      // Verificar que el producto existe y obtener datos actualizados
      const productRef = doc(db, "productos", product.id);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) {
        // Eliminar del estado local si no existe en Firebase
        setProducts((prevProducts) =>
          prevProducts.filter((p) => p.id !== product.id)
        );
        notify(
          "Este producto no existe en la base de datos y ha sido eliminado de la lista. No se puede duplicar.",
          "warning",
          "Producto no encontrado"
        );
        return;
      }

      // Obtener datos actualizados del producto
      const originalProduct = productSnap.data();

      // Crear un nuevo ID único para el producto duplicado
      const newProductId = `prod_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)}`;

      // Realizar una copia profunda del producto
      const newProduct = JSON.parse(JSON.stringify(originalProduct));

      // Actualizar campos específicos en la copia
      newProduct.nombre = `${originalProduct.nombre} (Copia)`;
      newProduct.fechaCreacion = new Date();
      newProduct.fechaActualizacion = new Date();

      // Asegurar que la categoría se mantenga
      if (!newProduct.categoria && originalProduct.categoria) {
        newProduct.categoria = originalProduct.categoria;
      }

      // Asegurar que el producto esté activo
      newProduct.activo = true;

      // Asegurar que tenga un estado válido
      if (!newProduct.estado) {
        newProduct.estado = "activo";
      }

      // Asegurar que el producto duplicado sea independiente del original
      // Generar nuevos IDs para variantes si existen
      if (
        Array.isArray(newProduct.variantes) &&
        newProduct.variantes.length > 0
      ) {
        newProduct.variantes = newProduct.variantes.map((variante) => {
          // Crear copia profunda de la variante
          const newVariante = { ...variante };

          // Asignar nuevo ID único a la variante
          newVariante.id = `var_${Date.now()}_${Math.random()
            .toString(36)
            .substring(2, 7)}`;

          // Si la variante tiene medios, asegurarse de que sean independientes
          if (
            Array.isArray(newVariante.media) &&
            newVariante.media.length > 0
          ) {
            // Los medios se mantienen igual ya que son URLs a Firebase Storage
            // pero aseguramos que cada objeto de medio tenga un ID único
            newVariante.media = newVariante.media.map((medio) => ({
              ...medio,
              id: `med_${Date.now()}_${Math.random()
                .toString(36)
                .substring(2, 7)}`,
            }));
          }

          return newVariante;
        });
      }

      // Asegurar que los medios del producto principal también sean independientes
      if (Array.isArray(newProduct.media) && newProduct.media.length > 0) {
        newProduct.media = newProduct.media.map((medio) => ({
          ...medio,
          id: `med_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        }));
      }

      // Para compatibilidad con productos antiguos que usan 'imagenes' en lugar de 'media'
      if (
        Array.isArray(newProduct.imagenes) &&
        newProduct.imagenes.length > 0
      ) {
        // Mantener las URLs pero crear un nuevo array para evitar referencias
        newProduct.imagenes = [...newProduct.imagenes];
      }

      // Producto duplicado creado exitosamente

      // Guardar el nuevo producto en Firestore
      await setDoc(doc(db, "productos", newProductId), newProduct);

      // Producto guardado en Firestore

      // Pequeño delay para asegurar que Firebase procese el documento
      await new Promise((resolve) => setTimeout(resolve, 500));

      notify(
        `Producto duplicado exitosamente con ID: ${newProductId}`,
        "success",
        "Producto duplicado"
      );
    } catch (error) {
      notify(
        `Error al duplicar el producto: ${error.message}`,
        "error",
        "Error"
      );
    }
  };

  const updateProductField = async (productId, field, value) => {
    try {
      const productRef = doc(db, "productos", productId);

      // Verificar que el producto existe
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) {
        // Eliminar del estado local si no existe en Firebase
        setProducts((prevProducts) =>
          prevProducts.filter((p) => p.id !== productId)
        );
        notify(
          "Este producto no existe en la base de datos y ha sido eliminado de la lista.",
          "info",
          "Producto eliminado"
        );
        return;
      }

      await updateDoc(productRef, {
        [field]: value,
        fechaActualizacion: new Date(),
      });
    } catch (error) {
      notify(
        `Error al actualizar ${field}: ${error.message}`,
        "error",
        "Error"
      );
    }
  };

  const deleteProduct = async () => {
    if (!productToDelete) return;

    const productId = productToDelete.id;
    const nombreProducto = productToDelete.nombre || "Producto";

    // Cerrar modal
    setShowDeleteModal(false);
    setProductToDelete(null);

    try {
      const docRef = doc(db, "productos", productId);

      // Verificar si el documento existe
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        // Si NO existe en Firebase, forzar limpieza del caché
        setPhantomProductIds((prevPhantoms) => {
          if (!prevPhantoms.includes(productId)) {
            const newPhantoms = [...prevPhantoms, productId];
            localStorage.setItem(
              "phantomProducts",
              JSON.stringify(newPhantoms)
            );
            return newPhantoms;
          }
          return prevPhantoms;
        });

        // IMPORTANTE: Forzar actualización inmediata del estado de productos
        setProducts((prevProducts) =>
          prevProducts.filter((p) => p.id !== productId)
        );

        const toast = document.createElement("div");
        toast.textContent = `"${nombreProducto}" eliminado permanentemente (fantasma limpiado)`;
        toast.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #dc2626;
          color: white;
          padding: 16px 24px;
          border-radius: 8px;
          font-weight: 600;
          z-index: 10000;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
        return;
      }

      // Si existe en Firebase, eliminarlo
      await deleteDoc(docRef);

      // Verificar que se eliminó
      const verificacion = await getDoc(docRef);
      if (verificacion.exists()) {
        notify(
          "Error: No se pudo eliminar de Firebase. Verifica los permisos.",
          "error",
          "Error al eliminar"
        );
        return;
      }

      // Eliminar del estado local
      setProducts((prevProducts) =>
        prevProducts.filter((p) => p.id !== productId)
      );

      // Toast de confirmación
      const toast = document.createElement("div");
      toast.textContent = `"${nombreProducto}" eliminado`;
      toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #2563eb;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        font-weight: 600;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      `;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } catch (error) {
      notify(`Error: ${error.message}`, "error", "Error");
    }
  };

  const filteredProducts = products
    .filter((product) => {
      try {
        const term = searchTerm.toLowerCase();
        const matchesSearch =
          (product.nombre || "").toLowerCase().includes(term) ||
          (product.descripcion || "").toLowerCase().includes(term) ||
          (product.empresa || "").toLowerCase().includes(term) ||
          (product.categoria || "").toLowerCase().includes(term);

        const matchesCategory =
          !selectedCategory || product.categoria === selectedCategory;

        const matchesStatus =
          !statusFilter ||
          (statusFilter === "activo"
            ? product.activo !== false
            : product.activo === false);

        const totalStock = getTotalStock(product);
        const stockStatus = Number.isFinite(totalStock)
          ? totalStock <= 0
            ? "agotado"
            : totalStock <= 5
            ? "bajo"
            : "disponible"
          : "disponible";
        const matchesStock = !stockFilter || stockStatus === stockFilter;

        const price = parseFloat(product.precio) || 0;
        const matchesPrice =
          (priceMin === "" || price >= parseFloat(priceMin)) &&
          (priceMax === "" || price <= parseFloat(priceMax));

        const createdAtMs = product?.fechaCreacion?.seconds
          ? product.fechaCreacion.seconds * 1000
          : product?.fechaCreacion
          ? new Date(product.fechaCreacion).getTime()
          : null;
        const fromOk =
          !dateFrom ||
          (createdAtMs &&
            createdAtMs >= new Date(dateFrom).setHours(0, 0, 0, 0));
        const toOk =
          !dateTo ||
          (createdAtMs &&
            createdAtMs <= new Date(dateTo).setHours(23, 59, 59, 999));
        const matchesDate = fromOk && toOk;

        const matchesCompany =
          !isAdmin ||
          !companyFilter ||
          (product.ownerName || product.empresa || "") === companyFilter;

        const matchesStore =
          !isAdmin || !storeFilter || product.storeId === storeFilter;

        return (
          matchesSearch &&
          matchesCategory &&
          matchesStatus &&
          matchesStock &&
          matchesPrice &&
          matchesDate &&
          matchesCompany &&
          matchesStore
        );
      } catch (error) {
        return false; // Excluir productos corruptos del filtro
      }
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === "precio") {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else if (
        sortBy === "fechaCreacion" ||
        sortBy === "fechaActualizacion"
      ) {
        aValue = new Date(aValue?.seconds ? aValue.seconds * 1000 : aValue);
        bValue = new Date(bValue?.seconds ? bValue.seconds * 1000 : bValue);
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.nombre || categoryId;
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
    return d.toLocaleDateString("es-ES");
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "DOP",
    }).format(price || 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-lg">
        <div className="text-center">
          <LoadingSpinner size="xlarge" color="blue" variant="bars" />
          <p className="text-gray-700 dark:text-gray-300 text-lg font-semibold mt-4 animate-pulse">
            Cargando productos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-blue-900">
            Gestión de Productos
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-gray-600">
              {filteredProducts.length} de {products.length} productos
            </p>
            {isAdmin && storeFilter && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                🏪{" "}
                {storeOptions.find((s) => s.id === storeFilter)?.name ||
                  "Tienda seleccionada"}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onAddProduct}
          className="bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Agregar Producto
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas las categorías</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Tienda - Solo para Admin */}
          {isAdmin && storeOptions.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🏪 Filtrar por Tienda
              </label>
              <div className="flex gap-2">
                <select
                  value={storeFilter}
                  onChange={(e) => setStoreFilter(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gradient-to-r from-blue-50 to-purple-50"
                >
                  <option value="">📦 Todas las tiendas</option>
                  {storeOptions.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
                {storeFilter && (
                  <button
                    onClick={() => setStoreFilter("")}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    title="Limpiar filtro de tienda"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ordenar por
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="nombre">Nombre</option>
              <option value="precio">Precio</option>
              <option value="fechaCreacion">Fecha de creación</option>
              <option value="fechaActualizacion">Última actualización</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Orden
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="desc">Descendente</option>
              <option value="asc">Ascendente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
        <AnimatePresence>
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
            >
              {/* Product Image (contain to avoid cropping) */}
              <div className="relative h-48 bg-white rounded-t-lg overflow-hidden flex items-center justify-center">
                {(() => {
                  try {
                    const mainImage =
                      product.imagen ||
                      (Array.isArray(product.imagenes) &&
                      product.imagenes.length > 0
                        ? product.imagenes[0]
                        : null) ||
                      (Array.isArray(product.variantes) &&
                      product.variantes.length > 0 &&
                      product.variantes[0].imagen
                        ? product.variantes[0].imagen
                        : null);

                    return mainImage ? (
                      <img
                        src={mainImage}
                        alt={product.nombre || "Producto"}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="text-sm">Sin imagen</span>
                      </div>
                    );
                  } catch (error) {
                    // Error silencioso
                    return (
                      <div className="w-full h-full flex items-center justify-center text-red-400 bg-red-50">
                        <span className="text-sm">Error en imagen</span>
                      </div>
                    );
                  }
                })()}
                <div
                  className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50"
                  style={{ display: "none" }}
                >
                  <div className="text-center">
                    <svg
                      className="w-12 h-12 mx-auto mb-2 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-sm">Sin imagen</span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.activo
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {product.activo ? "Activo" : "Inactivo"}
                  </span>
                </div>

                {/* Offer Badge */}
                {product.oferta && (
                  <div className="absolute top-2 left-2">
                    <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Oferta
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-2">
                    {product.nombre}
                  </h3>
                  <button
                    onClick={() =>
                      toggleProductStatus(product.id, product.activo)
                    }
                    className={`ml-2 p-1 rounded ${
                      product.activo
                        ? "text-green-600 hover:bg-green-50"
                        : "text-red-600 hover:bg-red-50"
                    }`}
                    title={product.activo ? "Desactivar" : "Activar"}
                  >
                    {product.activo ? <FiEye /> : <FiEyeOff />}
                  </button>
                </div>

                <p className="text-sm text-gray-600 mb-2">
                  {getCategoryName(product.categoria)}
                </p>

                <div className="flex items-center justify-between mb-2">
                  {editingPrice === product.id ? (
                    <input
                      type="number"
                      step="0.01"
                      defaultValue={product.precio}
                      onBlur={(e) => {
                        updateProductField(
                          product.id,
                          "precio",
                          parseFloat(e.target.value) || 0
                        );
                        setEditingPrice(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          updateProductField(
                            product.id,
                            "precio",
                            parseFloat(e.target.value) || 0
                          );
                          setEditingPrice(null);
                        }
                        if (e.key === "Escape") {
                          setEditingPrice(null);
                        }
                      }}
                      className="text-lg font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded px-2 py-1 w-24"
                      autoFocus
                    />
                  ) : (
                    <p
                      className="text-lg font-bold text-blue-700 cursor-pointer hover:bg-blue-50 px-2 py-1 rounded"
                      onClick={() => setEditingPrice(product.id)}
                      title="Click para editar precio"
                    >
                      {formatPrice(product.precio)}
                    </p>
                  )}

                  {product.cantidad !== undefined && (
                    <div className="text-sm">
                      {editingQuantity === product.id ? (
                        <input
                          type="number"
                          min="0"
                          defaultValue={product.cantidad}
                          onBlur={(e) => {
                            updateProductField(
                              product.id,
                              "cantidad",
                              parseInt(e.target.value) || 0
                            );
                            setEditingQuantity(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              updateProductField(
                                product.id,
                                "cantidad",
                                parseInt(e.target.value) || 0
                              );
                              setEditingQuantity(null);
                            }
                            if (e.key === "Escape") {
                              setEditingQuantity(null);
                            }
                          }}
                          className="bg-gray-50 border border-gray-200 rounded px-2 py-1 w-16 text-center"
                          autoFocus
                        />
                      ) : (
                        <span
                          className={`cursor-pointer hover:bg-gray-50 px-2 py-1 rounded ${
                            product.cantidad <= 5
                              ? "text-red-600 font-semibold"
                              : product.cantidad <= 20
                              ? "text-yellow-600"
                              : "text-green-600"
                          }`}
                          onClick={() => setEditingQuantity(product.id)}
                          title="Click para editar cantidad"
                        >
                          Stock: {product.cantidad}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                  {product.descripcion}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => onEditProduct(product)}
                    className="px-3 py-2 border border-blue-300 text-blue-600 rounded text-sm hover:bg-blue-50 transition-colors"
                    title="Editar"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => duplicateProduct(product)}
                    className="px-3 py-2 border border-green-300 text-green-600 rounded text-sm hover:bg-green-50 transition-colors"
                    title="Duplicar"
                  >
                    <FiCopy />
                  </button>
                  <button
                    onClick={() => {
                      setProductToDelete(product);
                      setShowDeleteModal(true);
                    }}
                    className="px-3 py-2 border border-red-300 text-red-600 rounded text-sm hover:bg-red-50 transition-colors"
                    title="Eliminar"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-600 text-6xl mb-4 flex justify-center">
            <FiPackage />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchTerm || selectedCategory
              ? "No se encontraron productos"
              : isAdmin
              ? "No hay productos en el sistema"
              : "No tienes productos todavía"}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm || selectedCategory
              ? "Intenta ajustar los filtros de búsqueda"
              : isAdmin
              ? "Los productos aparecerán aquí cuando los vendedores los creen"
              : "Comienza agregando tu primer producto para vender"}
          </p>
          {!searchTerm && !selectedCategory && !isAdmin && (
            <button
              onClick={onAddProduct}
              className="bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors"
            >
              Agregar Primer Producto
            </button>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-4"
            style={{
              backgroundColor: "#000000",
              zIndex: 9999,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="rounded-4 shadow-lg w-100"
              style={{
                backgroundColor: isDark ? "#1f2937" : "#ffffff",
                border: `2px solid ${isDark ? "#ef4444" : "#dc2626"}`,
                maxWidth: "400px",
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="p-4">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-4"
                  style={{
                    width: "60px",
                    height: "60px",
                    backgroundColor: isDark ? "#dc2626" : "#fee2e2",
                    color: isDark ? "#ffffff" : "#dc2626",
                  }}
                >
                  <span className="fs-2 fw-bold">!</span>
                </div>

                <h3
                  className="h5 fw-bold text-center mb-3"
                  style={{ color: isDark ? "#f9fafb" : "#111827" }}
                >
                  Confirmar Eliminación
                </h3>

                <p
                  className="text-center mb-4"
                  style={{ color: isDark ? "#d1d5db" : "#6b7280" }}
                >
                  ¿Estás seguro de que deseas eliminar el producto "
                  {productToDelete?.nombre}"? Esta acción no se puede deshacer.
                </p>

                <div className="d-flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setProductToDelete(null);
                    }}
                    className="btn flex-fill"
                    style={{
                      backgroundColor: isDark ? "#374151" : "#f3f4f6",
                      borderColor: isDark ? "#4b5563" : "#d1d5db",
                      color: isDark ? "#f9fafb" : "#374151",
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={deleteProduct}
                    className="btn flex-fill"
                    style={{
                      backgroundColor: "#dc2626",
                      borderColor: "#dc2626",
                      color: "#ffffff",
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductManagement;
