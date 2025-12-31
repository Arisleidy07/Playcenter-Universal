let globalNotifier = null;

export const setGlobalNotifier = (fn) => {
  globalNotifier = fn;
};

export const notify = (message, type = "info", title = null, options = {}) => {
  if (typeof globalNotifier === "function") {
    globalNotifier(message, type, title, options);
  }
};

// Add convenience methods
notify.success = (message, title = null, options = {}) => {
  notify(message, "success", title, options);
};

notify.error = (message, title = null, options = {}) => {
  notify(message, "error", title, options);
};

notify.warning = (message, title = null, options = {}) => {
  notify(message, "warning", title, options);
};

notify.info = (message, title = null, options = {}) => {
  notify(message, "info", title, options);
};
