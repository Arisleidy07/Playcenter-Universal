import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, onSnapshot, setDoc, deleteDoc, increment } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Store, Edit3, ArrowLeft, Filter, Search, Upload, X, Save, Camera, Edit, RotateCw, UserPlus, UserCheck, Users, Package, ChevronRight, Globe, Share2, Plus, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Cropper from 'react-easy-crop';
import TarjetaProducto from '../components/TarjetaProducto';
import '../styles/CropModal.css';

export default function TiendaIndividual() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [tienda, setTienda] = useState(null);
  const [productos, setProductos] = useState([]);
  const [productosPorCategoria, setProductosPorCategoria] = useState({});
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  
  // Estados para edición de tienda
  const [editData, setEditData] = useState({
    nombre: '',
    descripcion: '',
    banner: '',
    logo: '',
    enlaces: [] // Array de objetos: { titulo, tipo, url }
  });
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [bannerFile, setBannerFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // Estados para crop con react-easy-crop
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropType, setCropType] = useState(null); // 'banner' o 'logo'
  const [originalImage, setOriginalImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  
  // Estados para sistema de seguir
  const [siguiendo, setSiguiendo] = useState(false);
  const [seguidores, setSeguidores] = useState(0);
  const [loadingSeguir, setLoadingSeguir] = useState(false);

  // Verificar si el usuario es dueño de la tienda
  const isOwner = usuario && tienda && (
    usuario.uid === tienda.ownerId || 
    usuario.uid === tienda.owner_id || 
    usuario.uid === tienda.createdBy ||
    usuario.email === 'arisleidy0712@gmail.com'
  );

  useEffect(() => {
    // Listener en tiempo real para la tienda
    const tiendaRef = doc(db, 'tiendas', id);
    const unsubscribeTienda = onSnapshot(tiendaRef, (doc) => {
      if (doc.exists()) {
        setTienda({ id: doc.id, ...doc.data() });
        setLoading(false);
      } else {
        console.error('Tienda no encontrada');
        navigate('/tiendas');
      }
    }, (error) => {
      console.error('Error al escuchar tienda:', error);
      setLoading(false);
    });

    fetchProductos();

    // Cleanup del listener
    return () => unsubscribeTienda();
  }, [id, navigate]);

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (showEditModal && tienda) {
      setEditData({
        nombre: tienda.nombre || '',
        descripcion: tienda.descripcion || '',
        banner: tienda.banner || '',
        logo: tienda.logo || '',
        enlaces: tienda.enlaces || []
      });
    }
  }, [showEditModal, tienda]);

  // Cargar seguidores EN TIEMPO REAL y verificar si usuario sigue la tienda
  useEffect(() => {
    if (!id) return;

    // Listener en tiempo real para el contador de seguidores
    const tiendaRef = doc(db, 'tiendas', id);
    const unsubscribeTienda = onSnapshot(tiendaRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setSeguidores(data.seguidores || 0);
      }
    }, (error) => {
      console.error('Error escuchando tienda:', error);
    });

    // Verificar si el usuario actual sigue esta tienda EN TIEMPO REAL
    let unsubscribeSeguidor = null;
    if (usuario) {
      const seguidorRef = doc(db, 'tiendas', id, 'seguidores', usuario.uid);
      unsubscribeSeguidor = onSnapshot(seguidorRef, (doc) => {
        setSiguiendo(doc.exists());
      }, (error) => {
        console.error('Error verificando seguidor:', error);
      });
    }

    // Cleanup
    return () => {
      unsubscribeTienda();
      if (unsubscribeSeguidor) unsubscribeSeguidor();
    };
  }, [id, usuario]);

  const fetchProductos = async () => {
    try {
      const q = query(
        collection(db, 'productos'),
        where('tienda_id', '==', id),
        where('activo', '==', true)
      );
      
      const snapshot = await getDocs(q);
      const productosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setProductos(productosData);
      
      // Organizar productos por categoría
      const porCategoria = {};
      const categoriasUnicas = new Set();
      
      productosData.forEach(producto => {
        const categoria = producto.categoria || 'Sin categoría';
        categoriasUnicas.add(categoria);
        
        if (!porCategoria[categoria]) {
          porCategoria[categoria] = [];
        }
        porCategoria[categoria].push(producto);
      });
      
      setProductosPorCategoria(porCategoria);
      setCategorias(['todas', ...Array.from(categoriasUnicas)]);
      
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoadingProductos(false);
    }
  };

  // Funciones para editar tienda
  const handleFileChange = async (e, type) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      // SUBIR DIRECTAMENTE sin modal de crop
      setUploading(true);
      try {
        // Subir imagen a Storage
        const imagePath = `tiendas/${id}/${type}-${Date.now()}`;
        const imageUrl = await uploadFile(file, imagePath);
        
        // Actualizar directamente en Firestore (tiempo real)
        const tiendaRef = doc(db, 'tiendas', id);
        await updateDoc(tiendaRef, {
          [type]: imageUrl
        });
        
        // Mostrar notificación de éxito tipo toast moderna
        const notification = document.createElement('div');
        notification.className = 'fixed top-24 right-4 bg-green-600 text-white px-6 py-3 rounded-full shadow-2xl z-[10000] flex items-center gap-3 font-semibold';
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        notification.style.transition = 'all 0.3s ease-out';
        notification.innerHTML = `
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          <span>${type === 'banner' ? 'Banner' : 'Logo'} actualizado correctamente</span>
        `;
        document.body.appendChild(notification);
        
        // Fade in
        setTimeout(() => {
          notification.style.opacity = '1';
          notification.style.transform = 'translateY(0)';
        }, 10);
        
        // Fade out
        setTimeout(() => {
          notification.style.opacity = '0';
          notification.style.transform = 'translateY(-20px)';
          setTimeout(() => {
            if (notification.parentNode) {
              document.body.removeChild(notification);
            }
          }, 300);
        }, 3000);
        
      } catch (error) {
        console.error(`Error al actualizar ${type}:`, error);
        alert(`Error al actualizar ${type}`);
      } finally {
        setUploading(false);
      }
    }
  };

  // Callback cuando el crop se completa
  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Aplicar crop con react-easy-crop
  const applyCrop = async () => {
    if (!croppedAreaPixels || !originalImage) return;
    
    try {
      const croppedBlob = await getCroppedImg(
        originalImage,
        croppedAreaPixels,
        rotation
      );
      
      // Actualizar directamente en Firestore (tiempo real)
      await updateStoreImage(croppedBlob, cropType);
      
      // Cerrar modal
      setShowCropModal(false);
      setOriginalImage(null);
      setCropType(null);
      setCroppedAreaPixels(null);
    } catch (error) {
      console.error('Error al recortar imagen:', error);
      alert('Error al procesar la imagen');
    }
  };
  
  // Función para crear la imagen recortada
  const getCroppedImg = async (imageSrc, pixelCrop, rotation = 0) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));
    
    canvas.width = safeArea;
    canvas.height = safeArea;
    
    ctx.translate(safeArea / 2, safeArea / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-safeArea / 2, -safeArea / 2);
    
    ctx.drawImage(
      image,
      safeArea / 2 - image.width * 0.5,
      safeArea / 2 - image.height * 0.5
    );
    
    const data = ctx.getImageData(0, 0, safeArea, safeArea);
    
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    
    ctx.putImageData(
      data,
      0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x,
      0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y
    );
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.95);
    });
  };
  
  // Helper para crear imagen desde source
  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const uploadFile = async (file, path) => {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  };

  // Función para actualizar banner o logo directamente (tiempo real)
  const updateStoreImage = async (imageBlob, type) => {
    if (!isOwner) return;
    
    setUploading(true);
    try {
      // Subir imagen a Storage
      const imagePath = `tiendas/${id}/${type}-${Date.now()}`;
      const imageUrl = await uploadFile(imageBlob, imagePath);
      
      // Actualizar directamente en Firestore (tiempo real)
      const tiendaRef = doc(db, 'tiendas', id);
      await updateDoc(tiendaRef, {
        [type]: imageUrl
      });
      
      // El onSnapshot se encargará de actualizar la UI automáticamente
      // Mostrar notificación de éxito tipo toast moderna
      const notification = document.createElement('div');
      notification.className = 'fixed top-24 right-4 bg-green-600 text-white px-6 py-3 rounded-full shadow-2xl z-[10000] flex items-center gap-3 font-semibold';
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(-20px)';
      notification.style.transition = 'all 0.3s ease-out';
      notification.innerHTML = `
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        <span>${type === 'banner' ? 'Banner' : 'Logo'} actualizado correctamente</span>
      `;
      document.body.appendChild(notification);
      
      // Fade in
      setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
      }, 10);
      
      // Fade out después de 3 segundos
      setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => {
          if (notification.parentNode) {
            document.body.removeChild(notification);
          }
        }, 300);
      }, 3000);
      
    } catch (error) {
      console.error(`Error al actualizar ${type}:`, error);
      alert(`Error al actualizar ${type}`);
    } finally {
      setUploading(false);
    }
  };


  const handleSaveTienda = async () => {
    if (!isOwner) return;
    
    setUploading(true);
    try {
      const updates = {
        nombre: editData.nombre,
        descripcion: editData.descripcion,
        enlaces: editData.enlaces || []
      };

      // Subir banner si hay archivo nuevo
      if (bannerFile) {
        const bannerUrl = await uploadFile(bannerFile, `tiendas/${id}/banner-${Date.now()}`);
        updates.banner = bannerUrl;
      }

      // Subir logo si hay archivo nuevo
      if (logoFile) {
        const logoUrl = await uploadFile(logoFile, `tiendas/${id}/logo-${Date.now()}`);
        updates.logo = logoUrl;
      }

      // Actualizar en Firestore
      const tiendaRef = doc(db, 'tiendas', id);
      await updateDoc(tiendaRef, updates);

      // Actualizar estado local
      setTienda(prev => ({ ...prev, ...updates }));
      
      // Cerrar modal y limpiar archivos
      setShowEditModal(false);
      setBannerFile(null);
      setLogoFile(null);
      
      alert('¡Tienda actualizada exitosamente!');
    } catch (error) {
      console.error('Error al actualizar tienda:', error);
      alert('Error al actualizar la tienda');
    } finally {
      setUploading(false);
    }
  };

  // Función para seguir/dejar de seguir tienda
  const handleSeguir = async () => {
    if (!usuario) {
      alert('Debes iniciar sesión para seguir tiendas');
      return;
    }

    if (isOwner) {
      alert('No puedes seguir tu propia tienda');
      return;
    }

    setLoadingSeguir(true);

    try {
      const tiendaRef = doc(db, 'tiendas', id);
      const seguidorRef = doc(db, 'tiendas', id, 'seguidores', usuario.uid);
      const usuarioRef = doc(db, 'usuarios', usuario.uid);

      if (siguiendo) {
        // Dejar de seguir
        await deleteDoc(seguidorRef);
        await updateDoc(tiendaRef, {
          seguidores: increment(-1)
        });
        
        // Remover de la lista de tiendas seguidas del usuario
        const usuarioSnap = await getDoc(usuarioRef);
        if (usuarioSnap.exists()) {
          const tiendasSeguidas = usuarioSnap.data().tiendasSeguidas || [];
          await updateDoc(usuarioRef, {
            tiendasSeguidas: tiendasSeguidas.filter(t => t !== id)
          });
        }

        setSiguiendo(false);
        setSeguidores(prev => Math.max(0, prev - 1));
      } else {
        // Seguir
        await setDoc(seguidorRef, {
          usuarioId: usuario.uid,
          fechaSeguimiento: new Date()
        });
        await updateDoc(tiendaRef, {
          seguidores: increment(1)
        });

        // Agregar a la lista de tiendas seguidas del usuario
        const usuarioSnap = await getDoc(usuarioRef);
        if (usuarioSnap.exists()) {
          const tiendasSeguidas = usuarioSnap.data().tiendasSeguidas || [];
          if (!tiendasSeguidas.includes(id)) {
            await updateDoc(usuarioRef, {
              tiendasSeguidas: [...tiendasSeguidas, id]
            });
          }
        } else {
          await setDoc(usuarioRef, {
            tiendasSeguidas: [id]
          }, { merge: true });
        }

        setSiguiendo(true);
        setSeguidores(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error al seguir/dejar de seguir:', error);
      alert('Error al procesar la acción. Intenta de nuevo.');
    } finally {
      setLoadingSeguir(false);
    }
  };

  // Filtrar productos según búsqueda y categoría
  const productosFiltrados = productos.filter(producto => {
    const coincideBusqueda = producto.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
                            producto.descripcion?.toLowerCase().includes(busqueda.toLowerCase());
    
    const coincideCategoria = categoriaSeleccionada === 'todas' || 
                             producto.categoria === categoriaSeleccionada;
    
    return coincideBusqueda && coincideCategoria;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ paddingTop: 'var(--content-offset, 120px)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando tienda...</p>
        </div>
      </div>
    );
  }

  if (!tienda) {
    return null;
  }

  // isOwner ya está definido arriba

  return (
    <div className="min-h-screen bg-white" style={{ paddingTop: 'var(--content-offset, 120px)' }}>
      {/* BANNER COMPLETO - Full Width ULTRA HORIZONTAL */}
      <div className="relative w-screen bg-neutral-100 dark:bg-neutral-800 flex justify-center items-center overflow-hidden" style={{ marginLeft: 'calc(-50vw + 50%)' }}>
        {tienda.banner ? (
          <img
            src={tienda.banner}
            alt={`Banner de ${tienda.nombre}`}
            className="w-full h-auto object-contain"
            style={{
              objectFit: "contain",
              imageRendering: "auto",
              transition: "all 0.3s ease-in-out"
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-600">
            <Store size={80} className="text-white opacity-40" />
          </div>
        )}
        
        {/* Botón de regreso */}
        <button
          onClick={() => navigate('/tiendas')}
          className="absolute top-4 left-4 p-2 bg-black hover:bg-gray-800 text-white rounded-full transition-colors"
        >
          <ArrowLeft size={16} />
        </button>

      </div>

      {/* INFORMACIÓN DE LA TIENDA - DISEÑO MODERNO WOW */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-[1800px] mx-auto px-4 md:px-6 py-8"
      >
        {/* Logo + Info lado a lado */}
        <div className="flex items-start gap-5 lg:gap-8">
          {/* Logo circular */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="relative flex-shrink-0"
          >
            <img
              src={tienda.logo || ''}
              alt={`Logo de ${tienda.nombre}`}
              className="w-20 h-20 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-full object-cover shadow-lg"
              style={{ backgroundColor: tienda.logo ? 'transparent' : '#f3f4f6' }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="w-20 h-20 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shadow-lg" style={{ display: tienda.logo ? 'none' : 'flex' }}>
              <Store size={40} className="text-gray-400" />
            </div>
          </motion.div>
          
          {/* Información a la derecha del logo */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex-1 min-w-0"
          >
            {/* Nombre de la tienda */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 lg:mb-3">
              {tienda.nombre}
            </h1>
            
            {/* Stats */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 lg:mb-3">
              <span>{seguidores.toLocaleString()} seguidores</span>
              <span>·</span>
              <span>{productos.length} productos</span>
            </div>
            
            {/* Descripción */}
            {tienda.descripcion && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 lg:mb-4 max-w-2xl line-clamp-2 lg:line-clamp-none">
                {tienda.descripcion}
              </p>
            )}

            {/* Botones SOLO en desktop */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="hidden lg:flex flex-wrap items-center gap-3 mt-5"
            >
              {/* Botón Más información */}
              <button
                onClick={() => setShowInfoModal(true)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
              >
                <ChevronRight size={14} />
                <span>Más información</span>
              </button>

              {/* Botón Seguir - Solo para NO dueños */}
              {!isOwner && usuario && (
                <button
                  onClick={handleSeguir}
                  disabled={loadingSeguir}
                  className={`px-4 py-2 font-medium rounded-lg transition-all flex items-center gap-2 shadow-sm hover:shadow-md text-sm ${
                    siguiendo
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  } ${loadingSeguir ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loadingSeguir ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : siguiendo ? (
                    <>
                      <UserCheck size={14} />
                      <span>Siguiendo</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={14} />
                      <span>Seguir</span>
                    </>
                  )}
                </button>
              )}
              
              {/* Botón Editar - Solo para dueño */}
              {isOwner && (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all flex items-center gap-2 shadow-sm hover:shadow-md text-sm"
                >
                  <Edit size={14} />
                  <span>Editar tienda</span>
                </button>
              )}
            </motion.div>
          </motion.div>
        </div>

        {/* Botones debajo de TODO en móvil/tablet */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex lg:hidden flex-wrap items-center gap-3 mt-6"
        >
          {/* Botón Más información */}
          <button
            onClick={() => setShowInfoModal(true)}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all"
          >
            <ChevronRight size={14} />
            <span>Más información</span>
          </button>

          {/* Botón Seguir - Solo para NO dueños */}
          {!isOwner && usuario && (
            <button
              onClick={handleSeguir}
              disabled={loadingSeguir}
              className={`px-4 py-2 font-medium rounded-lg transition-all flex items-center gap-2 shadow-sm hover:shadow-md text-sm ${
                siguiendo
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              } ${loadingSeguir ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loadingSeguir ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : siguiendo ? (
                <>
                  <UserCheck size={14} />
                  <span>Siguiendo</span>
                </>
              ) : (
                <>
                  <UserPlus size={14} />
                  <span>Seguir</span>
                </>
              )}
            </button>
          )}
          
          {/* Botón Editar - Solo para dueño */}
          {isOwner && (
            <button
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all flex items-center gap-2 shadow-sm hover:shadow-md text-sm"
            >
              <Edit size={14} />
              <span>Editar tienda</span>
            </button>
          )}
        </motion.div>
      </motion.div>

      {/* PRODUCTOS DE LA TIENDA */}
      <div className="max-w-[1800px] mx-auto px-4 lg:px-6 py-8">

        {/* CONTROLES DE FILTRADO Y VISTA - REDISEÑADO RESPONSIVE */}
        <div className="mb-8">
          {/* En Desktop: Todo en una línea horizontal */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Búsqueda fija horizontal */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-14 pr-14 py-3.5 rounded-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200 shadow-md border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Categorías */}
            <motion.div
              layout
              className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-full px-6 py-3.5 shadow-md border border-gray-200 dark:border-gray-700"
            >
              <select
                value={categoriaSeleccionada}
                onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                className="bg-transparent border-none focus:ring-0 focus:outline-none text-gray-900 dark:text-white font-semibold cursor-pointer pr-8 appearance-none text-base"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.5rem center',
                  backgroundSize: '1.5em 1.5em',
                }}
              >
                {categorias.map(categoria => (
                  <option key={categoria} value={categoria} className="bg-white dark:bg-gray-800">
                    {categoria === 'todas' ? 'Todas las categorías' : categoria}
                  </option>
                ))}
              </select>
            </motion.div>

          </div>

          {/* En Móvil y Tablet: Vertical apilado */}
          <div className="lg:hidden flex flex-col gap-4">
            {/* Búsqueda móvil */}
            <div className="relative w-full">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-14 pr-14 py-4 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200 shadow-md border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda('')}
                  className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Botón para abrir modal de categorías móvil */}
            <button
              onClick={() => setShowCategoryModal(true)}
              className="flex items-center justify-between gap-3 bg-white dark:bg-gray-800 rounded-xl px-6 py-4 shadow-md border border-gray-200 dark:border-gray-700 w-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              <span className="text-gray-900 dark:text-white font-semibold text-base">
                {categoriaSeleccionada === 'todas' ? 'Todas las categorías' : categoriaSeleccionada}
              </span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* PRODUCTOS DE ESTA TIENDA - Organizados por categorías como en Productos Page */}
        {loadingProductos ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="relative inline-block">
              <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-600 dark:border-blue-400"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-20 w-20 border-4 border-blue-300 dark:border-blue-600 opacity-20"></div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-xl font-semibold mt-6 animate-pulse">Cargando productos...</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Un momento por favor</p>
          </motion.div>
        ) : productosFiltrados.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-12 max-w-2xl mx-auto border-2 border-dashed border-gray-300 dark:border-gray-600">
              <div className="bg-white dark:bg-gray-800 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Store className="w-12 h-12 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                {busqueda || categoriaSeleccionada !== 'todas' 
                  ? '🔍 No hay coincidencias' 
                  : '📦 Sin productos disponibles'
                }
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
                {busqueda || categoriaSeleccionada !== 'todas' 
                  ? 'Intenta ajustar tus filtros de búsqueda o explora otras categorías' 
                  : 'Esta tienda aún no tiene productos disponibles. ¡Vuelve pronto!'
                }
              </p>
              {(busqueda || categoriaSeleccionada !== 'todas') && (
                <button
                  onClick={() => {
                    setBusqueda('');
                    setCategoriaSeleccionada('todas');
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                  <RotateCw className="w-5 h-5" />
                  Ver todos los productos
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
            <AnimatePresence>
              {productosFiltrados.map((producto, index) => (
                <motion.div
                  key={producto.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <TarjetaProducto 
                    producto={producto}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* MODAL DE EDICIÓN DE TIENDA - PANTALLA COMPLETA SÓLIDA */}
      {showEditModal && (
        <div 
          className="fixed inset-0 z-[9999] overflow-hidden flex flex-col"
          style={{ 
            backgroundColor: '#ffffff',
            opacity: 1
          }}
        >
          <style>{`
            .dark .modal-edit-tienda {
              background-color: #111827 !important;
            }
            .modal-edit-tienda {
              background-color: #ffffff !important;
            }
          `}</style>
          <div className="modal-edit-tienda w-full h-full flex flex-col"
          >
            {/* Header limpio y profesional */}
            <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b-2 border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                    <Edit size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Editar Tienda
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Personaliza tu tienda</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 hover:scale-105 group"
                  title="Cerrar"
                >
                  <X size={24} className="text-gray-500 dark:text-gray-400 group-hover:text-red-500 dark:group-hover:text-red-400" />
                </button>
              </div>
            </div>

            {/* Contenido del Modal - Espaciado profesional */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="space-y-8">
                {/* Nombre de la Tienda */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white dark:from-gray-800 dark:to-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <label className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
                    <Store size={18} className="text-gray-600 dark:text-blue-400" />
                    Nombre de la Tienda
                  </label>
                  <input
                    type="text"
                    value={editData.nombre}
                    onChange={(e) => setEditData(prev => ({ ...prev, nombre: e.target.value }))}
                    className="w-full px-5 py-3.5 border border-gray-200 dark:border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-base font-medium transition-all duration-200 hover:border-gray-300 hover:bg-white"
                    placeholder="Ej: Mi Tienda Oficial"
                  />
                </motion.div>

                {/* Descripción */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="bg-white dark:from-gray-800 dark:to-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <label className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
                    <Info size={18} className="text-gray-600 dark:text-purple-400" />
                    Descripción
                  </label>
                  <textarea
                    value={editData.descripcion}
                    onChange={(e) => setEditData(prev => ({ ...prev, descripcion: e.target.value }))}
                    rows={4}
                    className="w-full px-5 py-3.5 border border-gray-200 dark:border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-base transition-all duration-200 resize-none hover:border-gray-300 hover:bg-white"
                    placeholder="Describe tu tienda, productos y servicios..."
                  />
                </motion.div>

                {/* Enlaces Múltiples */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white dark:from-gray-800 dark:to-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                      <Globe size={20} className="text-gray-600 dark:text-green-400" />
                      Enlaces y Redes Sociales
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setEditData(prev => ({
                          ...prev,
                          enlaces: [...(prev.enlaces || []), { titulo: '', tipo: 'otro', url: '' }]
                        }));
                      }}
                      className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.02]"
                    >
                      <Plus size={18} />
                      Agregar Enlace
                    </button>
                  </div>

                  <div className="space-y-4">
                    {(editData.enlaces || []).map((enlace, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-5 bg-white dark:bg-gray-700 rounded-2xl border border-gray-200 dark:border-gray-500 hover:border-blue-400 dark:hover:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <div className="grid grid-cols-12 gap-4">
                          {/* Título */}
                          <div className="col-span-12 pb-3 mb-3 border-b border-gray-200 dark:border-gray-500">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                              Título
                            </label>
                            <input
                              type="text"
                              value={enlace.titulo || ''}
                              onChange={(e) => {
                                const newEnlaces = [...editData.enlaces];
                                newEnlaces[index].titulo = e.target.value;
                                setEditData(prev => ({ ...prev, enlaces: newEnlaces }));
                              }}
                              placeholder="Ej: TikTok de mi tienda, WhatsApp Ventas..."
                              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 text-sm transition-all duration-200 hover:border-gray-300 hover:bg-white dark:hover:bg-gray-900"
                            />
                          </div>

                          {/* Ícono */}
                          <div className="col-span-12 sm:col-span-5">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                              Ícono
                            </label>
                            <select
                              value={enlace.tipo || 'otro'}
                              onChange={(e) => {
                                const newEnlaces = [...editData.enlaces];
                                newEnlaces[index].tipo = e.target.value;
                                setEditData(prev => ({ ...prev, enlaces: newEnlaces }));
                              }}
                              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 text-sm transition-all duration-200 hover:border-gray-300 hover:bg-white dark:hover:bg-gray-900"
                            >
                              <option value="otro">Enlace genérico</option>
                              <option value="website">Sitio Web</option>
                              <option value="whatsapp">WhatsApp 1</option>
                              <option value="whatsapp2">WhatsApp 2</option>
                              <option value="facebook">Facebook</option>
                              <option value="instagram">Instagram</option>
                              <option value="youtube">YouTube</option>
                              <option value="tiktok">TikTok</option>
                              <option value="twitter">Twitter/X</option>
                              <option value="telegram">Telegram</option>
                              <option value="email">Email</option>
                            </select>
                          </div>

                          {/* Enlace */}
                          <div className="col-span-12 sm:col-span-6">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                              Enlace
                            </label>
                            <input
                              type="text"
                              value={enlace.url || ''}
                              onChange={(e) => {
                                const newEnlaces = [...editData.enlaces];
                                newEnlaces[index].url = e.target.value;
                                setEditData(prev => ({ ...prev, enlaces: newEnlaces }));
                              }}
                              placeholder="https://... o +1809..."
                              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 text-sm transition-all duration-200 hover:border-gray-300 hover:bg-white dark:hover:bg-gray-900"
                            />
                          </div>

                          {/* Eliminar */}
                          <div className="col-span-12 sm:col-span-1 flex items-end">
                            <button
                              type="button"
                              onClick={() => {
                                const newEnlaces = editData.enlaces.filter((_, i) => i !== index);
                                setEditData(prev => ({ ...prev, enlaces: newEnlaces }));
                              }}
                              className="w-full px-2 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                              title="Eliminar"
                            >
                              <X size={16} className="mx-auto" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {(!editData.enlaces || editData.enlaces.length === 0) && (
                      <p className="text-center text-gray-500 dark:text-gray-400 py-6 text-sm">
                        No hay enlaces. Haz clic en "Agregar" para comenzar.
                      </p>
                    )}
                  </div>
                </motion.div>

                {/* Banner */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="bg-white dark:from-gray-800 dark:to-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <label className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
                    <Camera size={18} className="text-gray-600 dark:text-orange-400" />
                    Banner de la Tienda
                  </label>
                  <div className="space-y-3">
                    {editData.banner && (
                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center border-2 border-gray-200 dark:border-gray-600">
                        <img
                          src={editData.banner}
                          alt="Preview banner"
                          className="w-full h-auto object-contain"
                          style={{
                            objectFit: "contain",
                            imageRendering: "auto",
                            maxHeight: "200px"
                          }}
                        />
                      </div>
                    )}
                    <label className="flex items-center justify-center w-full h-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 transition-all duration-200">
                      <Upload size={16} className="mr-2 text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400 text-sm">Cambiar Banner</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'banner')}
                        className="hidden"
                      />
                    </label>
                  </div>
                </motion.div>

                {/* Logo */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white dark:from-gray-800 dark:to-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <label className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
                    <Upload size={18} className="text-gray-600 dark:text-cyan-400" />
                    Logo de la Tienda
                  </label>
                  <div className="space-y-3">
                    {editData.logo && (
                      <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mx-auto border-2 border-gray-200 dark:border-gray-600 flex items-center justify-center">
                        <img
                          src={editData.logo}
                          alt="Preview logo"
                          className="w-full h-full object-contain p-2"
                          style={{
                            imageRendering: "auto"
                          }}
                        />
                      </div>
                    )}
                    <label className="flex items-center justify-center w-full h-14 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 transition-all duration-200">
                      <Upload size={16} className="mr-2 text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400 text-sm">Cambiar Logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'logo')}
                        className="hidden"
                      />
                    </label>
                  </div>
                </motion.div>
                </div>
              </div>
            </div>

            {/* Footer profesional */}
            <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-t-2 border-gray-200 dark:border-gray-700 shadow-2xl">
              <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">Los cambios se guardarán permanentemente</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl font-semibold transition-all duration-200 border-2 border-gray-300 dark:border-gray-600 hover:scale-105"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveTienda}
                    disabled={uploading}
                    className="flex items-center gap-2 px-8 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.02]"
                  >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Guardar Cambios
                    </>
                  )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CROP PROFESIONAL CON REACT-EASY-CROP */}
      <AnimatePresence>
        {showCropModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black flex items-center justify-center z-[9999]"
          >
            <div className="w-[98vw] h-[95vh] bg-black flex flex-col">
              {/* Header */}
              <motion.div 
                initial={{ y: -50 }}
                animate={{ y: 0 }}
                className="flex items-center justify-between p-3 bg-black text-white border-b border-gray-800"
              >
                <button
                  onClick={() => {
                    setShowCropModal(false);
                    setOriginalImage(null);
                    setCropType(null);
                  }}
                  className="p-2.5 hover:bg-gray-800 rounded-full transition-colors"
                  disabled={uploading}
                >
                  <X size={24} className="text-white" />
                </button>
                <div className="text-center">
                  <h2 className="text-lg font-semibold">
                    {cropType === 'banner' ? '📸 Banner Horizontal' : '🖼️ Ajustar Logo'}
                  </h2>
                  {cropType === 'banner' && (
                    <p className="text-xs text-gray-400 mt-1">Usa el zoom para ajustar tu imagen horizontal</p>
                  )}
                </div>
                <button
                  onClick={applyCrop}
                  disabled={uploading || !croppedAreaPixels}
                  className={`px-5 py-2 rounded-lg font-semibold transition-all ${
                    uploading || !croppedAreaPixels
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105'
                  }`}
                >
                  {uploading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Guardando...
                    </div>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Save size={16} />
                      Guardar
                    </span>
                  )}
                </button>
              </motion.div>

              {/* Área de crop con react-easy-crop */}
              <div className="flex-1 relative overflow-hidden bg-black">
                {originalImage && (
                  <Cropper
                    image={originalImage}
                    crop={crop}
                    zoom={zoom}
                    rotation={rotation}
                    aspect={cropType === 'logo' ? 1 : undefined}
                    restrictPosition={false}
                    objectFit="contain"
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onRotationChange={setRotation}
                    onCropComplete={onCropComplete}
                    showGrid={true}
                    cropShape={cropType === 'logo' ? 'round' : 'rect'}
                    style={{
                      containerStyle: {
                        backgroundColor: '#000',
                        width: '100%',
                        height: '100%'
                      },
                      cropAreaStyle: {
                        border: '2px solid #3b82f6',
                        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)'
                      },
                      mediaStyle: {
                        width: '100%',
                        height: '100%'
                      }
                    }}
                  />
                )}
              </div>

              {/* Controles */}
              <motion.div 
                initial={{ y: 50 }}
                animate={{ y: 0 }}
                className="p-3 bg-black border-t border-gray-800 space-y-3"
              >
                {/* Zoom */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-white text-sm">
                    <span className="font-medium">🔍 Zoom</span>
                    <span className="text-gray-400">{zoom.toFixed(1)}x</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                      className="w-9 h-9 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center text-white text-lg font-bold transition-colors"
                      disabled={uploading}
                    >
                      -
                    </button>
                    <input
                      type="range"
                      min={0.5}
                      max={3}
                      step={0.1}
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      disabled={uploading}
                    />
                    <button
                      onClick={() => setZoom(Math.min(3, zoom + 0.2))}
                      className="w-9 h-9 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center text-white text-lg font-bold transition-colors"
                      disabled={uploading}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Rotación */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-white text-sm">
                    <span className="font-medium">🔄 Rotación</span>
                    <span className="text-gray-400">{rotation}°</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setRotation(Math.max(-180, rotation - 15))}
                      className="w-9 h-9 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center text-white transition-colors"
                      disabled={uploading}
                    >
                      <RotateCw size={16} className="transform -scale-x-100" />
                    </button>
                    <input
                      type="range"
                      min={-180}
                      max={180}
                      step={1}
                      value={rotation}
                      onChange={(e) => setRotation(parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      disabled={uploading}
                    />
                    <button
                      onClick={() => setRotation(Math.min(180, rotation + 15))}
                      className="w-9 h-9 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center text-white transition-colors"
                      disabled={uploading}
                    >
                      <RotateCw size={16} />
                    </button>
                  </div>
                </div>

                {/* Botón reset */}
                <button
                  onClick={() => {
                    setZoom(1);
                    setRotation(0);
                    setCrop({ x: 0, y: 0 });
                  }}
                  className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm font-medium"
                  disabled={uploading}
                >
                  ↺ Restablecer
                </button>

                {/* Instrucciones */}
                <div className="text-center pt-2">
                  <p className="text-gray-400 text-xs leading-relaxed">
                    💡 Arrastra la imagen • Pellizca para zoom • Usa los controles para ajustar
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL DE MÁS INFORMACIÓN - DISEÑO PROFESIONAL */}
      <AnimatePresence>
        {showInfoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 flex items-center justify-center z-[99999] p-4 md:p-6"
            style={{ 
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              backgroundColor: 'rgba(0, 0, 0, 0.7)'
            }}
            onClick={() => setShowInfoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden"
            >
              {/* Header limpio */}
              <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center z-10">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{tienda.nombre}</h3>
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  title="Cerrar"
                >
                  <X size={20} className="text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              {/* Body espaciado */}
              <div className="p-6 md:p-7 space-y-6 overflow-y-auto max-h-[calc(85vh-120px)]">
                {/* Descripción */}
                {tienda.descripcion && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Descripción</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{tienda.descripcion}</p>
                  </div>
                )}

                {/* Estadísticas */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Estadísticas</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Seguidores */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-600">
                      <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Seguidores</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{seguidores.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Productos */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-600">
                      <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Productos</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{productos.length}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enlaces Múltiples */}
                {(tienda.enlaces && tienda.enlaces.length > 0) && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Enlaces</h4>
                    <div className="space-y-2">
                      {tienda.enlaces.map((enlace, index) => {
                        // Función para obtener el ícono según el tipo
                        const getIcon = (tipo) => {
                          switch(tipo) {
                            case 'whatsapp':
                            case 'whatsapp2':
                              return (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.304-1.654a11.882 11.882 0 005.713 1.456h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                </svg>
                              );
                            case 'youtube':
                              return (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                </svg>
                              );
                            case 'facebook':
                              return (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                              );
                            case 'instagram':
                              return (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                                </svg>
                              );
                            case 'tiktok':
                              return (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                                </svg>
                              );
                            case 'twitter':
                              return (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                </svg>
                              );
                            case 'telegram':
                              return (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                                </svg>
                              );
                            case 'email':
                              return (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                              );
                            case 'website':
                            default:
                              return <Globe className="w-5 h-5" />;
                          }
                        };

                        // Función para obtener el href según el tipo
                        const getHref = (enlace) => {
                          if (enlace.tipo === 'whatsapp' || enlace.tipo === 'whatsapp2') {
                            return `https://wa.me/${enlace.url.replace(/\D/g, '')}`;
                          } else if (enlace.tipo === 'email') {
                            return `mailto:${enlace.url}`;
                          } else if (enlace.tipo === 'telegram') {
                            return `https://t.me/${enlace.url.replace('@', '')}`;
                          } else {
                            return enlace.url;
                          }
                        };

                        // Función para obtener el texto a mostrar
                        const getText = (enlace) => {
                          // PRIORIDAD 1: El título que TÚ escribiste
                          if (enlace.titulo && enlace.titulo.trim()) {
                            return enlace.titulo;
                          }
                          
                          // PRIORIDAD 2: Etiqueta (por compatibilidad)
                          if (enlace.etiqueta && enlace.etiqueta.trim()) {
                            return enlace.etiqueta;
                          }
                          
                          // PRIORIDAD 3: Mostrar la URL o número
                          if (enlace.url) {
                            return enlace.url.replace(/^https?:\/\//, '').substring(0, 50);
                          }
                          
                          return 'Enlace';
                        };

                        return (
                          <a
                            key={index}
                            href={getHref(enlace)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg text-sm text-gray-900 dark:text-white font-medium transition-colors duration-200 border-2 border-gray-200 dark:border-gray-600 hover:border-blue-500"
                          >
                            <div className="text-blue-600 dark:text-blue-400 w-5 h-5 flex-shrink-0">
                              {getIcon(enlace.tipo)}
                            </div>
                            <span className="flex-1 truncate">{getText(enlace)}</span>
                            <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Botón compartir tienda */}
                <button
                  onClick={() => {
                    const url = window.location.href;
                    if (navigator.share) {
                      navigator.share({
                        title: `Tienda ${tienda.nombre}`,
                        url: url
                      });
                    } else {
                      navigator.clipboard.writeText(url);
                      alert('Enlace copiado al portapapeles');
                    }
                  }}
                  className="w-full px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-sm"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Compartir tienda</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL DE CATEGORÍAS - PANTALLA COMPLETA MÓVIL/TABLET */}
      <AnimatePresence>
        {showCategoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-[99999] bg-white dark:bg-gray-900 flex flex-col"
          >
            {/* Header */}
            <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Categorías</h2>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Lista de categorías */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <div className="space-y-2">
                {categorias.map((categoria, index) => (
                  <motion.button
                    key={categoria}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      setCategoriaSeleccionada(categoria);
                      setShowCategoryModal(false);
                    }}
                    className={`w-full text-left px-6 py-5 rounded-2xl transition-all duration-200 flex items-center justify-between ${
                      categoriaSeleccionada === categoria
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl scale-[1.02]'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <span className="font-bold text-lg">
                      {categoria === 'todas' ? 'Todas las categorías' : categoria}
                    </span>
                    {categoriaSeleccionada === categoria && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md"
                      >
                        <div className="w-3.5 h-3.5 bg-blue-600 rounded-full" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Footer con información */}
            <div className="flex-shrink-0 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                {productos.length} productos disponibles
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
