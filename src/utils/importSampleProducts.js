import { db } from '../firebase';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';

// Productos de muestra
const sampleProducts = [
  {
    id: 'prod_nintendo_switch',
    nombre: 'Nintendo Switch',
    descripcion: 'Consola Nintendo Switch con Joy-Con',
    precio: 15990,
    cantidad: 10,
    categoria: 'cat_consolas',
    empresa: 'Nintendo',
    activo: true,
    fechaCreacion: new Date(),
    fechaActualizacion: new Date(),
    imagen: 'https://firebasestorage.googleapis.com/v0/b/playcenter-universal.appspot.com/o/productos%2Fimages%2FNS.jpg?alt=media',
    media: [
      {
        id: 'media_1',
        type: 'image',
        url: 'https://firebasestorage.googleapis.com/v0/b/playcenter-universal.appspot.com/o/productos%2Fimages%2FNS.jpg?alt=media'
      }
    ],
    slug: 'nintendo-switch',
    variantes: [
      {
        id: 'var_switch_neon',
        color: 'Neon',
        colorHex: '#FF0000',
        cantidad: 5,
        media: [
          {
            id: 'media_var_1',
            type: 'image',
            url: 'https://firebasestorage.googleapis.com/v0/b/playcenter-universal.appspot.com/o/productos%2Fimages%2FNS.jpg?alt=media'
          }
        ]
      },
      {
        id: 'var_switch_gray',
        color: 'Gris',
        colorHex: '#808080',
        cantidad: 5,
        media: [
          {
            id: 'media_var_2',
            type: 'image',
            url: 'https://firebasestorage.googleapis.com/v0/b/playcenter-universal.appspot.com/o/productos%2Fimages%2FN.jpg?alt=media'
          }
        ]
      }
    ]
  },
  {
    id: 'prod_mario_kart',
    nombre: 'Mario Kart 8 Deluxe',
    descripcion: 'Juego Mario Kart 8 Deluxe para Nintendo Switch',
    precio: 2990,
    cantidad: 20,
    categoria: 'cat_juegos',
    empresa: 'Nintendo',
    activo: true,
    fechaCreacion: new Date(),
    fechaActualizacion: new Date(),
    imagen: 'https://firebasestorage.googleapis.com/v0/b/playcenter-universal.appspot.com/o/productos%2Fimages%2FMario-Kart-8.jpeg?alt=media',
    media: [
      {
        id: 'media_mk_1',
        type: 'image',
        url: 'https://firebasestorage.googleapis.com/v0/b/playcenter-universal.appspot.com/o/productos%2Fimages%2FMario-Kart-8.jpeg?alt=media'
      }
    ],
    slug: 'mario-kart-8-deluxe'
  },
  {
    id: 'prod_sony_dualshock',
    nombre: 'Sony DualShock 4',
    descripcion: 'Control inalámbrico DualShock 4 para PlayStation 4',
    precio: 3490,
    cantidad: 15,
    categoria: 'cat_accesorios',
    empresa: 'Sony',
    activo: true,
    fechaCreacion: new Date(),
    fechaActualizacion: new Date(),
    imagen: 'https://firebasestorage.googleapis.com/v0/b/playcenter-universal.appspot.com/o/productos%2Fimages%2Fdualshock.jpg?alt=media',
    media: [
      {
        id: 'media_ds_1',
        type: 'image',
        url: 'https://firebasestorage.googleapis.com/v0/b/playcenter-universal.appspot.com/o/productos%2Fimages%2Fdualshock.jpg?alt=media'
      }
    ],
    slug: 'sony-dualshock-4',
    variantes: [
      {
        id: 'var_ds_black',
        color: 'Negro',
        colorHex: '#000000',
        cantidad: 5,
        media: [
          {
            id: 'media_var_ds_1',
            type: 'image',
            url: 'https://firebasestorage.googleapis.com/v0/b/playcenter-universal.appspot.com/o/productos%2Fimages%2Fdualshock.jpg?alt=media'
          }
        ]
      },
      {
        id: 'var_ds_white',
        color: 'Blanco',
        colorHex: '#FFFFFF',
        cantidad: 5,
        media: [
          {
            id: 'media_var_ds_2',
            type: 'image',
            url: 'https://firebasestorage.googleapis.com/v0/b/playcenter-universal.appspot.com/o/productos%2Fimages%2Fdualshock_white.jpg?alt=media'
          }
        ]
      },
      {
        id: 'var_ds_red',
        color: 'Rojo',
        colorHex: '#FF0000',
        cantidad: 5,
        media: [
          {
            id: 'media_var_ds_3',
            type: 'image',
            url: 'https://firebasestorage.googleapis.com/v0/b/playcenter-universal.appspot.com/o/productos%2Fimages%2Fdualshock_red.jpg?alt=media'
          }
        ]
      }
    ]
  }
];

// Categorías de muestra
const sampleCategories = [
  {
    id: 'cat_consolas',
    nombre: 'Consolas',
    descripcion: 'Consolas de videojuegos',
    imagen: 'https://firebasestorage.googleapis.com/v0/b/playcenter-universal.appspot.com/o/categorias%2Fconsolas.jpg?alt=media',
    orden: 1,
    activa: true
  },
  {
    id: 'cat_juegos',
    nombre: 'Juegos',
    descripcion: 'Juegos para consolas',
    imagen: 'https://firebasestorage.googleapis.com/v0/b/playcenter-universal.appspot.com/o/categorias%2Fjuegos.jpg?alt=media',
    orden: 2,
    activa: true
  },
  {
    id: 'cat_accesorios',
    nombre: 'Accesorios',
    descripcion: 'Accesorios para consolas',
    imagen: 'https://firebasestorage.googleapis.com/v0/b/playcenter-universal.appspot.com/o/categorias%2Faccesorios.jpg?alt=media',
    orden: 3,
    activa: true
  }
];

// Función para importar productos de muestra
export const importSampleProducts = async () => {
  try {
    console.log('🔄 Verificando productos existentes...');
    
    // Verificar si ya hay productos
    const productsSnapshot = await getDocs(collection(db, 'productos'));
    if (productsSnapshot.size > 0) {
      console.log(`ℹ️ Ya existen ${productsSnapshot.size} productos en la base de datos.`);
      return {
        success: true,
        message: `Ya existen ${productsSnapshot.size} productos en la base de datos.`,
        existingProducts: productsSnapshot.size
      };
    }
    
    console.log('🔄 Importando productos de muestra...');
    
    // Importar categorías
    for (const category of sampleCategories) {
      await setDoc(doc(db, 'categorias', category.id), category);
      console.log(`✅ Categoría importada: ${category.nombre}`);
    }
    
    // Importar productos
    for (const product of sampleProducts) {
      await setDoc(doc(db, 'productos', product.id), product);
      console.log(`✅ Producto importado: ${product.nombre}`);
    }
    
    console.log('✅ Importación completada con éxito');
    return {
      success: true,
      message: 'Productos y categorías importados con éxito',
      productsImported: sampleProducts.length,
      categoriesImported: sampleCategories.length
    };
  } catch (error) {
    console.error('❌ Error al importar productos:', error);
    return {
      success: false,
      message: `Error al importar productos: ${error.message}`,
      error
    };
  }
};

export default importSampleProducts;
