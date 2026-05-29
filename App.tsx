// App.tsx
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  RefreshControl,
  Modal,
  TextInput,
} from "react-native";

// Network & Adapters
import { discoverRokus } from "./src/network/discovery";
import { RokuAdapter } from "./src/network/adapters/RokuAdapter";
import {
  UniversalKey,
  UniversalDevice,
} from "./src/network/adapters/TVAdapter";

// State & UI Components
import { useBeamStore } from "./src/store/useBeamStore";
import { useMonetizationStore } from "./src/store/useMonetizationStore";
import { PremiumFeature } from "./src/components/PremiumFeature";
import { AdBanner } from "./src/components/AdBanner";

export default function App() {
  const {
    activeIp,
    lastConnectedIp,
    discoveredDevices,
    savedDevices,
    setActiveIp,
    upsertDiscoveredDevice,
    saveDeviceToRoster,
    clearDiscovery,
  } = useBeamStore();

  const { isPremium } = useMonetizationStore();

  const [isSearching, setIsSearching] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Initialize with a single "Dummy Space" to fix the Android empty-backspace bug
  const [keyboardBuffer, setKeyboardBuffer] = useState(" ");
  const textInputRef = useRef<TextInput>(null);

  const activeDevice =
    discoveredDevices.find((d) => d.ip === activeIp) ||
    savedDevices.find((d) => d.ip === activeIp);

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

  useEffect(() => {
    if (activeIp) return;

    setIsSearching(true);
    clearDiscovery();

    const stopDiscovery = discoverRokus((device: UniversalDevice) => {
      upsertDiscoveredDevice(device);
    }, savedDevices);

    const searchTimeout = setTimeout(() => {
      setIsSearching(false);
      stopDiscovery();
    }, 8000);

    return () => {
      clearTimeout(searchTimeout);
      stopDiscovery();
    };
  }, [activeIp, refreshTrigger]);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleDeviceSelection = (item: UniversalDevice) => {
    saveDeviceToRoster(item);
    setActiveIp(item.ip);
  };

  const handlePress = (key: UniversalKey) => {
    if (activeIp) {
      RokuAdapter.sendKey(activeIp, key);
    }
  };

  // --------------------------------------------------------
  // THE DUMMY SPACE EMITTER ENGINE
  // --------------------------------------------------------
  const handleInputChange = (text: string) => {
    if (!activeIp) return;

    if (text === "") {
      // The dummy space was deleted -> User pressed Backspace
      RokuAdapter.sendKey(activeIp, UniversalKey.BACKSPACE);
      setKeyboardBuffer(" ");
    } else if (text.length > 1) {
      // A character was added after the dummy space
      const addedChars = text.slice(1);
      RokuAdapter.sendText(activeIp, addedChars);
      setKeyboardBuffer(" ");
    }
  };

  if (!activeIp) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Select a TV</Text>
          <Text style={styles.subtitleText}>Pull down to refresh network</Text>
        </View>
        <FlatList
          data={discoveredDevices}
          keyExtractor={(item) => item.ip}
          contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
          refreshControl={
            <RefreshControl
              refreshing={isSearching}
              onRefresh={handleRefresh}
              tintColor="#4CAF50"
              colors={["#4CAF50"]}
              progressBackgroundColor="#1A1A1A"
              progressViewOffset={20}
            />
          }
          ListEmptyComponent={
            !isSearching ? (
              <Text style={styles.emptyStatusText}>
                No TVs found on this network.
              </Text>
            ) : null
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.deviceButton}
              onPress={() => handleDeviceSelection(item)}
            >
              <View style={styles.deviceInfoRow}>
                <Text style={styles.deviceNameText}>{item.name}</Text>
                <Text style={styles.deviceModelText}>{item.model}</Text>
              </View>
              <Text style={styles.deviceIpText}>{item.ip}</Text>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Beam MVP</Text>
        <TouchableOpacity onPress={() => setIsMenuVisible(true)}>
          <Text style={styles.activeDeviceText}>
            {activeDevice?.name || activeIp}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Device Info Modal */}
      <Modal visible={isMenuVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {activeDevice?.name || "Unknown Device"}
            </Text>
            <Text style={styles.modalSubtext}>
              IP Address: {activeDevice?.ip}
            </Text>
            <Text style={styles.modalSubtext}>
              Model: {activeDevice?.model}
            </Text>

            <TouchableOpacity
              style={styles.disconnectButton}
              onPress={() => {
                setIsMenuVisible(false);
                setActiveIp(null);
              }}
            >
              <Text style={styles.disconnectButtonText}>Disconnect</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setIsMenuVisible(false)}
            >
              <Text style={styles.closeModalText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Keyboard Input Modal */}
      <Modal
        visible={isKeyboardVisible}
        transparent={true}
        animationType="fade" // Fade is smoother for a floating modal
        onShow={() => {
          // Delay focus slightly so the OS doesn't swallow the request
          setTimeout(() => {
            textInputRef.current?.focus();
          }, 100);
        }}
      >
        <TouchableOpacity
          style={styles.keyboardModalOverlay}
          activeOpacity={1}
          onPress={() => textInputRef.current?.focus()}
        >
          <View style={styles.keyboardModalContent}>
            <Text style={styles.modalTitle}>Live TV Keyboard</Text>
            <Text style={styles.keyboardInstructions}>
              Keystrokes are sent instantly. Autocorrect is disabled.
            </Text>

            {/* The Visible Emitter Target */}
            <View style={styles.emitterContainer}>
              <TextInput
                ref={textInputRef}
                style={styles.emitterInputStyle}
                value={keyboardBuffer}
                onChangeText={handleInputChange}
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                autoComplete="off"
                keyboardType="visible-password"
                caretHidden={true}
              />
              <View style={styles.emitterOverlay} pointerEvents="none">
                <Text style={styles.emitterOverlayText}>
                  Keyboard Active 🟢
                </Text>
              </View>
            </View>

            <View style={styles.keyboardButtonRow}>
              <TouchableOpacity
                style={[
                  styles.keyboardActionButton,
                  { backgroundColor: "#333333", flex: 1 },
                ]}
                onPress={() => {
                  setIsKeyboardVisible(false);
                  setKeyboardBuffer(" ");
                }}
              >
                <Text style={styles.buttonText}>Close Keyboard</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      <View style={styles.remoteBody}>
        <View style={styles.topControlRow}>
          <PremiumFeature fallbackMessage="Unlock the native keyboard to type directly on your TV.">
            <TouchableOpacity
              style={styles.premiumToolButton}
              onPress={() => setIsKeyboardVisible(true)}
            >
              <Text style={styles.premiumToolText}>⌨️ Keyboard</Text>
            </TouchableOpacity>
          </PremiumFeature>
        </View>

        <View style={styles.row}>
          <TouchableOpacity
            style={styles.pillButton}
            onPress={() => handlePress(UniversalKey.BACK)}
          >
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.pillButton}
            onPress={() => handlePress(UniversalKey.HOME)}
          >
            <Text style={styles.buttonText}>Home</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dpadContainer}>
          <TouchableOpacity
            style={styles.dpadButton}
            onPress={() => handlePress(UniversalKey.UP)}
          >
            <Text style={styles.buttonText}>Up</Text>
          </TouchableOpacity>

          <View style={styles.dpadMiddleRow}>
            <TouchableOpacity
              style={styles.dpadButton}
              onPress={() => handlePress(UniversalKey.LEFT)}
            >
              <Text style={styles.buttonText}>Left</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dpadButton, styles.selectButton]}
              onPress={() => handlePress(UniversalKey.SELECT)}
            >
              <Text style={styles.buttonText}>OK</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dpadButton}
              onPress={() => handlePress(UniversalKey.RIGHT)}
            >
              <Text style={styles.buttonText}>Right</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.dpadButton}
            onPress={() => handlePress(UniversalKey.DOWN)}
          >
            <Text style={styles.buttonText}>Down</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => handlePress(UniversalKey.PLAY)}
          >
            <Text style={styles.buttonText}>Play / Pause</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={[styles.adBannerContainer, isPremium && styles.adBannerHidden]}
      >
        {!isPremium && <AdBanner />}
      </View>
    </SafeAreaView>
  );
}

