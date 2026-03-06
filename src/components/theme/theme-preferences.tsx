"use client";

import { useThemePalette } from "@/components/theme/theme-palette-provider";
import { themePalettes } from "@/lib/theme-palettes";

export function ThemePreferences() {
  const { activePalette, setPaletteById } = useThemePalette();

  return (
    <div className="space-y-3">
      <p className="text-sm text-[var(--muted)]">
        Select your preferred color theme. This choice is saved automatically in your browser.
      </p>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {themePalettes.map((palette) => {
          const selected = palette.id === activePalette.id;
          return (
            <button
              key={palette.id}
              type="button"
              onClick={() => setPaletteById(palette.id)}
              className={`rounded-lg border p-3 text-left transition ${
                selected
                  ? "border-[var(--peach-blossom)] bg-[var(--surface-soft)]"
                  : "bg-[var(--surface)] hover:bg-[var(--surface-soft)]"
              }`}
            >
              <p className="text-sm font-semibold text-[var(--text)]">{palette.name}</p>
              <div className="mt-2 flex gap-1.5">
                <span className="h-4 w-4 rounded-full border" style={{ backgroundColor: palette.colors.olivePetal }} />
                <span className="h-4 w-4 rounded-full border" style={{ backgroundColor: palette.colors.goldenClover }} />
                <span className="h-4 w-4 rounded-full border" style={{ backgroundColor: palette.colors.articDaisy }} />
                <span className="h-4 w-4 rounded-full border" style={{ backgroundColor: palette.colors.roseBlush }} />
                <span className="h-4 w-4 rounded-full border" style={{ backgroundColor: palette.colors.peachBlossom }} />
              </div>
              <p className="mt-2 text-xs text-[var(--muted)]">{selected ? "Active theme" : "Set as active"}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
