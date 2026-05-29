import { create } from "zustand";

interface MonetizationStore {
  isPremium: boolean;
  hasSeenPaywall: boolean;
  setPremiumStatus: (status: boolean) => void;
  setHasSeenPaywall: (status: boolean) => void;
}

export const useMonetizationStore = create<MonetizationStore>((set) => ({
  isPremium: true, //TODO reset to false before release // Defaults to the free ad-supported tier
  hasSeenPaywall: false,
  setPremiumStatus: (status) => set({ isPremium: status }),
  setHasSeenPaywall: (status) => set({ hasSeenPaywall: status }),
}));
