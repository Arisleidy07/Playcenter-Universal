import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * RelatedProductCard - Tarjeta SOLO para productos relacionados
 * SIN botón de agregar al carrito
 * Solo imagen, título y precio
 */
const RelatedProductCard = ({ producto }) => {
  const navigate = useNavigate();

  const imagen =
    producto.imagenPrincipal?.[0]?.url ||
    producto.imagen ||
    producto.imagenes?.[0];

  const handleClick = () => {
    navigate(`/producto/${producto.id}`);
    window.scrollTo(0, 0);
  };

  return (
    <article
      onClick={handleClick}
      style={{
        width: "180px",
        minWidth: "180px",
        maxWidth: "180px",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        scrollSnapAlign: "start",
      }}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 hover:shadow-lg transition-shadow cursor-pointer"
    >
      {/* Imagen - SIN FONDO */}
      <div
        style={{
          width: "100%",
          height: "180px",
          minHeight: "180px",
          maxHeight: "180px",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          marginBottom: "0.5rem",
          backgroundColor: "transparent",
        }}
      >
        {imagen ? (
          <img
            src={imagen}
            alt={producto.nombre}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
            loading="lazy"
          />
        ) : (
          <div className="text-gray-400 text-sm">Sin imagen</div>
        )}
      </div>

      {/* Título - 2 líneas */}
      <h3
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          lineHeight: "1.3em",
          height: "2.6em",
          minHeight: "2.6em",
          maxHeight: "2.6em",
          flexShrink: 0,
          marginBottom: "0.5rem",
          fontSize: "0.875rem",
        }}
        className="text-gray-900 dark:text-gray-100 hover:text-orange-600 dark:hover:text-orange-400"
      >
        {producto.nombre}
      </h3>

      {/* Precio */}
      <div className="flex items-baseline gap-1" style={{ height: "24px" }}>
        <span className="text-xs text-gray-600 dark:text-gray-400">RD$</span>
        <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
          {Number(producto.precio).toFixed(2)}
        </span>
      </div>
    </article>
  );
};

export default RelatedProductCard;
