import React from "react";
import { Link } from "react-router-dom";

function CategoryCard({ nombre, imagen, ruta }) {
    return (
    <Link to={ruta} className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg hover:scale-105 transition transform">
        <img src={imagen} alt={nombre} className="w-full h-32 object-cover" />
        <div className="p-2 text-center font-semibold text-gray-800">{nombre}</div>
    </Link>
    );
}

export default CategoryCard;
