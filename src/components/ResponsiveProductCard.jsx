import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaShoppingCart, FaEye, FaHeart } from "react-icons/fa";
import { useCarrito } from "../context/CarritoContext";
import { useAuth } from "../context/AuthContext";
import { useAuthModal } from "../context/AuthModalContext";

// Función para formatear precio estilo Amazon
function formatPriceRD(value) {
  const pesos = Math.round(Number(value) || 0);
  return new Intl.NumberFormat("es-DO").format(pesos);
}

function getPriceParts(num) {
  const n = Number(num) || 0;
  const fixed = n.toFixed(2);
  const [wholeStr, fraction] = fixed.split(".");
  const whole = Number(wholeStr);
  return { wholeFormatted: formatPriceRD(whole), fraction };
}

// Función para truncar texto
function truncateText(text, maxLength = 60) {
  if (!text) return "Producto disponible";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + "…";
}

const ResponsiveProductCard = ({ producto, className = "" }) => {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { abrirModal } = useAuthModal();
  const { carrito, agregarAlCarrito } = useCarrito();
  
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Obtener imagen principal con fallback
  const getMainImage = () => {
    if (imageError) return "/Productos/N.jpg";
    
    // Prioridad: imagen principal -> primera imagen del array -> fallback
    if (producto.imagen) return producto.imagen;
    if (producto.imagenes && producto.imagenes.length > 0) return producto.imagenes[0];
    if (producto.media && producto.media.length > 0) {
      const firstImage = producto.media.find(item => item.type === 'image');
      if (firstImage) return firstImage.url;
    }
    
    return "/Productos/N.jpg";
  };

  // Verificar si está en el carrito
  const isInCart = carrito.some(item => item.id === producto.id);
  const cartItem = carrito.find(item => item.id === producto.id);
  const cartQuantity = cartItem?.cantidad || 0;

  // Manejar clic en el producto
  const handleProductClick = () => {
    navigate(`/producto/${producto.id}`);
  };

  // Manejar agregar al carrito
  const handleAddToCart = (e) => {
    e.stopPropagation();
    
    if (!usuario) {
      abrirModal();
      return;
    }

    agregarAlCarrito(producto, 1);
  };

  // Obtener precio a mostrar
  const getPriceToShow = () => {
    // Si tiene variantes con precios, mostrar el menor
    if (producto.variantes && producto.variantes.length > 0) {
      const variantesConPrecio = producto.variantes.filter(v => v.precio);
      if (variantesConPrecio.length > 0) {
        const minPrice = Math.min(...variantesConPrecio.map(v => parseFloat(v.precio)));
        return minPrice;
      }
    }
    return parseFloat(producto.precio) || 0;
  };

  const price = getPriceToShow();
  const { wholeFormatted, fraction } = getPriceParts(price);

  return (
    <div 
      className={`group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100 overflow-hidden ${className}`}
      onClick={handleProductClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Imagen del producto */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={getMainImage()}
          alt={producto.nombre}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          onError={() => setImageError(true)}
          loading="lazy"
        />
        
        {/* Overlay con acciones - Solo visible en hover en desktop */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleProductClick();
              }}
              className="p-3 bg-white/90 hover:bg-white text-gray-700 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
              title="Ver producto"
            >
              <FaEye className="w-4 h-4" />
            </button>
            <button
              onClick={handleAddToCart}
              className="p-3 bg-blue-600/90 hover:bg-blue-600 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110"
              title="Agregar al carrito"
            >
              <FaShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Badge de stock bajo */}
        {(producto.cantidad || 0) <= 5 && (producto.cantidad || 0) > 0 && (
          <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
            ¡Últimas {producto.cantidad}!
          </div>
        )}

        {/* Badge de agotado */}
        {(producto.cantidad || 0) === 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            Agotado
          </div>
        )}
      </div>

      {/* Información del producto */}
      <div className="p-4">
        {/* Título */}
        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 text-sm md:text-base">
          {truncateText(producto.nombre, 80)}
        </h3>

        {/* Precio */}
        <div className="flex items-baseline gap-1 mb-3">
          <span className="text-sm text-gray-600">RD$</span>
          <span className="text-xl md:text-2xl font-bold text-gray-900">
            {wholeFormatted}
          </span>
          {fraction !== "00" && (
            <span className="text-sm text-gray-600">.{fraction}</span>
          )}
        </div>

        {/* Variantes disponibles */}
        {producto.variantes && producto.variantes.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {producto.variantes.slice(0, 3).map((variante, index) => (
                <span
                  key={index}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                >
                  {variante.color || variante.tamaño || variante.modelo}
                </span>
              ))}
              {producto.variantes.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{producto.variantes.length - 3} más
                </span>
              )}
            </div>
          </div>
        )}

        {/* Botones de acción - Móvil */}
        <div className="flex gap-2 md:hidden">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleProductClick();
            }}
            className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Ver producto
          </button>
          <button
            onClick={handleAddToCart}
            disabled={(producto.cantidad || 0) === 0}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            <FaShoppingCart className="w-3 h-3" />
            {isInCart ? `En carrito (${cartQuantity})` : "Agregar"}
          </button>
        </div>

        {/* Indicador de carrito - Desktop */}
        {isInCart && (
          <div className="hidden md:block mt-2 text-xs text-green-600 font-medium">
            ✓ En carrito ({cartQuantity})
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponsiveProductCard;
