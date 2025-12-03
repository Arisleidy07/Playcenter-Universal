/**
 * Utilidad para gestionar productos y categorías fantasma
 * Los fantasmas son aquellos que aparecen en el caché de Firestore
 * pero que no existen realmente en la base de datos
 */

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const PHANTOM_PRODUCTS_KEY = 'phantomProducts';
const PHANTOM_CATEGORIES_KEY = 'phantomCategories';

/**
 * Obtiene la lista de productos fantasma del localStorage
 */
export const getPhantomProducts = () => {
  try {
    const phantoms = localStorage.getItem(PHANTOM_PRODUCTS_KEY);
    return phantoms ? JSON.parse(phantoms) : [];
  } catch (error) {
    // console.error('Error al leer productos fantasma:', error);
    return [];
  }
};

/**
 * Agrega un producto a la lista de fantasmas
 */
export const addPhantomProduct = (productId) => {
  try {
    const phantoms = getPhantomProducts();
    if (!phantoms.includes(productId)) {
      phantoms.push(productId);
      localStorage.setItem(PHANTOM_PRODUCTS_KEY, JSON.stringify(phantoms));
      
      // Disparar evento para actualizar otros componentes
      window.dispatchEvent(new StorageEvent('storage', {
        key: PHANTOM_PRODUCTS_KEY,
        newValue: JSON.stringify(phantoms),
        url: window.location.href
      }));
      
      // console.log(`✅ Producto ${productId} agregado a fantasmas. Total: ${phantoms.length}`);
      return true;
    }
    return false;
  } catch (error) {
    // console.error('Error al agregar producto fantasma:', error);
    return false;
  }
};

/**
 * Elimina un producto de la lista de fantasmas
 */
export const removePhantomProduct = (productId) => {
  try {
    const phantoms = getPhantomProducts();
    const filtered = phantoms.filter(id => id !== productId);
    
    if (filtered.length !== phantoms.length) {
      localStorage.setItem(PHANTOM_PRODUCTS_KEY, JSON.stringify(filtered));
      
      // Disparar evento para actualizar otros componentes
      window.dispatchEvent(new StorageEvent('storage', {
        key: PHANTOM_PRODUCTS_KEY,
        newValue: JSON.stringify(filtered),
        url: window.location.href
      }));
      
      // console.log(`✅ Producto ${productId} removido de fantasmas. Total: ${filtered.length}`);
      return true;
    }
    return false;
  } catch (error) {
    // console.error('Error al remover producto fantasma:', error);
    return false;
  }
};

/**
 * Limpia todos los productos fantasma
 */
export const clearAllPhantomProducts = () => {
  try {
    const phantoms = getPhantomProducts();
    const count = phantoms.length;
    
    localStorage.setItem(PHANTOM_PRODUCTS_KEY, JSON.stringify([]));
    
    // Disparar evento para actualizar otros componentes
    window.dispatchEvent(new StorageEvent('storage', {
      key: PHANTOM_PRODUCTS_KEY,
      newValue: JSON.stringify([]),
      url: window.location.href
    }));
    
    // console.log(`✅ ${count} productos fantasma limpiados`);
    return count;
  } catch (error) {
    // console.error('Error al limpiar productos fantasma:', error);
    return 0;
  }
};

/**
 * Verifica si un producto existe realmente en Firebase
 * y lo marca como fantasma si no existe
 */
export const verifyProductExists = async (productId) => {
  try {
    const docRef = doc(db, 'productos', productId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      // console.log(`🚨 Producto ${productId} no existe en Firebase - marcando como fantasma`);
      addPhantomProduct(productId);
      return false;
    }
    
    return true;
  } catch (error) {
    // console.error(`Error verificando producto ${productId}:`, error);
    return false;
  }
};

/**
 * Verifica todos los productos fantasma y elimina los que ya existen en Firebase
 * (útil si alguien volvió a crear un producto con el mismo ID)
 */
export const cleanupPhantomProducts = async () => {
  try {
    const phantoms = getPhantomProducts();
    // console.log(`🧹 Limpiando ${phantoms.length} productos fantasma...`);
    
    const stillPhantoms = [];
    const recovered = [];
    
    for (const productId of phantoms) {
      const exists = await verifyProductExists(productId);
      if (exists) {
        recovered.push(productId);
        // console.log(`✅ Producto ${productId} recuperado (ya no es fantasma)`);
      } else {
        stillPhantoms.push(productId);
      }
    }
    
    // Actualizar lista con solo los que siguen siendo fantasmas
    localStorage.setItem(PHANTOM_PRODUCTS_KEY, JSON.stringify(stillPhantoms));
    
    // Disparar evento para actualizar otros componentes
    window.dispatchEvent(new StorageEvent('storage', {
      key: PHANTOM_PRODUCTS_KEY,
      newValue: JSON.stringify(stillPhantoms),
      url: window.location.href
    }));
    
    // console.log(`🎉 Limpieza completada: ${recovered.length} recuperados, ${stillPhantoms.length} siguen siendo fantasmas`);
    
    return {
      total: phantoms.length,
      recovered: recovered.length,
      stillPhantoms: stillPhantoms.length
    };
  } catch (error) {
    // console.error('Error durante limpieza de fantasmas:', error);
    return null;
  }
};

/**
 * Verifica si un producto es fantasma
 */
