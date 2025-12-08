import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

const ToastNotification = ({ notifications, onRemove }) => {
  useEffect(() => {
    // Auto-remove notifications after 5 seconds
    notifications.forEach((notification) => {
      if (!notification.persistent) {
        const timer = setTimeout(() => {
          onRemove(notification.id);
        }, 5000);
        return () => clearTimeout(timer);
      }
    });
  }, [notifications, onRemove]);

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5" />;
      case "error":
        return <AlertCircle className="w-5 h-5" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getColors = (type) => {
    switch (type) {
      case "success":
        return {
          light: "bg-green-50 border-green-200 text-green-800",
          dark: "dark:bg-green-900/20 dark:border-green-800 dark:text-green-200",
          icon: "text-green-600 dark:text-green-400",
        };
      case "error":
        return {
          light: "bg-red-50 border-red-200 text-red-800",
          dark: "dark:bg-red-900/20 dark:border-red-800 dark:text-red-200",
          icon: "text-red-600 dark:text-red-400",
        };
      case "warning":
        return {
          light: "bg-yellow-50 border-yellow-200 text-yellow-800",
          dark: "dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200",
          icon: "text-yellow-600 dark:text-yellow-400",
        };
      default:
        return {
          light: "bg-blue-50 border-blue-200 text-blue-800",
          dark: "dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200",
          icon: "text-blue-600 dark:text-blue-400",
        };
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[99999] flex flex-col gap-3 pointer-events-none max-w-[calc(100vw-2rem)] sm:max-w-md">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => {
          const colors = getColors(notification.type);
          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto ${colors.light} ${colors.dark} border-2 rounded-xl shadow-lg backdrop-blur-sm overflow-hidden`}
            >
              <div className="flex items-start gap-3 p-4">
                <div className={`flex-shrink-0 ${colors.icon}`}>
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  {notification.title && (
                    <h4 className="font-semibold text-sm mb-1">
                      {notification.title}
                    </h4>
                  )}
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {notification.message}
                  </p>
                </div>
                <button
                  onClick={() => onRemove(notification.id)}
                  className="flex-shrink-0 p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Cerrar notificación"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ToastNotification;
