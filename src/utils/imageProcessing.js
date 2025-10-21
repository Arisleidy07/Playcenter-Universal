/**
 * Image Processing Utilities - Amazon/eBay Style
 * Handles automatic compression, resizing, and optimization
 */

// Image processing configuration
export const IMAGE_CONFIG = {
  // Quality settings
  THUMBNAIL_QUALITY: 0.8,
  MEDIUM_QUALITY: 0.85,
  HIGH_QUALITY: 0.9,
  
  // Size configurations (aligned with PDP spec)
  THUMBNAIL_SIZE: { width: 200, height: 200 },
  SMALL_SIZE: { width: 400, height: 400 },
  MEDIUM_SIZE: { width: 800, height: 800 },
  LARGE_SIZE: { width: 1600, height: 1600 },
  
  // File size limits (bytes) tuned for the new sizes
  MAX_THUMBNAIL_SIZE: 80 * 1024,       // ~80KB
  MAX_SMALL_SIZE: 220 * 1024,          // ~220KB
  MAX_MEDIUM_SIZE: 900 * 1024,         // ~900KB
  MAX_LARGE_SIZE: 3 * 1024 * 1024,     // ~3MB
  
  // Supported formats
  SUPPORTED_FORMATS: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  OUTPUT_FORMAT: 'image/jpeg',
  
  // Processing options
  ENABLE_WEBP: true,
  ENABLE_PROGRESSIVE_JPEG: true,
  BACKGROUND_COLOR: '#FFFFFF'
};

/**
 * Creates a canvas element for image processing
 */
const createCanvas = (width, height) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

/**
 * Loads an image from file or URL
 */
export const loadImage = (source) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    
    if (source instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(source);
    } else if (typeof source === 'string') {
      img.src = source;
    } else {
      reject(new Error('Invalid image source'));
    }
  });
};

/**
 * Calculates optimal dimensions maintaining aspect ratio
 */
export const calculateDimensions = (originalWidth, originalHeight, targetWidth, targetHeight, mode = 'contain') => {
  const originalRatio = originalWidth / originalHeight;
  const targetRatio = targetWidth / targetHeight;
  
  let width, height;
  
  switch (mode) {
    case 'cover':
      if (originalRatio > targetRatio) {
        width = targetWidth;
        height = targetWidth / originalRatio;
      } else {
        width = targetHeight * originalRatio;
        height = targetHeight;
      }
      break;
      
    case 'fill':
      width = targetWidth;
      height = targetHeight;
      break;
      
    case 'contain':
    default:
      if (originalRatio > targetRatio) {
        width = targetWidth;
        height = targetWidth / originalRatio;
      } else {
        width = targetHeight * originalRatio;
        height = targetHeight;
      }
      break;
  }
  
  return {
    width: Math.round(width),
    height: Math.round(height),
    offsetX: Math.round((targetWidth - width) / 2),
    offsetY: Math.round((targetHeight - height) / 2)
  };
};

/**
 * Resizes an image to specified dimensions
 */
export const resizeImage = async (image, targetWidth, targetHeight, options = {}) => {
  const {
    quality = IMAGE_CONFIG.HIGH_QUALITY,
    format = IMAGE_CONFIG.OUTPUT_FORMAT,
    mode = 'contain',
    backgroundColor = IMAGE_CONFIG.BACKGROUND_COLOR
  } = options;
  
  const canvas = createCanvas(targetWidth, targetHeight);
  const ctx = canvas.getContext('2d');
  
  // Set background color
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, targetWidth, targetHeight);
  
  // Calculate dimensions
  const dimensions = calculateDimensions(
    image.width, 
    image.height, 
    targetWidth, 
    targetHeight, 
    mode
  );
  
  // Enable image smoothing for better quality
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  // Draw the image
  ctx.drawImage(
    image,
    dimensions.offsetX,
    dimensions.offsetY,
    dimensions.width,
    dimensions.height
  );
  
  return new Promise((resolve) => {
    canvas.toBlob(resolve, format, quality);
  });
};

/**
 * Compresses an image to target file size
 */
