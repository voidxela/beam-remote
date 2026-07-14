import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { StateStorage } from "zustand/middleware";
import { createMMKV } from "react-native-mmkv";
import { UniversalDevice, TVApp } from "../network/adapters/UniversalAdapter";
import { AdapterRegistry } from "../network/adapters/AdapterRegistry";

const storage = createMMKV({ id: "beam-app-storage" });

const zustandStorage: StateStorage = {
  setItem: (name, value) => storage.set(name, value),
  getItem: (name) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name) => storage.remove(name),
};

interface AppStore {
  appsCache: Record<string, TVApp[]>;
  isFetching: boolean;
  fetchApps: (device: UniversalDevice) => Promise<void>;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      appsCache: {},
      isFetching: false,

      fetchApps: async (device: UniversalDevice) => {
        set({ isFetching: true });
        try {
          const apps = await AdapterRegistry.getApps(device);
          set((state) => ({
            appsCache: { ...state.appsCache, [device.ip]: apps },
            isFetching: false,
          }));
        } catch {
          set({ isFetching: false });
        }
      },
    }),
    {
      name: "beam-app-storage",
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        appsCache: state.appsCache,
      }),
    },
  ),
);
