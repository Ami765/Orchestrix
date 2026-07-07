import { create } from "zustand";

interface ThemeState {
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => {
  // Read initial from localstorage or default to dark
  const initialDark = localStorage.getItem("orchestrix_dark_theme") !== "false";
  
  return {
    isDarkMode: initialDark,
    setIsDarkMode: (isDark) => {
      localStorage.setItem("orchestrix_dark_theme", String(isDark));
      set({ isDarkMode: isDark });
    },
    toggleTheme: () => {
      set((state) => {
        const nextDark = !state.isDarkMode;
        localStorage.setItem("orchestrix_dark_theme", String(nextDark));
        return { isDarkMode: nextDark };
      });
    },
  };
});
