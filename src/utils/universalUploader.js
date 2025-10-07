import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

/**
 * Subida universal de archivos a Firebase Storage
 * Maneja imágenes, videos y documentos
 */
export const uploadFileUniversal = async (file, productId, fileType = 'media') => {
  try {
    // Validar archivo
    if (!file || file.size === 0) {
      throw new Error('Archivo inválido');
    }

    // Determinar tipo y límites
    let maxSize, folder;
    if (file.type.startsWith('image/')) {
      maxSize = 10 * 1024 * 1024; // 10MB para imágenes
      folder = 'imagenes';
    } else if (file.type.startsWith('video/')) {
      maxSize = 100 * 1024 * 1024; // 100MB para videos
      folder = 'videos';
    } else {
      maxSize = 50 * 1024 * 1024; // 50MB para documentos
      folder = 'documentos';
    }

    // Validar tamaño
    if (file.size > maxSize) {
      throw new Error(`Archivo muy grande (máximo ${Math.round(maxSize / 1024 / 1024)}MB)`);
    }

    // Crear nombre único
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop() || 'bin';
    const fileName = `${timestamp}_${randomId}.${extension}`;

    // Crear referencia
    const fileRef = ref(storage, `productos/${productId}/${folder}/${fileName}`);

    // Subir archivo
    console.log(`🚀 Subiendo ${file.type} (${(file.size / 1024 / 1024).toFixed(2)}MB) a ${folder}/`);
    const snapshot = await uploadBytes(fileRef, file);

    // Obtener URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    if (!downloadURL) {
      throw new Error('No se pudo obtener la URL de descarga');
    }

    console.log(`✅ Archivo subido exitosamente: ${downloadURL}`);
    return {
      url: downloadURL,
      type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'document',
      name: file.name,
      size: file.size,
      path: `productos/${productId}/${folder}/${fileName}`
    };
  } catch (error) {
    console.error('❌ Error en uploadFileUniversal:', error);
    throw error;
  }
};

/**
 * Subida múltiple de archivos con progreso
 */
export const uploadMultipleFiles = async (files, productId, onProgress = null) => {
  const results = [];
  const errors = [];

  for (let i = 0; i < files.length; i++) {
    try {
      if (onProgress) {
        onProgress({
          current: i + 1,
          total: files.length,
          fileName: files[i].name,
          status: 'uploading'
        });
      }

      const result = await uploadFileUniversal(files[i], productId);
      results.push(result);

      if (onProgress) {
        onProgress({
          current: i + 1,
          total: files.length,
          fileName: files[i].name,
          status: 'completed'
        });
      }
    } catch (error) {
      console.error(`Error subiendo ${files[i].name}:`, error);
      errors.push({
        file: files[i].name,
        error: error.message
      });

      if (onProgress) {
        onProgress({
          current: i + 1,
          total: files.length,
          fileName: files[i].name,
          status: 'error',
          error: error.message
        });
      }
    }
  }

  return { results, errors };
};

/**
 * Función legacy para mantener compatibilidad
 */
export const uploadImageFast = async (file, productId) => {
  const result = await uploadFileUniversal(file, productId);
  return result.url;
};

/**
 * Función legacy para mantener compatibilidad
 */
export const uploadVideoFast = async (file, productId) => {
  const result = await uploadFileUniversal(file, productId);
  return result.url;
};

/**
 * Convertir archivos del uploader a formato de base de datos
 */
export const processUploaderFiles = async (uploaderFiles, productId, onProgress = null) => {
  const images = [];
  const videos = [];
  const documents = [];

  // Separar archivos por tipo
  const filesToUpload = uploaderFiles.filter(f => f.isTemp && f.file);
  const alreadyUploaded = uploaderFiles.filter(f => !f.isTemp);

  // Procesar archivos ya subidos
  alreadyUploaded.forEach(f => {
    if (f.type === 'image') images.push(f.url);
    else if (f.type === 'video') videos.push(f.url);
    else documents.push({ url: f.url, name: f.name });
  });

  // Subir archivos nuevos
  if (filesToUpload.length > 0) {
    const { results, errors } = await uploadMultipleFiles(
      filesToUpload.map(f => f.file),
      productId,
      onProgress
    );

    // Procesar resultados
    results.forEach(result => {
      if (result.type === 'image') images.push(result.url);
      else if (result.type === 'video') videos.push(result.url);
      else documents.push({ url: result.url, name: result.name });
    });

    // Reportar errores
    if (errors.length > 0) {
      console.warn('Errores en subida:', errors);
      const errorMessage = errors.map(e => `${e.file}: ${e.error}`).join('\n');
      throw new Error(`Errores en algunos archivos:\n${errorMessage}`);
    }
  }

  return {
    images,
    videos,
    documents,
    mainImage: images[0] || null
  };
};
