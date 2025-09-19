import React from "react";
import "../styles/anim2.css";

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

// 🔹 Duplicamos las imágenes varias veces para llenar el TopBar
const images = [
  ...baseImages,
  ...baseImages,
  ...baseImages.slice(0, 5), // relleno extra
];

const Anim2 = () => {
  return (
    <div className="loader2" role="presentation" aria-hidden="true">
      {images.map((src, i) => (
        <img key={i} src={src} alt={`Animación TopBar ${i + 1}`} />
      ))}
    </div>
  );
};

export default Anim2;
