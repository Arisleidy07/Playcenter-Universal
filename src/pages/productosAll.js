const productosAll = [
  {
    categoria: "AccesoriosVideojuegos",
    productos: [
      { id: 1, nombre: "Soporte de control PS5 doble carga", imagen: "/products/soporte-controles.jpg", precio: 25.99 },
      { id: 2, nombre: "Base refrigeradora para consola Xbox", imagen: "/products/base-refrigeracion.jpg", precio: 34.99 },
      { id: 3, nombre: "Auriculares Gaming con micrófono", imagen: "/products/auriculares-gamer.jpg", precio: 44.99 },
      { id: 4, nombre: "Grip antideslizante para Nintendo Switch", imagen: "/products/grip-switch.jpg", precio: 14.99 }
    ]
  },
  {
    categoria: "Audifonos",
    productos: [
      { id: 101, nombre: "Audífonos Bluetooth", imagen: "/products/audifonos-bluetooth.jpg", precio: 999 },
      { id: 102, nombre: "Audífonos Gamer RGB", imagen: "/products/audifonos-gamer.jpg", precio: 1299 }
    ]
  },
  {
    categoria: "Cables",
    productos: [
      { id: 1901, nombre: "Cable USB-C a Lightning (1m)", imagen: "/products/cable-usb-c-lightning.jpg", precio: 14.99 },
      { id: 1902, nombre: "Cable HDMI 4K 2m", imagen: "/products/cable-hdmi.jpg", precio: 12.99 }
    ]
  },
  {
    categoria: "Camaras",
    productos: [
      { id: 401, nombre: "Cámara Canon EOS 2000D", imagen: "/products/canon-eos.jpg", precio: 499.99 },
      { id: 402, nombre: "Cámara GoPro Hero 10", imagen: "/products/gopro-hero10.jpg", precio: 399.99 }
    ]
  },
  {
    categoria: "Cargadores",
    productos: [
      { id: 201, nombre: "Cargador rápido USB-C", imagen: "/products/cargador-rapido.jpg", precio: 499 },
      { id: 202, nombre: "Cargador inalámbrico", imagen: "/products/cargador-inalambrico.jpg", precio: 599 }
    ]
  },
  {
    categoria: "Celulares",
    productos: [
      { id: 301, nombre: "iPhone 14 Pro", imagen: "/products/iphone14pro.jpg", precio: 999.99 },
      { id: 302, nombre: "Samsung Galaxy S22", imagen: "/products/galaxy-s22.jpg", precio: 899.99 }
    ]
  },
  {
    categoria: "Consolas",
    productos: [
      { id: 501, nombre: "PlayStation 5", imagen: "/products/ps5.jpg", precio: 499.99 },
      { id: 502, nombre: "Xbox Series X", imagen: "/products/xbox-series-x.jpg", precio: 499.99 }
    ]
  },
  {
    categoria: "DiscosDuros",
    productos: [
      { id: 2001, nombre: "Disco duro externo Seagate 1TB", imagen: "/products/disco-seagate.jpg", precio: 59.99 },
      { id: 2002, nombre: "SSD Samsung 500GB", imagen: "/products/ssd-samsung.jpg", precio: 89.99 }
    ]
  },
  {
    categoria: "Electrodomesticos",
    productos: [
      { id: 601, nombre: "Licuadora Oster", imagen: "/products/licuadora-oster.jpg", precio: 69.99 },
      { id: 602, nombre: "Microondas Samsung 1000W", imagen: "/products/microondas.jpg", precio: 129.99 }
    ]
  },
  {
    categoria: "GamingChairs",
    productos: [
      { id: 701, nombre: "Silla Gamer Reclinable RGB", imagen: "/products/silla-gamer-rgb.jpg", precio: 229.99 },
      { id: 702, nombre: "Silla ergonómica con soporte lumbar", imagen: "/products/silla-ergonomica.jpg", precio: 189.99 }
    ]
  },
  {
    categoria: "HogarInteligente",
    productos: [
      { id: 801, nombre: "Bombillo Wi-Fi inteligente", imagen: "/products/bombillo-wifi.jpg", precio: 19.99 },
      { id: 802, nombre: "Enchufe inteligente Alexa", imagen: "/products/enchufe-inteligente.jpg", precio: 24.99 }
    ]
  },
  {
    categoria: "Impresoras",
    productos: [
      { id: 901, nombre: "Impresora HP DeskJet", imagen: "/products/hp-deskjet.jpg", precio: 79.99 },
      { id: 902, nombre: "Impresora multifunción Epson", imagen: "/products/epson-multifuncion.jpg", precio: 129.99 }
    ]
  },
  {
    categoria: "Laptops",
    productos: [
      { id: 1001, nombre: "Laptop Lenovo IdeaPad 3", imagen: "/products/lenovo-ideapad.jpg", precio: 599.99 },
      { id: 1002, nombre: "MacBook Air M1", imagen: "/products/macbook-air-m1.jpg", precio: 999.99 }
    ]
  },
  {
    categoria: "MemoriasUSB",
    productos: [
      { id: 1101, nombre: "USB Kingston 32GB", imagen: "/products/usb-kingston.jpg", precio: 9.99 },
      { id: 1102, nombre: "USB SanDisk 64GB", imagen: "/products/usb-sandisk.jpg", precio: 14.99 }
    ]
  },
  {
    categoria: "Monitores",
    productos: [
      { id: 1201, nombre: "Monitor LG 24'' FHD", imagen: "/products/monitor-lg.jpg", precio: 169.99 },
      { id: 1202, nombre: "Monitor Samsung Curvo 27''", imagen: "/products/monitor-samsung.jpg", precio: 219.99 }
    ]
  },
  {
    categoria: "Mouses",
    productos: [
      { id: 1301, nombre: "Mouse Logitech G203 RGB", imagen: "/products/logitech-g203.jpg", precio: 39.99 },
      { id: 1302, nombre: "Mouse inalámbrico Xiaomi", imagen: "/products/mouse-xiaomi.jpg", precio: 19.99 }
    ]
  },
  {
    categoria: "NuevosLanzamiento",
    productos: [
      { id: 1401, nombre: "PlayStation Portal", imagen: "/products/playstation-portal.jpg", precio: 299.99 },
      { id: 1402, nombre: "Apple Vision Pro", imagen: "/products/vision-pro.jpg", precio: 3499.99 }
    ]
  },
  {
    categoria: "OfertasEspeciales",
    productos: [
      { id: 1501, nombre: "Combo Teclado + Mouse RGB", imagen: "/products/combo-rgb.jpg", precio: 49.99 },
      { id: 1502, nombre: "TV LG 50'' con 20% OFF", imagen: "/products/tv-lg-oferta.jpg", precio: 399.99 }
    ]
  },
  {
    categoria: "RelojesInteligentes",
    productos: [
      { id: 1601, nombre: "Apple Watch Series 8", imagen: "/products/apple-watch.jpg", precio: 399.99 },
      { id: 1602, nombre: "Xiaomi Watch S1 Active", imagen: "/products/xiaomi-watch.jpg", precio: 199.99 }
    ]
  },
  {
    categoria: "SmartTV",
    productos: [
      { id: 1701, nombre: "Samsung 55'' QLED Smart TV", imagen: "/products/samsung-qled.jpg", precio: 799.99 },
      { id: 1702, nombre: "LG 50'' UHD Smart TV", imagen: "/products/lg-uhd.jpg", precio: 599.99 }
    ]
  },
  {
    categoria: "Tablets",
    productos: [
      { id: 1801, nombre: "iPad 9na generación", imagen: "/products/ipad9.jpg", precio: 329.99 },
      { id: 1802, nombre: "Samsung Galaxy Tab S8", imagen: "/products/galaxy-tab.jpg", precio: 699.99 }
    ]
  },
  {
    categoria: "Teclados",
    productos: [
      { id: 2101, nombre: "Teclado mecánico Redragon RGB", imagen: "/products/teclado-redragon.jpg", precio: 49.99 },
      { id: 2102, nombre: "Teclado inalámbrico Logitech", imagen: "/products/teclado-logitech.jpg", precio: 39.99 }
    ]
  },
  {
    categoria: "Videojuegos",
    productos: [
      { id: 2201, nombre: "The Legend of Zelda: Tears of the Kingdom", imagen: "/products/zelda-tears.jpg", precio: 69.99 },
      { id: 2202, nombre: "God of War Ragnarök PS5", imagen: "/products/god-of-war.jpg", precio: 59.99 }
    ]
  }
];

export default productosAll;
