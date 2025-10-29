import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, addDoc, query, orderBy, getDoc, clearIndexedDbPersistence, disableNetwork, enableNetwork } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import LoadingSpinner from './LoadingSpinner';
import { FiFolder, FiEye, FiEyeOff, FiEdit2, FiTrash2, FiChevronUp, FiChevronDown, FiAlertTriangle } from 'react-icons/fi';
import { 
  getPhantomCategories, 
  addPhantomCategory, 
  clearAllPhantomCategories, 
  cleanupPhantomCategories 
} from '../utils/phantomProductsCleaner';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    imagen: '',
    activa: true,
    orden: 0
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [phantomCategoryIds, setPhantomCategoryIds] = useState(() => {
    // Inicializar desde localStorage
    try {
      const stored = localStorage.getItem('phantomCategories');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const unsubscribe = loadCategories();
    
    // Listener para cambios en localStorage (cuando se marcan fantasmas desde otro componente)
    const handleStorageChange = (e) => {
      if (e.key === 'phantomCategories') {
        try {
          const newPhantoms = e.newValue ? JSON.parse(e.newValue) : [];
          setPhantomCategoryIds(newPhantoms);
        } catch (error) {
          console.error('Error al parsear phantomCategories:', error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      if (unsubscribe) unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const loadCategories = () => {
    try {
      const unsubscribe = onSnapshot(collection(db, 'categorias'), (snapshot) => {
        // USAR ESTADO LOCAL en lugar de localStorage para evitar race conditions
        setPhantomCategoryIds(currentPhantoms => {
          // Filtrar categorías: excluir fantasmas y verificar que existan
          const categoriesData = [];
          
          snapshot.docs.forEach(doc => {
            const isPhantom = currentPhantoms.includes(doc.id);
            
            if (!isPhantom && doc.exists()) {
              categoriesData.push({
                id: doc.id,
                ...doc.data()
              });
            }
          });
          
          // Ordenar por orden
          categoriesData.sort((a, b) => (a.orden || 0) - (b.orden || 0));
          
          setCategories(categoriesData);
          setLoading(false);
          
          // Retornar el estado sin cambios
          return currentPhantoms;
        });
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error loading categories:', error);
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      imagen: '',
      activa: true,
      orden: categories.length
    });
    setEditingCategory(null);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      nombre: category.nombre || '',
      descripcion: category.descripcion || '',
      imagen: category.imagen || '',
      activa: category.activa !== false,
      orden: category.orden || 0
    });
    setShowForm(true);
  };

  const handleImageUpload = async (file) => {
    setUploadingImage(true);
    try {
      const imageRef = ref(storage, `categorias/${Date.now()}_${file.name}`);
      await uploadBytes(imageRef, file);
      const url = await getDownloadURL(imageRef);
      setFormData(prev => ({ ...prev, imagen: url }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error al subir la imagen');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const categoryData = {
        ...formData,
        ruta: formData.nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        fechaActualizacion: new Date()
      };

      if (editingCategory) {
        await updateDoc(doc(db, 'categorias', editingCategory.id), categoryData);
      } else {
        categoryData.fechaCreacion = new Date();
        categoryData.productCount = 0;
        const categoryId = categoryData.ruta;
        await addDoc(collection(db, 'categorias'), categoryData);
      }

      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Error al guardar la categoría');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategoryStatus = async (categoryId, currentStatus) => {
    try {
      await updateDoc(doc(db, 'categorias', categoryId), {
        activa: !currentStatus,
        fechaActualizacion: new Date()
      });
    } catch (error) {
      console.error('Error updating category status:', error);
      alert('Error al actualizar el estado de la categoría');
    }
  };

  const deleteCategory = async () => {
    if (!categoryToDelete) return;

    const categoryId = categoryToDelete.id;
    const categoryName = categoryToDelete.nombre || 'Categoría';
    
    // Cerrar modal
    setShowDeleteModal(false);
    setCategoryToDelete(null);

    try {
      const docRef = doc(db, 'categorias', categoryId);
      
      // Verificar si el documento existe
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        // Si NO existe en Firebase, forzar limpieza del caché
        setPhantomCategoryIds(prevPhantoms => {
          if (!prevPhantoms.includes(categoryId)) {
            const newPhantoms = [...prevPhantoms, categoryId];
            localStorage.setItem('phantomCategories', JSON.stringify(newPhantoms));
            return newPhantoms;
          }
          return prevPhantoms;
        });
        
        // IMPORTANTE: Forzar actualización inmediata del estado de categorías
        setCategories(prevCategories => prevCategories.filter(c => c.id !== categoryId));
        
        alert(`✅ "${categoryName}" eliminada (era un fantasma del caché)`);
        return;
      }
      
      // Si existe en Firebase, eliminarlo
      await deleteDoc(docRef);
      
      // Esperar un momento y verificar
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const verificacion = await getDoc(docRef);
      if (verificacion.exists()) {
        console.error('❌ ERROR: La categoría AÚN EXISTE después de deleteDoc');
        alert('❌ Error: No se pudo eliminar de Firebase.\n\nPosibles causas:\n1. Reglas de seguridad bloquean la eliminación\n2. No tienes permisos\n3. Problemas de red');
        return;
      }
      
      // Eliminar del estado local inmediatamente
      setCategories(prevCategories => prevCategories.filter(c => c.id !== categoryId));
      
      alert(`✅ "${categoryName}" eliminada exitosamente de Firebase`);
      
    } catch (error) {
      console.error('❌ [CategoryManagement] Error al eliminar categoría:', error);
      console.error('📝 [CategoryManagement] Código de error:', error.code);
      console.error('📝 [CategoryManagement] Mensaje:', error.message);
      
      if (error.code === 'permission-denied') {
        alert(`❌ Error de Permisos\n\nNo tienes permiso para eliminar esta categoría.\n\nVerifica las reglas de seguridad en Firestore.`);
      } else {
        alert(`❌ Error: ${error.message}\n\nRevisa la consola para más detalles.`);
      }
    }
  };

  const moveCategory = async (categoryId, direction) => {
    const currentIndex = categories.findIndex(cat => cat.id === categoryId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= categories.length) return;

    try {
      const updates = [];
      const categoryA = categories[currentIndex];
      const categoryB = categories[newIndex];

      updates.push(
        updateDoc(doc(db, 'categorias', categoryA.id), { orden: newIndex }),
        updateDoc(doc(db, 'categorias', categoryB.id), { orden: currentIndex })
      );

      await Promise.all(updates);
    } catch (error) {
      console.error('Error reordering categories:', error);
      alert('Error al reordenar las categorías');
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
    return d.toLocaleDateString('es-ES');
  };

  if (loading && categories.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" color="blue" text="Cargando categorías..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-blue-900">Gestión de Categorías</h2>
          <p className="text-gray-600">{categories.length} categorías en total</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {phantomCategoryIds.length > 0 && (
            <>
              <button
                onClick={async () => {
                  if (confirm(`¿Verificar y limpiar ${phantomCategoryIds.length} categorías fantasma?\n\nEsto verificará si alguna volvió a existir en Firebase.`)) {
                    const result = await cleanupPhantomCategories();
                    if (result) {
                      alert(`✅ Limpieza completada:\n\n${result.recovered} categorías recuperadas\n${result.stillPhantoms} siguen siendo fantasmas\n\nRecargando página...`);
                      window.location.reload();
                    }
                  }
                }}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-1"
                title="Verificar y limpiar categorías fantasma"
              >
                <FiTrash2 size={14} />
                Verificar ({phantomCategoryIds.length})
              </button>
              <button
                onClick={() => {
                  if (confirm(`¿Limpiar TODAS las ${phantomCategoryIds.length} categorías fantasma?\n\n⚠️ Esto las eliminará sin verificar si existen en Firebase.`)) {
                    const count = clearAllPhantomCategories();
                    setPhantomCategoryIds([]);
                    alert(`✅ ${count} categorías fantasma limpiadas.\n\nRecargando página...`);
                    window.location.reload();
                  }
                }}
                className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm flex items-center gap-1"
                title="Forzar limpieza de caché de categorías fantasma"
              >
                <FiTrash2 size={14} />
                Limpiar ({phantomCategoryIds.length})
              </button>
            </>
          )}
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            Agregar Categoría
          </button>
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📁</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay categorías
            </h3>
            <p className="text-gray-500 mb-4">
              Comienza creando tu primera categoría de productos
            </p>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors"
            >
              Crear Primera Categoría
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            <AnimatePresence>
              {categories.map((category, index) => (
                <motion.div
                  key={category.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {/* Category Image */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {category.imagen ? (
                        <img
                          src={category.imagen}
                          alt={category.nombre}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FiFolder className="text-gray-400 text-2xl" />
                      )}
                    </div>

                    {/* Category Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {category.nombre}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          category.activa 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {category.activa ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>
                      
                      {category.descripcion && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {category.descripcion}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Ruta: /{category.ruta}</span>
                        <span>Productos: {category.productCount || 0}</span>
                        <span>Creada: {formatDate(category.fechaCreacion)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {/* Reorder buttons */}
                      <div className="flex flex-col">
                        <button
                          onClick={() => moveCategory(category.id, 'up')}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Mover arriba"
                        >
                          <FiChevronUp />
                        </button>
                        <button
                          onClick={() => moveCategory(category.id, 'down')}
                          disabled={index === categories.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Mover abajo"
                        >
                          <FiChevronDown />
                        </button>
                      </div>

                      {/* Status toggle */}
                      <button
                        onClick={() => toggleCategoryStatus(category.id, category.activa)}
                        className={`p-2 rounded ${
                          category.activa 
                            ? 'text-green-600 hover:bg-green-50' 
                            : 'text-red-600 hover:bg-red-50'
                        }`}
                        title={category.activa ? 'Desactivar' : 'Activar'}
                      >
                        {category.activa ? <FiEye /> : <FiEyeOff />}
                      </button>

                      {/* Edit button */}
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Editar"
                      >
                        <FiEdit2 />
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={() => {
                          setCategoryToDelete(category);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
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
        )}
      </div>

      {/* Category Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              {/* Header */}
              <div className="bg-blue-700 text-white p-6 flex justify-between items-center rounded-t-2xl">
                <h2 className="text-xl font-bold">
                  {editingCategory ? 'Editar Categoría' : 'Agregar Categoría'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="text-white hover:text-gray-200 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de la Categoría *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nombre}
                      onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: Videojuegos"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Orden
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.orden}
                      onChange={(e) => setFormData(prev => ({ ...prev, orden: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    rows={3}
                    value={formData.descripcion}
                    onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descripción opcional de la categoría"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagen de la Categoría
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {formData.imagen && (
                    <div className="mt-3">
                      <img
                        src={formData.imagen}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.activa}
                      onChange={(e) => setFormData(prev => ({ ...prev, activa: e.target.checked }))}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    Categoría activa
                  </label>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={uploadingImage}
                    className="px-6 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadingImage ? (
                      <LoadingSpinner size="small" color="white" className="mr-2" />
                    ) : null}
                    {uploadingImage ? 'Subiendo imagen...' : editingCategory ? 'Actualizar' : 'Crear Categoría'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                  ¿Estás seguro de que deseas eliminar la categoría "{categoryToDelete?.nombre}"? 
                  Esta acción no se puede deshacer y puede afectar los productos asociados.
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setCategoryToDelete(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={deleteCategory}
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

export default CategoryManagement;
