"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ThemePalette, themePalettes } from "@/lib/theme-palettes";

const STORAGE_KEY = "data-ops.palette.id";

interface ThemePaletteContextValue {
  activePalette: ThemePalette;
  cyclePalette: () => void;
  setPaletteById: (id: string) => void;
}

const ThemePaletteContext = createContext<ThemePaletteContextValue | null>(null);

function applyPalette(palette: ThemePalette) {
  const root = document.documentElement;
  root.style.setProperty("--olive-petal", palette.colors.olivePetal);
  root.style.setProperty("--golden-clover", palette.colors.goldenClover);
  root.style.setProperty("--artic-daisy", palette.colors.articDaisy);
  root.style.setProperty("--rose-blush", palette.colors.roseBlush);
  root.style.setProperty("--peach-blossom", palette.colors.peachBlossom);
  root.style.setProperty("--accent", palette.colors.accent);
  root.style.setProperty("--accent-contrast", palette.colors.accentContrast);
}

function findPaletteById(id: string | null): ThemePalette | undefined {
  if (!id) {
    return undefined;
  }

  return themePalettes.find((palette) => palette.id === id);
}

export function ThemePaletteProvider({ children }: { children: ReactNode }) {
  const [activePalette, setActivePalette] = useState<ThemePalette>(() => {
    if (typeof window === "undefined") {
      return themePalettes[0];
    }

    return findPaletteById(window.localStorage.getItem(STORAGE_KEY)) ?? themePalettes[0];
  });

  useEffect(() => {
    applyPalette(activePalette);
    window.localStorage.setItem(STORAGE_KEY, activePalette.id);
  }, [activePalette]);

  const cyclePalette = useCallback(() => {
    setActivePalette((current) => {
      const currentIndex = themePalettes.findIndex((palette) => palette.id === current.id);
      const next = themePalettes[(currentIndex + 1) % themePalettes.length];
      return next;
    });
  }, []);

  const setPaletteById = useCallback((id: string) => {
    const next = findPaletteById(id);
    if (!next) {
      return;
    }
    setActivePalette(next);
  }, []);

  const value = useMemo(
    () => ({
      activePalette,
      cyclePalette,
      setPaletteById,
    }),
    [activePalette, cyclePalette, setPaletteById],
  );

  return <ThemePaletteContext.Provider value={value}>{children}</ThemePaletteContext.Provider>;
}

export function useThemePalette() {
  const context = useContext(ThemePaletteContext);
  if (!context) {
    throw new Error("useThemePalette must be used within ThemePaletteProvider");
  }
  return context;
}
