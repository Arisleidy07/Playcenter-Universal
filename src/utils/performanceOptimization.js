/**
 * Performance Optimization Utilities
 * Handles lazy loading, CDN integration, and caching strategies
 */

// Performance configuration
export const PERFORMANCE_CONFIG = {
  // Lazy loading
  INTERSECTION_THRESHOLD: 0.1,
  INTERSECTION_ROOT_MARGIN: '50px',
  
  // Image optimization
  WEBP_SUPPORT: null, // Will be detected
  AVIF_SUPPORT: null, // Will be detected
  
  // Caching
  CACHE_DURATION: {
    IMAGES: 7 * 24 * 60 * 60 * 1000, // 7 days
    DATA: 5 * 60 * 1000, // 5 minutes
    STATIC: 30 * 24 * 60 * 60 * 1000 // 30 days
  },
  
  // CDN settings
  CDN_BASE_URL: import.meta.env.VITE_CDN_URL || '',
  IMAGE_TRANSFORMS: {
    thumbnail: 'w_150,h_150,c_fill,f_auto,q_auto',
    small: 'w_300,h_300,c_fill,f_auto,q_auto',
    medium: 'w_600,h_600,c_fill,f_auto,q_auto',
    large: 'w_1200,h_1200,c_fill,f_auto,q_auto'
  },
  
  // Preloading
  MAX_PRELOAD_IMAGES: 5,
  PRELOAD_PRIORITY_THRESHOLD: 3
};

/**
 * Detects browser support for modern image formats
 */
export const detectImageFormatSupport = () => {
  return new Promise((resolve) => {
    const results = { webp: false, avif: false };
    let pending = 2;
    
    const checkComplete = () => {
      pending--;
      if (pending === 0) {
        PERFORMANCE_CONFIG.WEBP_SUPPORT = results.webp;
        PERFORMANCE_CONFIG.AVIF_SUPPORT = results.avif;
        resolve(results);
      }
    };
    
    // Check WebP support
    const webpImg = new Image();
    webpImg.onload = webpImg.onerror = () => {
      results.webp = webpImg.height === 2;
      checkComplete();
    };
    webpImg.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    
    // Check AVIF support
    const avifImg = new Image();
    avifImg.onload = avifImg.onerror = () => {
      results.avif = avifImg.height === 2;
      checkComplete();
    };
    avifImg.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
  });
};

/**
 * Creates optimized image URL with CDN transformations
 */
export const createOptimizedImageUrl = (originalUrl, size = 'medium', options = {}) => {
  if (!originalUrl) return null;
  
  const {
    format = 'auto',
    quality = 'auto',
    progressive = true,
    sharpen = false
  } = options;
  
  // If no CDN configured, return original
  if (!PERFORMANCE_CONFIG.CDN_BASE_URL) {
    return originalUrl;
  }
  
  // Build transformation string
  const transforms = [];
  
  // Size transformation
  if (PERFORMANCE_CONFIG.IMAGE_TRANSFORMS[size]) {
    transforms.push(PERFORMANCE_CONFIG.IMAGE_TRANSFORMS[size]);
  }
  
  // Format optimization
  if (format === 'auto') {
    if (PERFORMANCE_CONFIG.AVIF_SUPPORT) {
      transforms.push('f_avif');
    } else if (PERFORMANCE_CONFIG.WEBP_SUPPORT) {
      transforms.push('f_webp');
    }
  } else if (format !== 'original') {
    transforms.push(`f_${format}`);
  }
  
  // Quality optimization
  if (quality !== 'original') {
    transforms.push(`q_${quality}`);
  }
  
  // Progressive loading
  if (progressive) {
    transforms.push('fl_progressive');
  }
  
  // Sharpening
  if (sharpen) {
    transforms.push('e_sharpen');
  }
  
  const transformString = transforms.join(',');
  
  // Handle different URL formats
  if (originalUrl.startsWith('http')) {
    // External URL - use fetch transformation
    return `${PERFORMANCE_CONFIG.CDN_BASE_URL}/image/fetch/${transformString}/${encodeURIComponent(originalUrl)}`;
  } else {
    // Internal URL - direct transformation
    return `${PERFORMANCE_CONFIG.CDN_BASE_URL}/image/upload/${transformString}/${originalUrl}`;
  }
};

/**
 * Creates responsive image srcset
 */
export const createResponsiveImageSrcSet = (originalUrl, options = {}) => {
  if (!originalUrl) return { src: null, srcSet: null, sizes: null };
  
  const sizes = ['thumbnail', 'small', 'medium', 'large'];
  const srcSetEntries = [];
  const sizesEntries = [];
  
  sizes.forEach(size => {
    const url = createOptimizedImageUrl(originalUrl, size, options);
    if (url) {
      const config = PERFORMANCE_CONFIG.IMAGE_TRANSFORMS[size];
      if (config) {
        const width = config.match(/w_(\d+)/)?.[1];
        if (width) {
          srcSetEntries.push(`${url} ${width}w`);
          
          // Add size descriptor
          switch (size) {
            case 'thumbnail':
              sizesEntries.push('(max-width: 150px) 150px');
              break;
            case 'small':
              sizesEntries.push('(max-width: 300px) 300px');
              break;
            case 'medium':
              sizesEntries.push('(max-width: 600px) 600px');
              break;
            case 'large':
              sizesEntries.push('1200px');
              break;
          }
        }
      }
    }
  });
  
  return {
    src: createOptimizedImageUrl(originalUrl, 'medium', options),
    srcSet: srcSetEntries.join(', '),
    sizes: sizesEntries.join(', ')
  };
};

/**
 * Lazy loading intersection observer
 */
