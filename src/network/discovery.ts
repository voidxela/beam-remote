// src/network/discovery.ts
import dgram from "react-native-udp";
import { Buffer } from "buffer";
import { UniversalDevice } from "./adapters/TVAdapter";

const SSDP_ADDRESS = "239.255.255.250";
const SSDP_PORT = 1900;

const SEARCH_MESSAGE = Buffer.from(
  "M-SEARCH * HTTP/1.1\r\n" +
    "Host: 239.255.255.250:1900\r\n" +
    'Man: "ssdp:discover"\r\n' +
    "ST: roku:ecp\r\n\r\n",
);

// Updated Robust Regex
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

const fetchDeviceDetails = async (
  ip: string,
): Promise<UniversalDevice | null> => {
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
      platform: "roku", // Required by the new Universal Protocol
    };
  } catch (error) {
    return null;
  }
};

export const discoverRokus = (
  onDeviceFound: (device: UniversalDevice) => void,
  savedDevices: UniversalDevice[] = [],
) => {
  const socket = dgram.createSocket({ type: "udp4" });
  let pulseInterval: NodeJS.Timeout;
  const processedIps = new Set<string>();

  socket.bind(0, () => {
    const sendPulse = () => {
      socket.send(
        SEARCH_MESSAGE,
        0,
        SEARCH_MESSAGE.length,
        SSDP_PORT,
        SSDP_ADDRESS,
      );
    };

    sendPulse();
    pulseInterval = setInterval(sendPulse, 2500);
  });

  socket.on("message", async (msg, rinfo) => {
    const response = msg.toString();
    const ip = rinfo.address;

    if (response.includes("roku:ecp") && !processedIps.has(ip)) {
      processedIps.add(ip);

      const knownDevice = savedDevices.find((d) => d.ip === ip);
      if (knownDevice) {
        onDeviceFound(knownDevice);
      } else {
        onDeviceFound({
          ip,
          name: ip,
          model: "Fetching details...",
          platform: "roku",
        });
      }

      const freshDetails = await fetchDeviceDetails(ip);
      if (freshDetails) {
        onDeviceFound(freshDetails);
      }
    }
  });

  return () => {
    clearInterval(pulseInterval);
    try {
      socket.close();
    } catch (e) {}
  };
};
