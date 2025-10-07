/**
 * Test utility for the enhanced product media system
 * This file contains functions to test the functionality of the product media system
 */

import { getDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Tests the product duplication functionality
 * @param {string} originalProductId - ID of the product to duplicate
 * @returns {Promise<Object>} - Result of the test
 */
export const testProductDuplication = async (originalProductId) => {
  try {
    console.log('🧪 TESTING PRODUCT DUPLICATION');
    console.log(`📋 Original Product ID: ${originalProductId}`);
    
    // Verify the original product exists
    const originalProductRef = doc(db, 'productos', originalProductId);
    const originalProductSnap = await getDoc(originalProductRef);
    
    if (!originalProductSnap.exists()) {
      return { 
        success: false, 
        error: 'Original product does not exist' 
      };
    }
    
    const originalProduct = originalProductSnap.data();
    console.log('✅ Original product found');
    
    // Create a duplicate product with a new ID
    const newProductId = `test_prod_${Date.now()}`;
    
    // Deep clone the product
    const newProduct = JSON.parse(JSON.stringify(originalProduct));
    
    // Update specific fields
    newProduct.nombre = `TEST: ${originalProduct.nombre} (Copy)`;
    newProduct.fechaCreacion = new Date();
    newProduct.fechaActualizacion = new Date();
    
    // Generate new IDs for variants
    if (Array.isArray(newProduct.variantes) && newProduct.variantes.length > 0) {
      newProduct.variantes = newProduct.variantes.map(variante => {
        const newVariante = { ...variante };
        newVariante.id = `test_var_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        
        // Update media IDs for variants
        if (Array.isArray(newVariante.media) && newVariante.media.length > 0) {
          newVariante.media = newVariante.media.map(medio => ({
            ...medio,
            id: `test_med_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
          }));
        }
        
        return newVariante;
      });
    }
    
    // Update media IDs for the main product
    if (Array.isArray(newProduct.media) && newProduct.media.length > 0) {
      newProduct.media = newProduct.media.map(medio => ({
        ...medio,
        id: `test_med_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
      }));
    }
    
    // Save the new product to Firestore
    await updateDoc(doc(db, 'productos', newProductId), newProduct);
    
    console.log(`✅ Test product created with ID: ${newProductId}`);
    
    return {
      success: true,
      originalProductId,
      newProductId,
      message: 'Product successfully duplicated'
    };
  } catch (error) {
    console.error('❌ Error testing product duplication:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Tests the variant media functionality
 * @param {string} productId - ID of the product to test
 * @returns {Promise<Object>} - Result of the test
 */
export const testVariantMedia = async (productId) => {
  try {
    console.log('🧪 TESTING VARIANT MEDIA');
    console.log(`📋 Product ID: ${productId}`);
    
    // Verify the product exists
    const productRef = doc(db, 'productos', productId);
    const productSnap = await getDoc(productRef);
    
    if (!productSnap.exists()) {
      return { 
        success: false, 
        error: 'Product does not exist' 
      };
    }
    
    const product = productSnap.data();
    console.log('✅ Product found');
    
    // Check if the product has variants
    if (!Array.isArray(product.variantes) || product.variantes.length === 0) {
      return {
        success: false,
        error: 'Product has no variants'
      };
    }
    
    // Count variants with media
    const variantsWithMedia = product.variantes.filter(
      variant => Array.isArray(variant.media) && variant.media.length > 0
    );
    
    console.log(`📊 Total variants: ${product.variantes.length}`);
    console.log(`📊 Variants with media: ${variantsWithMedia.length}`);
    
    // Check product media
    const hasProductMedia = Array.isArray(product.media) && product.media.length > 0;
    console.log(`📊 Product has main media: ${hasProductMedia ? 'Yes' : 'No'}`);
    
    if (hasProductMedia) {
      console.log(`📊 Main media items: ${product.media.length}`);
      
      // Count media types
      const mediaTypes = product.media.reduce((acc, media) => {
        acc[media.type] = (acc[media.type] || 0) + 1;
        return acc;
      }, {});
      
      console.log('📊 Media types:', mediaTypes);
    }
    
    return {
      success: true,
      productId,
      variantCount: product.variantes.length,
      variantsWithMediaCount: variantsWithMedia.length,
      hasProductMedia,
      mediaCount: hasProductMedia ? product.media.length : 0,
      message: 'Variant media test completed'
    };
  } catch (error) {
    console.error('❌ Error testing variant media:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Tests the object-contain property on images
 * This is a client-side test that should be run in the browser
 * @returns {Object} - Result of the test
 */
export const testObjectContain = () => {
  try {
    console.log('🧪 TESTING OBJECT-CONTAIN ON IMAGES');
    
    // Find all product images in the current page
    const productImages = document.querySelectorAll('.vp-main-gallery img, .vp-secondary-gallery img');
    
    if (productImages.length === 0) {
      return {
        success: false,
        error: 'No product images found on the page'
      };
    }
    
    console.log(`📊 Found ${productImages.length} product images`);
    
    // Check if all images have object-contain
    let imagesWithObjectContain = 0;
    
    productImages.forEach(img => {
      const style = window.getComputedStyle(img);
      if (style.objectFit === 'contain') {
        imagesWithObjectContain++;
      } else {
        console.warn('❌ Image without object-contain:', img);
      }
    });
    
    console.log(`📊 Images with object-contain: ${imagesWithObjectContain}/${productImages.length}`);
    
    return {
      success: true,
      totalImages: productImages.length,
      imagesWithObjectContain,
      allImagesHaveObjectContain: imagesWithObjectContain === productImages.length,
      message: 'Object-contain test completed'
    };
  } catch (error) {
    console.error('❌ Error testing object-contain:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Tests the "Más acerca de este artículo" section for videos
 * This is a client-side test that should be run in the browser
 * @returns {Object} - Result of the test
 */
export const testFeaturedVideosSection = () => {
  try {
    console.log('🧪 TESTING "MÁS ACERCA DE ESTE ARTÍCULO" SECTION');
    
    // Find the featured videos section
    const featuredSection = document.querySelector('.vp-featured-section');
    
    if (!featuredSection) {
      return {
        success: false,
        error: 'Featured videos section not found on the page'
      };
    }
    
    console.log('✅ Featured videos section found');
    
    // Check if the section has videos
    const videos = featuredSection.querySelectorAll('video');
    console.log(`📊 Found ${videos.length} videos in the featured section`);
    
    // Check if videos have proper attributes
    let videosWithPreload = 0;
    let videosWithControls = 0;
    
    videos.forEach(video => {
      if (video.preload === 'metadata') {
        videosWithPreload++;
      }
      
      if (video.controls) {
        videosWithControls++;
      }
    });
    
    console.log(`📊 Videos with preload="metadata": ${videosWithPreload}/${videos.length}`);
    console.log(`📊 Videos with controls: ${videosWithControls}/${videos.length}`);
    
    return {
      success: true,
      totalVideos: videos.length,
      videosWithPreload,
      videosWithControls,
      allVideosHavePreload: videosWithPreload === videos.length,
      allVideosHaveControls: videosWithControls === videos.length,
      message: 'Featured videos section test completed'
    };
  } catch (error) {
    console.error('❌ Error testing featured videos section:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Run all tests
 * @param {string} productId - ID of the product to test
 * @returns {Promise<Object>} - Results of all tests
 */
export const runAllTests = async (productId) => {
  try {
    console.log('🧪 RUNNING ALL TESTS');
    console.log(`📋 Product ID: ${productId}`);
    
    const results = {};
    
    // Test product duplication
    results.duplication = await testProductDuplication(productId);
    
    // Test variant media
    results.variantMedia = await testVariantMedia(productId);
    
    // Client-side tests need to be run in the browser
    console.log('ℹ️ Client-side tests (object-contain and featured videos) need to be run in the browser');
    
    return {
      success: results.duplication.success && results.variantMedia.success,
      results,
      message: 'All tests completed'
    };
  } catch (error) {
    console.error('❌ Error running all tests:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  testProductDuplication,
  testVariantMedia,
  testObjectContain,
  testFeaturedVideosSection,
  runAllTests
};
