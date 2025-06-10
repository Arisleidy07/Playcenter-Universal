import React, { useState } from 'react';

const anuncios = [
    { id: 1, img: 'https://via.placeholder.com/800x300?text=Anuncio+1' },
    { id: 2, img: 'https://via.placeholder.com/800x300?text=Anuncio+2' },
    { id: 3, img: 'https://via.placeholder.com/800x300?text=Anuncio+3' },
    { id: 4, img: 'https://via.placeholder.com/800x300?text=Anuncio+4' },
    { id: 5, img: 'https://via.placeholder.com/800x300?text=Anuncio+5' },
    { id: 6, img: 'https://via.placeholder.com/800x300?text=Anuncio+6' },
    { id: 7, img: 'https://via.placeholder.com/800x300?text=Anuncio+7' },
];

function SliderAnuncios() {
    const [index, setIndex] = useState(0);

    const handlePrev = () => {
    setIndex((prev) => (prev === 0 ? anuncios.length - 1 : prev - 1));
    };

    const handleNext = () => {
    setIndex((prev) => (prev === anuncios.length - 1 ? 0 : prev + 1));
    };

    return (
    <div className="relative w-full overflow-hidden mt-4">
      <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${index * 100}%)` }}>
        {anuncios.map((item) => (
            <img
            key={item.id}
            src={item.img}
            alt={`Anuncio ${item.id}`}
            className="w-full flex-shrink-0 object-cover h-[200px] sm:h-[300px] md:h-[400px]"
            />
        ))}
        </div>

      {/* Flechas */}
        <button
        onClick={handlePrev}
        className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white/70 p-2 rounded-full shadow hover:bg-white z-10"
        >
        ◀
        </button>
        <button
        onClick={handleNext}
        className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white/70 p-2 rounded-full shadow hover:bg-white z-10"
        >
        ▶
        </button>
    </div>
    );
}

export default SliderAnuncios;
