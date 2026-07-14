import { create } from "zustand";
import Purchases, { PurchasesPackage } from "react-native-purchases";

interface MonetizationStore {
  isPremium: boolean;
  hasSeenPaywall: boolean;
  packages: PurchasesPackage[];
  isPurchasing: boolean;
  setPremiumStatus: (status: boolean) => void;
  setHasSeenPaywall: (status: boolean) => void;
  toggleDevPremium: () => void;
  checkPremiumStatus: () => Promise<void>;
  fetchOfferings: () => Promise<void>;
  purchasePackage: (pack: PurchasesPackage) => Promise<void>;
  restorePurchases: () => Promise<void>;
}

export const useMonetizationStore = create<MonetizationStore>((set) => ({
  isPremium: false,
  hasSeenPaywall: false,
  packages: [],
  isPurchasing: false,
  setPremiumStatus: (status) => set({ isPremium: status }),
  setHasSeenPaywall: (status) => set({ hasSeenPaywall: status }),
  toggleDevPremium: () => set((state) => ({ isPremium: !state.isPremium })),

  checkPremiumStatus: async () => {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const premiumActive = customerInfo.entitlements.active["premium"] != null;
      set({ isPremium: premiumActive });
    } catch {
      // Graceful failure: do not crash on network errors
    }
  },

  fetchOfferings: async () => {
    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current) {
        set({ packages: offerings.current.availablePackages });
      }
    } catch {
      // Graceful failure: do not crash on network errors
    }
  },

  purchasePackage: async (pack) => {
    set({ isPurchasing: true });
    try {
      const { customerInfo } = await Purchases.purchasePackage(pack);
      const premiumActive = customerInfo.entitlements.active["premium"] != null;
      set({ isPremium: premiumActive });
    } catch {
      // Error or cancellation: ensure purchasing flag resets
    } finally {
      set({ isPurchasing: false });
    }
  },

  restorePurchases: async () => {
    try {
      const customerInfo = await Purchases.restorePurchases();
      const premiumActive = customerInfo.entitlements.active["premium"] != null;
      set({ isPremium: premiumActive });
    } catch {
      // Graceful failure: do not crash on network errors
    }
  },
}));
