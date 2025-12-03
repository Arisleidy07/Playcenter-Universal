// Configuración de Cloudinary
export const CLOUDINARY_CONFIG = {
  cloudName: 'dprojkgqf',
  apiKey: '836284757175835',
  // NO incluimos el API Secret en el frontend por seguridad
  uploadPreset: 'playcenter_unsigned', // Lo crearemos en el siguiente paso
};

// URL base para upload (unsigned)
export const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/upload`;

// Función para subir archivos a Cloudinary
export const uploadToCloudinary = async (file, folder = 'products') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  formData.append('folder', folder);

  try {
    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Error al subir archivo a Cloudinary');
    }

    const data = await response.json();
    return data.secure_url; // URL del archivo subido
  } catch (error) {
    // console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

// Función para subir múltiples archivos
export const uploadMultipleToCloudinary = async (files, folder = 'products') => {
  const uploadPromises = Array.from(files).map(file => uploadToCloudinary(file, folder));
  return Promise.all(uploadPromises);
};

// Función para obtener URL optimizada
export const getOptimizedImageUrl = (url, width = 800, quality = 'auto') => {
  if (!url || !url.includes('cloudinary')) return url;
  
  // Insertar transformaciones en la URL
  const parts = url.split('/upload/');
  if (parts.length === 2) {
    return `${parts[0]}/upload/w_${width},q_${quality},f_auto/${parts[1]}`;
  }
  return url;
};
