import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import ToastNotification from "../components/ToastNotification";
import { setGlobalNotifier } from "../utils/notificationBus";

const NotificationContext = createContext({
  showNotification: () => {},
});

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback(
    (message, type = "info", title = null, options = {}) => {
      if (!message) return;
      const id = Date.now() + Math.random();
      setNotifications((prev) => [
        ...prev,
        { id, message, type, title, ...options },
      ]);
    },
    []
  );

  useEffect(() => {
    setGlobalNotifier(() => showNotification);
    return () => setGlobalNotifier(null);
  }, [showNotification]);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <ToastNotification
        notifications={notifications}
        onRemove={removeNotification}
      />
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
