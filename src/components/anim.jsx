import React from "react";
import "../styles/anim.css";

const baseImages = [
  "/animacion/img1.png",
  "/animacion/img2.png",
  "/animacion/img3.png",
  "/animacion/img4.png",
  "/animacion/img5.png",
  "/animacion/img6.png",
  "/animacion/img7.png",
  "/animacion/img8.png",
  "/animacion/img9.png",
  "/animacion/img10.png",
];

// Duplica las primeras 5 imágenes para completar 15
const images = [...baseImages, ...baseImages.slice(0, 5)];

const Anim = () => {
  return (
    <div className="loader" role="presentation" aria-hidden="true">
      {images.map((src, i) => (
        <img key={i} src={src} alt={`Animación ${i + 1}`} />
      ))}
    </div>
  );
};

export default Anim;
