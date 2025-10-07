import { collection, getDocs, doc, updateDoc, setDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Sistema de reparación automática para problemas comunes
 */
export class SystemRepair {
  constructor() {
    this.repairLog = [];
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    this.repairLog.push(logEntry);
    console.log(`🔧 [SystemRepair] ${message}`);
  }

  /**
   * Ejecuta todas las reparaciones automáticas
   */
  async runAllRepairs() {
    this.log('Iniciando reparación automática del sistema...');
    
    try {
      await this.repairProductSlugs();
      await this.repairProductMedia();
      await this.repairCategoryReferences();
      await this.repairProductStatus();
      
      this.log('✅ Reparación automática completada exitosamente');
      return { success: true, log: this.repairLog };
    } catch (error) {
      this.log(`❌ Error durante la reparación: ${error.message}`);
      return { success: false, error: error.message, log: this.repairLog };
    }
  }

  /**
   * Repara productos sin slug
   */
  async repairProductSlugs() {
    this.log('Reparando productos sin slug...');
    
    const productsQuery = query(collection(db, 'productos'));
    const productsSnap = await getDocs(productsQuery);
    let repairedCount = 0;

    for (const docSnap of productsSnap.docs) {
      const product = docSnap.data();
      
      if (!product.slug && product.nombre) {
        const slug = this.generateSlug(product.nombre);
        await updateDoc(doc(db, 'productos', docSnap.id), { slug });
        this.log(`Agregado slug "${slug}" al producto: ${product.nombre}`);
        repairedCount++;
      }
    }

    this.log(`✅ Reparados ${repairedCount} productos sin slug`);
  }

  /**
   * Repara estructura de medios en productos
   */
  async repairProductMedia() {
    this.log('Reparando estructura de medios en productos...');
    
    const productsQuery = query(collection(db, 'productos'));
    const productsSnap = await getDocs(productsQuery);
    let repairedCount = 0;

    for (const docSnap of productsSnap.docs) {
      const product = docSnap.data();
      let needsUpdate = false;
      const updates = {};

      // Convertir formato legacy a nuevo formato
      if (!product.media || product.media.length === 0) {
        const media = [];
        
        // Imagen principal
        if (product.imagen) {
          media.push({
            url: product.imagen,
            type: 'image',
            name: 'Imagen principal'
          });
        }

        // Imágenes adicionales
        if (Array.isArray(product.imagenes)) {
          product.imagenes.forEach((img, index) => {
            if (img && img !== product.imagen) {
              media.push({
                url: img,
                type: 'image',
                name: `Imagen ${index + 1}`
              });
            }
          });
        }

        // Videos
        if (product.video) {
          media.push({
            url: product.video,
            type: 'video',
            name: 'Video del producto'
          });
        }

        if (Array.isArray(product.videos)) {
          product.videos.forEach((vid, index) => {
            media.push({
              url: vid,
              type: 'video',
              name: `Video ${index + 1}`
            });
          });
        }

        if (media.length > 0) {
          updates.media = media;
          needsUpdate = true;
        }
      }

      // Asegurar que el producto esté activo por defecto
      if (product.activo === undefined) {
        updates.activo = true;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await updateDoc(doc(db, 'productos', docSnap.id), updates);
        this.log(`Actualizada estructura de medios para: ${product.nombre}`);
        repairedCount++;
      }
    }

    this.log(`✅ Reparados ${repairedCount} productos con problemas de medios`);
  }

  /**
   * Repara referencias de categorías
   */
  async repairCategoryReferences() {
    this.log('Verificando referencias de categorías...');
    
    // Obtener todas las categorías
    const categoriesQuery = query(collection(db, 'categorias'));
    const categoriesSnap = await getDocs(categoriesQuery);
    const validCategoryIds = categoriesSnap.docs.map(doc => doc.id);

    // Verificar productos
    const productsQuery = query(collection(db, 'productos'));
    const productsSnap = await getDocs(productsQuery);
    let repairedCount = 0;

    for (const docSnap of productsSnap.docs) {
      const product = docSnap.data();
      
      if (product.categoria && !validCategoryIds.includes(product.categoria)) {
        // Categoría inválida, asignar una por defecto
        const defaultCategory = validCategoryIds[0];
        if (defaultCategory) {
          await updateDoc(doc(db, 'productos', docSnap.id), { 
            categoria: defaultCategory 
          });
          this.log(`Corregida categoría inválida para: ${product.nombre}`);
          repairedCount++;
        }
      }
    }

    this.log(`✅ Reparadas ${repairedCount} referencias de categorías`);
  }

  /**
   * Repara estado de productos
   */
  async repairProductStatus() {
    this.log('Verificando estado de productos...');
    
    const productsQuery = query(collection(db, 'productos'));
    const productsSnap = await getDocs(productsQuery);
    let repairedCount = 0;

    for (const docSnap of productsSnap.docs) {
      const product = docSnap.data();
      const updates = {};
      let needsUpdate = false;

      // Asegurar campos requeridos
      if (!product.fechaCreacion) {
        updates.fechaCreacion = new Date();
        needsUpdate = true;
      }

      if (!product.fechaActualizacion) {
        updates.fechaActualizacion = new Date();
        needsUpdate = true;
      }

      if (product.precio === undefined || product.precio === null) {
        updates.precio = 0;
        needsUpdate = true;
      }

      if (product.cantidad === undefined || product.cantidad === null) {
        updates.cantidad = 0;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await updateDoc(doc(db, 'productos', docSnap.id), updates);
        this.log(`Corregidos campos faltantes para: ${product.nombre}`);
        repairedCount++;
      }
    }

    this.log(`✅ Reparados ${repairedCount} productos con campos faltantes`);
  }

  /**
   * Genera un slug a partir de un nombre
   */
  generateSlug(nombre) {
    return nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
      .trim()
      .replace(/\s+/g, '-') // Espacios a guiones
      .replace(/-+/g, '-'); // Múltiples guiones a uno solo
  }

  /**
   * Obtiene el log de reparaciones
   */
  getRepairLog() {
    return this.repairLog;
  }

  /**
   * Limpia el log de reparaciones
   */
  clearLog() {
    this.repairLog = [];
  }
}

// Instancia global para uso fácil
export const systemRepair = new SystemRepair();

// Funciones de utilidad para uso directo
export const runSystemRepair = () => systemRepair.runAllRepairs();
export const getRepairLog = () => systemRepair.getRepairLog();
export const clearRepairLog = () => systemRepair.clearLog();
