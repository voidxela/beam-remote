import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { StateStorage } from "zustand/middleware";
import { createMMKV } from "react-native-mmkv";
import { ThemeProfile } from "../theme/Colors";

export type NavigationStyle = "standard" | "swipe_canvas";

const prefsStorage = createMMKV({ id: "beam-prefs-storage" });

const zustandStorage: StateStorage = {
  setItem: (name, value) => prefsStorage.set(name, value),
  getItem: (name) => {
    const value = prefsStorage.getString(name);
    return value ?? null;
  },
  removeItem: (name) => prefsStorage.remove(name),
};

interface PreferencesStore {
  theme: ThemeProfile;
  navigation: NavigationStyle;
  setTheme: (theme: ThemeProfile, isPremium: boolean) => boolean;
  setNavigation: (nav: NavigationStyle, isPremium: boolean) => boolean;
}

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      theme: "midnight", // DEFAULT: Deep Navy
      navigation: "standard",

      setTheme: (theme, isPremium) => {
        // FREE TIER: Only Midnight is allowed. Obsidian is Premium.
        if (theme !== "midnight" && !isPremium) return false;
        set({ theme });
        return true;
      },

      setNavigation: (nav, isPremium) => {
        if (nav !== "standard" && !isPremium) return false;
        set({ navigation: nav });
        return true;
      },
    }),
    {
      name: "beam-prefs",
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
