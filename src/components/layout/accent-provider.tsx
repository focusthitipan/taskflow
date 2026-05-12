"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

type AccentId = "violet" | "mint" | "amber" | "coral" | "royal-blue" | "purple";

interface AccentPalette {
  id: AccentId;
  label: string;
  hex: string;
  hsl: {
    50: string;
    100: string;
    400: string;
    500: string;
    600: string;
    900: string;
  };
}

export const ACCENT_PALETTES: AccentPalette[] = [
  {
    id: "violet",
    label: "Brand Violet",
    hex: "#422AFB",
    hsl: {
      50: "249 50% 98%",
      100: "251 100% 95%",
      400: "255 100% 66%",
      500: "249 97% 57%",
      600: "250 86% 46%",
      900: "238 95% 15%",
    },
  },
  {
    id: "mint",
    label: "Mint Green",
    hex: "#01B574",
    hsl: {
      50: "160 40% 98%",
      100: "160 100% 96%",
      400: "160 84% 55%",
      500: "162 99% 36%",
      600: "160 94% 28%",
      900: "162 82% 14%",
    },
  },
  {
    id: "amber",
    label: "Amber",
    hex: "#FFB547",
    hsl: {
      50: "46 50% 98%",
      100: "46 100% 96%",
      400: "42 100% 72%",
      500: "41 100% 64%",
      600: "41 96% 50%",
      900: "27 78% 20%",
    },
  },
  {
    id: "coral",
    label: "Coral",
    hex: "#EE5D50",
    hsl: {
      50: "4 30% 98%",
      100: "4 76% 96%",
      400: "4 80% 70%",
      500: "4 80% 62%",
      600: "4 72% 52%",
      900: "4 70% 25%",
    },
  },
  {
    id: "royal-blue",
    label: "Royal Blue",
    hex: "#3965FF",
    hsl: {
      50: "220 50% 98%",
      100: "220 100% 96%",
      400: "224 100% 70%",
      500: "226 100% 61%",
      600: "226 90% 52%",
      900: "226 60% 25%",
    },
  },
  {
    id: "purple",
    label: "Purple",
    hex: "#7551FF",
    hsl: {
      50: "255 40% 98%",
      100: "255 100% 97%",
      400: "255 100% 75%",
      500: "255 100% 66%",
      600: "255 80% 56%",
      900: "255 70% 25%",
    },
  },
];

const DARK_HSL: Record<string, string> = {
  50: "249 30% 98%",
  100: "251 100% 95%",
  400: "249 100% 67%",
  500: "249 100% 67%",
  600: "250 86% 60%",
  900: "238 80% 85%",
};

const STORAGE_KEY = "taskflow-accent";

interface AccentContextValue {
  accent: AccentId;
  setAccent: (id: AccentId) => void;
  palette: AccentPalette;
}

const AccentContext = createContext<AccentContextValue | null>(null);

export function useAccent() {
  const ctx = useContext(AccentContext);
  if (!ctx) {
    throw new Error("useAccent must be used within an AccentProvider");
  }
  return ctx;
}

function applyPalette(palette: AccentPalette, isDark: boolean) {
  const root = document.documentElement;
  if (isDark) {
    root.style.setProperty("--brand-50", DARK_HSL[50]!);
    root.style.setProperty("--brand-100", DARK_HSL[100]!);
    root.style.setProperty("--brand-400", DARK_HSL[400]!);
    root.style.setProperty("--brand-500", DARK_HSL[500]!);
    root.style.setProperty("--brand-600", DARK_HSL[600]!);
    root.style.setProperty("--brand-900", DARK_HSL[900]!);
  } else {
    root.style.setProperty("--brand-50", palette.hsl[50]);
    root.style.setProperty("--brand-100", palette.hsl[100]);
    root.style.setProperty("--brand-400", palette.hsl[400]);
    root.style.setProperty("--brand-500", palette.hsl[500]);
    root.style.setProperty("--brand-600", palette.hsl[600]);
    root.style.setProperty("--brand-900", palette.hsl[900]);
  }
}

export function AccentProvider({ children }: { children: React.ReactNode }) {
  const [accent, setAccentState] = useState<AccentId>("coral");
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount (before apply)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AccentId;
        if (ACCENT_PALETTES.some((p) => p.id === parsed)) {
          setAccentState(parsed);
        }
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  // Apply CSS variables when accent or dark mode changes
  useEffect(() => {
    if (!hydrated) return;
    const palette = ACCENT_PALETTES.find((p) => p.id === accent) ?? ACCENT_PALETTES[0]!;

    const isDark = document.documentElement.classList.contains("dark");
    applyPalette(palette, isDark);

    // Observe dark mode class changes
    const observer = new MutationObserver(() => {
      const dark = document.documentElement.classList.contains("dark");
      applyPalette(palette, dark);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [accent, hydrated]);

  const setAccent = useCallback((id: AccentId) => {
    setAccentState(id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(id));
    } catch {
      // ignore
    }
  }, []);

  const palette = ACCENT_PALETTES.find((p) => p.id === accent) ?? ACCENT_PALETTES[0]!;

  return (
    <AccentContext.Provider value={{ accent, setAccent, palette }}>
      {children}
    </AccentContext.Provider>
  );
}
