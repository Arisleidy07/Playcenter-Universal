import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info,
  Eye,
  Upload,
  ShoppingCart
} from 'lucide-react';
import { getValidationSummary, VALIDATION_SEVERITY } from '../utils/productValidation';

const ProductValidationPanel = ({ 
  formData, 
  onPublish, 
  onSaveDraft, 
  onPreview,
  isPublishing = false,
  isSaving = false 
}) => {
  const validation = getValidationSummary(formData);
  
  const getSeverityIcon = (severity) => {
    switch (severity) {
      case VALIDATION_SEVERITY.ERROR:
        return <XCircle className="w-4 h-4 text-red-500" />;
      case VALIDATION_SEVERITY.WARNING:
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case VALIDATION_SEVERITY.INFO:
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };
  
  const getSeverityColor = (severity) => {
    switch (severity) {
      case VALIDATION_SEVERITY.ERROR:
        return 'border-red-200 bg-red-50';
      case VALIDATION_SEVERITY.WARNING:
        return 'border-yellow-200 bg-yellow-50';
      case VALIDATION_SEVERITY.INFO:
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };
  
  const getStatusColor = () => {
    if (validation.isReady) return 'text-green-600 bg-green-100';
    if (validation.errorCount > 0) return 'text-red-600 bg-red-100';
    return 'text-yellow-600 bg-yellow-100';
  };
  
  const getStatusIcon = () => {
    if (validation.isReady) return <CheckCircle className="w-5 h-5" />;
    if (validation.errorCount > 0) return <XCircle className="w-5 h-5" />;
    return <AlertTriangle className="w-5 h-5" />;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header with Status */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
              {getStatusIcon()}
              <span>
                {validation.isReady ? 'Listo para publicar' : 
                 validation.errorCount > 0 ? 'Requiere correcciones' : 'En progreso'}
              </span>
            </div>
            
            {(validation.errorCount > 0 || validation.warningCount > 0) && (
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                {validation.errorCount > 0 && (
                  <span className="flex items-center space-x-1">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span>{validation.errorCount} error{validation.errorCount !== 1 ? 'es' : ''}</span>
                  </span>
                )}
                {validation.warningCount > 0 && (
                  <span className="flex items-center space-x-1">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <span>{validation.warningCount} advertencia{validation.warningCount !== 1 ? 's' : ''}</span>
                  </span>
                )}
              </div>
            )}
          </div>
          
          {/* Progress Indicator */}
          <div className="text-right">
            <div className="text-sm text-gray-600 mb-1">
              Completado: {Math.round((1 - validation.errorCount / Math.max(validation.errors.length, 1)) * 100)}%
            </div>
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${validation.isReady ? 'bg-green-500' : 'bg-blue-500'}`}
                initial={{ width: 0 }}
                animate={{ 
                  width: `${Math.round((1 - validation.errorCount / Math.max(validation.errors.length, 1)) * 100)}%` 
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Validation Messages */}
      <AnimatePresence>
        {validation.errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-gray-200"
          >
            <div className="p-4 max-h-60 overflow-y-auto">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Elementos que requieren atención:
              </h4>
              <div className="space-y-2">
                {validation.errors.map((error, index) => (
                  <motion.div
                    key={`${error.field}-${index}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-start space-x-3 p-3 rounded-lg border ${getSeverityColor(error.severity)}`}
                  >
                    {getSeverityIcon(error.severity)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{error.message}</p>
                      {error.field && (
                        <p className="text-xs text-gray-500 mt-1">Campo: {error.field}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="p-4">
        <div className="flex items-center justify-between space-x-3">
          {/* Preview Button */}
          <button
            onClick={onPreview}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>Vista Previa</span>
          </button>

          <div className="flex items-center space-x-3">
            {/* Save Draft Button */}
            <button
              onClick={onSaveDraft}
              disabled={isSaving}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-4 h-4" />
              <span>{isSaving ? 'Guardando...' : 'Guardar Borrador'}</span>
            </button>

            {/* Publish Button */}
            <button
              onClick={onPublish}
              disabled={!validation.canPublish || isPublishing}
              className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-all ${
                validation.canPublish
                  ? 'text-white bg-green-600 hover:bg-green-700 shadow-sm hover:shadow-md'
                  : 'text-gray-400 bg-gray-200 cursor-not-allowed'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>
                {isPublishing ? 'Publicando...' : 
                 validation.canPublish ? 'Publicar Producto' : 'Completar Información'}
              </span>
            </button>
          </div>
        </div>

        {/* Help Text */}
        {!validation.isReady && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <div className="flex items-start space-x-2">
              <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Para publicar tu producto:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Completa todos los campos obligatorios</li>
                  <li>Sube al menos una imagen principal</li>
                  <li>Verifica que el precio sea válido</li>
                  <li>Selecciona una categoría apropiada</li>
                  <li>Agrega una descripción detallada</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProductValidationPanel;