class LazyLoadManager {
  constructor() {
    this.observer = null;
    this.loadedImages = new Set();
    this.init();
  }
  
  init() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        this.handleIntersection.bind(this),
        {
          threshold: PERFORMANCE_CONFIG.INTERSECTION_THRESHOLD,
          rootMargin: PERFORMANCE_CONFIG.INTERSECTION_ROOT_MARGIN
        }
      );
    }
  }
  
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.loadImage(entry.target);
        this.observer.unobserve(entry.target);
      }
    });
  }
  
  loadImage(img) {
    if (this.loadedImages.has(img)) return;
    
    const src = img.dataset.src;
    const srcSet = img.dataset.srcset;
    
    if (src) {
      img.src = src;
    }
    
    if (srcSet) {
      img.srcset = srcSet;
    }
    
    img.classList.remove('lazy-loading');
    img.classList.add('lazy-loaded');
    
    this.loadedImages.add(img);
    
    // Dispatch custom event
    img.dispatchEvent(new CustomEvent('lazyloaded', {
      detail: { src, srcSet }
    }));
  }
  
  observe(img) {
    if (this.observer && img) {
      img.classList.add('lazy-loading');
      this.observer.observe(img);
    } else {
      // Fallback for browsers without IntersectionObserver
      this.loadImage(img);
    }
  }
  
  unobserve(img) {
    if (this.observer && img) {
      this.observer.unobserve(img);
    }
  }
  
  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Global lazy load manager instance
export const lazyLoadManager = new LazyLoadManager();

/**
 * Preloads critical images
 */
export const preloadCriticalImages = (imageUrls, priority = 'high') => {
  if (!Array.isArray(imageUrls)) return;
  
  const preloadPromises = imageUrls
    .slice(0, PERFORMANCE_CONFIG.MAX_PRELOAD_IMAGES)
    .map(url => {
      return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = createOptimizedImageUrl(url, 'medium');
        
        if (priority === 'high') {
          link.fetchPriority = 'high';
        }
        
        link.onload = () => resolve(url);
        link.onerror = () => reject(new Error(`Failed to preload ${url}`));
        
        document.head.appendChild(link);
      });
    });
  
  return Promise.allSettled(preloadPromises);
};

/**
 * Memory-based cache implementation
 */
class MemoryCache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }
  
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    // Check expiration
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    // Move to end (LRU)
    this.cache.delete(key);
    this.cache.set(key, item);
    
    return item.data;
  }
  
  set(key, data, ttl = PERFORMANCE_CONFIG.CACHE_DURATION.DATA) {
    // Remove oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl
    });
  }
  
  delete(key) {
    return this.cache.delete(key);
  }
  
  clear() {
    this.cache.clear();
  }
  
  size() {
    return this.cache.size;
  }
}

// Global cache instances
export const imageCache = new MemoryCache(50);
export const dataCache = new MemoryCache(100);

/**
 * Cached fetch with automatic retry
 */
export const cachedFetch = async (url, options = {}) => {
  const {
    cache = true,
    ttl = PERFORMANCE_CONFIG.CACHE_DURATION.DATA,
    retries = 3,
    retryDelay = 1000
  } = options;
  
  const cacheKey = `fetch_${url}_${JSON.stringify(options)}`;
  
  // Check cache first
  if (cache) {
    const cached = dataCache.get(cacheKey);
    if (cached) {
      return cached;
    }
  }
  
  // Fetch with retry logic
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Cache successful response
      if (cache) {
        dataCache.set(cacheKey, data, ttl);
      }
      
      return data;
    } catch (error) {
      lastError = error;
      
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
      }
    }
  }
  
  throw lastError;
};

/**
 * Debounced function utility
 */
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
};

/**
 * Throttled function utility
 */
export const throttle = (func, limit) => {
  let inThrottle;
  
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Performance monitoring utilities
 */
export const performanceMonitor = {
  // Measure function execution time
  measure: (name, fn) => {
    return async (...args) => {
      const start = performance.now();
      const result = await fn(...args);
      const end = performance.now();
      
      console.log(`${name} took ${end - start} milliseconds`);
      return result;
    };
  },
  
  // Mark performance milestones
  mark: (name) => {
    if ('performance' in window && 'mark' in performance) {
      performance.mark(name);
    }
  },
  
  // Measure between marks
  measureBetween: (name, startMark, endMark) => {
    if ('performance' in window && 'measure' in performance) {
      performance.measure(name, startMark, endMark);
    }
  },
  
  // Get performance entries
  getEntries: (type = 'measure') => {
    if ('performance' in window && 'getEntriesByType' in performance) {
      return performance.getEntriesByType(type);
    }
    return [];
  }
};

/**
 * Resource hints for better loading performance
 */
export const addResourceHints = (urls, type = 'prefetch') => {
  if (!Array.isArray(urls)) return;
  
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = type; // 'prefetch', 'preload', 'dns-prefetch', 'preconnect'
    link.href = url;
    
    if (type === 'preload') {
      link.as = 'image';
    }
    
    document.head.appendChild(link);
  });
};

/**
 * Initialize performance optimizations
 */
export const initializePerformanceOptimizations = async () => {
  // Detect image format support
  await detectImageFormatSupport();
  
  // Add DNS prefetch for CDN
  if (PERFORMANCE_CONFIG.CDN_BASE_URL) {
    addResourceHints([PERFORMANCE_CONFIG.CDN_BASE_URL], 'dns-prefetch');
  }
  
  // Add preconnect for critical domains
  const criticalDomains = [
    'https://firebasestorage.googleapis.com',
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
  ];
  
  addResourceHints(criticalDomains, 'preconnect');
  
  // Performance optimizations initialized
};
