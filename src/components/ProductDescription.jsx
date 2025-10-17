import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import useDeviceDetection from "../hooks/useDeviceDetection";

const ProductDescription = ({ producto, className = "" }) => {
  const { isDesktop, isTablet, isMobile } = useDeviceDetection();
  const [activeTab, setActiveTab] = useState('description');
  const [isExpanded, setIsExpanded] = useState(false);

  // Procesar descripción HTML
  const renderDescription = (description) => {
    if (!description) return <p className="text-gray-600">No hay descripción disponible.</p>;
    
    // Si es HTML, renderizarlo de forma segura
    if (description.includes('<')) {
      return (
        <div 
          className="prose prose-sm max-w-none text-gray-700"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      );
    }
    
    // Si es texto plano, convertir saltos de línea
    return (
      <div className="text-gray-700 whitespace-pre-wrap">
        {description}
      </div>
    );
  };

  // Obtener especificaciones técnicas
  const getSpecifications = () => {
    const specs = [];
    
    if (producto.peso) specs.push({ label: 'Peso', value: producto.peso });
    if (producto.dimensiones) specs.push({ label: 'Dimensiones', value: producto.dimensiones });
    if (producto.material) specs.push({ label: 'Material', value: producto.material });
    if (producto.color) specs.push({ label: 'Color', value: producto.color });
    if (producto.marca || producto.empresa) specs.push({ label: 'Marca', value: producto.marca || producto.empresa });
    if (producto.modelo) specs.push({ label: 'Modelo', value: producto.modelo });
    if (producto.categoria) specs.push({ label: 'Categoría', value: producto.categoria });
    
    // Agregar especificaciones de variantes si existen
    if (producto.variantes && producto.variantes.length > 0) {
      const colores = [...new Set(producto.variantes.map(v => v.color).filter(Boolean))];
      const tamaños = [...new Set(producto.variantes.map(v => v.tamaño).filter(Boolean))];
      const modelos = [...new Set(producto.variantes.map(v => v.modelo).filter(Boolean))];
      
      if (colores.length > 0) specs.push({ label: 'Colores disponibles', value: colores.join(', ') });
      if (tamaños.length > 0) specs.push({ label: 'Tamaños disponibles', value: tamaños.join(', ') });
      if (modelos.length > 0) specs.push({ label: 'Modelos disponibles', value: modelos.join(', ') });
    }
    
    return specs;
  };

  const specifications = getSpecifications();

  // Layout para Desktop
  if (isDesktop) {
    return (
      <div className={`bg-white ${className}`}>
        <div className="max-w-4xl mx-auto py-8">
          {/* Descripción completa */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Descripción del producto
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              {renderDescription(producto.descripcion)}
            </div>
          </div>

          {/* Especificaciones técnicas */}
          {specifications.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Especificaciones técnicas
              </h2>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {specifications.map((spec, index) => (
                    <div key={index} className="px-6 py-4 flex">
                      <div className="w-1/3 font-medium text-gray-900">
                        {spec.label}
                      </div>
                      <div className="w-2/3 text-gray-700">
                        {spec.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Información adicional */}
          {producto.acerca && Array.isArray(producto.acerca) && producto.acerca.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Información adicional
              </h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <ul className="space-y-2">
                  {producto.acerca.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Layout para Tablet - Con pestañas
  if (isTablet) {
    return (
      <div className={`bg-white ${className}`}>
        {/* Pestañas */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('description')}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === 'description'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Descripción
            </button>
            {specifications.length > 0 && (
              <button
                onClick={() => setActiveTab('specifications')}
                className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                  activeTab === 'specifications'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Especificaciones
              </button>
            )}
            {producto.acerca && Array.isArray(producto.acerca) && producto.acerca.length > 0 && (
              <button
                onClick={() => setActiveTab('additional')}
                className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                  activeTab === 'additional'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Información
              </button>
            )}
          </div>
        </div>

        {/* Contenido de pestañas */}
        <div className="p-4">
          {activeTab === 'description' && (
            <div>
              {renderDescription(producto.descripcion)}
            </div>
          )}

          {activeTab === 'specifications' && specifications.length > 0 && (
            <div className="space-y-3">
              {specifications.map((spec, index) => (
                <div key={index} className="flex py-2 border-b border-gray-100 last:border-b-0">
                  <div className="w-1/2 font-medium text-gray-900 text-sm">
                    {spec.label}
                  </div>
                  <div className="w-1/2 text-gray-700 text-sm">
                    {spec.value}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'additional' && producto.acerca && Array.isArray(producto.acerca) && (
            <ul className="space-y-2">
              {producto.acerca.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-gray-700 text-sm">{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  // Layout para Móvil - Acordeón expandible
  return (
    <div className={`bg-white ${className}`}>
      {/* Descripción */}
      <div className="border-b border-gray-200">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-4 flex items-center justify-between text-left"
        >
          <h3 className="font-medium text-gray-900">Descripción del producto</h3>
          {isExpanded ? (
            <FaChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <FaChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>
        
        {isExpanded && (
          <div className="px-4 pb-4">
            {renderDescription(producto.descripcion)}
          </div>
        )}
      </div>

      {/* Especificaciones */}
      {specifications.length > 0 && (
        <div className="border-b border-gray-200">
          <button
            onClick={() => setActiveTab(activeTab === 'specifications' ? '' : 'specifications')}
            className="w-full px-4 py-4 flex items-center justify-between text-left"
          >
            <h3 className="font-medium text-gray-900">Especificaciones técnicas</h3>
            {activeTab === 'specifications' ? (
              <FaChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <FaChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>
          
          {activeTab === 'specifications' && (
            <div className="px-4 pb-4 space-y-3">
              {specifications.map((spec, index) => (
                <div key={index} className="flex py-2 border-b border-gray-100 last:border-b-0">
                  <div className="w-1/2 font-medium text-gray-900 text-sm">
                    {spec.label}
                  </div>
                  <div className="w-1/2 text-gray-700 text-sm">
                    {spec.value}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Información adicional */}
      {producto.acerca && Array.isArray(producto.acerca) && producto.acerca.length > 0 && (
        <div>
          <button
            onClick={() => setActiveTab(activeTab === 'additional' ? '' : 'additional')}
            className="w-full px-4 py-4 flex items-center justify-between text-left"
          >
            <h3 className="font-medium text-gray-900">Información adicional</h3>
            {activeTab === 'additional' ? (
              <FaChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <FaChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>
          
          {activeTab === 'additional' && (
            <div className="px-4 pb-4">
              <ul className="space-y-2">
                {producto.acerca.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductDescription;
