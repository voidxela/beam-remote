import {
  UniversalAdapter,
  UniversalDevice,
  UniversalKey,
} from "./UniversalAdapter";
import { RokuAdapter } from "./RokuAdapter";

// Future adapters (WebOS, AndroidTV) will be registered here
const adapters: Record<string, UniversalAdapter> = {
  roku: RokuAdapter,
};

export const AdapterRegistry = {
  getAdapter(platform: string): UniversalAdapter | null {
    return adapters[platform] || null;
  },

  async sendKey(device: UniversalDevice, key: UniversalKey): Promise<boolean> {
    const adapter = this.getAdapter(device.platform);
    if (!adapter) return false;
    return adapter.sendKey(device.ip, key);
  },

  async sendText(device: UniversalDevice, text: string): Promise<boolean> {
    const adapter = this.getAdapter(device.platform);
    if (!adapter) return false;
    return adapter.sendText(device.ip, text);
  },

  async pingDevice(device: UniversalDevice): Promise<UniversalDevice | null> {
    const adapter = this.getAdapter(device.platform);
    if (!adapter) return null;
    return adapter.getDeviceInfo(device.ip);
  },
};
