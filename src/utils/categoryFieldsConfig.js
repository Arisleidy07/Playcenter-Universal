/**
 * Configuración de campos adicionales por categoría
 * Sistema dinámico estilo Amazon Seller Central
 */

export const CATEGORY_FIELDS_CONFIG = {
  // 🧥 ROPA Y MODA
  ropa: {
    nombre: "Ropa",
    grupos: [
      {
        titulo: "Detalles de Material y Estilo",
        icono: "🧵",
        campos: [
          {
            id: "talla",
            nombre: "Talla (Size)",
            tipo: "select",
            opciones: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
            placeholder: "Selecciona la talla",
          },
          {
            id: "color",
            nombre: "Color",
            tipo: "text",
            placeholder: "Ej: Negro, Azul marino, Rojo",
          },
          {
            id: "material",
            nombre: "Material",
            tipo: "text",
            placeholder: "Ej: 100% Algodón, Poliéster, Mezcla",
          },
          {
            id: "tipoAjuste",
            nombre: "Tipo de Ajuste (Fit Type)",
            tipo: "select",
            opciones: ["Regular", "Slim", "Oversized", "Athletic", "Relaxed"],
            placeholder: "Selecciona el tipo de ajuste",
          },
          {
            id: "estilo",
            nombre: "Estilo",
            tipo: "select",
            opciones: ["Casual", "Deportivo", "Formal", "Elegante", "Urbano"],
            placeholder: "Selecciona el estilo",
          },
        ],
      },
      {
        titulo: "Público y Temporada",
        icono: "👥",
        campos: [
          {
            id: "genero",
            nombre: "Género / Público Objetivo",
            tipo: "select",
            opciones: ["Hombre", "Mujer", "Niño", "Niña", "Unisex"],
            placeholder: "Selecciona el público",
          },
          {
            id: "temporada",
            nombre: "Temporada de Uso",
            tipo: "select",
            opciones: ["Verano", "Invierno", "Otoño", "Primavera", "Todo el año"],
            placeholder: "Selecciona la temporada",
          },
        ],
      },
      {
        titulo: "Cuidado y Mantenimiento",
        icono: "🧼",
        campos: [
          {
            id: "instruccionesCuidado",
            nombre: "Instrucciones de Cuidado",
            tipo: "multiselect",
            opciones: [
              "Lavado a mano",
              "Lavado a máquina",
              "Secado a máquina",
              "No planchar",
              "Planchar a baja temperatura",
              "Limpieza en seco",
              "No usar blanqueador",
            ],
            placeholder: "Selecciona las instrucciones",
          },
        ],
      },
    ],
  },

  // 🎧 ELECTRÓNICA Y TECNOLOGÍA
  electronica: {
    nombre: "Electrónica",
    grupos: [
      {
        titulo: "Información del Fabricante",
        icono: "🏭",
        campos: [
          {
            id: "marca",
            nombre: "Marca",
            tipo: "text",
            placeholder: "Ej: Samsung, Apple, Sony",
          },
          {
            id: "modelo",
            nombre: "Modelo / Número de Serie",
            tipo: "text",
            placeholder: "Ej: Galaxy S24, iPhone 15 Pro",
          },
          {
            id: "garantia",
            nombre: "Garantía del Fabricante",
            tipo: "text",
            placeholder: "Ej: 1 año, 2 años, Sin garantía",
          },
        ],
      },
      {
        titulo: "Compatibilidad y Componentes",
        icono: "⚙️",
        campos: [
          {
            id: "compatibilidad",
            nombre: "Compatibilidad de Dispositivos",
            tipo: "text",
            placeholder: "Ej: iOS 14+, Android 10+, Windows 10/11",
          },
          {
            id: "tipoConexion",
            nombre: "Tipo de Conexión",
            tipo: "multiselect",
            opciones: [
              "USB-C",
              "USB-A",
              "Micro USB",
              "Bluetooth 5.0",
              "Bluetooth 5.3",
              "WiFi",
              "HDMI",
              "Lightning",
              "Jack 3.5mm",
              "Inalámbrico",
            ],
            placeholder: "Selecciona tipos de conexión",
          },
          {
            id: "voltaje",
            nombre: "Voltaje / Fuente de Alimentación",
            tipo: "text",
            placeholder: "Ej: 110-220V, USB 5V, Batería recargable",
          },
          {
            id: "numeroPuertos",
            nombre: "Número Total de Puertos",
            tipo: "number",
            placeholder: "Ej: 4",
          },
        ],
      },
      {
        titulo: "Detalles de Material y Estilo",
        icono: "🧵",
        campos: [
          {
            id: "tipoMaterial",
            nombre: "Tipo de Material / Acabado",
            tipo: "text",
            placeholder: "Ej: Aluminio, Plástico ABS, Vidrio templado",
          },
          {
            id: "contenidoPaquete",
            nombre: "Contenido del Paquete",
            tipo: "textarea",
            placeholder: "Ej: 1x Producto, 1x Cable USB-C, 1x Manual, 1x Adaptador",
          },
        ],
      },
    ],
  },

  // 🧢 ACCESORIOS Y EQUIPOS DEPORTIVOS
  "accesorios-deportivos": {
    nombre: "Accesorios Deportivos",
    grupos: [
      {
        titulo: "Tamaño y Medidas",
        icono: "📏",
        campos: [
          {
            id: "talla",
            nombre: "Talla / Medidas",
            tipo: "text",
            placeholder: "Ej: Talla única, 25cm x 15cm",
          },
          {
            id: "peso",
            nombre: "Peso / Capacidad",
            tipo: "text",
            placeholder: "Ej: 500g, 2kg, 10L",
          },
          {
            id: "color",
            nombre: "Color",
            tipo: "text",
            placeholder: "Ej: Negro, Azul, Verde",
          },
        ],
      },
      {
        titulo: "Detalles de Material y Estilo",
        icono: "🧵",
        campos: [
          {
            id: "materialPrincipal",
            nombre: "Material Principal",
            tipo: "text",
            placeholder: "Ej: Neopreno, Poliéster, Nylon",
          },
          {
            id: "usoRecomendado",
            nombre: "Uso Recomendado",
            tipo: "multiselect",
            opciones: [
              "Ciclismo",
              "Gimnasio",
              "Camping",
              "Running",
              "Yoga",
              "Natación",
              "Fútbol",
              "Basketball",
              "Tenis",
              "Senderismo",
            ],
            placeholder: "Selecciona usos recomendados",
          },
        ],
      },
      {
        titulo: "Certificaciones y Fabricante",
        icono: "✅",
        campos: [
          {
            id: "certificaciones",
            nombre: "Certificaciones (si aplica)",
            tipo: "text",
            placeholder: "Ej: CE, FDA, ISO 9001",
          },
          {
            id: "fabricante",
            nombre: "Fabricante",
            tipo: "text",
            placeholder: "Ej: Nike, Adidas, Under Armour",
          },
        ],
      },
    ],
  },

  // 🏠 HOGAR Y DECORACIÓN
  hogar: {
    nombre: "Hogar y Decoración",
    grupos: [
      {
        titulo: "Tamaño y Medidas",
        icono: "📏",
        campos: [
          {
            id: "dimensiones",
            nombre: "Dimensiones (Alto x Ancho x Largo)",
            tipo: "text",
            placeholder: "Ej: 50cm x 30cm x 20cm",
          },
          {
            id: "peso",
            nombre: "Peso del Producto",
            tipo: "text",
            placeholder: "Ej: 2.5kg",
          },
        ],
      },
      {
        titulo: "Detalles de Material y Estilo",
        icono: "🧵",
        campos: [
          {
            id: "material",
            nombre: "Material",
            tipo: "multiselect",
            opciones: [
              "Madera",
              "Metal",
              "Plástico",
              "Vidrio",
              "Tela",
              "Cerámica",
              "Rattan",
              "Bambú",
            ],
            placeholder: "Selecciona materiales",
          },
          {
            id: "estilo",
            nombre: "Estilo",
            tipo: "select",
            opciones: ["Moderno", "Clásico", "Minimalista", "Vintage", "Industrial", "Rústico"],
            placeholder: "Selecciona el estilo",
          },
          {
            id: "color",
            nombre: "Color",
            tipo: "text",
            placeholder: "Ej: Blanco, Negro, Madera natural",
          },
        ],
      },
      {
        titulo: "Montaje e Instalación",
        icono: "🔧",
        campos: [
          {
            id: "requiereEnsamblaje",
            nombre: "Requiere Ensamblaje",
            tipo: "select",
            opciones: ["Sí", "No", "Parcialmente"],
            placeholder: "Selecciona una opción",
          },
          {
            id: "instruccionesMontaje",
            nombre: "Instrucciones de Montaje/Instalación",
            tipo: "textarea",
            placeholder: "Describe las instrucciones de montaje o instalación",
          },
        ],
      },
    ],
  },

  // 🎮 VIDEOJUEGOS Y CONSOLAS
  videojuegos: {
    nombre: "Videojuegos y Consolas",
    grupos: [
      {
        titulo: "Compatibilidad y Componentes",
        icono: "⚙️",
        campos: [
          {
            id: "plataforma",
            nombre: "Plataforma",
            tipo: "multiselect",
            opciones: [
              "PlayStation 5",
              "PlayStation 4",
              "Xbox Series X/S",
              "Xbox One",
              "Nintendo Switch",
              "PC",
              "Steam Deck",
            ],
            placeholder: "Selecciona plataformas",
          },
          {
            id: "region",
            nombre: "Región / Código de Región",
            tipo: "select",
            opciones: ["NTSC", "PAL", "Region Free", "Digital"],
            placeholder: "Selecciona la región",
          },
          {
            id: "clasificacion",
            nombre: "Clasificación de Edad",
            tipo: "select",
            opciones: ["E (Everyone)", "E10+", "T (Teen)", "M (Mature)", "AO (Adults Only)"],
            placeholder: "Selecciona clasificación",
          },
        ],
      },
      {
        titulo: "Información del Fabricante",
        icono: "🏭",
        campos: [
          {
            id: "desarrollador",
            nombre: "Desarrollador",
            tipo: "text",
            placeholder: "Ej: Nintendo, Sony, Microsoft",
          },
          {
            id: "genero",
            nombre: "Género",
            tipo: "text",
            placeholder: "Ej: Acción, Aventura, RPG, Deportes",
          },
          {
            id: "formato",
            nombre: "Formato",
            tipo: "select",
            opciones: ["Físico", "Digital", "Ambos"],
            placeholder: "Selecciona el formato",
          },
        ],
      },
    ],
  },

  // 📚 LIBROS Y MEDIOS
  libros: {
    nombre: "Libros y Medios",
    grupos: [
      {
        titulo: "Información del Fabricante",
        icono: "🏭",
        campos: [
          {
            id: "autor",
            nombre: "Autor",
            tipo: "text",
            placeholder: "Ej: Gabriel García Márquez",
          },
          {
            id: "editorial",
            nombre: "Editorial",
            tipo: "text",
            placeholder: "Ej: Penguin Random House",
          },
          {
            id: "idioma",
            nombre: "Idioma",
            tipo: "select",
            opciones: ["Español", "Inglés", "Francés", "Alemán", "Italiano", "Portugués"],
            placeholder: "Selecciona el idioma",
          },
          {
            id: "formato",
            nombre: "Formato",
            tipo: "select",
            opciones: ["Tapa dura", "Tapa blanda", "eBook", "Audiolibro"],
            placeholder: "Selecciona el formato",
          },
        ],
      },
      {
        titulo: "Tamaño y Medidas",
        icono: "📏",
        campos: [
          {
            id: "numeroPaginas",
            nombre: "Número de Páginas",
            tipo: "number",
            placeholder: "Ej: 320",
          },
          {
            id: "isbn",
            nombre: "ISBN",
            tipo: "text",
            placeholder: "Ej: 978-3-16-148410-0",
          },
          {
            id: "edicion",
            nombre: "Edición",
            tipo: "text",
            placeholder: "Ej: Primera edición, Edición especial",
          },
        ],
      },
    ],
  },

  // 🍼 BEBÉS Y NIÑOS
  bebes: {
    nombre: "Bebés y Niños",
    grupos: [
      {
        titulo: "Público y Temporada",
        icono: "👥",
        campos: [
          {
            id: "edadRecomendada",
            nombre: "Edad Recomendada",
            tipo: "text",
            placeholder: "Ej: 0-6 meses, 2-4 años",
          },
          {
            id: "genero",
            nombre: "Género",
            tipo: "select",
            opciones: ["Niño", "Niña", "Unisex"],
            placeholder: "Selecciona el género",
          },
        ],
      },
      {
        titulo: "Detalles de Material y Estilo",
        icono: "🧵",
        campos: [
          {
            id: "material",
            nombre: "Material",
            tipo: "text",
            placeholder: "Ej: Algodón orgánico, Silicona libre de BPA",
          },
          {
            id: "certificaciones",
            nombre: "Certificaciones de Seguridad",
            tipo: "text",
            placeholder: "Ej: CE, FDA, ASTM",
          },
        ],
      },
      {
        titulo: "Cuidado y Mantenimiento",
        icono: "🧼",
        campos: [
          {
            id: "instruccionesCuidado",
            nombre: "Instrucciones de Limpieza",
            tipo: "textarea",
            placeholder: "Ej: Lavar a mano con agua tibia, No usar blanqueador",
          },
        ],
      },
    ],
  },

  // 🍎 ALIMENTOS Y BEBIDAS
  alimentos: {
    nombre: "Alimentos y Bebidas",
    grupos: [
      {
        titulo: "Información del Fabricante",
        icono: "🏭",
        campos: [
          {
            id: "marca",
            nombre: "Marca",
            tipo: "text",
            placeholder: "Ej: Coca-Cola, Nestlé",
          },
          {
            id: "paisOrigen",
            nombre: "País de Origen",
            tipo: "text",
            placeholder: "Ej: República Dominicana",
          },
        ],
      },
      {
        titulo: "Tamaño y Medidas",
        icono: "📏",
        campos: [
          {
            id: "contenidoNeto",
            nombre: "Contenido Neto",
            tipo: "text",
            placeholder: "Ej: 500ml, 1kg, 250g",
          },
          {
            id: "fechaCaducidad",
            nombre: "Fecha de Caducidad / Vida Útil",
            tipo: "text",
            placeholder: "Ej: 12 meses desde la fabricación",
          },
        ],
      },
      {
        titulo: "Cuidado y Mantenimiento",
        icono: "🧼",
        campos: [
          {
            id: "instruccionesAlmacenamiento",
            nombre: "Instrucciones de Almacenamiento",
            tipo: "textarea",
            placeholder: "Ej: Conservar en lugar fresco y seco, Refrigerar después de abrir",
          },
          {
            id: "alergenosAdvertencias",
            nombre: "Alérgenos / Advertencias",
            tipo: "textarea",
            placeholder: "Ej: Contiene gluten, Puede contener trazas de frutos secos",
          },
        ],
      },
    ],
  },
};