// --------------------------------------------------------
// STYLES
// --------------------------------------------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
  header: {
    padding: 24,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#1A1A1A",
  },
  title: { color: "#FFFFFF", fontSize: 24, fontWeight: "bold" },
  subtitleText: {
    color: "#888888",
    fontSize: 13,
    marginTop: 8,
    fontStyle: "italic",
  },
  emptyStatusText: { color: "#888888", textAlign: "center", marginTop: 40 },
  activeDeviceText: {
    color: "#4CAF50",
    marginTop: 8,
    fontWeight: "600",
    fontSize: 16,
  },

  // Standard Modal Overlay for Device Info
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#1A1A1A",
    padding: 24,
    borderRadius: 16,
    width: "100%",
    alignItems: "center",
  },

  // Specific Floating Modal Overlay for Keyboard
  keyboardModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: "20%",
  },
  keyboardModalContent: {
    backgroundColor: "#1A1A1A",
    padding: 32,
    borderRadius: 16,
    width: "100%",
    alignItems: "center",
  },

  modalTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  modalSubtext: { color: "#888888", fontSize: 14, marginBottom: 4 },
  disconnectButton: {
    backgroundColor: "#FF5252",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
    marginTop: 24,
    width: "100%",
    alignItems: "center",
  },
  disconnectButtonText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 16 },
  closeModalButton: { marginTop: 16, padding: 12 },
  closeModalText: { color: "#888888", fontSize: 16 },

  keyboardInstructions: {
    color: "#888888",
    fontSize: 14,
    marginBottom: 24,
    fontStyle: "italic",
    textAlign: "center",
  },

  // The Emitter Layout Container
  emitterContainer: {
    width: "100%",
    height: 60,
    marginBottom: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
    borderWidth: 1,
    borderColor: "#4CAF50",
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
  emitterOverlayText: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "600",
  },

  keyboardButtonRow: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  keyboardActionButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  deviceButton: {
    backgroundColor: "#1A1A1A",
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
  },
  deviceInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  deviceNameText: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold" },
  deviceModelText: { color: "#888888", fontSize: 14, fontWeight: "500" },
  deviceIpText: { color: "#555555", fontSize: 13, fontFamily: "monospace" },

  // paddingBottom fully removed as requested
  remoteBody: { flex: 1, justifyContent: "flex-end", paddingHorizontal: 24 },

  topControlRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 24,
  },
  premiumToolButton: {
    backgroundColor: "#1A1A1A",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
  },
  premiumToolText: { color: "#FFD700", fontWeight: "bold" },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  pillButton: {
    backgroundColor: "#1A1A1A",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 24,
    flex: 0.45,
    alignItems: "center",
  },
  playButton: {
    backgroundColor: "#1A1A1A",
    paddingVertical: 16,
    borderRadius: 24,
    flex: 1,
    alignItems: "center",
  },

  dpadContainer: { alignItems: "center", marginBottom: 32 },
  dpadMiddleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  dpadButton: {
    backgroundColor: "#1A1A1A",
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 12,
  },
  selectButton: { backgroundColor: "#333333" },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "500" },

  adBannerContainer: {
    height: 90,
    width: "100%",
    backgroundColor: "#050505",
    borderTopWidth: 1,
    borderTopColor: "#111111",
    justifyContent: "center",
    alignItems: "center",
  },
  adBannerHidden: { backgroundColor: "transparent", borderTopWidth: 0 },
});
