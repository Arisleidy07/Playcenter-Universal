import React from "react";

function ProductCard({ nombre, precio, imagen }) {
    return (
    <div className="relative w-[200px] h-[250px] rounded-xl flex items-center justify-center overflow-hidden shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] z-[1] group">
        <div className="absolute top-[5px] left-[5px] w-[190px] h-[240px] bg-white/95 backdrop-blur-[24px] rounded-[10px] outline outline-2 outline-white z-10 flex flex-col items-center justify-center p-4 text-center">
        <img src={imagen} alt={nombre} className="w-20 h-20 object-cover rounded-full mb-2" />
        <h3 className="text-sm font-bold text-gray-700">{nombre}</h3>
        <p className="text-xs text-gray-500">${precio}</p>
        </div>

        <div className="absolute top-1/2 left-1/2 w-[150px] h-[150px] bg-red-500 rounded-full opacity-100 blur-[12px] animate-blob-bounce z-0" />
    </div>
    );
}

export default ProductCard;
