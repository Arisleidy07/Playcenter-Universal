import React from "react";

function CategoryCard({ nombre }) {
    return (
    <div className="bg-white p-4 rounded-lg shadow hover:scale-105 hover:bg-purple-100 transition-all duration-300 cursor-pointer text-center font-semibold text-purple-800">
        {nombre}
    </div>
    );
}

export default CategoryCard;
