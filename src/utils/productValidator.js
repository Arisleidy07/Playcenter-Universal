import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Valida la estructura de un producto
 */
export const validateProductStructure = (product) => {
  const errors = [];
  
  // Campos requeridos
  if (!product.nombre || typeof product.nombre !== 'string') {
    errors.push('Nombre es requerido y debe ser texto');
  }
  
  if (!product.categoria || typeof product.categoria !== 'string') {
    errors.push('Categoría es requerida');
  }
  
  if (product.precio === undefined || isNaN(Number(product.precio))) {
    errors.push('Precio debe ser un número válido');
  }
  
  if (product.activo === undefined || typeof product.activo !== 'boolean') {
    errors.push('Campo activo debe ser boolean');
  }
  
  // Validar arrays
  if (product.imagenes && !Array.isArray(product.imagenes)) {
    errors.push('Imagenes debe ser un array');
  }
  
  if (product.videoUrls && !Array.isArray(product.videoUrls)) {
    errors.push('VideoUrls debe ser un array');
  }
  
  if (product.variantes && !Array.isArray(product.variantes)) {
    errors.push('Variantes debe ser un array');
  }
  
  if (product.acerca && !Array.isArray(product.acerca)) {
    errors.push('Acerca debe ser un array');
  }
  
  if (product.etiquetas && !Array.isArray(product.etiquetas)) {
    errors.push('Etiquetas debe ser un array');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Repara un producto con estructura incorrecta
 */
export const repairProduct = (product) => {
  const repaired = { ...product };
  
  // Asegurar campos básicos
  repaired.nombre = repaired.nombre || '';
  repaired.descripcion = repaired.descripcion || '';
  repaired.empresa = repaired.empresa || '';
  repaired.precio = Number(repaired.precio) || 0;
  repaired.cantidad = Number(repaired.cantidad) || 0;
  repaired.activo = Boolean(repaired.activo);
  
  // Asegurar arrays
  repaired.imagenes = Array.isArray(repaired.imagenes) ? repaired.imagenes : [];
  repaired.videoUrls = Array.isArray(repaired.videoUrls) ? repaired.videoUrls : [];
  repaired.variantes = Array.isArray(repaired.variantes) ? repaired.variantes : [];
  repaired.acerca = Array.isArray(repaired.acerca) ? repaired.acerca : [];
  repaired.etiquetas = Array.isArray(repaired.etiquetas) ? repaired.etiquetas : [];
  repaired.documentos = Array.isArray(repaired.documentos) ? repaired.documentos : [];
  
  // Asegurar fechas
  if (!repaired.fechaCreacion) {
    repaired.fechaCreacion = new Date();
  }
  repaired.fechaActualizacion = new Date();
  
  // Limpiar campos problemáticos
  delete repaired.mediaFiles;
  delete repaired.nuevaCategoria;
  delete repaired._tempVideoUrl;
  
  return repaired;
};

/**
 * Verifica y repara un producto específico
 */
export const verifyAndRepairProduct = async (productId) => {
  try {
    // console.log(`🔍 Verificando producto: ${productId}`);
    
    const productRef = doc(db, 'productos', productId);
    const productSnap = await getDoc(productRef);
    
    if (!productSnap.exists()) {
      throw new Error('Producto no encontrado');
    }
    
    const product = { id: productSnap.id, ...productSnap.data() };
    const validation = validateProductStructure(product);
    
    if (!validation.isValid) {
      // console.log(`⚠️ Producto corrupto encontrado:`, validation.errors);
      
      // Reparar producto
      const repairedProduct = repairProduct(product);
      
      // Actualizar en base de datos
      await updateDoc(productRef, repairedProduct);
      
      // console.log(`✅ Producto reparado exitosamente`);
      return { success: true, repaired: true, product: repairedProduct };
    }
    
    // console.log(`✅ Producto válido`);
    return { success: true, repaired: false, product };
    
  } catch (error) {
    // console.error(`❌ Error verificando producto ${productId}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Busca y repara productos corruptos en lote
 */
export const repairCorruptedProducts = async (products) => {
  const results = {
    total: products.length,
    repaired: 0,
    errors: 0,
    details: []
  };
  
  for (const product of products) {
    try {
      const result = await verifyAndRepairProduct(product.id);
      
      if (result.success) {
        if (result.repaired) {
          results.repaired++;
        }
        results.details.push({
          id: product.id,
          nombre: product.nombre,
          status: result.repaired ? 'repaired' : 'valid'
        });
      } else {
        results.errors++;
        results.details.push({
          id: product.id,
          nombre: product.nombre,
          status: 'error',
          error: result.error
        });
      }
    } catch (error) {
      results.errors++;
      results.details.push({
        id: product.id,
        nombre: product.nombre,
        status: 'error',
        error: error.message
      });
    }
  }
  
  return results;
};

/**
 * Elimina un producto corrupto que no se puede reparar
 */
export const deleteCorruptedProduct = async (productId) => {
  try {
    // console.log(`🗑️ Eliminando producto corrupto: ${productId}`);
    
    await deleteDoc(doc(db, 'productos', productId));
    
    // console.log(`✅ Producto corrupto eliminado`);
    return { success: true };
    
  } catch (error) {
    // console.error(`❌ Error eliminando producto corrupto:`, error);
    return { success: false, error: error.message };
  }
};
