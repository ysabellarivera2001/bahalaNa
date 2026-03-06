export interface ThemePalette {
  id: string;
  name: string;
  colors: {
    olivePetal: string;
    goldenClover: string;
    articDaisy: string;
    roseBlush: string;
    peachBlossom: string;
    accent: string;
    accentContrast: string;
  };
}

export const themePalettes: ThemePalette[] = [
  {
    id: "olive-garden",
    name: "Olive Garden",
    colors: {
      olivePetal: "#A3A380",
      goldenClover: "#D7CE93",
      articDaisy: "#EFEBCE",
      roseBlush: "#D8A48F",
      peachBlossom: "#B88588",
      accent: "#B88588",
      accentContrast: "#2F2425",
    },
  },
  {
    id: "pale-rose",
    name: "Pale Rose",
    colors: {
      olivePetal: "#DFC5D2",
      goldenClover: "#E3B8B9",
      articDaisy: "#F5DFC5",
      roseBlush: "#B47471",
      peachBlossom: "#CDD9E5",
      accent: "#B47471",
      accentContrast: "#FFF7F7",
    },
  },
  {
    id: "orchid-wine",
    name: "Orchid Wine",
    colors: {
      olivePetal: "#F3E0D1",
      goldenClover: "#E8B19D",
      articDaisy: "#BB8C94",
      roseBlush: "#BE6674",
      peachBlossom: "#741C28",
      accent: "#BE6674",
      accentContrast: "#FFF4F5",
    },
  },
  {
    id: "dry-rose",
    name: "Dry Rose",
    colors: {
      olivePetal: "#E6E7D9",
      goldenClover: "#F5DAA0",
      articDaisy: "#DCAE92",
      roseBlush: "#B4746A",
      peachBlossom: "#F1A055",
      accent: "#B4746A",
      accentContrast: "#FFF7F2",
    },
  },
  {
    id: "shadow-plum",
    name: "Shadow Plum",
    colors: {
      olivePetal: "#254031",
      goldenClover: "#5F4588",
      articDaisy: "#D2D1DF",
      roseBlush: "#A094D6",
      peachBlossom: "#3F3356",
      accent: "#5F4588",
      accentContrast: "#F8F6FF",
    },
  },
];
