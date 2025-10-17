import React from "react";
import useDeviceDetection from "../hooks/useDeviceDetection";

const ResponsiveProductLayout = ({ 
  producto, 
  galeria, 
  informacionProducto, 
  descripcionCompleta, 
  productosRelacionados,
  children 
}) => {
  const { deviceType, isMobile, isTablet, isDesktop } = useDeviceDetection();

  // Layout para Desktop (≥1280px)
  if (isDesktop) {
    return (
      <div className="min-h-screen bg-white">
        <div className="w-full">
          {/* Layout Desktop: Izquierda galería, Centro/Derecha información */}
          <div className="flex gap-8 p-6">
            {/* Izquierda: Galería con miniaturas verticales */}
            <div className="flex-1 max-w-2xl">
              {galeria}
            </div>
            
            {/* Centro/Derecha: Información del producto */}
            <div className="flex-1 max-w-xl">
              {informacionProducto}
            </div>
          </div>

          {/* Debajo: Descripción completa y especificaciones */}
          <div className="px-6 pb-6">
            {descripcionCompleta}
          </div>

          {/* Productos relacionados - Siempre visibles */}
          <div className="bg-gray-50">
            {productosRelacionados}
          </div>
        </div>
      </div>
    );
  }

  // Layout para Tablet (768px - 1279px)
  if (isTablet) {
    return (
      <div className="min-h-screen bg-white">
        <div className="w-full p-4">
          {/* Imagen principal arriba */}
          <div className="mb-6">
            {galeria}
          </div>

          {/* Información del producto */}
          <div className="mb-6">
            {informacionProducto}
          </div>

          {/* Descripción y especificaciones en pestañas */}
          <div className="mb-6">
            {descripcionCompleta}
          </div>

          {/* Productos relacionados - Carrusel horizontal */}
          <div className="bg-gray-50 -mx-4 px-4 py-6">
            {productosRelacionados}
          </div>
        </div>
      </div>
    );
  }

  // Layout para Móvil (<768px) - TODO VERTICAL
  return (
    <div className="min-h-screen bg-white">
      <div className="w-full">
        {/* Imagen principal arriba */}
        <div className="mb-4">
          {galeria}
        </div>

        {/* Precio, variantes y botones de acción */}
        <div className="px-4 mb-6">
          {informacionProducto}
        </div>

        {/* Descripción y especificaciones */}
        <div className="px-4 mb-6">
          {descripcionCompleta}
        </div>

        {/* Productos relacionados - Carrusel horizontal */}
        <div className="bg-gray-50 py-6">
          {productosRelacionados}
        </div>

        {/* Espacio para botones móviles fijos */}
        <div className="h-20"></div>
      </div>
    </div>
  );
};

export default ResponsiveProductLayout;
