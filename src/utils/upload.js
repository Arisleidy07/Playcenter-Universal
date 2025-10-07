import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

/**
 * Sube un archivo a Firebase Storage y devuelve la URL de descarga.
 * @param {File} file - El archivo a subir.
 * @param {string} productId - El ID del producto para organizar la ruta.
 * @returns {Promise<{url: string, type: string, name: string}>} - Objeto con la URL final, tipo y nombre.
 */
export const uploadFile = async (file, productId) => {
  if (!file || !productId) {
    throw new Error('Se requiere un archivo y un ID de producto para la subida.');
  }

  const getFileType = (fileType) => {
    if (fileType.startsWith('image/')) return 'image';
    if (fileType.startsWith('video/')) return 'video';
    return 'document';
  };

  const fileType = getFileType(file.type);
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 9);
  const fileName = `${timestamp}_${randomId}_${file.name}`;
  const storagePath = `productos/${productId}/${fileType}s/${fileName}`;
  const storageRef = ref(storage, storagePath);

  try {
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    return {
      url: downloadURL,
      type: fileType,
      name: file.name,
    };
  } catch (error) {
    console.error(`Error subiendo archivo ${file.name}:`, error);
    throw new Error(`No se pudo subir el archivo ${file.name}.`);
  }
};
