import { DeviceEventEmitter } from "react-native";
import { XMLParser } from "fast-xml-parser";
import {
  UniversalAdapter,
  UniversalKey,
  UniversalDevice,
} from "./UniversalAdapter";

const RokuKeyMap: Record<UniversalKey, string> = {
  [UniversalKey.HOME]: "Home",
  [UniversalKey.PLAY]: "Play",
  [UniversalKey.REWIND]: "Rev",
  [UniversalKey.FORWARD]: "Fwd",
  [UniversalKey.SELECT]: "Select",
  [UniversalKey.LEFT]: "Left",
  [UniversalKey.RIGHT]: "Right",
  [UniversalKey.UP]: "Up",
  [UniversalKey.DOWN]: "Down",
  [UniversalKey.BACK]: "Back",
  [UniversalKey.POWER]: "Power",
  [UniversalKey.BACKSPACE]: "Backspace",
  [UniversalKey.VOL_UP]: "VolumeUp",
  [UniversalKey.VOL_DOWN]: "VolumeDown",
  [UniversalKey.MUTE]: "VolumeMute",
};

const parser = new XMLParser({
  ignoreAttributes: true,
  parseTagValue: true,
});

const fetchWithTimeout = async (
  url: string,
  options: any,
  timeoutMs = 1500,
) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

export const RokuAdapter: UniversalAdapter = {
  platform: "roku",

  sendKey: async (ip: string, key: UniversalKey) => {
    const rokuKey = RokuKeyMap[key];
    if (!rokuKey) return false;

    const url = `http://${ip}:8060/keypress/${rokuKey}`;
    try {
      fetchWithTimeout(url, { method: "POST" }).catch(() => {
        DeviceEventEmitter.emit("SHOW_TOAST", {
          message: `Connection lost. Failed to send command.`,
          type: "error",
        });
      });
      return true;
    } catch (error) {
      return false;
    }
  },

  sendText: async (ip: string, text: string) => {
    if (!text) return false;
    try {
      for (const char of text) {
        const encodedChar = encodeURIComponent(char);
        const url = `http://${ip}:8060/keypress/Lit_${encodedChar}`;
        await fetchWithTimeout(url, { method: "POST" });
      }
      return true;
    } catch (error) {
      return false;
    }
  },

  getDeviceInfo: async (ip: string): Promise<UniversalDevice | null> => {
    try {
      const response = await fetchWithTimeout(
        `http://${ip}:8060/query/device-info`,
        {},
        3000,
      );
      if (!response.ok) return null;

      const xmlText = await response.text();
      const parsedData = parser.parse(xmlText);
      const deviceInfo = parsedData["device-info"];

      if (!deviceInfo) return null;

      const rawName =
        deviceInfo["user-device-name"] ||
        deviceInfo["default-device-name"] ||
        "Roku Device";
      const rawModel = deviceInfo["model-name"] || "Unknown Model";

      const allowedKeys = [
        UniversalKey.HOME,
        UniversalKey.PLAY,
        UniversalKey.REWIND,
        UniversalKey.FORWARD,
        UniversalKey.SELECT,
        UniversalKey.LEFT,
        UniversalKey.RIGHT,
        UniversalKey.UP,
        UniversalKey.DOWN,
        UniversalKey.BACK,
        UniversalKey.POWER,
        UniversalKey.BACKSPACE,
        UniversalKey.VOL_UP,
        UniversalKey.VOL_DOWN,
        UniversalKey.MUTE,
      ];

      return {
        ip,
        name: String(rawName).trim(),
        model: String(rawModel).trim(),
        platform: "roku",
        supportedKeys: allowedKeys,
      };
    } catch (error) {
      return null;
    }
  },
};
