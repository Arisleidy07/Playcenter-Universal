import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "../firebase";
import { v4 as uuidv4 } from "uuid";

/**
 * Validar archivo de imagen
 * @param {File} file - Archivo a validar
 */
export function validateImageFile(file) {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
  
  if (!file) {
    throw new Error("No se seleccionó ningún archivo");
  }
  
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Formato no válido. Solo se permiten imágenes (JPG, PNG, WEBP, GIF)");
  }
  
  if (file.size > MAX_SIZE) {
    throw new Error("La imagen es muy grande. Máximo 5MB");
  }
  
  return true;
}

/**
 * Subir foto de perfil a Firebase Storage
 * @param {File} file - Archivo de imagen
 * @param {string} userId - ID del usuario
 * @param {Function} onProgress - Callback para progreso (opcional)
 */
export async function uploadProfilePicture(file, userId, onProgress) {
  try {
    // Validar archivo
    validateImageFile(file);
    
    // Crear nombre único con timestamp y UUID
    const timestamp = Date.now();
    const uniqueId = uuidv4().split("-")[0]; // Solo primer segmento del UUID
    const extension = file.name.split(".").pop();
    const filename = `${userId}/${timestamp}_${uniqueId}.${extension}`;
    
    // Crear referencia en Storage
    const storageRef = ref(storage, `profile_pics/${filename}`);
    
    // Subir archivo con progreso
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Calcular progreso
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(Math.round(progress));
          }
        },
        (error) => {
          console.error("Error al subir imagen:", error);
          
          let errorMessage = "Error al subir la imagen";
          switch (error.code) {
            case "storage/unauthorized":
              errorMessage = "No tienes permisos para subir archivos";
              break;
            case "storage/canceled":
              errorMessage = "Subida cancelada";
              break;
            case "storage/quota-exceeded":
              errorMessage = "Se excedió el límite de almacenamiento";
              break;
            default:
              errorMessage = error.message;
          }
          
          reject(new Error(errorMessage));
        },
        async () => {
          // Obtener URL de descarga
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              url: downloadURL,
              path: filename,
              size: file.size,
              type: file.type,
            });
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Eliminar foto de perfil de Firebase Storage
 * @param {string} photoPath - Ruta del archivo en Storage
 */
export async function deleteProfilePicture(photoPath) {
  try {
    if (!photoPath) return;
    
    // Si es URL completa, extraer el path
    let path = photoPath;
    if (photoPath.includes("firebase")) {
      const url = new URL(photoPath);
      const pathMatch = url.pathname.match(/profile_pics%2F(.+?)(\?|$)/);
      if (pathMatch) {
        path = decodeURIComponent(pathMatch[1]);
      }
    }
    
    const fileRef = ref(storage, `profile_pics/${path}`);
    await deleteObject(fileRef);
    
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar imagen:", error);
    // No lanzar error si el archivo no existe
    if (error.code === "storage/object-not-found") {
      return { success: true, message: "El archivo ya no existe" };
    }
    throw error;
  }
}

/**
 * Crear vista previa de imagen antes de subir
 * @param {File} file - Archivo de imagen
 */
export function createImagePreview(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

/**
 * Comprimir imagen antes de subir (opcional)
 * @param {File} file - Archivo de imagen
 * @param {number} maxWidth - Ancho máximo (default: 800px)
 * @param {number} quality - Calidad (0-1, default: 0.8)
 */
export function compressImage(file, maxWidth = 800, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        
        // Redimensionar si es necesario
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error("Error al comprimir imagen"));
            }
          },
          file.type,
          quality
        );
      };
      
      img.onerror = () => reject(new Error("Error al cargar imagen"));
    };
    
    reader.onerror = () => reject(new Error("Error al leer archivo"));
  });
}
