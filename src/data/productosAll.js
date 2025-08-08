const productosAll = [
{
  categoria: "Retro Consolas",
  productos: [
    {
      id: "rc1",
      nombre: "Nintendo Entertainment System (NES)",
      empresa: "Nintendo",
      precio: 1200.0,
      descripcion: "La consola que marcó el inicio de una generación gamer.",
      imagen: "/Productos/nintendoentertainment.jpeg",
      imagenes: ["/Productos/nintendoentertainment.jpeg"],
      oferta: true,
      estado: "Nuevo",
      acerca: [
        "Incluye un control clásico",
        "Compatible con cartuchos originales y réplicas",
        "Salida AV para TV modernas",
        "Fácil de conectar y usar",
      ],
      variantes: [
        {
          color: "Gris",
          imagen: "/Productos/nintendoentertainment.jpeg",
          imagenes: ["/Productos/nintendoentertainment.jpeg"],
          cantidad: 3,
        },
      ],
      videoUrl: "/videos/nintendo(NES).mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg"
      ]
    },
    {
      id: "rc2",
      nombre: "Super Nintendo (SNES)",
      empresa: "Nintendo",
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
        "Compacta y fácil de instalar",
      ],
      variantes: [
        {
          color: "Gris",
          imagen: "/Productos/supernintendo.avif",
          imagenes: ["/Productos/supernintendo.avif"],
          cantidad: 2,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg"
      ]
    },
    {
      id: "rc3",
      nombre: "Sega Genesis",
      empresa: "",
      precio: 110.0,
      descripcion: "Sonic, Streets of Rage y más.",
      imagen: "/Productos/segagenesis.webp",
      imagenes: ["/Productos/segagenesis.webp"],
      oferta: true,
      estado: "Nuevo",
      acerca: [
        "Incluye cable de poder y AV",
        "Compatibilidad con cartuchos originales",
        "Diseño retro compacto",
      ],
      variantes: [
        {
          color: "Negro",
          imagen: "/Productos/segagenesis.webp",
          imagenes: ["/Productos/segagenesis.webp"],
          cantidad: 4,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg"
      ]
    },
    {
      id: "rc4",
      nombre: "PlayStation 1",
      empresa: "PlayStation",
      precio: 130.0,
      descripcion: "Donde empezó la leyenda de Crash y Final Fantasy.",
      imagen: "/Productos/playstation1.webp",
      imagenes: ["/Productos/playstation1.webp"],
      oferta: false,
      estado: "Nuevo",
      acerca: [
        "Lector de CD original",
        "Incluye un control clásico",
        "Compatible con memory card",
      ],
      variantes: [
        {
          color: "Gris",
          imagen: "/Productos/playstation1.webp",
          imagenes: ["/Productos/playstation1.webp"],
          cantidad: 2,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg"
      ]
    },
    {
      id: "rc5",
      nombre: "Game Boy Classic",
      empresa: "Nintendo",
      precio: 900,
      descripcion: "Pokémon Red en tu bolsillo.",
      imagen: "/Productos/gameboy.jpg",
      imagenes: ["/Productos/gameboy.jpg"],
      oferta: true,
      estado: "Nuevo",
      acerca: [
        "Pantalla monocromática",
        "Funciona con pilas AA",
        "Compatible con todos los juegos Game Boy",
      ],
      variantes: [
        {
          color: "Gris",
          imagen: "/Productos/gameboy.jpg",
          imagenes: ["/Productos/gameboy.jpg"],
          cantidad: 1,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg"
      ]
    },
    {
      id: "rc6",
      nombre: "Atari 2600",
      empresa: "",
      precio: 100.0,
      descripcion: "La precursora de las consolas modernas.",
      imagen: "/Productos/atari2600.png",
      imagenes: ["/Productos/atari2600.png"],
      oferta: false,
      estado: "Nuevo",
      acerca: [
        "Incluye joystick clásico",
        "Compatibilidad con cartuchos originales",
        "Diseño de madera vintage",
      ],
      variantes: [
        {
          color: "Madera",
          imagen: "/Productos/atari2600.png",
          imagenes: ["/Productos/atari2600.png"],
          cantidad: 2,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg"
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
      empresa: "Nintendo",
      precio: 35.0,
      descripcion: "El juego más icónico de plataformas 2D.",
      imagen: "/Productos/mario-bros-.png",
      imagenes: ["/Productos/mario-bros-.png"],
      oferta: true,
      estado: "Nuevo",
      acerca: [
        "Cartucho original",
        "Compatible con NES y clones",
        "Incluye caja protectora",
      ],
      variantes: [
        {
          color: "Rojo",
          imagen: "/Productos/mario-bros-.png",
          imagenes: ["/Productos/mario-bros-.png"],
          cantidad: 2,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg"
      ]
    },
    {
      id: "rj2",
      nombre: "The Legend of Zelda (NES)",
      empresa: "Nintendo",
      precio: 40.0,
      descripcion: "Explora Hyrule en 8 bits.",
      imagen: "/Productos/legen-of-zelda.png",
      imagenes: ["/Productos/legen-of-zelda.png"],
      oferta: false,
      estado: "Nuevo",
      acerca: [
        "Cartucho dorado",
        "Compatible con NES",
        "Incluye manual digital",
      ],
      variantes: [
        {
          color: "Dorado",
          imagen: "/Productos/legen-of-zelda.png",
          imagenes: ["/Productos/legen-of-zelda.png"],
          cantidad: 1,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg"
      ]
    },
    {
      id: "rj3",
      nombre: "Donkey Kong Country (SNES)",
      empresa: "Nintendo",
      precio: 42.0,
      descripcion: "Gráficos renderizados pioneros.",
      imagen: "/Productos/dk.jpg",
      imagenes: ["/Productos/dk.jpg"],
      oferta: true,
      estado: "Nuevo",
      acerca: [
        "Cartucho original",
        "Compatible con SNES",
        "Incluye caja retro",
      ],
      variantes: [
        {
          color: "Verde",
          imagen: "/Productos/dk.jpg",
          imagenes: ["/Productos/dk.jpg"],
          cantidad: 2,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg"
      ]
    },
    {
      id: "rj4",
      nombre: "Crash Bandicoot (PS1)",
      empresa: "PlayStation",
      precio: 38.0,
      descripcion: "Aventura en 3D de culto.",
      imagen: "/Productos/crash-retro.png",
      imagenes: ["/Productos/crash-retro.png"],
      oferta: true,
      estado: "Nuevo",
      acerca: [
        "Juego en CD original",
        "Compatible con PS1",
        "Incluye estuche retro",
      ],
      variantes: [
        {
          color: "Naranja",
          imagen: "/Productos/crash-retro.png",
          imagenes: ["/Productos/crash-retro.png"],
          cantidad: 1,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg"
      ]
    }
  ],
},


{
  categoria: "coleccionables",
  productos: [
    {
      id: "dc1",
      nombre: "Funko Pop - Mario Bros",
      empresa: "Funko",
      precio: 25.0,
      descripcion: "Figura coleccionable de Mario Bros en versión Funko Pop.",
      imagen: "/Productos/mario_pop.jpg",
      imagenes: ["/Productos/mario_pop.jpg"],
      oferta: false,
      estado: "Nuevo",
      acerca: [
        "Edición limitada",
        "Aproximadamente 10 cm de altura",
        "Ideal para fanáticos de Nintendo",
        "Caja con ventana para exhibir",
      ],
      variantes: [
        {
          color: "Rojo",
          imagen: "/Productos/mario_pop.jpg",
          imagenes: ["/Productos/mario_pop.jpg"],
          cantidad: 10,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg"
      ]
    },

    {
      id: "dc2",
      nombre: "Figura Coleccionable Zelda Link",
      empresa: "Nintendo",
      precio: 45.0,
      descripcion: "Figura detallada de Link de The Legend of Zelda para coleccionistas.",
      imagen: "/Productos/zelda_toy.jpg",
      imagenes: ["/Productos/zelda_toy.jpg"],
      oferta: true,
      estado: "Nuevo",
      acerca: [
        "Alta calidad y detalle",
        "Material PVC resistente",
        "Perfecto para exhibir en vitrinas",
      ],
      variantes: [
        {
          color: "Verde",
          imagen: "/Productos/zelda_toy.jpg",
          imagenes: ["/Productos/zelda_toy.jpg"],
          cantidad: 5,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg"
      ]
    },

    {
      id: "dc3",
      nombre: "Cartucho Retro Pokémon Edición Coleccionista",
      empresa: "Nintendo",
      precio: 80.0,
      descripcion: "Cartucho original de Pokémon para Game Boy, edición de colección.",
      imagen: "/Productos/poke_coleccion.jpg",
      imagenes: ["/Productos/poke_coleccion.jpg"],
      oferta: false,
      estado: "Usado",
      acerca: [
        "Cartucho original y funcional",
        "Perfecto para fans y coleccionistas",
        "Compatible con Game Boy y Game Boy Color",
      ],
      variantes: [
        {
          color: "N/A",
          imagen: "/Productos/poke_coleccion.jpg",
          imagenes: ["/Productos/poke_coleccion.jpg"],
          cantidad: 2,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg"
      ]
    },
  ],
},

{
  categoria: "Audífonos",
  productos: [
    {
      id: "ps4audio1",
      nombre: "Gaming Headphones con Micrófono para PS4",
      precio: 29.99,
      descripcion:
        "Auriculares con micrófono de reducción de ruido, compatibles con PS4. Ideales para gaming online y chats en tiempo real.",
      imagen: "/productospcu/headphones.png",
      imagenes: ["/productospcu/headphones.png"],
      oferta: false,
      estado: "Nuevo",
      empresa: "PlayStation",
      acerca: [
        "Conexión directa al control de PS4",
        "Controles de volumen y silencio integrados",
        "Cable de 1.3 metros (4.25 pies)",
        "Diseño cómodo y ajustable",
        "Micrófono con cancelación de ruido",
        "Sonido claro y nítido ideal para juegos online",
        "Compatible con juegos, chats, Skype y más",
      ],
      variantes: [
        {
          color: "Negro",
          imagen: "/productospcu/headphones.png",
          imagenes: [
            "/productospcu/headphones.png",
            "/productospcu/headphones-back.png",
          ],
          cantidad: 2,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
    {
      id: "p1",
      nombre: "Gaming Headset con Micrófono Ajustable para Xbox 360",
      sku: "Xbox",
      precio: 800,
      descripcion:
        "Audífonos para gaming con micrófono ajustable, conexión directa al control de Xbox 360. Ideal para chat y audio de juego.",
      imagen: "/productospcu/gamingheadsetxbox.png",
      imagenes: ["/productospcu/gamingheadsetxbox.png"],
      oferta: false,
      estado: "Nuevo",
      empresa: "Xbox 360",
      acerca: [
        "Micrófono flexible y ajustable",
        "Conexión por cable al control",
        "Diseño cómodo para largas sesiones",
        "Compatible solo con Xbox 360",
      ],
      variantes: [
        {
          imagen: "/productospcu/gamingheadsetxbox.png",
          imagenes: [
            "/productospcu/gamingheadsetxbox.png",
            "/productospcu/gaming-headset-back.png",
          ],
          cantidad: 3,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
    {
      id: "aud1",
      nombre: "Audífonos Inalámbricos 771A",
      precio: 34.99,
      descripcion:
        "Audífonos inalámbricos con micrófono integrado y sonido HD para música sin interrupciones.",
      imagen: "/productospcu/audifonos.png",
      imagenes: ["/productospcu/audifonos.png"],
      oferta: false,
      estado: "Nuevo",
      empresa: "Genérico",
      acerca: [
        "Sonido de alta definición",
        "Diseño cómodo para uso prolongado",
        "Micrófono integrado para llamadas o juegos",
        "Conexión inalámbrica Bluetooth",
        "Diseñados para música, películas y gaming",
      ],
      variantes: [
        {
          color: "Negro",
          imagen: "/productospcu/audifonos.png",
          imagenes: ["/productospcu/audifonos.png"],
          cantidad: 5,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
    {
      id: "p2",
      nombre: "Headset Inalámbrico AH-806W 6D Shock Sound",
      sku: "AH-806W-WIRELESS",
      precio: 1450,
      descripcion:
        "Audífonos inalámbricos con sonido envolvente 6D y graves potentes. Batería recargable, ideal para juegos y música.",
      imagen: "/productospcu/minionheadset.png",
      imagenes: ["/productospcu/minionheadset.png"],
      oferta: false,
      estado: "Nuevo",
      empresa: "Genérico",
      acerca: [
        "Inalámbrico",
        "Sonido envolvente 6D",
        "Graves potentes",
        "Diseño cómodo y moderno",
        "Batería recargable",
      ],
      variantes: [
        {
          imagen: "/productospcu/minionheadset.png",
          imagenes: ["/productospcu/minionheadset.png"],
          cantidad: 1,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
    {
      id: "p3",
      nombre: "MA-1 Wireless Headphone MARIO",
      sku: "MA1-MARIO",
      precio: 1200,
      descripcion:
        "Audífonos inalámbricos edición especial MARIO, compatibles con varios dispositivos y micrófono incorporado.",
      imagen: "/productospcu/marioheadset.png",
      imagenes: ["/productospcu/marioheadset.png"],
      oferta: false,
      estado: "Nuevo",
      empresa: "Nintendo",
      acerca: [
        "Diseño edición Mario",
        "Inalámbrico y recargable",
        "Compatibles con dispositivos móviles y PC",
        "Micrófono integrado",
      ],
      variantes: [
        {
          imagen: "/productospcu/marioheadset.png",
          imagenes: ["/productospcu/marioheadset.png"],
          cantidad: 1,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
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
      empresa: "Apple",
      descripcion: "Carga rápida para iPhone y iPad.",
      imagen: "/Productos/usb-c.jpg",
      imagenes: ["/Productos/usb-c.jpg"],
      oferta: true,
      estado: "Nuevo",
      acerca: [
        "Compatible con dispositivos Apple",
        "Longitud de 1 metro",
        "Soporta carga rápida",
        "Conectores reforzados",
      ],
      variantes: [
        {
          color: "Blanco",
          imagen: "/Productos/usb-c.jpg",
          imagenes: ["/Productos/usb-c.jpg"],
          cantidad: 10,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
    {
      id: "cb2",
      nombre: "HDMI 4K (2m)",
      precio: 12.99,
      empresa: "Genérica",
      descripcion: "Video y audio en alta definición.",
      imagen: "/Productos/hdmi4k.jpeg",
      imagenes: ["/Productos/hdmi4k.jpeg"],
      oferta: true,
      estado: "Nuevo",
      acerca: [
        "Resolución 4K",
        "Longitud de 2 metros",
        "Compatible con TV, monitores y consolas",
        "Conectores dorados para mejor señal",
      ],
      variantes: [
        {
          color: "Negro",
          imagen: "/Productos/hdmi4k.jpeg",
          imagenes: ["/Productos/hdmi4k.jpeg"],
          cantidad: 7,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
    {
      id: "cb3",
      nombre: "USB 3.0 a Micro USB",
      precio: 9.99,
      empresa: "Genérica",
      descripcion: "Transferencia rápida para móviles.",
      imagen: "/Productos/micro.jpg",
      imagenes: ["/Productos/micro.jpg"],
      oferta: false,
      estado: "Nuevo",
      acerca: [
        "Soporta USB 3.0",
        "Longitud de 1 metro",
        "Ideal para móviles y discos duros externos",
        "Transferencia de datos y carga rápida",
      ],
      variantes: [
        {
          color: "Negro",
          imagen: "/Productos/micro.jpg",
          imagenes: ["/Productos/micro.jpg"],
          cantidad: 8,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
    {
      id: "cb4",
      nombre: "Ethernet Cat6 (1.5m)",
      precio: 19.99,
      empresa: "Genérica",
      descripcion: "Internet sin interferencias.",
      imagen: "/Productos/ethernet.jpeg",
      imagenes: ["/Productos/ethernet.jpg"],
      oferta: true,
      estado: "Nuevo",
      acerca: [
        "Cable de red Cat6",
        "Longitud de 1.5 metros",
        "Alta velocidad y baja interferencia",
        "Ideal para gaming y streaming",
      ],
      variantes: [
        {
          color: "Azul",
          imagen: "/Productos/ethernet.jpeg",
          imagenes: ["/Productos/ethernet.jpg"],
          cantidad: 6,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
    {
      id: "cb5",
      nombre: "DisplayPort 1.4 2m",
      precio: 24.99,
      empresa: "Genérica",
      descripcion: "Soporta hasta 8K a 60Hz.",
      imagen: "/Productos/displayport.jpg",
      imagenes: ["/Productos/displayport.jpg"],
      oferta: true,
      estado: "Nuevo",
      acerca: [
        "Soporta hasta 8K a 60Hz",
        "Longitud de 2 metros",
        "Compatible con monitores y tarjetas gráficas",
        "Conectores de alta calidad",
      ],
      variantes: [
        {
          color: "Negro",
          imagen: "/Productos/displayport.jpg",
          imagenes: ["/Productos/displayport.jpg"],
          cantidad: 4,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
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
      empresa: "Mongoose",
      descripcion: "Mongoose, la clásica MTB para la ciudad y off-road.",
      imagen: "/Productos/mongose.jpg",
      imagenes: ["/Productos/mongose.jpg"],
      oferta: true,
      estado: "Usado",
      acerca: [
        "Cuadro de acero resistente",
        "Llantas de 26 pulgadas",
        "Ideal para ciudad y caminos",
        "Frenos de disco delanteros y traseros",
      ],
      variantes: [
        {
          color: "Negro",
          imagen: "/Productos/mongose.jpg",
          imagenes: ["/Productos/mongose.jpg"],
          cantidad: 1,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
    {
      id: "mic1",
      nombre: "Micrófono de Grabación con Reducción de Ruido",
      precio: 29.99,
      empresa: "Genérica",
      descripcion:
        "Micrófono ideal para grabar voces e instrumentos, con diseño especial para plataformas como YouTube y Twitch.",
      imagen: "/productospcu/microfono.png",
      imagenes: ["/productospcu/microfono.png"],
      oferta: false,
      estado: "Nuevo",
      acerca: [
        "Reducción de ruido integrada",
        "Ideal para grabar voz e instrumentos",
        "Compatible con YouTube, Skype, Twitch y más",
        "Perfecto para Home Studio y Oficina",
        "Plug and Play (no requiere drivers)",
      ],
      variantes: [
        {
          color: "Negro",
          imagen: "/productospcu/microfono.png",
          imagenes: ["/productospcu/microfono.png"],
          cantidad: 4,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
    {
      id: "rv2",
      nombre: "Patineta Eléctrica Plegable",
      precio: 499.99,
      empresa: "Genérica",
      descripcion: "Compacta, ligera, alcance hasta 25km y full power.",
      imagen: "/Productos/patinetaelectrica.jpg",
      imagenes: ["/Productos/patinetaelectrica.jpg"],
      oferta: true,
      estado: "Nuevo",
      acerca: [
        "Motor de 250W",
        "Alcance de hasta 25km",
        "Batería recargable",
        "Plegable y liviana",
      ],
      variantes: [
        {
          color: "Negro",
          imagen: "/Productos/patinetaelectrica.jpg",
          imagenes: ["/Productos/patinetaelectrica.jpg"],
          cantidad: 2,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
    {
      id: "rv3",
      nombre: 'Hoverboard Autoequilibrado 10"',
      precio: 299.99,
      empresa: "Genérica",
      descripcion: "Tecnología smart para moverte con estilo y velocidad.",
      imagen: "/Productos/hoverboard.jpg",
      imagenes: ["/Productos/hoverboard.jpg"],
      oferta: true,
      estado: "Usado",
      acerca: [
        "Ruedas de 10 pulgadas",
        "Sensores de equilibrio inteligente",
        "Luces LED integradas",
        "Batería recargable de larga duración",
      ],
      variantes: [
        {
          color: "Negro",
          imagen: "/Productos/hoverboard.jpg",
          imagenes: ["/Productos/hoverboard.jpg"],
          cantidad: 1,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
    {
      id: "rv4",
      nombre: "Patines en línea 4 ruedas",
      precio: 79.99,
      empresa: "Genérica",
      descripcion: "Estilo y velocidad para deslizarte con flow.",
      imagen: "/Productos/patines4ruedaasenlinea.jpeg",
      imagenes: ["/Productos/patines4ruedaasenlinea.jpeg"],
      oferta: false,
      estado: "Usado",
      acerca: [
        "4 ruedas resistentes",
        "Rodamientos ABEC-7",
        "Ajuste seguro",
        "Freno trasero incluido",
      ],
      variantes: [
        {
          color: "Negro",
          imagen: "/Productos/patines4ruedaasenlinea.jpeg",
          imagenes: ["/Productos/patines4ruedaasenlinea.jpeg"],
          cantidad: 2,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
    {
      id: "rv5",
      nombre: "Patines clásicos 4 ruedas",
      precio: 69.99,
      empresa: "Genérica",
      descripcion: "Roller clásico para pura diversión.",
      imagen: "/Productos/patinesclasicos.webp",
      imagenes: ["/Productos/patinesclasicos.webp"],
      oferta: false,
      estado: "Usado",
      acerca: [
        "Diseño clásico",
        "Ruedas de goma",
        "Ajuste cómodo",
        "Disponible en varias tallas",
      ],
      variantes: [
        {
          color: "Blanco",
          imagen: "/Productos/patinesclasicos.webp",
          imagenes: ["/Productos/patinesclasicos.webp"],
          cantidad: 3,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
    {
      id: "rv6",
      nombre: "Ruedas de repuesto para patineta",
      precio: 24.99,
      empresa: "Genérica",
      descripcion: "Juego de 4 ruedas para tu patineta o longboard.",
      imagen: "/Productos/ruedapatineta.webp",
      imagenes: ["/Productos/ruedapatineta.webp"],
      oferta: true,
      estado: "Usado",
      acerca: [
        "4 ruedas incluidas",
        "Material de poliuretano",
        "Compatibles con skate y longboard",
        "Durabilidad extra",
      ],
      variantes: [
        {
          color: "Transparente",
          imagen: "/Productos/ruedapatineta.webp",
          imagenes: ["/Productos/ruedapatineta.webp"],
          cantidad: 4,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
    {
      id: "rv7",
      nombre: "Casco Protector Urbano",
      precio: 59.99,
      empresa: "Genérica",
      descripcion: "Seguridad y estilo en un solo casco moderno.",
      imagen: "/Productos/casco.jpg",
      imagenes: ["/Productos/casco.jpg"],
      oferta: false,
      estado: "Usado",
      acerca: [
        "Certificado para ciclismo y skate",
        "Ajuste regulable",
        "Acolchado interno extraíble",
        "Ligero y resistente",
      ],
      variantes: [
        {
          color: "Negro",
          imagen: "/Productos/casco.jpg",
          imagenes: ["/Productos/casco.jpg"],
          cantidad: 2,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
    {
      id: "rv8",
      nombre: "Botella Térmica 1L Acero Inoxidable",
      precio: 19.99,
      empresa: "Genérica",
      descripcion: "Mantiene tus bebidas frías o calientes por horas.",
      imagen: "/Productos/botella.jpg",
      imagenes: ["/Productos/botella.jpg"],
      oferta: false,
      estado: "Nuevo",
      acerca: [
        "Capacidad de 1 litro",
        "Acero inoxidable",
        "Tapa a prueba de fugas",
        "Mantiene la temperatura por 12h",
      ],
      variantes: [
        {
          color: "Plateado",
          imagen: "/Productos/botella.jpg",
          imagenes: ["/Productos/botella.jpg"],
          cantidad: 5,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
    {
      id: "rv9",
      nombre: "Luz LED Recargable para Bicicleta",
      precio: 24.99,
      empresa: "Genérica",
      descripcion: "Visibilidad garantizada en la noche, USB recargable.",
      imagen: "/Productos/lucesbici.webp",
      imagenes: ["/Productos/lucesbici.webp"],
      oferta: true,
      estado: "Nuevo",
      acerca: [
        "Luz blanca frontal LED",
        "Recargable por USB",
        "Incluye soporte para manubrio",
        "3 modos de intensidad",
      ],
      variantes: [
        {
          color: "Negro",
          imagen: "/Productos/lucesbici.webp",
          imagenes: ["/Productos/lucesbici.webp"],
          cantidad: 6,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
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
      empresa: "Hikvision",
      descripcion:
        "Cámara de seguridad tipo Dome con resolución 4MP, visión nocturna y carcasa resistente.",
      imagen: "/Productos/hikvision.png",
      imagenes: ["/Productos/hikvision.png"],
      oferta: false,
      estado: "Nuevo",
      acerca: [
        "Resolución 4MP",
        "Visión nocturna infrarroja",
        "Carcasa resistente a la intemperie",
        "Fácil instalación",
      ],
      variantes: [
        {
          color: "Blanco",
          imagen: "/Productos/hikvision.png",
          imagenes: ["/Productos/hikvision.png"],
          cantidad: 4,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
    {
      id: "cam2",
      nombre: "Cámara Dahua Bullet Full HD",
      precio: 95,
      empresa: "Dahua",
      descripcion:
        "Cámara Bullet Full HD con lente gran angular, ideal para exteriores.",
      imagen: "/Productos/dahua.webp",
      imagenes: ["/Productos/dahua.webp"],
      oferta: false,
      estado: "Nuevo",
      acerca: [
        "Full HD 1080p",
        "Lente gran angular",
        "Resistente a la lluvia",
        "Visión nocturna",
      ],
      variantes: [
        {
          color: "Blanco",
          imagen: "/Productos/dahua.webp",
          imagenes: ["/Productos/dahua.webp"],
          cantidad: 5,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
    {
      id: "cam3",
      nombre: "Cámara EZVIZ WiFi 1080p",
      precio: 75,
      empresa: "EZVIZ",
      descripcion:
        "Cámara WiFi con grabación en la nube, visión nocturna y audio bidireccional.",
      imagen: "/Productos/ezviz.png",
      imagenes: ["/Productos/ezviz.png"],
      oferta: false,
      estado: "Nuevo",
      acerca: [
        "Conexión WiFi",
        "Grabación en la nube",
        "Audio bidireccional",
        "Visión nocturna",
      ],
      variantes: [
        {
          color: "Blanco",
          imagen: "/Productos/ezviz.png",
          imagenes: ["/Productos/ezviz.png"],
          cantidad: 6,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
    {
      id: "cam4",
      nombre: "Cámara TP-Link Tapo C200",
      precio: 60,
      empresa: "TP-Link",
      descripcion:
        "Cámara PTZ con movimiento horizontal y vertical, notificaciones instantáneas y almacenamiento local.",
      imagen: "/Productos/tapo.webp",
      imagenes: ["/Productos/tapo.webp"],
      oferta: false,
      estado: "Nuevo",
      acerca: [
        "Control de movimiento PTZ",
        "Notificaciones instantáneas",
        "Almacenamiento local SD",
        "Compatible con app móvil",
      ],
      variantes: [
        {
          color: "Blanco",
          imagen: "/Productos/tapo.webp",
          imagenes: ["/Productos/tapo.webp"],
          cantidad: 4,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
  ],
},



{
  categoria: "Cargadores",
  productos: [
    {
      id: "cg1",
      nombre: "Cargador rápido USB-C 20W",
      empresa: "Genérica",
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
        "Diseño compacto",
      ],
      variantes: [
        {
          color: "Blanco",
          imagen: "/Productos/cargador-rapido.jpg",
          imagenes: ["/Productos/cargador-rapido.jpg"],
          cantidad: 8,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
    {
      id: "cg2",
      nombre: "Cargador inalámbrico universal",
      empresa: "Genérica",
      precio: 599,
      descripcion:
        "Compatible con smartphones que permiten carga por inducción.",
      imagen: "/Productos/cargador-inalambrico.jpg",
      imagenes: ["/Productos/cargador-inalambrico.jpg"],
      oferta: true,
      estado: "Nuevo",
      acerca: [
        "Carga inalámbrica Qi",
        "Funciona con la mayoría de smartphones",
        "Diseño antideslizante",
        "Indicador LED de carga",
      ],
      variantes: [
        {
          color: "Negro",
          imagen: "/Productos/cargador-inalambrico.jpg",
          imagenes: ["/Productos/cargador-inalambrico.jpg"],
          cantidad: 5,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
    {
      id: "cg3",
      nombre: "Power Bank 20,000 mAh",
      empresa: "Genérica",
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
        "Pantalla LED de batería",
      ],
      variantes: [
        {
          color: "Negro",
          imagen: "/Productos/powerbank.jpg",
          imagenes: ["/Productos/powerbank.jpg"],
          cantidad: 4,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
    {
      id: "cg4",
      nombre: "Cargador doble USB 30W",
      empresa: "Genérica",
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
        "Compatible con múltiples dispositivos",
      ],
      variantes: [
        {
          color: "Blanco",
          imagen: "/Productos/cargador-doble.jpg",
          imagenes: ["/Productos/cargador-doble.jpg"],
          cantidad: 9,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
  ],
},




{
  categoria: "Celulares",
  productos: [
    {
      id: "cl1",
      nombre: "iPhone 14 Pro",
      empresa: "Apple",
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
        "Face ID y MagSafe",
      ],
      variantes: [
        {
          color: "Negro",
          imagen: "/Productos/iphone14pro.jpg",
          imagenes: ["/Productos/iphone14pro.jpg"],
          cantidad: 3,
        },
        {
          color: "Morado",
          imagen: "/Productos/iphone14pro.jpg",
          imagenes: ["/Productos/iphone14pro.jpg"],
          cantidad: 2,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
  ],
},


{
  categoria: "Consolas",
  productos: [
    {
      id: "cs1",
      nombre: "PlayStation 5",
      empresa: "PlayStation",
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
        "Incluye control DualSense",
      ],
      variantes: [
        {
          color: "Blanco",
          imagen: "/Productos/ps5.webp",
          imagenes: ["/Productos/ps5.webp"],
          cantidad: 5,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
    {
      id: "cs2",
      nombre: "Xbox Series X",
      empresa: "Xbox",
      precio: 499.99,
      descripcion: "La consola más potente de Xbox.",
      imagen: "/Productos/xboxseriesx.webp",
      imagenes: ["/Productos/xboxseriesx.webp"],
      oferta: true,
      estado: "Nuevo",
      acerca: [
        "8K HDR Gaming",
        "Almacenamiento SSD 1TB",
        "Compatible con generaciones anteriores",
        "Incluye control inalámbrico",
      ],
      variantes: [
        {
          color: "Negro",
          imagen: "/Productos/xboxseriesx.webp",
          imagenes: ["/Productos/xboxseriesx.webp"],
          cantidad: 4,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
    {
      id: "cs3",
      nombre: "Nintendo Switch OLED",
      empresa: "Nintendo",
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
        "Almacenamiento ampliable",
      ],
      variantes: [
        {
          color: "Blanco",
          imagen: "/Productos/nintendoswitch.jpg",
          imagenes: ["/Productos/nintendoswitch.jpg"],
          cantidad: 3,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
    {
      id: "cs4",
      nombre: "Nintendo Switch™ with Neon Blue and Neon Red Joy‑Con™",
      empresa: "Nintendo",
      precio: 17000,
      descripcion: "Consola híbrida para jugar en casa o donde quieras.",
      imagen: "/Productos/NS.jpg",
      imagenes: ["/Productos/NS.jpg"],
      oferta: false,
      estado: "Usado",
      acerca: [
        'Pantalla de 6.2"',
        "Incluye dos Joy-Con™ (uno azul neón y uno rojo neón)",
        "Modo TV, sobremesa y portátil",
        "Compatible con todos los juegos de Nintendo Switch",
      ],
      variantes: [
        {
          color: "Neón Azul/Rojo",
          imagen: "/Productos/NS.jpg",
          imagenes: [
            "/Productos/NS.jpg",
            "/Productos/NSSS.jpg",
            "/Productos/NSS.jpg",
            "/Productos/NSSSS.jpg",
            "/Productos/N.jpg",
          ],
          cantidad: 1,
        },
      ],
      videoUrl: "",
      imagenesExtra: [
        "/Productos/NSS.jpg",
        "/Productos/NSSSS.jpg",
        "/Productos/N.jpg",
      ],
    },
    {
      id: "cs5",
      nombre: "PlayStation 4",
      empresa: "PlayStation",
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
        "Incluye control DualShock 4",
      ],
      variantes: [
        {
          color: "Negro",
          imagen: "/Productos/ps4.jpg",
          imagenes: ["/Productos/ps4.jpg"],
          cantidad: 2,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
    {
      id: "cs6",
      nombre: "Xbox One",
      empresa: "Xbox",
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
        "Soporte para apps de streaming",
      ],
      variantes: [
        {
          color: "Negro",
          imagen: "/Productos/xboxone.webp",
          imagenes: ["/Productos/xboxone.webp"],
          cantidad: 1,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
    {
  id: "cs7",
  nombre: "Nintendo Wii U Edición Mario Kart 8 + Nintendo Land",
  empresa: "Nintendo",
  precio: 8499,
  descripcion: "Consola Wii U de 32GB edición especial que incluye Mario Kart 8 y Nintendo Land.",
  imagen: "/productospcu/mariokart-wiiu.webp",
  imagenes: ["/productospcu/mariokart-wiiu.webp"],
  oferta: true,
  estado: "Usado",
  acerca: [
    "Incluye Mario Kart 8",
    "Incluye Nintendo Land",
    "Almacenamiento interno de 32GB",
    "Compatible con controles Wii y Wii U Pro",
    "Compatible con juegos de Wii",
  ],
  variantes: [
    {
      color: "Negro",
      imagen: "/productospcu/mariokart-wiiu.webp",
      imagenes: [
        "/productospcu/mariokart-wiiu.webp",
        "/productospcu/mariokart-consola-wiiu.webp",
        "/productospcu/consolawiiu.webp",
        "/productospcu/consola-wiiu.webp",
        "/productospcu/juegomariokart.webp",
        "/productospcu/cables-wiiu.webp",

      ],
      cantidad: 1,
    },
  ],
  videoUrl: "/videos/",
  imagenesExtra: [
    "/productospcu/mariokart-consola-wiiu.webp",
    "/productospcu/consola-wiiu.webp",
    "/productospcu/juegomariokart.webp",
  ],
},
{
  id: "cs8",
  nombre: "Nintendo Wii + Wii Sports + Wii Sports Resort",
  empresa: "Nintendo",
  precio: 5999,
  descripcion: "Consola Wii clásica con juegos Wii Sports, Wii Sports Resort y accesorio Motion Plus.",
  imagen: "/productospcu/wii-black.webp",
  imagenes: ["/productospcu/wii-black.webp"],
  oferta: true,
  estado: "Usado",
  acerca: [
    "Incluye Wii Motion Plus",
    "Compatible con juegos y accesorios clásicos de Wii",
    "Ideal para juegos familiares y de movimiento",
  ],
  variantes: [
    {
      color: "Blanco",
      imagen: "/productospcu/wii-black.webp",
      imagenes: [
        "/productospcu/wii-black.webp",
        "/productospcu/wii-console.jpg",
        "/productospcu/wiii-pack.png",
        
      ],
      cantidad: 1,
    },
  ],
  videoUrl: "/videos/",
  imagenesExtra: [
        "/productospcu/wii-black.webp",
        "/productospcu/wii-console.jpg",
        "/productospcu/wiii-pack.png",
  ],
},
  ],
},


{
  categoria: "Discos Duros",
  productos: [
    {
      id: "dd1",
      nombre: "Seagate 1TB Externo",
      empresa: "Seagate",
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
        "Diseño portátil y resistente",
      ],
      variantes: [
        {
          color: "Negro",
          imagen: "/Productos/seagate.png",
          imagenes: ["/Productos/seagate.png"],
          cantidad: 4,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
    {
      id: "dd2",
      nombre: "SSD Samsung 500GB",
      empresa: "Samsung",
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
        "Ideal para laptops y PC",
      ],
      variantes: [
        {
          color: "Negro",
          imagen: "/Productos/samsung.webp",
          imagenes: ["/Productos/samsung.webp"],
          cantidad: 5,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
    {
      id: "dd3",
      nombre: "WD 2TB Externo",
      empresa: "Western Digital",
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
        "Diseño resistente",
      ],
      variantes: [
        {
          color: "Negro",
          imagen: "/Productos/wd2tb.jpg",
          imagenes: ["/Productos/wd2tb.jpg"],
          cantidad: 3,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
    {
      id: "dd4",
      nombre: "Crucial X6 SSD 1TB",
      empresa: "Crucial",
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
        "Ultracompacto",
      ],
      variantes: [
        {
          color: "Negro",
          imagen: "/Productos/crucial.jpg",
          imagenes: ["/Productos/crucial.jpg"],
          cantidad: 2,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
    {
      id: "dd5",
      nombre: "LaCie Rugged 4TB",
      empresa: "LaCie",
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
        "Diseño resistente a polvo y agua",
      ],
      variantes: [
        {
          color: "Naranja",
          imagen: "/Productos/lacie-rugged.jpg",
          imagenes: ["/Productos/lacie-rugged.jpg"],
          cantidad: 1,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
  ],
},



{
  categoria: "Electrodomésticos",
  productos: [
    {
      id: "ed1",
      nombre: "Licuadora Oster clásica",
      empresa: "Oster",
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
        "Fácil de limpiar",
      ],
      variantes: [
        {
          color: "Negro",
          imagen: "/Productos/licuadora-oster.jpg",
          imagenes: ["/Productos/licuadora-oster.jpg"],
          cantidad: 3,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
  ],
},



{
  categoria: "Gaming Chairs",
  productos: [
    {
      id: "gc1",
      nombre: "Silla Gamer Reclinable RGB",
      empresa: "Generica",
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
        "Reclinable hasta 180°",
      ],
      variantes: [
        {
          color: "Negro",
          imagen: "/Productos/silla-gamer-rgb.jpg",
          imagenes: ["/Productos/silla-gamer-rgb.jpg"],
          cantidad: 2,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
  ],
},

{
  categoria: "Laptops",
  productos: [
    {
      id: "lp1",
      nombre: "Laptop Dell Inspiron 15",
      empresa: "Dell",
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
        "Windows 11 preinstalado",
      ],
      variantes: [
        {
          color: "Gris",
          imagen: "/Productos/dell-inspiron15.jpg",
          imagenes: ["/Productos/dell-inspiron15.jpg"],
          cantidad: 3,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
  ],
},


{
  categoria: "Monitores",
  productos: [
    {
      id: "mn1",
      nombre: "LG 27 pulgadas 4K",
      empresa: "LG",
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
        "Compatible con HDMI y DisplayPort",
      ],
      variantes: [
        {
          color: "Negro",
          imagen: "/Productos/monitor-lg-4k.jpg",
          imagenes: ["/Productos/monitor-lg-4k.jpg"],
          cantidad: 2,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
  ],
},

{
  categoria: "Tablets",
  productos: [
    {
      id: "tb1",
      nombre: "iPad Pro 12.9",
      empresa: "Apple",
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
        "Face ID y USB-C",
      ],
      variantes: [
        {
          color: "Gris espacial",
          imagen: "/Productos/ipad-pro.jpg",
          imagenes: ["/Productos/ipad-pro.jpg"],
          cantidad: 2,
        },
      ],

      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg"
      ]
    },
  ],
},

{
  categoria: "Teclados",
  productos: [
    {
      id: "acc1",
      nombre: "Mini Teclado Inalámbrico con Touchpad",
      empresa: "Genérico",
      precio: 24.99,
      descripcion:
        "Mini teclado inalámbrico con touchpad integrado, ideal para controlar tu PC, Smart TV o consola desde el sofá.",
      imagen: "/productospcu/miniteclado.png",
      imagenes: ["/productospcu/miniteclado.png"],
      oferta: false,
      estado: "Nuevo",
      acerca: [
        "Touchpad con función DPI ajustable",
        "Compatible con PC, Smart TV, Android TV Box, consolas y más",
        "Portátil, elegante y fácil de usar",
        "Rueda de mouse integrada para navegación fluida",
        "Control multimedia remoto específico",
        "Diseño compacto y recargable",
      ],
      variantes: [
        {
          color: "Negro",
          imagen: "/productospcu/miniteclado.png",
          imagenes: [
            "/productospcu/miniteclado.png",
            "/productospcu/tminieclado-back.png",
          ],
          cantidad: 3,
        },
      ],

      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg"
      ]
    },
  ],
},

{
  categoria: "Videojuegos",
  productos: [
    {
      id: "vj3",
      nombre: "The Legend of Zelda: Breath of the Wild",
      empresa: "Nintendo",
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
        "Gráficos impresionantes",
      ],
      variantes: [
        {
          color: "Verde",
          imagen: "/Productos/zelda.webp",
          imagenes: ["/Productos/zelda.webp"],
          cantidad: 3,
        },
      ],

      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },

    {
      id: "vj5",
      nombre: "Marvel's Spider-Man: Miles Morales (PS5)",
      empresa: "PlayStation",
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
        "Acción en mundo abierto",
      ],
      variantes: [
        {
          color: "Negro",
          imagen: "/Productos/spider-manps5.jpeg",
          imagenes: ["/Productos/spider-manps5.jpeg"],
          cantidad: 3,
        },
      ],

      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },

    {
      id: "vj6",
      nombre: "Mario Kart 8 Deluxe (Switch)",
      empresa: "Nintendo",
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
        "Frenesí de carreras",
      ],
      variantes: [
        {
          color: "Rojo",
          imagen: "/Productos/Mario-Kart-8.jpeg",
          imagenes: ["/Productos/Mario-Kart-8.jpeg"],
          cantidad: 4,
        },
      ],

      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },

    {
      id: "vj7",
      nombre: "Super Smash Bros. Ultimate (Switch)",
      empresa: "Nintendo",
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
        "Todos los universos de Nintendo",
      ],
      variantes: [
        {
          color: "Azul",
          imagen: "/Productos/super-smash-bros.jpg",
          imagenes: ["/Productos/super-smash-bros.jpg"],
          cantidad: 6,
        },
      ],

      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
  ],
},


{
  categoria: "Smart TV",
  productos: [
    {
      id: "tv1",
      nombre: 'Samsung Smart TV 55" UHD',
      empresa: "Samsung",
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
        "HDR10+ y WiFi",
      ],
      variantes: [
        {
          color: "Negro",
          imagen: "/Productos/samsung-smarttv.jpg",
          imagenes: ["/Productos/samsung-smarttv.jpg"],
          cantidad: 3,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
  ],
},
{
  categoria: "Memorias USB",
  productos: [
    {
      id: "usb1",
      nombre: "USB SanDisk 64GB",
      empresa: "SanDisk",
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
        "Compatible con Windows, Mac y Linux",
      ],
      variantes: [
        {
          color: "Negro",
          imagen: "/Productos/sandisk.jpeg",
          imagenes: ["/Productos/sandisk.jpeg"],
          cantidad: 10,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
    {
      id: "usb2",
      nombre: "Kingston 128GB USB 3.1",
      empresa: "Kingston",
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
        "Diseño compacto",
      ],
      variantes: [
        {
          color: "Negro",
          imagen: "/Productos/kingston.webp",
          imagenes: ["/Productos/kingston.webp"],
          cantidad: 8,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
    {
      id: "usb3",
      nombre: "HP v150w 32GB",
      empresa: "HP",
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
        "Ideal para portabilidad",
      ],
      variantes: [
        {
          color: "Azul",
          imagen: "/Productos/hp.jpeg",
          imagenes: ["/Productos/hp.jpeg"],
          cantidad: 12,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
    {
      id: "usb4",
      nombre: "Corsair Flash Voyager 256GB",
      empresa: "Corsair",
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
        "Compatible con todos los sistemas operativos",
      ],
      variantes: [
        {
          color: "Negro",
          imagen: "/Productos/corsair.avif",
          imagenes: ["/Productos/corsair.avif"],
          cantidad: 3,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
  ],
},
{
  categoria: "Hogar Inteligente",
  productos: [
    {
      id: "hi1",
      nombre: "Foco inteligente Wi-Fi RGB",
      empresa: "Philips",
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
        "Ahorro energético",
      ],
      variantes: [
        {
          color: "Blanco",
          imagen: "/Productos/foco-inteligente.jpg",
          imagenes: ["/Productos/foco-inteligente.jpg"],
          cantidad: 8,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
    {
      id: "hi2",
      nombre: "Enchufe inteligente TP-Link",
      empresa: "TP-Link",
      precio: 19.99,
      descripcion: "Controla cualquier dispositivo desde tu celular.",
      imagen: "/Productos/enchufeinteligentewifi.jpg",
      imagenes: ["/Productos/enchufeinteligentewifi.jpg"],
      oferta: false,
      estado: "Nuevo",
      acerca: [
        "Compatible con Alexa y Google",
        "Programación de horarios",
        "Fácil instalación",
        "Control remoto vía app",
      ],
      variantes: [
        {
          color: "Blanco",
          imagen: "/Productos/enchufeinteligentewifi.jpg",
          imagenes: ["/Productos/enchufeinteligentewifi.jpg"],
          cantidad: 12,
        },
      ],
      videoUrl: "https://tulinkalvideo2.mp4",
      imagenesExtra: [
        "/Productos/enchufe-extra1.jpg",
        "/Productos/enchufe-extra2.jpg",
        "/Productos/enchufe-extra3.jpg",
      ],
    },
    {
      id: "hi4",
      nombre: "Sensor de movimiento Wi-Fi",
      empresa: "Sonoff",
      precio: 15.5,
      descripcion: "Detecta movimientos y envía alertas instantáneas.",
      imagen: "/Productos/sensormovimientowifi.jpg",
      imagenes: ["/Productos/sensormovimientowifi.jpg"],
      oferta: true,
      estado: "Nuevo",
      acerca: [
        "Notificaciones en tiempo real",
        "Conexión Wi-Fi",
        "Bajo consumo",
        "Fácil integración con otros dispositivos",
      ],
      variantes: [
        {
          color: "Blanco",
          imagen: "/Productos/sensormovimientowifi.jpg",
          imagenes: ["/Productos/sensormovimientowifi.jpg"],
          cantidad: 6,
        },
      ],
      videoUrl: "https://tulinkalvideo3.mp4",
      imagenesExtra: [
        "/Productos/sensor-extra1.jpg",
        "/Productos/sensor-extra2.jpg",
        "/Productos/sensor-extra3.jpg",
      ],
    },
    {
      id: "hi8",
      nombre: "Amazon Echo Dot",
      empresa: "Amazon",
      precio: 39.99,
      descripcion: "Asistente de voz Alexa en diseño compacto.",
      imagen: "/Productos/echodot.png",
      imagenes: ["/Productos/echodot.png"],
      oferta: false,
      estado: "Usado",
      acerca: [
        "Control por voz",
        "Sonido mejorado",
        "Compatible con dispositivos inteligentes",
        "Diseño moderno",
      ],
      variantes: [
        {
          color: "Negro",
          imagen: "/Productos/echodot.png",
          imagenes: ["/Productos/echodot.png"],
          cantidad: 5,
        },
      ],
      videoUrl: "https://tulinkalvideo4.mp4",
      imagenesExtra: [
        "/Productos/echodot-extra1.jpg",
        "/Productos/echodot-extra2.jpg",
        "/Productos/echodot-extra3.jpg",
      ],
    },
    {
      id: "hi9",
      nombre: "Amazon Echo Show 8",
      empresa: "Amazon",
      precio: 89.99,
      descripcion: "Pantalla inteligente con Alexa integrada.",
      imagen: "/Productos/alexaecho.webp",
      imagenes: ["/Productos/alexaecho.webp"],
      oferta: true,
      estado: "Nuevo",
      acerca: [
        "Pantalla táctil HD",
        "Llamadas y videollamadas",
        "Cámara integrada",
        "Control por voz",
      ],
      variantes: [
        {
          color: "Negro",
          imagen: "/Productos/alexaecho.webp",
          imagenes: ["/Productos/alexaecho.webp"],
          cantidad: 4,
        },
      ],
      videoUrl: "https://tulinkalvideo5.mp4",
      imagenesExtra: [
        "/Productos/echoshow-extra1.jpg",
        "/Productos/echoshow-extra2.jpg",
        "/Productos/echoshow-extra3.jpg",
      ],
    },
    {
      id: "hi11",
      nombre: "Smart Plug compatible con Alexa",
      empresa: "Gosund",
      precio: 14.99,
      descripcion: "Control remoto de dispositivos con la voz.",
      imagen: "/Productos/smartplug.jpg",
      imagenes: ["/Productos/smartplug.jpg"],
      oferta: false,
      estado: "Nuevo",
      acerca: [
        "Funciona con Alexa y Google",
        "Fácil instalación",
        "Ahorro de energía",
        "App intuitiva",
      ],
      variantes: [
        {
          color: "Blanco",
          imagen: "/Productos/smartplug.jpg",
          imagenes: ["/Productos/smartplug.jpg"],
          cantidad: 10,
        },
      ],
      videoUrl: "https://tulinkalvideo6.mp4",
      imagenesExtra: [
        "/Productos/smartplug-extra1.jpg",
        "/Productos/smartplug-extra2.jpg",
        "/Productos/smartplug-extra3.jpg",
      ],
    },
  ],
},



{
  categoria: "Impresoras",
  productos: [
    {
      id: "imp001",
      nombre: "Impresora Epson EcoTank L3250",
      empresa: "Epson",
      precio: 229.99,
      descripcion:
        "Impresora multifuncional con sistema de tinta continua, ideal para hogar y oficina.",
      imagen: "/Productos/epson-l3250.jpg",
      imagenes: ["/Productos/epson-l3250.jpg"],
      oferta: true,
      estado: "Usado",
      acerca: [
        "Sistema de tinta continua EcoTank",
        "Impresión, escaneo y copiado",
        "WiFi y USB",
        "Ahorro en costos de impresión",
      ],
      variantes: [
        {
          color: "Negro",
          imagen: "/Productos/epson-l3250.jpg",
          imagenes: ["/Productos/epson-l3250.jpg"],
          cantidad: 2,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
  ],
},
{
  categoria: "Nuevos Lanzamientos",
  productos: [
    {
      id: "nl3",
      nombre: "Nintendo Switch 2",
      empresa: "Nintendo",
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
        "Mayor duración de batería",
      ],
      variantes: [
        {
          color: "Negro",
          imagen: "/Productos/switch2.jpg",
          imagenes: ["/Productos/switch2.jpg"],
          cantidad: 2,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
  ],
},
{
  categoria: "Ofertas Especiales",
  productos: [
    {
      id: "of3",
      nombre: "Oferta Smart TV + Soporte",
      empresa: "Samsung",
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
        "Conectividad HDMI y USB",
      ],
      variantes: [
        {
          color: "Negro",
          imagen: "/Productos/combo-tv.jpg",
          imagenes: ["/Productos/combo-tv.jpg"],
          cantidad: 2,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
  ],
},
{
  categoria: "Relojes Inteligentes",
  productos: [
    {
      id: "rl1",
      nombre: "Apple Watch Series 9",
      empresa: "Apple",
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
        "Hasta 18h de batería",
      ],
      variantes: [
        {
          color: "Gris",
          imagen: "/Productos/apple-watch9.jpg",
          imagenes: ["/Productos/apple-watch9.jpg"],
          cantidad: 3,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
  ],
},

{
  categoria: "AccesoriosVideojuegos",
  productos: [
    {
      id: "sw2",
      nombre: "Crystal Protector para Nintendo Switch (PCS-2545)",
      empresa: "Nintendo",
      precio: 14.99,
      descripcion:
        "Protector rígido y transparente para proteger tu consola Nintendo Switch de golpes y rayaduras.",
      imagen: "/productospcu/cristal-protector.png",
      imagenes: ["/productospcu/cristal-protector.png"],
      oferta: false,
      estado: "Nuevo",
      acerca: [
        "Diseñado específicamente para Nintendo Switch",
        "Material acrílico transparente resistente a impactos",
        "Permite acceso a todos los botones y puertos",
        "Fácil de instalar y remover",
        "Protección total sin perder visibilidad del diseño original",
      ],
      variantes: [
        {
          imagen: "/productospcu/cristal-protector.png",
          imagenes: [
            "/productospcu/cristal-protector.png",
            "/productospcu/cristal-protector-back.png",
          ],
          cantidad: 4,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
    {
      id: "sw4",
      nombre: "Cargador Doble para Switch Joy-Con & Pro Controller",
      empresa: "Nintendo",
      precio: 24.99,
      descripcion:
        "Base de carga para 2 Joy-Con y un Pro Controller al mismo tiempo.",
      imagen: "/productospcu/cargador-controles.png",
      imagenes: ["/productospcu/cargador-controles.png"],
      oferta: false,
      estado: "Nuevo",
      acerca: [
        "Carga simultáneamente 2 Joy-Con y 1 Pro Controller",
        "Diseño compacto y resistente",
        "Luz LED de estado de carga",
        "Compatible con Nintendo Switch",
        "Fabricado por DOBE / FOMIS Electronics",
      ],
      variantes: [
        {
          color: "Negro",
          imagen: "/productospcu/cargador-controles.png",
          imagenes: ["/productospcu/cargador-controles.png"],
          cantidad: 5,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
    {
      id: "sw3",
      nombre: "Base Soporte Handgrip para Joy-Con",
      empresa: "Nintendo",
      precio: 9.99,
      descripcion:
        "Base para convertir tus Joy-Con en un solo control estilo tradicional.",
      imagen: "/productospcu/n-switch.png",
      imagenes: ["/productospcu/n-switch.png"],
      oferta: false,
      estado: "Nuevo",
      acerca: [
        "Diseñado para Nintendo Switch Joy-Con",
        "NS Joy-Con no incluidos",
        "Convierte los Joy-Con en un control único",
        "Diseño cómodo para largas sesiones",
        "Fabricado en plástico resistente",
      ],
      variantes: [
        {
          color: "Negro",
          imagen: "/productospcu/n-switcg.png",
          imagenes: [
            "/productospcu/n-switch.png",
            "/productospcu/n-switch-back.png",
          ],
          cantidad: 6,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
  ],
},
{
  categoria: "Mouses",
  productos: [
    {
      id: "p4",
      nombre: "Mouse Gamer MEE TION M371",
      empresa: "MEE TION",
      sku: "M371-GAMING",
      precio: 700,
      descripcion:
        "Mouse con iluminación LED, 3 niveles de DPI (800/1200/1600), botones de navegación y diseño ergonómico.",
      imagen: "/Productospcu/meetionmouse.png",
      imagenes: ["/Productospcu/meetionmouse.png"],
      oferta: false,
      estado: "Nuevo",
      acerca: [
        "Iluminación LED breathing",
        "3 niveles de DPI: 800/1200/1600",
        "Botones adicionales para navegación",
        "Sensor óptico preciso",
      ],
      variantes: [
        {
          imagen: "/Productospcu/meetionmouse.png",
          imagenes: ["/Productospcu/meetionmouse.png"],
          cantidad: 4,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
  ],
},

{
  categoria: "Controles",
  productos: [
    {
      id: "p5",
      nombre: "Controlador Inalámbrico para Nintendo Switch",
      sku: "NS-WIRELESS",
      empresa: "Nintendo",
      precio: 1450,
      descripcion:
        "Control inalámbrico con sensores de movimiento, vibración doble y conexión USB Tipo-C. Compatible con Nintendo Switch.",
      imagen: "/productospcu/controlN-S.png",
      imagenes: ["/productospcu/controlN-S.png"],
      oferta: false,
      estado: "Nuevo",
      acerca: [
        "Compatible con Nintendo Switch",
        "Sensores de movimiento",
        "Vibración doble",
        "Recargable por USB Tipo-C",
        "Conexión Bluetooth",
      ],
      variantes: [
        {
          imagen: "/productospcu/controlN-S.png",
          imagenes: ["/productospcu/controlN-S.png"],
          cantidad: 3,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },

    {
      id: "sw1",
      nombre: "Nintendo Switch Pro Controller",
      empresa: "Nintendo",
      precio: 69.99,
      descripcion:
        "Control inalámbrico original para Nintendo Switch con excelente ergonomía y respuesta precisa.",
      imagen: "/productospcu/control-pro.png",
      imagenes: ["/productospcu/control-pro.png"],
      oferta: false,
      estado: "Nuevo",
      acerca: [
        "Diseñado para Nintendo Switch",
        "Conexión inalámbrica estable vía Bluetooth",
        "Compatible con vibración HD y sensores de movimiento",
        "Batería recargable de larga duración",
        "Diseño ergonómico para mayor comodidad",
      ],
      variantes: [
        {
          imagen: "/productospcu/control-pro.png",
          imagenes: [
            "/productospcu/control-pro.png",
            "/productospcu/control-pro-back.png",
          ],
          cantidad: 1,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },

    {
      id: "xone1",
      nombre: "Control Inalámbrico para Xbox One",
      empresa: "Xbox",
      precio: 64.99,
      descripcion:
        "Control inalámbrico original para Xbox One con vibración precisa y agarre texturizado.",
      imagen: "/productospcu/control-one.png",
      imagenes: ["/productospcu/control-one.png"],
      oferta: false,
      estado: "Nuevo",
      acerca: [
        "Compatibilidad con Xbox One y PC",
        "Conexión inalámbrica estable",
        "Vibración precisa y sensibilidad mejorada",
        "Diseño ergonómico con agarre texturizado",
        "Soporta conexión vía Bluetooth o cable USB",
      ],
      variantes: [
        {
          imagen: "/productospcu/control-one.png",
          imagenes: ["/productospcu/control-one.png"],
          cantidad: 3,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },

    {
      id: "wii1",
      nombre: "Control Remoto + Nunchuk para Wii (Motion Plus)",
      empresa: "Nintendo",
      precio: 39.99,
      descripcion:
        "Combo de control remoto y nunchuk cableado compatible con Motion Plus.",
      imagen: "/productospcu/control-wii.png",
      imagenes: ["/productospcu/control-wii.png"],
      oferta: false,
      estado: "Nuevo",
      acerca: [
        "Compatible con Wii y Wii U",
        "Incluye control remoto inalámbrico y nunchuk con cable",
        "Soporte para Motion Plus integrado",
        "Funciona con todos los juegos compatibles",
        "Diseño liviano y ergonómico",
      ],
      variantes: [
        {
          imagen: "/productospcu/control-wii.png",
          imagenes: ["/productospcu/control-wii.png"],
          cantidad: 5,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },

    {
      id: "c5",
      nombre:
        "Sony DualShock 4 Wireless Controller para PS4 / PS TV / PS Now",
      empresa: "PlayStation",
      precio: 54.99,
      descripcion:
        "Control original con conexión inalámbrica y vibración dual compatible con múltiples plataformas.",
      imagen: "/productospcu/dualshock4-negro.png",
      imagenes: [
        "/productospcu/dualshock4-negro.png",
        "/productospcu/Adualshock4-rojo.png",
        "/productospcu/dualshock4-azul.png",
        "/productospcu/dualshock4-back.png",
      ],
      acerca: [
        "Conexión inalámbrica Bluetooth para mayor libertad de juego",
        "Panel táctil multitáctil en la parte frontal",
        "Barra de luz integrada para seguimiento y personalización",
        "Jack de audio de 3.5 mm para auriculares",
        "Compatible con PS4, PS TV, PS Now y PC vía Bluetooth o cable USB",
        "Batería recargable con hasta 8 horas de duración",
      ],
      variantes: [
        {
          color: "Negro",
          imagen: "/productospcu/dualshock4-negro.png",
          imagenes: [
            "/productospcu/dualshock4-negro.png",
            "/productospcu/dualshock4-back.png",
          ],
          cantidad: 1,
        },
        {
          color: "Rojo",
          imagen: "/productospcu/Adualshock4-rojo.png",
          imagenes: [
            "/productospcu/Adualshock4-rojo.png",
            "/productospcu/dualshock4-back.png",
          ],
          cantidad: 1,
        },
        {
          color: "Azul",
          imagen: "/productospcu/dualshock4-azul.png",
          imagenes: [
            "/productospcu/dualshock4-azul.png",
            "/productospcu/dualshock4-back.png",
          ],
          cantidad: 1,
        },
      ],
      videoUrl:"",
      imagenesExtra: [
        "/Productos/",
        "/Productos/",
        "/Productos/",
      ],
      oferta: true,
      estado: "Nuevo",
    },

    {
      id: "ps2ctrl1",
      nombre: "Control Sony DualShock 2 para PS2",
      empresa: "PlayStation",
      precio: 29.99,
      descripcion:
        "Control original con vibración dual y sticks analógicos, compatible con todas las consolas PlayStation 2.",
      imagen: "/productospcu/dualshock2.png",
      imagenes: ["/productospcu/dualshock2.png"],
      oferta: false,
      estado: "Nuevo",
      acerca: [
        "Fabricado por Sony para PlayStation 2",
        "Vibración dual para una experiencia inmersiva",
        "Dos sticks analógicos con alta precisión",
        "Diseño ergonómico clásico",
        "Compatible con todos los modelos de PS2",
        "Cable de conexión robusto",
      ],
      variantes: [
        {
          color: "Negro",
          imagen: "/productospcu/dualshock2.png",
          imagenes: ["/productospcu/dualshock2.png"],
          cantidad: 1,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },

    {
      id: "xone2",
      nombre: "Control Inalámbrico Cosaux FM08 para Xbox",
      empresa: "Xbox",
      precio: 34.99,
      descripcion:
        "Gamepad inalámbrico estilo Xbox, ideal para juegos casuales en PC o consola. *Producto sin probar (untested)*.",
      imagen: "/productospcu/controlxbox.png",
      imagenes: ["/productospcu/controlxbox.png"],
      oferta: true,
      estado: "Nuevo",
      acerca: [
        "Diseño ergonómico tipo Xbox",
        "Botones responsivos y joystick doble",
        "Conectividad inalámbrica",
        "Compatible con PC y algunas consolas",
        "Ideal como control secundario",
        "*Nota: producto sin probar (untested)*",
      ],
      variantes: [
        {
          color: "Negro",
          imagen: "/productospcu/controlxbox.png",
          imagenes: ["/productospcu/controlxbox.png"],
          cantidad: 1,
        },
      ],
      videoUrl: "https://tulinkalvideo.mp4",
      imagenesExtra: [
        "/Productos/producto-x-1.jpg",
        "/Productos/producto-x-2.jpg",
        "/Productos/producto-x-3.jpg",
      ],
    },
  ],
}

];

export default productosAll;
