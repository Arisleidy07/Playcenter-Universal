import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

/**
 * UTILIDAD DE EMERGENCIA PARA RECUPERAR PRODUCTO DAÑADO
 *
 * PROBLEMA: Al borrar una reseña, el bug tx.set() sobrescribió todo el documento
 * SOLUCIÓN: Restaurar campos críticos del producto manualmente
 *
 * USO:
 * 1. Cambiar PRODUCT_ID por el ID del producto dañado
 * 2. Ejecutar este script una vez
 * 3. Verificar que el producto se recupere
 */

const PRODUCT_ID = "CAMBIAR_ESTO_POR_EL_ID_REAL"; // ← PONER AQUÍ EL ID DEL PRODUCTO DAÑADO

// Datos de emergencia del producto (ajustar según el producto real)
const EMERGENCY_DATA = {
  // Información básica
  nombre: "Nombre del Producto", // ← Ajustar nombre real
  descripcion: "<p>Descripción del producto</p>", // ← Ajustar descripción real
  precio: 0, // ← Ajustar precio real
  cantidad: 0, // ← Ajustar stock real
  categoria: "general", // ← Ajustar categoría real
  tags: [], // ← Ajustar tags reales
  ownerUid: "", // ← Ajustar ID del vendedor

  // IMÁGENES (CAMPO CRÍTICO)
  imagen: "", // ← URL de imagen principal
  imagenes: [], // ← Array de URLs de imágenes
  videoUrls: [], // ← Array de URLs de videos
  imagenesExtra: [], // ← Array de URLs de imágenes extra

  // Variantes (si aplica)
  variantes: [], // ← Array de variantes si tiene

  // Metadata
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
  isActive: true,

  // Campos de rating (para mantener consistencia)
  ratingCount: 0,
  ratingAverage: 0,
  ratingSum: 0,
  ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
};

async function recoverProduct() {
  if (PRODUCT_ID === "CAMBIAR_ESTO_POR_EL_ID_REAL") {
    console.error(
      "❌ ERROR: Debes cambiar PRODUCT_ID por el ID real del producto dañado"
    );
    return;
  }

  try {
    console.log("🔍 Buscando producto dañado:", PRODUCT_ID);

    // Verificar estado actual del producto
    const productRef = doc(db, "productos", PRODUCT_ID);
    const productSnap = await getDoc(productRef);

    if (!productSnap.exists()) {
      console.error("❌ El producto no existe en la base de datos");
      return;
    }

    const currentData = productSnap.data();
    console.log("📊 Estado actual del producto:", currentData);

    // Campos críticos que faltan (según el bug)
    const missingFields = [];
    const criticalFields = [
      "nombre",
      "imagen",
      "imagenes",
      "precio",
      "descripcion",
    ];

    criticalFields.forEach((field) => {
      if (!currentData[field]) {
        missingFields.push(field);
      }
    });

    console.log("⚠️ Campos faltantes:", missingFields);

    if (missingFields.length === 0) {
      console.log(
        "✅ El producto parece estar completo. Verificando imágenes..."
      );
      console.log("📷 Imagen principal:", currentData.imagen);
      console.log("🖼️ Galería de imágenes:", currentData.imagenes);
      return;
    }

    // Opción 1: Intentar recuperar datos existentes si hay algunos
    const recoveryData = {
      // Mantener cualquier dato existente que no esté dañado
      ...currentData,

      // Restaurar campos críticos faltantes
      nombre: currentData.nombre || EMERGENCY_DATA.nombre,
      descripcion: currentData.descripcion || EMERGENCY_DATA.descripcion,
      precio: currentData.precio || EMERGENCY_DATA.precio,
      cantidad: currentData.cantidad || EMERGENCY_DATA.cantidad,
      categoria: currentData.categoria || EMERGENCY_DATA.categoria,
      tags: currentData.tags || EMERGENCY_DATA.tags,
      ownerUid: currentData.ownerUid || EMERGENCY_DATA.ownerUid,

      // IMÁGENES - CAMPOS MÁS CRÍTICOS
      imagen: currentData.imagen || EMERGENCY_DATA.imagen,
      imagenes: currentData.imagenes || EMERGENCY_DATA.imagenes,
      videoUrls: currentData.videoUrls || EMERGENCY_DATA.videoUrls,
      imagenesExtra: currentData.imagenesExtra || EMERGENCY_DATA.imagenesExtra,
      variantes: currentData.variantes || EMERGENCY_DATA.variantes,

      // Metadata
      isActive: currentData.isActive !== false, // Mantener activo por defecto
      updatedAt: serverTimestamp(),
    };

    console.log("🔧 Datos para recuperación:", recoveryData);

    // Actualizar el documento con los datos recuperados
    await updateDoc(productRef, recoveryData);

    console.log("✅ Producto recuperado exitosamente");
    console.log("🔄 Por favor recarga la página del producto para verificar");

    // Verificación final
    const verifySnap = await getDoc(productRef);
    const verifyData = verifySnap.data();
    console.log("📋 Verificación final:", {
      nombre: verifyData.nombre,
      tieneImagen: !!verifyData.imagen,
      cantidadImagenes: verifyData.imagenes?.length || 0,
      precio: verifyData.precio,
    });
  } catch (error) {
    console.error("❌ Error al recuperar producto:", error);
  }
}

// Exportar para poder ejecutar desde consola del navegador
window.recoverProduct = recoverProduct;

console.log("🚀 Utilidad de recuperación cargada");
console.log(
  "📝 Para usar: 1) Cambia PRODUCT_ID en el script 2) Ejecuta recoverProduct() en la consola"
);
