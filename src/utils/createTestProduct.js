import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export const createTestProduct = async () => {
  const productId = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  const testProduct = {
    id: productId,
    nombre: "Sonido H4 Wireless Control para PS4",
    descripcion: "Control inalámbrico de alta calidad para PlayStation 4 con sonido H4. Conexión estable y diseño ergonómico.",
    precio: 45.99,
    precioOferta: 39.99,
    oferta: true,
    categoria: "accesorios",
    empresa: "H4 Gaming",
    cantidad: 15,
    estado: "Nuevo",
    activo: true,
    fechaCreacion: new Date(),
    fechaActualizacion: new Date(),
    fechaPublicacion: new Date().toISOString().split("T")[0],
    slug: "sonido-h4-wireless-control-para-ps4",
    previousSlugs: [],
    acerca: [
      "Control inalámbrico para PS4",
      "Tecnología de sonido H4",
      "Conexión Bluetooth estable",
      "Batería de larga duración",
      "Diseño ergonómico"
    ],
    etiquetas: ["ps4", "control", "wireless", "gaming", "h4"],
    sku: "H4-PS4-CTRL-001",
    peso: "250g",
    dimensiones: "15x10x6 cm",
    media: [],
    imagenes: [], // Legacy format
    imagenesExtra: [],
    variantes: [
      {
        id: "var_negro",
        color: "Negro",
        cantidad: 8,
        media: []
      },
      {
        id: "var_azul",
        color: "Azul",
        cantidad: 7,
        media: []
      }
    ]
  };

  try {
    await setDoc(doc(db, "productos", productId), testProduct);
    console.log('✅ Producto de prueba creado exitosamente:', productId);
    return { success: true, productId, product: testProduct };
  } catch (error) {
    console.error('❌ Error creando producto de prueba:', error);
    return { success: false, error };
  }
};

export const createMultipleTestProducts = async () => {
  const products = [
    {
      nombre: "Sonido H4 Wireless Control para PS4",
      categoria: "accesorios",
      precio: 45.99,
      descripcion: "Control inalámbrico de alta calidad para PlayStation 4"
    },
    {
      nombre: "Auriculares Gaming Pro H4",
      categoria: "accesorios", 
      precio: 89.99,
      descripcion: "Auriculares profesionales para gaming con sonido envolvente"
    },
    {
      nombre: "Teclado Mecánico RGB H4",
      categoria: "accesorios",
      precio: 129.99,
      descripcion: "Teclado mecánico con iluminación RGB personalizable"
    }
  ];

  const results = [];
  
  for (const productData of products) {
    const productId = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const fullProduct = {
      id: productId,
      ...productData,
      empresa: "H4 Gaming",
      cantidad: Math.floor(Math.random() * 20) + 5,
      estado: "Nuevo",
      activo: true,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
      fechaPublicacion: new Date().toISOString().split("T")[0],
      slug: productData.nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      previousSlugs: [],
      acerca: [productData.descripcion],
      etiquetas: ["gaming", "h4", "tech"],
      media: [],
      imagenes: [],
      imagenesExtra: [],
      variantes: []
    };

    try {
      await setDoc(doc(db, "productos", productId), fullProduct);
      results.push({ success: true, productId, nombre: productData.nombre });
      console.log(`✅ Producto creado: ${productData.nombre} (${productId})`);
    } catch (error) {
      results.push({ success: false, error, nombre: productData.nombre });
      console.error(`❌ Error creando ${productData.nombre}:`, error);
    }
  }

  return results;
};
