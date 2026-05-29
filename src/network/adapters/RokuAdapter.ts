// src/network/adapters/RokuAdapter.ts
import { TVAdapter, UniversalKey, UniversalDevice } from "./TVAdapter";

const RokuKeyMap: Record<UniversalKey, string> = {
  [UniversalKey.HOME]: "Home",
  [UniversalKey.PLAY]: "Play",
  [UniversalKey.SELECT]: "Select",
  [UniversalKey.LEFT]: "Left",
  [UniversalKey.RIGHT]: "Right",
  [UniversalKey.UP]: "Up",
  [UniversalKey.DOWN]: "Down",
  [UniversalKey.BACK]: "Back",
  [UniversalKey.POWER]: "Power",
  [UniversalKey.BACKSPACE]: "Backspace", // Map directly to Roku ECP Backspace target
};

const extractXmlTag = (source: string, tag: string): string => {
  const regex = new RegExp(`<${tag}[^>]*>(.*?)</${tag}>`);
  const match = source.match(regex);
  return match && match[1] ? match[1] : "";
};

const decodeXmlEntities = (text: string): string => {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
};

export const RokuAdapter: TVAdapter = {
  platform: "roku",

  sendKey: async (ip: string, key: UniversalKey) => {
    const rokuKey = RokuKeyMap[key];
    if (!rokuKey) return false;

    const url = `http://${ip}:8060/keypress/${rokuKey}`;
    try {
      fetch(url, { method: "POST" }).catch((err) => {
        console.warn(
          `[Network] Keypress fire-and-forget catch: ${err.message}`,
        );
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
        await fetch(url, { method: "POST" });
      }
      return true;
    } catch (error) {
      console.warn(`[Network] TextInput failed: ${error}`);
      return false;
    }
  },

  getDeviceInfo: async (ip: string): Promise<UniversalDevice | null> => {
    try {
      const response = await fetch(`http://${ip}:8060/query/device-info`);
      if (!response.ok) return null;

      const xmlText = await response.text();
      const rawName =
        extractXmlTag(xmlText, "user-device-name") ||
        extractXmlTag(xmlText, "default-device-name") ||
        "Roku Device";
      const rawModel = extractXmlTag(xmlText, "model-name") || "Unknown Model";

      return {
        ip,
        name: decodeXmlEntities(rawName),
        model: decodeXmlEntities(rawModel),
        platform: "roku",
      };
    } catch (error) {
      return null;
    }
  },
};
