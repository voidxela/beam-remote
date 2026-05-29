import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { StateStorage } from "zustand/middleware";
import { createMMKV } from "react-native-mmkv";
import { UniversalDevice } from "../network/adapters/TVAdapter";

const storage = createMMKV({ id: "beam-storage" });

// Create a custom storage wrapper for Zustand to interface with MMKV
const zustandStorage: StateStorage = {
  setItem: (name, value) => storage.set(name, value),
  getItem: (name) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name) => storage.remove(name),
};

interface BeamStore {
  activeIp: string | null;
  lastConnectedIp: string | null;
  discoveredDevices: UniversalDevice[];
  savedDevices: UniversalDevice[];
  setActiveIp: (ip: string | null) => void;
  upsertDiscoveredDevice: (device: UniversalDevice) => void;
  saveDeviceToRoster: (device: UniversalDevice) => void;
  clearDiscovery: () => void;
}

export const useBeamStore = create<BeamStore>()(
  persist(
    (set) => ({
      activeIp: null,
      lastConnectedIp: null, // Tracks the last used device for fast-boot
      discoveredDevices: [],
      savedDevices: [],

      setActiveIp: (ip) =>
        set((state) => ({
          activeIp: ip,
          lastConnectedIp: ip ? ip : state.lastConnectedIp,
        })),

      upsertDiscoveredDevice: (device) =>
        set((state) => {
          const index = state.discoveredDevices.findIndex(
            (d) => d.ip === device.ip,
          );
          if (index !== -1) {
            const updatedList = [...state.discoveredDevices];
            updatedList[index] = device;
            return { discoveredDevices: updatedList };
          }
          return { discoveredDevices: [...state.discoveredDevices, device] };
        }),

      // Explicitly saves a device to persistent storage
      saveDeviceToRoster: (device) =>
        set((state) => {
          const exists = state.savedDevices.some((d) => d.ip === device.ip);
          if (!exists) {
            return { savedDevices: [...state.savedDevices, device] };
          }
          return state;
        }),

      clearDiscovery: () => set({ discoveredDevices: [] }),
    }),
    {
      name: "beam-storage", // unique name
      storage: createJSONStorage(() => zustandStorage),
      // We only want to persist saved devices and last connection.
      // Active connection and discovery should reset on hard app kills.
      partialize: (state) => ({
        savedDevices: state.savedDevices,
        lastConnectedIp: state.lastConnectedIp,
      }),
    },
  ),
);
