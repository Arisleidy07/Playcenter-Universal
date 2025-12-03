// ✅ ACTUALIZADO PARA CLOUDINARY
import { uploadToCloudinary } from '../cloudinary';

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
  const cloudinaryFolder = `products/${productId}/${fileType}s`;

  try {
    const downloadURL = await uploadToCloudinary(file, cloudinaryFolder);

    return {
      url: downloadURL,
      type: fileType,
      name: file.name,
    };
  } catch (error) {
    // console.error(`Error subiendo archivo ${file.name}:`, error);
    throw new Error(`No se pudo subir el archivo ${file.name}.`);
  }
};
