import React, { useEffect } from "react";
import { StatusBar } from "react-native";

import { useBeamStore } from "./src/store/useBeamStore";
import { RokuAdapter } from "./src/network/adapters/RokuAdapter";
import { ToastController } from "./src/components/ToastController";
import { DiscoveryScreen } from "./src/screens/DiscoveryScreen";
import { RemoteScreen } from "./src/screens/RemoteScreen";

export default function App() {
  const { activeIp, lastConnectedIp, setActiveIp } = useBeamStore();

  useEffect(() => {
    const attemptFastBoot = async () => {
      if (!activeIp && lastConnectedIp) {
        const deviceDetails = await RokuAdapter.getDeviceInfo(lastConnectedIp);
        if (deviceDetails) {
          setActiveIp(deviceDetails.ip);
        }
      }
    };
    attemptFastBoot();
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
