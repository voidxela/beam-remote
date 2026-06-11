import { create } from "zustand";

interface MonetizationStore {
  isPremium: boolean;
  hasSeenPaywall: boolean;
  setPremiumStatus: (status: boolean) => void;
  setHasSeenPaywall: (status: boolean) => void;
  toggleDevPremium: () => void; // New action for our backdoor
}

export const useMonetizationStore = create<MonetizationStore>((set) => ({
  isPremium: false, // FIXED: Now defaults to free tier for production
  hasSeenPaywall: false,
  setPremiumStatus: (status) => set({ isPremium: status }),
  setHasSeenPaywall: (status) => set({ hasSeenPaywall: status }),
  toggleDevPremium: () => set((state) => ({ isPremium: !state.isPremium })),
}));
