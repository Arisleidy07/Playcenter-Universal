const productosAll = [
  {
    categoria: "AccesoriosVideojuegos",
    productos: [
      {
        id: 1,
        nombre: "Soporte de control PS5 doble carga",
        imagen: "/Productos/soporte-controles.jpg",
        precio: 25.99,
        descripcion:
          "Soporte dual para cargar tus controles de PS5 con diseño compacto y moderno que ahorra espacio.",
        imagenes: [
          "/Productos/soporte-controles.jpg",
          "/Productos/soporte-controles-2.jpg",
          "/Productos/soporte-controles-3.jpg",
        ],
        oferta: true,
      },
      {
        id: 2,
        nombre: "Base refrigeradora para consola Xbox",
        imagen: "/Productos/base-refrigeracion.jpg",
        precio: 34.99,
        descripcion:
          "Mantén tu Xbox fresca y sin sobrecalentamientos con esta base refrigeradora silenciosa y eficiente.",
        imagenes: [
          "/Productos/base-refrigeracion.jpg",
          "/Productos/base-refrigeracion-2.jpg",
        ],
        oferta: true,
      },
      {
        id: 3,
        nombre: "Auriculares Gaming con micrófono",
        imagen: "/Productos/auriculares-gamer.jpg",
        precio: 44.99,
        descripcion:
          "Auriculares con sonido envolvente y micrófono ajustable para la mejor experiencia gamer y comunicación clara.",
        imagenes: [
          "/Productos/auriculares-gamer.jpg",
          "/Productos/auriculares-gamer-2.jpg",
        ],
        oferta: true,
      },
      {
        id: 4,
        nombre: "Grip antideslizante para Nintendo Switch",
        imagen: "/Productos/grip-switch.jpg",
        precio: 14.99,
        descripcion:
          "Mejora el agarre y la comodidad de tu Nintendo Switch con este grip antideslizante y ergonómico.",
        imagenes: ["/Productos/grip-switch.jpg"],
        oferta: true,
      },
    ],
  },
  {
    categoria: "Audifonos",
    productos: [
      {
        id: 101,
        nombre: "Audífonos Bluetooth",
        imagen: "/Productos/audifonos-bluetooth.jpg",
        precio: 999,
        descripcion:
          "Audífonos inalámbricos Bluetooth con alta calidad de sonido y batería de larga duración.",
        imagenes: ["/Productos/audifonos-bluetooth.jpg"],
        oferta: true,
      },
      {
        id: 102,
        nombre: "Audífonos Gamer RGB",
        imagen: "/Productos/audifonos-gamer.jpg",
        precio: 1299,
        descripcion:
          "Audífonos gamer con iluminación RGB, micrófono ajustable y sonido envolvente para gaming pro.",
        imagenes: ["/Productos/audifonos-gamer.jpg"],
        oferta: true,
      },
    ],
  },
  {
    categoria: "Cables",
    productos: [
      {
        id: 1901,
        nombre: "Cable USB-C a Lightning (1m)",
        imagen: "/Productos/cable-usb-c-lightning.jpg",
        precio: 14.99,
        descripcion:
          "Cable USB-C a Lightning de 1 metro compatible con carga rápida y transferencia de datos.",
        imagenes: ["/Productos/cable-usb-c-lightning.jpg"],
        oferta: true,
      },
      {
        id: 1902,
        nombre: "Cable HDMI 4K 2m",
        imagen: "/Productos/cable-hdmi.jpg",
        precio: 12.99,
        descripcion:
          "Cable HDMI 4K de 2 metros para transmisión de video y audio en alta definición.",
        imagenes: ["/Productos/cable-hdmi.jpg"],
        oferta: true,
      },
    ],
  },
  {
    categoria: "Camaras",
    productos: [
      {
        id: 401,
        nombre: "Cámara Canon EOS 2000D",
        imagen: "/Productos/canon-eos.jpg",
        precio: 499.99,
        descripcion:
          "Cámara DSLR Canon EOS 2000D con sensor APS-C, ideal para fotografía y video de alta calidad.",
        imagenes: [
          "/Productos/canon-eos.jpg",
          "/Productos/canon-eos-2.jpg",
        ],
        oferta: true,
      },
      {
        id: 402,
        nombre: "Cámara GoPro Hero 10",
        imagen: "/Productos/gopro-hero10.jpg",
        precio: 399.99,
        descripcion:
          "GoPro Hero 10 con video 5.3K, estabilización HyperSmooth y diseño resistente para aventuras extremas.",
        imagenes: [
          "/Productos/gopro-hero10.jpg",
          "/Productos/gopro-hero10-2.jpg",
        ],
        oferta: true,
      },
    ],
  },
  {
    categoria: "Cargadores",
    productos: [
      {
        id: 201,
        nombre: "Cargador rápido USB-C",
        imagen: "/Productos/cargador-rapido.jpg",
        precio: 499,
        descripcion:
          "Cargador rápido USB-C compatible con la mayoría de smartphones y tablets para carga eficiente.",
        imagenes: ["/Productos/cargador-rapido.jpg"],
        oferta: true,
      },
      {
        id: 202,
        nombre: "Cargador inalámbrico",
        imagen: "/Productos/cargador-inalambrico.jpg",
        precio: 599,
        descripcion:
          "Cargador inalámbrico rápido con diseño elegante y base antideslizante para smartphones compatibles.",
        imagenes: ["/Productos/cargador-inalambrico.jpg"],
        oferta: true,
      },
    ],
  },
  {
    categoria: "Celulares",
    productos: [
      {
        id: 301,
        nombre: "iPhone 14 Pro",
        imagen: "/Productos/iphone14pro.jpg",
        precio: 999.99,
        descripcion:
          "iPhone 14 Pro con pantalla Super Retina XDR, cámara avanzada y rendimiento potente.",
        imagenes: [
          "/Productos/iphone14pro.jpg",
          "/Productos/iphone14pro-2.jpg",
        ],
        oferta: true,
      },
      {
        id: 302,
        nombre: "Samsung Galaxy S22",
        imagen: "/Productos/galaxy-s22.jpg",
        precio: 899.99,
        descripcion:
          "Samsung Galaxy S22 con pantalla AMOLED, cámara versátil y batería de larga duración.",
        imagenes: [
          "/Productos/galaxy-s22.jpg",
          "/Productos/galaxy-s22-2.jpg",
        ],
        oferta: true,
      },
    ],
  },
  {
    categoria: "Consolas",
    productos: [
      {
        id: 501,
        nombre: "PlayStation 5",
        imagen: "/Productos/ps5.jpg",
        precio: 499.99,
        descripcion:
          "Consola PlayStation 5 con tecnología de nueva generación, juegos exclusivos y gráficos espectaculares.",
        imagenes: [
          "/Productos/ps5.jpg",
          "/Productos/ps5-2.jpg",
          "/Productos/ps5-3.jpg",
        ],
        oferta: true,
      },
      {
        id: 502,
        nombre: "Xbox Series X",
        imagen: "/Productos/xbox.jpg",
        precio: 499.99,
        descripcion:
          "Xbox Series X con potencia increíble, retrocompatibilidad y juegos de última generación.",
        imagenes: [
          "/Productos/xbox.jpg",
          "/Productos/xbox-2.jpg",
          "/Productos/xbox-3.jpg",
        ],
        oferta: true,
      },
    ],
  },
  {
    categoria: "DiscosDuros",
    productos: [
      {
        id: 2001,
        nombre: "Disco duro externo Seagate 1TB",
        imagen: "/Productos/disco-seagate.jpg",
        precio: 59.99,
        descripcion:
          "Disco duro externo Seagate de 1TB con conexión USB 3.0 para almacenamiento rápido y seguro.",
        imagenes: ["/Productos/disco-seagate.jpg"],
        oferta: true,
      },
      {
        id: 2002,
        nombre: "SSD Samsung 500GB",
        imagen: "/Productos/ssd-samsung.jpg",
        precio: 89.99,
        descripcion:
          "Unidad SSD Samsung de 500GB para aumentar la velocidad y rendimiento de tu PC o laptop.",
        imagenes: ["/Productos/ssd-samsung.jpg"],
        oferta: true,
      },
    ],
  },
  {
    categoria: "Electrodomesticos",
    productos: [
      {
        id: 601,
        nombre: "Licuadora Oster",
        imagen: "/Productos/licuadora-oster.jpg",
        precio: 69.99,
        descripcion:
          "Licuadora Oster potente con múltiples velocidades para preparar tus jugos y batidos favoritos.",
        imagenes: ["/Productos/licuadora-oster.jpg"],
        oferta: true,
      },
      {
        id: 602,
        nombre: "Microondas Samsung 1000W",
        imagen: "/Productos/microondas.jpg",
        precio: 129.99,
        descripcion:
          "Microondas Samsung de 1000W con varias funciones y diseño moderno para tu cocina.",
        imagenes: ["/Productos/microondas.jpg"],
        oferta: true,
      },
    ],
  },
  {
    categoria: "GamingChairs",
    productos: [
      {
        id: 701,
        nombre: "Silla Gamer Reclinable RGB",
        imagen: "/Productos/silla-gamer-rgb.jpg",
        precio: 229.99,
        descripcion:
          "Silla gamer reclinable con iluminación RGB y soporte ergonómico para largas sesiones de juego.",
        imagenes: [
          "/Productos/silla-gamer-rgb.jpg",
          "/Productos/silla-gamer-rgb-2.jpg",
        ],
        oferta: true,
      },
      {
        id: 702,
        nombre: "Silla ergonómica con soporte lumbar",
        imagen: "/Productos/silla-ergonomica.jpg",
        precio: 189.99,
        descripcion:
          "Silla ergonómica con soporte lumbar ajustable para máxima comodidad y postura saludable.",
        imagenes: ["/Productos/silla-ergonomica.jpg"],
        oferta: true,
      },
    ],
  },
  {
    categoria: "HogarInteligente",
    productos: [
      {
        id: 801,
        nombre: "Bombillo Wi-Fi inteligente",
        imagen: "/Productos/bombillo-wifi.jpg",
        precio: 19.99,
        descripcion:
          "Bombillo inteligente Wi-Fi compatible con Alexa y Google Home para controlar la luz desde el móvil.",
        imagenes: ["/Productos/bombillo-wifi.jpg"],
        oferta: true,
      },
      {
        id: 802,
        nombre: "Enchufe inteligente Alexa",
        imagen: "/Productos/enchufe-inteligente.jpg",
        precio: 24.99,
        descripcion:
          "Enchufe inteligente compatible con Alexa para controlar tus dispositivos con comandos de voz.",
        imagenes: ["/Productos/enchufe-inteligente.jpg"],
        oferta: true,
      },
    ],
  },
  {
    categoria: "Impresoras",
    productos: [
      {
        id: 901,
        nombre: "Impresora HP DeskJet",
        imagen: "/Productos/hp-deskjet.jpg",
        precio: 79.99,
        descripcion:
          "Impresora HP DeskJet compacta y fácil de usar, ideal para impresión doméstica y documentos básicos.",
        imagenes: ["/Productos/hp-deskjet.jpg"],
        oferta: true,
      },
      {
        id: 902,
        nombre: "Impresora multifunción Epson",
        imagen: "/Productos/epson-multifuncion.jpg",
        precio: 129.99,
        descripcion:
          "Impresora multifunción Epson con funciones de escaneo, copia y Wi-Fi integrado.",
        imagenes: ["/Productos/epson-multifuncion.jpg"],
        oferta: true,
      },
    ],
  },
  {
    categoria: "Laptops",
    productos: [
      {
        id: 1001,
        nombre: "Laptop Lenovo IdeaPad 3",
        imagen: "/Productos/lenovo-ideapad.jpg",
        precio: 599.99,
        descripcion:
          "Laptop Lenovo IdeaPad 3 con procesador Intel, 8GB RAM y almacenamiento SSD para trabajo y estudio.",
        imagenes: ["/Productos/lenovo-ideapad.jpg"],
        oferta: true,
      },
      {
        id: 1002,
        nombre: "MacBook Air M1",
        imagen: "/Productos/macbook-air-m1.jpg",
        precio: 999.99,
        descripcion:
          "MacBook Air con chip M1, rendimiento sorprendente y batería de larga duración para usuarios Apple.",
        imagenes: ["/Productos/macbook-air-m1.jpg"],
        oferta: true,
      },
    ],
  },
  {
    categoria: "MemoriasUSB",
    productos: [
      {
        id: 1101,
        nombre: "USB Kingston 32GB",
        imagen: "/Productos/usb-kingston.jpg",
        precio: 9.99,
        descripcion:
          "Memoria USB Kingston de 32GB para almacenamiento rápido y confiable en formato compacto.",
        imagenes: ["/Productos/usb-kingston.jpg"],
        oferta: true,
      },
      {
        id: 1102,
        nombre: "USB SanDisk 64GB",
        imagen: "/Productos/usb-sandisk.jpg",
        precio: 14.99,
        descripcion:
          "Memoria USB SanDisk de 64GB, perfecta para transportar tus archivos con velocidad y seguridad.",
        imagenes: ["/Productos/usb-sandisk.jpg"],
        oferta: true,
      },
    ],
  },
  {
    categoria: "Monitores",
    productos: [
      {
        id: 1201,
        nombre: "Monitor LG 24'' FHD",
        imagen: "/Productos/monitor-lg.jpg",
        precio: 169.99,
        descripcion:
          "Monitor LG de 24 pulgadas con resolución Full HD, ideal para trabajo y entretenimiento.",
        imagenes: ["/Productos/monitor-lg.jpg"],
        oferta: true,
      },
      {
        id: 1202,
        nombre: "Monitor Samsung Curvo 27''",
        imagen: "/Productos/monitor-samsung.jpg",
        precio: 219.99,
        descripcion:
          "Monitor Samsung curvo de 27 pulgadas para inmersión total en juegos y contenido multimedia.",
        imagenes: ["/Productos/monitor-samsung.jpg"],
        oferta: true,
      },
    ],
  },
  {
    categoria: "Mouses",
    productos: [
      {
        id: 1301,
        nombre: "Mouse Logitech G203 RGB",
        imagen: "/Productos/logitech-g203.jpg",
        precio: 39.99,
        descripcion:
          "Mouse gamer Logitech G203 con iluminación RGB personalizable y alta precisión.",
        imagenes: ["/Productos/logitech-g203.jpg"],
        oferta: true,
      },
      {
        id: 1302,
        nombre: "Mouse inalámbrico Xiaomi",
        imagen: "/Productos/mouse-xiaomi.jpg",
        precio: 19.99,
        descripcion:
          "Mouse inalámbrico Xiaomi con diseño ergonómico y conectividad estable para uso diario.",
        imagenes: ["/Productos/mouse-xiaomi.jpg"],
        oferta: true,
      },
    ],
  },
  {
    categoria: "NuevosLanzamiento",
    productos: [
      {
        id: 1401,
        nombre: "PlayStation Portal",
        imagen: "/Productos/playstation-portal.jpg",
        precio: 299.99,
        descripcion:
          "Dispositivo portátil PlayStation Portal para jugar en streaming con alta calidad gráfica.",
        imagenes: ["/Productos/playstation-portal.jpg"],
        oferta: true,
      },
      {
        id: 1402,
        nombre: "Apple Vision Pro",
        imagen: "/Productos/vision-pro.jpg",
        precio: 3499.99,
        descripcion:
          "Apple Vision Pro, tecnología de realidad mixta con pantalla de alta resolución y controles avanzados.",
        imagenes: ["/Productos/vision-pro.jpg"],
        oferta: true,
      },
    ],
  },
  {
    categoria: "OfertasEspeciales",
    productos: [
      {
        id: 1501,
        nombre: "Combo Teclado + Mouse RGB",
        imagen: "/Productos/combo-rgb.jpg",
        precio: 49.99,
        descripcion:
          "Combo gaming con teclado mecánico y mouse RGB para una experiencia completa y estilizada.",
        imagenes: [
          "/Productos/combo-rgb.jpg",
          "/Productos/combo-rgb-2.jpg",
        ],
        oferta: true,
      },
      {
        id: 1502,
        nombre: "TV LG 50'' con 20% OFF",
        imagen: "/Productos/tv-lg-oferta.jpg",
        precio: 399.99,
        descripcion:
          "Televisor LG 50 pulgadas UHD con descuento especial para disfrutar de tu contenido favorito.",
        imagenes: [
          "/Productos/tv-lg-oferta.jpg",
          "/Productos/tv-lg-oferta-2.jpg",
        ],
        oferta: true,
      },
    ],
  },
  {
    categoria: "RelojesInteligentes",
    productos: [
      {
        id: 1601,
        nombre: "Apple Watch Series 8",
        imagen: "/Productos/apple-watch.jpg",
        precio: 399.99,
        descripcion:
          "Apple Watch Series 8 con monitoreo avanzado de salud y conectividad total con tu iPhone.",
        imagenes: ["/Productos/apple-watch.jpg"],
        oferta: true,
      },
      {
        id: 1602,
        nombre: "Xiaomi Watch S1 Active",
        imagen: "/Productos/xiaomi-watch.jpg",
        precio: 199.99,
        descripcion:
          "Smartwatch Xiaomi Watch S1 Active con GPS, monitoreo de ritmo cardíaco y pantalla AMOLED.",
        imagenes: ["/Productos/xiaomi-watch.jpg"],
        oferta: true,
      },
    ],
  },
  {
    categoria: "SmartTV",
    productos: [
      {
        id: 1701,
        nombre: "Samsung 55'' QLED Smart TV",
        imagen: "/Productos/samsung-qled.jpg",
        precio: 799.99,
        descripcion:
          "Televisor Samsung QLED de 55 pulgadas con resolución 4K y funciones inteligentes.",
        imagenes: [
          "/Productos/samsung-qled.jpg",
          "/Productos/samsung-qled-2.jpg",
        ],
        oferta: true,
      },
      {
        id: 1702,
        nombre: "LG 50'' UHD Smart TV",
        imagen: "/Productos/lg-uhd.jpg",
        precio: 599.99,
        descripcion:
          "Televisor LG 50 pulgadas UHD con sistema Smart TV y conectividad múltiple.",
        imagenes: ["/Productos/lg-uhd.jpg"],
        oferta: true,
      },
    ],
  },
  {
    categoria: "Tablets",
    productos: [
      {
        id: 1801,
        nombre: "iPad 9na generación",
        imagen: "/Productos/ipad9.jpg",
        precio: 329.99,
        descripcion:
          "iPad de 9na generación con pantalla Retina, cámara frontal HD y potente rendimiento.",
        imagenes: ["/Productos/ipad9.jpg"],
        oferta: true,
      },
      {
        id: 1802,
        nombre: "Samsung Galaxy Tab S8",
        imagen: "/Productos/galaxy-tab.jpg",
        precio: 699.99,
        descripcion:
          "Tablet Samsung Galaxy Tab S8 con pantalla AMOLED, lápiz táctil y batería de larga duración.",
        imagenes: ["/Productos/galaxy-tab.jpg"],
        oferta: true,
      },
    ],
  },
  {
    categoria: "Teclados",
    productos: [
      {
        id: 2101,
        nombre: "Teclado mecánico Redragon RGB",
        imagen: "/Productos/teclado-redragon.jpg",
        precio: 49.99,
        descripcion:
          "Teclado mecánico Redragon con iluminación RGB personalizable y teclas anti-ghosting.",
        imagenes: ["/Productos/teclado-redragon.jpg"],
        oferta: true,
      },
      {
        id: 2102,
        nombre: "Teclado inalámbrico Logitech",
        imagen: "/Productos/teclado-logitech.jpg",
        precio: 39.99,
        descripcion:
          "Teclado inalámbrico Logitech compacto y cómodo, ideal para trabajo y ocio.",
        imagenes: ["/Productos/teclado-logitech.jpg"],
        oferta: true,
      },
    ],
  },
  {
    categoria: "Videojuegos",
    productos: [
      {
        id: 2201,
        nombre: "The Legend of Zelda: Tears of the Kingdom",
        imagen: "/Productos/zelda-tears.jpg",
        precio: 69.99,
        descripcion:
          "Aventura épica en The Legend of Zelda: Tears of the Kingdom, exclusiva para Nintendo Switch.",
        imagenes: ["/Productos/zelda-tears.jpg"],
        oferta: true,
      },
      {
        id: 2202,
        nombre: "God of War Ragnarök PS5",
        imagen: "/Productos/god-of-war.jpg",
        precio: 59.99,
        descripcion:
          "Juego God of War Ragnarök para PS5, acción intensa y narrativa envolvente en la mitología nórdica.",
        imagenes: ["/Productos/god-of-war.jpg"],
        oferta: true,
      },
    ],
  },
];

export default productosAll;
