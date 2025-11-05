import React from "react";
import { getCategoryFieldsConfig } from "../utils/categoryFieldsConfig";

/**
 * Componente para mostrar características adicionales en VistaProducto
 * Formato de tabla organizada por grupos, estilo Amazon
 */
const AdditionalFieldsDisplay = ({ categoriaId, caracteristicas = {} }) => {
  const categoryConfig = getCategoryFieldsConfig(categoriaId);

  // Si no hay características, no mostrar nada
  if (!caracteristicas || Object.keys(caracteristicas).length === 0) {
    return null;
  }

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

  // Si hay configuración de categoría, mostrar por grupos
  if (categoryConfig) {
    // Recolectar todos los IDs de campos estándar
    const standardFieldIds = new Set();
    categoryConfig.grupos.forEach((grupo) => {
      grupo.campos.forEach((campo) => standardFieldIds.add(campo.id));
    });

    // Separar campos estándar y personalizados
    const customFields = Object.keys(caracteristicas).filter(
      (key) => !standardFieldIds.has(key) && caracteristicas[key]
    );

    return (
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          ✨ Características Adicionales
        </h3>

        {/* Grupos de campos estándar */}
        {categoryConfig.grupos.map((grupo, grupoIdx) => {
          // Filtrar solo campos que tienen valor
          const camposConValor = grupo.campos.filter(
            (campo) => caracteristicas[campo.id]
          );

          if (camposConValor.length === 0) return null;

          return (
            <div
              key={grupoIdx}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3">
                <h4 className="text-white font-semibold flex items-center gap-2">
                  <span>{grupo.icono}</span>
                  {grupo.titulo}
                </h4>
              </div>

              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {camposConValor.map((campo) => (
                  <div
                    key={campo.id}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-2 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {campo.nombre}:
                    </dt>
                    <dd className="sm:col-span-2 text-sm text-gray-900 dark:text-white font-medium">
                      {formatValue(caracteristicas[campo.id])}
                    </dd>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Campos personalizados */}
        {customFields.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-4 py-3">
              <h4 className="text-white font-semibold flex items-center gap-2">
                <span>🔧</span>
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
  }

  // Si no hay configuración de categoría, mostrar todos los campos en una tabla simple
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        ✨ Características Adicionales
      </h3>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {Object.entries(caracteristicas)
            .filter(([_, value]) => value)
            .map(([key, value]) => {
              const displayName = key
                .split("_")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");

              return (
                <div
                  key={key}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-2 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {displayName}:
                  </dt>
                  <dd className="sm:col-span-2 text-sm text-gray-900 dark:text-white font-medium">
                    {formatValue(value)}
                  </dd>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default AdditionalFieldsDisplay;
