let globalNotifier = null;

export const setGlobalNotifier = (fn) => {
  globalNotifier = fn;
};

export const notify = (message, type = "info", title = null, options = {}) => {
  if (typeof globalNotifier === "function") {
    globalNotifier(message, type, title, options);
  }
};
