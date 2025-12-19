import React from "react";

/**
 * VisualVariantSelector - Selector visual de variantes con imágenes estilo Amazon
 * Muestra las variantes del producto con sus imágenes y precios de forma simple y limpia
 */
const VisualVariantSelector = ({
  variantes = [],
  varianteSeleccionada = 0,
  onVarianteChange,
  showStock = false,
  showPrice = true,
  basePrice = 0,
  className = "",
}) => {
  if (!variantes || variantes.length === 0) {
    return null;
  }

  // Filtrar variantes que tienen color definido
  const variantesConColor = variantes.filter(
    (v) => v && typeof v.color === "string" && v.color.trim()
  );

  if (variantesConColor.length === 0) {
    return null;
  }

  const handleVariantClick = (index) => {
    if (onVarianteChange) {
      onVarianteChange(index);
    }
  };

  const fmt = (n) => {
    const v = Number(n || 0);
    return `RD$ ${v.toLocaleString("es-DO", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const Card = ({ variante, index, isSelected, isOutOfStock, onClick }) => {
    const imagenVariante =
      variante.imagenPrincipal?.[0]?.url ||
      variante.imagen ||
      variante.imagenes?.[0] ||
      null;

    return (
      <button
        key={index}
        type="button"
        onClick={onClick}
        className={`
          relative rounded-lg transition-all duration-150 flex-shrink-0 
          w-[100px] sm:w-[110px] xl:w-[120px]
          ${
            isSelected
              ? "border-[2.5px] border-blue-600"
              : "border border-gray-300 hover:border-gray-400"
          }
          ${isOutOfStock ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
          bg-white overflow-hidden
        `}
        style={{ zIndex: 1 }}
        disabled={isOutOfStock}
      >
        <div className="flex flex-col w-full">
          {/* Imagen - cuadrada como Amazon */}
          {imagenVariante && (
            <div className="relative w-full bg-white p-2.5">
              <div className="pt-[100%]" />
              <img
                src={imagenVariante}
                alt={variante.color}
                className="absolute inset-0 w-full h-full object-contain"
              />
            </div>
          )}

          {/* Nombre del Color */}
          <div className="w-full text-center px-2 pt-1.5 pb-1">
            <div className="text-[11px] sm:text-[12px] font-medium text-gray-700 truncate">
              {variante.color}
            </div>
          </div>

          {/* Precio - tipografía mejorada */}
          {showPrice && (
            <div className="w-full text-center px-2 pb-1.5">
              <div
                className="text-[12px] sm:text-[13px] font-bold text-gray-900"
                style={{
                  fontFamily: "Inter, system-ui, -apple-system, sans-serif",
                }}
              >
                {fmt(variante?.precio ?? basePrice)}
              </div>
            </div>
          )}
        </div>
      </button>
    );
  };

  return (
    <div
      className={`visual-variant-selector ${className}`}
      style={{ zIndex: 1, position: "relative" }}
    >
      {/* TODAS LAS PANTALLAS: slider horizontal siempre */}
      <div className="w-full overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 pb-2">
          {variantesConColor.map((v, i) => {
            // Solo marcar como sin stock cuando la cantidad está definida y es 0 o menos.
            const stockNum = Number(v?.cantidad);
            const isOutOfStock =
              Number.isFinite(stockNum) && !Number.isNaN(stockNum)
                ? stockNum <= 0
                : false;

            return (
              <Card
                key={i}
                variante={v}
                index={i}
                isSelected={i === varianteSeleccionada}
                isOutOfStock={isOutOfStock}
                onClick={() => handleVariantClick(i)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VisualVariantSelector;