export const compressImage = async (image, maxFileSize, options = {}) => {
  const {
    format = IMAGE_CONFIG.OUTPUT_FORMAT,
    minQuality = 0.1,
    maxQuality = 0.9,
    step = 0.1
  } = options;
  
  let quality = maxQuality;
  let compressedBlob;
  
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);
  
  // Binary search for optimal quality
  let low = minQuality;
  let high = maxQuality;
  
  while (high - low > step) {
    quality = (low + high) / 2;
    
    compressedBlob = await new Promise((resolve) => {
      canvas.toBlob(resolve, format, quality);
    });
    
    if (compressedBlob.size <= maxFileSize) {
      low = quality;
    } else {
      high = quality;
    }
  }
  
  // Final compression with the found quality
  return new Promise((resolve) => {
    canvas.toBlob(resolve, format, low);
  });
};

/**
 * Generates multiple image sizes for responsive display
 */
export const generateImageSizes = async (file, options = {}) => {
  const {
    generateThumbnail = true,
    generateSmall = true,
    generateMedium = true,
    generateLarge = true,
    enableWebP = IMAGE_CONFIG.ENABLE_WEBP
  } = options;
  
  try {
    const originalImage = await loadImage(file);
    const results = {
      original: file,
      originalDimensions: {
        width: originalImage.width,
        height: originalImage.height
      },
      sizes: {}
    };
    
    // Generate thumbnail
    if (generateThumbnail) {
      const thumbnailBlob = await resizeImage(
        originalImage,
        IMAGE_CONFIG.THUMBNAIL_SIZE.width,
        IMAGE_CONFIG.THUMBNAIL_SIZE.height,
        { quality: IMAGE_CONFIG.THUMBNAIL_QUALITY }
      );
      
      const compressedThumbnail = await compressImage(
        originalImage,
        IMAGE_CONFIG.MAX_THUMBNAIL_SIZE
      );
      
      results.sizes.thumbnail = compressedThumbnail.size < thumbnailBlob.size 
        ? compressedThumbnail 
        : thumbnailBlob;
    }
    
    // Generate small size
    if (generateSmall) {
      const smallBlob = await resizeImage(
        originalImage,
        IMAGE_CONFIG.SMALL_SIZE.width,
        IMAGE_CONFIG.SMALL_SIZE.height,
        { quality: IMAGE_CONFIG.MEDIUM_QUALITY }
      );
      
      results.sizes.small = smallBlob.size <= IMAGE_CONFIG.MAX_SMALL_SIZE
        ? smallBlob
        : await compressImage(originalImage, IMAGE_CONFIG.MAX_SMALL_SIZE);
    }
    
    // Generate medium size
    if (generateMedium) {
      const mediumBlob = await resizeImage(
        originalImage,
        IMAGE_CONFIG.MEDIUM_SIZE.width,
        IMAGE_CONFIG.MEDIUM_SIZE.height,
        { quality: IMAGE_CONFIG.HIGH_QUALITY }
      );
      
      results.sizes.medium = mediumBlob.size <= IMAGE_CONFIG.MAX_MEDIUM_SIZE
        ? mediumBlob
        : await compressImage(originalImage, IMAGE_CONFIG.MAX_MEDIUM_SIZE);
    }
    
    // Generate large size
    if (generateLarge) {
      const largeBlob = await resizeImage(
        originalImage,
        IMAGE_CONFIG.LARGE_SIZE.width,
        IMAGE_CONFIG.LARGE_SIZE.height,
        { quality: IMAGE_CONFIG.HIGH_QUALITY }
      );
      
      results.sizes.large = largeBlob.size <= IMAGE_CONFIG.MAX_LARGE_SIZE
        ? largeBlob
        : await compressImage(originalImage, IMAGE_CONFIG.MAX_LARGE_SIZE);
    }
    
    // Generate WebP versions if enabled
    if (enableWebP && 'toBlob' in HTMLCanvasElement.prototype) {
      const webpResults = {};
      
      for (const [sizeName, blob] of Object.entries(results.sizes)) {
        try {
          const img = await loadImage(blob);
          const canvas = createCanvas(img.width, img.height);
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          
          const webpBlob = await new Promise((resolve) => {
            canvas.toBlob(resolve, 'image/webp', IMAGE_CONFIG.HIGH_QUALITY);
          });
          
          if (webpBlob && webpBlob.size < blob.size) {
            webpResults[sizeName] = webpBlob;
          }
        } catch (error) {
          console.warn(`Failed to generate WebP for ${sizeName}:`, error);
        }
      }
      
      if (Object.keys(webpResults).length > 0) {
        results.webp = webpResults;
      }
    }
    
    return results;
  } catch (error) {
    throw new Error(`Image processing failed: ${error.message}`);
  }
};

