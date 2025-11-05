/**
 * Product Validation System - Amazon/eBay Style
 * Ensures products meet quality standards before publication
 */

import React from 'react';

export const VALIDATION_RULES = {
  // Required fields
  REQUIRED_FIELDS: ['nombre', 'precio', 'categoria', 'descripcion'],
  
  // Field constraints
  MIN_TITLE_LENGTH: 10,
  MAX_TITLE_LENGTH: 200,
  MIN_DESCRIPTION_LENGTH: 20,
  MAX_DESCRIPTION_LENGTH: 5000,
  MIN_PRICE: 0.01,
  MAX_PRICE: 1000000,
  MIN_STOCK: 0,
  MAX_STOCK: 999999,
  
  // Media requirements
  MIN_IMAGES: 1,
  MAX_IMAGES: 20,
  MAX_VIDEOS: 10,
  MAX_EXTRAS: 3,
  
  // Image specifications
  MIN_IMAGE_WIDTH: 500,
  MIN_IMAGE_HEIGHT: 500,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/mov', 'video/avi', 'video/webm'],
  
  // Category requirements
  REQUIRED_CATEGORIES: true,
  
  // Variant requirements
  MAX_VARIANTS: 50,
  MIN_VARIANT_NAME_LENGTH: 2,
  MAX_VARIANT_NAME_LENGTH: 100
};

export const VALIDATION_MESSAGES = {
  // Required fields
  MISSING_TITLE: 'El título del producto es obligatorio',
  MISSING_PRICE: 'El precio del producto es obligatorio',
  MISSING_CATEGORY: 'Debe seleccionar una categoría',
  MISSING_DESCRIPTION: 'La descripción del producto es obligatoria',
  MISSING_MAIN_IMAGE: 'Debe subir al menos una imagen principal',
  
  // Field format errors
  TITLE_TOO_SHORT: `El título debe tener al menos ${VALIDATION_RULES.MIN_TITLE_LENGTH} caracteres`,
  TITLE_TOO_LONG: `El título no puede exceder ${VALIDATION_RULES.MAX_TITLE_LENGTH} caracteres`,
  DESCRIPTION_TOO_SHORT: `La descripción debe tener al menos ${VALIDATION_RULES.MIN_DESCRIPTION_LENGTH} caracteres`,
  DESCRIPTION_TOO_LONG: `La descripción no puede exceder ${VALIDATION_RULES.MAX_DESCRIPTION_LENGTH} caracteres`,
  INVALID_PRICE: `El precio debe estar entre $${VALIDATION_RULES.MIN_PRICE} y $${VALIDATION_RULES.MAX_PRICE}`,
  INVALID_STOCK: `El stock debe estar entre ${VALIDATION_RULES.MIN_STOCK} y ${VALIDATION_RULES.MAX_STOCK}`,
  
  // Media errors
  TOO_MANY_IMAGES: `Máximo ${VALIDATION_RULES.MAX_IMAGES} imágenes permitidas`,
  TOO_MANY_VIDEOS: `Máximo ${VALIDATION_RULES.MAX_VIDEOS} videos permitidos`,
  TOO_MANY_EXTRAS: `Máximo ${VALIDATION_RULES.MAX_EXTRAS} archivos extras permitidos`,
  INVALID_IMAGE_TYPE: 'Tipo de imagen no válido. Use JPG, PNG o WEBP',
  INVALID_VIDEO_TYPE: 'Tipo de video no válido. Use MP4, MOV, AVI o WEBM',
  FILE_TOO_LARGE: `El archivo es demasiado grande. Máximo ${VALIDATION_RULES.MAX_FILE_SIZE / (1024 * 1024)}MB`,
  IMAGE_TOO_SMALL: `La imagen debe ser de al menos ${VALIDATION_RULES.MIN_IMAGE_WIDTH}x${VALIDATION_RULES.MIN_IMAGE_HEIGHT} píxeles`,
  
  // Variant errors
  TOO_MANY_VARIANTS: `Máximo ${VALIDATION_RULES.MAX_VARIANTS} variantes permitidas`,
  VARIANT_NAME_TOO_SHORT: `El nombre de la variante debe tener al menos ${VALIDATION_RULES.MIN_VARIANT_NAME_LENGTH} caracteres`,
  VARIANT_NAME_TOO_LONG: `El nombre de la variante no puede exceder ${VALIDATION_RULES.MAX_VARIANT_NAME_LENGTH} caracteres`,
  DUPLICATE_VARIANT_NAMES: 'No puede haber variantes con el mismo nombre',
  VARIANT_MISSING_STOCK: 'Todas las variantes deben tener stock definido',
  
  // General errors
  INVALID_CATEGORY: 'La categoría seleccionada no es válida',
  PRODUCT_NOT_READY: 'El producto no cumple con todos los requisitos para ser publicado'
};

