import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
  TextInput,
  DeviceEventEmitter,
  Platform,
  StatusBar,
} from "react-native";
import NetInfo from "@react-native-community/netinfo";

import { AdapterRegistry } from "../network/adapters/AdapterRegistry";
import { UniversalKey } from "../network/adapters/UniversalAdapter";
import { useBeamStore } from "../store/useBeamStore";
import { useMonetizationStore } from "../store/useMonetizationStore";
import { usePreferencesStore } from "../store/usePreferencesStore";
import { Colors } from "../theme/Colors";

import { AdBanner } from "../components/AdBanner";
import { StandardLayout } from "../components/remote/StandardLayout";
import { SwipeCanvasLayout } from "../components/remote/SwipeCanvasLayout";
import { SettingsModal } from "../components/settings/SettingsModal";

export const RemoteScreen = () => {
  const {
    activeIp,
    discoveredDevices,
    savedDevices,
    setActiveIp,
    isDeviceConnected,
    setIsDeviceConnected,
  } = useBeamStore();
  const { isPremium, toggleDevPremium } = useMonetizationStore();
  const { theme, navigation } = usePreferencesStore();

  const activeColors = Colors[theme];

  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardBuffer, setKeyboardBuffer] = useState(" ");

  const textInputRef = useRef<TextInput>(null);
  const tapCount = useRef(0);
  const tapTimeout = useRef<NodeJS.Timeout | null>(null);

  const activeDevice =
    discoveredDevices.find((d) => d.ip === activeIp) ||
    savedDevices.find((d) => d.ip === activeIp);

  // BUG FIX: Graceful degradation. If capabilities haven't mapped yet, assume true.
  const isSupported = (key: UniversalKey) => {
    if (!activeDevice) return false;
    if (!activeDevice.supportedKeys || activeDevice.supportedKeys.length === 0)
      return true;
    return activeDevice.supportedKeys.includes(key);
  };

  useEffect(() => {
    let isMounted = true;
    let heartbeatTimeout: NodeJS.Timeout;

    const unsubscribe = NetInfo.addEventListener((state) => {
      if (!state.isConnected) {
        DeviceEventEmitter.emit("SHOW_TOAST", {
          message: "Network offline. Device may be unreachable.",
          type: "error",
        });
      }
    });

    const pingTV = async () => {
      if (!activeDevice) return;
      const freshDeviceState = await AdapterRegistry.pingDevice(activeDevice);
      if (isMounted) {
        setIsDeviceConnected(!!freshDeviceState);
      }
      heartbeatTimeout = setTimeout(pingTV, 4000);
    };

    pingTV();

    return () => {
      isMounted = false;
      unsubscribe();
      clearTimeout(heartbeatTimeout);
    };
  }, [activeDevice, setIsDeviceConnected]);

  const handleSecretDevTap = () => {
    tapCount.current += 1;
    if (tapCount.current >= 5) {
      toggleDevPremium();
      tapCount.current = 0;
      DeviceEventEmitter.emit("SHOW_TOAST", {
        message: "Dev Mode: Premium Toggled",
        type: "success",
      });
    }

    if (tapTimeout.current) clearTimeout(tapTimeout.current);
    tapTimeout.current = setTimeout(() => {
      tapCount.current = 0;
    }, 1500);
  };

  const handlePress = (key: UniversalKey) => {
    if (activeDevice && isSupported(key)) {
      AdapterRegistry.sendKey(activeDevice, key);
    }
  };

  const handleInputChange = (text: string) => {
    if (!activeDevice) return;
    if (text === "") {
      AdapterRegistry.sendKey(activeDevice, UniversalKey.BACKSPACE);
      setKeyboardBuffer(" ");
    } else if (text.length > 1) {
      const addedChars = text.slice(1);
      AdapterRegistry.sendText(activeDevice, addedChars);
      setKeyboardBuffer(" ");
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: activeColors.background }]}
    >
      <View
        style={[styles.header, { borderBottomColor: activeColors.panelBorder }]}
      >
        <View style={styles.headerTitleRow}>
          <TouchableOpacity activeOpacity={1} onPress={handleSecretDevTap}>
            <Text style={[styles.title, { color: activeColors.textPrimary }]}>
              Beam
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: activeColors.panel }]}
            onPress={() => setIsMenuVisible(true)}
          >
            <Text style={{ color: activeColors.textPrimary }}>⚙️</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.deviceStatusContainer}>
          <Text
            style={[
              styles.activeDeviceText,
              {
                color: isDeviceConnected
                  ? activeColors.success
                  : activeColors.danger,
              },
            ]}
          >
            {isDeviceConnected ? "🟢 " : "🔴 "}
            {activeDevice?.name || activeIp}
          </Text>
          {!isDeviceConnected && (
            <Text
              style={[
                styles.reconnectingSubtext,
                { color: activeColors.textSecondary },
              ]}
            >
              Reconnecting...
            </Text>
          )}
        </View>
      </View>

      <View style={styles.remoteBody}>
        {navigation === "standard" ? (
          <StandardLayout
            handlePress={handlePress}
            isSupported={isSupported}
            colors={activeColors}
            onOpenKeyboard={() => setIsKeyboardVisible(true)}
          />
        ) : (
          <SwipeCanvasLayout handlePress={handlePress} colors={activeColors} />
        )}
      </View>

      <SettingsModal
        visible={isMenuVisible}
        activeDevice={activeDevice}
        onClose={() => setIsMenuVisible(false)}
        onDisconnect={() => setActiveIp(null)}
      />

      <Modal
        visible={isKeyboardVisible}
        transparent={true}
        animationType="fade"
        onShow={() => {
          setTimeout(() => {
            textInputRef.current?.focus();
          }, 100);
        }}
      >
        <View style={styles.keyboardModalOverlay}>
          <View
            style={[
              styles.keyboardModalContent,
              { backgroundColor: activeColors.panel },
            ]}
          >
            <Text
              style={[styles.modalTitle, { color: activeColors.textPrimary }]}
            >
              Native Keyboard
            </Text>
            <Text
              style={[
                styles.keyboardInstructions,
                { color: activeColors.textSecondary },
              ]}
            >
              Type normally. Text is instantly sent to the TV.
            </Text>

            <View
              style={[
                styles.emitterContainer,
                {
                  borderColor: activeColors.success,
                  backgroundColor: activeColors.background,
                },
              ]}
            >
              <View style={styles.emitterOverlay}>
                <Text
                  style={[
                    styles.emitterOverlayText,
                    { color: activeColors.success },
                  ]}
                >
                  {keyboardBuffer === " " ? "Start Typing..." : "Sending..."}
                </Text>
              </View>
              <TextInput
                ref={textInputRef}
                style={styles.emitterInputStyle}
                value={keyboardBuffer}
                onChangeText={handleInputChange}
                autoCorrect={false}
                autoCapitalize="none"
                keyboardAppearance={theme === "obsidian" ? "dark" : "light"}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.closeModalButton,
                { backgroundColor: activeColors.background },
              ]}
              onPress={() => setIsKeyboardVisible(false)}
            >
              <Text
                style={[
                  styles.closeModalText,
                  { color: activeColors.textPrimary },
                ]}
              >
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View
        style={[
          styles.adBannerContainer,
          !isPremium
            ? {
                backgroundColor: activeColors.background,
                borderTopColor: activeColors.panelBorder,
              }
            : { backgroundColor: "transparent", borderTopColor: "transparent" },
        ]}
      >
        {!isPremium && <AdBanner />}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 24 : 0,
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 24, fontWeight: "bold" },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  deviceStatusContainer: { alignItems: "center", marginTop: 8 },
  activeDeviceText: { fontWeight: "600", fontSize: 14 },
  reconnectingSubtext: { fontSize: 12, marginTop: 4, fontStyle: "italic" },

  remoteBody: { flex: 1, justifyContent: "flex-end", paddingHorizontal: 24 },

  keyboardModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: "20%",
  },
  keyboardModalContent: {
    padding: 32,
    borderRadius: 16,
    width: "100%",
    alignItems: "center",
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 8 },
  keyboardInstructions: { fontSize: 14, marginBottom: 24, textAlign: "center" },
  emitterContainer: {
    width: "100%",
    height: 60,
    marginBottom: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
  },
  emitterInputStyle: {
    position: "absolute",
    width: "100%",
    height: "100%",
    color: "transparent",
  },
  emitterOverlay: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  emitterOverlayText: { fontSize: 16, fontWeight: "600" },
  closeModalButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
    width: "100%",
    alignItems: "center",
  },
  closeModalText: { fontWeight: "bold", fontSize: 16 },

  adBannerContainer: {
    height: 90,
    width: "100%",
    borderTopWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
