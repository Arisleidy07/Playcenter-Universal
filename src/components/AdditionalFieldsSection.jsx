import React, { useState, useEffect } from "react";
import { getCategoryFieldsConfig } from "../utils/categoryFieldsConfig";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Componente para renderizar campos adicionales dinámicos según la categoría
 * Estilo Amazon Seller Central
 */
const AdditionalFieldsSection = ({ categoriaId, value = {}, onChange }) => {
  const [categoryConfig, setCategoryConfig] = useState(null);
  const [customFields, setCustomFields] = useState([]);
  const [showAddCustomField, setShowAddCustomField] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");

  // Cargar configuración de campos cuando cambia la categoría
  useEffect(() => {
    const config = getCategoryFieldsConfig(categoriaId);
    setCategoryConfig(config);

    // Si hay campos personalizados en value que no están en config, agregarlos
    if (value && config) {
      const standardFieldIds = new Set();
      config.grupos.forEach((grupo) => {
        grupo.campos.forEach((campo) => standardFieldIds.add(campo.id));
      });

      const customFieldsFromValue = Object.keys(value).filter(
        (key) => !standardFieldIds.has(key) && key !== "__customFields"
      );

      if (customFieldsFromValue.length > 0) {
        setCustomFields(customFieldsFromValue);
      }
    }
  }, [categoriaId, value]);

  // Handler para cambios en campos
  const handleFieldChange = (fieldId, fieldValue) => {
    const newValue = {
      ...value,
      [fieldId]: fieldValue,
    };
    onChange(newValue);
  };

  // Agregar campo personalizado
  const handleAddCustomField = () => {
    if (!newFieldName.trim()) return;

    const fieldId = newFieldName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "_");

    if (!customFields.includes(fieldId)) {
      setCustomFields([...customFields, fieldId]);
      handleFieldChange(fieldId, "");
    }

    setNewFieldName("");
    setShowAddCustomField(false);
  };

  // Eliminar campo personalizado
  const handleRemoveCustomField = (fieldId) => {
    setCustomFields(customFields.filter((f) => f !== fieldId));
    const newValue = { ...value };
    delete newValue[fieldId];
    onChange(newValue);
  };

  // Renderizar campo según tipo
  const renderField = (campo, isCustom = false) => {
    const fieldValue = value?.[campo.id] || "";

    switch (campo.tipo) {
      case "select":
        return (
          <select
            value={fieldValue}
            onChange={(e) => handleFieldChange(campo.id, e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all"
          >
            <option value="">
              {campo.placeholder || "Selecciona una opción..."}
            </option>
            {campo.opciones?.map((opcion) => (
              <option key={opcion} value={opcion}>
                {opcion}
              </option>
            ))}
          </select>
        );

      case "multiselect":
        const selectedOptions = Array.isArray(fieldValue)
          ? fieldValue
          : fieldValue
          ? fieldValue.split(",").map((s) => s.trim())
          : [];

        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedOptions.map((option, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  {option}
                  <button
                    type="button"
                    onClick={() => {
                      const newOptions = selectedOptions.filter(
                        (_, i) => i !== idx
                      );
                      handleFieldChange(
                        campo.id,
                        newOptions.length > 0 ? newOptions : ""
                      );
                    }}
                    className="hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <select
              value=""
              onChange={(e) => {
                if (e.target.value && !selectedOptions.includes(e.target.value)) {
                  const newOptions = [...selectedOptions, e.target.value];
                  handleFieldChange(campo.id, newOptions);
                }
              }}
              className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">
                {campo.placeholder || "Selecciona opciones..."}
              </option>
              {campo.opciones?.map((opcion) => (
                <option
                  key={opcion}
                  value={opcion}
                  disabled={selectedOptions.includes(opcion)}
                >
                  {opcion}
                </option>
              ))}
            </select>
          </div>
        );

      case "textarea":
        return (
          <textarea
            value={fieldValue}
            onChange={(e) => handleFieldChange(campo.id, e.target.value)}
            placeholder={campo.placeholder}
            rows={3}
            className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none transition-all"
          />
        );

      case "number":
        return (
          <input
            type="number"
            value={fieldValue}
            onChange={(e) => handleFieldChange(campo.id, e.target.value)}
            placeholder={campo.placeholder}
            className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all"
          />
        );

      case "text":
      default:
        return (
          <div className="flex gap-2">
            <input
              type="text"
              value={fieldValue}
              onChange={(e) => handleFieldChange(campo.id, e.target.value)}
              placeholder={campo.placeholder}
              className="flex-1 px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all"
            />
            {isCustom && (
              <button
                type="button"
                onClick={() => handleRemoveCustomField(campo.id)}
                className="px-3 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                title="Eliminar campo personalizado"
              >
                🗑️
              </button>
            )}
          </div>
        );
    }
  };

  // Si no hay categoría seleccionada
  if (!categoriaId) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 text-center border-2 border-dashed border-blue-200 dark:border-blue-700">
        <p className="text-blue-600 dark:text-blue-400 font-medium">
          📋 Selecciona una categoría para ver campos adicionales específicos
        </p>
        <p className="text-sm text-blue-500 dark:text-blue-500 mt-2">
          Los campos cambiarán automáticamente según la categoría del producto
        </p>
      </div>
    );
  }

  // Si no hay configuración para esta categoría
  if (!categoryConfig) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            📝 Campos Personalizados
          </h4>
          <button
            type="button"
            onClick={() => setShowAddCustomField(!showAddCustomField)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            + Agregar Campo
          </button>
        </div>

        <AnimatePresence>
          {showAddCustomField && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre del campo:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomField();
                    }
                  }}
                  placeholder="Ej: Material, Dimensiones, Garantía"
                  className="flex-1 px-3 py-2 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleAddCustomField}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  ✔
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCustomField(false);
                    setNewFieldName("");
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  ✖
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {customFields.length === 0 && !showAddCustomField && (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            No hay campos personalizados. Haz clic en "Agregar Campo" para crear
            uno.
          </p>
        )}

        {customFields.length > 0 && (
          <div className="space-y-3">
            {customFields.map((fieldId) => {
              const displayName = fieldId
                .split("_")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");

              return (
                <div key={fieldId}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {displayName}
                  </label>
                  {renderField(
                    {
                      id: fieldId,
                      nombre: displayName,
                      tipo: "text",
                      placeholder: `Ingresa ${displayName.toLowerCase()}`,
                    },
                    true
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Renderizar campos específicos de la categoría
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>✨</span> Características Adicionales - {categoryConfig.nombre}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Campos específicos para esta categoría de producto
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddCustomField(!showAddCustomField)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
        >
          <span>+</span> Campo Personalizado
        </button>
      </div>

      <AnimatePresence>
        {showAddCustomField && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-200 dark:border-green-700"
          >
            <label className="block text-sm font-medium text-green-700 dark:text-green-300 mb-2">
              Agregar campo personalizado adicional:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomField();
                  }
                }}
                placeholder="Ej: Origen del producto, Tipo de rosca"
                className="flex-1 px-3 py-2 border-2 border-green-200 dark:border-green-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                autoFocus
              />
              <button
                type="button"
                onClick={handleAddCustomField}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                ✔
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddCustomField(false);
                  setNewFieldName("");
                }}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                ✖
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grupos de campos predefinidos */}
      {categoryConfig.grupos.map((grupo, grupoIdx) => (
        <div
          key={grupoIdx}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 md:p-6 border-l-4 border-blue-400"
        >
          <h4 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>{grupo.icono}</span> {grupo.titulo}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {grupo.campos.map((campo) => (
              <div
                key={campo.id}
                className={campo.tipo === "textarea" ? "md:col-span-2" : ""}
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {campo.nombre}
                </label>
                {renderField(campo)}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Campos personalizados */}
      {customFields.length > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl shadow-md p-4 md:p-6 border-l-4 border-green-400">
          <h4 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>🔧</span> Campos Personalizados
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customFields.map((fieldId) => {
              const displayName = fieldId
                .split("_")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");

              return (
                <div key={fieldId}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {displayName}
                  </label>
                  {renderField(
                    {
                      id: fieldId,
                      nombre: displayName,
                      tipo: "text",
                      placeholder: `Ingresa ${displayName.toLowerCase()}`,
                    },
                    true
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdditionalFieldsSection;
