import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

/**
 * Sube una imagen a Firebase Storage de forma rápida y devuelve la URL de descarga.
 * Esta función está optimizada para mostrar una vista previa inmediata mientras se sube en segundo plano.
 * 
 * @param {File} file - El archivo de imagen a subir.
 * @param {string} productId - El ID del producto para organizar la ruta.
 * @returns {Promise<string>} - URL de descarga de la imagen.
 */
export const uploadImageFast = async (file, productId) => {
  if (!file || !productId) {
    throw new Error('Se requiere un archivo y un ID de producto para la subida.');
  }

  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 9);
  const fileName = `${timestamp}_${randomId}_${file.name}`;
  const storagePath = `productos/${productId}/imagenes/${fileName}`;
  const storageRef = ref(storage, storagePath);

  try {
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error(`Error subiendo imagen ${file.name}:`, error);
    throw new Error(`No se pudo subir la imagen ${file.name}.`);
  }
};

/**
 * Sube un video a Firebase Storage de forma rápida y devuelve la URL de descarga.
 * Esta función está optimizada para mostrar una vista previa inmediata mientras se sube en segundo plano.
 * 
 * @param {File} file - El archivo de video a subir.
 * @param {string} productId - El ID del producto para organizar la ruta.
 * @returns {Promise<string>} - URL de descarga del video.
 */
export const uploadVideoFast = async (file, productId) => {
  if (!file || !productId) {
    throw new Error('Se requiere un archivo y un ID de producto para la subida.');
  }

  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 9);
  const fileName = `${timestamp}_${randomId}_${file.name}`;
  const storagePath = `productos/${productId}/videos/${fileName}`;
  const storageRef = ref(storage, storagePath);

  try {
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error(`Error subiendo video ${file.name}:`, error);
    throw new Error(`No se pudo subir el video ${file.name}.`);
  }
};

/**
 * Sube cualquier tipo de archivo a Firebase Storage y devuelve la URL de descarga.
 * Esta función está optimizada para mostrar una vista previa inmediata mientras se sube en segundo plano.
 * 
 * @param {File} file - El archivo a subir.
 * @param {string} productId - El ID del producto para organizar la ruta.
 * @param {string} fileType - El tipo de archivo ('image', 'video', 'document').
 * @returns {Promise<{url: string, type: string, name: string}>} - Objeto con la URL final, tipo y nombre.
 */
export const uploadFileFast = async (file, productId, fileType = null) => {
  if (!file || !productId) {
    throw new Error('Se requiere un archivo y un ID de producto para la subida.');
  }

  // Determinar el tipo de archivo si no se proporciona
  const getFileType = (fileType) => {
    if (fileType) return fileType;
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    return 'document';
  };

  const type = getFileType(fileType);
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 9);
  const fileName = `${timestamp}_${randomId}_${file.name}`;
  const folder = type === 'image' ? 'imagenes' : type === 'video' ? 'videos' : 'documentos';
  const storagePath = `productos/${productId}/${folder}/${fileName}`;
  const storageRef = ref(storage, storagePath);

  try {
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    return {
      url: downloadURL,
      type,
      name: file.name,
    };
  } catch (error) {
    console.error(`Error subiendo archivo ${file.name}:`, error);
    throw new Error(`No se pudo subir el archivo ${file.name}.`);
  }
};
