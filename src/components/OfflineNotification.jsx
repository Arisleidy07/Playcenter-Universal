import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const OfflineNotification = ({ isOnline, pendingUploads }) => {
  const [notifications, setNotifications] = useState([]);
  const [lastOnlineState, setLastOnlineState] = useState(isOnline);

  useEffect(() => {
    // Detectar cuando se restaura la conexión
    if (!lastOnlineState && isOnline) {
      addNotification({
        id: Date.now(),
        type: 'success',
        message: '🟢 Conexión restaurada - Procesando subidas pendientes...',
        duration: 3000
      });
    }
    
    // Detectar cuando se pierde la conexión
    if (lastOnlineState && !isOnline) {
      addNotification({
        id: Date.now(),
        type: 'warning',
        message: '🔴 Sin conexión - Las imágenes se guardarán cuando se restaure',
        duration: 5000
      });
    }
    
    setLastOnlineState(isOnline);
  }, [isOnline, lastOnlineState]);

  const addNotification = (notification) => {
    setNotifications(prev => [...prev, notification]);
    
    // Auto-remover después del tiempo especificado
    setTimeout(() => {
      removeNotification(notification.id);
    }, notification.duration);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            className={`
              max-w-sm p-4 rounded-lg shadow-lg cursor-pointer
              ${notification.type === 'success' 
                ? 'bg-green-500 text-white' 
                : notification.type === 'warning'
                ? 'bg-yellow-500 text-white'
                : 'bg-blue-500 text-white'
              }
            `}
            onClick={() => removeNotification(notification.id)}
          >
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">
                {notification.message}
              </span>
              <button 
                className="ml-auto text-white hover:text-gray-200"
                onClick={(e) => {
                  e.stopPropagation();
                  removeNotification(notification.id);
                }}
              >
                ✕
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      
      {/* Indicador persistente cuando hay subidas pendientes */}
      {pendingUploads > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-orange-500 text-white p-3 rounded-lg shadow-lg"
        >
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <span className="text-sm font-medium">
              {pendingUploads} subidas en cola
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default OfflineNotification;
