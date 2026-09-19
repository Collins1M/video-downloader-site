"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getBrandTheme, getThemeInlineStyles, type BrandTheme } from "@/lib/theme";

interface ThemeContextType {
  theme: BrandTheme;
  setThemeFromSource: (source?: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<BrandTheme>(getBrandTheme());

  const setThemeFromSource = (source?: string) => {
    setTheme(getBrandTheme(source));
  };

  return (
    <ThemeContext.Provider value={{ theme, setThemeFromSource }}>
      <div style={getThemeInlineStyles(theme)} className="flex min-h-screen flex-col">
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
