import React, { useState } from "react";
import { FaShoppingCart, FaBolt, FaHeart, FaShare, FaTruck, FaShieldAlt } from "react-icons/fa";
import { useCarrito } from "../context/CarritoContext";
import { useAuth } from "../context/AuthContext";
import { useAuthModal } from "../context/AuthModalContext";
import useDeviceDetection from "../hooks/useDeviceDetection";

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

const ProductInfo = ({ 
  producto, 
  selectedVariant = null, 
  onVariantChange, 
  quantity = 1, 
  onQuantityChange,
  className = "" 
}) => {
  const { isDesktop, isTablet, isMobile } = useDeviceDetection();
  const { usuario } = useAuth();
  const { abrirModal } = useAuthModal();
  const { agregarAlCarrito } = useCarrito();
  
  const [isFavorite, setIsFavorite] = useState(false);

  // Obtener precio actual
  const getCurrentPrice = () => {
    if (selectedVariant && selectedVariant.precio) {
      return parseFloat(selectedVariant.precio);
    }
    return parseFloat(producto.precio) || 0;
  };

  // Obtener stock actual
  const getCurrentStock = () => {
    if (selectedVariant && selectedVariant.cantidad !== undefined) {
      return parseInt(selectedVariant.cantidad);
    }
    return parseInt(producto.cantidad) || 0;
  };

  const currentPrice = getCurrentPrice();
  const currentStock = getCurrentStock();
  const { wholeFormatted, fraction } = getPriceParts(currentPrice);

  // Manejar agregar al carrito
  const handleAddToCart = () => {
    if (!usuario) {
      abrirModal();
      return;
    }

    const productToAdd = {
      ...producto,
      variante: selectedVariant,
      precio: currentPrice
    };

    agregarAlCarrito(productToAdd, quantity);
  };

  // Manejar comprar ahora
  const handleBuyNow = () => {
    if (!usuario) {
      abrirModal();
      return;
    }
    
    handleAddToCart();
    // Aquí podrías redirigir al checkout
    // navigate('/checkout');
  };

  // Manejar favoritos
  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // Aquí implementarías la lógica de favoritos
  };

  // Manejar compartir
  const handleShare = async () => {
    try {
      const shareData = {
        title: producto.nombre,
        text: `Mira este producto: ${producto.nombre}`,
        url: window.location.href
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Enlace copiado al portapapeles');
      }
    } catch (error) {
      console.log('Error al compartir:', error);
    }
  };

  // Layout para Desktop
  if (isDesktop) {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Título */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {producto.nombre}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>SKU: {producto.id}</span>
            <span>|</span>
            <span>Marca: {producto.empresa || 'PlayCenter'}</span>
          </div>
        </div>

        {/* Precio */}
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-sm text-gray-600">RD$</span>
            <span className="text-3xl font-bold text-red-600">
              {wholeFormatted}
            </span>
            {fraction !== "00" && (
              <span className="text-lg text-gray-600">.{fraction}</span>
            )}
          </div>
          {producto.precioOriginal && producto.precioOriginal > currentPrice && (
            <div className="flex items-center gap-2">
              <span className="text-lg text-gray-500 line-through">
                RD$ {formatPriceRD(producto.precioOriginal)}
              </span>
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                -{Math.round(((producto.precioOriginal - currentPrice) / producto.precioOriginal) * 100)}%
              </span>
            </div>
          )}
        </div>

        {/* Variantes */}
        {producto.variantes && producto.variantes.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Opciones disponibles:</h3>
            <div className="grid grid-cols-2 gap-3">
              {producto.variantes.map((variante, index) => (
                <button
                  key={index}
                  onClick={() => onVariantChange && onVariantChange(variante, index)}
                  className={`p-3 border-2 rounded-lg text-left transition-all ${
                    selectedVariant === variante
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <div className="font-medium">
                    {variante.color || variante.tamaño || variante.modelo}
                  </div>
                  {variante.precio && (
                    <div className="text-sm text-gray-600">
                      RD$ {formatPriceRD(variante.precio)}
                    </div>
                  )}
                  <div className={`text-xs ${
                    (variante.cantidad || 0) > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {(variante.cantidad || 0) > 0 
                      ? `${variante.cantidad} disponibles` 
                      : 'Agotado'
                    }
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Cantidad */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900">Cantidad:</h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => onQuantityChange && onQuantityChange(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                -
              </button>
              <span className="px-4 py-2 border-x border-gray-300 min-w-[60px] text-center">
                {quantity}
              </span>
              <button
                onClick={() => onQuantityChange && onQuantityChange(Math.min(currentStock, quantity + 1))}
                disabled={quantity >= currentStock}
                className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
            <span className="text-sm text-gray-600">
              {currentStock} disponibles
            </span>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="space-y-3">
          <button
            onClick={handleAddToCart}
            disabled={currentStock === 0}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-3 px-6 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <FaShoppingCart className="w-4 h-4" />
            Agregar al carrito
          </button>
          
          <button
            onClick={handleBuyNow}
            disabled={currentStock === 0}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <FaBolt className="w-4 h-4" />
            Comprar ahora
          </button>

          <div className="flex gap-2">
            <button
              onClick={handleToggleFavorite}
              className={`flex-1 border-2 py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                isFavorite
                  ? 'border-red-500 text-red-500 bg-red-50'
                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              <FaHeart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              {isFavorite ? 'Favorito' : 'Agregar a favoritos'}
            </button>
            
            <button
              onClick={handleShare}
              className="flex-1 border-2 border-gray-300 text-gray-700 hover:border-gray-400 py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <FaShare className="w-4 h-4" />
              Compartir
            </button>
          </div>
        </div>

        {/* Opciones de envío */}
        <div className="border-t pt-6 space-y-4">
          <h3 className="font-medium text-gray-900">Opciones de envío:</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <FaTruck className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium text-green-800">Envío gratis</div>
                <div className="text-sm text-green-600">En compras mayores a RD$ 2,000</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <FaShieldAlt className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-medium text-blue-800">Garantía incluida</div>
                <div className="text-sm text-blue-600">30 días de garantía del vendedor</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Layout para Tablet
  if (isTablet) {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Título y precio */}
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            {producto.nombre}
          </h1>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-sm text-gray-600">RD$</span>
            <span className="text-2xl font-bold text-red-600">
              {wholeFormatted}
            </span>
            {fraction !== "00" && (
              <span className="text-lg text-gray-600">.{fraction}</span>
            )}
          </div>
        </div>

        {/* Variantes y cantidad en pestañas */}
        <div className="grid grid-cols-2 gap-4">
          {/* Variantes */}
          {producto.variantes && producto.variantes.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Opciones:</h3>
              <div className="space-y-2">
                {producto.variantes.map((variante, index) => (
                  <button
                    key={index}
                    onClick={() => onVariantChange && onVariantChange(variante, index)}
                    className={`w-full p-2 border-2 rounded-lg text-left transition-all ${
                      selectedVariant === variante
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-medium text-sm">
                      {variante.color || variante.tamaño || variante.modelo}
                    </div>
                    <div className={`text-xs ${
                      (variante.cantidad || 0) > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {(variante.cantidad || 0) > 0 
                        ? `${variante.cantidad} disponibles` 
                        : 'Agotado'
                      }
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cantidad */}
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Cantidad:</h3>
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => onQuantityChange && onQuantityChange(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50"
              >
                -
              </button>
              <span className="px-4 py-2 border-x border-gray-300 text-center flex-1">
                {quantity}
              </span>
              <button
                onClick={() => onQuantityChange && onQuantityChange(Math.min(currentStock, quantity + 1))}
                disabled={quantity >= currentStock}
                className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleAddToCart}
            disabled={currentStock === 0}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-3 px-4 rounded-lg transition-colors disabled:bg-gray-300 flex items-center justify-center gap-2"
          >
            <FaShoppingCart className="w-4 h-4" />
            Agregar
          </button>
          
          <button
            onClick={handleBuyNow}
            disabled={currentStock === 0}
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:bg-gray-300 flex items-center justify-center gap-2"
          >
            <FaBolt className="w-4 h-4" />
            Comprar
          </button>
        </div>
      </div>
    );
  }

  // Layout para Móvil
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Título */}
      <h1 className="text-lg font-bold text-gray-900">
        {producto.nombre}
      </h1>

      {/* Precio */}
      <div className="flex items-baseline gap-2">
        <span className="text-sm text-gray-600">RD$</span>
        <span className="text-2xl font-bold text-red-600">
          {wholeFormatted}
        </span>
        {fraction !== "00" && (
          <span className="text-lg text-gray-600">.{fraction}</span>
        )}
      </div>

      {/* Variantes */}
      {producto.variantes && producto.variantes.length > 0 && (
        <div>
          <h3 className="font-medium text-gray-900 mb-2">Opciones:</h3>
          <div className="space-y-2">
            {producto.variantes.map((variante, index) => (
              <button
                key={index}
                onClick={() => onVariantChange && onVariantChange(variante, index)}
                className={`w-full p-3 border-2 rounded-lg text-left transition-all ${
                  selectedVariant === variante
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                <div className="font-medium">
                  {variante.color || variante.tamaño || variante.modelo}
                </div>
                <div className={`text-sm ${
                  (variante.cantidad || 0) > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {(variante.cantidad || 0) > 0 
                    ? `${variante.cantidad} disponibles` 
                    : 'Agotado'
                  }
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Cantidad */}
      <div>
        <h3 className="font-medium text-gray-900 mb-2">Cantidad:</h3>
        <div className="flex items-center border border-gray-300 rounded-lg">
          <button
            onClick={() => onQuantityChange && onQuantityChange(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            className="px-4 py-3 hover:bg-gray-100 disabled:opacity-50"
          >
            -
          </button>
          <span className="px-4 py-3 border-x border-gray-300 text-center flex-1">
            {quantity}
          </span>
          <button
            onClick={() => onQuantityChange && onQuantityChange(Math.min(currentStock, quantity + 1))}
            disabled={quantity >= currentStock}
            className="px-4 py-3 hover:bg-gray-100 disabled:opacity-50"
          >
            +
          </button>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="space-y-3">
        <button
          onClick={handleAddToCart}
          disabled={currentStock === 0}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-4 px-6 rounded-lg transition-colors disabled:bg-gray-300 flex items-center justify-center gap-2 text-lg"
        >
          <FaShoppingCart className="w-5 h-5" />
          Agregar al carrito
        </button>
        
        <button
          onClick={handleBuyNow}
          disabled={currentStock === 0}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-4 px-6 rounded-lg transition-colors disabled:bg-gray-300 flex items-center justify-center gap-2 text-lg"
        >
          <FaBolt className="w-5 h-5" />
          Comprar ahora
        </button>
      </div>
    </div>
  );
};

export default ProductInfo;
