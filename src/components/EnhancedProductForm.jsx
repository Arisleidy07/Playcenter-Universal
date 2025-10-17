import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import {
  ref,
  getDownloadURL,
  uploadBytes,
} from "firebase/storage";
import { db, storage } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { FaTimes, FaPlus, FaTrash, FaCamera, FaImage, FaVideo, FaCheck } from "react-icons/fa";

// Función para subida rápida de archivos
const uploadFileInstant = async (file, path) => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

// Función para generar ID único
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

const EnhancedProductForm = ({ product, onClose, onSave }) => {
  const { usuario } = useAuth();
  
  // Estados del formulario - CAMPOS OBLIGATORIOS
  const [formData, setFormData] = useState({
    nombre: product?.nombre || "",
    descripcion: product?.descripcion || "",
    categoria: product?.categoria || "",
    precio: product?.precio || "",
    cantidad: product?.cantidad || 0,
    imagen: product?.imagen || "", // Imagen principal OBLIGATORIA
    imagenes: product?.imagenes || [], // Imágenes secundarias
    video: product?.video || "", // Video opcional
    variantes: product?.variantes || [], // Variantes opcionales
    activo: product?.activo !== false, // Activo por defecto
  });

  // Estados para categorías
  const [categorias, setCategorias] = useState([]);
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);

  // Estados para archivos
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  // Referencias para inputs de archivo
  const imagenPrincipalRef = useRef(null);
  const imagenesSecundariasRef = useRef(null);
  const videoRef = useRef(null);

  // Cargar categorías al montar
  useEffect(() => {
    loadCategorias();
  }, []);

  const loadCategorias = async () => {
    try {
      const categoriasSnapshot = await getDocs(collection(db, "categorias"));
      const categoriasData = categoriasSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCategorias(categoriasData);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  // Crear nueva categoría
  const handleCreateCategory = async () => {
    if (!nuevaCategoria.trim()) return;
    
    try {
      const categoryId = nuevaCategoria.toLowerCase().replace(/\s+/g, '-');
      await setDoc(doc(db, "categorias", categoryId), {
        nombre: nuevaCategoria.trim(),
        createdAt: new Date(),
        createdBy: usuario?.uid
      });
      
      setFormData(prev => ({ ...prev, categoria: categoryId }));
      setNuevaCategoria("");
      setShowNewCategory(false);
      await loadCategorias();
    } catch (error) {
      console.error("Error creating category:", error);
      alert("Error al crear la categoría");
    }
  };

  // Subir imagen principal
  const handleImagenPrincipal = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Mostrar preview inmediato
    const previewUrl = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, imagen: previewUrl }));

    try {
      setUploadProgress(prev => ({ ...prev, imagenPrincipal: 0 }));
      const fileName = `productos/${generateId()}_${file.name}`;
      const downloadURL = await uploadFileInstant(file, fileName);
      
      setFormData(prev => ({ ...prev, imagen: downloadURL }));
      setUploadProgress(prev => ({ ...prev, imagenPrincipal: 100 }));
      
      // Limpiar preview temporal
      URL.revokeObjectURL(previewUrl);
    } catch (error) {
      console.error("Error uploading main image:", error);
      alert("Error al subir la imagen principal");
      setFormData(prev => ({ ...prev, imagen: "" }));
    }
  };

  // Subir imágenes secundarias
  const handleImagenesSecundarias = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newImages = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const previewUrl = URL.createObjectURL(file);
      newImages.push(previewUrl);
    }

    // Mostrar previews inmediatos
    setFormData(prev => ({ 
      ...prev, 
      imagenes: [...prev.imagenes, ...newImages] 
    }));

    try {
      const uploadedUrls = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = `productos/${generateId()}_${file.name}`;
        const downloadURL = await uploadFileInstant(file, fileName);
        uploadedUrls.push(downloadURL);
        
        // Actualizar progreso
        setUploadProgress(prev => ({ 
          ...prev, 
          [`secundaria_${i}`]: 100 
        }));
      }

      // Reemplazar previews con URLs reales
      setFormData(prev => {
        const filteredImages = prev.imagenes.filter(img => !img.startsWith('blob:'));
        return {
          ...prev,
          imagenes: [...filteredImages, ...uploadedUrls]
        };
      });

      // Limpiar previews temporales
      newImages.forEach(url => URL.revokeObjectURL(url));
      
    } catch (error) {
      console.error("Error uploading secondary images:", error);
      alert("Error al subir las imágenes secundarias");
    }
  };

  // Subir video
  const handleVideo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Mostrar preview inmediato
    const previewUrl = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, video: previewUrl }));

    try {
      setUploadProgress(prev => ({ ...prev, video: 0 }));
      const fileName = `productos/videos/${generateId()}_${file.name}`;
      const downloadURL = await uploadFileInstant(file, fileName);
      
      setFormData(prev => ({ ...prev, video: downloadURL }));
      setUploadProgress(prev => ({ ...prev, video: 100 }));
      
      // Limpiar preview temporal
      URL.revokeObjectURL(previewUrl);
    } catch (error) {
      console.error("Error uploading video:", error);
      alert("Error al subir el video");
      setFormData(prev => ({ ...prev, video: "" }));
    }
  };

  // Eliminar imagen secundaria
  const removeSecondaryImage = (index) => {
    setFormData(prev => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, i) => i !== index)
    }));
  };

  // Agregar variante
  const addVariante = () => {
    setFormData(prev => ({
      ...prev,
      variantes: [...prev.variantes, {
        id: generateId(),
        color: "",
        tamaño: "",
        modelo: "",
        precio: "",
        cantidad: 0
      }]
    }));
  };

  // Actualizar variante
  const updateVariante = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      variantes: prev.variantes.map((variante, i) => 
        i === index ? { ...variante, [field]: value } : variante
      )
    }));
  };

  // Eliminar variante
  const removeVariante = (index) => {
    setFormData(prev => ({
      ...prev,
      variantes: prev.variantes.filter((_, i) => i !== index)
    }));
  };

  // Validar formulario
  const isFormValid = () => {
    return (
      formData.nombre.trim() &&
      formData.descripcion.trim() &&
      formData.categoria &&
      formData.precio &&
      formData.cantidad >= 0 &&
      formData.imagen // Imagen principal obligatoria
    );
  };

  // Guardar producto
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      alert("Por favor completa todos los campos obligatorios");
      return;
    }

    setUploading(true);

    try {
      const productData = {
        ...formData,
        precio: parseFloat(formData.precio),
        cantidad: parseInt(formData.cantidad),
        updatedAt: new Date(),
        sellerId: usuario?.uid,
        activo: true, // Producto activo inmediatamente
      };

      if (product?.id) {
        // Actualizar producto existente
        await updateDoc(doc(db, "productos", product.id), productData);
      } else {
        // Crear nuevo producto
        productData.createdAt = new Date();
        await addDoc(collection(db, "productos"), productData);
      }

      alert("Producto guardado exitosamente");
      onSave && onSave();
      onClose && onClose();
      
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Error al guardar el producto");
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {product ? "Editar Producto" : "Nuevo Producto"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Campos Obligatorios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Título del producto */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título del producto *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nombre descriptivo del producto"
                required
              />
            </div>

            {/* Precio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.precio}
                onChange={(e) => setFormData(prev => ({ ...prev, precio: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                required
              />
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock disponible *
              </label>
              <input
                type="number"
                min="0"
                value={formData.cantidad}
                onChange={(e) => setFormData(prev => ({ ...prev, cantidad: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
                required
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción y especificaciones técnicas *
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descripción detallada del producto, especificaciones técnicas..."
              required
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría *
            </label>
            <div className="flex gap-2">
              <select
                value={formData.categoria}
                onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Seleccionar categoría</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowNewCategory(!showNewCategory)}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <FaPlus className="w-4 h-4" />
              </button>
            </div>

            {/* Nueva categoría */}
            {showNewCategory && (
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={nuevaCategoria}
                  onChange={(e) => setNuevaCategoria(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nueva categoría"
                />
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FaCheck className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Imagen Principal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagen principal *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              {formData.imagen ? (
                <div className="relative">
                  <img
                    src={formData.imagen}
                    alt="Imagen principal"
                    className="w-full h-48 object-contain rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, imagen: "" }))}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <FaTimes className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <FaImage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Imagen principal del producto</p>
                  <div className="flex gap-2 justify-center">
                    <button
                      type="button"
                      onClick={() => imagenPrincipalRef.current?.click()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <FaImage className="w-4 h-4" />
                      Seleccionar
                    </button>
                  </div>
                </div>
              )}
              <input
                ref={imagenPrincipalRef}
                type="file"
                accept="image/*"
                onChange={handleImagenPrincipal}
                className="hidden"
              />
            </div>
          </div>

          {/* Imágenes Secundarias */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imágenes secundarias (miniaturas)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              {formData.imagenes.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {formData.imagenes.map((img, index) => (
                    <div key={index} className="relative">
                      <img
                        src={img}
                        alt={`Imagen ${index + 1}`}
                        className="w-full h-24 object-contain rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeSecondaryImage(index)}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <FaTimes className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => imagenesSecundariasRef.current?.click()}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 mx-auto"
                >
                  <FaPlus className="w-4 h-4" />
                  Agregar imágenes
                </button>
              </div>
              <input
                ref={imagenesSecundariasRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagenesSecundarias}
                className="hidden"
              />
            </div>
          </div>

          {/* Video Opcional */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video (opcional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              {formData.video ? (
                <div className="relative">
                  <video
                    src={formData.video}
                    className="w-full h-48 object-contain rounded-lg"
                    controls
                    preload="metadata"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, video: "" }))}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <FaTimes className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <FaVideo className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Video del producto</p>
                  <button
                    type="button"
                    onClick={() => videoRef.current?.click()}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 mx-auto"
                  >
                    <FaVideo className="w-4 h-4" />
                    Seleccionar video
                  </button>
                </div>
              )}
              <input
                ref={videoRef}
                type="file"
                accept="video/*"
                onChange={handleVideo}
                className="hidden"
              />
            </div>
          </div>

          {/* Variantes */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Variantes (opcional)
              </label>
              <button
                type="button"
                onClick={addVariante}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <FaPlus className="w-4 h-4" />
                Agregar variante
              </button>
            </div>

            {formData.variantes.map((variante, index) => (
              <div key={variante.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Variante {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeVariante(index)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    value={variante.color}
                    onChange={(e) => updateVariante(index, 'color', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Color/Tipo"
                  />
                  <input
                    type="text"
                    value={variante.tamaño}
                    onChange={(e) => updateVariante(index, 'tamaño', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tamaño"
                  />
                  <input
                    type="text"
                    value={variante.modelo}
                    onChange={(e) => updateVariante(index, 'modelo', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Modelo"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={variante.precio}
                    onChange={(e) => updateVariante(index, 'precio', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Precio específico"
                  />
                  <input
                    type="number"
                    min="0"
                    value={variante.cantidad}
                    onChange={(e) => updateVariante(index, 'cantidad', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Stock"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Botones de acción */}
          <div className="flex gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!isFormValid() || uploading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? "Guardando..." : "Guardar producto"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default EnhancedProductForm;
