import React from 'react'
import { Link } from 'react-router-dom'

const categories = [
    'Videojuegos', 'Accesorios', 'Consolas', 'Cargadores', 'Controles', 'Laptops',
    'Celulares', 'Tablets', 'Cámaras', 'Relojes', 'Drones', 'Luces LED', 'Teclados',
    'Mouses', 'Sillas gamer', 'Audífonos', 'TVs', 'Mini proyectores', 'Smart Home',
    'Routers', 'VR Headsets', 'Monitores'
]

const CategorySlider = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
    {categories.map(cat => (
        <Link
        key={cat}
        to={`/categoria/${cat.toLowerCase().replace(/\s/g, '-')}`}
        className="bg-white border border-gray-300 rounded-lg p-4 text-center shadow hover:shadow-lg hover:bg-purple-50 transition"
        >
        {cat}
        </Link>
    ))}
    </div>
)

export default CategorySlider
