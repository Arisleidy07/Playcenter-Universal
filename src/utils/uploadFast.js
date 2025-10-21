// ✅ ACTUALIZADO PARA CLOUDINARY - Sin problemas de CORS
import { uploadToCloudinary } from '../cloudinary';

/**
 * Subida rápida de imagen a Cloudinary con preview instantáneo
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

  try {
    // Subir a Cloudinary con folder personalizado
    const folder = `products/${productId}/images`;
    const url = await uploadToCloudinary(file, folder);
    return url;
  } catch (error) {
    console.error(`Error subiendo imagen ${file.name}:`, error);
    throw new Error(`No se pudo subir la imagen ${file.name}.`);
  }
};

/**
 * Sube un video a Cloudinary de forma rápida y devuelve la URL de descarga.
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

  try {
    // Subir a Cloudinary con folder personalizado
    const folder = `products/${productId}/videos`;
    const url = await uploadToCloudinary(file, folder);
    return url;
  } catch (error) {
    console.error(`Error subiendo video ${file.name}:`, error);
    throw new Error(`No se pudo subir el video ${file.name}.`);
  }
};

/**
 * Sube cualquier tipo de archivo a Cloudinary y devuelve la URL de descarga.
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
  const folderName = type === 'image' ? 'images' : type === 'video' ? 'videos' : 'documents';
  const folder = `products/${productId}/${folderName}`;

  try {
    const url = await uploadToCloudinary(file, folder);

    return {
      url,
      type,
      name: file.name,
    };
  } catch (error) {
    console.error(`Error subiendo archivo ${file.name}:`, error);
    throw new Error(`No se pudo subir el archivo ${file.name}.`);
  }
};
