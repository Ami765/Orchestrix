import React, { createContext, useContext, useState } from "react";

interface ThemeContextType {
  theme: "dark";
  accentColor: "indigo" | "cyan" | "violet";
  setAccentColor: (color: "indigo" | "cyan" | "violet") => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accentColor, setAccentColor] = useState<"indigo" | "cyan" | "violet">("indigo");

  return (
    <ThemeContext.Provider value={{ theme: "dark", accentColor, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};
