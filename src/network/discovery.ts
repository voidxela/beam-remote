import dgram from "react-native-udp";
import { Buffer } from "buffer";
import { UniversalDevice } from "./adapters/UniversalAdapter";
import { RokuAdapter } from "./adapters/RokuAdapter";

const SSDP_ADDRESS = "239.255.255.250";
const SSDP_PORT = 1900;

const SEARCH_MESSAGE = Buffer.from(
  "M-SEARCH * HTTP/1.1\r\n" +
    "Host: 239.255.255.250:1900\r\n" +
    'Man: "ssdp:discover"\r\n' +
    "ST: roku:ecp\r\n\r\n",
);

export const discoverRokus = (
  onDeviceFound: (device: UniversalDevice) => void,
  savedDevices: UniversalDevice[] = [],
) => {
  const socket = dgram.createSocket({ type: "udp4" });
  let pulseInterval: NodeJS.Timeout;
  let isDestroyed = false;
  const processedIps = new Set<string>();

  // Catch asynchronous native socket errors to prevent crashes on network swap
  socket.on("error", (err) => {
    console.warn("[Network] Transient socket error:", err.message);
  });

  socket.bind(0, () => {
    if (isDestroyed) {
      try {
        socket.close();
      } catch (e) {}
      return;
    }

    const sendPulse = () => {
      if (isDestroyed) return;

      try {
        socket.send(
          SEARCH_MESSAGE,
          0,
          SEARCH_MESSAGE.length,
          SSDP_PORT,
          SSDP_ADDRESS,
        );
      } catch (error) {
        console.warn("[Network] Sync send error:", error);
      }
    };

    sendPulse();
    pulseInterval = setInterval(sendPulse, 2500);
  });

  socket.on("message", async (msg, rinfo) => {
    if (isDestroyed) return;

    const response = msg.toString();
    const ip = rinfo.address;

    if (response.includes("roku:ecp") && !processedIps.has(ip)) {
      processedIps.add(ip);

      const knownDevice = savedDevices.find((d) => d.ip === ip);
      if (knownDevice) {
        onDeviceFound(knownDevice);
      } else {
        // Yield a temporary UI state while we fetch the actual XML capabilities
        onDeviceFound({
          ip,
          name: ip,
          model: "Fetching details...",
          platform: "roku",
          supportedKeys: [],
        });
      }

      // Delegate the actual parsing to the adapter to keep this file purely focused on SSDP
      const freshDetails = await RokuAdapter.getDeviceInfo(ip);
      if (freshDetails && !isDestroyed) {
        onDeviceFound(freshDetails);
      }
    }
  });

  return () => {
    isDestroyed = true;
    clearInterval(pulseInterval);
    try {
      socket.close();
    } catch (error) {
      console.warn("[Network] Error safely closing socket:", error);
    }
  };
};
