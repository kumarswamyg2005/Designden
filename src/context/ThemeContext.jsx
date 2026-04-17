import { createContext, useContext, useEffect, useMemo } from "react";

const ThemeContext = createContext(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  useEffect(() => {
    document.body.classList.remove("dark-theme");
    try {
      localStorage.setItem("designden_theme", "light");
    } catch (e) {
      console.error("Failed to persist light theme:", e);
    }
  }, []);

  const value = useMemo(
    () => ({
      isDark: false,
      toggleTheme: () => {},
    }),
    [],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
