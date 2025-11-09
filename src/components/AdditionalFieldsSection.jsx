import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Check, Trash2, Settings } from "lucide-react";

/**
 * Componente para renderizar características adicionales personalizadas
 * Sistema flexible donde se puede agregar nombre + información según necesidad
 */
const AdditionalFieldsSection = ({ categoriaId, value = {}, onChange }) => {
  const [customFields, setCustomFields] = useState([]);
  const [showAddCustomField, setShowAddCustomField] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldDescription, setNewFieldDescription] = useState("");

  // Cargar campos personalizados existentes
  useEffect(() => {
    if (value) {
      const customFieldsFromValue = Object.keys(value).filter(
        (key) => key !== "__customFields" && !key.endsWith("_description")
      );

      if (customFieldsFromValue.length > 0) {
        setCustomFields(customFieldsFromValue);
      }
    }
  }, [value]);

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
    // Requiere al menos nombre O información
    if (!newFieldName.trim() && !newFieldDescription.trim()) return;

    let fieldId;
    
    if (newFieldName.trim()) {
      // Si hay nombre, usarlo
      fieldId = newFieldName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "_");
    } else {
      // Si solo hay información, crear un nombre genérico
      const nextNumber = customFields.filter(f => f.startsWith('caracteristica_')).length + 1;
      fieldId = `caracteristica_${nextNumber}`;
    }

    if (!customFields.includes(fieldId)) {
      setCustomFields([...customFields, fieldId]);
      // Guardar el valor (información)
      handleFieldChange(fieldId, newFieldDescription.trim());
    }

    setNewFieldName("");
    setNewFieldDescription("");
    setShowAddCustomField(false);
  };

  // Eliminar campo personalizado
  const handleRemoveCustomField = (fieldId) => {
    setCustomFields(customFields.filter((f) => f !== fieldId));
    const newValue = { ...value };
    delete newValue[fieldId];
    delete newValue[`${fieldId}_description`]; // También eliminar la descripción
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
                <Trash2 size={16} />
              </button>
            )}
          </div>
        );
    }
  };

  // Renderizar siempre los campos (sin depender de categoría)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings size={20} /> Características Adicionales
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Información adicional del producto
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddCustomField(!showAddCustomField)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
        >
          <Plus size={16} /> Agregar Campo
        </button>
      </div>

      <AnimatePresence>
        {showAddCustomField && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-700"
          >
            <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
              Nombre de la característica (opcional):
            </label>
            <input
              type="text"
              value={newFieldName}
              onChange={(e) => setNewFieldName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  document.getElementById('field-description').focus();
                }
              }}
              placeholder="Ej: Fabricante, Dimensiones, Peso, Material, etc."
              className="w-full px-3 py-2 border-2 border-blue-200 dark:border-blue-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white mb-3"
              autoFocus
            />
            <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
              Información / Valor:
            </label>
            <div className="flex gap-2">
              <input
                id="field-description"
                type="text"
                value={newFieldDescription}
                onChange={(e) => setNewFieldDescription(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomField();
                  }
                }}
                placeholder="Ej: Nintendo, 15cm x 10cm x 5cm, Incluye baterías, etc."
                className="flex-1 px-3 py-2 border-2 border-blue-200 dark:border-blue-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddCustomField}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                title="Agregar campo"
              >
                <Check size={16} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddCustomField(false);
                  setNewFieldName("");
                  setNewFieldDescription("");
                }}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                title="Cancelar"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Campos personalizados */}
      {customFields.length > 0 ? (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl shadow-md p-4 md:p-6 border-l-4 border-green-400">
          <h4 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Settings size={18} /> Características Agregadas
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
      ) : !showAddCustomField && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl shadow-md p-6 text-center border-2 border-dashed border-gray-300 dark:border-gray-600">
          <Settings size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-3" />
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            No hay características adicionales aún. Haz clic en <strong>"Agregar Campo"</strong> para comenzar.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdditionalFieldsSection;
