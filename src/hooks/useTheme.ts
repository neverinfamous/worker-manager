import { useContext } from "react";
import { ThemeContext } from "@/contexts/theme-context";
import { type ThemeContextType } from "@/contexts/theme-types";

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
