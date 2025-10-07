import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Utilidades específicas para debugging de productos
 */
export class ProductDebug {
  /**
   * Verifica si un producto específico existe y está accesible
   */
  static async checkProduct(productId) {
    console.log(`🔍 [ProductDebug] Verificando producto: ${productId}`);
    
    const result = {
      found: false,
      method: null,
      product: null,
      suggestions: [],
      errors: []
    };

    try {
      // Método 1: Búsqueda directa por ID
      console.log(`📍 [ProductDebug] Método 1: Búsqueda directa por ID`);
      const docRef = doc(db, 'productos', productId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        result.found = true;
        result.method = 'direct_id';
        result.product = { id: docSnap.id, ...docSnap.data() };
        console.log(`✅ [ProductDebug] Encontrado por ID directo`);
        return result;
      }

      // Método 2: Buscar en todos los productos
      console.log(`📍 [ProductDebug] Método 2: Búsqueda en todos los productos`);
      const productsQuery = query(collection(db, 'productos'));
      const productsSnap = await getDocs(productsQuery);
      const allProducts = productsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`📊 [ProductDebug] Total productos en DB: ${allProducts.length}`);

      // Buscar por slug
      const slugMatch = allProducts.find(p => p.slug === productId);
      if (slugMatch) {
        result.found = true;
        result.method = 'slug';
        result.product = slugMatch;
        console.log(`✅ [ProductDebug] Encontrado por slug`);
        return result;
      }

      // Buscar por nombre normalizado
      const normalize = (str) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const searchNorm = normalize(productId);
      
      const nameMatch = allProducts.find(p => normalize(p.nombre || '') === searchNorm);
      if (nameMatch) {
        result.found = true;
        result.method = 'normalized_name';
        result.product = nameMatch;
        console.log(`✅ [ProductDebug] Encontrado por nombre normalizado`);
        return result;
      }

      // Si no se encuentra, generar sugerencias
      console.log(`❌ [ProductDebug] Producto no encontrado, generando sugerencias...`);
      
      // Sugerencias por similitud de nombre
      const nameSuggestions = allProducts
        .filter(p => p.nombre && normalize(p.nombre).includes(searchNorm.substring(0, 3)))
        .slice(0, 5)
        .map(p => ({ id: p.id, nombre: p.nombre, slug: p.slug }));

      if (nameSuggestions.length > 0) {
        result.suggestions.push({
          type: 'similar_names',
          items: nameSuggestions
        });
      }

      // Sugerencias de productos activos recientes
      const recentProducts = allProducts
        .filter(p => p.activo !== false)
        .sort((a, b) => new Date(b.fechaCreacion || 0) - new Date(a.fechaCreacion || 0))
        .slice(0, 5)
        .map(p => ({ id: p.id, nombre: p.nombre, slug: p.slug }));

      if (recentProducts.length > 0) {
        result.suggestions.push({
          type: 'recent_products',
          items: recentProducts
        });
      }

      // Información de debug
      result.debug = {
        searchTerm: productId,
        normalizedSearch: searchNorm,
        totalProducts: allProducts.length,
        activeProducts: allProducts.filter(p => p.activo !== false).length,
        productsWithSlugs: allProducts.filter(p => p.slug).length,
        productsWithMedia: allProducts.filter(p => p.media && p.media.length > 0).length
      };

    } catch (error) {
      console.error(`❌ [ProductDebug] Error durante la verificación:`, error);
      result.errors.push(error.message);
    }

