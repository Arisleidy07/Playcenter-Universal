import React from 'react'
import CategorySlider from '../components/CategorySlider'

const Home = () => (
    <div className="p-6 mt-24">
    <h1 className="text-4xl font-bold text-center mb-6 text-purple-700">Ofertas del día</h1>
    <div className="bg-purple-100 text-center p-4 mb-6 rounded-xl shadow-md animate-pulse">
        🚨 ¡Super descuentos por tiempo limitado en consolas y más! 🚨
    </div>
    <CategorySlider />
    </div>
)

export default Home