export const VALIDATION_SEVERITY = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

/**
 * Validates a single field
 */
export const validateField = (fieldName, value, formData = {}) => {
  const errors = [];
  
  switch (fieldName) {
    case 'nombre':
      if (!value || !value.trim()) {
        errors.push({
          field: 'nombre',
          message: VALIDATION_MESSAGES.MISSING_TITLE,
          severity: VALIDATION_SEVERITY.ERROR
        });
      } else {
        const trimmed = value.trim();
        if (trimmed.length < VALIDATION_RULES.MIN_TITLE_LENGTH) {
          errors.push({
            field: 'nombre',
            message: VALIDATION_MESSAGES.TITLE_TOO_SHORT,
            severity: VALIDATION_SEVERITY.ERROR
          });
        }
        if (trimmed.length > VALIDATION_RULES.MAX_TITLE_LENGTH) {
          errors.push({
            field: 'nombre',
            message: VALIDATION_MESSAGES.TITLE_TOO_LONG,
            severity: VALIDATION_SEVERITY.ERROR
          });
        }
      }
      break;
      
    case 'precio':
      if (!value && value !== 0) {
        errors.push({
          field: 'precio',
          message: VALIDATION_MESSAGES.MISSING_PRICE,
          severity: VALIDATION_SEVERITY.ERROR
        });
      } else {
        const price = parseFloat(value);
        if (isNaN(price) || price < VALIDATION_RULES.MIN_PRICE || price > VALIDATION_RULES.MAX_PRICE) {
          errors.push({
            field: 'precio',
            message: VALIDATION_MESSAGES.INVALID_PRICE,
            severity: VALIDATION_SEVERITY.ERROR
          });
        }
      }
      break;
      
    case 'categoria':
      if (!value || !value.trim()) {
        errors.push({
          field: 'categoria',
          message: VALIDATION_MESSAGES.MISSING_CATEGORY,
          severity: VALIDATION_SEVERITY.ERROR
        });
      }
      break;
      
    case 'descripcion':
      if (!value || !value.trim()) {
        errors.push({
          field: 'descripcion',
          message: VALIDATION_MESSAGES.MISSING_DESCRIPTION,
          severity: VALIDATION_SEVERITY.ERROR
        });
      } else {
        const trimmed = value.trim();
        if (trimmed.length < VALIDATION_RULES.MIN_DESCRIPTION_LENGTH) {
          errors.push({
            field: 'descripcion',
            message: VALIDATION_MESSAGES.DESCRIPTION_TOO_SHORT,
            severity: VALIDATION_SEVERITY.ERROR
          });
        }
        if (trimmed.length > VALIDATION_RULES.MAX_DESCRIPTION_LENGTH) {
          errors.push({
            field: 'descripcion',
            message: VALIDATION_MESSAGES.DESCRIPTION_TOO_LONG,
            severity: VALIDATION_SEVERITY.WARNING
          });
        }
      }
      break;
      
    case 'cantidad':
      if (value !== undefined && value !== null) {
        const stock = parseInt(value);
        if (isNaN(stock) || stock < VALIDATION_RULES.MIN_STOCK || stock > VALIDATION_RULES.MAX_STOCK) {
          errors.push({
            field: 'cantidad',
            message: VALIDATION_MESSAGES.INVALID_STOCK,
            severity: VALIDATION_SEVERITY.ERROR
          });
        }
      }
      break;
  }
  
  return errors;
};

/**
 * Validates media files (images, videos)
 */