/**
 * Validates image file
 */
export const validateImage = (file) => {
  const errors = [];
  
  // Check file type
  if (!IMAGE_CONFIG.SUPPORTED_FORMATS.includes(file.type)) {
    errors.push({
      type: 'format',
      message: `Formato no soportado. Use: ${IMAGE_CONFIG.SUPPORTED_FORMATS.join(', ')}`
    });
  }
  
  // Check file size (10MB max for original)
  if (file.size > 10 * 1024 * 1024) {
    errors.push({
      type: 'size',
      message: 'El archivo es demasiado grande. Máximo 10MB permitido.'
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Gets image metadata
 */
export const getImageMetadata = async (file) => {
  try {
    const image = await loadImage(file);
    
    return {
      width: image.width,
      height: image.height,
      aspectRatio: image.width / image.height,
      fileSize: file.size,
      fileType: file.type,
      fileName: file.name,
      lastModified: file.lastModified
    };
  } catch (error) {
    throw new Error(`Failed to get image metadata: ${error.message}`);
  }
};

/**
 * Creates a responsive image srcset
 */
export const createResponsiveSrcSet = (imageSizes, baseUrl) => {
  const srcSet = [];
  const sizes = [];
  
  if (imageSizes.thumbnail) {
    srcSet.push(`${baseUrl}/thumbnail ${IMAGE_CONFIG.THUMBNAIL_SIZE.width}w`);
  }
  
  if (imageSizes.small) {
    srcSet.push(`${baseUrl}/small ${IMAGE_CONFIG.SMALL_SIZE.width}w`);
    sizes.push(`(max-width: ${IMAGE_CONFIG.SMALL_SIZE.width}px) ${IMAGE_CONFIG.SMALL_SIZE.width}px`);
  }
  
  if (imageSizes.medium) {
    srcSet.push(`${baseUrl}/medium ${IMAGE_CONFIG.MEDIUM_SIZE.width}w`);
    sizes.push(`(max-width: ${IMAGE_CONFIG.MEDIUM_SIZE.width}px) ${IMAGE_CONFIG.MEDIUM_SIZE.width}px`);
  }
  
  if (imageSizes.large) {
    srcSet.push(`${baseUrl}/large ${IMAGE_CONFIG.LARGE_SIZE.width}w`);
    sizes.push(`${IMAGE_CONFIG.LARGE_SIZE.width}px`);
  }
  
  return {
    srcSet: srcSet.join(', '),
    sizes: sizes.join(', ')
  };
};

/**
 * Optimizes image for web display
 */
export const optimizeForWeb = async (file, targetSize = 'medium') => {
  const validation = validateImage(file);
  if (!validation.isValid) {
    throw new Error(validation.errors.map(e => e.message).join(', '));
  }
  
  const image = await loadImage(file);
  const config = IMAGE_CONFIG[`${targetSize.toUpperCase()}_SIZE`] || IMAGE_CONFIG.MEDIUM_SIZE;
  const maxSize = IMAGE_CONFIG[`MAX_${targetSize.toUpperCase()}_SIZE`] || IMAGE_CONFIG.MAX_MEDIUM_SIZE;
  
  // If image is already smaller than target, just compress if needed
  if (image.width <= config.width && image.height <= config.height && file.size <= maxSize) {
    return file.size <= maxSize ? file : await compressImage(image, maxSize);
  }
  
  // Resize and compress
  const resizedBlob = await resizeImage(image, config.width, config.height);
  
  return resizedBlob.size <= maxSize 
    ? resizedBlob 
    : await compressImage(image, maxSize);
};

/**
 * Batch process multiple images
 */
export const batchProcessImages = async (files, options = {}, onProgress = null) => {
  const results = [];
  const total = files.length;
  
  for (let i = 0; i < files.length; i++) {
    try {
      const result = await generateImageSizes(files[i], options);
      results.push({ success: true, file: files[i], result });
      
      if (onProgress) {
        onProgress({
          completed: i + 1,
          total,
          percentage: Math.round(((i + 1) / total) * 100),
          currentFile: files[i].name
        });
      }
    } catch (error) {
      results.push({ success: false, file: files[i], error: error.message });
      
      if (onProgress) {
        onProgress({
          completed: i + 1,
          total,
          percentage: Math.round(((i + 1) / total) * 100),
          currentFile: files[i].name,
          error: error.message
        });
      }
    }
  }
  
  return results;
};
