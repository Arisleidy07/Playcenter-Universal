import React, { useState } from 'react';
import TarjetaProducto from "../components/TarjetaProducto";
import SidebarCategorias from '../components/SidebarCategorias';

const categorias = [
    'Todos', 'Accesorios', 'Audífonos', 'Cables', 'Cámaras', 'Cargadores', 'Celulares',
    'Consolas', 'Discos duros', 'Electrodomésticos', 'Gaming Chairs', 'Hogar inteligente',
    'Impresoras', 'Laptops', 'Memorias USB', 'Monitores', 'Mouse', 'Nuevos lanzamientos',
    'Ofertas especiales', 'Relojes inteligentes', 'Smart TV', 'Tablets', 'Teclados', 'Videojuegos'
];

const productos = [
    { nombre: 'Soporte de control PS5', precio: 25.99, imagen: '/products/soporte-controles.jpg', categoria: 'Accesorios' },
    { nombre: 'Base refrigeradora Xbox', precio: 34.99, imagen: '/products/base-refrigeracion.jpg', categoria: 'Accesorios' },
    { nombre: 'Auriculares Gaming', precio: 44.99, imagen: '/products/auriculares-gamer.jpg', categoria: 'Audífonos' },
    { nombre: 'Cable HDMI 2.1', precio: 12.99, imagen: '/products/cable-hdmi.jpg', categoria: 'Cables' },
    { nombre: 'Cámara Web Full HD', precio: 39.99, imagen: '/products/camara-web.jpg', categoria: 'Cámaras' },
    { nombre: 'Cargador rápido USB-C', precio: 14.99, imagen: '/products/cargador-usb.jpg', categoria: 'Cargadores' },
    { nombre: 'Celular Xiaomi Redmi', precio: 199.99, imagen: '/products/xiaomi.jpg', categoria: 'Celulares' },
    { nombre: 'PlayStation 5', precio: 499.99, imagen: '/products/ps5.png', categoria: 'Consolas' },
    { nombre: 'SSD Kingston 1TB', precio: 89.99, imagen: '/products/ssd-500gb.png', categoria: 'Discos duros' },
    { nombre: 'Microondas Samsung', precio: 129.99, imagen: '/products/microondas.jpg', categoria: 'Electrodomésticos' },
    { nombre: 'Gaming Chair LED', precio: 179.99, imagen: '/products/silla-gamer.jpg', categoria: 'Gaming Chairs' },
    { nombre: 'Lámpara inteligente WiFi', precio: 39.99, imagen: '/products/lampara-inteligente.jpg', categoria: 'Hogar inteligente' },
    { nombre: 'Impresora HP InkTank', precio: 89.99, imagen: '/products/impresora.jpg', categoria: 'Impresoras' },
    { nombre: 'Laptop Lenovo 14"', precio: 499.99, imagen: '/products/laptop.jpg', categoria: 'Laptops' },
    { nombre: 'USB 64GB Kingston', precio: 9.99, imagen: '/products/usb.jpg', categoria: 'Memorias USB' },
    { nombre: 'Monitor Curvo Samsung', precio: 299.99, imagen: '/products/monitor.jpg', categoria: 'Monitores' },
    { nombre: 'Mouse inalámbrico', precio: 15.99, imagen: '/products/mouse.jpg', categoria: 'Mouse' },
    { nombre: 'Lanzamiento nuevo JBL X5', precio: 109.99, imagen: '/products/nuevo.jpg', categoria: 'Nuevos lanzamientos' },
    { nombre: 'Oferta especial: Teclado RGB', precio: 22.99, imagen: '/products/oferta.jpg', categoria: 'Ofertas especiales' },
    { nombre: 'Reloj inteligente Huawei', precio: 69.99, imagen: '/products/reloj.jpg', categoria: 'Relojes inteligentes' },
    { nombre: 'Smart TV 50" LG', precio: 459.99, imagen: '/products/tv.jpg', categoria: 'Smart TV' },
    { nombre: 'Tablet Galaxy Tab A8', precio: 149.99, imagen: '/products/tablet.jpg', categoria: 'Tablets' },
    { nombre: 'Teclado mecánico RGB', precio: 39.99, imagen: '/products/teclado.jpg', categoria: 'Teclados' },
    { nombre: 'GTA V PS5', precio: 49.99, imagen: '/products/gta.jpg', categoria: 'Videojuegos' },
];

function Categorias() {
    const [categoriaActiva, setCategoriaActiva] = useState('Todos');

    const productosFiltrados =
    categoriaActiva === 'Todos'
        ? productos
        : productos.filter((p) => p.categoria === categoriaActiva);

    return (
    <main className="pt-24 px-4 sm:px-6 lg:px-12 pb-16 bg-white min-h-screen flex flex-col lg:flex-row gap-8">
      {/* Sidebar */}
        <SidebarCategorias
        categoriaActiva={categoriaActiva}
        setCategoriaActiva={setCategoriaActiva}
        categorias={categorias}
        />
      {/* Productos */}
        <section
        className="
            grid
            grid-cols-1
            sm:grid-cols-2
            md:grid-cols-3
            lg:grid-cols-4
            xl:grid-cols-5
            gap-8
            flex-1
        "
        >
        {productosFiltrados.map((prod, idx) => (
            <TarjetaProducto
            key={idx}
            producto={prod}
            className="max-w-[280px]" // agrega ancho máximo para no achicar demasiado
            />
        ))}
        </section>
    </main>
    );
}


export default Categorias;