    return result;
  }

  /**
   * Genera un reporte completo de un producto
   */
  static async generateProductReport(productId) {
    console.log(`📋 [ProductDebug] Generando reporte para: ${productId}`);
    
    const checkResult = await this.checkProduct(productId);
    
    const report = {
      timestamp: new Date().toISOString(),
      productId,
      ...checkResult
    };

    if (checkResult.found && checkResult.product) {
      const product = checkResult.product;
      
      report.analysis = {
        hasName: !!product.nombre,
        hasSlug: !!product.slug,
        isActive: product.activo !== false,
        hasCategory: !!product.categoria,
        hasPrice: product.precio !== undefined && product.precio !== null,
        hasStock: product.cantidad !== undefined && product.cantidad !== null,
        hasMedia: !!(product.media && product.media.length > 0),
        hasLegacyImages: !!(product.imagen || product.imagenes),
        hasVariants: !!(product.variantes && product.variantes.length > 0),
        mediaCount: product.media ? product.media.length : 0,
        variantCount: product.variantes ? product.variantes.length : 0
      };

      // Verificar estructura de medios
      if (product.media && product.media.length > 0) {
        report.mediaAnalysis = {
          total: product.media.length,
          images: product.media.filter(m => m.type === 'image').length,
          videos: product.media.filter(m => m.type === 'video').length,
          validUrls: product.media.filter(m => m.url && m.url.startsWith('http')).length,
          samples: product.media.slice(0, 3).map(m => ({
            type: m.type,
            hasUrl: !!m.url,
            hasName: !!m.name
          }))
        };
      }

      // Verificar variantes
      if (product.variantes && product.variantes.length > 0) {
        report.variantAnalysis = {
          total: product.variantes.length,
          withColors: product.variantes.filter(v => v.color).length,
          withStock: product.variantes.filter(v => v.cantidad > 0).length,
          withMedia: product.variantes.filter(v => v.media && v.media.length > 0).length,
          samples: product.variantes.slice(0, 3).map(v => ({
            color: v.color,
            stock: v.cantidad,
            hasMedia: !!(v.media && v.media.length > 0)
          }))
        };
      }
    }

    console.log(`📋 [ProductDebug] Reporte generado:`, report);
    return report;
  }

  /**
   * Verifica la salud general de la colección de productos
   */
  static async checkProductsHealth() {
    console.log(`🏥 [ProductDebug] Verificando salud de la colección de productos...`);
    
    try {
      const productsQuery = query(collection(db, 'productos'));
      const productsSnap = await getDocs(productsQuery);
      const allProducts = productsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const health = {
        total: allProducts.length,
        active: allProducts.filter(p => p.activo !== false).length,
        withNames: allProducts.filter(p => p.nombre).length,
        withSlugs: allProducts.filter(p => p.slug).length,
        withCategories: allProducts.filter(p => p.categoria).length,
        withPrices: allProducts.filter(p => p.precio !== undefined && p.precio !== null).length,
        withStock: allProducts.filter(p => p.cantidad !== undefined && p.cantidad !== null).length,
        withMedia: allProducts.filter(p => p.media && p.media.length > 0).length,
        withLegacyImages: allProducts.filter(p => p.imagen || p.imagenes).length,
        withVariants: allProducts.filter(p => p.variantes && p.variantes.length > 0).length,
        issues: []
      };

      // Detectar problemas comunes
      const productsWithoutNames = allProducts.filter(p => !p.nombre);
      if (productsWithoutNames.length > 0) {
        health.issues.push({
          type: 'missing_names',
          count: productsWithoutNames.length,
          samples: productsWithoutNames.slice(0, 3).map(p => p.id)
        });
      }

      const productsWithoutSlugs = allProducts.filter(p => !p.slug);
      if (productsWithoutSlugs.length > 0) {
        health.issues.push({
          type: 'missing_slugs',
          count: productsWithoutSlugs.length,
          samples: productsWithoutSlugs.slice(0, 3).map(p => ({ id: p.id, nombre: p.nombre }))
        });
      }

      const inactiveProducts = allProducts.filter(p => p.activo === false);
      if (inactiveProducts.length > 0) {
        health.issues.push({
          type: 'inactive_products',
          count: inactiveProducts.length
        });
      }

      console.log(`🏥 [ProductDebug] Salud de productos:`, health);
      return health;

    } catch (error) {
      console.error(`❌ [ProductDebug] Error verificando salud:`, error);
      return { error: error.message };
    }
  }
}

// Funciones de utilidad para uso directo en consola
window.debugProduct = (productId) => ProductDebug.checkProduct(productId);
window.reportProduct = (productId) => ProductDebug.generateProductReport(productId);
window.checkProductsHealth = () => ProductDebug.checkProductsHealth();

export default ProductDebug;
