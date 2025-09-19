import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, getDocs, doc, updateDoc, deleteDoc, onSnapshot, query, orderBy, where, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { FiEye, FiEyeOff, FiCopy, FiTrash2, FiPackage } from 'react-icons/fi';

const ProductManagement = ({ onAddProduct, onEditProduct }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('fechaCreacion');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [editingQuantity, setEditingQuantity] = useState(null);
  const [editingPrice, setEditingPrice] = useState(null);

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  const loadCategories = async () => {
    try {
      const categoriasSnap = await getDocs(collection(db, 'categorias'));
      const categoriasData = categoriasSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCategories(categoriasData);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProducts = () => {
    try {
      const q = query(collection(db, 'productos'), orderBy('fechaCreacion', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const productsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsData);
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error loading products:', error);
      setLoading(false);
    }
  };

  const toggleProductStatus = async (productId, currentStatus) => {
    try {
      await updateDoc(doc(db, 'productos', productId), {
        activo: !currentStatus,
        fechaActualizacion: new Date()
      });
    } catch (error) {
      console.error('Error updating product status:', error);
      alert('Error al actualizar el estado del producto');
    }
  };

  const duplicateProduct = async (product) => {
    try {
      const newProductId = `prod_${Date.now()}`;
      const newProduct = {
        ...product,
        nombre: `${product.nombre} (Copia)`,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date()
      };
      
      await setDoc(doc(db, 'productos', newProductId), newProduct);
      alert('Producto duplicado exitosamente');
    } catch (error) {
      console.error('Error duplicating product:', error);
      alert('Error al duplicar el producto');
    }
  };

  const updateProductField = async (productId, field, value) => {
    try {
      await updateDoc(doc(db, 'productos', productId), {
        [field]: value,
        fechaActualizacion: new Date()
      });
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      alert(`Error al actualizar ${field}`);
    }
  };

  const deleteProduct = async () => {
    if (!productToDelete) return;

    try {
      await deleteDoc(doc(db, 'productos', productToDelete.id));
      setShowDeleteModal(false);
      setProductToDelete(null);
      alert('Producto eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error al eliminar el producto');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.empresa?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || product.categoria === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'precio') {
      aValue = parseFloat(aValue) || 0;
      bValue = parseFloat(bValue) || 0;
    } else if (sortBy === 'fechaCreacion' || sortBy === 'fechaActualizacion') {
      aValue = new Date(aValue?.seconds ? aValue.seconds * 1000 : aValue);
      bValue = new Date(bValue?.seconds ? bValue.seconds * 1000 : bValue);
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.nombre || categoryId;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
    return d.toLocaleDateString('es-ES');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(price || 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-blue-900">Gestión de Productos</h2>
          <p className="text-gray-600">{products.length} productos en total</p>
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
              Buscar productos
            </label>
            <input
              type="text"
              placeholder="Nombre, descripción, empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ordenar por
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="fechaCreacion">Fecha de creación</option>
              <option value="fechaActualizacion">Última actualización</option>
              <option value="nombre">Nombre</option>
              <option value="precio">Precio</option>
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
                  const principal = product.imagen || (product.imagenes?.[0]) || (product.variantes?.[0]?.imagen) || '';
                  return principal ? (
                    <img
                      src={principal}
                      alt={product.nombre}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      Sin imagen
                    </div>
                  );
                })()}
              
                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    product.activo 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.activo ? 'Activo' : 'Inactivo'}
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
                    onClick={() => toggleProductStatus(product.id, product.activo)}
                    className={`ml-2 p-1 rounded ${
                      product.activo 
                        ? 'text-green-600 hover:bg-green-50' 
                        : 'text-red-600 hover:bg-red-50'
                    }`}
                    title={product.activo ? 'Desactivar' : 'Activar'}
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
                        updateProductField(product.id, 'precio', parseFloat(e.target.value) || 0);
                        setEditingPrice(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          updateProductField(product.id, 'precio', parseFloat(e.target.value) || 0);
                          setEditingPrice(null);
                        }
                        if (e.key === 'Escape') {
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
                            updateProductField(product.id, 'cantidad', parseInt(e.target.value) || 0);
                            setEditingQuantity(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              updateProductField(product.id, 'cantidad', parseInt(e.target.value) || 0);
                              setEditingQuantity(null);
                            }
                            if (e.key === 'Escape') {
                              setEditingQuantity(null);
                            }
                          }}
                          className="bg-gray-50 border border-gray-200 rounded px-2 py-1 w-16 text-center"
                          autoFocus
                        />
                      ) : (
                        <span 
                          className={`cursor-pointer hover:bg-gray-50 px-2 py-1 rounded ${
                            product.cantidad <= 5 ? 'text-red-600 font-semibold' : 
                            product.cantidad <= 20 ? 'text-yellow-600' : 'text-green-600'
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

                <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                  {product.descripcion}
                </p>

                <div className="text-xs text-gray-400 mb-4">
                  <p>Creado: {formatDate(product.fechaCreacion)}</p>
                  {product.fechaActualizacion && (
                    <p>Actualizado: {formatDate(product.fechaActualizacion)}</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => onEditProduct(product)}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => duplicateProduct(product)}
                    className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors"
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
          <div className="text-gray-400 text-6xl mb-4 flex justify-center"><FiPackage /></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron productos
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || selectedCategory 
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Comienza agregando tu primer producto'
            }
          </p>
          {!searchTerm && !selectedCategory && (
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                  <span className="text-red-600 text-2xl">⚠️</span>
                </div>
                
                <h3 className="text-lg font-semibold text-center text-gray-900 mb-2">
                  Confirmar Eliminación
                </h3>
                
                <p className="text-center text-gray-600 mb-6">
                  ¿Estás seguro de que deseas eliminar el producto "{productToDelete?.nombre}"? 
                  Esta acción no se puede deshacer.
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setProductToDelete(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={deleteProduct}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
