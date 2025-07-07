const productosAll = [
  {
    categoria: "Retro Consolas",
    productos: [
      {
        id: "rc1",
        nombre: "Nintendo Entertainment System (NES)",
        precio: 120.0,
        imagen: "/Productos/nintendoentertainment.jpeg",
        descripcion: "La consola que marcó el inicio de una generación gamer.",
        imagenes: ["/Productos/nintendoentertainment.jpeg"],
        oferta: true,
        estado: "Nuevo"
      },
      {
        id: "rc2",
        nombre: "Super Nintendo (SNES)",
        precio: 140.0,
        imagen: "/Productos/supernintendo.avif",
        descripcion: "Gráficos coloridos, clásicos como Super Mario World.",
        imagenes: ["/Productos/supernintendo.avif"],
        oferta: false,
        estado: "Nuevo"
      },
      {
        id: "rc3",
        nombre: "Sega Genesis",
        precio: 110.0,
        imagen: "/Productos/segagenesis.webp",
        descripcion: "Sonic, Streets of Rage y más.",
        imagenes: ["/Productos/segagenesis.webp"],
        oferta: true,
        estado: "Nuevo"
      },
      {
        id: "rc4",
        nombre: "PlayStation 1",
        precio: 130.0,
        imagen: "/Productos/playstation1.webp",
        descripcion: "Donde empezó la leyenda de Crash y Final Fantasy.",
        imagenes: ["/Productos/playstation1.webp"],
        oferta: false,
        estado: "Nuevo"
      },
      {
        id: "rc5",
        nombre: "Game Boy Classic",
        precio: 90.0,
        imagen: "/Productos/gameboy.jpg",
        descripcion: "Pokémon Red en tu bolsillo.",
        imagenes: ["/Productos/gameboy.jpg"],
        oferta: true,
        estado: "Nuevo"
      },
      {
        id: "rc6",
        nombre: "Atari 2600",
        precio: 100.0,
        imagen: "/Productos/atari2600.png",
        descripcion: "La precursora de las consolas modernas.",
        imagenes: ["/Productos/atari2600.png"],
        oferta: false,
        estado: "Nuevo"
      },
    ],
  },
{
  categoria: "Retro Juegos",
  productos: [
    {
      id: "rj1",
      nombre: "Super Mario Bros. (NES)",
      precio: 35.0,
      imagen: "/Productos/mariobrosretro.jpg",
      descripcion: "El juego más icónico de plataformas 2D.",
      imagenes: ["/Productos/mariobrosretro.jpg"],
      oferta: true,
      estado: "Nuevo"
    },
    {
      id: "rj2",
      nombre: "The Legend of Zelda (NES)",
      precio: 40.0,
      imagen: "/Productos/zeldaretro.jpg",
      descripcion: "Explora Hyrule en 8 bits.",
      imagenes: ["/Productos/zeldaretro.jpg"],
      oferta: false,
      estado: "Nuevo"
    },
    {
      id: "rj3",
      nombre: "Donkey Kong Country (SNES)",
      precio: 42.0,
      imagen: "/Productos/donkeykongnretro.jpeg",
      descripcion: "Gráficos renderizados pioneros.",
      imagenes: ["/Productos/donkeykongnretro.jpeg"],
      oferta: true,
      estado: "Nuevo"
    },
    {
      id: "rj4",
      nombre: "Crash Bandicoot (PS1)",
      precio: 38.0,
      imagen: "/Productos/crash-bandicoat-PS1.webp",
      descripcion: "Aventura en 3D de culto.",
      imagenes: ["/Productos/crash-bandicoat-PS1.webp"],
      oferta: true,
      estado: "Nuevo"
    },
    {
      id: "rj5",
      nombre: "Final Fantasy VII (PS1)",
      precio: 55.0,
      imagen: "/Productos/ff7.jpg",
      descripcion: "RPG legendario que marcó época.",
      imagenes: ["/Productos/ff7.jpg"],
      oferta: false,
      estado: "Nuevo"
    },
  ],
},

  {
    categoria: "Audífonos",
    productos: [
      {
        id: "au1",
        nombre: "Bluetooth Pro 2024",
        imagen: "/Productos/audifonos-bluetooth.jpg",
        precio: 999,
        descripcion: "Cancelación de ruido con batería de 30h.",
        imagenes: ["/Productos/audifonos-bluetooth.jpg"],
        oferta: true,
        estado: "Nuevo"
      },
      {
        id: "au2",
        nombre: "Auriculares Gamer RGB",
        imagen: "/Productos/audifonos-gamer.jpg",
        precio: 1299,
        descripcion: "Luz, sonido 3D y confort extremo.",
        imagenes: ["/Productos/audifonos-gamer.jpg"],
        oferta: true,
        estado: "Nuevo"
      },
      {
        id: "au3",
        nombre: "In-Ear Pro Noise Cancel",
        imagen: "/Productos/audifonos-inear.jpg",
        precio: 199,
        descripcion: "Sonido puro para llamadas y música.",
        imagenes: ["/Productos/audifonos-inear.jpg"],
        oferta: false,
        estado: "Nuevo"
      },
      {
        id: "au4",
        nombre: "Audífonos deportivos resistentes al agua",
        imagen: "/Productos/audifonos-sport.jpg",
        precio: 149.99,
        descripcion: "Ideales para entrenar sin cables.",
        imagenes: ["/Productos/audifonos-sport.jpg"],
        oferta: true,
        estado: "Nuevo"
      },
    ],
  },
  {
    categoria: "Cables",
    productos: [
      {
        id: "cb1",
        nombre: "USB-C a Lightning (1m)",
        imagen: "/Productos/usb-c.jpg",
        precio: 14.99,
        descripcion: "Carga rápida para iPhone y iPad.",
        imagenes: ["/Productos/usb-c.jpg"],
        oferta: true,
        estado: "Nuevo"
      },
      {
        id: "cb2",
        nombre: "HDMI 4K (2m)",
        imagen: "/Productos/hdmi4k.jpeg",
        precio: 12.99,
        descripcion: "Video y audio en alta definición.",
        imagenes: ["/Productos/hdmi4k.jpeg"],
        oferta: true,
        estado: "Nuevo"
      },
      {
        id: "cb3",
        nombre: "USB 3.0 a Micro USB",
        imagen: "/Productos/micro.jpg",
        precio: 9.99,
        descripcion: "Transferencia rápida para móviles.",
        imagenes: ["/Productos/micro.jpg"],
        oferta: false,
        estado: "Nuevo"
      },
      {
        id: "cb4",
        nombre: "Ethernet Cat6 (1.5m)",
        imagen: "/Productos/ethernet.jpeg",
        precio: 19.99,
        descripcion: "Internet sin interferencias.",
        imagenes: ["/Productos/ethernet.jpg"],
        oferta: true,
        estado: "Nuevo"
      },
      {
        id: "cb5",
        nombre: "DisplayPort 1.4 2m",
        imagen: "/Productos/displayport.jpg",
        precio: 24.99,
        descripcion: "Soporta hasta 8K a 60Hz.",
        imagenes: ["/Productos/displayport.jpg"],
        oferta: true,
        estado: "Nuevo"
      },
    ],
  },
    {
    categoria: "Tu Rincón Variado",
    productos: [
      {
        id: "rv1",
        nombre: "Bicicleta Urbana MTB 26'' Mongoose",
        imagen: "/Productos/mongose.jpg",
        precio: 379.99,
        descripcion: "Mongoose, la clásica MTB para la ciudad y off-road.",
        imagenes: ["/Productos/mongose.jpg"],
        oferta: true,
        estado: "Usado"
      },
      {
        id: "rv2",
        nombre: "Patineta Eléctrica Plegable",
        imagen: "/Productos/patinetaelectrica.jpg",
        precio: 499.99,
        descripcion: "Compacta, ligera, alcance hasta 25km y full power.",
        imagenes: ["/Productos/patinetaelectrica.jpg"],
        oferta: true,
        estado: "Nuevo"
      },
      {
        id: "rv3",
        nombre: "Hoverboard Autoequilibrado 10\"",
        imagen: "/Productos/hoverboard.jpg",
        precio: 299.99,
        descripcion: "Tecnología smart para moverte con estilo y velocidad.",
        imagenes: ["/Productos/hoverboard.jpg"],
        oferta: true,
        estado: "Usado"
      },
      {
        id: "rv4",
        nombre: "Patines en línea 4 ruedas",
        imagen: "/Productos/patines4ruedaasenlinea.jpeg",
        precio: 79.99,
        descripcion: "Estilo y velocidad para deslizarte con flow.",
        imagenes: ["/Productos/patines4ruedaasenlinea.jpeg"],
        oferta: false,
        estado: "Usado"
      },
      {
        id: "rv5",
        nombre: "Patines clásicos 4 ruedas",
        imagen: "/Productos/patinesclasicos.webp",
        precio: 69.99,
        descripcion: "Roller clásico para pura diversión.",
        imagenes: ["/Productos/patinesclasicos.webp"],
        oferta: false,
        estado: "Usado"
      },
      {
        id: "rv6",
        nombre: "Ruedas de repuesto para patineta",
        imagen: "/Productos/ruedapatineta.webp",
        precio: 24.99,
        descripcion: "Juego de 4 ruedas para tu patineta o longboard.",
        imagenes: ["/Productos/ruedapatineta.webp"],
        oferta: true,
        estado: "Usado"
      },
      {
        id: "rv7",
        nombre: "Casco Protector Urbano",
        imagen: "/Productos/casco.jpg",
        precio: 59.99,
        descripcion: "Seguridad y estilo en un solo casco moderno.",
        imagenes: ["/Productos/casco.jpg"],
        oferta: false,
        estado: "Usado"
      },
      {
        id: "rv8",
        nombre: "Botella Térmica 1L Acero Inoxidable",
        imagen: "/Productos/botella.jpg",
        precio: 19.99,
        descripcion: "Mantiene tus bebidas frías o calientes por horas.",
        imagenes: ["/Productos/botella.jpg"],
        oferta: false,
        estado: "Nuevo"
      },
      {
        id: "rv9",
        nombre: "Luz LED Recargable para Bicicleta",
        imagen: "/Productos/lucesbici.webp",
        precio: 24.99,
        descripcion: "Visibilidad garantizada en la noche, USB recargable.",
        imagenes: ["/Productos/lucesbici.webp"],
        oferta: true,
        estado: "Nuevo"
      },
    ],
  },
  {
    categoria: "Cámaras",
    productos: [
    {
    id: "cam1",
    nombre: "Cámara Hikvision Dome 4MP",
    precio: 120,
    descripcion: "Cámara de seguridad tipo Dome con resolución 4MP, visión nocturna y carcasa resistente.",
    categoria: "camaras-vigilancia",
    imagen: "/Productos/hikvision.png",
    estado: "Nuevo"
  },
  {
    id: "cam2",
    nombre: "Cámara Dahua Bullet Full HD",
    precio: 95,
    descripcion: "Cámara Bullet Full HD con lente gran angular, ideal para exteriores.",
    categoria: "camaras-vigilancia",
    imagen: "/Productos/dahua.webp",
    estado: "Nuevo"
  },
  {
    id: "cam3",
    nombre: "Cámara EZVIZ WiFi 1080p",
    precio: 75,
    descripcion: "Cámara WiFi con grabación en la nube, visión nocturna y audio bidireccional.",
    categoria: "camaras-vigilancia",
    imagen: "/Productos/ezviz.png",
    estado: "Nuevo"
  },
  {
    id: "cam4",
    nombre: "Cámara TP-Link Tapo C200",
    precio: 60,
    descripcion: "Cámara PTZ con movimiento horizontal y vertical, notificaciones instantáneas y almacenamiento local.",
    categoria: "camaras-vigilancia",
    imagen: "/Productos/tapo.webp",
    estado: "Nuevo"
  },


    ],
  },
  {
    categoria: "Cargadores",
    productos: [
      {
        id: "cg1",
        nombre: "Cargador rápido USB-C 20W",
        imagen: "/Productos/cargador-rapido.jpg",
        precio: 499,
        descripcion: "Carga eficiente para Android y iPhone.",
        imagenes: ["/Productos/cargador-rapido.jpg"],
        oferta: true,
        estado: "Nuevo"
      },
      {
        id: "cg2",
        nombre: "Cargador inalámbrico universal",
        imagen: "/Productos/cargador-inalambrico.jpg",
        precio: 599,
        descripcion: "Compatible con smartphones que permiten carga por inducción.",
        imagenes: ["/Productos/cargador-inalambrico.jpg"],
        oferta: true,
        estado: "Nuevo"
      },
      {
        id: "cg3",
        nombre: "Power Bank 20,000 mAh",
        imagen: "/Productos/powerbank.jpg",
        precio: 399,
        descripcion: "Carga hasta 3 dispositivos con alta capacidad.",
        imagenes: ["/Productos/powerbank.jpg"],
        oferta: true,
        estado: "Nuevo"
      },
      {
        id: "cg4",
        nombre: "Cargador doble USB 30W",
        imagen: "/Productos/cargador-doble.jpg",
        precio: 299,
        descripcion: "Ideal para cargar dos equipos a la vez.",
        imagenes: ["/Productos/cargador-doble.jpg"],
        oferta: false,
        estado: "Nuevo"
      },
    ],
  },
  {
    categoria: "Celulares",
    productos: [
      {
        id: "cl1",
        nombre: "iPhone 14 Pro",
        imagen: "/Productos/iphone14pro.jpg",
        precio: 999.99,
        descripcion: "Pantalla Super Retina XDR, chip A16 Bionic.",
        imagenes: ["/Productos/iphone14pro.jpg"],
        oferta: true,
        estado: "Nuevo"
      },
      {
        id: "cl2",
        nombre: "Samsung Galaxy S22",
        imagen: "/Productos/galaxy-s22.jpg",
        precio: 899.99,
        descripcion: "Cámara profesional en formato móvil.",
        imagenes: ["/Productos/galaxy-s22.jpg"],
        oferta: true,
        estado: "Nuevo"
      },
      {
        id: "cl3",
        nombre: "Google Pixel 7",
        imagen: "/Productos/pixel7.jpg",
        precio: 799.99,
        descripcion: "Inteligencia artificial integrada al sistema.",
        imagenes: ["/Productos/pixel7.jpg"],
        oferta: false,
        estado: "Nuevo"
      },
      {
        id: "cl4",
        nombre: "Motorola Edge 30",
        imagen: "/Productos/moto-edge30.jpg",
        precio: 699.99,
        descripcion: "Pantalla OLED, 144Hz y gran batería.",
        imagenes: ["/Productos/moto-edge30.jpg"],
        oferta: true,
        estado: "Nuevo"
      },
    ],
  },
{
  categoria: "Consolas",
  productos: [
    {
      id: "cs1",
      nombre: "PlayStation 5",
      imagen: "/Productos/ps5.webp",
      precio: 499.99,
      descripcion: "Gráficos de nueva generación y control DualSense.",
      imagenes: ["/Productos/ps5.webp"],
      oferta: true,
      estado: "Nuevo"
    },
    {
      id: "cs2",
      nombre: "Xbox Series X",
      imagen: "/Productos/xboxseriesx.webp",
      precio: 499.99,
      descripcion: "La consola más potente de Microsoft.",
      imagenes: ["/Productos/xboxseriesx.webp"],
      oferta: true,
      estado: "Nuevo"
    },
    {
      id: "cs3",
      nombre: "Nintendo Switch OLED",
      imagen: "/Productos/nintendoswitch.jpg",
      precio: 349.99,
      descripcion: "Llévala donde quieras con pantalla brillante.",
      imagenes: ["/Productos/nintendoswitch.jpg"],
      oferta: true,
      estado: "Nuevo"
    },
    {
      id: "cs4",
      nombre: "Steam Deck",
      imagen: "/Productos/steam-deck.jpg",
      precio: 399.99,
      descripcion: "Gaming portátil con rendimiento de PC.",
      imagenes: ["/Productos/steam-deck.jpg"],
      oferta: false,
      estado: "Usado"
    },
    {
      id: "cs5",
      nombre: "PlayStation 4",
      imagen: "/Productos/ps4.jpg",
      precio: 299.99,
      descripcion: "La consola que marcó una generación de gamers.",
      imagenes: ["/Productos/ps4.jpg"],
      oferta: true,
      estado: "Usado"
    },
    {
      id: "cs6",
      nombre: "Xbox One",
      imagen: "/Productos/xboxone.webp",
      precio: 279.99,
      descripcion: "Disfruta juegos, entretenimiento y apps en una sola consola.",
      imagenes: ["/Productos/xboxone.webp"],
      oferta: true,
      estado: "Usado"
    },
  ],
},

  {
    categoria: "Discos Duros",
    productos: [
      {
        id: "dd1",
        nombre: "Seagate 1TB Externo",
        imagen: "/Productos/seagate.png",
        precio: 59.99,
        descripcion: "Pequeño, rápido y confiable.",
        imagenes: ["/Productos/seagate.png"],
        oferta: true,
        estado: "Nuevo"
      },
      {
        id: "dd2",
        nombre: "SSD Samsung 500GB",
        imagen: "/Productos/samsung.webp",
        precio: 89.99,
        descripcion: "Perfecto para acelerar tu sistema.",
        imagenes: ["/Productos/samsung.webp"],
        oferta: true,
        estado: "Nuevo"
      },
      {
        id: "dd3",
        nombre: "WD 2TB Externo",
        imagen: "/Productos/wd2tb.jpg",
        precio: 79.99,
        descripcion: "Ideal para respaldo completo.",
        imagenes: ["/Productos/wd2tb.jpg"],
        oferta: false,
        estado: "Nuevo"
      },
      {
        id: "dd4",
        nombre: "Crucial X6 SSD 1TB",
        imagen: "/Productos/crucial.jpg",
        precio: 99.99,
        descripcion: "Ultraportátil con conexión USB-C.",
        imagenes: ["/Productos/crucial.jpg"],
        oferta: true,
        estado: "Nuevo"
      },
      {
        id: "dd5",
        nombre: "LaCie Rugged 4TB",
        imagen: "/Productos/lacie-rugged.jpg",
        precio: 179.99,
        descripcion: "Resistente a golpes y polvo, ideal para creativos.",
        imagenes: ["/Productos/lacie-rugged.jpg"],
        oferta: true,
        estado: "Nuevo"
      },
    ],
  },
  {
    categoria: "Electrodomésticos",
    productos: [
      {
        id: "ed1",
        nombre: "Licuadora Oster clásica",
        imagen: "/Productos/licuadora-oster.jpg",
        precio: 69.99,
        descripcion: "Motor potente con jarra de vidrio.",
        imagenes: ["/Productos/licuadora-oster.jpg"],
        oferta: true,
        estado: "Nuevo"
      },
      {
        id: "ed2",
        nombre: "Microondas Samsung 1000W",
        imagen: "/Productos/microondas.jpg",
        precio: 129.99,
        descripcion: "Moderno, rápido y eficiente.",
        imagenes: ["/Productos/microondas.jpg"],
        oferta: true,
        estado: "Nuevo"
      },
      {
        id: "ed3",
        nombre: "Robot aspiradora Xiaomi",
        imagen: "/Productos/xiaomi-aspiradora.jpg",
        precio: 199.99,
        descripcion: "Limpieza automática vía app.",
        imagenes: ["/Productos/xiaomi-aspiradora.jpg"],
        oferta: false,
        estado: "Nuevo"
      },
      {
        id: "ed4",
        nombre: "Freidora de aire Philips",
        imagen: "/Productos/freidora.jpg",
        precio: 159.99,
        descripcion: "Cocina sin aceite y más saludable.",
        imagenes: ["/Productos/freidora.jpg"],
        oferta: true,
        estado: "Nuevo"
      },
    ],
  },
  {
    categoria: "Gaming Chairs",
    productos: [
      {
        id: "gc1",
        nombre: "Silla Gamer Reclinable RGB",
        imagen: "/Productos/silla-gamer-rgb.jpg",
        precio: 229.99,
        descripcion: "Iluminación RGB y soporte lumbar acolchado.",
        imagenes: ["/Productos/silla-gamer-rgb.jpg"],
        oferta: true,   
        estado: "Nuevo"
      },
      {
        id: "gc2",
        nombre: "Silla Ergonómica con cojines ajustables",
        imagen: "/Productos/silla-gamer-cojines.jpg",
        precio: 199.99,
        descripcion: "Reposacabeza ajustable y respaldo reforzado.",
        imagenes: ["/Productos/silla-gamer-cojines.jpg"],
        oferta: false,
        estado: "Nuevo"
      },
      {
        id: "gc3",
        nombre: "Silla barata Gamer negra",
        imagen: "/Productos/silla-gamer-barata.jpg",
        precio: 129.99,
        descripcion: "Diseño básico pero funcional.",
        imagenes: ["/Productos/silla-gamer-barata.jpg"],
        oferta: true,
        estado: "Nuevo"
      },
      {
        id: "gc4",
        nombre: "Silla Gaming con reposapiés",
        imagen: "/Productos/silla-reposapies.jpg",
        precio: 189.99,
        descripcion: "Máxima comodidad en sesiones largas.",
        imagenes: ["/Productos/silla-reposapies.jpg"],
        oferta: true,
        estado: "Nuevo"
      },
    ],
  },
  {
    categoria: "Laptops",
    productos: [
      {
        id: "lp1",
        nombre: "Laptop Dell Inspiron 15",
        imagen: "/Productos/dell-inspiron15.jpg",
        precio: 799.99,
        descripcion: "Intel i5, SSD 256GB, pantalla 15.6”.",
        imagenes: ["/Productos/dell-inspiron15.jpg"],
        oferta: true,
        estado: "Nuevo"
      },
      {
        id: "lp2",
        nombre: "MacBook Air M2",
        imagen: "/Productos/macbook-air-m2.jpg",
        precio: 1199.99,
        descripcion: "Ligera, elegante y veloz.",
        imagenes: ["/Productos/macbook-air-m2.jpg"],
        oferta: false,
        estado: "Nuevo"
      },
      {
        id: "lp3",
        nombre: "ASUS ROG Gamer",
        imagen: "/Productos/asus-rog.jpg",
        precio: 1499.99,
        descripcion: "Tarjeta gráfica potente y diseño agresivo.",
        imagenes: ["/Productos/asus-rog.jpg"],
        oferta: true,
        estado: "Nuevo"
      },
      {
        id: "lp4",
        nombre: "Lenovo IdeaPad 3",
        imagen: "/Productos/ideapad.jpg",
        precio: 649.99,
        descripcion: "Perfecta para estudiantes y oficina.",
        imagenes: ["/Productos/ideapad.jpg"],
        oferta: true,
        estado: "Nuevo"
      },
    ],
  },
  {
    categoria: "Monitores",
    productos: [
      {
        id: "mn1",
        nombre: "LG 27 pulgadas 4K",
        imagen: "/Productos/monitor-lg-4k.jpg",
        precio: 399.99,
        descripcion: "Colores vibrantes para diseño y gaming.",
        imagenes: ["/Productos/monitor-lg-4k.jpg"],
        oferta: true,
        estado: "Nuevo"
      },
      {
        id: "mn2",
        nombre: "Samsung Curvo 32 pulgadas",
        imagen: "/Productos/monitor-samsung-curvo.jpg",
        precio: 349.99,
        descripcion: "Inmersión completa con su forma curva.",
        imagenes: ["/Productos/monitor-samsung-curvo.jpg"],
        oferta: true,
        estado: "Nuevo"
      },
      {
        id: "mn3",
        nombre: "Acer 24 pulgadas Full HD",
        imagen: "/Productos/monitor-acer-24.jpg",
        precio: 199.99,
        descripcion: "Rápido y eficiente para tareas cotidianas.",
        imagenes: ["/Productos/monitor-acer-24.jpg"],
        oferta: false,
        estado: "Nuevo"
      },
      {
        id: "mn4",
        nombre: "Monitor BenQ 144Hz 27”",
        imagen: "/Productos/monitor-benq.jpg",
        precio: 289.99,
        descripcion: "Ideal para eSports.",
        imagenes: ["/Productos/monitor-benq.jpg"],
        oferta: true,
        estado: "Nuevo"
      },
    ],
  },
  {
    categoria: "Tablets",
    productos: [
      {
        id: "tb1",
        nombre: "iPad Pro 12.9",
        imagen: "/Productos/ipad-pro.jpg",
        precio: 999.99,
        descripcion: "Chip M1 y pantalla Liquid Retina.",
        imagenes: ["/Productos/ipad-pro.jpg"],
        oferta: true,
        estado: "Nuevo"
      },
      {
        id: "tb2",
        nombre: "Samsung Galaxy Tab S8",
        imagen: "/Productos/galaxy-tab-s8.jpg",
        precio: 799.99,
        descripcion: "Ligera, potente y con pantalla AMOLED.",
        imagenes: ["/Productos/galaxy-tab-s8.jpg"],
        oferta: false,
        estado: "Nuevo"
      },
      {
        id: "tb3",
        nombre: "Amazon Fire HD 10",
        imagen: "/Productos/fire-hd10.jpg",
        precio: 149.99,
        descripcion: "Ideal para lectura y video.",
        imagenes: ["/Productos/fire-hd10.jpg"],
        oferta: true,
        estado: "Nuevo"
      },
      {
        id: "tb4",
        nombre: "Huawei MatePad 10.4",
        imagen: "/Productos/huawei-matepad.jpg",
        precio: 299.99,
        descripcion: "Diseño delgado y pantalla nítida.",
        imagenes: ["/Productos/huawei-matepad.jpg"],
        oferta: true,
        estado: "Nuevo"
      },
    ],
  },
  {
    categoria: "Teclados",
    productos: [
      {
        id: "tk1",
        nombre: "Teclado inalámbrico Logitech K380",
        imagen: "/Productos/teclado-logitech-k380.jpg",
        precio: 39.99,
        descripcion: "Multidispositivo, compacto y silencioso.",
        imagenes: ["/Productos/teclado-logitech-k380.jpg"],
        oferta: true,
        estado: "Nuevo"
      },
      {
        id: "tk2",
        nombre: "Teclado mecánico RGB gaming",
        imagen: "/Productos/teclado-gamer-rgb.jpg",
        precio: 79.99,
        descripcion: "Iluminación personalizable y switches táctiles.",
        imagenes: ["/Productos/teclado-gamer-rgb.jpg"],
        oferta: true,
        estado: "Nuevo"
      },
      {
        id: "tk3",
        nombre: "Teclado ergonómico dividido Microsoft",
        imagen: "/Productos/teclado-ergonomico.jpg",
        precio: 59.99,
        descripcion: "Diseño para largas sesiones de escritura.",
        imagenes: ["/Productos/teclado-ergonomico.jpg"],
        oferta: false,
        estado: "Nuevo"
      },
    ],
  },
{
  categoria: "Videojuegos",
  productos: [
    {
      id: "vj1",
      nombre: "FIFA 23",
      imagen: "/Productos/fifa23.jpg",
      precio: 59.99,
      descripcion: "Fútbol con mejoras gráficas y físicas.",
      imagenes: ["/Productos/fifa23.jpg"],
      oferta: true,
      estado: "Nuevo"
    },
    {
      id: "vj3",
      nombre: "The Legend of Zelda: Breath of the Wild",
      imagen: "/Productos/zelda.webp",
      precio: 59.99,
      descripcion: "Aventura épica en mundo abierto.",
      imagenes: ["/Productos/zelda.webp"],
      oferta: true,
      estado: "Nuevo"
    },
    {
      id: "vj4",
      nombre: "Gran Turismo 7",
      imagen: "/Productos/gt7.jpg",
      precio: 69.99,
      descripcion: "Simulación de autos realista.",
      imagenes: ["/Productos/gt7.jpg"],
      oferta: true,
      estado: "Nuevo"
    },
    {
      id: "vj5",
      nombre: "Marvel's Spider-Man: Miles Morales (PS5)",
      imagen: "/Productos/spider-manps5.jpeg",
      precio: 49.99,
      descripcion: "Ágil y cinematográfica aventura del universo Marvel.",
      imagenes: ["/Productos/spider-manps5.jpeg"],
      oferta: true,
      estado: "Nuevo"
    },
    {
      id: "vj6",
      nombre: "Mario Kart 8 Deluxe (Switch)",
      imagen: "/Productos/Mario-Kart-8.jpeg",
      precio: 59.99,
      descripcion: "Carreras locas, ítems clásicos y multiplayer épico.",
      imagenes: ["/Productos/Mario-Kart-8.jpeg"],
      oferta: false,
      estado: "Nuevo"
    },
    {
      id: "vj7",
      nombre: "Super Smash Bros. Ultimate (Switch)",
      imagen: "/Productos/super-smash-bros.jpg",
      precio: 64.99,
      descripcion: "El crossover de batallas más grande de Nintendo.",
      imagenes: ["/Productos/super-smash-bros.jpg"],
      oferta: true,
      estado: "Nuevo"
    },
  ],
},
{
  categoria: "Smart TV",
  productos: [
    {
      id: "tv1",
        nombre: "Samsung Smart TV 55\" UHD",
        imagen: "/Productos/samsung-smarttv.jpg",
        precio: 499.99,
        descripcion: "4K UHD, control por voz y apps integradas.",
        imagenes: ["/Productos/samsung-smarttv.jpg"],
        oferta: true,
        estado: "Nuevo"
      },
      {
        id: "tv2",
        nombre: "LG OLED 65 pulgadas",
        imagen: "/Productos/lg-oled65.jpg",
        precio: 1199.99,
        descripcion: "Negros profundos y colores realistas.",
        imagenes: ["/Productos/lg-oled65.jpg"],
        oferta: false,
        estado: "Nuevo"
      },
      {
        id: "tv3",
        nombre: "Hisense 43\" FHD Smart TV",
        imagen: "/Productos/hisense-43.jpg",
        precio: 299.99,
        descripcion: "Compacta y con acceso rápido a streaming.",
        imagenes: ["/Productos/hisense-43.jpg"],
        oferta: true,
        estado: "Nuevo"
      },
    ],
  },
  {
    categoria: "Memorias USB",
    productos: [
      {
        id: "usb1",
        nombre: "USB SanDisk 64GB",
        imagen: "/Productos/sandisk.jpeg",
        precio: 12.99,
        descripcion: "Compacta y veloz para llevar tus archivos.",
        imagenes: ["/Productos/sandisk.jpeg"],
        oferta: true,
        estado: "Nuevo"
      },
      {
        id: "usb2",
        nombre: "Kingston 128GB USB 3.1",
        imagen: "/Productos/kingston.webp",
        precio: 19.99,
        descripcion: "Velocidades superiores para trabajo o backup.",
        imagenes: ["/Productos/kingston.webp"],
        oferta: false,
        estado: "Nuevo"
      },
      {
        id: "usb3",
        nombre: "HP v150w 32GB",
        imagen: "/Productos/hp.jpeg",
        precio: 8.99,
        descripcion: "Diseño duradero y práctico.",
        imagenes: ["/Productos/hp.jpeg"],
        oferta: true,
        estado: "Nuevo"
      },
      {
        id: "usb4",
        nombre: "Corsair Flash Voyager 256GB",
        imagen: "/Productos/corsair.avif",
        precio: 49.99,
        descripcion: "Almacenamiento masivo en formato USB 3.0.",
        imagenes: ["/Productos/corsair.avif"],
        oferta: true,
        estado: "Nuevo"
      },
      {
        id: "usb5",
        nombre: "Patriot Supersonic Rage 2 128GB",
        imagen: "/Productos/patriot-rage2.jpg",
        precio: 39.99,
        descripcion: "Transferencia ultrarrápida hasta 400MB/s.",
        imagenes: ["/Productos/patriot-rage2.jpg"],
        oferta: false,
        estado: "Nuevo"
      },
    ],
  },
{
  categoria: "Hogar Inteligente",
  productos: [
    {
      id: "hi1",
      nombre: "Foco inteligente Wi-Fi RGB",
      imagen: "/Productos/foco-inteligente.jpg",
      precio: 24.99,
      descripcion: "Control desde app o comandos de voz.",
      imagenes: ["/Productos/foco-inteligente.jpg"],
      oferta: true,
      estado: "Usado"
    },
    {
      id: "hi2",
      nombre: "Enchufe inteligente TP-Link",
      imagen: "/Productos/enchufe-inteligente.jpg",
      precio: 21.99,
      descripcion: "Enciende o apaga tus dispositivos remotamente.",
      imagenes: ["/Productos/enchufe-inteligente.jpg"],
      oferta: false,
      estado: "Usado"
    },
    {
      id: "hi4",
      nombre: "Sensor de movimiento Wi-Fi",
      imagen: "/Productos/sensor-movimiento.jpg",
      precio: 19.99,
      descripcion: "Detecta presencia y envía alertas a tu celular.",
      imagenes: ["/Productos/sensor-movimiento.jpg"],
      oferta: true,
      estado: "Usado"
    },
    {
      id: "hi5",
      nombre: "Interruptor de pared inteligente",
      imagen: "/Productos/interruptor-inteligente.jpg",
      precio: 29.99,
      descripcion: "Convierte cualquier luz convencional en smart.",
      imagenes: ["/Productos/interruptor-inteligente.jpg"],
      oferta: false,
      estado: "Usado"
    },
    {
      id: "hi6",
      nombre: "Sensor de puertas y ventanas",
      imagen: "/Productos/sensor-puerta.jpg",
      precio: 17.99,
      descripcion: "Recibe notificaciones cuando se abren o cierran.",
      imagenes: ["/Productos/sensor-puerta.jpg"],
      oferta: true,
      estado: "Usado"
    },
    {
      id: "hi7",
      nombre: "Humidificador inteligente con luz LED",
      imagen: "/Productos/humidificador-smart.jpg",
      precio: 34.99,
      descripcion: "Conéctalo a Alexa o Google Assistant y relájate.",
      imagenes: ["/Productos/humidificador-smart.jpg"],
      oferta: true,
      estado: "Usado"
    },
    {
      id: "hi8",
      nombre: "Amazon Echo Dot 4ta Generación",
      imagen: "/Productos/echo-dot.jpg",
      precio: 49.99,
      descripcion: "Altavoz inteligente con Alexa integrado.",
      imagenes: ["/Productos/echo-dot.jpg"],
      oferta: true,
      estado: "Usado"
    },
    {
      id: "hi9",
      nombre: "Amazon Echo Show 8",
      imagen: "/Productos/echo-show-8.jpg",
      precio: 89.99,
      descripcion: "Pantalla inteligente para videollamadas y control del hogar.",
      imagenes: ["/Productos/echo-show-8.jpg"],
      oferta: true,
      estado: "Usado"
    },
    {
      id: "hi10",
      nombre: "Echo Auto",
      imagen: "/Productos/echo-auto.jpg",
      precio: 49.99,
      descripcion: "Alexa para tu vehículo con manos libres.",
      imagenes: ["/Productos/echo-auto.jpg"],
      oferta: false,
      estado: "Usado"
    },
    {
      id: "hi11",
      nombre: "Smart Plug compatible con Alexa",
      imagen: "/Productos/smart-plug-alexa.jpg",
      precio: 19.99,
      descripcion: "Controla cualquier aparato con comandos de voz.",
      imagenes: ["/Productos/smart-plug-alexa.jpg"],
      oferta: true,
      estado: "Usado"
    },
    {
      id: "hi12",
      nombre: "Control remoto infrarrojo inteligente",
      imagen: "/Productos/ir-remote.jpg",
      precio: 23.99,
      descripcion: "Control universal de TV, aire y más vía Alexa.",
      imagenes: ["/Productos/ir-remote.jpg"],
      oferta: false,
      estado: "Usado"
    },
  ],
},


  {
  categoria: "Impresoras",
  productos: [
    {
      id: "imp001",
      nombre: "Impresora Epson EcoTank L3250",
      imagen: "/Productos/epson-l3250.jpg",
      precio: 229.99,
      descripcion:
        "Impresora multifuncional con sistema de tinta continua, ideal para hogar y oficina.",
      imagenes: ["/Productos/epson-l3250.jpg"],
      oferta: true,
      estado: "Usado"
    },
    {
      id: "imp002",
      nombre: "HP DeskJet 4155e All-in-One",
      imagen: "/Productos/hp-deskjet.jpg",
      precio: 119.99,
      descripcion:
        "Impresión inalámbrica, escaneo y copia desde tu celular con la app HP Smart.",
      imagenes: ["/Productos/hp-deskjet.jpg"],
      oferta: false,
      estado: "Usado"
    },
    {
      id: "imp003",
      nombre: "Brother HL-L2350DW Láser monocromática",
      imagen: "/Productos/brother-hl.jpg",
      precio: 179.99,
      descripcion:
        "Impresora láser rápida y compacta con Wi-Fi y auto dúplex.",
      imagenes: ["/Productos/brother-hl.jpg"],
      oferta: true,
      estado: "Usado"
    },
    {
      id: "imp004",
      nombre: "Canon PIXMA G5020",
      imagen: "/Productos/canon-pixma-g5020.jpg",
      precio: 199.99,
      descripcion:
        "Tanques de tinta integrados, gran rendimiento por página, ideal para impresión masiva.",
      imagenes: ["/Productos/canon-pixma-g5020.jpg"],
      oferta: false,
      estado: "Usado"
    }
  ]
  },

  {
    categoria: "Nuevos Lanzamientos",
    productos: [
      {
        id: "nl1",
        nombre: "PlayStation Portal",
        imagen: "/Productos/playstation-portal.jpg",
        precio: 199.99,
        descripcion: "Juego remoto de PS5 en tus manos.",
        imagenes: ["/Productos/playstation-portal.jpg"],
        oferta: true,
        estado: "Usado"
      },
      {
        id: "nl2",
        nombre: "Apple Vision Pro",
        imagen: "/Productos/vision-pro.jpg",
        precio: 3499.00,
        descripcion: "Revoluciona tu espacio con realidad mixta.",
        imagenes: ["/Productos/vision-pro.jpg"],
        oferta: false,
        estado: "Usado"
      },
      {
        id: "nl3",
        nombre: "Nintendo Switch 2 ",
        imagen: "/Productos/switch2.jpg",
        precio: 449.99,
        descripcion: "Pantalla mejorada, nuevo dock y retrocompatibilidad.",
        imagenes: ["/Productos/switch2.jpg"],
        oferta: true,
        estado: "Usado"
      },
    ],
  },
  {
    categoria: "Ofertas Especiales",
    productos: [
      {
        id: "of1",
        nombre: "Combo: PS5 + 2 juegos",
        imagen: "/Productos/combo-ps5.jpg",
        precio: 549.99,
        descripcion: "Incluye Spider-Man y God of War.",
        imagenes: ["/Productos/combo-ps5.jpg"],
        oferta: true,
        estado: "Nuevo"
      },
      {
        id: "of2",
        nombre: "Combo gamer: Silla + Mousepad RGB",
        imagen: "/Productos/combo-gamer.jpg",
        precio: 279.99,
        descripcion: "Estilo, comodidad y precisión.",
        imagenes: ["/Productos/combo-gamer.jpg"],
        oferta: true,
        estado: "Nuevo"
      },
      {
        id: "of3",
        nombre: "Oferta Smart TV + Soporte",
        imagen: "/Productos/combo-tv.jpg",
        precio: 519.99,
        descripcion: "Ideal para tu setup de sala o habitación.",
        imagenes: ["/Productos/combo-tv.jpg"],
        oferta: true,
        estado: "Nuevo"
      },
    ],
  },
  {
    categoria: "Relojes Inteligentes",
    productos: [
      {
        id: "rl1",
        nombre: "Apple Watch Series 9",
        imagen: "/Productos/apple-watch9.jpg",
        precio: 399.99,
        descripcion: "Monitoreo avanzado de salud y entrenamiento.",
        imagenes: ["/Productos/apple-watch9.jpg"],
        oferta: true,
        estado: "Nuevo"
      },
      {
        id: "rl2",
        nombre: "Samsung Galaxy Watch 6",
        imagen: "/Productos/galaxy-watch6.jpg",
        precio: 299.99,
        descripcion: "Diseño elegante y duración de batería sólida.",
        imagenes: ["/Productos/galaxy-watch6.jpg"],
        oferta: true,
        estado: "Nuevo"
      },
      {
        id: "rl3",
        nombre: "Xiaomi Watch S1 Active",
        imagen: "/Productos/xiaomi-watch.jpg",
        precio: 169.99,
        descripcion: "Resistente al agua y con más de 100 modos deportivos.",
        imagenes: ["/Productos/xiaomi-watch.jpg"],
        oferta: false,
        estado: "Nuevo"
      },
    ],
  },
  {
  categoria: "AccesoriosVideojuegos",
  productos: [
    {
      id: "av1",
      nombre: "Controlador Inalámbrico Xbox Series X",
      imagen: "/Productos/control-xbox.jpg",
      precio: 59.99,
      descripcion: "Diseño ergonómico con agarre antideslizante y respuesta háptica precisa.",
      imagenes: ["/Productos/control-xbox.jpg"],
      oferta: true,
      estado: "Nuevo"
    },
    {
      id: "av2",
      nombre: "Headset Gaming Logitech G733",
      imagen: "/Productos/logitech-g733.jpg",
      precio: 129.99,
      descripcion: "Auriculares inalámbricos con sonido envolvente y micrófono de calidad profesional.",
      imagenes: ["/Productos/logitech-g733.jpg"],
      oferta: false,
      estado: "Nuevo"
    },
    {
      id: "av3",
      nombre: "Teclado Mecánico Razer BlackWidow V3",
      imagen: "/Productos/razer-teclado.jpg",
      precio: 139.99,
      descripcion: "Switches mecánicos verdes y retroiluminación RGB personalizable.",
      imagenes: ["/Productos/razer-teclado.jpg"],
      oferta: true,
      estado: "Nuevo"
    },
  ],
},
{
  categoria: "Mouses",
  productos: [
    {
      id: "m1",
      nombre: "Mouse Gamer Logitech G502 HERO",
      imagen: "/Productos/logitech-g502.jpg",
      precio: 69.99,
      descripcion: "Sensor HERO 25K con 25,600 DPI y 11 botones programables.",
      imagenes: ["/Productos/logitech-g502.jpg"],
      oferta: true,
      estado: "Usado"
    },
    {
      id: "m2",
      nombre: "Mouse Inalámbrico Razer Basilisk X",
      imagen: "/Productos/razer-basilisk-x.jpg",
      precio: 49.99,
      descripcion: "Conectividad inalámbrica Bluetooth y 16,000 DPI.",
      imagenes: ["/Productos/razer-basilisk-x.jpg"],
      oferta: false,
      estado: "Usado"
    },
    {
      id: "m3",
      nombre: "Mouse Corsair M65 RGB Elite",
      imagen: "/Productos/corsair-m65.jpg",
      precio: 59.99,
      descripcion: "Carcasa de aluminio y peso ajustable para máxima precisión.",
      imagenes: ["/Productos/corsair-m65.jpg"],
      oferta: true,
      estado: "Usado"
    },
  ],
},
{
  categoria: "Controles",
  productos: [
    {
      id: "c1",
      nombre: "Control Inalámbrico PS5 DualSense",
      imagen: "/Productos/ps5-dualsense.jpg",
      precio: 69.99,
      descripcion: "Inmersión háptica y gatillos adaptativos para una experiencia de juego revolucionaria.",
      imagenes: ["/Productos/ps5-dualsense.jpg"],
      oferta: true,
      estado: "Usado"
    },
    {
      id: "c2",
      nombre: "Control Xbox Series X",
      imagen: "/Productos/xbox-seriesx.jpg",
      precio: 59.99,
      descripcion: "Diseño mejorado con texturizado y latencia reducida.",
      imagenes: ["/Productos/xbox-seriesx.jpg"],
      oferta: false,
      estado: "Usado"
    },
    {
      id: "c3",
      nombre: "Nintendo Switch Pro Controller",
      imagen: "/Productos/switch-pro.jpg",
      precio: 69.99,
      descripcion: "Ergonómico, batería de larga duración y controles precisos.",
      imagenes: ["/Productos/switch-pro.jpg"],
      oferta: true,
      estado: "Usado"
    },
    {
      id: "c4",
      nombre: "Control Inalámbrico Logitech F710",
      imagen: "/Productos/logitech-f710.jpg",
      precio: 49.99,
      descripcion: "Compatibilidad con PC y vibración dual.",
      imagenes: ["/Productos/logitech-f710.jpg"],
      oferta: false,
      estado: "Usado"
    }
  ]
}


];

export default productosAll;