export const isPhantomProduct = (productId) => {
  const phantoms = getPhantomProducts();
  return phantoms.includes(productId);
};

// ==================== FUNCIONES PARA CATEGORÍAS ====================

/**
 * Obtiene la lista de categorías fantasma del localStorage
 */
export const getPhantomCategories = () => {
  try {
    const phantoms = localStorage.getItem(PHANTOM_CATEGORIES_KEY);
    return phantoms ? JSON.parse(phantoms) : [];
  } catch (error) {
    // console.error('Error al leer categorías fantasma:', error);
    return [];
  }
};

/**
 * Agrega una categoría a la lista de fantasmas
 */
export const addPhantomCategory = (categoryId) => {
  try {
    const phantoms = getPhantomCategories();
    if (!phantoms.includes(categoryId)) {
      phantoms.push(categoryId);
      localStorage.setItem(PHANTOM_CATEGORIES_KEY, JSON.stringify(phantoms));
      
      // Disparar evento para actualizar otros componentes
      window.dispatchEvent(new StorageEvent('storage', {
        key: PHANTOM_CATEGORIES_KEY,
        newValue: JSON.stringify(phantoms),
        url: window.location.href
      }));
      
      // console.log(`✅ Categoría ${categoryId} agregada a fantasmas. Total: ${phantoms.length}`);
      return true;
    }
    return false;
  } catch (error) {
    // console.error('Error al agregar categoría fantasma:', error);
    return false;
  }
};

/**
 * Elimina una categoría de la lista de fantasmas
 */
export const removePhantomCategory = (categoryId) => {
  try {
    const phantoms = getPhantomCategories();
    const filtered = phantoms.filter(id => id !== categoryId);
    
    if (filtered.length !== phantoms.length) {
      localStorage.setItem(PHANTOM_CATEGORIES_KEY, JSON.stringify(filtered));
      
      // Disparar evento para actualizar otros componentes
      window.dispatchEvent(new StorageEvent('storage', {
        key: PHANTOM_CATEGORIES_KEY,
        newValue: JSON.stringify(filtered),
        url: window.location.href
      }));
      
      // console.log(`✅ Categoría ${categoryId} removida de fantasmas. Total: ${filtered.length}`);
      return true;
    }
    return false;
  } catch (error) {
    // console.error('Error al remover categoría fantasma:', error);
    return false;
  }
};

/**
 * Limpia todas las categorías fantasma
 */
export const clearAllPhantomCategories = () => {
  try {
    const phantoms = getPhantomCategories();
    const count = phantoms.length;
    
    localStorage.setItem(PHANTOM_CATEGORIES_KEY, JSON.stringify([]));
    
    // Disparar evento para actualizar otros componentes
    window.dispatchEvent(new StorageEvent('storage', {
      key: PHANTOM_CATEGORIES_KEY,
      newValue: JSON.stringify([]),
      url: window.location.href
    }));
    
    // console.log(`✅ ${count} categorías fantasma limpiadas`);
    return count;
  } catch (error) {
    // console.error('Error al limpiar categorías fantasma:', error);
    return 0;
  }
};

/**
 * Verifica si una categoría existe realmente en Firebase
 * y la marca como fantasma si no existe
 */
export const verifyCategoryExists = async (categoryId) => {
  try {
    const docRef = doc(db, 'categorias', categoryId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      // console.log(`🚨 Categoría ${categoryId} no existe en Firebase - marcando como fantasma`);
      addPhantomCategory(categoryId);
      return false;
    }
    
    return true;
  } catch (error) {
    // console.error(`Error verificando categoría ${categoryId}:`, error);
    return false;
  }
};

/**
 * Verifica todas las categorías fantasma y elimina las que ya existen en Firebase
 */
export const cleanupPhantomCategories = async () => {
  try {
    const phantoms = getPhantomCategories();
    // console.log(`🧹 Limpiando ${phantoms.length} categorías fantasma...`);
    
    const stillPhantoms = [];
    const recovered = [];
    
    for (const categoryId of phantoms) {
      const exists = await verifyCategoryExists(categoryId);
      if (exists) {
        recovered.push(categoryId);
        // console.log(`✅ Categoría ${categoryId} recuperada (ya no es fantasma)`);
      } else {
        stillPhantoms.push(categoryId);
      }
    }
    
    // Actualizar lista con solo los que siguen siendo fantasmas
    localStorage.setItem(PHANTOM_CATEGORIES_KEY, JSON.stringify(stillPhantoms));
    
    // Disparar evento para actualizar otros componentes
    window.dispatchEvent(new StorageEvent('storage', {
      key: PHANTOM_CATEGORIES_KEY,
      newValue: JSON.stringify(stillPhantoms),
      url: window.location.href
    }));
    
    // console.log(`🎉 Limpieza completada: ${recovered.length} recuperadas, ${stillPhantoms.length} siguen siendo fantasmas`);
    
    return {
      total: phantoms.length,
      recovered: recovered.length,
      stillPhantoms: stillPhantoms.length
    };
  } catch (error) {
    // console.error('Error durante limpieza de categorías fantasma:', error);
    return null;
  }
};

/**
 * Verifica si una categoría es fantasma
 */
export const isPhantomCategory = (categoryId) => {
  const phantoms = getPhantomCategories();
  return phantoms.includes(categoryId);
};
