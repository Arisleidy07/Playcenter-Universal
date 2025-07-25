const productosAll = [
  {
    categoria: "Retro Consolas",
    productos: [
      {
        id: "rc1",
        nombre: "Nintendo Entertainment System (NES)",
        precio: 120.0,
        descripcion: "La consola que marcó el inicio de una generación gamer.",
        imagen: "/Productos/nintendoentertainment.jpeg",
        imagenes: ["/Productos/nintendoentertainment.jpeg"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Incluye un control clásico",
          "Compatible con cartuchos originales y réplicas",
          "Salida AV para TV modernas",
          "Fácil de conectar y usar"
        ],
        variantes: [
          {
            color: "Gris",
            imagen: "/Productos/nintendoentertainment.jpeg",
            imagenes: ["/Productos/nintendoentertainment.jpeg"],
            cantidad: 3
          }
        ]
      },
      {
        id: "rc2",
        nombre: "Super Nintendo (SNES)",
        precio: 140.0,
        descripcion: "Gráficos coloridos, clásicos como Super Mario World.",
        imagen: "/Productos/supernintendo.avif",
        imagenes: ["/Productos/supernintendo.avif"],
        oferta: false,
        estado: "Nuevo",
        acerca: [
          "Incluye dos controles",
          "Soporta juegos PAL y NTSC",
          "Salida AV y S-Video",
          "Compacta y fácil de instalar"
        ],
        variantes: [
          {
            color: "Gris",
            imagen: "/Productos/supernintendo.avif",
            imagenes: ["/Productos/supernintendo.avif"],
            cantidad: 2
          }
        ]
      },
      {
        id: "rc3",
        nombre: "Sega Genesis",
        precio: 110.0,
        descripcion: "Sonic, Streets of Rage y más.",
        imagen: "/Productos/segagenesis.webp",
        imagenes: ["/Productos/segagenesis.webp"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Incluye cable de poder y AV",
          "Compatibilidad con cartuchos originales",
          "Diseño retro compacto"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/segagenesis.webp",
            imagenes: ["/Productos/segagenesis.webp"],
            cantidad: 4
          }
        ]
      },
      {
        id: "rc4",
        nombre: "PlayStation 1",
        precio: 130.0,
        descripcion: "Donde empezó la leyenda de Crash y Final Fantasy.",
        imagen: "/Productos/playstation1.webp",
        imagenes: ["/Productos/playstation1.webp"],
        oferta: false,
        estado: "Nuevo",
        acerca: [
          "Lector de CD original",
          "Incluye un control clásico",
          "Compatible con memory card"
        ],
        variantes: [
          {
            color: "Gris",
            imagen: "/Productos/playstation1.webp",
            imagenes: ["/Productos/playstation1.webp"],
            cantidad: 2
          }
        ]
      },
      {
        id: "rc5",
        nombre: "Game Boy Classic",
        precio: 90.0,
        descripcion: "Pokémon Red en tu bolsillo.",
        imagen: "/Productos/gameboy.jpg",
        imagenes: ["/Productos/gameboy.jpg"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Pantalla monocromática",
          "Funciona con pilas AA",
          "Compatible con todos los juegos Game Boy"
        ],
        variantes: [
          {
            color: "Gris",
            imagen: "/Productos/gameboy.jpg",
            imagenes: ["/Productos/gameboy.jpg"],
            cantidad: 1
          }
        ]
      },
      {
        id: "rc6",
        nombre: "Atari 2600",
        precio: 100.0,
        descripcion: "La precursora de las consolas modernas.",
        imagen: "/Productos/atari2600.png",
        imagenes: ["/Productos/atari2600.png"],
        oferta: false,
        estado: "Nuevo",
        acerca: [
          "Incluye joystick clásico",
          "Compatibilidad con cartuchos originales",
          "Diseño de madera vintage"
        ],
        variantes: [
          {
            color: "Madera",
            imagen: "/Productos/atari2600.png",
            imagenes: ["/Productos/atari2600.png"],
            cantidad: 2
          }
        ]
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
        descripcion: "El juego más icónico de plataformas 2D.",
        imagen: "/Productos/mariobrosretro.jpg",
        imagenes: ["/Productos/mariobrosretro.jpg"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Cartucho original",
          "Compatible con NES y clones",
          "Incluye caja protectora"
        ],
        variantes: [
          {
            color: "Rojo",
            imagen: "/Productos/mariobrosretro.jpg",
            imagenes: ["/Productos/mariobrosretro.jpg"],
            cantidad: 2
          }
        ]
      },
      {
        id: "rj2",
        nombre: "The Legend of Zelda (NES)",
        precio: 40.0,
        descripcion: "Explora Hyrule en 8 bits.",
        imagen: "/Productos/zeldaretro.jpg",
        imagenes: ["/Productos/zeldaretro.jpg"],
        oferta: false,
        estado: "Nuevo",
        acerca: [
          "Cartucho dorado",
          "Compatible con NES",
          "Incluye manual digital"
        ],
        variantes: [
          {
            color: "Dorado",
            imagen: "/Productos/zeldaretro.jpg",
            imagenes: ["/Productos/zeldaretro.jpg"],
            cantidad: 1
          }
        ]
      },
      {
        id: "rj3",
        nombre: "Donkey Kong Country (SNES)",
        precio: 42.0,
        descripcion: "Gráficos renderizados pioneros.",
        imagen: "/Productos/donkeykongnretro.jpeg",
        imagenes: ["/Productos/donkeykongnretro.jpeg"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Cartucho original",
          "Compatible con SNES",
          "Incluye caja retro"
        ],
        variantes: [
          {
            color: "Verde",
            imagen: "/Productos/donkeykongnretro.jpeg",
            imagenes: ["/Productos/donkeykongnretro.jpeg"],
            cantidad: 2
          }
        ]
      },
      {
        id: "rj4",
        nombre: "Crash Bandicoot (PS1)",
        precio: 38.0,
        descripcion: "Aventura en 3D de culto.",
        imagen: "/Productos/crash-bandicoat-PS1.webp",
        imagenes: ["/Productos/crash-bandicoat-PS1.webp"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Juego en CD original",
          "Compatible con PS1",
          "Incluye estuche retro"
        ],
        variantes: [
          {
            color: "Naranja",
            imagen: "/Productos/crash-bandicoat-PS1.webp",
            imagenes: ["/Productos/crash-bandicoat-PS1.webp"],
            cantidad: 1
          }
        ]
      },
      {
        id: "rj5",
        nombre: "Final Fantasy VII (PS1)",
        precio: 55.0,
        descripcion: "RPG legendario que marcó época.",
        imagen: "/Productos/ff7.jpg",
        imagenes: ["/Productos/ff7.jpg"],
        oferta: false,
        estado: "Nuevo",
        acerca: [
          "3 discos originales",
          "Compatible con PS1 y PS2",
          "Incluye manual digital"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/ff7.jpg",
            imagenes: ["/Productos/ff7.jpg"],
            cantidad: 1
          }
        ]
      },
    ],
  },
  {
    categoria: "Audífonos",
    productos: [
    {
      id: "p1",
      nombre: "Gaming Headset con Micrófono Ajustable para Xbox 360",
      sku: "HEADSET-X360",
      precio: 800,
      descripcion: "Audífonos para gaming con micrófono ajustable, conexión directa al control de Xbox 360. Ideal para chat y audio de juego.",
      imagen: "/productospcu/gamingheadsetxbox.png",
      imagenes: ["/productospcu/gamingheadsetxbox.png"],
      oferta: false,
      estado: "Nuevo",
      acerca: [
        "Micrófono flexible y ajustable",
        "Conexión por cable al control",
        "Diseño cómodo para largas sesiones",
        "Compatible solo con Xbox 360"
      ],
      variantes: [
        {
          imagen: "/productospcu/gamingheadsetxbox.png",
          imagenes: ["/productospcu/gaming-headset-back.png"],
          cantidad: 3
        }
      ]
    },

    {
      id: "p2",
      nombre: "Headset Inalámbrico AH-806W 6D Shock Sound",
      sku: "AH-806W-WIRELESS",
      precio: 1450,
      descripcion: "Audífonos inalámbricos con sonido envolvente 6D y graves potentes. Batería recargable, ideal para juegos y música.",
      imagen: "/productospcu/minionheadset.png",
      imagenes: ["/productospcu/minionheadset.png"],
      oferta: false,
      estado: "Nuevo",
      acerca: [
        "Inalámbrico",
        "Sonido envolvente 6D",
        "Graves potentes",
        "Diseño cómodo y moderno",
        "Batería recargable"
      ],
      variantes: [
        {
          imagen: "/productospcu/minionheadset.png",
          imagenes: ["/productospcu/minionheadset.png"],
          cantidad: 1
        }
      ]
    },

    {
      id: "p3",
      nombre: "MA-1 Wireless Headphone MARIO",
      sku: "MA1-MARIO",
      precio: 1200,
      descripcion: "Audífonos inalámbricos edición especial MARIO, compatibles con varios dispositivos y micrófono incorporado.",
      imagen: "/productospcu/marioheadset.png",
      imagenes: ["/productospcu/marioheadset.png"],
      oferta: false,
      estado: "Nuevo",
      acerca: [
        "Diseño edición Mario",
        "Inalámbrico y recargable",
        "Compatibles con dispositivos móviles y PC",
        "Micrófono integrado"
      ],
      variantes: [
        {
          imagen: "/productospcu/marioheadset.png",
          imagenes: ["/productospcu/marioheadset.png"],
          cantidad: 1
        }
      ]
    },
    ],
  },

  {
    categoria: "Cables",
    productos: [
      {
        id: "cb1",
        nombre: "USB-C a Lightning (1m)",
        precio: 14.99,
        descripcion: "Carga rápida para iPhone y iPad.",
        imagen: "/Productos/usb-c.jpg",
        imagenes: ["/Productos/usb-c.jpg"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Compatible con dispositivos Apple",
          "Longitud de 1 metro",
          "Soporta carga rápida",
          "Conectores reforzados"
        ],
        variantes: [
          {
            color: "Blanco",
            imagen: "/Productos/usb-c.jpg",
            imagenes: ["/Productos/usb-c.jpg"],
            cantidad: 10
          }
        ]
      },
      {
        id: "cb2",
        nombre: "HDMI 4K (2m)",
        precio: 12.99,
        descripcion: "Video y audio en alta definición.",
        imagen: "/Productos/hdmi4k.jpeg",
        imagenes: ["/Productos/hdmi4k.jpeg"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Resolución 4K",
          "Longitud de 2 metros",
          "Compatible con TV, monitores y consolas",
          "Conectores dorados para mejor señal"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/hdmi4k.jpeg",
            imagenes: ["/Productos/hdmi4k.jpeg"],
            cantidad: 7
          }
        ]
      },
      {
        id: "cb3",
        nombre: "USB 3.0 a Micro USB",
        precio: 9.99,
        descripcion: "Transferencia rápida para móviles.",
        imagen: "/Productos/micro.jpg",
        imagenes: ["/Productos/micro.jpg"],
        oferta: false,
        estado: "Nuevo",
        acerca: [
          "Soporta USB 3.0",
          "Longitud de 1 metro",
          "Ideal para móviles y discos duros externos",
          "Transferencia de datos y carga rápida"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/micro.jpg",
            imagenes: ["/Productos/micro.jpg"],
            cantidad: 8
          }
        ]
      },
      {
        id: "cb4",
        nombre: "Ethernet Cat6 (1.5m)",
        precio: 19.99,
        descripcion: "Internet sin interferencias.",
        imagen: "/Productos/ethernet.jpeg",
        imagenes: ["/Productos/ethernet.jpg"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Cable de red Cat6",
          "Longitud de 1.5 metros",
          "Alta velocidad y baja interferencia",
          "Ideal para gaming y streaming"
        ],
        variantes: [
          {
            color: "Azul",
            imagen: "/Productos/ethernet.jpeg",
            imagenes: ["/Productos/ethernet.jpg"],
            cantidad: 6
          }
        ]
      },
      {
        id: "cb5",
        nombre: "DisplayPort 1.4 2m",
        precio: 24.99,
        descripcion: "Soporta hasta 8K a 60Hz.",
        imagen: "/Productos/displayport.jpg",
        imagenes: ["/Productos/displayport.jpg"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Soporta hasta 8K a 60Hz",
          "Longitud de 2 metros",
          "Compatible con monitores y tarjetas gráficas",
          "Conectores de alta calidad"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/displayport.jpg",
            imagenes: ["/Productos/displayport.jpg"],
            cantidad: 4
          }
        ]
      },
    ],
  },
  {
    categoria: "Tu Rincón Variado",
    productos: [
      {
        id: "rv1",
        nombre: "Bicicleta Urbana MTB 26'' Mongoose",
        precio: 379.99,
        descripcion: "Mongoose, la clásica MTB para la ciudad y off-road.",
        imagen: "/Productos/mongose.jpg",
        imagenes: ["/Productos/mongose.jpg"],
        oferta: true,
        estado: "Usado",
        acerca: [
          "Cuadro de acero resistente",
          "Llantas de 26 pulgadas",
          "Ideal para ciudad y caminos",
          "Frenos de disco delanteros y traseros"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/mongose.jpg",
            imagenes: ["/Productos/mongose.jpg"],
            cantidad: 1
          }
        ]
      },
      {
        id: "rv2",
        nombre: "Patineta Eléctrica Plegable",
        precio: 499.99,
        descripcion: "Compacta, ligera, alcance hasta 25km y full power.",
        imagen: "/Productos/patinetaelectrica.jpg",
        imagenes: ["/Productos/patinetaelectrica.jpg"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Motor de 250W",
          "Alcance de hasta 25km",
          "Batería recargable",
          "Plegable y liviana"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/patinetaelectrica.jpg",
            imagenes: ["/Productos/patinetaelectrica.jpg"],
            cantidad: 2
          }
        ]
      },
      {
        id: "rv3",
        nombre: "Hoverboard Autoequilibrado 10\"",
        precio: 299.99,
        descripcion: "Tecnología smart para moverte con estilo y velocidad.",
        imagen: "/Productos/hoverboard.jpg",
        imagenes: ["/Productos/hoverboard.jpg"],
        oferta: true,
        estado: "Usado",
        acerca: [
          "Ruedas de 10 pulgadas",
          "Sensores de equilibrio inteligente",
          "Luces LED integradas",
          "Batería recargable de larga duración"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/hoverboard.jpg",
            imagenes: ["/Productos/hoverboard.jpg"],
            cantidad: 1
          }
        ]
      },
      {
        id: "rv4",
        nombre: "Patines en línea 4 ruedas",
        precio: 79.99,
        descripcion: "Estilo y velocidad para deslizarte con flow.",
        imagen: "/Productos/patines4ruedaasenlinea.jpeg",
        imagenes: ["/Productos/patines4ruedaasenlinea.jpeg"],
        oferta: false,
        estado: "Usado",
        acerca: [
          "4 ruedas resistentes",
          "Rodamientos ABEC-7",
          "Ajuste seguro",
          "Freno trasero incluido"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/patines4ruedaasenlinea.jpeg",
            imagenes: ["/Productos/patines4ruedaasenlinea.jpeg"],
            cantidad: 2
          }
        ]
      },
      {
        id: "rv5",
        nombre: "Patines clásicos 4 ruedas",
        precio: 69.99,
        descripcion: "Roller clásico para pura diversión.",
        imagen: "/Productos/patinesclasicos.webp",
        imagenes: ["/Productos/patinesclasicos.webp"],
        oferta: false,
        estado: "Usado",
        acerca: [
          "Diseño clásico",
          "Ruedas de goma",
          "Ajuste cómodo",
          "Disponible en varias tallas"
        ],
        variantes: [
          {
            color: "Blanco",
            imagen: "/Productos/patinesclasicos.webp",
            imagenes: ["/Productos/patinesclasicos.webp"],
            cantidad: 3
          }
        ]
      },
      {
        id: "rv6",
        nombre: "Ruedas de repuesto para patineta",
        precio: 24.99,
        descripcion: "Juego de 4 ruedas para tu patineta o longboard.",
        imagen: "/Productos/ruedapatineta.webp",
        imagenes: ["/Productos/ruedapatineta.webp"],
        oferta: true,
        estado: "Usado",
        acerca: [
          "4 ruedas incluidas",
          "Material de poliuretano",
          "Compatibles con skate y longboard",
          "Durabilidad extra"
        ],
        variantes: [
          {
            color: "Transparente",
            imagen: "/Productos/ruedapatineta.webp",
            imagenes: ["/Productos/ruedapatineta.webp"],
            cantidad: 4
          }
        ]
      },
      {
        id: "rv7",
        nombre: "Casco Protector Urbano",
        precio: 59.99,
        descripcion: "Seguridad y estilo en un solo casco moderno.",
        imagen: "/Productos/casco.jpg",
        imagenes: ["/Productos/casco.jpg"],
        oferta: false,
        estado: "Usado",
        acerca: [
          "Certificado para ciclismo y skate",
          "Ajuste regulable",
          "Acolchado interno extraíble",
          "Ligero y resistente"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/casco.jpg",
            imagenes: ["/Productos/casco.jpg"],
            cantidad: 2
          }
        ]
      },
      {
        id: "rv8",
        nombre: "Botella Térmica 1L Acero Inoxidable",
        precio: 19.99,
        descripcion: "Mantiene tus bebidas frías o calientes por horas.",
        imagen: "/Productos/botella.jpg",
        imagenes: ["/Productos/botella.jpg"],
        oferta: false,
        estado: "Nuevo",
        acerca: [
          "Capacidad de 1 litro",
          "Acero inoxidable",
          "Tapa a prueba de fugas",
          "Mantiene la temperatura por 12h"
        ],
        variantes: [
          {
            color: "Plateado",
            imagen: "/Productos/botella.jpg",
            imagenes: ["/Productos/botella.jpg"],
            cantidad: 5
          }
        ]
      },
      {
        id: "rv9",
        nombre: "Luz LED Recargable para Bicicleta",
        precio: 24.99,
        descripcion: "Visibilidad garantizada en la noche, USB recargable.",
        imagen: "/Productos/lucesbici.webp",
        imagenes: ["/Productos/lucesbici.webp"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Luz blanca frontal LED",
          "Recargable por USB",
          "Incluye soporte para manubrio",
          "3 modos de intensidad"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/lucesbici.webp",
            imagenes: ["/Productos/lucesbici.webp"],
            cantidad: 6
          }
        ]
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
        imagen: "/Productos/hikvision.png",
        imagenes: ["/Productos/hikvision.png"],
        oferta: false,
        estado: "Nuevo",
        acerca: [
          "Resolución 4MP",
          "Visión nocturna infrarroja",
          "Carcasa resistente a la intemperie",
          "Fácil instalación"
        ],
        variantes: [
          {
            color: "Blanco",
            imagen: "/Productos/hikvision.png",
            imagenes: ["/Productos/hikvision.png"],
            cantidad: 4
          }
        ]
      },
      {
        id: "cam2",
        nombre: "Cámara Dahua Bullet Full HD",
        precio: 95,
        descripcion: "Cámara Bullet Full HD con lente gran angular, ideal para exteriores.",
        imagen: "/Productos/dahua.webp",
        imagenes: ["/Productos/dahua.webp"],
        oferta: false,
        estado: "Nuevo",
        acerca: [
          "Full HD 1080p",
          "Lente gran angular",
          "Resistente a la lluvia",
          "Visión nocturna"
        ],
        variantes: [
          {
            color: "Blanco",
            imagen: "/Productos/dahua.webp",
            imagenes: ["/Productos/dahua.webp"],
            cantidad: 5
          }
        ]
      },
      {
        id: "cam3",
        nombre: "Cámara EZVIZ WiFi 1080p",
        precio: 75,
        descripcion: "Cámara WiFi con grabación en la nube, visión nocturna y audio bidireccional.",
        imagen: "/Productos/ezviz.png",
        imagenes: ["/Productos/ezviz.png"],
        oferta: false,
        estado: "Nuevo",
        acerca: [
          "Conexión WiFi",
          "Grabación en la nube",
          "Audio bidireccional",
          "Visión nocturna"
        ],
        variantes: [
          {
            color: "Blanco",
            imagen: "/Productos/ezviz.png",
            imagenes: ["/Productos/ezviz.png"],
            cantidad: 6
          }
        ]
      },
      {
        id: "cam4",
        nombre: "Cámara TP-Link Tapo C200",
        precio: 60,
        descripcion: "Cámara PTZ con movimiento horizontal y vertical, notificaciones instantáneas y almacenamiento local.",
        imagen: "/Productos/tapo.webp",
        imagenes: ["/Productos/tapo.webp"],
        oferta: false,
        estado: "Nuevo",
        acerca: [
          "Control de movimiento PTZ",
          "Notificaciones instantáneas",
          "Almacenamiento local SD",
          "Compatible con app móvil"
        ],
        variantes: [
          {
            color: "Blanco",
            imagen: "/Productos/tapo.webp",
            imagenes: ["/Productos/tapo.webp"],
            cantidad: 4
          }
        ]
      }
    ],
  },

  {
    categoria: "Cargadores",
    productos: [
      {
        id: "cg1",
        nombre: "Cargador rápido USB-C 20W",
        precio: 499,
        descripcion: "Carga eficiente para Android y iPhone.",
        imagen: "/Productos/cargador-rapido.jpg",
        imagenes: ["/Productos/cargador-rapido.jpg"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Carga rápida 20W",
          "Compatible con Android y iPhone",
          "Protección contra sobrecarga",
          "Diseño compacto"
        ],
        variantes: [
          {
            color: "Blanco",
            imagen: "/Productos/cargador-rapido.jpg",
            imagenes: ["/Productos/cargador-rapido.jpg"],
            cantidad: 8
          }
        ]
      },
      {
        id: "cg2",
        nombre: "Cargador inalámbrico universal",
        precio: 599,
        descripcion: "Compatible con smartphones que permiten carga por inducción.",
        imagen: "/Productos/cargador-inalambrico.jpg",
        imagenes: ["/Productos/cargador-inalambrico.jpg"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Carga inalámbrica Qi",
          "Funciona con la mayoría de smartphones",
          "Diseño antideslizante",
          "Indicador LED de carga"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/cargador-inalambrico.jpg",
            imagenes: ["/Productos/cargador-inalambrico.jpg"],
            cantidad: 5
          }
        ]
      },
      {
        id: "cg3",
        nombre: "Power Bank 20,000 mAh",
        precio: 399,
        descripcion: "Carga hasta 3 dispositivos con alta capacidad.",
        imagen: "/Productos/powerbank.jpg",
        imagenes: ["/Productos/powerbank.jpg"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Capacidad 20,000 mAh",
          "3 puertos de salida USB",
          "Carga rápida",
          "Pantalla LED de batería"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/powerbank.jpg",
            imagenes: ["/Productos/powerbank.jpg"],
            cantidad: 4
          }
        ]
      },
      {
        id: "cg4",
        nombre: "Cargador doble USB 30W",
        precio: 299,
        descripcion: "Ideal para cargar dos equipos a la vez.",
        imagen: "/Productos/cargador-doble.jpg",
        imagenes: ["/Productos/cargador-doble.jpg"],
        oferta: false,
        estado: "Nuevo",
        acerca: [
          "2 puertos USB",
          "Potencia total 30W",
          "Protección contra cortocircuito",
          "Compatible con múltiples dispositivos"
        ],
        variantes: [
          {
            color: "Blanco",
            imagen: "/Productos/cargador-doble.jpg",
            imagenes: ["/Productos/cargador-doble.jpg"],
            cantidad: 9
          }
        ]
      },
    ],
  },
  {
    categoria: "Celulares",
    productos: [
      {
        id: "cl1",
        nombre: "iPhone 14 Pro",
        precio: 999.99,
        descripcion: "Pantalla Super Retina XDR, chip A16 Bionic.",
        imagen: "/Productos/iphone14pro.jpg",
        imagenes: ["/Productos/iphone14pro.jpg"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Pantalla Super Retina XDR",
          "Chip A16 Bionic",
          "Triple cámara profesional",
          "Face ID y MagSafe"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/iphone14pro.jpg",
            imagenes: ["/Productos/iphone14pro.jpg"],
            cantidad: 3
          },
          {
            color: "Morado",
            imagen: "/Productos/iphone14pro.jpg",
            imagenes: ["/Productos/iphone14pro.jpg"],
            cantidad: 2
          }
        ]
      },
      {
        id: "cl2",
        nombre: "Samsung Galaxy S22",
        precio: 899.99,
        descripcion: "Cámara profesional en formato móvil.",
        imagen: "/Productos/galaxy-s22.jpg",
        imagenes: ["/Productos/galaxy-s22.jpg"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Pantalla Dynamic AMOLED 2X",
          "Cámara triple 50MP",
          "5G Ready",
          "Carga rápida e inalámbrica"
        ],
        variantes: [
          {
            color: "Blanco",
            imagen: "/Productos/galaxy-s22.jpg",
            imagenes: ["/Productos/galaxy-s22.jpg"],
            cantidad: 2
          },
          {
            color: "Negro",
            imagen: "/Productos/galaxy-s22.jpg",
            imagenes: ["/Productos/galaxy-s22.jpg"],
            cantidad: 2
          }
        ]
      },
      {
        id: "cl3",
        nombre: "Google Pixel 7",
        precio: 799.99,
        descripcion: "Inteligencia artificial integrada al sistema.",
        imagen: "/Productos/pixel7.jpg",
        imagenes: ["/Productos/pixel7.jpg"],
        oferta: false,
        estado: "Nuevo",
        acerca: [
          "Pantalla AMOLED 90Hz",
          "Cámara dual con IA",
          "Android puro actualizable",
          "Batería de larga duración"
        ],
        variantes: [
          {
            color: "Blanco",
            imagen: "/Productos/pixel7.jpg",
            imagenes: ["/Productos/pixel7.jpg"],
            cantidad: 1
          }
        ]
      },
      {
        id: "cl4",
        nombre: "Motorola Edge 30",
        precio: 699.99,
        descripcion: "Pantalla OLED, 144Hz y gran batería.",
        imagen: "/Productos/moto-edge30.jpg",
        imagenes: ["/Productos/moto-edge30.jpg"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Pantalla OLED 144Hz",
          "Cámara triple 50MP",
          "Batería 4020 mAh",
          "Carga turbo power"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/moto-edge30.jpg",
            imagenes: ["/Productos/moto-edge30.jpg"],
            cantidad: 2
          },
          {
            color: "Azul",
            imagen: "/Productos/moto-edge30.jpg",
            imagenes: ["/Productos/moto-edge30.jpg"],
            cantidad: 1
          }
        ]
      },
    ],
  },
  {
    categoria: "Consolas",
    productos: [
      {
        id: "cs1",
        nombre: "PlayStation 5",
        precio: 499.99,
        descripcion: "Gráficos de nueva generación y control DualSense.",
        imagen: "/Productos/ps5.webp",
        imagenes: ["/Productos/ps5.webp"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Procesador AMD Ryzen",
          "SSD ultrarrápido",
          "Soporta juegos 4K",
          "Incluye control DualSense"
        ],
        variantes: [
          {
            color: "Blanco",
            imagen: "/Productos/ps5.webp",
            imagenes: ["/Productos/ps5.webp"],
            cantidad: 5
          }
        ]
      },
      {
        id: "cs2",
        nombre: "Xbox Series X",
        precio: 499.99,
        descripcion: "La consola más potente de Microsoft.",
        imagen: "/Productos/xboxseriesx.webp",
        imagenes: ["/Productos/xboxseriesx.webp"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "8K HDR Gaming",
          "Almacenamiento SSD 1TB",
          "Compatible con generaciones anteriores",
          "Incluye control inalámbrico"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/xboxseriesx.webp",
            imagenes: ["/Productos/xboxseriesx.webp"],
            cantidad: 4
          }
        ]
      },
      {
        id: "cs3",
        nombre: "Nintendo Switch OLED",
        precio: 349.99,
        descripcion: "Llévala donde quieras con pantalla brillante.",
        imagen: "/Productos/nintendoswitch.jpg",
        imagenes: ["/Productos/nintendoswitch.jpg"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Pantalla OLED de 7 pulgadas",
          "Modo portátil y TV",
          "Control Joy-Con incluidos",
          "Almacenamiento ampliable"
        ],
        variantes: [
          {
            color: "Blanco",
            imagen: "/Productos/nintendoswitch.jpg",
            imagenes: ["/Productos/nintendoswitch.jpg"],
            cantidad: 3
          }
        ]
      },
      {
        id: "cs4",
        nombre: "Steam Deck",
        precio: 399.99,
        descripcion: "Gaming portátil con rendimiento de PC.",
        imagen: "/Productos/steam-deck.jpg",
        imagenes: ["/Productos/steam-deck.jpg"],
        oferta: false,
        estado: "Usado",
        acerca: [
          "Pantalla táctil 7\"",
          "Procesador AMD personalizado",
          "Controles integrados",
          "Compatible con juegos de PC"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/steam-deck.jpg",
            imagenes: ["/Productos/steam-deck.jpg"],
            cantidad: 1
          }
        ]
      },
      {
        id: "cs5",
        nombre: "PlayStation 4",
        precio: 299.99,
        descripcion: "La consola que marcó una generación de gamers.",
        imagen: "/Productos/ps4.jpg",
        imagenes: ["/Productos/ps4.jpg"],
        oferta: true,
        estado: "Usado",
        acerca: [
          "Soporte para juegos exclusivos",
          "Almacenamiento 500GB",
          "Blu-ray integrado",
          "Incluye control DualShock 4"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/ps4.jpg",
            imagenes: ["/Productos/ps4.jpg"],
            cantidad: 2
          }
        ]
      },
      {
        id: "cs6",
        nombre: "Xbox One",
        precio: 279.99,
        descripcion: "Disfruta juegos, entretenimiento y apps en una sola consola.",
        imagen: "/Productos/xboxone.webp",
        imagenes: ["/Productos/xboxone.webp"],
        oferta: true,
        estado: "Usado",
        acerca: [
          "Compatible con Xbox Game Pass",
          "Almacenamiento 500GB",
          "Control inalámbrico incluido",
          "Soporte para apps de streaming"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/xboxone.webp",
            imagenes: ["/Productos/xboxone.webp"],
            cantidad: 1
          }
        ]
      },
    ],
  },


    {
    categoria: "Discos Duros",
    productos: [
      {
        id: "dd1",
        nombre: "Seagate 1TB Externo",
        precio: 59.99,
        descripcion: "Pequeño, rápido y confiable.",
        imagen: "/Productos/seagate.png",
        imagenes: ["/Productos/seagate.png"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Capacidad de 1TB",
          "USB 3.0 para alta velocidad",
          "Compatible con Windows y Mac",
          "Diseño portátil y resistente"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/seagate.png",
            imagenes: ["/Productos/seagate.png"],
            cantidad: 4
          }
        ]
      },
      {
        id: "dd2",
        nombre: "SSD Samsung 500GB",
        precio: 89.99,
        descripcion: "Perfecto para acelerar tu sistema.",
        imagen: "/Productos/samsung.webp",
        imagenes: ["/Productos/samsung.webp"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "500GB SSD",
          "Velocidad de lectura/escritura superior a 500MB/s",
          "Interfaz SATA III",
          "Ideal para laptops y PC"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/samsung.webp",
            imagenes: ["/Productos/samsung.webp"],
            cantidad: 5
          }
        ]
      },
      {
        id: "dd3",
        nombre: "WD 2TB Externo",
        precio: 79.99,
        descripcion: "Ideal para respaldo completo.",
        imagen: "/Productos/wd2tb.jpg",
        imagenes: ["/Productos/wd2tb.jpg"],
        oferta: false,
        estado: "Nuevo",
        acerca: [
          "2TB de capacidad",
          "USB 3.0",
          "Protección por hardware",
          "Diseño resistente"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/wd2tb.jpg",
            imagenes: ["/Productos/wd2tb.jpg"],
            cantidad: 3
          }
        ]
      },
      {
        id: "dd4",
        nombre: "Crucial X6 SSD 1TB",
        precio: 99.99,
        descripcion: "Ultraportátil con conexión USB-C.",
        imagen: "/Productos/crucial.jpg",
        imagenes: ["/Productos/crucial.jpg"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "1TB SSD externo",
          "Interfaz USB-C",
          "Resistente a golpes",
          "Ultracompacto"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/crucial.jpg",
            imagenes: ["/Productos/crucial.jpg"],
            cantidad: 2
          }
        ]
      },
      {
        id: "dd5",
        nombre: "LaCie Rugged 4TB",
        precio: 179.99,
        descripcion: "Resistente a golpes y polvo, ideal para creativos.",
        imagen: "/Productos/lacie-rugged.jpg",
        imagenes: ["/Productos/lacie-rugged.jpg"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "4TB de capacidad",
          "Protección anticaídas",
          "USB-C y Thunderbolt",
          "Diseño resistente a polvo y agua"
        ],
        variantes: [
          {
            color: "Naranja",
            imagen: "/Productos/lacie-rugged.jpg",
            imagenes: ["/Productos/lacie-rugged.jpg"],
            cantidad: 1
          }
        ]
      },
    ],
  },
  {
    categoria: "Electrodomésticos",
    productos: [
      {
        id: "ed1",
        nombre: "Licuadora Oster clásica",
        precio: 69.99,
        descripcion: "Motor potente con jarra de vidrio.",
        imagen: "/Productos/licuadora-oster.jpg",
        imagenes: ["/Productos/licuadora-oster.jpg"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Motor de 600W",
          "Jarra de vidrio de 1.25L",
          "Cuchillas de acero inoxidable",
          "Fácil de limpiar"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/licuadora-oster.jpg",
            imagenes: ["/Productos/licuadora-oster.jpg"],
            cantidad: 3
          }
        ]
      },
      {
        id: "ed2",
        nombre: "Microondas Samsung 1000W",
        precio: 129.99,
        descripcion: "Moderno, rápido y eficiente.",
        imagen: "/Productos/microondas.jpg",
        imagenes: ["/Productos/microondas.jpg"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Potencia de 1000W",
          "Panel digital",
          "Capacidad 23L",
          "Función de descongelado"
        ],
        variantes: [
          {
            color: "Plateado",
            imagen: "/Productos/microondas.jpg",
            imagenes: ["/Productos/microondas.jpg"],
            cantidad: 2
          }
        ]
      },
      {
        id: "ed3",
        nombre: "Robot aspiradora Xiaomi",
        precio: 199.99,
        descripcion: "Limpieza automática vía app.",
        imagen: "/Productos/xiaomi-aspiradora.jpg",
        imagenes: ["/Productos/xiaomi-aspiradora.jpg"],
        oferta: false,
        estado: "Nuevo",
        acerca: [
          "Control desde app móvil",
          "Sensores inteligentes",
          "Batería de larga duración",
          "Filtro HEPA lavable"
        ],
        variantes: [
          {
            color: "Blanco",
            imagen: "/Productos/xiaomi-aspiradora.jpg",
            imagenes: ["/Productos/xiaomi-aspiradora.jpg"],
            cantidad: 2
          }
        ]
      },
      {
        id: "ed4",
        nombre: "Freidora de aire Philips",
        precio: 159.99,
        descripcion: "Cocina sin aceite y más saludable.",
        imagen: "/Productos/freidora.jpg",
        imagenes: ["/Productos/freidora.jpg"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Capacidad 4L",
          "Tecnología Rapid Air",
          "Fácil de limpiar",
          "Control de temperatura"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/freidora.jpg",
            imagenes: ["/Productos/freidora.jpg"],
            cantidad: 3
          }
        ]
      },
    ],
  },
  {
    categoria: "Gaming Chairs",
    productos: [
      {
        id: "gc1",
        nombre: "Silla Gamer Reclinable RGB",
        precio: 229.99,
        descripcion: "Iluminación RGB y soporte lumbar acolchado.",
        imagen: "/Productos/silla-gamer-rgb.jpg",
        imagenes: ["/Productos/silla-gamer-rgb.jpg"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Iluminación RGB personalizable",
          "Soporte lumbar acolchado",
          "Reposabrazos ajustable",
          "Reclinable hasta 180°"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/silla-gamer-rgb.jpg",
            imagenes: ["/Productos/silla-gamer-rgb.jpg"],
            cantidad: 2
          }
        ]
      },
      {
        id: "gc2",
        nombre: "Silla Ergonómica con cojines ajustables",
        precio: 199.99,
        descripcion: "Reposacabeza ajustable y respaldo reforzado.",
        imagen: "/Productos/silla-gamer-cojines.jpg",
        imagenes: ["/Productos/silla-gamer-cojines.jpg"],
        oferta: false,
        estado: "Nuevo",
        acerca: [
          "Cojines de soporte lumbar y cervical",
          "Reposacabeza ajustable",
          "Respaldo con refuerzo",
          "Material transpirable"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/silla-gamer-cojines.jpg",
            imagenes: ["/Productos/silla-gamer-cojines.jpg"],
            cantidad: 4
          }
        ]
      },
      {
        id: "gc3",
        nombre: "Silla barata Gamer negra",
        precio: 129.99,
        descripcion: "Diseño básico pero funcional.",
        imagen: "/Productos/silla-gamer-barata.jpg",
        imagenes: ["/Productos/silla-gamer-barata.jpg"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Diseño básico y ergonómico",
          "Material resistente",
          "Altura ajustable",
          "Ruedas de desplazamiento suave"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/silla-gamer-barata.jpg",
            imagenes: ["/Productos/silla-gamer-barata.jpg"],
            cantidad: 5
          }
        ]
      },
      {
        id: "gc4",
        nombre: "Silla Gaming con reposapiés",
        precio: 189.99,
        descripcion: "Máxima comodidad en sesiones largas.",
        imagen: "/Productos/silla-reposapies.jpg",
        imagenes: ["/Productos/silla-reposapies.jpg"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Reposapiés extensible",
          "Respaldo reclinable",
          "Soporte lumbar",
          "Material PU premium"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/silla-reposapies.jpg",
            imagenes: ["/Productos/silla-reposapies.jpg"],
            cantidad: 3
          }
        ]
      },
    ],
  },
  {
    categoria: "Laptops",
    productos: [
      {
        id: "lp1",
        nombre: "Laptop Dell Inspiron 15",
        precio: 799.99,
        descripcion: "Intel i5, SSD 256GB, pantalla 15.6”.",
        imagen: "/Productos/dell-inspiron15.jpg",
        imagenes: ["/Productos/dell-inspiron15.jpg"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Procesador Intel Core i5",
          "SSD 256GB",
          "Pantalla 15.6'' Full HD",
          "Windows 11 preinstalado"
        ],
        variantes: [
          {
            color: "Gris",
            imagen: "/Productos/dell-inspiron15.jpg",
            imagenes: ["/Productos/dell-inspiron15.jpg"],
            cantidad: 3
          }
        ]
      },
      {
        id: "lp2",
        nombre: "MacBook Air M2",
        precio: 1199.99,
        descripcion: "Ligera, elegante y veloz.",
        imagen: "/Productos/macbook-air-m2.jpg",
        imagenes: ["/Productos/macbook-air-m2.jpg"],
        oferta: false,
        estado: "Nuevo",
        acerca: [
          "Chip Apple M2",
          "Pantalla Retina 13.6''",
          "Batería hasta 18h",
          "Teclado Magic Keyboard"
        ],
        variantes: [
          {
            color: "Gris espacial",
            imagen: "/Productos/macbook-air-m2.jpg",
            imagenes: ["/Productos/macbook-air-m2.jpg"],
            cantidad: 2
          }
        ]
      },
      {
        id: "lp3",
        nombre: "ASUS ROG Gamer",
        precio: 1499.99,
        descripcion: "Tarjeta gráfica potente y diseño agresivo.",
        imagen: "/Productos/asus-rog.jpg",
        imagenes: ["/Productos/asus-rog.jpg"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Tarjeta gráfica RTX Series",
          "Pantalla 144Hz",
          "Teclado RGB",
          "Almacenamiento SSD 1TB"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/asus-rog.jpg",
            imagenes: ["/Productos/asus-rog.jpg"],
            cantidad: 2
          }
        ]
      },
      {
        id: "lp4",
        nombre: "Lenovo IdeaPad 3",
        precio: 649.99,
        descripcion: "Perfecta para estudiantes y oficina.",
        imagen: "/Productos/ideapad.jpg",
        imagenes: ["/Productos/ideapad.jpg"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Procesador AMD Ryzen 5",
          "SSD 512GB",
          "Pantalla 15.6''",
          "Windows 11 Home"
        ],
        variantes: [
          {
            color: "Gris",
            imagen: "/Productos/ideapad.jpg",
            imagenes: ["/Productos/ideapad.jpg"],
            cantidad: 4
          }
        ]
      },
    ],
  },


    {
    categoria: "Monitores",
    productos: [
      {
        id: "mn1",
        nombre: "LG 27 pulgadas 4K",
        precio: 399.99,
        descripcion: "Colores vibrantes para diseño y gaming.",
        imagen: "/Productos/monitor-lg-4k.jpg",
        imagenes: ["/Productos/monitor-lg-4k.jpg"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Resolución 4K UHD",
          "Pantalla IPS 27''",
          "Frecuencia de actualización 60Hz",
          "Compatible con HDMI y DisplayPort"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/monitor-lg-4k.jpg",
            imagenes: ["/Productos/monitor-lg-4k.jpg"],
            cantidad: 2
          }
        ]
      },
      {
        id: "mn2",
        nombre: "Samsung Curvo 32 pulgadas",
        precio: 349.99,
        descripcion: "Inmersión completa con su forma curva.",
        imagen: "/Productos/monitor-samsung-curvo.jpg",
        imagenes: ["/Productos/monitor-samsung-curvo.jpg"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Pantalla curva 32''",
          "Resolución Full HD",
          "Frecuencia de actualización 75Hz",
          "Tecnología Flicker Free"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/monitor-samsung-curvo.jpg",
            imagenes: ["/Productos/monitor-samsung-curvo.jpg"],
            cantidad: 2
          }
        ]
      },
      {
        id: "mn3",
        nombre: "Acer 24 pulgadas Full HD",
        precio: 199.99,
        descripcion: "Rápido y eficiente para tareas cotidianas.",
        imagen: "/Productos/monitor-acer-24.jpg",
        imagenes: ["/Productos/monitor-acer-24.jpg"],
        oferta: false,
        estado: "Nuevo",
        acerca: [
          "Resolución Full HD",
          "Tamaño 24''",
          "Panel IPS de 60Hz",
          "Conectividad HDMI y VGA"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/monitor-acer-24.jpg",
            imagenes: ["/Productos/monitor-acer-24.jpg"],
            cantidad: 3
          }
        ]
      },
      {
        id: "mn4",
        nombre: "Monitor BenQ 144Hz 27”",
        precio: 289.99,
        descripcion: "Ideal para eSports.",
        imagen: "/Productos/monitor-benq.jpg",
        imagenes: ["/Productos/monitor-benq.jpg"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Frecuencia de actualización 144Hz",
          "Pantalla 27''",
          "Tecnología Low Blue Light",
          "Compatible con HDMI y DisplayPort"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/monitor-benq.jpg",
            imagenes: ["/Productos/monitor-benq.jpg"],
            cantidad: 1
          }
        ]
      },
    ],
  },
  {
    categoria: "Tablets",
    productos: [
      {
        id: "tb1",
        nombre: "iPad Pro 12.9",
        precio: 999.99,
        descripcion: "Chip M1 y pantalla Liquid Retina.",
        imagen: "/Productos/ipad-pro.jpg",
        imagenes: ["/Productos/ipad-pro.jpg"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Pantalla Liquid Retina 12.9''",
          "Chip Apple M1",
          "Compatible con Apple Pencil",
          "Face ID y USB-C"
        ],
        variantes: [
          {
            color: "Gris espacial",
            imagen: "/Productos/ipad-pro.jpg",
            imagenes: ["/Productos/ipad-pro.jpg"],
            cantidad: 2
          }
        ]
      },
      {
        id: "tb2",
        nombre: "Samsung Galaxy Tab S8",
        precio: 799.99,
        descripcion: "Ligera, potente y con pantalla AMOLED.",
        imagen: "/Productos/galaxy-tab-s8.jpg",
        imagenes: ["/Productos/galaxy-tab-s8.jpg"],
        oferta: false,
        estado: "Nuevo",
        acerca: [
          "Pantalla AMOLED 11''",
          "Procesador Snapdragon 8 Gen 1",
          "Soporte S Pen incluido",
          "Android 12"
        ],
        variantes: [
          {
            color: "Gris",
            imagen: "/Productos/galaxy-tab-s8.jpg",
            imagenes: ["/Productos/galaxy-tab-s8.jpg"],
            cantidad: 1
          }
        ]
      },
      {
        id: "tb3",
        nombre: "Amazon Fire HD 10",
        precio: 149.99,
        descripcion: "Ideal para lectura y video.",
        imagen: "/Productos/fire-hd10.jpg",
        imagenes: ["/Productos/fire-hd10.jpg"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Pantalla Full HD 10''",
          "Procesador octa-core",
          "Alexa integrada",
          "Batería hasta 12 horas"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/fire-hd10.jpg",
            imagenes: ["/Productos/fire-hd10.jpg"],
            cantidad: 3
          }
        ]
      },
      {
        id: "tb4",
        nombre: "Huawei MatePad 10.4",
        precio: 299.99,
        descripcion: "Diseño delgado y pantalla nítida.",
        imagen: "/Productos/huawei-matepad.jpg",
        imagenes: ["/Productos/huawei-matepad.jpg"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Pantalla IPS 10.4''",
          "Procesador Kirin 820A",
          "4GB RAM, 64GB almacenamiento",
          "Batería 7250mAh"
        ],
        variantes: [
          {
            color: "Gris",
            imagen: "/Productos/huawei-matepad.jpg",
            imagenes: ["/Productos/huawei-matepad.jpg"],
            cantidad: 2
          }
        ]
      },
    ],
  },
  {
    categoria: "Teclados",
    productos: [
      {
        id: "tk1",
        nombre: "Teclado inalámbrico Logitech K380",
        precio: 39.99,
        descripcion: "Multidispositivo, compacto y silencioso.",
        imagen: "/Productos/teclado-logitech-k380.jpg",
        imagenes: ["/Productos/teclado-logitech-k380.jpg"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Conexión Bluetooth multidispositivo",
          "Diseño compacto y ligero",
          "Batería de larga duración",
          "Compatible con Windows, Mac, iOS y Android"
        ],
        variantes: [
          {
            color: "Gris",
            imagen: "/Productos/teclado-logitech-k380.jpg",
            imagenes: ["/Productos/teclado-logitech-k380.jpg"],
            cantidad: 3
          }
        ]
      },
      {
        id: "tk2",
        nombre: "Teclado mecánico RGB gaming",
        precio: 79.99,
        descripcion: "Iluminación personalizable y switches táctiles.",
        imagen: "/Productos/teclado-gamer-rgb.jpg",
        imagenes: ["/Productos/teclado-gamer-rgb.jpg"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Switches mecánicos",
          "Iluminación RGB personalizable",
          "Teclas anti-ghosting",
          "Reposamuñecas desmontable"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/teclado-gamer-rgb.jpg",
            imagenes: ["/Productos/teclado-gamer-rgb.jpg"],
            cantidad: 4
          }
        ]
      },
      {
        id: "tk3",
        nombre: "Teclado ergonómico dividido Microsoft",
        precio: 59.99,
        descripcion: "Diseño para largas sesiones de escritura.",
        imagen: "/Productos/teclado-ergonomico.jpg",
        imagenes: ["/Productos/teclado-ergonomico.jpg"],
        oferta: false,
        estado: "Nuevo",
        acerca: [
          "Diseño dividido ergonómico",
          "Soporte para muñecas acolchado",
          "Teclas multimedia",
          "Compatible con Windows y Mac"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/teclado-ergonomico.jpg",
            imagenes: ["/Productos/teclado-ergonomico.jpg"],
            cantidad: 2
          }
        ]
      },
    ],
  },
  {
    categoria: "Videojuegos",
    productos: [
      {
        id: "vj1",
        nombre: "FIFA 23",
        precio: 59.99,
        descripcion: "Fútbol con mejoras gráficas y físicas.",
        imagen: "/Productos/fifa23.jpg",
        imagenes: ["/Productos/fifa23.jpg"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Modo carrera y multijugador",
          "Plantillas actualizadas",
          "Compatible con PS5/PS4/Xbox/PC",
          "Nuevas físicas de balón"
        ],
        variantes: [
          {
            color: "Azul",
            imagen: "/Productos/fifa23.jpg",
            imagenes: ["/Productos/fifa23.jpg"],
            cantidad: 5
          }
        ]
      },
      {
        id: "vj3",
        nombre: "The Legend of Zelda: Breath of the Wild",
        precio: 59.99,
        descripcion: "Aventura épica en mundo abierto.",
        imagen: "/Productos/zelda.webp",
        imagenes: ["/Productos/zelda.webp"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Exploración libre",
          "Compatible con Nintendo Switch",
          "Gran duración de juego",
          "Gráficos impresionantes"
        ],
        variantes: [
          {
            color: "Verde",
            imagen: "/Productos/zelda.webp",
            imagenes: ["/Productos/zelda.webp"],
            cantidad: 3
          }
        ]
      },
      {
        id: "vj4",
        nombre: "Gran Turismo 7",
        precio: 69.99,
        descripcion: "Simulación de autos realista.",
        imagen: "/Productos/gt7.jpg",
        imagenes: ["/Productos/gt7.jpg"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Más de 400 autos",
          "Modo online y offline",
          "Compatible con PS5/PS4",
          "Gráficos ultra realistas"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/gt7.jpg",
            imagenes: ["/Productos/gt7.jpg"],
            cantidad: 2
          }
        ]
      },
      {
        id: "vj5",
        nombre: "Marvel's Spider-Man: Miles Morales (PS5)",
        precio: 49.99,
        descripcion: "Ágil y cinematográfica aventura del universo Marvel.",
        imagen: "/Productos/spider-manps5.jpeg",
        imagenes: ["/Productos/spider-manps5.jpeg"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Exclusivo para PS5",
          "Gráficos en 4K",
          "Historia original Marvel",
          "Acción en mundo abierto"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/spider-manps5.jpeg",
            imagenes: ["/Productos/spider-manps5.jpeg"],
            cantidad: 3
          }
        ]
      },
      {
        id: "vj6",
        nombre: "Mario Kart 8 Deluxe (Switch)",
        precio: 59.99,
        descripcion: "Carreras locas, ítems clásicos y multiplayer épico.",
        imagen: "/Productos/Mario-Kart-8.jpeg",
        imagenes: ["/Productos/Mario-Kart-8.jpeg"],
        oferta: false,
        estado: "Nuevo",
        acerca: [
          "Compatible con Nintendo Switch",
          "Multijugador local y online",
          "Incluye todos los DLC",
          "Frenesí de carreras"
        ],
        variantes: [
          {
            color: "Rojo",
            imagen: "/Productos/Mario-Kart-8.jpeg",
            imagenes: ["/Productos/Mario-Kart-8.jpeg"],
            cantidad: 4
          }
        ]
      },
      {
        id: "vj7",
        nombre: "Super Smash Bros. Ultimate (Switch)",
        precio: 64.99,
        descripcion: "El crossover de batallas más grande de Nintendo.",
        imagen: "/Productos/super-smash-bros.jpg",
        imagenes: ["/Productos/super-smash-bros.jpg"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Más de 70 personajes jugables",
          "Compatible con Nintendo Switch",
          "Modo aventura y multijugador",
          "Todos los universos de Nintendo"
        ],
        variantes: [
          {
            color: "Azul",
            imagen: "/Productos/super-smash-bros.jpg",
            imagenes: ["/Productos/super-smash-bros.jpg"],
            cantidad: 6
          }
        ]
      },
    ],
  },

    {
    categoria: "Smart TV",
    productos: [
      {
        id: "tv1",
        nombre: "Samsung Smart TV 55\" UHD",
        precio: 499.99,
        descripcion: "4K UHD, control por voz y apps integradas.",
        imagen: "/Productos/samsung-smarttv.jpg",
        imagenes: ["/Productos/samsung-smarttv.jpg"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Pantalla 55'' 4K UHD",
          "Control por voz integrado",
          "Acceso a apps de streaming",
          "HDR10+ y WiFi"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/samsung-smarttv.jpg",
            imagenes: ["/Productos/samsung-smarttv.jpg"],
            cantidad: 3
          }
        ]
      },
      {
        id: "tv2",
        nombre: "LG OLED 65 pulgadas",
        precio: 1199.99,
        descripcion: "Negros profundos y colores realistas.",
        imagen: "/Productos/lg-oled65.jpg",
        imagenes: ["/Productos/lg-oled65.jpg"],
        oferta: false,
        estado: "Nuevo",
        acerca: [
          "Pantalla OLED 65''",
          "Resolución 4K",
          "Dolby Vision y Atmos",
          "ThinQ AI integrado"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/lg-oled65.jpg",
            imagenes: ["/Productos/lg-oled65.jpg"],
            cantidad: 2
          }
        ]
      },
      {
        id: "tv3",
        nombre: "Hisense 43\" FHD Smart TV",
        precio: 299.99,
        descripcion: "Compacta y con acceso rápido a streaming.",
        imagen: "/Productos/hisense-43.jpg",
        imagenes: ["/Productos/hisense-43.jpg"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Pantalla Full HD 43''",
          "Smart TV con apps populares",
          "Control remoto incluido",
          "Conectividad HDMI y USB"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/hisense-43.jpg",
            imagenes: ["/Productos/hisense-43.jpg"],
            cantidad: 4
          }
        ]
      },
    ],
  },
  {
    categoria: "Memorias USB",
    productos: [
      {
        id: "usb1",
        nombre: "USB SanDisk 64GB",
        precio: 12.99,
        descripcion: "Compacta y veloz para llevar tus archivos.",
        imagen: "/Productos/sandisk.jpeg",
        imagenes: ["/Productos/sandisk.jpeg"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Capacidad 64GB",
          "USB 3.1",
          "Diseño resistente",
          "Compatible con Windows, Mac y Linux"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/sandisk.jpeg",
            imagenes: ["/Productos/sandisk.jpeg"],
            cantidad: 10
          }
        ]
      },
      {
        id: "usb2",
        nombre: "Kingston 128GB USB 3.1",
        precio: 19.99,
        descripcion: "Velocidades superiores para trabajo o backup.",
        imagen: "/Productos/kingston.webp",
        imagenes: ["/Productos/kingston.webp"],
        oferta: false,
        estado: "Nuevo",
        acerca: [
          "Capacidad 128GB",
          "USB 3.1 Gen 1",
          "Alto rendimiento de lectura y escritura",
          "Diseño compacto"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/kingston.webp",
            imagenes: ["/Productos/kingston.webp"],
            cantidad: 8
          }
        ]
      },
      {
        id: "usb3",
        nombre: "HP v150w 32GB",
        precio: 8.99,
        descripcion: "Diseño duradero y práctico.",
        imagen: "/Productos/hp.jpeg",
        imagenes: ["/Productos/hp.jpeg"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Capacidad 32GB",
          "USB 2.0",
          "Resistente al agua y golpes",
          "Ideal para portabilidad"
        ],
        variantes: [
          {
            color: "Azul",
            imagen: "/Productos/hp.jpeg",
            imagenes: ["/Productos/hp.jpeg"],
            cantidad: 12
          }
        ]
      },
      {
        id: "usb4",
        nombre: "Corsair Flash Voyager 256GB",
        precio: 49.99,
        descripcion: "Almacenamiento masivo en formato USB 3.0.",
        imagen: "/Productos/corsair.avif",
        imagenes: ["/Productos/corsair.avif"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Capacidad 256GB",
          "USB 3.0 de alta velocidad",
          "Diseño resistente al agua",
          "Compatible con todos los sistemas operativos"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/corsair.avif",
            imagenes: ["/Productos/corsair.avif"],
            cantidad: 3
          }
        ]
      },
      {
        id: "usb5",
        nombre: "Patriot Supersonic Rage 2 128GB",
        precio: 39.99,
        descripcion: "Transferencia ultrarrápida hasta 400MB/s.",
        imagen: "/Productos/patriot-rage2.jpg",
        imagenes: ["/Productos/patriot-rage2.jpg"],
        oferta: false,
        estado: "Nuevo",
        acerca: [
          "Capacidad 128GB",
          "USB 3.1",
          "Velocidad de transferencia hasta 400MB/s",
          "Carcasa resistente"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/patriot-rage2.jpg",
            imagenes: ["/Productos/patriot-rage2.jpg"],
            cantidad: 5
          }
        ]
      },
    ],
  },
  {
    categoria: "Hogar Inteligente",
    productos: [
      {
        id: "hi1",
        nombre: "Foco inteligente Wi-Fi RGB",
        precio: 24.99,
        descripcion: "Control desde app o comandos de voz.",
        imagen: "/Productos/foco-inteligente.jpg",
        imagenes: ["/Productos/foco-inteligente.jpg"],
        oferta: true,
        estado: "Usado",
        acerca: [
          "Control por app o voz",
          "Colores RGB configurables",
          "Compatible con Alexa y Google",
          "Ahorro energético"
        ],
        variantes: [
          {
            color: "Blanco",
            imagen: "/Productos/foco-inteligente.jpg",
            imagenes: ["/Productos/foco-inteligente.jpg"],
            cantidad: 8
          }
        ]
      },
      {
        id: "hi2",
        nombre: "Enchufe inteligente TP-Link",
        precio: 21.99,
        descripcion: "Enciende o apaga tus dispositivos remotamente.",
        imagen: "/Productos/enchufe-inteligente.jpg",
        imagenes: ["/Productos/enchufe-inteligente.jpg"],
        oferta: false,
        estado: "Usado",
        acerca: [
          "Control remoto vía app",
          "Medición de consumo energético",
          "Programación de horarios",
          "Compatible con Alexa y Google"
        ],
        variantes: [
          {
            color: "Blanco",
            imagen: "/Productos/enchufe-inteligente.jpg",
            imagenes: ["/Productos/enchufe-inteligente.jpg"],
            cantidad: 6
          }
        ]
      },
      {
        id: "hi4",
        nombre: "Sensor de movimiento Wi-Fi",
        precio: 19.99,
        descripcion: "Detecta presencia y envía alertas a tu celular.",
        imagen: "/Productos/sensor-movimiento.jpg",
        imagenes: ["/Productos/sensor-movimiento.jpg"],
        oferta: true,
        estado: "Usado",
        acerca: [
          "Conexión Wi-Fi",
          "Alertas instantáneas",
          "Compatible con app móvil",
          "Fácil instalación"
        ],
        variantes: [
          {
            color: "Blanco",
            imagen: "/Productos/sensor-movimiento.jpg",
            imagenes: ["/Productos/sensor-movimiento.jpg"],
            cantidad: 7
          }
        ]
      },
      {
        id: "hi5",
        nombre: "Interruptor de pared inteligente",
        precio: 29.99,
        descripcion: "Convierte cualquier luz convencional en smart.",
        imagen: "/Productos/interruptor-inteligente.jpg",
        imagenes: ["/Productos/interruptor-inteligente.jpg"],
        oferta: false,
        estado: "Usado",
        acerca: [
          "Control remoto y por voz",
          "Compatible con Alexa y Google",
          "Fácil de instalar",
          "Permite programar horarios"
        ],
        variantes: [
          {
            color: "Blanco",
            imagen: "/Productos/interruptor-inteligente.jpg",
            imagenes: ["/Productos/interruptor-inteligente.jpg"],
            cantidad: 5
          }
        ]
      },
      {
        id: "hi6",
        nombre: "Sensor de puertas y ventanas",
        precio: 17.99,
        descripcion: "Recibe notificaciones cuando se abren o cierran.",
        imagen: "/Productos/sensor-puerta.jpg",
        imagenes: ["/Productos/sensor-puerta.jpg"],
        oferta: true,
        estado: "Usado",
        acerca: [
          "Notificación instantánea",
          "Funciona por Wi-Fi",
          "Compatible con Alexa y Google",
          "Batería de larga duración"
        ],
        variantes: [
          {
            color: "Blanco",
            imagen: "/Productos/sensor-puerta.jpg",
            imagenes: ["/Productos/sensor-puerta.jpg"],
            cantidad: 4
          }
        ]
      },
      {
        id: "hi7",
        nombre: "Humidificador inteligente con luz LED",
        precio: 34.99,
        descripcion: "Conéctalo a Alexa o Google Assistant y relájate.",
        imagen: "/Productos/humidificador-smart.jpg",
        imagenes: ["/Productos/humidificador-smart.jpg"],
        oferta: true,
        estado: "Usado",
        acerca: [
          "Iluminación LED",
          "Control por voz y app",
          "Capacidad de 300ml",
          "Apagado automático"
        ],
        variantes: [
          {
            color: "Blanco",
            imagen: "/Productos/humidificador-smart.jpg",
            imagenes: ["/Productos/humidificador-smart.jpg"],
            cantidad: 5
          }
        ]
      },
      {
        id: "hi8",
        nombre: "Amazon Echo Dot 4ta Generación",
        precio: 49.99,
        descripcion: "Altavoz inteligente con Alexa integrado.",
        imagen: "/Productos/echo-dot.jpg",
        imagenes: ["/Productos/echo-dot.jpg"],
        oferta: true,
        estado: "Usado",
        acerca: [
          "Control por voz con Alexa",
          "Altavoz de alta calidad",
          "Conectividad Bluetooth y Wi-Fi",
          "Diseño compacto"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/echo-dot.jpg",
            imagenes: ["/Productos/echo-dot.jpg"],
            cantidad: 7
          }
        ]
      },
      {
        id: "hi9",
        nombre: "Amazon Echo Show 8",
        precio: 89.99,
        descripcion: "Pantalla inteligente para videollamadas y control del hogar.",
        imagen: "/Productos/echo-show-8.jpg",
        imagenes: ["/Productos/echo-show-8.jpg"],
        oferta: true,
        estado: "Usado",
        acerca: [
          "Pantalla HD 8''",
          "Videollamadas y mensajes",
          "Control de hogar inteligente",
          "Cámara integrada"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/echo-show-8.jpg",
            imagenes: ["/Productos/echo-show-8.jpg"],
            cantidad: 5
          }
        ]
      },
      {
        id: "hi10",
        nombre: "Echo Auto",
        precio: 49.99,
        descripcion: "Alexa para tu vehículo con manos libres.",
        imagen: "/Productos/echo-auto.jpg",
        imagenes: ["/Productos/echo-auto.jpg"],
        oferta: false,
        estado: "Usado",
        acerca: [
          "Control de voz para automóvil",
          "Conexión por Bluetooth y jack 3.5mm",
          "Compatible con Alexa",
          "Instalación sencilla"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/echo-auto.jpg",
            imagenes: ["/Productos/echo-auto.jpg"],
            cantidad: 4
          }
        ]
      },
      {
        id: "hi11",
        nombre: "Smart Plug compatible con Alexa",
        precio: 19.99,
        descripcion: "Controla cualquier aparato con comandos de voz.",
        imagen: "/Productos/smart-plug-alexa.jpg",
        imagenes: ["/Productos/smart-plug-alexa.jpg"],
        oferta: true,
        estado: "Usado",
        acerca: [
          "Funciona con Alexa",
          "Control remoto por app",
          "Programación de horarios",
          "Fácil de configurar"
        ],
        variantes: [
          {
            color: "Blanco",
            imagen: "/Productos/smart-plug-alexa.jpg",
            imagenes: ["/Productos/smart-plug-alexa.jpg"],
            cantidad: 9
          }
        ]
      },
      {
        id: "hi12",
        nombre: "Control remoto infrarrojo inteligente",
        precio: 23.99,
        descripcion: "Control universal de TV, aire y más vía Alexa.",
        imagen: "/Productos/ir-remote.jpg",
        imagenes: ["/Productos/ir-remote.jpg"],
        oferta: false,
        estado: "Usado",
        acerca: [
          "Compatible con múltiples dispositivos",
          "Control vía app y Alexa",
          "Fácil configuración",
          "Transmisión IR de largo alcance"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/ir-remote.jpg",
            imagenes: ["/Productos/ir-remote.jpg"],
            cantidad: 6
          }
        ]
      },
    ],
  },

    {
    categoria: "Impresoras",
    productos: [
      {
        id: "imp001",
        nombre: "Impresora Epson EcoTank L3250",
        precio: 229.99,
        descripcion: "Impresora multifuncional con sistema de tinta continua, ideal para hogar y oficina.",
        imagen: "/Productos/epson-l3250.jpg",
        imagenes: ["/Productos/epson-l3250.jpg"],
        oferta: true,
        estado: "Usado",
        acerca: [
          "Sistema de tinta continua EcoTank",
          "Impresión, escaneo y copiado",
          "WiFi y USB",
          "Ahorro en costos de impresión"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/epson-l3250.jpg",
            imagenes: ["/Productos/epson-l3250.jpg"],
            cantidad: 2
          }
        ]
      },
      {
        id: "imp002",
        nombre: "HP DeskJet 4155e All-in-One",
        precio: 119.99,
        descripcion: "Impresión inalámbrica, escaneo y copia desde tu celular con la app HP Smart.",
        imagen: "/Productos/hp-deskjet.jpg",
        imagenes: ["/Productos/hp-deskjet.jpg"],
        oferta: false,
        estado: "Usado",
        acerca: [
          "Multifuncional: imprime, copia y escanea",
          "Conectividad WiFi y USB",
          "Compatible con app HP Smart",
          "Cartuchos económicos"
        ],
        variantes: [
          {
            color: "Blanco",
            imagen: "/Productos/hp-deskjet.jpg",
            imagenes: ["/Productos/hp-deskjet.jpg"],
            cantidad: 3
          }
        ]
      },
      {
        id: "imp003",
        nombre: "Brother HL-L2350DW Láser monocromática",
        precio: 179.99,
        descripcion: "Impresora láser rápida y compacta con Wi-Fi y auto dúplex.",
        imagen: "/Productos/brother-hl.jpg",
        imagenes: ["/Productos/brother-hl.jpg"],
        oferta: true,
        estado: "Usado",
        acerca: [
          "Impresora láser monocromática",
          "WiFi y USB",
          "Impresión automática a doble cara",
          "Alta velocidad de impresión"
        ],
        variantes: [
          {
            color: "Gris",
            imagen: "/Productos/brother-hl.jpg",
            imagenes: ["/Productos/brother-hl.jpg"],
            cantidad: 1
          }
        ]
      },
      {
        id: "imp004",
        nombre: "Canon PIXMA G5020",
        precio: 199.99,
        descripcion: "Tanques de tinta integrados, gran rendimiento por página, ideal para impresión masiva.",
        imagen: "/Productos/canon-pixma-g5020.jpg",
        imagenes: ["/Productos/canon-pixma-g5020.jpg"],
        oferta: false,
        estado: "Usado",
        acerca: [
          "Sistema de tinta continua",
          "WiFi y Ethernet",
          "Alta capacidad de impresión",
          "Impresión sin bordes"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/canon-pixma-g5020.jpg",
            imagenes: ["/Productos/canon-pixma-g5020.jpg"],
            cantidad: 2
          }
        ]
      }
    ]
  },
  {
    categoria: "Nuevos Lanzamientos",
    productos: [
      {
        id: "nl1",
        nombre: "PlayStation Portal",
        precio: 199.99,
        descripcion: "Juego remoto de PS5 en tus manos.",
        imagen: "/Productos/playstation-portal.jpg",
        imagenes: ["/Productos/playstation-portal.jpg"],
        oferta: true,
        estado: "Usado",
        acerca: [
          "Pantalla LCD de 8''",
          "Streaming remoto de juegos PS5",
          "Controles integrados",
          "Conectividad WiFi"
        ],
        variantes: [
          {
            color: "Blanco",
            imagen: "/Productos/playstation-portal.jpg",
            imagenes: ["/Productos/playstation-portal.jpg"],
            cantidad: 1
          }
        ]
      },
      {
        id: "nl2",
        nombre: "Apple Vision Pro",
        precio: 3499.00,
        descripcion: "Revoluciona tu espacio con realidad mixta.",
        imagen: "/Productos/vision-pro.jpg",
        imagenes: ["/Productos/vision-pro.jpg"],
        oferta: false,
        estado: "Usado",
        acerca: [
          "Realidad aumentada y virtual",
          "Pantalla micro-OLED 4K",
          "Procesador Apple M2",
          "Control por gestos y voz"
        ],
        variantes: [
          {
            color: "Gris",
            imagen: "/Productos/vision-pro.jpg",
            imagenes: ["/Productos/vision-pro.jpg"],
            cantidad: 1
          }
        ]
      },
      {
        id: "nl3",
        nombre: "Nintendo Switch 2",
        precio: 449.99,
        descripcion: "Pantalla mejorada, nuevo dock y retrocompatibilidad.",
        imagen: "/Productos/switch2.jpg",
        imagenes: ["/Productos/switch2.jpg"],
        oferta: true,
        estado: "Usado",
        acerca: [
          "Pantalla OLED mejorada",
          "Nuevo dock con salida 4K",
          "Retrocompatible con Switch 1",
          "Mayor duración de batería"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/switch2.jpg",
            imagenes: ["/Productos/switch2.jpg"],
            cantidad: 2
          }
        ]
      }
    ]
  },
  {
    categoria: "Ofertas Especiales",
    productos: [
      {
        id: "of1",
        nombre: "Combo: PS5 + 2 juegos",
        precio: 549.99,
        descripcion: "Incluye Spider-Man y God of War.",
        imagen: "/Productos/combo-ps5.jpg",
        imagenes: ["/Productos/combo-ps5.jpg"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "PlayStation 5 edición estándar",
          "Incluye Spider-Man y God of War",
          "2 controles DualSense",
          "Listo para jugar"
        ],
        variantes: [
          {
            color: "Blanco",
            imagen: "/Productos/combo-ps5.jpg",
            imagenes: ["/Productos/combo-ps5.jpg"],
            cantidad: 2
          }
        ]
      },
      {
        id: "of2",
        nombre: "Combo gamer: Silla + Mousepad RGB",
        precio: 279.99,
        descripcion: "Estilo, comodidad y precisión.",
        imagen: "/Productos/combo-gamer.jpg",
        imagenes: ["/Productos/combo-gamer.jpg"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Silla gamer ergonómica",
          "Mousepad con iluminación RGB",
          "Ajuste de altura y respaldo",
          "Superficie antideslizante"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/combo-gamer.jpg",
            imagenes: ["/Productos/combo-gamer.jpg"],
            cantidad: 3
          }
        ]
      },
      {
        id: "of3",
        nombre: "Oferta Smart TV + Soporte",
        precio: 519.99,
        descripcion: "Ideal para tu setup de sala o habitación.",
        imagen: "/Productos/combo-tv.jpg",
        imagenes: ["/Productos/combo-tv.jpg"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Smart TV 50'' 4K UHD",
          "Soporte de pared incluido",
          "Control remoto",
          "Conectividad HDMI y USB"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/combo-tv.jpg",
            imagenes: ["/Productos/combo-tv.jpg"],
            cantidad: 2
          }
        ]
      }
    ]
  },
  {
    categoria: "Relojes Inteligentes",
    productos: [
      {
        id: "rl1",
        nombre: "Apple Watch Series 9",
        precio: 399.99,
        descripcion: "Monitoreo avanzado de salud y entrenamiento.",
        imagen: "/Productos/apple-watch9.jpg",
        imagenes: ["/Productos/apple-watch9.jpg"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Pantalla Always-On Retina",
          "Resistencia al agua 50m",
          "Monitoreo de salud y ejercicio",
          "Hasta 18h de batería"
        ],
        variantes: [
          {
            color: "Gris",
            imagen: "/Productos/apple-watch9.jpg",
            imagenes: ["/Productos/apple-watch9.jpg"],
            cantidad: 3
          }
        ]
      },
      {
        id: "rl2",
        nombre: "Samsung Galaxy Watch 6",
        precio: 299.99,
        descripcion: "Diseño elegante y duración de batería sólida.",
        imagen: "/Productos/galaxy-watch6.jpg",
        imagenes: ["/Productos/galaxy-watch6.jpg"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Pantalla AMOLED",
          "GPS integrado",
          "Monitor de sueño y ritmo cardíaco",
          "Duración batería hasta 40h"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/galaxy-watch6.jpg",
            imagenes: ["/Productos/galaxy-watch6.jpg"],
            cantidad: 2
          }
        ]
      },
      {
        id: "rl3",
        nombre: "Xiaomi Watch S1 Active",
        precio: 169.99,
        descripcion: "Resistente al agua y con más de 100 modos deportivos.",
        imagen: "/Productos/xiaomi-watch.jpg",
        imagenes: ["/Productos/xiaomi-watch.jpg"],
        oferta: false,
        estado: "Nuevo",
        acerca: [
          "Más de 100 modos deportivos",
          "Resistente al agua 5ATM",
          "GPS y monitor de oxígeno",
          "Pantalla AMOLED de 1.43''"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/xiaomi-watch.jpg",
            imagenes: ["/Productos/xiaomi-watch.jpg"],
            cantidad: 5
          }
        ]
      }
    ]
  },
  {
    categoria: "AccesoriosVideojuegos",
    productos: [
      {
        id: "av1",
        nombre: "Controlador Inalámbrico Xbox Series X",
        precio: 59.99,
        descripcion: "Diseño ergonómico con agarre antideslizante y respuesta háptica precisa.",
        imagen: "/Productos/control-xbox.jpg",
        imagenes: ["/Productos/control-xbox.jpg"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Conectividad inalámbrica y Bluetooth",
          "Compatibilidad con Xbox y PC",
          "Agarre antideslizante",
          "Respuesta háptica precisa"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/control-xbox.jpg",
            imagenes: ["/Productos/control-xbox.jpg"],
            cantidad: 6
          }
        ]
      },
      {
        id: "av2",
        nombre: "Headset Gaming Logitech G733",
        precio: 129.99,
        descripcion: "Auriculares inalámbricos con sonido envolvente y micrófono de calidad profesional.",
        imagen: "/Productos/logitech-g733.jpg",
        imagenes: ["/Productos/logitech-g733.jpg"],
        oferta: false,
        estado: "Nuevo",
        acerca: [
          "Sonido envolvente LIGHTSPEED",
          "Micrófono de calidad profesional",
          "Iluminación RGB",
          "Compatibilidad multiplataforma"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/logitech-g733.jpg",
            imagenes: ["/Productos/logitech-g733.jpg"],
            cantidad: 3
          }
        ]
      },
      {
        id: "av3",
        nombre: "Teclado Mecánico Razer BlackWidow V3",
        precio: 139.99,
        descripcion: "Switches mecánicos verdes y retroiluminación RGB personalizable.",
        imagen: "/Productos/razer-teclado.jpg",
        imagenes: ["/Productos/razer-teclado.jpg"],
        oferta: true,
        estado: "Nuevo",
        acerca: [
          "Switches mecánicos verdes",
          "Iluminación RGB personalizable",
          "Reposamuñecas ergonómico",
          "Compatible con Synapse"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/razer-teclado.jpg",
            imagenes: ["/Productos/razer-teclado.jpg"],
            cantidad: 4
          }
        ]
      }
    ]
  },
  {
    categoria: "Mouses",
    productos: [
      {
        id: "p4",
        nombre: "Mouse Gamer MEE TION M371",
        sku: "M371-GAMING",
        precio: 700,
        descripcion: "Mouse con iluminación LED, 3 niveles de DPI (800/1200/1600), botones de navegación y diseño ergonómico.",
        imagen: "/productospcu/meetionmouse.png",
        imagenes: ["/productospcu/meetionmouse.png"],
        oferta: false,
        estado: "Nuevo",
        acerca: [
          "Iluminación LED breathing",
          "3 niveles de DPI: 800/1200/1600",
          "Botones adicionales para navegación",
          "Sensor óptico preciso"
        ],
        variantes: [
          {
            imagen: "/productospcu/meetionmouse.png",
            imagenes: ["/productospcu/meetionmouse.png"],
            cantidad: 4
          }
        ]
      },

      {
        id: "m2",
        nombre: "Mouse Inalámbrico Razer Basilisk X",
        precio: 49.99,
        descripcion: "Conectividad inalámbrica Bluetooth y 16,000 DPI.",
        imagen: "/Productos/razer-basilisk-x.jpg",
        imagenes: ["/Productos/razer-basilisk-x.jpg"],
        oferta: false,
        estado: "Usado",
        acerca: [
          "Conectividad Bluetooth y 2.4GHz",
          "Sensor 16,000 DPI",
          "Hasta 450 horas de batería",
          "6 botones programables"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/razer-basilisk-x.jpg",
            imagenes: ["/Productos/razer-basilisk-x.jpg"],
            cantidad: 2
          }
        ]
      },
      {
        id: "m3",
        nombre: "Mouse Corsair M65 RGB Elite",
        precio: 59.99,
        descripcion: "Carcasa de aluminio y peso ajustable para máxima precisión.",
        imagen: "/Productos/corsair-m65.jpg",
        imagenes: ["/Productos/corsair-m65.jpg"],
        oferta: true,
        estado: "Usado",
        acerca: [
          "Carcasa de aluminio",
          "Peso ajustable",
          "Sensor óptico de alta precisión",
          "Retroiluminación RGB"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/corsair-m65.jpg",
            imagenes: ["/Productos/corsair-m65.jpg"],
            cantidad: 1
          }
        ]
      }
    ]
  },
  {
    categoria: "Controles",
    productos: [
      {
        id: "c1",
        nombre: "Control Inalámbrico PS5 DualSense",
        precio: 69.99,
        descripcion: "Inmersión háptica y gatillos adaptativos para una experiencia de juego revolucionaria.",
        imagen: "/Productos/ps5-dualsense.jpg",
        imagenes: ["/Productos/ps5-dualsense.jpg"],
        oferta: true,
        estado: "Usado",
        acerca: [
          "Inmersión háptica",
          "Gatillos adaptativos",
          "Batería recargable",
          "Compatibilidad con PS5 y PC"
        ],
        variantes: [
          {
            color: "Blanco",
            imagen: "/Productos/ps5-dualsense.jpg",
            imagenes: ["/Productos/ps5-dualsense.jpg"],
            cantidad: 2
          }
        ]
      },

      {
        id: "p5",
        nombre: "Controlador Inalámbrico para Nintendo Switch",
        sku: "NS-WIRELESS",
        precio: 1450,
        descripcion: "Control inalámbrico con sensores de movimiento, vibración doble y conexión USB Tipo-C. Compatible con Nintendo Switch.",
        imagen: "/productospcu/controlN-S.png",
        imagenes: ["/productospcu/controlN-S.png"],
        oferta: false,
        estado: "Nuevo",
        acerca: [
          "Compatible con Nintendo Switch",
          "Sensores de movimiento",
          "Vibración doble",
          "Recargable por USB Tipo-C",
          "Conexión Bluetooth"
        ],
        variantes: [
          {
            imagen: "/productospcu/controlN-S.png",
            imagenes: ["/productospcu/controlN-S.png"],
            cantidad: 3
          }
        ]
      },

      {
        id: "c2",
        nombre: "Control Xbox Series X",
        precio: 59.99,
        descripcion: "Diseño mejorado con texturizado y latencia reducida.",
        imagen: "/Productos/xbox-seriesx.jpg",
        imagenes: ["/Productos/xbox-seriesx.jpg"],
        oferta: false,
        estado: "Usado",
        acerca: [
          "Texturizado mejorado",
          "Baja latencia",
          "Compatibilidad con Xbox y PC",
          "Bluetooth integrado"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/xbox-seriesx.jpg",
            imagenes: ["/Productos/xbox-seriesx.jpg"],
            cantidad: 2
          }
        ]
      },
      {
        id: "c3",
        nombre: "Nintendo Switch Pro Controller",
        precio: 69.99,
        descripcion: "Ergonómico, batería de larga duración y controles precisos.",
        imagen: "/Productos/switch-pro.jpg",
        imagenes: ["/Productos/switch-pro.jpg"],
        oferta: true,
        estado: "Usado",
        acerca: [
          "Diseño ergonómico",
          "Batería de larga duración",
          "Compatibilidad con Nintendo Switch",
          "Vibración HD"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/Productos/switch-pro.jpg",
            imagenes: ["/Productos/switch-pro.jpg"],
            cantidad: 1
          }
        ]
      },
      {
        id: "c4",
        nombre: "Control Inalámbrico Logitech F710",
        precio: 49.99,
        descripcion: "Compatibilidad con PC y vibración dual.",
        imagen: "/Productos/logitech-f710.jpg",
        imagenes: ["/Productos/logitech-f710.jpg"],
        oferta: false,
        estado: "Usado",
        acerca: [
          "Compatibilidad con PC",
          "Conexión inalámbrica",
          "Vibración dual",
          "Agarre ergonómico"
        ],
        variantes: [
          {
            color: "Gris",
            imagen: "/Productos/logitech-f710.jpg",
            imagenes: ["/Productos/logitech-f710.jpg"],
            cantidad: 1
          }
        ]
      },
      {
        id: "c5",
        nombre: "Sony DualShock 4 Wireless Controller para PS4 / PS TV / PS Now",
        precio: 54.99,
        descripcion: "Control original con conexión inalámbrica y vibración dual compatible con múltiples plataformas.",
        imagen: "/productospcu/dualshock4-negro.png",
        imagenes: [
          "/productospcu/dualshock4-negro.png",
          "/productospcu/Adualshock4-rojo.png",
          "/productospcu/dualshock4-azul.png",
          "/productospcu/dualshock4-back.png"
        ],
        acerca: [
          "Conexión inalámbrica Bluetooth para mayor libertad de juego",
          "Panel táctil multitáctil en la parte frontal",
          "Barra de luz integrada para seguimiento y personalización",
          "Jack de audio de 3.5 mm para auriculares",
          "Compatible con PS4, PS TV, PS Now y PC vía Bluetooth o cable USB",
          "Batería recargable con hasta 8 horas de duración"
        ],
        variantes: [
          {
            color: "Negro",
            imagen: "/productospcu/dualshock4-negro.png",
            imagenes: [
              "/productospcu/dualshock4-negro.png",
              "/productospcu/dualshock4-back.png"
            ],
            cantidad: 1
          },
          {
            color: "Rojo",
            imagen: "/productospcu/Adualshock4-rojo.png",
            imagenes: [
              "/productospcu/Adualshock4-rojo.png",
              "/productospcu/dualshock4-back.png"
            ],
            cantidad: 1
          },
          {
            color: "Azul",
            imagen: "/productospcu/dualshock4-azul.png",
            imagenes: [
              "/productospcu/dualshock4-azul.png",
              "/productospcu/dualshock4-back.png"
            ],
            cantidad: 1
          }
        ],
        oferta: true,
        estado: "Usado"
      }
    ]
  }
];


export default productosAll;