export const validateMediaFile = (file, type = 'image') => {
  const errors = [];
  
  if (!file) return errors;
  
  // Check file size
  if (file.size > VALIDATION_RULES.MAX_FILE_SIZE) {
    errors.push({
      field: 'media',
      message: VALIDATION_MESSAGES.FILE_TOO_LARGE,
      severity: VALIDATION_SEVERITY.ERROR
    });
  }
  
  // Check file type
  if (type === 'image') {
    if (!VALIDATION_RULES.ALLOWED_IMAGE_TYPES.includes(file.type)) {
      errors.push({
        field: 'media',
        message: VALIDATION_MESSAGES.INVALID_IMAGE_TYPE,
        severity: VALIDATION_SEVERITY.ERROR
      });
    }
  } else if (type === 'video') {
    if (!VALIDATION_RULES.ALLOWED_VIDEO_TYPES.includes(file.type)) {
      errors.push({
        field: 'media',
        message: VALIDATION_MESSAGES.INVALID_VIDEO_TYPE,
        severity: VALIDATION_SEVERITY.ERROR
      });
    }
  }
  
  return errors;
};

/**
 * Validates image dimensions
 */
export const validateImageDimensions = (file) => {
  return new Promise((resolve) => {
    if (!file || !file.type.startsWith('image/')) {
      resolve([]);
      return;
    }
    
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      const errors = [];
      
      if (img.width < VALIDATION_RULES.MIN_IMAGE_WIDTH || img.height < VALIDATION_RULES.MIN_IMAGE_HEIGHT) {
        errors.push({
          field: 'media',
          message: VALIDATION_MESSAGES.IMAGE_TOO_SMALL,
          severity: VALIDATION_SEVERITY.WARNING
        });
      }
      
      resolve(errors);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve([]);
    };
    
    img.src = url;
  });
};

/**
 * Validates product variants
 */
export const validateVariants = (variants = []) => {
  const errors = [];
  
  if (variants.length > VALIDATION_RULES.MAX_VARIANTS) {
    errors.push({
      field: 'variantes',
      message: VALIDATION_MESSAGES.TOO_MANY_VARIANTS,
      severity: VALIDATION_SEVERITY.ERROR
    });
  }
  
  const variantNames = [];
  
  variants.forEach((variant, index) => {
    // Skip undefined or null variants
    if (!variant || typeof variant !== 'object') {
      return;
    }
    
    const name = variant.color || variant.name || '';
    
    // Check variant name length
    if (name.trim().length < VALIDATION_RULES.MIN_VARIANT_NAME_LENGTH) {
      errors.push({
        field: `variantes[${index}].color`,
        message: VALIDATION_MESSAGES.VARIANT_NAME_TOO_SHORT,
        severity: VALIDATION_SEVERITY.ERROR
      });
    }
    
    if (name.trim().length > VALIDATION_RULES.MAX_VARIANT_NAME_LENGTH) {
      errors.push({
        field: `variantes[${index}].color`,
        message: VALIDATION_MESSAGES.VARIANT_NAME_TOO_LONG,
        severity: VALIDATION_SEVERITY.ERROR
      });
    }
    
    // Check for duplicate names
    if (variantNames.includes(name.trim().toLowerCase())) {
      errors.push({
        field: `variantes[${index}].color`,
        message: VALIDATION_MESSAGES.DUPLICATE_VARIANT_NAMES,
        severity: VALIDATION_SEVERITY.ERROR
      });
    } else {
      variantNames.push(name.trim().toLowerCase());
    }
    
    // Check variant stock
    const stock = parseInt(variant.cantidad);
    if (isNaN(stock) || stock < 0) {
      errors.push({
        field: `variantes[${index}].cantidad`,
        message: VALIDATION_MESSAGES.VARIANT_MISSING_STOCK,
        severity: VALIDATION_SEVERITY.ERROR
      });
    }
  });
  
  return errors;
};

/**
 * Validates media arrays
 */
