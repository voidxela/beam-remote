import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { StateStorage } from "zustand/middleware";
import { createMMKV } from "react-native-mmkv";
import { UniversalDevice } from "../network/adapters/UniversalAdapter";

const storage = createMMKV({ id: "beam-storage" });

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
  isDeviceConnected: boolean;
  lastConnectedIp: string | null;
  discoveredDevices: UniversalDevice[];
  savedDevices: UniversalDevice[];
  setActiveIp: (ip: string | null) => void;
  setIsDeviceConnected: (status: boolean) => void;
  upsertDiscoveredDevice: (device: UniversalDevice) => void;
  saveDeviceToRoster: (device: UniversalDevice) => void;
  clearDiscovery: () => void;
}

export const useBeamStore = create<BeamStore>()(
  persist(
    (set) => ({
      activeIp: null,
      isDeviceConnected: true, // Assume true on mount, heartbeat will verify
      lastConnectedIp: null,
      discoveredDevices: [],
      savedDevices: [],

      setActiveIp: (ip) =>
        set((state) => ({
          activeIp: ip,
          isDeviceConnected: !!ip, // Reset connection state when IP changes
          lastConnectedIp: ip ? ip : state.lastConnectedIp,
        })),

      setIsDeviceConnected: (status) => set({ isDeviceConnected: status }),

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
      name: "beam-storage",
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        savedDevices: state.savedDevices,
        lastConnectedIp: state.lastConnectedIp,
      }),
    },
  ),
);
