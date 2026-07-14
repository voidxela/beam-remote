import React, { useEffect } from "react";
import { Platform, StatusBar } from "react-native";
import Purchases, { LOG_LEVEL } from "react-native-purchases";

import { useBeamStore } from "./src/store/useBeamStore";
import { useMonetizationStore } from "./src/store/useMonetizationStore";
import { RokuAdapter } from "./src/network/adapters/RokuAdapter";
import { ToastController } from "./src/components/ToastController";
import { DiscoveryScreen } from "./src/screens/DiscoveryScreen";
import { RemoteScreen } from "./src/screens/RemoteScreen";

export default function App() {
  const { activeIp, lastConnectedIp, setActiveIp } = useBeamStore();
  const { checkPremiumStatus } = useMonetizationStore();

  useEffect(() => {
    const boot = async () => {
      // Configure RevenueCat
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      Purchases.configure({
        apiKey: Platform.select({
          ios: "api_key_apple",
          android: "api_key_google",
        }) as string,
      });

      // Hydrate premium state on zero-frame boot
      await checkPremiumStatus();

      // Existing fast-boot logic
      if (!activeIp && lastConnectedIp) {
        const deviceDetails = await RokuAdapter.getDeviceInfo(lastConnectedIp);
        if (deviceDetails) {
          setActiveIp(deviceDetails.ip);
        }
      }
    };
    boot();
  }, []);

  return (
    <>
      <StatusBar barStyle="light-content" />

      {activeIp ? <RemoteScreen /> : <DiscoveryScreen />}

      {/* Toast controller overlays the active screen */}
      <ToastController />
    </>
  );
}