export const validateMediaArrays = (formData) => {
  const errors = [];
  
  // Check main image requirement
  const hasMainImage = formData.imagen || (formData.imagenPrincipal && formData.imagenPrincipal.length > 0);
  if (!hasMainImage) {
    errors.push({
      field: 'imagen',
      message: VALIDATION_MESSAGES.MISSING_MAIN_IMAGE,
      severity: VALIDATION_SEVERITY.ERROR
    });
  }
  
  // Check image limits
  const totalImages = (formData.imagenes || []).length + (formData.imagenesExtra || []).length;
  if (totalImages > VALIDATION_RULES.MAX_IMAGES) {
    errors.push({
      field: 'imagenes',
      message: VALIDATION_MESSAGES.TOO_MANY_IMAGES,
      severity: VALIDATION_SEVERITY.ERROR
    });
  }
  
  // Check video limits
  const totalVideos = (formData.videoUrls || []).length + (formData.videoAcercaArticulo || []).length;
  if (totalVideos > VALIDATION_RULES.MAX_VIDEOS) {
    errors.push({
      field: 'videos',
      message: VALIDATION_MESSAGES.TOO_MANY_VIDEOS,
      severity: VALIDATION_SEVERITY.ERROR
    });
  }
  
  // Check extras limit
  if ((formData.imagenesExtra || []).length > VALIDATION_RULES.MAX_EXTRAS) {
    errors.push({
      field: 'imagenesExtra',
      message: VALIDATION_MESSAGES.TOO_MANY_EXTRAS,
      severity: VALIDATION_SEVERITY.ERROR
    });
  }
  
  return errors;
};

/**
 * Comprehensive product validation
 */
export const validateProduct = (formData) => {
  // Validar que formData existe y es un objeto
  if (!formData || typeof formData !== 'object') {
    return [{
      field: 'general',
      message: 'Datos del producto no válidos',
      severity: VALIDATION_SEVERITY.ERROR
    }];
  }

  let errors = [];
  
  // Validate required fields
  VALIDATION_RULES.REQUIRED_FIELDS.forEach(field => {
    try {
      errors = errors.concat(validateField(field, formData[field], formData));
    } catch (error) {
      console.error(`Error validating field ${field}:`, error);
    }
  });
  
  // Validate optional fields if present
  if (formData.cantidad !== undefined) {
    try {
      errors = errors.concat(validateField('cantidad', formData.cantidad, formData));
    } catch (error) {
      console.error('Error validating cantidad:', error);
    }
  }
  
  // Validate media
  try {
    errors = errors.concat(validateMediaArrays(formData));
  } catch (error) {
    console.error('Error validating media:', error);
  }
  
  // Validate variants
  if (formData.variantes && Array.isArray(formData.variantes) && formData.variantes.length > 0) {
    try {
      errors = errors.concat(validateVariants(formData.variantes));
    } catch (error) {
      console.error('Error validating variants:', error);
    }
  }
  
  return errors;
};

/**
 * Check if product is ready for publication
 */
export const isProductReadyForPublication = (formData) => {
  const errors = validateProduct(formData);
  const criticalErrors = errors.filter(error => error.severity === VALIDATION_SEVERITY.ERROR);
  return criticalErrors.length === 0;
};

/**
 * Get validation summary
 */
export const getValidationSummary = (formData) => {
  // Validación segura contra undefined/null
  if (!formData || typeof formData !== 'object') {
    return {
      isReady: false,
      errorCount: 1,
      warningCount: 0,
      errors: [{
        field: 'general',
        message: 'Datos del producto no válidos',
        severity: VALIDATION_SEVERITY.ERROR
      }],
      canPublish: false,
      status: 'incomplete'
    };
  }

  const errors = validateProduct(formData);
  const errorCount = errors.filter(e => e.severity === VALIDATION_SEVERITY.ERROR).length;
  const warningCount = errors.filter(e => e.severity === VALIDATION_SEVERITY.WARNING).length;
  const isReady = errorCount === 0;
  
  return {
    isReady,
    errorCount,
    warningCount,
    errors,
    canPublish: isReady,
    status: isReady ? 'ready' : 'incomplete'
  };
};

/**
 * Real-time validation hook for React components
 */
export const useProductValidation = (formData) => {
  const [validationState, setValidationState] = React.useState({
    isReady: false,
    errorCount: 0,
    warningCount: 0,
    errors: [],
    canPublish: false,
    status: 'incomplete'
  });
  
  React.useEffect(() => {
    const summary = getValidationSummary(formData);
    setValidationState(summary);
  }, [formData]);
  
  return validationState;
};
