import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  setDoc,
  onSnapshot,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  uploadBytesResumable,
} from "firebase/storage";
import { db, storage } from "../firebase";
import { useAuth } from "../context/AuthContext";
// Enhanced components
import UniversalFileUploader from "./UniversalFileUploader";
import VisualVariantSelector from "./VisualVariantSelector";
// Import CSS
import "../styles/UniversalFileUploader.css";
// Validation utilities
import { getValidationSummary } from "../utils/productValidation";

const ProductForm = ({ product, onClose, onSave, sellerId }) => {
  const { usuario, usuarioInfo } = useAuth();

  // Validación simple
  const [isValid, setIsValid] = useState(true);
  const [formData, setFormData] = useState(() => {
    return {
      nombre: product?.nombre || "",
      empresa: product?.empresa || "",
      precio: product?.precio || "",
      cantidad: product?.cantidad || 0,
      descripcion: product?.descripcion || "",
      categoria: product?.categoria || "",
      nuevaCategoria: "",
      // ARCHIVOS - Cargar desde el producto directamente
      imagen: product?.imagen || "",
      imagenes: product?.imagenes || [],
      imagenesExtra: product?.imagenesExtra || [],
      videoUrl: product?.videoUrl || "",
      videoUrls: product?.videoUrls || [],
      videoAcercaArticulo: product?.videoAcercaArticulo || [],
      // Resto de campos
      oferta: product?.oferta || false,
      precioOferta: product?.precioOferta || "",
      estado: product?.estado || "Nuevo",
      acerca: product?.acerca || [""],
      variantes: product?.variantes || [],
      etiquetas: product?.etiquetas || [""],
      activo: product?.activo !== undefined ? product.activo : true,
      fechaPublicacion:
        product?.fechaPublicacion || new Date().toISOString().split("T")[0],
      peso: product?.peso || "",
      dimensiones: product?.dimensiones || "",
      // Asociación de imagen principal con variante
      varianteImagenPrincipal: product?.varianteImagenPrincipal || "",
      // Enhanced fields
      imagenPrincipal:
        product?.imagenPrincipal ||
        (product?.imagen ? [{ url: product.imagen }] : []),
      galeriaImagenes: product?.galeriaImagenes || product?.imagenes || [],
      tresArchivosExtras:
        product?.tresArchivosExtras || product?.imagenesExtra || [],
      productStatus: product?.productStatus || "draft",
      validationScore: product?.validationScore || 0,
      lastValidated: product?.lastValidated || null,
    };
  });

  const [categorias, setCategorias] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNewBrandInput, setShowNewBrandInput] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  // ID actual del producto (existe si estamos editando o si creamos un borrador)
  const [currentId, setCurrentId] = useState(product?.id || null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  // Estados simplificados
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  // Bandera para prevenir borrado automático durante carga inicial
  const isInitialLoadRef = useRef(true);
  const formInitializedRef = useRef(false);
  // Previews locales (no se guardan en Firestore)
  const [tempPreviews, setTempPreviews] = useState({
    imagen: "",
    imagenes: [],
    productVideos: [],
    acercaVideos: [],
    variantes: {}, // index -> { imagen: '', imagenes: [], videos: [] }
    extras: [],
  });
  // Cola de subidas por archivo (con progreso/cancelar/reintentar)
  const [uploadQueue, setUploadQueue] = useState([]); // {id,name,file,type:'image'|'video',progress,status:'uploading'|'done'|'error'|'canceled', target:{level:'product'|'variant', field, variantIndex|null}, task}

  // Enhanced state
  const [isPublishing, setIsPublishing] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [processingImages, setProcessingImages] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(0);

  useEffect(() => {
    // Cargar datos iniciales
    fetchCategorias();
    fetchBrands();
  }, []);

  // Sistema simplificado sin monitoreo de conexión

  // Inicializar formData cuando product cambie
  useEffect(() => {
    if (product) {

      setFormData({
        ...formData,
        // Campos básicos
        nombre: product.nombre || "",
        empresa: product.empresa || "",
        precio: product.precio || "",
        cantidad: product.cantidad || 0,
        descripcion: product.descripcion || "",
        categoria: product.categoria || "",
        acerca: product.acerca || [""],
        etiquetas: product.etiquetas || [""],
        variantes: product.variantes || [],
        oferta: product.oferta || false,
        precioOferta: product.precioOferta || "",
        estado: product.estado || "Nuevo",
        activo: product.activo !== undefined ? product.activo : true,

        // ARCHIVOS - Asegurar que se carguen correctamente Y filtrar valores vacíos
        // Imagen principal
        imagen: product.imagen || "",
        // Galería de imágenes y videos (FILTRAR valores vacíos)
        imagenes: (product.imagenes || []).filter(
          (url) => url && typeof url === "string" && url.trim() !== ""
        ),
        videoUrls: (product.videoUrls || []).filter(
          (url) => url && typeof url === "string" && url.trim() !== ""
        ),
        // Imágenes extra (información adicional) (FILTRAR valores vacíos)
        imagenesExtra: (product.imagenesExtra || []).filter(
          (url) => url && typeof url === "string" && url.trim() !== ""
        ),
        // Video acerca del artículo
        videoUrl: product.videoUrl || "",
        videoAcercaArticulo: product.videoAcercaArticulo || [],
        // Asociación de variante con imagen principal
        varianteImagenPrincipal: product.varianteImagenPrincipal || "",

        // Enhanced fields (mantener compatibilidad)
        imagenPrincipal:
          product.imagenPrincipal ||
          (product.imagen ? [{ url: product.imagen }] : []),
        galeriaImagenes: product.galeriaImagenes || product.imagenes || [],
        tresArchivosExtras:
          product.tresArchivosExtras || product.imagenesExtra || [],
        productStatus: product.productStatus || product.estado || "draft",
      });

      // Marcar que el formulario ya se inicializó después de un pequeño delay
      setTimeout(() => {
        formInitializedRef.current = true;
        isInitialLoadRef.current = false;
      }, 500);
    }
  }, [product?.id]);

  // Sincronizar currentId cuando product.id llegue de forma asíncrona (evita crear borradores al editar)
  useEffect(() => {
    if (product?.id && currentId !== product.id) {
      setCurrentId(product.id);
    }
  }, [product?.id]);

  // Advertir si hay subidas en progreso al cerrar/recargar
  useEffect(() => {
    const handler = (e) => {
      const hasUploading = uploadQueue?.some?.(
        (q) => q?.status === "uploading"
      );
      if (hasUploading) {
        e.preventDefault();
        e.returnValue = ""; // Requerido por algunos navegadores
        return "";
      }
      return undefined;
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [uploadQueue]);

  // Suscripción en tiempo real al producto/draft para mantener sincronizado el formulario
  useEffect(() => {
    const id = currentId || product?.id;
    if (!id) return;
    const unsub = onSnapshot(doc(db, "productos", id), (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();

      // UNA SOLA actualización consolidada que preserve TODOS los campos
      // IMPORTANTE: Solo actualizar si realmente hay un cambio, no sobrescribir con undefined
      setFormData((prev) => ({
        ...prev,
        id: data.id || id,
        nombre: data.nombre ?? prev.nombre,
        descripcion: data.descripcion ?? prev.descripcion,
        empresa: data.empresa ?? prev.empresa,
        categoria: data.categoria ?? prev.categoria,
        precio:
          (data.precio ?? prev.precio)?.toString?.() ||
          String(data.precio ?? prev.precio ?? ""),
        cantidad: data.cantidad ?? prev.cantidad,
        etiquetas: Array.isArray(data.etiquetas)
          ? data.etiquetas
          : prev.etiquetas || [],
        acerca: Array.isArray(data.acerca) ? data.acerca : prev.acerca || [],
        // Campos de medios - SOLO actualizar si hay un valor real en Firestore
        // Si Firestore tiene un valor, usarlo. Si no, mantener el valor previo
        imagen: data.imagen ? data.imagen : prev.imagen,
        imagenes:
          Array.isArray(data.imagenes) && data.imagenes.length > 0
            ? data.imagenes.filter(
                (url) => url && typeof url === "string" && url.trim() !== ""
              )
            : prev.imagenes || [],
        imagenPrincipal: Array.isArray(data.imagenPrincipal)
          ? data.imagenPrincipal
          : prev.imagenPrincipal || [],
        galeriaImagenes: Array.isArray(data.galeriaImagenes)
          ? data.galeriaImagenes
          : prev.galeriaImagenes || [],
        tresArchivosExtras: Array.isArray(data.tresArchivosExtras)
          ? data.tresArchivosExtras
          : prev.tresArchivosExtras || [],
        imagenesExtra:
          Array.isArray(data.imagenesExtra) && data.imagenesExtra.length > 0
            ? data.imagenesExtra.filter(
                (url) => url && typeof url === "string" && url.trim() !== ""
              )
            : prev.imagenesExtra || [],
        videoUrl: data.videoUrl || data.video || prev.videoUrl,
        videoUrls:
          Array.isArray(data.videoUrls) && data.videoUrls.length > 0
            ? data.videoUrls.filter(
                (url) => url && typeof url === "string" && url.trim() !== ""
              )
            : prev.videoUrls || [],
        videoAcercaArticulo: Array.isArray(data.videoAcercaArticulo)
          ? data.videoAcercaArticulo
          : prev.videoAcercaArticulo || [],
        variantes: Array.isArray(data.variantes)
          ? data.variantes
          : prev.variantes || [],
        activo: data.activo ?? prev.activo,
      }));
    });
    return () => unsub();
  }, [currentId, product?.id]);

  // Limpieza: eliminar cualquier inyección previa del video de ejemplo (flower.mp4)
  const defaultsAppliedRef = useRef(false);
  useEffect(() => {
    if (defaultsAppliedRef.current) return;
    try {
      const defaultVideo =
        "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";
      const list = Array.isArray(formData.videoAcercaArticulo)
        ? formData.videoAcercaArticulo
        : [];
      const hasDefault = list.some((u) => String(u).trim() === defaultVideo);
      if (hasDefault) {
        const cleaned = list.filter((u) => String(u).trim() !== defaultVideo);
        setFormData((prev) => ({ ...prev, videoAcercaArticulo: cleaned }));
        const targetId = currentId || product?.id;
        if (targetId) {
          updateDoc(doc(db, "productos", targetId), {
            videoAcercaArticulo: cleaned,
            fechaActualizacion: new Date(),
          }).catch(() => {});
        }
      }
    } catch {}
    defaultsAppliedRef.current = true;
  }, [formData.videoAcercaArticulo, currentId, product?.id]);

  // Auto-guardado desactivado para evitar guardados ocultos de campos de texto/base.

  // Enhanced validation effect
  useEffect(() => {
    const runValidation = () => {
      try {
        // getValidationSummary devuelve un objeto con errors, isReady, errorCount, etc.
        const summary = getValidationSummary(formData);
        setValidationErrors(summary.errors || []);
        const score =
          typeof summary.errorCount === "number"
            ? Math.max(0, 100 - summary.errorCount * 20)
            : summary.isReady
            ? 100
            : 0;
        setFormData((prev) => ({
          ...prev,
          validationScore: score,
          lastValidated: new Date().toISOString(),
        }));
      } catch (e) {
        console.error("Error running validation summary:", e);
      }
    };

    // Debounce validation
    const timeoutId = setTimeout(runValidation, 500);
    return () => clearTimeout(timeoutId);
  }, [
    formData.nombre,
    formData.precio,
    formData.categoria,
    formData.descripcion,
    formData.imagenPrincipal,
    formData.galeriaImagenes,
  ]);

  // Datos básicos del producto para el formulario
  const productData = useMemo(() => {
    return {
      id: currentId || product?.id || "nuevo",
      nombre: formData.nombre || "",
      precio: parseFloat(formData.precio) || 0,
      cantidad: Number(formData.cantidad) || 0,
    };
  }, [
    currentId,
    product?.id,
    formData.nombre,
    formData.precio,
    formData.cantidad,
  ]);

  // Obtener/crear ID del producto actual.
  // Política: no creamos nada al abrir el formulario, PERO si el usuario
  // inicia una acción de medios (imagen/video), creamos el documento para
  // habilitar la sincronización en tiempo real inmediatamente.
  const ensureCurrentId = async () => {
    if (product?.id) return product.id;
    if (formData?.id) return formData.id;
    if (currentId) return currentId;
    try {
      const newId = `prod_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 7)}`;
      const payload = {
        id: newId,
        nombre: formData?.nombre || "",
        descripcion: formData?.descripcion || "",
        empresa: formData?.empresa || "",
        categoria: formData?.categoria || "",
        precio: parseFloat(formData?.precio) || 0,
        cantidad: Number(formData?.cantidad) || 0,
        etiquetas: Array.isArray(formData?.etiquetas) ? formData.etiquetas : [],
        acerca: Array.isArray(formData?.acerca) ? formData.acerca : [],
        variantes: Array.isArray(formData?.variantes) ? formData.variantes : [],
        imagen: "",
        imagenPrincipal: [],
        imagenes: [],
        videoUrls: [],
        videoAcercaArticulo: [],
        imagenesExtra: [],
        activo: false, // no público hasta que el admin lo active
        ownerUid: usuario?.uid || null,
        ownerName: usuarioInfo?.displayName || usuario?.displayName || "",
        sellerId: sellerId || usuario?.uid || null,
        sellerName: sellerId
          ? usuarioInfo?.storeName || usuarioInfo?.displayName || ""
          : "",
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      };
      await setDoc(doc(db, "productos", newId), payload);
      setCurrentId(newId);
      setFormData((prev) => ({ ...prev, id: newId }));
      return newId;
    } catch (e) {
      // si falla, no bloquear; el handler abortará el upload y mantendrá la preview local
      return null;
    }
  };

  // Helper para actualizar Firestore de forma segura (maneja documentos eliminados)
  const safeUpdateDoc = async (targetId, data) => {
    if (!targetId) return;
    try {
      await updateDoc(doc(db, "productos", targetId), {
        ...data,
        fechaActualizacion: new Date(),
      });
    } catch (e) {
      // Ignorar errores si el documento fue eliminado
      if (e.code === "not-found") {
        return;
      }
      // Silencioso para otros errores: no bloquear la UI
    }
  };

  // Persistir un campo específico de inmediato (safe, solo actualiza ese campo)
  const persistFieldImmediate = async (field, value) => {
    // Evitar guardar campos transitorios del formulario
    if (["nuevaCategoria", "_tempVideoUrl"].includes(field)) return;

    const existingId = product?.id || formData?.id || currentId;
    const isEditing = Boolean(existingId);
    let targetId = existingId;

    // Si estamos editando y aún no tenemos ID, NO crear borradores: esperar
    if (!targetId) {
      if (isEditing) return;
      targetId = await ensureCurrentId();
      if (!targetId) return;
    }

    await safeUpdateDoc(targetId, { [field]: value });
  };

  // -------- Helpers de rutas y IDs estables --------
  const slugify = (s) =>
    String(s || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .slice(0, 80);
  const makeUniqueName = (file) => {
    // Mantener el nombre ORIGINAL del archivo, solo limpiando caracteres peligrosos
    // NO cambiar formato, NO agregar timestamp que rompa las descargas
    const originalName = file?.name || "file";
    // Solo limpiar caracteres que pueden causar problemas en URLs, pero mantener extensión
    return originalName.replace(/[^\w\s.-]/g, "_").replace(/\s+/g, "_");
  };

  const buildStoragePath = ({ productId, section, file, variantId = null }) => {
    const fname = makeUniqueName(file);
    if (variantId) {
      if (section === "main")
        return `products/${productId}/variants/${variantId}/main/${fname}`;
      if (section === "gallery")
        return `products/${productId}/variants/${variantId}/gallery/${fname}`;
    } else {
      if (section === "main") return `products/${productId}/main/${fname}`;
      if (section === "gallery")
        return `products/${productId}/gallery/${fname}`;
      if (section === "videos") return `products/${productId}/videos/${fname}`;
      if (section === "extras") return `products/${productId}/extras/${fname}`;
    }
    return `products/${productId}/misc/${fname}`;
  };

  const getOrCreateVariantId = (variantIndex) => {
    const v = (formData.variantes || [])[variantIndex] || {};
    if (v.id) return v.id;
    const newId = `var_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    // persistir inmediatamente en estado y Firestore si hay doc
    setFormData((prev) => {
      const variantes = [...(prev.variantes || [])];
      variantes[variantIndex] = {
        ...(variantes[variantIndex] || {}),
        id: newId,
      };
      const next = { ...prev, variantes };
      const targetId = currentId || product?.id;
      if (targetId)
        updateDoc(doc(db, "productos", targetId), {
          variantes,
          fechaActualizacion: new Date(),
        }).catch(() => {});
      return next;
    });
    return newId;
  };

  // Enhanced save draft with validation
  const handleSaveDraft = async () => {
    const draft = { ...formData };
    // Normalizar listas
    draft.acerca = (draft.acerca || []).filter((x) => (x || "").trim());
    draft.etiquetas = (draft.etiquetas || []).filter((x) => (x || "").trim());
    draft.activo = false; // siempre como borrador
    draft.productStatus = "draft";
    draft.fechaActualizacion = new Date();
    delete draft.nuevaCategoria;
    delete draft._tempVideoUrl;

    try {
      let id = product?.id || currentId;
      if (!id) {
        id = `prod_${Date.now()}`;
        draft.id = id;
        draft.fechaCreacion = new Date();
        draft.sellerId = sellerId || usuario?.uid || null;
        draft.sellerName = sellerId
          ? usuarioInfo?.storeName || usuarioInfo?.displayName || ""
          : "";
        await setDoc(doc(db, "productos", id), draft);
        setCurrentId(id);
      } else {
        await updateDoc(doc(db, "productos", id), draft);
      }
      if (onSave) onSave(draft);
      if (onClose) onClose();
    } catch (e) {
      console.error("Error al guardar borrador:", e);
      const errorMessage =
        e.code === "permission-denied"
          ? "No tienes permisos para guardar este producto"
          : e.code === "network-request-failed"
          ? "Error de conexión. Verifica tu internet"
          : `Error al guardar: ${e.message}`;
      alert(errorMessage);
    }
  };

  // Enhanced publish handler
  const handlePublish = async () => {
    // Simplemente guardar el producto con activo: true
    handleSubmit();
  };

  // Enhanced preview handler
  const handlePreview = () => {
    // Open preview in new tab or modal
  };

  // Helpers para reordenar videos del producto (persistencia inmediata)
  const moveProductVideo = (fromIndex, direction) => {
    setFormData((prev) => {
      const vids = Array.isArray(prev.videoUrls) ? [...prev.videoUrls] : [];
      const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
      if (toIndex < 0 || toIndex >= vids.length) return prev;
      const [m] = vids.splice(fromIndex, 1);
      vids.splice(toIndex, 0, m);
      const next = { ...prev, videoUrls: vids };
      const targetId = currentId || product?.id;
      if (targetId)
        updateDoc(doc(db, "productos", targetId), {
          videoUrls: vids,
          fechaActualizacion: new Date(),
        }).catch(() => {});
      return next;
    });
  };

  // Helpers para reordenar videos de una variante (persistencia inmediata)
  const moveVariantVideo = (variantIndex, fromIndex, direction) => {
    setFormData((prev) => {
      const variantes = [...prev.variantes];
      const vids = Array.isArray(variantes[variantIndex]?.videoUrls)
        ? [...variantes[variantIndex].videoUrls]
        : [];
      const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
      if (toIndex < 0 || toIndex >= vids.length) return prev;
      const [m] = vids.splice(fromIndex, 1);
      vids.splice(toIndex, 0, m);
      variantes[variantIndex] = { ...variantes[variantIndex], videoUrls: vids };
      const next = { ...prev, variantes };
      const targetId = currentId || product?.id;
      if (targetId)
        updateDoc(doc(db, "productos", targetId), {
          variantes,
          fechaActualizacion: new Date(),
        }).catch(() => {});
      return next;
    });
  };

  const loadCategorias = async () => {
    try {
      const categoriasSnap = await getDocs(collection(db, "categorias"));
      const categoriasData = categoriasSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCategorias(categoriasData);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  // FUNCIÓN SIMPLE PARA SUBIR IMÁGENES
  const subirImagenSimple = async (file) => {
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const storageRef = ref(storage, `productos/${fileName}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error("Error subiendo imagen:", error);
      alert("Error subiendo imagen");
      return null;
    }
  };

  // Función fetchCategorias que llama a loadCategorias
  const fetchCategorias = () => {
    loadCategorias();
  };

  // Función fetchBrands que carga marcas desde la base de datos
  const fetchBrands = () => {
    loadBrands();
  };

  const handleVariantVideoUpload = async (files, variantIndex) => {
    if (!files?.length) return;
    // asegurar IDs
    let targetId = currentId || product?.id;
    if (!targetId) targetId = await ensureCurrentId();
    const variantId = getOrCreateVariantId(variantIndex);
    setUploadingImages(true);
    const tasks = Array.from(files).map(async (file) => {
      const id = `${Date.now()}_${file.name}_${Math.random()
        .toString(36)
        .slice(2, 7)}`;
      setUploadQueue((prev) => [
        ...prev,
        {
          id,
          name: file.name,
          file,
          type: "video",
          progress: 0,
          status: "uploading",
          target: { level: "variant", field: "videoUrls", variantIndex },
          task: null,
        },
      ]);
      try {
        const destPath = buildStoragePath({
          productId: targetId,
          section: "gallery",
          file,
          variantId,
        });
        const url = await uploadWithRetry(uploadVideo, file, destPath, id);
        // Update local + Firestore (when editing) using functional state to avoid races
        setFormData((prev) => {
          const current = Array.isArray(prev.variantes[variantIndex]?.videoUrls)
            ? prev.variantes[variantIndex].videoUrls
            : [];
          const newVariants = prev.variantes.map((v, i) =>
            i === variantIndex ? { ...v, videoUrls: [...current, url] } : v
          );
          updateDoc(doc(db, "productos", targetId), {
            variantes: newVariants,
            fechaActualizacion: new Date(),
          }).catch(() => {});
          return { ...prev, variantes: newVariants };
        });
      } catch (e) {
        console.error("Variant video upload failed for file", file?.name, e);
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
      const snap = await getDocs(collection(db, "productos"));
      const all = snap.docs.map((d) => d.data()?.empresa).filter(Boolean);
      const unique = Array.from(new Set(all)).sort((a, b) =>
        a.localeCompare(b)
      );
      setBrands(unique);
    } catch (e) {
      console.error("Error cargando marcas:", e);
      setBrands([]);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Persistir inmediatamente cualquier cambio de campo (safe por campo)
    persistFieldImmediate(field, value);
  };

  // Enhanced image processing handler
  const handleImageProcessing = async (files, field) => {
    if (!files?.length) return;
    // Simplemente usar handleImageUpload en lugar de procesamiento complejo
    handleImageUpload(files, field);
  };

  const handleArrayChange = (field, index, value) => {
    setFormData((prev) => {
      const nextArr = prev[field].map((item, i) =>
        i === index ? value : item
      );
      const next = { ...prev, [field]: nextArr };
      // Persistir arreglo actualizado
      persistFieldImmediate(field, nextArr);
      return next;
    });
  };

  const addArrayItem = (field) => {
    setFormData((prev) => {
      const appended = [
        ...prev[field],
        field === "variantes"
          ? {
              color: "",
              imagen: "",
              imagenes: [],
              cantidad: 0,
              descripcion: "",
              precio: "",
            }
          : "",
      ];
      const next = { ...prev, [field]: appended };
      persistFieldImmediate(field, appended);
      return next;
    });
  };

  const removeArrayItem = (field, index) => {
    setFormData((prev) => {
      const filtered = prev[field].filter((_, i) => i !== index);
      const next = { ...prev, [field]: filtered };
      persistFieldImmediate(field, filtered);
      return next;
    });
  };

  const handleVariantChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      variantes: prev.variantes.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant
      ),
    }));
    // Persistir variantes inmediatamente si hay doc
    const targetId = currentId || product?.id;
    if (targetId) {
      try {
        // Construir el nuevo array en base al estado más reciente conocido
        setFormData((prev) => {
          const nuevas = prev.variantes.map((v, i) =>
            i === index ? { ...v, [field]: value } : v
          );
          updateDoc(doc(db, "productos", targetId), {
            variantes: nuevas,
            fechaActualizacion: new Date(),
          }).catch(() => {});
          return { ...prev, variantes: nuevas };
        });
      } catch {}
    }
  };

  // Enhanced variant selector change handler
  const handleVariantSelectionChange = (variantIndex) => {
    setSelectedVariant(variantIndex);
  };

  // Enhanced media handlers for new structure
  const handleImagenPrincipal = (files) => {
    if (!files?.length) return;
    handleImageProcessing(files, "imagenPrincipal");
  };

  const handleGaleriaImagenes = (files) => {
    if (!files?.length) return;
    handleImageProcessing(files, "galeriaImagenes");
  };

  const handleTresArchivosExtras = (files) => {
    if (!files?.length) return;
    const processedFiles = Array.from(files).map((file) => ({
      id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
      url: URL.createObjectURL(file),
      name: file.name,
      type: file.type,
      size: file.size,
      file,
    }));

    setFormData((prev) => ({
      ...prev,
      tresArchivosExtras: [
        ...(prev.tresArchivosExtras || []),
        ...processedFiles,
      ],
    }));
  };

  const handleVideoAcercaArticulo = (files) => {
    if (!files?.length) return;
    const videoFiles = Array.from(files).map((file) => ({
      id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
      url: URL.createObjectURL(file),
      name: file.name,
      type: file.type,
      size: file.size,
      file,
    }));

    setFormData((prev) => ({
      ...prev,
      videoAcercaArticulo: [...(prev.videoAcercaArticulo || []), ...videoFiles],
    }));
  };

  const handleVariantMediaFiles = (files, variantIndex, mediaType) => {
    if (!files?.length) return;

    const processedFiles = Array.from(files).map((file) => ({
      id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
      url: URL.createObjectURL(file),
      name: file.name,
      type: file.type,
      size: file.size,
      file,
    }));

    setFormData((prev) => {
      const newVariants = [...prev.variantes];
      if (!newVariants[variantIndex]) {
        newVariants[variantIndex] = {
          color: "",
          imagen: "",
          imagenes: [],
          cantidad: 0,
        };
      }

      if (mediaType === "imagenPrincipal") {
        newVariants[variantIndex].imagenPrincipal = processedFiles;
      } else if (mediaType === "galeriaImagenes") {
        newVariants[variantIndex].galeriaImagenes = [
          ...(newVariants[variantIndex].galeriaImagenes || []),
          ...processedFiles,
        ];
      }

      return { ...prev, variantes: newVariants };
    });
  };

  const uploadImage = async (file, destPath, queueId) => {
    return new Promise((resolve, reject) => {
      try {
        const imageRef = ref(storage, destPath);
        const task = uploadBytesResumable(imageRef, file);
        // attach task to queue item
        setUploadQueue((prev) =>
          prev.map((q) => (q.id === queueId ? { ...q, task } : q))
        );
        task.on(
          "state_changed",
          (snap) => {
            const pct = Math.round(
              (snap.bytesTransferred / snap.totalBytes) * 100
            );
            setUploadProgress(pct);
            setUploadQueue((prev) =>
              prev.map((q) => (q.id === queueId ? { ...q, progress: pct } : q))
            );
            // Watchdog: si sigue en 0% tras 6s, cancelar para reintentar
            setTimeout(() => {
              setUploadQueue((prev) => {
                const item = prev.find((q) => q.id === queueId);
                if (
                  item &&
                  item.status === "uploading" &&
                  (!item.progress || item.progress === 0) &&
                  item.task
                ) {
                  try {
                    item.task.cancel();
                  } catch {}
                  return prev.map((q) =>
                    q.id === queueId ? { ...q, status: "error" } : q
                  );
                }
                return prev;
              });
            }, 6000);
          },
          (err) => {
            setUploadQueue((prev) =>
              prev.map((q) =>
                q.id === queueId ? { ...q, status: "error" } : q
              )
            );
            reject(err);
          },
          async () => {
            const url = await getDownloadURL(task.snapshot.ref);
            setUploadQueue((prev) =>
              prev.map((q) => (q.id === queueId ? { ...q, status: "done" } : q))
            );
            resolve(url);
          }
        );
      } catch (e) {
        setUploadQueue((prev) =>
          prev.map((q) => (q.id === queueId ? { ...q, status: "error" } : q))
        );
        reject(e);
      }
    });
  };

  const uploadVideo = async (file, destPath, queueId) => {
    return new Promise((resolve, reject) => {
      try {
        const videoRef = ref(storage, destPath);
        const task = uploadBytesResumable(videoRef, file);
        setUploadQueue((prev) =>
          prev.map((q) => (q.id === queueId ? { ...q, task } : q))
        );
        task.on(
          "state_changed",
          (snap) => {
            const pct = Math.round(
              (snap.bytesTransferred / snap.totalBytes) * 100
            );
            setUploadProgress(pct);
            setUploadQueue((prev) =>
              prev.map((q) => (q.id === queueId ? { ...q, progress: pct } : q))
            );
          },
          (err) => {
            setUploadQueue((prev) =>
              prev.map((q) =>
                q.id === queueId ? { ...q, status: "error" } : q
              )
            );
            reject(err);
          },
          async () => {
            const url = await getDownloadURL(task.snapshot.ref);
            setUploadQueue((prev) =>
              prev.map((q) => (q.id === queueId ? { ...q, status: "done" } : q))
            );
            resolve(url);
          }
        );
      } catch (e) {
        setUploadQueue((prev) =>
          prev.map((q) => (q.id === queueId ? { ...q, status: "error" } : q))
        );
        reject(e);
      }
    });
  };

  // Helper con reintentos y backoff simple
  const uploadWithRetry = async (
    fn,
    file,
    pathKey,
    queueId,
    maxRetries = 2
  ) => {
    let lastErr;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const url = await fn(file, pathKey, queueId);
        return url;
      } catch (e) {
        lastErr = e;
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
      }
    }
    throw lastErr;
  };

  // Borrar un archivo de Firebase Storage a partir de su URL pública (si aplica)
  const deleteFromStorageByUrl = async (url) => {
    if (!url) return;

    try {
      const urlStr = String(url).trim();

      // IGNORAR rutas relativas/locales - solo borrar URLs de Firebase Storage
      if (
        urlStr.startsWith("/") ||
        urlStr.startsWith("./") ||
        urlStr.startsWith("../")
      ) {
        return;
      }

      // IGNORAR URLs que no son de Firebase Storage
      if (
        !urlStr.startsWith("gs://") &&
        !urlStr.includes("firebasestorage.googleapis.com")
      ) {
        return;
      }

      const toRef = (s) => {
        try {
          const u = String(s);
          if (u.startsWith("gs://")) return ref(storage, u);
          if (u.includes("firebasestorage.googleapis.com")) {
            const m = u.match(/\/o\/([^?]+)/);
            if (m && m[1]) {
              const objectPath = decodeURIComponent(m[1]);
              return ref(storage, objectPath);
            }
          }
          return null;
        } catch {
          return null;
        }
      };

      const r = toRef(urlStr);
      if (r) {
        await deleteObject(r);
      }
    } catch (e) {
      // Ignorar errores silenciosamente
    }
  };

  // Detectar tipo a partir de la URL (para extras guardados)
  const detectTypeFromUrl = (url) => {
    try {
      const str = String(url).trim().toLowerCase();
      // Detectar plataformas de video por URL (YouTube/Vimeo)
      if (
        str.includes("youtube.com") ||
        str.includes("youtu.be") ||
        str.includes("vimeo.com")
      ) {
        return "video";
      }
      const clean = str.split("?")[0].split("#")[0];
      const ext = clean.split(".").pop() || "";
      if (["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(ext))
        return "image";
      if (["mp4", "mov", "avi", "mkv", "webm", "m4v"].includes(ext))
        return "video";
      return "document";
    } catch {
      return "document";
    }
  };

  // Remove media item handler
  const removeMediaItem = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
    persistFieldImmediate(
      field,
      formData[field].filter((_, i) => i !== index)
    );
  };

  // Set main image handler
  const setMainImage = (field, index) => {
    if (field === "galeriaImagenes") {
      const selectedImage = formData.galeriaImagenes[index];
      if (selectedImage) {
        setFormData((prev) => ({
          ...prev,
          imagenPrincipal: [selectedImage],
          galeriaImagenes: prev.galeriaImagenes.filter((_, i) => i !== index),
        }));
      }
    }
  };

  // Reorder media items
  const reorderMediaItems = (field, fromIndex, toIndex) => {
    setFormData((prev) => {
      const items = [...prev[field]];
      const [movedItem] = items.splice(fromIndex, 1);
      items.splice(toIndex, 0, movedItem);

      persistFieldImmediate(field, items);
      return { ...prev, [field]: items };
    });
  };

  const handleVideoFilesUpload = async (files) => {
    if (!files?.length) return;
    // asegurar ID de producto para rutas estables y Firestore inmediato
    let targetId = currentId || product?.id;
    if (!targetId) targetId = await ensureCurrentId();
    setUploadingImages(true);
    const tasks = Array.from(files).map(async (file) => {
      const id = `${Date.now()}_${file.name}_${Math.random()
        .toString(36)
        .slice(2, 7)}`;
      setUploadQueue((prev) => [
        ...prev,
        {
          id,
          name: file.name,
          file,
          type: "video",
          progress: 0,
          status: "uploading",
          target: { level: "product", field: "videoUrls", variantIndex: null },
          task: null,
        },
      ]);
      try {
        const destPath = buildStoragePath({
          productId: targetId,
          section: "videos",
          file,
        });
        const url = await uploadWithRetry(uploadVideo, file, destPath, id);
        // Update local state immediately
        setFormData((prev) => {
          const next = { ...prev, videoUrls: [...(prev.videoUrls || []), url] };
          // Instant Firestore propagation when editing existing product
          updateDoc(doc(db, "productos", targetId), {
            videoUrls: next.videoUrls,
            fechaActualizacion: new Date(),
          }).catch(() => {});
          return next;
        });
      } catch (e) {
        console.error("Video upload failed for file", file?.name, e);
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
        const actual = prev.variantes[variantIndex] || {
          imagen: "",
          imagenes: [],
        };
        if (field === "imagen") {
          return {
            ...prev,
            variantes: {
              ...prev.variantes,
              [variantIndex]: { ...actual, imagen: localUrls[0] },
            },
          };
        }
        if (field === "imagenes") {
          return {
            ...prev,
            variantes: {
              ...prev.variantes,
              [variantIndex]: {
                ...actual,
                imagenes: [...actual.imagenes, ...localUrls],
              },
            },
          };
        }
        return prev;
      });
    } else if (field === "imagen") {
      setTempPreviews((prev) => ({ ...prev, imagen: localUrls[0] }));
    } else if (field === "imagenes") {
      setTempPreviews((prev) => ({
        ...prev,
        imagenes: [...prev.imagenes, ...localUrls],
      }));
    }

    // asegurar ID antes de subir para rutas y preview en tiempo real
    let targetId = currentId || product?.id;
    if (!targetId) targetId = await ensureCurrentId();
    setUploadingImages(true);
    const filesArr = Array.from(files);
    const tasks = filesArr.map(async (file) => {
      const id = `${Date.now()}_${file.name}_${Math.random()
        .toString(36)
        .slice(2, 7)}`;
      setUploadQueue((prev) => [
        ...prev,
        {
          id,
          name: file.name,
          file,
          type: "image",
          progress: 0,
          status: "uploading",
          target: {
            level: variantIndex !== null ? "variant" : "product",
            field,
            variantIndex,
          },
          task: null,
        },
      ]);
      try {
        // decidir sección y ruta de Storage
        let destPath;
        if (variantIndex !== null) {
          const variantId = getOrCreateVariantId(variantIndex);
          destPath = buildStoragePath({
            productId: targetId,
            section: field === "imagen" ? "main" : "gallery",
            file,
            variantId,
          });
        } else {
          destPath = buildStoragePath({
            productId: targetId,
            section: field === "imagen" ? "main" : "gallery",
            file,
          });
        }
        const url = await uploadWithRetry(uploadImage, file, destPath, id);
        if (variantIndex !== null) {
          // Functional set to avoid races and also update Firestore immediately when editing
          setFormData((prev) => {
            if (field === "imagen") {
              const newVariants = prev.variantes.map((v, i) =>
                i === variantIndex ? { ...v, imagen: url } : v
              );
              updateDoc(doc(db, "productos", targetId), {
                variantes: newVariants,
                fechaActualizacion: new Date(),
              }).catch(() => {});
              return { ...prev, variantes: newVariants };
            } else if (field === "imagenes") {
              const current = Array.isArray(
                prev.variantes[variantIndex]?.imagenes
              )
                ? prev.variantes[variantIndex].imagenes
                : [];
              const newVariants = prev.variantes.map((v, i) =>
                i === variantIndex ? { ...v, imagenes: [...current, url] } : v
              );
              updateDoc(doc(db, "productos", targetId), {
                variantes: newVariants,
                fechaActualizacion: new Date(),
              }).catch(() => {});
              return { ...prev, variantes: newVariants };
            } else {
              const current = Array.isArray(
                prev.variantes[variantIndex]?.[field]
              )
                ? prev.variantes[variantIndex][field]
                : [];
              const newVariants = prev.variantes.map((v, i) =>
                i === variantIndex ? { ...v, [field]: [...current, url] } : v
              );
              updateDoc(doc(db, "productos", targetId), {
                variantes: newVariants,
                fechaActualizacion: new Date(),
              }).catch(() => {});
              return { ...prev, variantes: newVariants };
            }
          });
        } else if (field === "imagen") {
          setFormData((prev) => {
            const next = { ...prev, imagen: url };
            updateDoc(doc(db, "productos", targetId), {
              imagen: url,
              fechaActualizacion: new Date(),
            }).catch(() => {});
            return next;
          });
        } else {
          setFormData((prev) => {
            const next = { ...prev, [field]: [...prev[field], url] };
            updateDoc(doc(db, "productos", targetId), {
              [field]: next[field],
              fechaActualizacion: new Date(),
            }).catch(() => {});
            return next;
          });
        }
      } catch (e) {
        console.error("Image upload failed for file", file?.name, e);
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
        if (field === "imagen") copy.imagen = "";
        if (field === "imagenes") copy.imagenes = [];
        return {
          ...prev,
          variantes: { ...prev.variantes, [variantIndex]: copy },
        };
      });
    } else if (field === "imagen") {
      setTempPreviews((prev) => ({ ...prev, imagen: "" }));
    } else if (field === "imagenes") {
      setTempPreviews((prev) => ({ ...prev, imagenes: [] }));
    }
  };

  // ---- Extras (Tres archivos) ----
  const handleExtrasUpload = async (files) => {
    if (!files?.length) return;
    const remaining = Math.max(0, 3 - (formData.imagenesExtra?.length || 0));
    const toAdd = Array.from(files).slice(0, remaining);
    // previews locales
    const localUrls = toAdd.map((f) => URL.createObjectURL(f));
    setTempPreviews((prev) => ({
      ...prev,
      extras: [...(prev.extras || []), ...localUrls],
    }));
    // asegurar ID antes de subir
    let targetId = currentId || product?.id;
    if (!targetId) targetId = await ensureCurrentId();
    setUploadingImages(true);
    const tasks = toAdd.map(async (file) => {
      const id = `${Date.now()}_${file.name}_${Math.random()
        .toString(36)
        .slice(2, 7)}`;
      setUploadQueue((prev) => [
        ...prev,
        {
          id,
          name: file.name,
          file,
          type: "file",
          progress: 0,
          status: "uploading",
          target: {
            level: "product",
            field: "imagenesExtra",
            variantIndex: null,
          },
          task: null,
        },
      ]);
      try {
        const destPath = buildStoragePath({
          productId: targetId,
          section: "extras",
          file,
        });
        const url = await uploadWithRetry(uploadImage, file, destPath, id);
        setFormData((prev) => {
          const next = {
            ...prev,
            imagenesExtra: [...(prev.imagenesExtra || []), url],
          };
          updateDoc(doc(db, "productos", targetId), {
            imagenesExtra: next.imagenesExtra,
            fechaActualizacion: new Date(),
          }).catch(() => {});
          return next;
        });
      } catch (e) {
        console.error("Extras upload failed for file", file?.name, e);
      }
    });
    try {
      await Promise.allSettled(tasks);
    } finally {
      setUploadingImages(false);
      setUploadProgress(null);
      setTempPreviews((prev) => ({ ...prev, extras: [] }));
    }
  };

  const moveExtraFile = (fromIndex, direction) => {
    setFormData((prev) => {
      const arr = Array.isArray(prev.imagenesExtra)
        ? [...prev.imagenesExtra]
        : [];
      const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
      if (toIndex < 0 || toIndex >= arr.length) return prev;
      const [m] = arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, m);
      const next = { ...prev, imagenesExtra: arr };
      const targetId = currentId || product?.id;
      if (targetId)
        updateDoc(doc(db, "productos", targetId), {
          imagenesExtra: arr,
          fechaActualizacion: new Date(),
        }).catch(() => {});
      return next;
    });
  };

  const removeExtraFile = async (index) => {
    const url = formData.imagenesExtra?.[index];
    if (url) await deleteFromStorageByUrl(url);
    const updated = (formData.imagenesExtra || []).filter(
      (_, i) => i !== index
    );
    handleInputChange("imagenesExtra", updated);
  };

  // Borrado helpers para otras secciones
  const removeProductVideo = async (index) => {
    const url = formData.videoUrls?.[index];
    if (url) await deleteFromStorageByUrl(url);
    const updated = (formData.videoUrls || []).filter((_, i) => i !== index);
    handleInputChange("videoUrls", updated);
  };

  const removeProductImage = async (index) => {
    const url = formData.imagenes?.[index];
    if (url) await deleteFromStorageByUrl(url);
    const updated = (formData.imagenes || []).filter((_, i) => i !== index);
    handleInputChange("imagenes", updated);
  };

  const removeVariantImage = async (variantIndex, index) => {
    const url = formData.variantes?.[variantIndex]?.imagenes?.[index];
    if (url) await deleteFromStorageByUrl(url);
    const updated = (formData.variantes?.[variantIndex]?.imagenes || []).filter(
      (_, i) => i !== index
    );
    handleVariantChange(variantIndex, "imagenes", updated);
  };

  const removeVariantVideo = async (variantIndex, index) => {
    const url = formData.variantes?.[variantIndex]?.videoUrls?.[index];
    if (url) await deleteFromStorageByUrl(url);
    const updated = (
      formData.variantes?.[variantIndex]?.videoUrls || []
    ).filter((_, i) => i !== index);
    handleVariantChange(variantIndex, "videoUrls", updated);
  };

  const removeMainImage = async () => {
    if (formData.imagen) await deleteFromStorageByUrl(formData.imagen);
    // Limpiar tanto legacy como nuevo formato
    handleInputChange("imagen", "");
    handleInputChange("imagenPrincipal", []);
  };

  // removed legacy single additional video handler in favor of multi 'videoAcercaArticulo'

  // ====== UniversalFileUploader Handlers (instant preview + background upload) ======
  const handleMainImageUFU = async (filesList) => {
    console.log("🎯 handleMainImageUFU llamado con:", filesList);

    // CRÍTICO: Prevenir borrado automático durante carga inicial
    if (isInitialLoadRef.current || !formInitializedRef.current) {
      console.log("⏸️ Carga inicial - ignorando llamada para prevenir borrado");
      return;
    }

    try {
      setUploadingImages(true);
      const arr = Array.isArray(filesList) ? filesList : [];
      console.log("📋 Array procesado:", arr);
      if (arr.length === 0) {
        console.log("📭 No hay archivos, limpiando imagen principal");
        setTempPreviews((prev) => ({ ...prev, imagen: "" }));
        await removeMainImage();
        return;
      }
      const first = arr[0];
      console.log("📄 Primer archivo:", first);
      const url0 = first?.url || "";
      console.log("🔗 URL del primer archivo:", url0);
      if (first?.file) {
        console.log("📦 Archivo detectado, procesando subida...");
        // LIMPIAR preview temporal ANTES de mostrar el nuevo para evitar duplicados
        setTempPreviews((prev) => ({ ...prev, imagen: "" }));
        // show local preview immediately
        console.log("👁️ Mostrando preview local:", url0);
        setTempPreviews((prev) => ({ ...prev, imagen: url0 }));
        let targetId = currentId || product?.id;
        console.log("🆔 Target ID:", targetId);
        if (!targetId) {
          console.log("🆕 No hay ID, creando uno...");
          targetId = await ensureCurrentId();
        }
        if (!targetId) {
          console.warn("⚠️ No se pudo obtener ID, abortando subida");
          return;
        }
        console.log("✅ ID confirmado:", targetId);
        const queueId = `${Date.now()}_${first.file.name}_${Math.random()
          .toString(36)
          .slice(2, 7)}`;
        const destPath = buildStoragePath({
          productId: targetId,
          section: "main",
          file: first.file,
        });
        console.log("⬆️ Iniciando subida a Firebase Storage...");
        const remoteUrl = await uploadWithRetry(
          uploadImage,
          first.file,
          destPath,
          queueId
        );
        console.log("✅ Imagen subida exitosamente! URL:", remoteUrl);
        // Limpiar preview temporal INMEDIATAMENTE antes de actualizar formData
        setTempPreviews((prev) => ({ ...prev, imagen: "" }));

        setFormData((prev) => {
          // NO mover imagen principal a galería - mantener separadas
          const imagenPrincipal = [{ url: remoteUrl }];
          const next = {
            ...prev,
            imagen: remoteUrl,
            imagenPrincipal,
            // NO tocar imagenes aquí - solo imagen principal
          };
          console.log(
            "💾 Guardando en Firestore y actualizando formData...",
            next
          );
          safeUpdateDoc(targetId, {
            imagen: remoteUrl,
            imagenPrincipal,
            // NO actualizar imagenes aquí
          })
            .then(() => {
              console.log("✅ Documento actualizado en Firestore");
            })
            .catch((err) => {
              console.error("❌ Error actualizando Firestore:", err);
            });
          return next;
        });
      } else if (url0 && !url0.startsWith("blob:")) {
        // existing remote URL
        handleInputChange("imagen", url0);
        handleInputChange("imagenPrincipal", [{ url: url0 }]);
        setTempPreviews((prev) => ({ ...prev, imagen: "" }));
      }
    } catch (e) {
      console.error("handleMainImageUFU error", e);
    } finally {
      setUploadingImages(false);
      setUploadProgress(null);
    }
  };

  const handleGalleryUFU = async (filesList) => {
    console.log("🚀 handleGalleryUFU iniciado con:", filesList);

    // CRÍTICO: Prevenir borrado automático durante carga inicial
    if (isInitialLoadRef.current || !formInitializedRef.current) {
      console.log("⏸️ Carga inicial - ignorando llamada para prevenir borrado");
      return;
    }

    try {
      setUploadingImages(true);
      const arr = Array.isArray(filesList) ? filesList : [];

      // Obtener ID del producto
      let targetId = currentId || product?.id;
      if (!targetId) {
        targetId = await ensureCurrentId();
        console.log("📝 ID creado para galería:", targetId);
      }
      if (!targetId) {
        console.error("❌ No se pudo obtener ID para galería");
        return;
      }

      // Separar por tipo: nuevos archivos vs URLs existentes
      const newImageFiles = arr.filter(
        (f) => f?.file && f.file.type?.startsWith?.("image/")
      );
      const newVideoFiles = arr.filter(
        (f) => f?.file && f.file.type?.startsWith?.("video/")
      );
      const existingUrls = arr
        .filter((f) => !f?.file && f?.url && !f.url.startsWith("blob:"))
        .map((f) => f.url);

      // Separar URLs existentes por tipo
      const existingImages = existingUrls.filter(
        (u) => detectTypeFromUrl(u) === "image"
      );
      const existingVideos = existingUrls.filter(
        (u) => detectTypeFromUrl(u) === "video"
      );

      console.log(
        "📁 Nuevas imágenes:",
        newImageFiles.length,
        newImageFiles.map((f) => f.file?.name)
      );
      console.log(
        "🎬 Nuevos videos:",
        newVideoFiles.length,
        newVideoFiles.map((f) => f.file?.name)
      );
      console.log(
        "🔗 Imágenes existentes:",
        existingImages.length,
        existingImages
      );
      console.log(
        "🔗 Videos existentes:",
        existingVideos.length,
        existingVideos
      );

      // Subir nuevas imágenes
      const uploadedImages = [];
      for (const fileItem of newImageFiles) {
        try {
          console.log("⬆️ Subiendo imagen:", fileItem.file.name);
          const destPath = buildStoragePath({
            productId: targetId,
            section: "gallery",
            file: fileItem.file,
          });

          const remoteUrl = await uploadWithRetry(
            uploadImage,
            fileItem.file,
            destPath,
            `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
          );

          uploadedImages.push(remoteUrl);
          console.log("✅ Imagen subida:", remoteUrl);
        } catch (e) {
          console.error("❌ Error subiendo imagen:", fileItem.file.name, e);
        }
      }

      // Subir nuevos videos
      const uploadedVideos = [];
      for (const fileItem of newVideoFiles) {
        try {
          console.log("⬆️ Subiendo video:", fileItem.file.name);
          const destPath = buildStoragePath({
            productId: targetId,
            section: "videos",
            file: fileItem.file,
          });

          const remoteUrl = await uploadWithRetry(
            uploadVideo,
            fileItem.file,
            destPath,
            `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
          );

          uploadedVideos.push(remoteUrl);
          console.log("✅ Video subido:", remoteUrl);
        } catch (e) {
          console.error("❌ Error subiendo video:", fileItem.file.name, e);
        }
      }

      // Combinar todas las URLs con las que ya estaban en formData para evitar borrar imágenes existentes
      console.log("📋 Imágenes subidas:", uploadedImages);
      console.log("📋 Videos subidos:", uploadedVideos);

      setFormData((prev) => {
        // ✅ CORRECCIÓN CRÍTICA: Solo usar lo que el UFU reporta (existentes + nuevos)
        // NO usar prevImages/prevVideos porque ignora las eliminaciones del usuario
        // ✅ FILTRO ESTRICTO: Solo URLs válidas (no null, undefined, o strings vacíos)
        const validExistingImages = existingImages.filter(
          (url) => url && typeof url === "string" && url.trim() !== ""
        );
        const validUploadedImages = uploadedImages.filter(
          (url) => url && typeof url === "string" && url.trim() !== ""
        );
        const validExistingVideos = existingVideos.filter(
          (url) => url && typeof url === "string" && url.trim() !== ""
        );
        const validUploadedVideos = uploadedVideos.filter(
          (url) => url && typeof url === "string" && url.trim() !== ""
        );

        const mergedImages = Array.from(
          new Set([
            ...validExistingImages, // URLs existentes VÁLIDAS
            ...validUploadedImages, // URLs recién subidas VÁLIDAS
          ])
        );

        const mergedVideos = Array.from(
          new Set([
            ...validExistingVideos, // URLs existentes VÁLIDAS
            ...validUploadedVideos, // URLs recién subidas VÁLIDAS
          ])
        );

        console.log("🔀 RESULTADO MERGE:");
        console.log(
          "  📸 Imágenes finales:",
          mergedImages.length,
          mergedImages
        );
        console.log("  🎬 Videos finales:", mergedVideos.length, mergedVideos);

        const shouldSetMain = !prev.imagen && mergedImages.length > 0;
        const mainImage = shouldSetMain ? mergedImages[0] : prev.imagen;

        if (shouldSetMain) {
          console.log(
            "⚠️ No hay imagen principal, usando primera de galería:",
            mainImage
          );
        }

        const next = {
          ...prev,
          imagenes: mergedImages,
          videoUrls: mergedVideos,
          ...(shouldSetMain
            ? { imagen: mainImage, imagenPrincipal: [{ url: mainImage }] }
            : {}),
        };

        const updatePayload = {
          imagenes: mergedImages,
          videoUrls: mergedVideos,
          ...(shouldSetMain
            ? { imagen: mainImage, imagenPrincipal: [{ url: mainImage }] }
            : {}),
        };

        safeUpdateDoc(targetId, updatePayload)
          .then(() => {
            console.log(`✅ FIRESTORE ACTUALIZADO:`, updatePayload);
            console.log(`📊 ESTADO FINAL DEL PRODUCTO:`);
            console.log(`  - Imagen principal:`, next.imagen ? "✅" : "❌");
            console.log(`  - Galería imágenes:`, next.imagenes?.length || 0);
            console.log(`  - Galería videos:`, next.videoUrls?.length || 0);
          })
          .catch((err) => {
            console.error(`❌ ERROR FIRESTORE:`, err);
          });

        return next;
      });

      // Limpiar previews temporales
      setTempPreviews((prev) => ({
        ...prev,
        imagenes: [],
        productVideos: [],
      }));
    } catch (e) {
      console.error("❌ handleGalleryUFU error general:", e);
    } finally {
      setUploadingImages(false);
      setUploadProgress(null);
    }
  };

  // Múltiples videos para "Acerca de este artículo"
  const handleAcercaVideosUFU = async (filesList) => {
    // CRÍTICO: Prevenir borrado automático durante carga inicial
    if (isInitialLoadRef.current || !formInitializedRef.current) {
      console.log("⏸️ Carga inicial - ignorando llamada para prevenir borrado");
      return;
    }

    try {
      setUploadingImages(true);
      const arr = Array.isArray(filesList) ? filesList : [];
      const localPreviews = arr
        .filter((f) => f?.file)
        .map((f) => f.url)
        .filter(Boolean);
      setTempPreviews((prev) => ({ ...prev, acercaVideos: localPreviews }));

      const savedNew = arr
        .filter((f) => !f?.file && f?.url && !f.url.startsWith("blob:"))
        .map((f) => f.url);
      const savedOld = Array.isArray(formData.videoAcercaArticulo)
        ? formData.videoAcercaArticulo
        : [];

      // eliminaciones
      const removed = savedOld.filter((u) => !savedNew.includes(u));
      for (const r of removed) {
        await deleteFromStorageByUrl(r);
      }
      if (JSON.stringify(savedNew) !== JSON.stringify(savedOld)) {
        setFormData((prev) => {
          const next = { ...prev, videoAcercaArticulo: savedNew };
          const targetId = currentId || product?.id;
          if (targetId)
            updateDoc(doc(db, "productos", targetId), {
              videoAcercaArticulo: savedNew,
              fechaActualizacion: new Date(),
            }).catch(() => {});
          return next;
        });
      }

      // subidas
      let targetId = currentId || product?.id;
      if (!targetId) targetId = await ensureCurrentId();
      if (!targetId) return; // sin ID: no subir aún
      for (const item of arr) {
        if (item?.file && item.file.type?.startsWith?.("video/")) {
          const queueId = `${Date.now()}_${item.file.name}_${Math.random()
            .toString(36)
            .slice(2, 7)}`;
          const destPath = buildStoragePath({
            productId: targetId,
            section: "videos",
            file: item.file,
          });
          try {
            const remoteUrl = await uploadWithRetry(
              uploadVideo,
              item.file,
              destPath,
              queueId
            );
            setFormData((prev) => {
              const vids = Array.isArray(prev.videoAcercaArticulo)
                ? [...prev.videoAcercaArticulo, remoteUrl]
                : [remoteUrl];
              const next = { ...prev, videoAcercaArticulo: vids };
              updateDoc(doc(db, "productos", targetId), {
                videoAcercaArticulo: vids,
                fechaActualizacion: new Date(),
              }).catch(() => {});
              return next;
            });
          } catch (e) {
            console.error("Acerca video upload error", e);
          }
        }
      }
    } catch (e) {
      console.error("handleAcercaVideosUFU error", e);
    } finally {
      setUploadingImages(false);
      setUploadProgress(null);
    }
  };

  // removed legacy single additional video uploader; superseded by handleAcercaVideosUFU

  const handleExtrasUFU = async (filesList) => {
    console.log("🚀 handleExtrasUFU iniciado con:", filesList);

    // CRÍTICO: Prevenir borrado automático durante carga inicial
    if (isInitialLoadRef.current || !formInitializedRef.current) {
      console.log("⏸️ Carga inicial - ignorando llamada para prevenir borrado");
      return;
    }

    try {
      setUploadingImages(true);
      const arr = Array.isArray(filesList) ? filesList : [];

      // Obtener ID del producto
      let targetId = currentId || product?.id;
      if (!targetId) {
        targetId = await ensureCurrentId();
        console.log("📝 ID creado:", targetId);
      }
      if (!targetId) {
        console.error("❌ No se pudo obtener ID del producto");
        return;
      }

      // Separar archivos nuevos (con .file) de URLs existentes
      const newFiles = arr.filter((f) => f?.file);
      const existingUrls = arr
        .filter((f) => !f?.file && f?.url && !f.url.startsWith("blob:"))
        .map((f) => f.url);

      console.log("📁 Archivos nuevos:", newFiles.length);
      console.log("🔗 URLs existentes:", existingUrls.length);

      // Subir archivos nuevos INMEDIATAMENTE
      const uploadedUrls = [];
      for (const fileItem of newFiles) {
        try {
          console.log("⬆️ Subiendo:", fileItem.file.name);
          const destPath = buildStoragePath({
            productId: targetId,
            section: "extras",
            file: fileItem.file,
          });

          const remoteUrl = await uploadWithRetry(
            uploadImage,
            fileItem.file,
            destPath,
            `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
          );

          uploadedUrls.push(remoteUrl);
          console.log("✅ Subido exitosamente:", remoteUrl);
        } catch (e) {
          console.error("❌ Error subiendo archivo:", fileItem.file.name, e);
        }
      }

      // ✅ CORRECCIÓN: Solo usar lo que el UFU reporta (existentes + nuevos)
      console.log("📋 URLs subidas (extras):", uploadedUrls);
      setFormData((prev) => {
        // NO usar prevExtras porque ignora eliminaciones del usuario
        // ✅ FILTRO ESTRICTO: Solo URLs válidas
        const validExisting = existingUrls.filter(
          (url) => url && typeof url === "string" && url.trim() !== ""
        );
        const validUploaded = uploadedUrls.filter(
          (url) => url && typeof url === "string" && url.trim() !== ""
        );

        const merged = Array.from(
          new Set([
            ...validExisting, // URLs VÁLIDAS que el UFU dice que están
            ...validUploaded, // URLs VÁLIDAS recién subidas
          ])
        );

        const next = { ...prev, imagenesExtra: merged };

        // Actualizar Firestore directamente (SIMPLE)
        safeUpdateDoc(targetId, { imagenesExtra: merged })
          .then(() => {
            console.log("✅ FIRESTORE ACTUALIZADO - imagenesExtra:", merged);
          })
          .catch((err) => {
            console.error("❌ ERROR FIRESTORE:", err);
          });

        return next;
      });

      // Limpiar previews temporales
      setTempPreviews((prev) => ({ ...prev, extras: [] }));
    } catch (e) {
      console.error("❌ handleExtrasUFU error general:", e);
    } finally {
      setUploadingImages(false);
      setUploadProgress(null);
    }
  };

  const handleVariantMainUFU = async (filesList, variantIndex) => {
    // CRÍTICO: Prevenir borrado automático durante carga inicial
    if (isInitialLoadRef.current || !formInitializedRef.current) {
      console.log("⏸️ Carga inicial - ignorando llamada para prevenir borrado");
      return;
    }

    try {
      setUploadingImages(true);
      const arr = Array.isArray(filesList) ? filesList : [];
      if (arr.length === 0) {
        setTempPreviews((prev) => ({
          ...prev,
          variantes: {
            ...prev.variantes,
            [variantIndex]: {
              ...(prev.variantes?.[variantIndex] || {}),
              imagen: "",
            },
          },
        }));
        handleVariantChange(variantIndex, "imagen", "");
        return;
      }
      const first = arr[0];
      if (first?.file) {
        // LIMPIAR preview temporal ANTES de mostrar el nuevo
        setTempPreviews((prev) => ({
          ...prev,
          variantes: {
            ...prev.variantes,
            [variantIndex]: {
              ...(prev.variantes?.[variantIndex] || {}),
              imagen: "",
            },
          },
        }));
        // Luego mostrar preview
        setTempPreviews((prev) => ({
          ...prev,
          variantes: {
            ...prev.variantes,
            [variantIndex]: {
              ...(prev.variantes?.[variantIndex] || {}),
              imagen: first.url,
            },
          },
        }));
        let targetId = currentId || product?.id;
        if (!targetId) targetId = await ensureCurrentId();
        const variantId = getOrCreateVariantId(variantIndex);
        const queueId = `${Date.now()}_${first.file.name}_${Math.random()
          .toString(36)
          .slice(2, 7)}`;
        const destPath = buildStoragePath({
          productId: targetId,
          section: "main",
          file: first.file,
          variantId,
        });
        const remoteUrl = await uploadWithRetry(
          uploadImage,
          first.file,
          destPath,
          queueId
        );
        // Limpiar preview temporal INMEDIATAMENTE después de subir
        setTempPreviews((prev) => ({
          ...prev,
          variantes: {
            ...prev.variantes,
            [variantIndex]: {
              ...(prev.variantes?.[variantIndex] || {}),
              imagen: "",
            },
          },
        }));
        handleVariantChange(variantIndex, "imagen", remoteUrl);
      } else if (first?.url && !first.url.startsWith("blob:")) {
        handleVariantChange(variantIndex, "imagen", first.url);
        // clear preview temp
        setTempPreviews((prev) => ({
          ...prev,
          variantes: {
            ...prev.variantes,
            [variantIndex]: {
              ...(prev.variantes?.[variantIndex] || {}),
              imagen: "",
            },
          },
        }));
      }
    } catch (e) {
      console.error("handleVariantMainUFU error", e);
    } finally {
      setUploadingImages(false);
      setUploadProgress(null);
    }
  };

  const handleVariantGalleryUFU = async (filesList, variantIndex) => {
    // CRÍTICO: Prevenir borrado automático durante carga inicial
    if (isInitialLoadRef.current || !formInitializedRef.current) {
      console.log("⏸️ Carga inicial - ignorando llamada para prevenir borrado");
      return;
    }

    try {
      setUploadingImages(true);
      const arr = Array.isArray(filesList) ? filesList : [];
      const localPreviews = arr
        .filter((f) => f?.file)
        .map((f) => f.url)
        .filter(Boolean);
      setTempPreviews((prev) => ({
        ...prev,
        variantes: {
          ...prev.variantes,
          [variantIndex]: {
            ...(prev.variantes?.[variantIndex] || {}),
            imagenes: localPreviews,
          },
        },
      }));

      const savedNew = arr
        .filter((f) => !f?.file && f?.url && !f.url.startsWith("blob:"))
        .map((f) => f.url);
      const savedOld = Array.isArray(
        formData.variantes?.[variantIndex]?.imagenes
      )
        ? formData.variantes[variantIndex].imagenes
        : [];
      const removed = savedOld.filter((u) => !savedNew.includes(u));
      for (const r of removed) await deleteFromStorageByUrl(r);

      // persist order
      if (JSON.stringify(savedNew) !== JSON.stringify(savedOld)) {
        handleVariantChange(variantIndex, "imagenes", savedNew);
      }

      // uploads
      let targetId = currentId || product?.id;
      if (!targetId) targetId = await ensureCurrentId();
      if (!targetId) return; // sin ID: no subir aún
      const variantId = getOrCreateVariantId(variantIndex);
      for (const item of arr) {
        if (item?.file && item.file.type?.startsWith?.("image/")) {
          const queueId = `${Date.now()}_${item.file.name}_${Math.random()
            .toString(36)
            .slice(2, 7)}`;
          const destPath = buildStoragePath({
            productId: targetId,
            section: "gallery",
            file: item.file,
            variantId,
          });
          try {
            const remoteUrl = await uploadWithRetry(
              uploadImage,
              item.file,
              destPath,
              queueId
            );
            // append
            setFormData((prev) => {
              const variantes = [...(prev.variantes || [])];
              const curr = Array.isArray(variantes[variantIndex]?.imagenes)
                ? variantes[variantIndex].imagenes
                : [];
              variantes[variantIndex] = {
                ...(variantes[variantIndex] || {}),
                imagenes: [...curr, remoteUrl],
              };
              const next = { ...prev, variantes };
              const id = currentId || product?.id;
              if (id)
                updateDoc(doc(db, "productos", id), {
                  variantes,
                  fechaActualizacion: new Date(),
                }).catch(() => {});
              return next;
            });
          } catch (e) {
            console.error("Variant gallery upload error", e);
          }
        }
      }
    } catch (e) {
      console.error("handleVariantGalleryUFU error", e);
    } finally {
      setUploadingImages(false);
      setUploadProgress(null);
    }
  };

  const handleVariantVideosUFU = async (filesList, variantIndex) => {
    // CRÍTICO: Prevenir borrado automático durante carga inicial
    if (isInitialLoadRef.current || !formInitializedRef.current) {
      console.log("⏸️ Carga inicial - ignorando llamada para prevenir borrado");
      return;
    }

    try {
      const arr = Array.isArray(filesList) ? filesList : [];
      const localPreviews = arr
        .filter((f) => f?.file)
        .map((f) => f.url)
        .filter(Boolean);
      setTempPreviews((prev) => ({
        ...prev,
        variantes: {
          ...prev.variantes,
          [variantIndex]: {
            ...(prev.variantes?.[variantIndex] || {}),
            videos: localPreviews,
          },
        },
      }));

      const savedNew = arr
        .filter((f) => !f?.file && f?.url && !f.url.startsWith("blob:"))
        .map((f) => f.url);
      const savedOld = Array.isArray(
        formData.variantes?.[variantIndex]?.videoUrls
      )
        ? formData.variantes[variantIndex].videoUrls
        : [];
      const removed = savedOld.filter((u) => !savedNew.includes(u));
      for (const r of removed) await deleteFromStorageByUrl(r);
      if (JSON.stringify(savedNew) !== JSON.stringify(savedOld)) {
        handleVariantChange(variantIndex, "videoUrls", savedNew);
      }

      // uploads
      let targetId = currentId || product?.id;
      if (!targetId) targetId = await ensureCurrentId();
      if (!targetId) return; // sin ID: no subir aún
      const variantId = getOrCreateVariantId(variantIndex);
      for (const item of arr) {
        if (item?.file && item.file.type?.startsWith?.("video/")) {
          const queueId = `${Date.now()}_${item.file.name}_${Math.random()
            .toString(36)
            .slice(2, 7)}`;
          // mantener mismo folder 'gallery' para compatibilidad con código previo
          const destPath = buildStoragePath({
            productId: targetId,
            section: "gallery",
            file: item.file,
            variantId,
          });
          try {
            const remoteUrl = await uploadWithRetry(
              uploadVideo,
              item.file,
              destPath,
              queueId
            );
            setFormData((prev) => {
              const variantes = [...(prev.variantes || [])];
              const curr = Array.isArray(variantes[variantIndex]?.videoUrls)
                ? variantes[variantIndex].videoUrls
                : [];
              variantes[variantIndex] = {
                ...(variantes[variantIndex] || {}),
                videoUrls: [...curr, remoteUrl],
              };
              const next = { ...prev, variantes };
              const id = currentId || product?.id;
              if (id)
                updateDoc(doc(db, "productos", id), {
                  variantes,
                  fechaActualizacion: new Date(),
                }).catch(() => {});
              return next;
            });
          } catch (e) {
            console.error("Variant video upload error", e);
          }
        }
      }
    } catch (e) {
      console.error("handleVariantVideosUFU error", e);
    }
  };

  // Cancelar una subida en curso
  const cancelUpload = (id) => {
    setUploadQueue((prev) => {
      const item = prev.find((q) => q.id === id);
      if (item?.task) {
        try {
          item.task.cancel();
        } catch {}
      }
      return prev.map((q) => (q.id === id ? { ...q, status: "canceled" } : q));
    });
  };

  // Reintentar subida fallida (vuelve a encolar con mismo target)
  const retryUpload = async (id) => {
    const item = uploadQueue.find((q) => q.id === id);
    if (!item) return;
    const file = item.file;
    const newId = `${Date.now()}_${file?.name || "file"}_${Math.random()
      .toString(36)
      .slice(2, 7)}`;
    setUploadQueue((prev) =>
      prev.map((q) =>
        q.id === id
          ? { ...q, id: newId, progress: 0, status: "uploading", task: null }
          : q
      )
    );
    const path = formData.nombre || "temp";
    try {
      if (item.type === "image") {
        const url = await uploadWithRetry(uploadImage, file, path, newId);
        if (item.target.level === "variant") {
          const idx = item.target.variantIndex;
          if (item.target.field === "imagen") {
            handleVariantChange(idx, "imagen", url);
          } else {
            const current = Array.isArray(formData.variantes[idx]?.imagenes)
              ? formData.variantes[idx].imagenes
              : [];
            handleVariantChange(idx, "imagenes", [...current, url]);
          }
        } else {
          if (item.target.field === "imagen") handleInputChange("imagen", url);
          else handleInputChange("imagenes", [...formData.imagenes, url]);
        }
      } else if (item.type === "video") {
        const url = await uploadWithRetry(uploadVideo, file, path, newId);
        if (item.target.level === "variant") {
          const idx = item.target.variantIndex;
          const current = Array.isArray(formData.variantes[idx]?.videoUrls)
            ? formData.variantes[idx].videoUrls
            : [];
          handleVariantChange(idx, "videoUrls", [...current, url]);
        } else {
          handleInputChange("videoUrls", [...(formData.videoUrls || []), url]);
        }
      }
    } catch (e) {
      setUploadQueue((prev) =>
        prev.map((q) => (q.id === newId ? { ...q, status: "error" } : q))
      );
    }
  };

  // Helpers para reordenar imágenes adicionales del producto (persistencia inmediata)
  const moveProductImage = (fromIndex, direction) => {
    setFormData((prev) => {
      const imgs = [...prev.imagenes];
      const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
      if (toIndex < 0 || toIndex >= imgs.length) return prev;
      const [m] = imgs.splice(fromIndex, 1);
      imgs.splice(toIndex, 0, m);
      const next = { ...prev, imagenes: imgs };
      const targetId = currentId || product?.id;
      if (targetId)
        updateDoc(doc(db, "productos", targetId), {
          imagenes: imgs,
          fechaActualizacion: new Date(),
        }).catch(() => {});
      return next;
    });
  };

  // Helpers para reordenar imágenes adicionales de una variante (persistencia inmediata)
  const moveVariantImage = (variantIndex, fromIndex, direction) => {
    setFormData((prev) => {
      const variantes = [...prev.variantes];
      const imgs = Array.isArray(variantes[variantIndex]?.imagenes)
        ? [...variantes[variantIndex].imagenes]
        : [];
      const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
      if (toIndex < 0 || toIndex >= imgs.length) return prev;
      const [m] = imgs.splice(fromIndex, 1);
      imgs.splice(toIndex, 0, m);
      variantes[variantIndex] = { ...variantes[variantIndex], imagenes: imgs };
      const next = { ...prev, variantes };
      const targetId = currentId || product?.id;
      if (targetId)
        updateDoc(doc(db, "productos", targetId), {
          variantes,
          fechaActualizacion: new Date(),
        }).catch(() => {});
      return next;
    });
  };

  const createNewCategory = async (categoryName) => {
    try {
      const categoryData = {
        nombre: categoryName,
        ruta: categoryName.toLowerCase().replace(/\s+/g, "-"),
        activa: true,
        fechaCreacion: new Date(),
        productCount: 0,
      };

      await setDoc(doc(db, "categorias", categoryData.ruta), categoryData);
      setCategorias((prev) => [
        ...prev,
        { id: categoryData.ruta, ...categoryData },
      ]);
      return categoryData.ruta;
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones mínimas y coherentes antes de guardar
    const errors = [];
    const nombre = String(formData.nombre || "").trim();
    if (!nombre) errors.push("El nombre del producto es obligatorio");
    // Empresa opcional: no bloquear guardado si falta
    const empresa = String(formData.empresa || "").trim();
    // Parser que soporta coma o punto y separadores de miles
    const toNumber = (val) => {
      if (typeof val === "number") return val;
      let s = String(val ?? "").trim();
      if (!s) return NaN;
      s = s.replace(/\s/g, "");
      if (s.includes(",") && /,\d{1,2}$/.test(s)) {
        // Formato tipo 1.999,99 → 1999.99
        s = s.replace(/\./g, "").replace(",", ".");
      } else {
        // Formato tipo 1,999.99 o 1999.99 → 1999.99
        s = s.replace(/,/g, "");
      }
      const n = parseFloat(s);
      return Number.isFinite(n) ? n : NaN;
    };

    const precioNum = toNumber(formData.precio);
    if (!Number.isFinite(precioNum) || precioNum < 0)
      errors.push("Precio inválido");
    const cantidadNum = parseInt(formData.cantidad);
    if (!Number.isFinite(cantidadNum) || cantidadNum < 0)
      errors.push("Cantidad inválida");
    // Categoría opcional: si se elige crear nueva, exigir nombre; si no, permitir vacío
    if (showNewCategoryInput) {
      if (!String(formData.nuevaCategoria || "").trim())
        errors.push("Escribe el nombre de la nueva categoría");
    }
    let autoUnsetOffer = false;
    if (formData.oferta) {
      const rawOferta = String(formData.precioOferta ?? "").trim();
      if (!rawOferta) {
        autoUnsetOffer = true; // no bloquear guardado
      } else {
        const ofertaNum = toNumber(rawOferta);
        if (!Number.isFinite(ofertaNum) || ofertaNum < 0) {
          autoUnsetOffer = true; // no bloquear guardado por formato
        } else if (Number.isFinite(precioNum) && ofertaNum >= precioNum) {
          autoUnsetOffer = true; // no bloquear guardado, desactivar oferta
        }
      }
    }
    // Validar categoría
    if (!formData.categoria || formData.categoria.trim() === "") {
      if (!showNewCategoryInput || !formData.nuevaCategoria || formData.nuevaCategoria.trim() === "") {
        errors.push("Debes seleccionar o crear una categoría para que el producto aparezca");
      }
    }
    
    if (errors.length) {
      alert(
        "Corrige los siguientes campos antes de guardar:\n- " +
          errors.join("\n- ")
      );
      return;
    }

    setLoading(true);

    try {
      let finalCategoryId = formData.categoria;

      // Create new category if needed
      if (showNewCategoryInput && formData.nuevaCategoria.trim()) {
        finalCategoryId = await createNewCategory(
          formData.nuevaCategoria.trim()
        );
      }

      let productData = {
        ...formData,
        categoria: finalCategoryId,
        precio: Number.isFinite(precioNum) ? precioNum : 0,
        fechaActualizacion: new Date(),
        acerca: (Array.isArray(formData.acerca) ? formData.acerca : []).filter(
          (item) => String(item || "").trim()
        ),
        etiquetas: (Array.isArray(formData.etiquetas)
          ? formData.etiquetas
          : []
        ).filter((item) => String(item || "").trim()),
        // Normalizar variantes PRESERVANDO TODOS los campos de medios
        variantes: (Array.isArray(formData.variantes)
          ? formData.variantes
          : []
        ).map((v) => {
          const cantidadSan = Number.isFinite(parseInt(v?.cantidad))
            ? parseInt(v.cantidad)
            : 0;
          const hasPrecio =
            v?.precio !== undefined &&
            v?.precio !== null &&
            String(v.precio).trim() !== "";
          const precioSan = hasPrecio ? toNumber(v.precio) || 0 : undefined;

          // IMPORTANTE: Preservar TODOS los campos de la variante sin eliminar nada
          return {
            ...v, // Mantener TODOS los campos existentes
            cantidad: cantidadSan,
            ...(hasPrecio ? { precio: precioSan } : {}),
            // Asegurar que los campos de medios estén presentes
            id:
              v?.id ||
              `var_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            imagenPrincipal: v?.imagenPrincipal || [],
            galeriaImagenes: v?.galeriaImagenes || [],
            imagen: v?.imagen || "",
            imagenes: v?.imagenes || [],
            videoUrls: v?.videoUrls || [],
          };
        }),
      };

      // Desactivar oferta si es inválida o vacía
      if (autoUnsetOffer) {
        productData.oferta = false;
        delete productData.precioOferta;
      }

      delete productData.nuevaCategoria;
      delete productData._tempVideoUrl;

      // IMPORTANTE: NO borrar campos de medios - el usuario los está editando
      // Solo limpiar campos legacy que realmente no se usan
      delete productData.media; // Legacy field

      // Asegurar que TODOS los campos de medios se incluyan explícitamente
      productData.imagenPrincipal = formData.imagenPrincipal || [];
      productData.galeriaImagenes = formData.galeriaImagenes || [];
      productData.tresArchivosExtras = formData.tresArchivosExtras || [];
      productData.videoAcercaArticulo = formData.videoAcercaArticulo || [];
      productData.imagenesExtra = formData.imagenesExtra || [];
      productData.imagen = formData.imagen || "";
      productData.imagenes = formData.imagenes || [];
      productData.videoUrls = formData.videoUrls || [];
      productData.videoUrl = formData.videoUrl || "";
      // Asociación de variante con imagen principal
      productData.varianteImagenPrincipal =
        formData.varianteImagenPrincipal || "";

      // Normalización de marca para filtros insensibles a mayúsculas
      if (productData.empresa) {
        productData.empresa = productData.empresa.trim();
        productData.empresaNorm = productData.empresa.toLowerCase();
      }

      // Determinar modo de trabajo: edición vs creación (anti-duplicados)
      // Si hay product.id o currentId o formData.id, SIEMPRE editar ese documento
      const canonicalId = product?.id || currentId || formData?.id || null;
      if (product && !product.id) {
        throw new Error(
          "Producto en edición sin ID válido. No se guardó para evitar duplicados."
        );
      }
      const isNew = !canonicalId;
      
      // Activar productos nuevos por defecto para que aparezcan inmediatamente
      if (isNew) {
        productData.activo = true;
      } else {
        productData.activo = Boolean(productData.activo);
      }
      const targetId = isNew ? `prod_${Date.now()}` : canonicalId;
      productData.id = targetId;
      // Establecer slug consistente del nombre (no obligatorio, útil para rutas y búsqueda)
      if (productData.nombre && !productData.slug) {
        productData.slug = slugify(productData.nombre);
      }
      // Propietario del producto (multi-tenant): solo al crear
      if (isNew) {
        productData.fechaCreacion = new Date();
        if (!productData.ownerUid) {
          productData.ownerUid = usuario?.uid || usuarioInfo?.uid || null;
        }
        if (!productData.ownerName) {
          productData.ownerName = (
            usuarioInfo?.displayName ||
            usuario?.email ||
            ""
          ).toString();
        }
      }
      // Usar setDoc con merge para crear o actualizar sin fallar
      await setDoc(
        doc(db, "productos", targetId),
        { ...productData, fechaActualizacion: new Date() },
        { merge: true }
      );
      if (isNew) setCurrentId(targetId);

      if (typeof onSave === "function") onSave();
      if (typeof onClose === "function") onClose();
    } catch (error) {
      console.error("Error saving product:", error);
      let msg = "Error al guardar el producto";
      if (error?.code === "permission-denied") {
        msg = "No tienes permisos para guardar este producto";
      } else if (error?.code === "network-request-failed") {
        msg = "Error de conexión. Verifica tu internet e inténtalo de nuevo";
      } else if (typeof error?.message === "string" && error.message) {
        msg = error.message;
      }
      alert(msg);
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
            {product ? "Editar Producto" : "Agregar Producto"}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {/* Información del Producto - Layout Simétrico */}
          <div className="space-y-6">
            {/* Fila 1: Información Básica (ancho completo) */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span>📝</span> Información Básica
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                      Nombre del Producto *
                    </span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) =>
                      handleInputChange("nombre", e.target.value)
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200 text-lg font-medium"
                    placeholder="Ej: iPhone 15 Pro Max"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-purple-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      Marca / Empresa
                    </span>
                  </label>

                  <select
                    value={
                      showNewBrandInput ? "__nueva__" : formData.empresa || ""
                    }
                    onChange={(e) => {
                      if (e.target.value === "__nueva__") {
                        setShowNewBrandInput(true);
                        setNewBrandName("");
                      } else {
                        setShowNewBrandInput(false);
                        handleInputChange("empresa", e.target.value);
                      }
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-all duration-200 appearance-none bg-white dark:bg-gray-700"
                  >
                    <option value="">Selecciona una marca...</option>
                    {brands.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                    <option
                      value="__nueva__"
                      className="font-semibold text-purple-600"
                    >
                      + Agregar nueva marca...
                    </option>
                  </select>

                  {showNewBrandInput && (
                    <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-2 border-purple-200 dark:border-purple-700">
                      <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
                        Nueva marca / empresa:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newBrandName}
                          onChange={(e) => setNewBrandName(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter" && newBrandName.trim()) {
                              handleInputChange("empresa", newBrandName.trim());
                              setBrands((prev) =>
                                [...prev, newBrandName.trim()].sort((a, b) =>
                                  a.localeCompare(b)
                                )
                              );
                              setShowNewBrandInput(false);
                              setNewBrandName("");
                            }
                          }}
                          className="flex-1 px-3 py-2 border-2 border-purple-300 dark:border-purple-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Ej: Apple, Samsung, Sony..."
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newBrandName.trim()) {
                              handleInputChange("empresa", newBrandName.trim());
                              setBrands((prev) =>
                                [...prev, newBrandName.trim()].sort((a, b) =>
                                  a.localeCompare(b)
                                )
                              );
                              setShowNewBrandInput(false);
                              setNewBrandName("");
                            }
                          }}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                        >
                          ✔
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowNewBrandInput(false);
                            setNewBrandName("");
                          }}
                          className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                        >
                          ✖
                        </button>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-gray-500 mt-2">
                    Selecciona una marca existente o agrega una nueva.
                  </p>
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
                      onChange={(e) =>
                        handleInputChange("precio", e.target.value)
                      }
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
                      onChange={(e) =>
                        handleInputChange(
                          "cantidad",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcion || ""}
                    onChange={(e) =>
                      handleInputChange("descripcion", e.target.value)
                    }
                    placeholder="Escribe la descripción del producto..."
                    className="w-full min-h-[140px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
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
                    value={showNewCategoryInput ? "" : formData.categoria}
                    onChange={(e) => {
                      if (e.target.value === "nueva") {
                        setShowNewCategoryInput(true);
                      } else {
                        setShowNewCategoryInput(false);
                        handleInputChange("categoria", e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar categoría</option>
                    {categorias.map((cat) => (
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
                        onChange={(e) =>
                          handleInputChange("nuevaCategoria", e.target.value)
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewCategoryInput(false);
                          handleInputChange("nuevaCategoria", "");
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
                    onChange={(e) =>
                      handleInputChange("estado", e.target.value)
                    }
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
                    onChange={(e) =>
                      handleInputChange("fechaPublicacion", e.target.value)
                    }
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
                      onChange={(e) =>
                        handleInputChange("oferta", e.target.checked)
                      }
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    En oferta
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.activo}
                      onChange={(e) =>
                        handleInputChange("activo", e.target.checked)
                      }
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
                      onChange={(e) =>
                        handleInputChange("precioOferta", e.target.value)
                      }
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
                      onChange={(e) =>
                        handleInputChange("peso", e.target.value)
                      }
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
                      onChange={(e) =>
                        handleInputChange("dimensiones", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="ej: 30x20x10 cm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Fila 2: Imágenes y Multimedia - Grid Simétrico */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span>🖼️</span> Imágenes y Multimedia
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    📷 Imagen Principal *
                  </label>
                  <UniversalFileUploader
                    files={
                      // PRIORIDAD: 1. Imagen guardada, 2. Preview temporal
                      formData.imagen && typeof formData.imagen === "string"
                        ? [
                            {
                              id: "saved-main",
                              url: formData.imagen,
                              type: "image",
                              name:
                                formData.imagen
                                  .split("/")
                                  .pop()
                                  .split("?")[0] || "imagen-principal",
                              size: 0,
                              isUploaded: true,
                            },
                          ]
                        : tempPreviews.imagen
                        ? [
                            {
                              id: "temp-main",
                              url: tempPreviews.imagen,
                              type: "image",
                              name: "imagen-principal",
                              size: 0,
                              isUploaded: false,
                            },
                          ]
                        : []
                    }
                    onFilesChange={handleMainImageUFU}
                    acceptedTypes="image/*"
                    multiple={false}
                    maxFiles={1}
                    label="Imagen Principal"
                    placeholder="Arrastra o selecciona una imagen principal"
                    allowReorder={false}
                    allowSetMain={false}
                  />

                  {/* Input de texto libre para Variante/Color de Imagen Principal */}
                  {formData.imagen && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        🎨 ¿De qué variante/color es esta imagen principal?
                      </label>
                      <input
                        type="text"
                        value={formData.varianteImagenPrincipal || ""}
                        onChange={(e) => {
                          const valor = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            varianteImagenPrincipal: valor,
                          }));
                          // Actualizar en Firestore si ya existe el producto
                          if (currentId || product?.id) {
                            safeUpdateDoc(currentId || product.id, {
                              varianteImagenPrincipal: valor,
                            }).catch((err) =>
                              console.error(
                                "Error actualizando variante de imagen principal:",
                                err
                              )
                            );
                          }
                        }}
                        placeholder="Ej: Negro, Azul, Rojo, etc. (Dejar vacío si es genérica)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        💡 Escribe el color o variante que representa esta
                        imagen. En VistaProducto será parte del selector de
                        variantes.
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    🎬 Galería (Imágenes y Videos)
                  </label>
                  <UniversalFileUploader
                    files={[
                      // SOLO mostrar archivos guardados O previews temporales, NUNCA ambos juntos
                      ...(Array.isArray(formData.imagenes) &&
                      formData.imagenes.length > 0
                        ? formData.imagenes.map((u, i) => {
                            const url = typeof u === "string" ? u : u?.url || u;
                            // Extraer nombre original del archivo de la URL
                            const fileName =
                              url.split("/").pop().split("?")[0] ||
                              `imagen-${i + 1}`;
                            return {
                              id: `saved-img-${i}`,
                              url: url,
                              type: "image",
                              name: fileName,
                              size: 0,
                              isUploaded: true,
                            };
                          })
                        : []),
                      ...(Array.isArray(formData.videoUrls) &&
                      formData.videoUrls.length > 0
                        ? formData.videoUrls.map((u, i) => {
                            const url = typeof u === "string" ? u : u?.url || u;
                            // Extraer nombre original del archivo de la URL
                            const fileName =
                              url.split("/").pop().split("?")[0] ||
                              `video-${i + 1}`;
                            return {
                              id: `saved-vid-${i}`,
                              url: url,
                              type: "video",
                              name: fileName,
                              size: 0,
                              isUploaded: true,
                            };
                          })
                        : []),
                      // Solo mostrar previews temporales si NO hay archivos guardados
                      ...((!formData.imagenes ||
                        formData.imagenes.length === 0) &&
                      Array.isArray(tempPreviews.imagenes)
                        ? tempPreviews.imagenes.map((u, i) => ({
                            id: `temp-gallery-img-${i}`,
                            url: u,
                            type: "image",
                            name:
                              u.split("/").pop().split("?")[0] ||
                              `imagen-${i + 1}`,
                            size: 0,
                            isUploaded: false,
                          }))
                        : []),
                      ...((!formData.videoUrls ||
                        formData.videoUrls.length === 0) &&
                      Array.isArray(tempPreviews.productVideos)
                        ? tempPreviews.productVideos.map((u, i) => ({
                            id: `temp-gallery-vid-${i}`,
                            url: u,
                            type: "video",
                            name:
                              u.split("/").pop().split("?")[0] ||
                              `video-${i + 1}`,
                            size: 0,
                            isUploaded: false,
                          }))
                        : []),
                    ]}
                    onFilesChange={handleGalleryUFU}
                    acceptedTypes="image/*,video/*"
                    multiple={true}
                    label="Galería (Imágenes y Videos)"
                    placeholder="Arrastra o selecciona imágenes o videos"
                    allowReorder={true}
                    allowSetMain={true}
                  />
                </div>
              </div>

              {/* Fila 3: Detalles y Extras */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span>📋</span> Detalles del Producto
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
                        onChange={(e) =>
                          handleArrayChange("acerca", index, e.target.value)
                        }
                        placeholder="Característica del producto"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem("acerca", index)}
                        className="px-3 py-2 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem("acerca")}
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
                        onChange={(e) =>
                          handleArrayChange("etiquetas", index, e.target.value)
                        }
                        placeholder="Etiqueta"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem("etiquetas", index)}
                        className="px-3 py-2 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem("etiquetas")}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Agregar etiqueta
                  </button>
                </div>
              </div>

              {/* Enhanced Variants Section */}
              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-blue-900 border-b pb-2">
                    Variantes del Producto
                  </h3>
                  {formData.variantes && formData.variantes.length > 1 && (
                    <div className="mb-4">
                      <VisualVariantSelector
                        variants={formData.variantes.map((v, idx) => ({
                          id: v.id || `var_${idx}`,
                          name: v.color || `Variante ${idx + 1}`,
                          price: v.precio,
                          stock: v.cantidad,
                          image: v.imagenPrincipal?.[0]?.url || v.imagen,
                          isSelected: selectedVariant === idx,
                        }))}
                        productMainImage={
                          formData.imagenPrincipal?.[0]?.url || formData.imagen
                        }
                        onVariantChange={handleVariantSelectionChange}
                        className="max-w-md"
                      />
                    </div>
                  )}
                </div>

                {formData.variantes.map((variant, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-6 space-y-6 bg-gray-50"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-lg text-gray-900">
                        Variante {index + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeArrayItem("variantes", index)}
                        className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>

                    {/* Campos de información - Grid de 2 columnas responsive */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Color/Tipo
                        </label>
                        <input
                          type="text"
                          value={variant.color}
                          onChange={(e) =>
                            handleVariantChange(index, "color", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Ej. Rojo, Azul, Edición Especial"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cantidad en Stock
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={variant.cantidad}
                          onChange={(e) =>
                            handleVariantChange(
                              index,
                              "cantidad",
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Precio de la variante (opcional)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={variant.precio ?? ""}
                          onChange={(e) =>
                            handleVariantChange(index, "precio", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Ej. 1999.99"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Descripción de la variante
                        </label>
                        <textarea
                          rows={2}
                          value={variant.descripcion || ""}
                          onChange={(e) =>
                            handleVariantChange(
                              index,
                              "descripcion",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Ej. Color neón, control edición especial, etc."
                        />
                      </div>
                    </div>

                    {/* Sección de Medios - MISMO diseño que la sección principal */}
                    <div className="border-t pt-4">
                      <h5 className="text-sm font-semibold text-gray-900 mb-4">
                        Imágenes de la Variante
                      </h5>

                      {/* Grid de 2 columnas - IGUAL que imagen principal y galería */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Columna 1: Imagen Principal de Variante */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                            📷 Imagen Principal de Variante
                          </label>
                          <UniversalFileUploader
                            files={[
                              ...(tempPreviews.variantes?.[index]?.imagen
                                ? [
                                    {
                                      id: `temp-var${index}-main`,
                                      url: tempPreviews.variantes[index].imagen,
                                      type: "image",
                                      name: `var${index}-imagen`,
                                      size: 0,
                                      isUploaded: false,
                                    },
                                  ]
                                : []),
                              ...(variant.imagen &&
                              typeof variant.imagen === "string"
                                ? [
                                    {
                                      id: `saved-var${index}-main`,
                                      url: variant.imagen,
                                      type: "image",
                                      name: `var${index}-imagen`,
                                      size: 0,
                                      isUploaded: true,
                                    },
                                  ]
                                : []),
                            ]}
                            onFilesChange={(files) =>
                              handleVariantMainUFU(files, index)
                            }
                            acceptedTypes="image/*"
                            multiple={false}
                            maxFiles={1}
                            label="Imagen Principal"
                            placeholder="Arrastra o selecciona una imagen"
                            allowReorder={false}
                            allowSetMain={false}
                          />
                        </div>

                        {/* Columna 2: Galería de Imágenes de Variante */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                            🎬 Galería de Imágenes
                          </label>
                          <UniversalFileUploader
                            files={[
                              ...(Array.isArray(variant.imagenes)
                                ? variant.imagenes.map((u, i) => ({
                                    id: `saved-var${index}-img-${i}`,
                                    url:
                                      typeof u === "string" ? u : u?.url || u,
                                    type: "image",
                                    name: `var${index}-img-${i + 1}`,
                                    size: 0,
                                    isUploaded: true,
                                  }))
                                : []),
                              ...(
                                tempPreviews.variantes?.[index]?.imagenes || []
                              ).map((u, i) => ({
                                id: `temp-var${index}-img-${i}`,
                                url: u,
                                type: "image",
                                name: `var${index}-img-${i + 1}`,
                                size: 0,
                                isUploaded: false,
                              })),
                            ]}
                            onFilesChange={(files) =>
                              handleVariantGalleryUFU(files, index)
                            }
                            acceptedTypes="image/*"
                            multiple={true}
                            label="Galería"
                            placeholder="Arrastra o selecciona imágenes"
                            allowReorder={true}
                            allowSetMain={true}
                          />
                        </div>
                      </div>

                      {/* Videos de la variante - Opcional, ancho completo */}
                      <div className="mt-6">
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                          🎥 Videos de la Variante (Opcional)
                        </label>
                        <UniversalFileUploader
                          files={[
                            ...(Array.isArray(variant.videoUrls)
                              ? variant.videoUrls.map((u, i) => ({
                                  id: `saved-var${index}-vid-${i}`,
                                  url: typeof u === "string" ? u : u?.url || u,
                                  type: "video",
                                  name: `video-${i + 1}`,
                                  size: 0,
                                  isUploaded: true,
                                }))
                              : []),
                            ...(
                              tempPreviews.variantes?.[index]?.videos || []
                            ).map((u, i) => ({
                              id: `temp-var${index}-video-${i}`,
                              url: u,
                              type: "video",
                              name: `video-${i + 1}`,
                              size: 0,
                              isUploaded: false,
                            })),
                          ]}
                          onFilesChange={(files) =>
                            handleVariantVideosUFU(files, index)
                          }
                          acceptedTypes="video/*"
                          multiple={true}
                          label="Videos"
                          placeholder="Arrastra o selecciona videos"
                          allowReorder={true}
                          allowSetMain={true}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => addArrayItem("variantes")}
                  className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Agregar Variante
                </button>
              </div>

              {/* 📸 Imágenes con más información del artículo */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span>📸</span> Imágenes con más información del artículo
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Imágenes que se mostrarán en la sección "Más información del
                  producto"
                </p>
                <UniversalFileUploader
                  files={[
                    ...(formData.imagenesExtra || []).map((u, i) => ({
                      id: `saved-info-${i}`,
                      url: u,
                      type: detectTypeFromUrl(u),
                      name: (
                        String(u).split("/").pop() || `info-${i + 1}`
                      ).split("?")[0],
                      size: 0,
                      isUploaded: true,
                    })),
                    ...(tempPreviews.extras || []).map((u, i) => ({
                      id: `temp-info-${i}`,
                      url: u,
                      type: "image",
                      name: `info-${i + 1}`,
                      size: 0,
                      isUploaded: false,
                    })),
                  ]}
                  onFilesChange={handleExtrasUFU}
                  acceptedTypes="image/*"
                  multiple={true}
                  label="Imágenes informativas del producto"
                  placeholder="📸 Arrastra o selecciona imágenes de alta resolución con información adicional del producto"
                  allowReorder={true}
                  allowSetMain={false}
                />
              </div>
            </div>

            {/* Formulario simple sin indicadores innecesarios */}

            {/* Botones de Acción */}
            <div className="mt-8 flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <span>Guardar Producto</span>
                )}
              </button>
            </div>
          </div>
          {/* Cierre del div space-y-6 */}

          {/* Mensaje de subida en segundo plano removido para evitar estados de carga visibles */}
        </form>
      </motion.div>

      {/* Loader animado mientras se suben archivos */}
      <AnimatePresence>
        {(uploadingImages ||
          uploadQueue?.some((q) => q.status === "uploading")) && (
          <motion.div
            className="upload-loader-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="upload-loader-container">
              <div className="loader">
                <svg width="100" height="100" viewBox="0 0 100 100">
                  <defs>
                    <mask id="clipping">
                      <polygon
                        points="0,0 100,0 100,100 0,100"
                        fill="black"
                      ></polygon>
                      <polygon
                        points="25,25 75,25 50,75"
                        fill="white"
                      ></polygon>
                      <polygon
                        points="50,25 75,75 25,75"
                        fill="white"
                      ></polygon>
                      <polygon
                        points="35,35 65,35 50,65"
                        fill="white"
                      ></polygon>
                      <polygon
                        points="35,35 65,35 50,65"
                        fill="white"
                      ></polygon>
                      <polygon
                        points="35,35 65,35 50,65"
                        fill="white"
                      ></polygon>
                      <polygon
                        points="35,35 65,35 50,65"
                        fill="white"
                      ></polygon>
                    </mask>
                  </defs>
                </svg>
                <div className="box"></div>
              </div>
              <div className="upload-loader-text">Subiendo archivos...</div>
              <div className="upload-loader-subtext">
                {uploadQueue?.filter((q) => q.status === "uploading").length ||
                  0}{" "}
                archivo(s) en progreso
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Formulario simple sin complicaciones */}
    </motion.div>
  );
};

export default ProductForm;
