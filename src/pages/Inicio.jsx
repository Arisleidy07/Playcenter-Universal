import React from 'react';
import CategoryCard from '../components/CategoryCard';

const categorias = [
    { nombre: 'Videojuegos', imagen: '/categories/videojuegos.jpg', ruta: '/videojuegos' },
    { nombre: 'Accesorios', imagen: '/categories/accesorios.jpg', ruta: '/accesorios' },
    { nombre: 'Cargadores', imagen: '/categories/cargadores.jpg', ruta: '/cargadores' },
    { nombre: 'Tablets', imagen: '/categories/tablets.jpg', ruta: '/tablets' },
    { nombre: 'Celulares', imagen: '/categories/celulares.jpg', ruta: '/celulares' },
    { nombre: 'Smart TV', imagen: '/categories/smarttv.jpg', ruta: '/smarttv' },
    { nombre: 'Teclados', imagen: '/categories/teclados.jpg', ruta: '/teclados' },
    { nombre: 'Gaming Chairs', imagen: '/categories/gamingchairs.jpg', ruta: '/gamingchairs' },
    { nombre: 'Electrodomésticos', imagen: '/categories/electrodomesticos.jpg', ruta: '/electrodomesticos' },
    { nombre: 'Monitores', imagen: '/categories/monitores.jpg', ruta: '/monitores' },
    { nombre: 'Discos Duros', imagen: '/categories/discos.jpg', ruta: '/discosduros' },
    { nombre: 'Memorias USB', imagen: '/categories/memorias.jpg', ruta: '/memoriasusb' },
    { nombre: 'Impresoras', imagen: '/categories/impresoras.jpg', ruta: '/impresoras' },
    { nombre: 'Relojes Inteligentes', imagen: '/categories/relojes.jpg', ruta: '/relojesinteligentes' },
    { nombre: 'Hogar Inteligente', imagen: '/categories/hogar.jpg', ruta: '/hogarinteligente' },
    { nombre: 'Ofertas Especiales', imagen: '/categories/ofertas.jpg', ruta: '/ofertasespeciales' },
    { nombre: 'Nuevos Lanzamientos', imagen: '/categories/nuevos.jpg', ruta: '/nuevoslanzamientos' },
];

function Inicio() {
    return (
    <div className="pt-28 px-6">
      {/* Slider de anuncios */}
        <div className="mb-8">
        <img src="/ads/anuncio1.jpg" alt="Anuncio" className="rounded-lg shadow-md w-full h-64 object-cover animate-fade-in" />
        </div>

      {/* Ofertas Destacadas */}
        <div className="mb-12">
        <h2 className="text-3xl font-bold mb-4 text-purple-700">Ofertas del día</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded-lg shadow hover:scale-105 transition">
            <img src="/products/oferta1.png" className="w-full h-40 object-contain" />
            <h3 className="font-semibold mt-2">Consola Retro</h3>
            <p className="text-purple-600 font-bold">$89.99</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow hover:scale-105 transition">
            <img src="/products/oferta2.png" className="w-full h-40 object-contain" />
            <h3 className="font-semibold mt-2">Tablet 10"</h3>
            <p className="text-purple-600 font-bold">$129.99</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow hover:scale-105 transition">
            <img src="/products/oferta3.png" className="w-full h-40 object-contain" />
            <h3 className="font-semibold mt-2">Headset Gamer</h3>
            <p className="text-purple-600 font-bold">$59.99</p>
            </div>
        </div>
        </div>

      {/* Categorías */}
        <div className="mb-12">
        <h2 className="text-3xl font-bold mb-4 text-purple-700">Categorías</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categorias.map((cat, index) => (
            <CategoryCard key={index} nombre={cat.nombre} imagen={cat.imagen} ruta={cat.ruta} />
            ))}
        </div>
        </div>
    </div>
    );
}

export default Inicio;
