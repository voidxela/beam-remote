export type ThemeProfile = "obsidian" | "midnight";

export interface ThemeColors {
  background: string;
  panel: string;
  panelBorder: string;
  accent: string;
  accentMuted: string;
  textPrimary: string;
  textSecondary: string;
  danger: string;
  success: string;
}

export const Colors: Record<ThemeProfile, ThemeColors> = {
  obsidian: {
    background: "#000000",
    panel: "#121214",
    panelBorder: "#1A1A1A",
    accent: "#E4E4E7",
    accentMuted: "#333333",
    textPrimary: "#FFFFFF",
    textSecondary: "#888888",
    danger: "#FF5252",
    success: "#4CAF50",
  },
  midnight: {
    background: "#0A0B10",
    panel: "#141622",
    panelBorder: "#1E2132",
    accent: "#FDE68A",
    accentMuted: "#2A2D43",
    textPrimary: "#FFFFFF",
    textSecondary: "#A0AABF",
    danger: "#EF4444",
    success: "#10B981",
  },
};
