/**
 * Product Status Workflow System - Amazon/eBay Style
 * Manages product lifecycle: draft → pending → active
 */

import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { validateProduct, isProductReadyForPublication } from './productValidation';

export const PRODUCT_STATUS = {
  DRAFT: 'draft',           // Product being created/edited, not visible to public
  PENDING: 'pending',       // Product submitted for review, automated verification
  ACTIVE: 'active',         // Product approved and visible to public
  INACTIVE: 'inactive',     // Product temporarily disabled
  REJECTED: 'rejected',     // Product failed validation, needs fixes
  ARCHIVED: 'archived'      // Product permanently removed
};

export const STATUS_LABELS = {
  [PRODUCT_STATUS.DRAFT]: 'Borrador',
  [PRODUCT_STATUS.PENDING]: 'En Revisión',
  [PRODUCT_STATUS.ACTIVE]: 'Activo',
  [PRODUCT_STATUS.INACTIVE]: 'Inactivo',
  [PRODUCT_STATUS.REJECTED]: 'Rechazado',
  [PRODUCT_STATUS.ARCHIVED]: 'Archivado'
};

export const STATUS_COLORS = {
  [PRODUCT_STATUS.DRAFT]: 'bg-gray-100 text-gray-800',
  [PRODUCT_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
  [PRODUCT_STATUS.ACTIVE]: 'bg-green-100 text-green-800',
  [PRODUCT_STATUS.INACTIVE]: 'bg-red-100 text-red-800',
  [PRODUCT_STATUS.REJECTED]: 'bg-red-100 text-red-800',
  [PRODUCT_STATUS.ARCHIVED]: 'bg-gray-100 text-gray-600'
};

/**
 * Automated product verification rules
 */
const VERIFICATION_RULES = {
  // Content quality checks
  MIN_DESCRIPTION_QUALITY_SCORE: 0.7,
  MAX_DUPLICATE_CONTENT_THRESHOLD: 0.8,
  
  // Image quality checks
  MIN_IMAGE_QUALITY_SCORE: 0.6,
  REQUIRE_MAIN_IMAGE: true,
  
  // Pricing checks
  PRICE_ANOMALY_THRESHOLD: 0.1, // 10% deviation from category average
  
  // Seller reputation checks
  MIN_SELLER_RATING: 3.0,
  
  // Category compliance
  REQUIRE_CATEGORY_MATCH: true
};

/**
 * Performs automated verification of a product
 */
export const performAutomatedVerification = async (productData) => {
  const verificationResults = {
    passed: false,
    score: 0,
    issues: [],
    warnings: [],
    recommendations: []
  };

  try {
    // 1. Basic validation check
    const validationErrors = validateProduct(productData);
    const criticalErrors = validationErrors.filter(error => error.severity === 'error');
    
    if (criticalErrors.length > 0) {
      verificationResults.issues.push({
        type: 'validation',
        message: 'El producto no cumple con los requisitos básicos de validación',
        details: criticalErrors
      });
      return verificationResults;
    }

    let score = 0;
    const maxScore = 100;

    // 2. Content Quality Assessment
    const contentScore = assessContentQuality(productData);
    score += contentScore * 0.3; // 30% weight
    
    if (contentScore < VERIFICATION_RULES.MIN_DESCRIPTION_QUALITY_SCORE * 100) {
      verificationResults.warnings.push({
        type: 'content_quality',
        message: 'La descripción del producto podría ser más detallada',
        suggestion: 'Agrega más información sobre características, beneficios y especificaciones'
      });
    }

    // 3. Image Quality Assessment
    const imageScore = assessImageQuality(productData);
    score += imageScore * 0.25; // 25% weight
    
    if (imageScore < VERIFICATION_RULES.MIN_IMAGE_QUALITY_SCORE * 100) {
      verificationResults.warnings.push({
        type: 'image_quality',
        message: 'Las imágenes podrían ser de mejor calidad',
        suggestion: 'Usa imágenes de alta resolución con buena iluminación'
      });
    }

    // 4. Pricing Assessment
    const pricingScore = await assessPricing(productData);
    score += pricingScore * 0.2; // 20% weight

    // 5. Category Compliance
    const categoryScore = assessCategoryCompliance(productData);
    score += categoryScore * 0.15; // 15% weight

    // 6. Completeness Assessment
    const completenessScore = assessCompleteness(productData);
    score += completenessScore * 0.1; // 10% weight

    verificationResults.score = Math.round(score);
    verificationResults.passed = score >= 70; // 70% minimum to pass

    // Add recommendations based on score
    if (score < 85) {
      verificationResults.recommendations.push({
        type: 'improvement',
        message: 'Considera mejorar la calidad del producto para mejor visibilidad',
        actions: [
          'Agrega más imágenes de diferentes ángulos',
          'Mejora la descripción con más detalles',
          'Verifica que el precio sea competitivo',
          'Asegúrate de que la categoría sea la correcta'
        ]
      });
    }

  } catch (error) {
    console.error('Error in automated verification:', error);
    verificationResults.issues.push({
      type: 'system_error',
      message: 'Error en la verificación automática',
      details: error.message
    });
  }

  return verificationResults;
};

/**
 * Assesses content quality based on various factors
 */
const assessContentQuality = (productData) => {
  let score = 0;
  
  // Title quality (20 points)
  const title = productData.nombre || '';
  if (title.length >= 20) score += 10;
  if (title.length >= 50) score += 5;
  if (/[A-Z]/.test(title) && /[a-z]/.test(title)) score += 5; // Mixed case
  
  // Description quality (40 points)
  const description = productData.descripcion || '';
  if (description.length >= 100) score += 15;
  if (description.length >= 300) score += 10;
  if (description.length >= 500) score += 10;
  if (description.includes('\n') || description.includes('•')) score += 5; // Formatted
  
  // Additional details (20 points)
  if (productData.acerca && productData.acerca.length > 0) score += 10;
  if (productData.etiquetas && productData.etiquetas.length > 0) score += 5;
  if (productData.peso || productData.dimensiones) score += 5;
  
  // Variants (20 points)
  if (productData.variantes && productData.variantes.length > 1) score += 10;
  if (productData.variantes && productData.variantes.some(v => v.descripcion)) score += 10;
  
  return Math.min(score, 100);
};

/**
 * Assesses image quality and completeness
 */
const assessImageQuality = (productData) => {
  let score = 0;
  
  // Main image (30 points)
  if (productData.imagen || (productData.imagenPrincipal && productData.imagenPrincipal.length > 0)) {
    score += 30;
  }
  
  // Gallery images (40 points)
  const galleryCount = (productData.imagenes || []).length;
  if (galleryCount >= 1) score += 10;
  if (galleryCount >= 3) score += 15;
  if (galleryCount >= 5) score += 15;
  
  // Extra media (15 points)
  if (productData.imagenesExtra && productData.imagenesExtra.length > 0) score += 15;
  
  // Videos (15 points)
  const hasVideo = productData.videoUrl || 
                   (productData.videoUrls && productData.videoUrls.length > 0) ||
                   (productData.videoAcercaArticulo && productData.videoAcercaArticulo.length > 0);
  if (hasVideo) score += 15;
  
  return Math.min(score, 100);
};

/**
 * Assesses pricing competitiveness
 */
const assessPricing = async (productData) => {
  let score = 50; // Base score
  
  const price = parseFloat(productData.precio);
  if (isNaN(price) || price <= 0) return 0;
  
  // Basic pricing checks
  if (price >= 1 && price <= 10000) score += 25; // Reasonable range
  if (productData.oferta && productData.precioOferta) {
    const discountPercent = ((price - parseFloat(productData.precioOferta)) / price) * 100;
    if (discountPercent >= 5 && discountPercent <= 50) score += 25; // Reasonable discount
  }
  
  // TODO: Implement category-based price comparison
  // This would require analyzing similar products in the same category
  
  return Math.min(score, 100);
};

/**
 * Assesses category compliance
 */
const assessCategoryCompliance = (productData) => {
  let score = 0;
  
  // Has category (50 points)
  if (productData.categoria && productData.categoria.trim()) score += 50;
  
  // Category matches content (50 points)
  // TODO: Implement AI-based category matching
  // For now, give points if category is present
  if (productData.categoria) score += 50;
  
  return Math.min(score, 100);
};

/**
 * Assesses overall completeness
 */
const assessCompleteness = (productData) => {
  let score = 0;
  const fields = [
    'nombre', 'descripcion', 'precio', 'categoria', 'cantidad',
    'imagen', 'empresa', 'estado'
  ];
  
  const filledFields = fields.filter(field => {
    const value = productData[field];
    return value !== undefined && value !== null && value !== '';
  });
  
  score = (filledFields.length / fields.length) * 100;
  
  return Math.round(score);
};

/**
 * Transitions product to next status in workflow
 */
export const transitionProductStatus = async (productId, newStatus, reason = '', userId = null) => {
  try {
    const updateData = {
      estado: newStatus,
      fechaActualizacion: serverTimestamp(),
      statusHistory: {
        status: newStatus,
        timestamp: serverTimestamp(),
        reason,
        userId
      }
    };

    // Add specific fields based on status
    switch (newStatus) {
      case PRODUCT_STATUS.PENDING:
        updateData.fechaEnvioRevision = serverTimestamp();
        break;
      case PRODUCT_STATUS.ACTIVE:
        updateData.fechaPublicacion = serverTimestamp();
        updateData.activo = true;
        break;
      case PRODUCT_STATUS.INACTIVE:
      case PRODUCT_STATUS.REJECTED:
      case PRODUCT_STATUS.ARCHIVED:
        updateData.activo = false;
        break;
    }

    await updateDoc(doc(db, 'productos', productId), updateData);
    
    return { success: true, status: newStatus };
  } catch (error) {
    console.error('Error transitioning product status:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Submits product for publication (draft → pending)
 */
export const submitForPublication = async (productId, productData, userId) => {
  try {
    // First, validate the product
    if (!isProductReadyForPublication(productData)) {
      return {
        success: false,
        error: 'El producto no cumple con todos los requisitos para publicación'
      };
    }

    // Perform automated verification
    const verification = await performAutomatedVerification(productData);
    
    if (verification.passed) {
      // Auto-approve if verification passes
      await transitionProductStatus(
        productId, 
        PRODUCT_STATUS.ACTIVE, 
        'Aprobado automáticamente tras verificación exitosa',
        userId
      );
      
      return {
        success: true,
        status: PRODUCT_STATUS.ACTIVE,
        message: '¡Producto publicado exitosamente!',
        verification
      };
    } else {
      // Send to pending for manual review
      await transitionProductStatus(
        productId,
        PRODUCT_STATUS.PENDING,
        'Enviado para revisión manual',
        userId
      );
      
      return {
        success: true,
        status: PRODUCT_STATUS.PENDING,
        message: 'Producto enviado para revisión. Te notificaremos cuando esté aprobado.',
        verification
      };
    }
  } catch (error) {
    console.error('Error submitting product for publication:', error);
    return {
      success: false,
      error: 'Error al enviar el producto para publicación'
    };
  }
};

/**
 * Gets allowed status transitions for a given current status
 */
export const getAllowedTransitions = (currentStatus, userRole = 'seller') => {
  const transitions = {
    [PRODUCT_STATUS.DRAFT]: [PRODUCT_STATUS.PENDING],
    [PRODUCT_STATUS.PENDING]: userRole === 'admin' 
      ? [PRODUCT_STATUS.ACTIVE, PRODUCT_STATUS.REJECTED, PRODUCT_STATUS.DRAFT]
      : [],
    [PRODUCT_STATUS.ACTIVE]: userRole === 'admin'
      ? [PRODUCT_STATUS.INACTIVE, PRODUCT_STATUS.ARCHIVED]
      : [PRODUCT_STATUS.INACTIVE],
    [PRODUCT_STATUS.INACTIVE]: [PRODUCT_STATUS.ACTIVE, PRODUCT_STATUS.ARCHIVED],
    [PRODUCT_STATUS.REJECTED]: [PRODUCT_STATUS.DRAFT],
    [PRODUCT_STATUS.ARCHIVED]: userRole === 'admin' ? [PRODUCT_STATUS.DRAFT] : []
  };

  return transitions[currentStatus] || [];
};

/**
 * Checks if a status transition is valid
 */
export const isValidTransition = (fromStatus, toStatus, userRole = 'seller') => {
  const allowedTransitions = getAllowedTransitions(fromStatus, userRole);
  return allowedTransitions.includes(toStatus);
};

/**
 * Gets status workflow information for UI display
 */
export const getStatusWorkflowInfo = (currentStatus) => {
  const info = {
    label: STATUS_LABELS[currentStatus] || 'Desconocido',
    color: STATUS_COLORS[currentStatus] || 'bg-gray-100 text-gray-800',
    description: '',
    nextSteps: []
  };

  switch (currentStatus) {
    case PRODUCT_STATUS.DRAFT:
      info.description = 'El producto está siendo creado o editado';
      info.nextSteps = ['Completa toda la información requerida', 'Envía para publicación'];
      break;
    case PRODUCT_STATUS.PENDING:
      info.description = 'El producto está siendo revisado para publicación';
      info.nextSteps = ['Espera la aprobación automática o manual'];
      break;
    case PRODUCT_STATUS.ACTIVE:
      info.description = 'El producto está visible y disponible para compra';
      info.nextSteps = ['Gestiona inventario', 'Actualiza información si es necesario'];
      break;
    case PRODUCT_STATUS.INACTIVE:
      info.description = 'El producto está temporalmente deshabilitado';
      info.nextSteps = ['Reactiva el producto cuando esté listo'];
      break;
    case PRODUCT_STATUS.REJECTED:
      info.description = 'El producto fue rechazado y necesita correcciones';
      info.nextSteps = ['Revisa los comentarios', 'Realiza las correcciones necesarias', 'Vuelve a enviar'];
      break;
    case PRODUCT_STATUS.ARCHIVED:
      info.description = 'El producto ha sido archivado permanentemente';
      info.nextSteps = ['Contacta al administrador si necesitas reactivarlo'];
      break;
  }

  return info;
};
