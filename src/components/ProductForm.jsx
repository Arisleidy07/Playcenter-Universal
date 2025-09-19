import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc, updateDoc, doc, getDocs, setDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject, uploadBytesResumable } from 'firebase/storage';
import { db, storage } from '../firebase';

const ProductForm = ({ product, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    empresa: '',
    precio: '',
    cantidad: 0,
    descripcion: '',
    categoria: '',
    nuevaCategoria: '',
    imagen: '',
    imagenes: [],
    imagenesExtra: [],
    videoUrl: '',
    videoUrls: [],
    oferta: false,
    precioOferta: '',
    estado: 'Nuevo',
    acerca: [''],
    variantes: [{ color: '', imagen: '', imagenes: [], cantidad: 0 }],
    etiquetas: [''],
    activo: true,
    fechaPublicacion: new Date().toISOString().split('T')[0],
    sku: '',
    peso: '',
    dimensiones: ''
  });

  const [categorias, setCategorias] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  // ID actual del producto (existe si estamos editando o si creamos un borrador)
  const [currentId, setCurrentId] = useState(product?.id || null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null); // 0-100 for videos/images
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  // Previews locales (no se guardan en Firestore)
  const [tempPreviews, setTempPreviews] = useState({
    imagen: '',
    imagenes: [],
    variantes: {}, // index -> { imagen: '', imagenes: [] }
  });
  // Cola de subidas por archivo (con progreso/cancelar/reintentar)
  const [uploadQueue, setUploadQueue] = useState([]); // {id,name,file,type:'image'|'video',progress,status:'uploading'|'done'|'error'|'canceled', target:{level:'product'|'variant', field, variantIndex|null}, task}

  useEffect(() => {
    loadCategorias();
    loadBrands();
    if (product) {
      setFormData({
        ...product,
        precio: product.precio?.toString() || '',
        fechaPublicacion: product.fechaPublicacion || new Date().toISOString().split('T')[0],
        acerca: product.acerca || [''],
        etiquetas: product.etiquetas || [''],
        variantes: product.variantes || [{ color: '', imagen: '', imagenes: [], cantidad: 0 }],
        videoUrls: product.videoUrls || []
      });
    } else {
      // Si estamos creando uno nuevo y aún no existe un borrador, crearlo de inmediato
      (async () => {
        try { await ensureCurrentId(); } catch {}
      })();
    }
  }, [product]);

  // Suscripción en tiempo real al producto/draft para mantener sincronizado el formulario
  useEffect(() => {
    const id = currentId || product?.id;
    if (!id) return;
    const unsub = onSnapshot(doc(db, 'productos', id), (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      // Merge no destructivo: priorizar lo que está en Firestore para medios y campos base,
      // pero no sobreescribir previews locales temporales
      setFormData((prev) => ({
        ...prev,
        id: data.id || id,
        nombre: data.nombre ?? prev.nombre,
        descripcion: data.descripcion ?? prev.descripcion,
        empresa: data.empresa ?? prev.empresa,
        categoria: data.categoria ?? prev.categoria,
        precio: (data.precio ?? prev.precio)?.toString?.() || String(data.precio ?? prev.precio ?? ''),
        cantidad: data.cantidad ?? prev.cantidad,
        etiquetas: Array.isArray(data.etiquetas) ? data.etiquetas : (prev.etiquetas || []),
        acerca: Array.isArray(data.acerca) ? data.acerca : (prev.acerca || []),
        imagen: data.imagen ?? prev.imagen,
        imagenes: Array.isArray(data.imagenes) ? data.imagenes : (prev.imagenes || []),
        videoUrls: Array.isArray(data.videoUrls) ? data.videoUrls : (prev.videoUrls || []),
        variantes: Array.isArray(data.variantes) ? data.variantes : (prev.variantes || []),
        activo: data.activo ?? prev.activo,
      }));
    });
    return () => unsub();
  }, [currentId, product?.id]);

  // Auto-guardado (debounced) de campos de texto/base cuando existe draft o producto
  useEffect(() => {
    const id = currentId || product?.id;
    if (!id) return;
    const timer = setTimeout(() => {
      try {
        updateDoc(doc(db, 'productos', id), {
          nombre: formData.nombre || 'Borrador',
          descripcion: formData.descripcion || '',
          empresa: formData.empresa || '',
          categoria: formData.categoria || '',
          precio: parseFloat(formData.precio) || 0,
          cantidad: Number(formData.cantidad) || 0,
          etiquetas: Array.isArray(formData.etiquetas) ? formData.etiquetas : [],
          acerca: Array.isArray(formData.acerca) ? formData.acerca : [],
          fechaActualizacion: new Date(),
        }).catch(() => {});
      } catch {}
    }, 600);
    return () => clearTimeout(timer);
  }, [currentId, product?.id, formData.nombre, formData.descripcion, formData.empresa, formData.categoria, formData.precio, formData.cantidad, formData.etiquetas, formData.acerca]);

  // Crea un borrador en Firestore si aún no hay ID (para propagar en vivo al subir medios)
  const ensureCurrentId = async () => {
    if (currentId) return currentId;
    const newId = `prod_${Date.now()}`;
    const baseDraft = {
      id: newId,
      nombre: formData.nombre || 'Borrador',
      descripcion: formData.descripcion || '',
      empresa: formData.empresa || '',
      precio: parseFloat(formData.precio) || 0,
      cantidad: Number(formData.cantidad) || 0,
      categoria: formData.categoria || '',
      imagen: formData.imagen || '',
      imagenes: Array.isArray(formData.imagenes) ? formData.imagenes : [],
      videoUrls: Array.isArray(formData.videoUrls) ? formData.videoUrls : [],
      variantes: Array.isArray(formData.variantes) ? formData.variantes : [],
      activo: false,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
    };

  // Helpers para reordenar videos del producto (persistencia inmediata)
  const moveProductVideo = (fromIndex, direction) => {
    setFormData((prev) => {
      const vids = Array.isArray(prev.videoUrls) ? [...prev.videoUrls] : [];
      const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
      if (toIndex < 0 || toIndex >= vids.length) return prev;
      const [m] = vids.splice(fromIndex, 1);
      vids.splice(toIndex, 0, m);
      const next = { ...prev, videoUrls: vids };
      const targetId = currentId || product?.id;
      if (targetId) updateDoc(doc(db, 'productos', targetId), { videoUrls: vids, fechaActualizacion: new Date() }).catch(() => {});
      return next;
    });
  };

  // Helpers para reordenar videos de una variante (persistencia inmediata)
  const moveVariantVideo = (variantIndex, fromIndex, direction) => {
    setFormData((prev) => {
      const variantes = [...prev.variantes];
      const vids = Array.isArray(variantes[variantIndex]?.videoUrls) ? [...variantes[variantIndex].videoUrls] : [];
      const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
      if (toIndex < 0 || toIndex >= vids.length) return prev;
      const [m] = vids.splice(fromIndex, 1);
      vids.splice(toIndex, 0, m);
      variantes[variantIndex] = { ...variantes[variantIndex], videoUrls: vids };
      const next = { ...prev, variantes };
      const targetId = currentId || product?.id;
      if (targetId) updateDoc(doc(db, 'productos', targetId), { variantes, fechaActualizacion: new Date() }).catch(() => {});
      return next;
    });
  };
    try {
      await setDoc(doc(db, 'productos', newId), baseDraft);
      setCurrentId(newId);
      setFormData((prev) => ({ ...prev, id: newId }));
      return newId;
    } catch (e) {
      console.error('No se pudo crear borrador de producto:', e);
      throw e;
    }
  };

  const loadCategorias = async () => {
    try {
      const categoriasSnap = await getDocs(collection(db, 'categorias'));
      const categoriasData = categoriasSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCategorias(categoriasData);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleVariantVideoUpload = async (files, variantIndex) => {
    if (!files?.length) return;
    setUploadingImages(true);
    const tasks = Array.from(files).map(async (file) => {
      const id = `${Date.now()}_${file.name}_${Math.random().toString(36).slice(2,7)}`;
      setUploadQueue((prev) => ([...prev, { id, name: file.name, file, type: 'video', progress: 0, status: 'uploading', target: { level: 'variant', field: 'videoUrls', variantIndex }, task: null }]));
      try {
        const url = await uploadWithRetry(uploadVideo, file, (formData.nombre || currentId || 'temp'), id);
        // Update local + Firestore (when editing) using functional state to avoid races
        setFormData((prev) => {
          const current = Array.isArray(prev.variantes[variantIndex]?.videoUrls)
            ? prev.variantes[variantIndex].videoUrls
            : [];
          const newVariants = prev.variantes.map((v, i) => i === variantIndex ? { ...v, videoUrls: [...current, url] } : v);
          if (product?.id || currentId) {
            const targetId = currentId || product.id;
            updateDoc(doc(db, 'productos', targetId), { variantes: newVariants, fechaActualizacion: new Date() }).catch(() => {});
          }
          return { ...prev, variantes: newVariants };
        });
      } catch (e) {
        console.error('Variant video upload failed for file', file?.name, e);
      }
    });
    try {
      await Promise.allSettled(tasks);
    } finally {
      setUploadingImages(false);
      setUploadProgress(null);
    }
  };

  const loadBrands = async () => {
    try {
      const snap = await getDocs(collection(db, 'productos'));
      const all = snap.docs.map(d => d.data()?.empresa).filter(Boolean);
      const unique = Array.from(new Set(all)).sort((a,b) => a.localeCompare(b));
      setBrands(unique);
    } catch (e) {
      // silently ignore
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Persistir inmediatamente ciertos campos clave si ya hay un doc (editar o borrador creado)
    const targetId = currentId || product?.id;
    if (targetId && ['imagen', 'imagenes', 'videoUrls'].includes(field)) {
      try {
        updateDoc(doc(db, 'productos', targetId), { [field]: value, fechaActualizacion: new Date() });
      } catch {}
    }
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], field === 'variantes' ? { color: '', imagen: '', imagenes: [], cantidad: 0 } : '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleVariantChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      variantes: prev.variantes.map((variant, i) => 
        i === index ? { ...variant, [field]: value } : variant
      )
    }));
    // Persistir variantes inmediatamente si hay doc
    const targetId = currentId || product?.id;
    if (targetId) {
      try {
        // Construir el nuevo array en base al estado más reciente conocido
        setFormData(prev => {
          const nuevas = prev.variantes.map((v, i) => i === index ? { ...v, [field]: value } : v);
          updateDoc(doc(db, 'productos', targetId), { variantes: nuevas, fechaActualizacion: new Date() }).catch(() => {});
          return { ...prev, variantes: nuevas };
        });
      } catch {}
    }
  };

  const uploadImage = async (file, path, queueId) => {
    return new Promise((resolve, reject) => {
      try {
        const imageRef = ref(storage, `productos/${path}/imagenes/${Date.now()}_${file.name}`);
        const task = uploadBytesResumable(imageRef, file);
        // attach task to queue item
        setUploadQueue((prev) => prev.map((q) => (q.id === queueId ? { ...q, task } : q)));
        task.on('state_changed', (snap) => {
          const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
          setUploadProgress(pct);
          setUploadQueue((prev) => prev.map((q) => (q.id === queueId ? { ...q, progress: pct } : q)));
          // Watchdog: si sigue en 0% tras 6s, cancelar para reintentar
          setTimeout(() => {
            setUploadQueue((prev) => {
              const item = prev.find((q) => q.id === queueId);
              if (item && item.status === 'uploading' && (!item.progress || item.progress === 0) && item.task) {
                try { item.task.cancel(); } catch {}
                return prev.map((q) => q.id === queueId ? { ...q, status: 'error' } : q);
              }
              return prev;
            });
          }, 6000);
        }, (err) => {
          setUploadQueue((prev) => prev.map((q) => (q.id === queueId ? { ...q, status: 'error' } : q)));
          reject(err);
        }, async () => {
          const url = await getDownloadURL(task.snapshot.ref);
          setUploadQueue((prev) => prev.map((q) => (q.id === queueId ? { ...q, status: 'done' } : q)));
          resolve(url);
        });
      } catch (e) {
        setUploadQueue((prev) => prev.map((q) => (q.id === queueId ? { ...q, status: 'error' } : q)));
        reject(e);
      }
    });
  };

  const uploadVideo = async (file, path, queueId) => {
    return new Promise((resolve, reject) => {
      try {
        const videoRef = ref(storage, `productos/${path}/videos/${Date.now()}_${file.name}`);
        const task = uploadBytesResumable(videoRef, file);
        setUploadQueue((prev) => prev.map((q) => (q.id === queueId ? { ...q, task } : q)));
        task.on('state_changed', (snap) => {
          const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
          setUploadProgress(pct);
          setUploadQueue((prev) => prev.map((q) => (q.id === queueId ? { ...q, progress: pct } : q)));
        }, (err) => {
          setUploadQueue((prev) => prev.map((q) => (q.id === queueId ? { ...q, status: 'error' } : q)));
          reject(err);
        }, async () => {
          const url = await getDownloadURL(task.snapshot.ref);
          setUploadQueue((prev) => prev.map((q) => (q.id === queueId ? { ...q, status: 'done' } : q)));
          resolve(url);
        });
      } catch (e) {
        setUploadQueue((prev) => prev.map((q) => (q.id === queueId ? { ...q, status: 'error' } : q)));
        reject(e);
      }
    });
  };

  const handleVideoFilesUpload = async (files) => {
    if (!files?.length) return;
    setUploadingImages(true);
    const tasks = Array.from(files).map(async (file) => {
      const id = `${Date.now()}_${file.name}_${Math.random().toString(36).slice(2,7)}`;
      setUploadQueue((prev) => ([...prev, { id, name: file.name, file, type: 'video', progress: 0, status: 'uploading', target: { level: 'product', field: 'videoUrls', variantIndex: null }, task: null }]));
      try {
        const url = await uploadWithRetry(uploadVideo, file, (formData.nombre || currentId || 'temp'), id);
        // Update local state immediately
        setFormData((prev) => {
          const next = { ...prev, videoUrls: [...(prev.videoUrls || []), url] };
          // Instant Firestore propagation when editing existing product
          if (product?.id || currentId) {
            const targetId = currentId || product.id;
            updateDoc(doc(db, 'productos', targetId), { videoUrls: next.videoUrls, fechaActualizacion: new Date() }).catch(() => {});
          }
          return next;
        });
      } catch (e) {
        console.error('Video upload failed for file', file?.name, e);
      }
    });
    try {
      await Promise.allSettled(tasks);
    } finally {
      setUploadingImages(false);
      setUploadProgress(null);
    }
  };

  const handleImageUpload = async (files, field, variantIndex = null) => {
    // Crear previews locales inmediatas
    const localUrls = Array.from(files).map((f) => URL.createObjectURL(f));
    if (variantIndex !== null) {
      setTempPreviews((prev) => {
        const actual = prev.variantes[variantIndex] || { imagen: '', imagenes: [] };
        if (field === 'imagen') {
          return {
            ...prev,
            variantes: { ...prev.variantes, [variantIndex]: { ...actual, imagen: localUrls[0] } },
          };
        }
        if (field === 'imagenes') {
          return {
            ...prev,
            variantes: {
              ...prev.variantes,
              [variantIndex]: { ...actual, imagenes: [...actual.imagenes, ...localUrls] },
            },
          };
        }
        return prev;
      });
    } else if (field === 'imagen') {
      setTempPreviews((prev) => ({ ...prev, imagen: localUrls[0] }));
    } else if (field === 'imagenes') {
      setTempPreviews((prev) => ({ ...prev, imagenes: [...prev.imagenes, ...localUrls] }));
    }

    setUploadingImages(true);
    const filesArr = Array.from(files);
    const tasks = filesArr.map(async (file) => {
      const id = `${Date.now()}_${file.name}_${Math.random().toString(36).slice(2,7)}`;
      setUploadQueue((prev) => ([...prev, { id, name: file.name, file, type: 'image', progress: 0, status: 'uploading', target: { level: variantIndex !== null ? 'variant' : 'product', field, variantIndex }, task: null }]));
      try {
        // Asegura un ID para que la propagación en vivo funcione al crear nuevo producto
        const targetId = currentId || product?.id || await ensureCurrentId();
        const url = await uploadWithRetry(uploadImage, file, (formData.nombre || targetId || 'temp'), id);
        if (variantIndex !== null) {
          // Functional set to avoid races and also update Firestore immediately when editing
          setFormData((prev) => {
            if (field === 'imagen') {
              const newVariants = prev.variantes.map((v, i) => i === variantIndex ? { ...v, imagen: url } : v);
              if (product?.id || currentId) updateDoc(doc(db, 'productos', targetId), { variantes: newVariants, fechaActualizacion: new Date() }).catch(() => {});
              return { ...prev, variantes: newVariants };
            } else if (field === 'imagenes') {
              const current = Array.isArray(prev.variantes[variantIndex]?.imagenes) ? prev.variantes[variantIndex].imagenes : [];
              const newVariants = prev.variantes.map((v, i) => i === variantIndex ? { ...v, imagenes: [...current, url] } : v);
              if (product?.id || currentId) updateDoc(doc(db, 'productos', targetId), { variantes: newVariants, fechaActualizacion: new Date() }).catch(() => {});
              return { ...prev, variantes: newVariants };
            } else {
              const current = Array.isArray(prev.variantes[variantIndex]?.[field]) ? prev.variantes[variantIndex][field] : [];
              const newVariants = prev.variantes.map((v, i) => i === variantIndex ? { ...v, [field]: [...current, url] } : v);
              if (product?.id || currentId) updateDoc(doc(db, 'productos', targetId), { variantes: newVariants, fechaActualizacion: new Date() }).catch(() => {});
              return { ...prev, variantes: newVariants };
            }
          });
        } else if (field === 'imagen') {
          setFormData((prev) => {
            const next = { ...prev, imagen: url };
            updateDoc(doc(db, 'productos', targetId), { imagen: url, fechaActualizacion: new Date() }).catch(() => {});
            return next;
          });
        } else {
          setFormData((prev) => {
            const next = { ...prev, [field]: [...prev[field], url] };
            updateDoc(doc(db, 'productos', targetId), { [field]: next[field], fechaActualizacion: new Date() }).catch(() => {});
            return next;
          });
        }
      } catch (e) {
        console.error('Image upload failed for file', file?.name, e);
      }
    });
    try {
      await Promise.allSettled(tasks);
    } catch {}
    setUploadingImages(false);
    setUploadProgress(null);
    // Limpiar previews locales usadas para esta carga
    if (variantIndex !== null) {
      setTempPreviews((prev) => {
        const copy = { ...prev.variantes[variantIndex] };
        if (field === 'imagen') copy.imagen = '';
        if (field === 'imagenes') copy.imagenes = [];
        return { ...prev, variantes: { ...prev.variantes, [variantIndex]: copy } };
      });
    } else if (field === 'imagen') {
      setTempPreviews((prev) => ({ ...prev, imagen: '' }));
    } else if (field === 'imagenes') {
      setTempPreviews((prev) => ({ ...prev, imagenes: [] }));
    }
  };

  // Cancelar una subida en curso
  const cancelUpload = (id) => {
    setUploadQueue((prev) => {
      const item = prev.find((q) => q.id === id);
      if (item?.task) {
        try { item.task.cancel(); } catch {}
      }
      return prev.map((q) => (q.id === id ? { ...q, status: 'canceled' } : q));
    });
  };

  // Reintentar subida fallida (vuelve a encolar con mismo target)
  const retryUpload = async (id) => {
    const item = uploadQueue.find((q) => q.id === id);
    if (!item) return;
    const file = item.file;
    const newId = `${Date.now()}_${file?.name || 'file'}_${Math.random().toString(36).slice(2,7)}`;
    setUploadQueue((prev) => prev.map((q) => (q.id === id ? { ...q, id: newId, progress: 0, status: 'uploading', task: null } : q)));
    const path = formData.nombre || 'temp';
    try {
      if (item.type === 'image') {
        const url = await uploadWithRetry(uploadImage, file, path, newId);
        if (item.target.level === 'variant') {
          const idx = item.target.variantIndex;
          if (item.target.field === 'imagen') {
            handleVariantChange(idx, 'imagen', url);
          } else {
            const current = Array.isArray(formData.variantes[idx]?.imagenes) ? formData.variantes[idx].imagenes : [];
            handleVariantChange(idx, 'imagenes', [...current, url]);
          }
        } else {
          if (item.target.field === 'imagen') handleInputChange('imagen', url);
          else handleInputChange('imagenes', [...formData.imagenes, url]);
        }
      } else if (item.type === 'video') {
        const url = await uploadWithRetry(uploadVideo, file, path, newId);
        if (item.target.level === 'variant') {
          const idx = item.target.variantIndex;
          const current = Array.isArray(formData.variantes[idx]?.videoUrls) ? formData.variantes[idx].videoUrls : [];
          handleVariantChange(idx, 'videoUrls', [...current, url]);
        } else {
          handleInputChange('videoUrls', [...(formData.videoUrls || []), url]);
        }
      }
    } catch (e) {
      setUploadQueue((prev) => prev.map((q) => (q.id === newId ? { ...q, status: 'error' } : q)));
    }
  };

  // Helpers para reordenar imágenes adicionales del producto (persistencia inmediata)
  const moveProductImage = (fromIndex, direction) => {
    setFormData((prev) => {
      const imgs = [...prev.imagenes];
      const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
      if (toIndex < 0 || toIndex >= imgs.length) return prev;
      const [m] = imgs.splice(fromIndex, 1);
      imgs.splice(toIndex, 0, m);
      const next = { ...prev, imagenes: imgs };
      const targetId = currentId || product?.id;
      if (targetId) updateDoc(doc(db, 'productos', targetId), { imagenes: imgs, fechaActualizacion: new Date() }).catch(() => {});
      return next;
    });
  };

  // Helpers para reordenar imágenes adicionales de una variante (persistencia inmediata)
  const moveVariantImage = (variantIndex, fromIndex, direction) => {
    setFormData((prev) => {
      const variantes = [...prev.variantes];
      const imgs = Array.isArray(variantes[variantIndex]?.imagenes) ? [...variantes[variantIndex].imagenes] : [];
      const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
      if (toIndex < 0 || toIndex >= imgs.length) return prev;
      const [m] = imgs.splice(fromIndex, 1);
      imgs.splice(toIndex, 0, m);
      variantes[variantIndex] = { ...variantes[variantIndex], imagenes: imgs };
      const next = { ...prev, variantes };
      const targetId = currentId || product?.id;
      if (targetId) updateDoc(doc(db, 'productos', targetId), { variantes, fechaActualizacion: new Date() }).catch(() => {});
      return next;
    });
  };

  const createNewCategory = async (categoryName) => {
    try {
      const categoryData = {
        nombre: categoryName,
        ruta: categoryName.toLowerCase().replace(/\s+/g, '-'),
        activa: true,
        fechaCreacion: new Date(),
        productCount: 0
      };
      
      await setDoc(doc(db, 'categorias', categoryData.ruta), categoryData);
      setCategorias(prev => [...prev, { id: categoryData.ruta, ...categoryData }]);
      return categoryData.ruta;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalCategoryId = formData.categoria;

      // Create new category if needed
      if (showNewCategoryInput && formData.nuevaCategoria.trim()) {
        finalCategoryId = await createNewCategory(formData.nuevaCategoria.trim());
      }

      const productData = {
        ...formData,
        categoria: finalCategoryId,
        precio: parseFloat(formData.precio) || 0,
        fechaActualizacion: new Date(),
        acerca: formData.acerca.filter(item => item.trim()),
        etiquetas: formData.etiquetas.filter(item => item.trim()),
        variantes: formData.variantes.filter(variant => 
          variant.color.trim() || variant.cantidad > 0
        )
      };

      delete productData.nuevaCategoria;
      delete productData._tempVideoUrl;

      // Normalización de marca para filtros insensibles a mayúsculas
      if (productData.empresa) {
        productData.empresa = productData.empresa.trim();
        productData.empresaNorm = productData.empresa.toLowerCase();
      }

      // Si ya existe un borrador o estamos editando, actualizamos ese documento
      const targetId = currentId || product?.id || `prod_${Date.now()}`;
      productData.id = targetId;
      if (!currentId && !product?.id) {
        productData.fechaCreacion = new Date();
        await setDoc(doc(db, 'productos', targetId), productData);
        setCurrentId(targetId);
      } else {
        await updateDoc(doc(db, 'productos', targetId), { ...productData, fechaActualizacion: new Date() });
      }

      onSave();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-stretch justify-stretch"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white w-screen h-screen overflow-hidden flex flex-col"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* Header */}
        <div className="bg-blue-700 text-white p-4 md:p-6 flex justify-between items-center sticky top-0 z-10 shadow">
          <h2 className="text-2xl font-bold">
            {product ? 'Editar Producto' : 'Agregar Producto'}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-900 border-b pb-2">
                Información Básica
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marca / Empresa
                </label>
                <input
                  type="text"
                  list="brands-list"
                  value={formData.empresa || ''}
                  onChange={(e) => handleInputChange('empresa', e.target.value)}
                  placeholder="Ej. Xbox, PlayStation, Nintendo... (puedes escribir una nueva)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <datalist id="brands-list">
                  {brands.map((b) => (
                    <option key={b} value={b} />
                  ))}
                </datalist>
                <p className="text-xs text-gray-500 mt-1">Sugerencias basadas en tus marcas guardadas. Se guardará sin importar mayúsculas/minúsculas.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.precio}
                    onChange={(e) => handleInputChange('precio', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cantidad en Stock *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.cantidad}
                    onChange={(e) => handleInputChange('cantidad', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código de inventario (SKU) — opcional
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  placeholder="Ej. NIN-SWITCH-NEON-01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">El SKU es un identificador interno para gestionar tu inventario.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.descripcion}
                  onChange={(e) => handleInputChange('descripcion', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category and Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-900 border-b pb-2">
                Categoría y Estado
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría *
                </label>
                <div className="space-y-2">
                  <select
                    value={showNewCategoryInput ? '' : formData.categoria}
                    onChange={(e) => {
                      if (e.target.value === 'nueva') {
                        setShowNewCategoryInput(true);
                      } else {
                        setShowNewCategoryInput(false);
                        handleInputChange('categoria', e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required={!showNewCategoryInput}
                  >
                    <option value="">Seleccionar categoría</option>
                    {categorias.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </option>
                    ))}
                    <option value="nueva">+ Crear nueva categoría</option>
                  </select>

                  {showNewCategoryInput && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nombre de la nueva categoría"
                        value={formData.nuevaCategoria}
                        onChange={(e) => handleInputChange('nuevaCategoria', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewCategoryInput(false);
                          handleInputChange('nuevaCategoria', '');
                        }}
                        className="px-3 py-2 text-gray-500 hover:text-gray-700"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    value={formData.estado}
                    onChange={(e) => handleInputChange('estado', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Nuevo">Nuevo</option>
                    <option value="Usado">Usado</option>
                    <option value="Reacondicionado">Reacondicionado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Publicación
                  </label>
                  <input
                    type="date"
                    value={formData.fechaPublicacion}
                    onChange={(e) => handleInputChange('fechaPublicacion', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.oferta}
                      onChange={(e) => handleInputChange('oferta', e.target.checked)}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    En oferta
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.activo}
                      onChange={(e) => handleInputChange('activo', e.target.checked)}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    Producto activo
                  </label>
                </div>

                {formData.oferta && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Precio de Oferta
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.precioOferta}
                      onChange={(e) => handleInputChange('precioOferta', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Precio con descuento"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Peso (opcional)
                    </label>
                    <input
                      type="text"
                      value={formData.peso}
                      onChange={(e) => handleInputChange('peso', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="ej: 1.5 kg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dimensiones (opcional)
                    </label>
                    <input
                      type="text"
                      value={formData.dimensiones}
                      onChange={(e) => handleInputChange('dimensiones', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="ej: 30x20x10 cm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Images Section */}
          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-semibold text-blue-900 border-b pb-2">
              Imágenes y Multimedia
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagen Principal *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.length && handleImageUpload(e.target.files, 'imagen')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {(tempPreviews.imagen || formData.imagen) && (
                  <div className="mt-2 relative inline-block">
                    <img src={tempPreviews.imagen || formData.imagen} alt="Preview" className="w-32 h-32 object-cover rounded-lg border" />
                    <button
                      type="button"
                      onClick={() => handleInputChange('imagen', '')}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imágenes Adicionales
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => e.target.files?.length && handleImageUpload(e.target.files, 'imagenes')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {(tempPreviews.imagenes.length > 0 || formData.imagenes.length > 0) && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {[...tempPreviews.imagenes.map((u) => ({ url: u, temp: true })), ...formData.imagenes.map((u) => ({ url: u, temp: false }))].map((item, index) => {
                      const isSaved = !item.temp;
                      const savedIndex = index - tempPreviews.imagenes.length; // índice dentro de formData.imagenes
                      return (
                        <div key={index} className="relative group">
                          <img src={item.url} alt={`Preview ${index}`} className="w-16 h-16 object-cover rounded border opacity-100" />
                          {/* Remove */}
                          <button
                            type="button"
                            onClick={() => {
                              if (item.temp) {
                                setTempPreviews((prev) => ({
                                  ...prev,
                                  imagenes: prev.imagenes.filter((_, i) => i !== index),
                                }));
                              } else {
                                const newImages = formData.imagenes.filter((_, i) => i !== savedIndex);
                                handleInputChange('imagenes', newImages);
                              }
                            }}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                            title="Quitar"
                          >
                            ×
                          </button>

                          {/* Controls for saved images */}
                          {isSaved && (
                            <div className="absolute inset-x-0 -bottom-8 hidden group-hover:flex items-center justify-center gap-1">
                              <button
                                type="button"
                                className="px-1 py-0.5 text-[10px] bg-blue-600 text-white rounded"
                                onClick={() => handleInputChange('imagen', item.url)}
                                title="Usar como principal"
                              >
                                Principal
                              </button>
                              <button
                                type="button"
                                className="px-1 py-0.5 text-[10px] bg-gray-200 rounded"
                                onClick={() => moveProductImage(savedIndex, 'up')}
                                disabled={savedIndex <= 0}
                                title="Subir"
                              >
                                ↑
                              </button>
                              <button
                                type="button"
                                className="px-1 py-0.5 text-[10px] bg-gray-200 rounded"
                                onClick={() => moveProductImage(savedIndex, 'down')}
                                disabled={savedIndex >= (formData.imagenes.length - 1)}
                                title="Bajar"
                              >
                                ↓
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Videos del Producto
                </label>
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={(e) => e.target.files?.length && handleVideoFilesUpload(e.target.files)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {Array.isArray(formData.videoUrls) && formData.videoUrls.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {formData.videoUrls.map((v, iv) => (
                      <div key={iv} className="flex items-center gap-2">
                        <video src={v} controls className="w-40 max-h-28 rounded border" />
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            className="px-2 py-1 text-[12px] bg-blue-600 text-white rounded"
                            onClick={() => {
                              setFormData((prev) => {
                                const vids = [...(prev.videoUrls || [])];
                                const [m] = vids.splice(iv, 1);
                                vids.unshift(m);
                                const next = { ...prev, videoUrls: vids };
                                const targetId = currentId || product?.id;
                                if (targetId) updateDoc(doc(db, 'productos', targetId), { videoUrls: vids, fechaActualizacion: new Date() }).catch(() => {});
                                return next;
                              });
                            }}
                            title="Marcar como destacado"
                          >
                            Principal
                          </button>
                          <button
                            type="button"
                            className="px-2 py-1 text-[12px] bg-gray-200 rounded"
                            onClick={() => moveProductVideo(iv, 'up')}
                            disabled={iv === 0}
                            title="Subir"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            className="px-2 py-1 text-[12px] bg-gray-200 rounded"
                            onClick={() => moveProductVideo(iv, 'down')}
                            disabled={iv === (formData.videoUrls.length - 1)}
                            title="Bajar"
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            className="px-2 py-1 text-[12px] text-red-600"
                            onClick={() => {
                              const updated = formData.videoUrls.filter((_, k) => k !== iv);
                              handleInputChange('videoUrls', updated);
                            }}
                          >
                            Quitar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL del Video (opcional)
                </label>
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subir Video desde el dispositivo (opcional)
              </label>
              <input
                type="file"
                accept="video/*"
                multiple
                onChange={async (e) => handleVideoFilesUpload(e.target.files)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {uploadProgress !== null && (
                <div className="mt-2">
                  <div className="h-2 bg-gray-200 rounded">
                    <div className="h-2 bg-blue-600 rounded" style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Subiendo: {uploadProgress}%</p>
                </div>
              )}
              {(formData.videoUrls?.length || 0) > 0 && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {formData.videoUrls.map((v, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <video src={v} controls className="w-48 max-h-32 rounded border" />
                      <button
                        type="button"
                        onClick={() => handleInputChange('videoUrls', formData.videoUrls.filter((_, i) => i !== idx))}
                        className="px-3 py-2 text-red-600 hover:text-red-700"
                      >
                        Quitar
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <input
                  type="url"
                  placeholder="Pegar URL de video y presiona Agregar"
                  value={formData._tempVideoUrl || ''}
                  onChange={(e) => handleInputChange('_tempVideoUrl', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => {
                    const val = (formData._tempVideoUrl || '').trim();
                    if (!val) return;
                    handleInputChange('videoUrls', [...(formData.videoUrls || []), val]);
                    handleInputChange('_tempVideoUrl', '');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-semibold text-blue-900 border-b pb-2">
              Detalles del Producto
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Características (Acerca de)
              </label>
              {formData.acerca.map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleArrayChange('acerca', index, e.target.value)}
                    placeholder="Característica del producto"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('acerca', index)}
                    className="px-3 py-2 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('acerca')}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                + Agregar característica
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Etiquetas (para búsqueda)
              </label>
              {formData.etiquetas.map((tag, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => handleArrayChange('etiquetas', index, e.target.value)}
                    placeholder="Etiqueta"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('etiquetas', index)}
                    className="px-3 py-2 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('etiquetas')}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                + Agregar etiqueta
              </button>
            </div>
          </div>

          {/* Variants Section */}
          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-semibold text-blue-900 border-b pb-2">
              Variantes del Producto
            </h3>

            {formData.variantes.map((variant, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Variante {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeArrayItem('variantes', index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Eliminar
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color/Tipo
                    </label>
                    <input
                      type="text"
                      value={variant.color}
                      onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cantidad
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={variant.cantidad}
                      onChange={(e) => handleVariantChange(index, 'cantidad', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Imagen de Variante
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.length && handleImageUpload(e.target.files, 'imagen', index)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {(tempPreviews.variantes[index]?.imagen || variant.imagen) && (
                      <div className="mt-2">
                        <img src={tempPreviews.variantes[index]?.imagen || variant.imagen} alt="Variante" className="w-20 h-20 object-cover rounded border" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Imágenes adicionales de la variante */}
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Imágenes adicionales de la variante
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => e.target.files?.length && handleImageUpload(e.target.files, 'imagenes', index)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {((tempPreviews.variantes[index]?.imagenes?.length || 0) > 0 || (Array.isArray(variant.imagenes) && variant.imagenes.length > 0)) && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {[...(tempPreviews.variantes[index]?.imagenes || []).map((u) => ({ url: u, temp: true })), ...((variant.imagenes || []).map((u) => ({ url: u, temp: false })))].map((item, i2) => {
                        const isSaved = !item.temp;
                        const savedIndex = i2 - (tempPreviews.variantes[index]?.imagenes?.length || 0);
                        return (
                          <div key={i2} className="relative group">
                            <img src={item.url} alt={`Var img ${i2}`} className="w-16 h-16 object-cover rounded border" />
                            {/* Remove */}
                            <button
                              type="button"
                              onClick={() => {
                                if (item.temp) {
                                  setTempPreviews((prev) => {
                                    const list = (prev.variantes[index]?.imagenes || []).filter((_, k) => k !== i2);
                                    return { ...prev, variantes: { ...prev.variantes, [index]: { ...(prev.variantes[index] || {}), imagenes: list } } };
                                  });
                                } else {
                                  const updated = (variant.imagenes || []).filter((_, k) => k !== savedIndex);
                                  handleVariantChange(index, 'imagenes', updated);
                                }
                              }}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                              title="Quitar"
                            >
                              ×
                            </button>

                            {/* Controls for saved variant images */}
                            {isSaved && (
                              <div className="absolute inset-x-0 -bottom-8 hidden group-hover:flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  className="px-1 py-0.5 text-[10px] bg-blue-600 text-white rounded"
                                  onClick={() => handleVariantChange(index, 'imagen', item.url)}
                                  title="Usar como principal de variante"
                                >
                                  Principal
                                </button>
                                <button
                                  type="button"
                                  className="px-1 py-0.5 text-[10px] bg-gray-200 rounded"
                                  onClick={() => moveVariantImage(index, savedIndex, 'up')}
                                  disabled={savedIndex <= 0}
                                  title="Subir"
                                >
                                  ↑
                                </button>
                                <button
                                  type="button"
                                  className="px-1 py-0.5 text-[10px] bg-gray-200 rounded"
                                  onClick={() => moveVariantImage(index, savedIndex, 'down')}
                                  disabled={savedIndex >= ((variant.imagenes || []).length - 1)}
                                  title="Bajar"
                                >
                                  ↓
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Videos de la variante */}
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Videos de la variante
                  </label>
                  <input
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={(e) => e.target.files?.length && handleVariantVideoUpload(e.target.files, index)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {Array.isArray(variant.videoUrls) && variant.videoUrls.length > 0 && (
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {variant.videoUrls.map((v, iv) => (
                        <div key={iv} className="flex items-center gap-2">
                          <video src={v} controls className="w-40 max-h-28 rounded border" />
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              className="px-2 py-1 text-[12px] bg-blue-600 text-white rounded"
                              onClick={() => {
                                // mover a primera posición (destacado)
                                setFormData((prev) => {
                                  const variantes = [...prev.variantes];
                                  const vids = Array.isArray(variantes[index]?.videoUrls) ? [...variantes[index].videoUrls] : [];
                                  const [m] = vids.splice(iv, 1);
                                  vids.unshift(m);
                                  variantes[index] = { ...variantes[index], videoUrls: vids };
                                  const next = { ...prev, variantes };
                                  const targetId = currentId || product?.id;
                                  if (targetId) updateDoc(doc(db, 'productos', targetId), { variantes, fechaActualizacion: new Date() }).catch(() => {});
                                  return next;
                                });
                              }}
                              title="Marcar como destacado"
                            >
                              Principal
                            </button>
                            <button
                              type="button"
                              className="px-2 py-1 text-[12px] bg-gray-200 rounded"
                              onClick={() => moveVariantVideo(index, iv, 'up')}
                              disabled={iv === 0}
                              title="Subir"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              className="px-2 py-1 text-[12px] bg-gray-200 rounded"
                              onClick={() => moveVariantVideo(index, iv, 'down')}
                              disabled={iv === (variant.videoUrls.length - 1)}
                              title="Bajar"
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const upd = variant.videoUrls.filter((_, k) => k !== iv);
                                handleVariantChange(index, 'videoUrls', upd);
                              }}
                              className="px-2 py-1 text-[12px] text-red-600 hover:text-red-700"
                            >
                              Quitar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => addArrayItem('variantes')}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              + Agregar variante
            </button>
          </div>

          {/* Upload queue visualización */}
          {uploadQueue.length > 0 && (
            <div className="mt-6 border-t pt-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Subidas en curso</h4>
              <div className="space-y-2">
                {uploadQueue.map((u, idx) => (
                  <div key={u.id} className="flex items-center gap-3 text-sm">
                    <span className="w-6 text-gray-500">{idx + 1}.</span>
                    <span className="flex-1 truncate">{u.name}</span>
                    <span className="w-24 text-right text-gray-600">{u.progress ?? 0}%</span>
                    <span className={`w-24 text-center ${u.status === 'done' ? 'text-green-600' : u.status === 'error' ? 'text-red-600' : u.status === 'canceled' ? 'text-gray-500' : 'text-blue-700'}`}>{u.status}</span>
                    {u.status === 'uploading' && (
                      <button type="button" onClick={() => cancelUpload(u.id)} className="px-2 py-1 text-xs text-red-600 hover:text-red-700">Cancelar</button>
                    )}
                    {(u.status === 'error' || u.status === 'canceled') && (
                      <button type="button" onClick={() => retryUpload(u.id)} className="px-2 py-1 text-xs text-blue-600 hover:text-blue-700">Reintentar</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="mt-8 flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : 'Guardar Producto'}
            </button>
          </div>

          {uploadingImages && (
            <p className="mt-2 text-sm text-amber-700">
              Archivos subiendo en segundo plano. Puedes guardar el producto; las nuevas URLs aparecerán cuando finalicen.
            </p>
          )}
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ProductForm;
