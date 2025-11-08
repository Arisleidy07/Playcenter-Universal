import React from "react";
import { Settings, User, Factory, Calendar, Tag } from "lucide-react";

/**
 * Componente para mostrar características adicionales en VistaProducto
 * Campos universales + campos personalizados
 */
const AdditionalFieldsDisplay = ({ categoriaId, caracteristicas = {} }) => {
  // Campos estándar universales (mismos que en AdditionalFieldsSection)
  const standardFields = [
    {
      id: "clasificacion_edad",
      nombre: "Clasificación de Edad",
      icono: Calendar
    },
    {
      id: "genero",
      nombre: "Género",
      icono: User
    },
    {
      id: "fabricante",
      nombre: "Fabricante",
      icono: Factory
    }
  ];

  // Si no hay características, no mostrar nada
  if (!caracteristicas || Object.keys(caracteristicas).length === 0) {
    return null;
  }

  // Separar campos estándar y personalizados
  const standardFieldIds = new Set(standardFields.map(f => f.id));
  const customFields = Object.keys(caracteristicas).filter(
    (key) => !standardFieldIds.has(key) && caracteristicas[key] && !key.endsWith("_description")
  );

  // Filtrar campos estándar que tienen valor
  const standardFieldsWithValue = standardFields.filter(
    (field) => caracteristicas[field.id]
  );

  // Función para formatear valores según tipo
  const formatValue = (value) => {
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    if (typeof value === "boolean") {
      return value ? "Sí" : "No";
    }
    if (value === null || value === undefined || value === "") {
      return "-";
    }
    return String(value);
  };

  // Si no hay campos con valor, no mostrar nada
  if (standardFieldsWithValue.length === 0 && customFields.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Settings size={24} />
        Características Adicionales
      </h3>

      {/* Campos estándar universales */}
      {standardFieldsWithValue.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3">
            <h4 className="text-white font-semibold flex items-center gap-2">
              <Tag size={18} />
              Información General
            </h4>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {standardFieldsWithValue.map((field) => {
              const IconComponent = field.icono;
              return (
                <div
                  key={field.id}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-2 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <dt className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <IconComponent size={16} />
                    {field.nombre}:
                  </dt>
                  <dd className="sm:col-span-2 text-sm text-gray-900 dark:text-white font-medium">
                    {formatValue(caracteristicas[field.id])}
                  </dd>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Campos personalizados */}
      {customFields.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-4 py-3">
            <h4 className="text-white font-semibold flex items-center gap-2">
              <Settings size={18} />
              Información Adicional
            </h4>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {customFields.map((fieldId) => {
              const displayName = fieldId
                .split("_")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");

              return (
                <div
                  key={fieldId}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-2 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {displayName}:
                  </dt>
                  <dd className="sm:col-span-2 text-sm text-gray-900 dark:text-white font-medium">
                    {formatValue(caracteristicas[fieldId])}
                  </dd>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdditionalFieldsDisplay;
