// Utilidades para manejo de imágenes
export const validateImageUrl = async (url) => {
  if (!url || typeof url !== 'string') return false;
  
  try {
    // Verificar si es una URL válida
    new URL(url);
    
    // Verificar si la imagen existe
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.warn('URL de imagen inválida:', url, error);
    return false;
  }
};

export const getValidImageUrl = (imageUrls = []) => {
  // Convertir a array si es un string
  const urls = Array.isArray(imageUrls) ? imageUrls : [imageUrls];
  
  // Filtrar URLs válidas
  const validUrls = urls.filter(url => {
    if (!url || typeof url !== 'string') return false;
    
    // Verificar que no sea una URL blob (temporal)
    if (url.startsWith('blob:')) return false;
    
    // Verificar que sea una URL de Firebase válida
    if (url.includes('firebasestorage.googleapis.com') || 
        url.includes('firebasestorage.app')) {
      return true;
    }
    
    // Permitir URLs externas válidas
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  });
  
  return validUrls[0] || null;
};

export const cleanupBrokenImages = (products = []) => {
  return products.map(product => {
    const cleanProduct = { ...product };
    
    // Limpiar imagen principal
    if (cleanProduct.imagen) {
      cleanProduct.imagen = getValidImageUrl(cleanProduct.imagen);
    }
    
    // Limpiar imágenes principales estructuradas
    if (cleanProduct.imagenPrincipal && Array.isArray(cleanProduct.imagenPrincipal)) {
      cleanProduct.imagenPrincipal = cleanProduct.imagenPrincipal
        .filter(img => getValidImageUrl(img?.url || img))
        .map(img => typeof img === 'string' ? { url: img } : img);
    }
    
    // Limpiar galería de imágenes
    if (cleanProduct.galeriaImagenes && Array.isArray(cleanProduct.galeriaImagenes)) {
      cleanProduct.galeriaImagenes = cleanProduct.galeriaImagenes
        .filter(img => getValidImageUrl(img?.url || img))
        .map(img => typeof img === 'string' ? { url: img } : img);
    }
    
    // Limpiar imágenes legacy
    if (cleanProduct.imagenes && Array.isArray(cleanProduct.imagenes)) {
      cleanProduct.imagenes = cleanProduct.imagenes
        .filter(url => getValidImageUrl(url));
    }
    
    // Limpiar imágenes extra
    if (cleanProduct.imagenesExtra && Array.isArray(cleanProduct.imagenesExtra)) {
      cleanProduct.imagenesExtra = cleanProduct.imagenesExtra
        .filter(url => getValidImageUrl(url));
    }
    
    // Limpiar tres archivos extras
    if (cleanProduct.tresArchivosExtras && Array.isArray(cleanProduct.tresArchivosExtras)) {
      cleanProduct.tresArchivosExtras = cleanProduct.tresArchivosExtras
        .filter(url => getValidImageUrl(url));
    }
    
    // Limpiar variantes
    if (cleanProduct.variantes && Array.isArray(cleanProduct.variantes)) {
      cleanProduct.variantes = cleanProduct.variantes.map(variant => {
        const cleanVariant = { ...variant };
        
        if (cleanVariant.imagen) {
          cleanVariant.imagen = getValidImageUrl(cleanVariant.imagen);
        }
        
        if (cleanVariant.imagenPrincipal && Array.isArray(cleanVariant.imagenPrincipal)) {
          cleanVariant.imagenPrincipal = cleanVariant.imagenPrincipal
            .filter(img => getValidImageUrl(img?.url || img))
            .map(img => typeof img === 'string' ? { url: img } : img);
        }
        
        if (cleanVariant.galeriaImagenes && Array.isArray(cleanVariant.galeriaImagenes)) {
          cleanVariant.galeriaImagenes = cleanVariant.galeriaImagenes
            .filter(img => getValidImageUrl(img?.url || img))
            .map(img => typeof img === 'string' ? { url: img } : img);
        }
        
        if (cleanVariant.imagenes && Array.isArray(cleanVariant.imagenes)) {
          cleanVariant.imagenes = cleanVariant.imagenes
            .filter(url => getValidImageUrl(url));
        }
        
        return cleanVariant;
      });
    }
    
    return cleanProduct;
  });
};

export const getImageWithFallback = (primaryUrl, fallbackUrls = [], placeholder = '/placeholder-image.png') => {
  const allUrls = [primaryUrl, ...fallbackUrls].filter(Boolean);
  
  for (const url of allUrls) {
    const validUrl = getValidImageUrl(url);
    if (validUrl) return validUrl;
  }
  
  return placeholder;
};