/**
 * Obtener configuración de campos para una categoría
 * @param {string} categoriaId - ID de la categoría
 * @returns {object|null} Configuración de campos o null si no existe
 */
export const getCategoryFieldsConfig = (categoriaId) => {
  if (!categoriaId) return null;
  
  // Normalizar el ID de categoría para búsqueda
  const normalizedId = categoriaId.toLowerCase().replace(/[^a-z0-9-]/g, "");
  
  // Buscar coincidencia exacta
  if (CATEGORY_FIELDS_CONFIG[normalizedId]) {
    return CATEGORY_FIELDS_CONFIG[normalizedId];
  }
  
  // Buscar coincidencia parcial
  for (const [key, config] of Object.entries(CATEGORY_FIELDS_CONFIG)) {
    if (normalizedId.includes(key) || key.includes(normalizedId)) {
      return config;
    }
  }
  
  return null;
};

/**
 * Obtener todos los nombres de campos estándar para búsqueda y filtrado
 * @returns {Set} Set de nombres de campos únicos
 */
export const getAllStandardFieldNames = () => {
  const fieldNames = new Set();
  
  Object.values(CATEGORY_FIELDS_CONFIG).forEach((categoryConfig) => {
    categoryConfig.grupos.forEach((grupo) => {
      grupo.campos.forEach((campo) => {
        fieldNames.add(campo.id);
      });
    });
  });
  
  return fieldNames;
};
