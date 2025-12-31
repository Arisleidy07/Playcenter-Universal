import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme debe usarse dentro de ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Leer tema guardado o usar 'light' por defecto
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem("pcu-theme");
      return savedTheme || "light";
    } catch {
      return "light";
    }
  });

  // Aplicar el tema al documento y sincronizar con preferencia del sistema si es 'system'
  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = (isDark) => {
      if (isDark) {
        root.classList.add("dark");
        root.classList.add("dark-theme");
      } else {
        root.classList.remove("dark");
        root.classList.remove("dark-theme");
      }
    };

    if (theme === "system") {
      apply(media.matches);
      const onChange = (e) => apply(e.matches);
      try {
        media.addEventListener("change", onChange);
      } catch {
        // Safari
        media.addListener(onChange);
      }
      return () => {
        try {
          media.removeEventListener("change", onChange);
        } catch {
          media.removeListener(onChange);
        }
      };
    } else {
      apply(theme === "dark");
    }

    // Guardar en localStorage
    try {
      localStorage.setItem("pcu-theme", theme);
    } catch (error) {
      // noop
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const isSystemDark = () => {
    try {
      return (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      );
    } catch {
      return false;
    }
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === "dark" || (theme === "system" && isSystemDark()),
    isLight: theme === "light" || (theme === "system" && !isSystemDark()),
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export default ThemeContext;
