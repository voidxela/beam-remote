import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
  ScrollView,
  Platform,
  StatusBar,
} from "react-native";
import { usePreferencesStore } from "../../store/usePreferencesStore";
import { useMonetizationStore } from "../../store/useMonetizationStore";
import { Colors } from "../../theme/Colors";
import { PremiumFeature } from "../PremiumFeature";
import { UniversalDevice } from "../../network/adapters/UniversalAdapter";

interface SettingsModalProps {
  visible: boolean;
  activeDevice?: UniversalDevice;
  onClose: () => void;
  onDisconnect: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  activeDevice,
  onClose,
  onDisconnect,
}) => {
  const { theme, navigation, setTheme, setNavigation } = usePreferencesStore();
  const { isPremium } = useMonetizationStore();

  const activeColors = Colors[theme];

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View
        style={[styles.container, { backgroundColor: activeColors.background }]}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <View
            style={[
              styles.header,
              { borderBottomColor: activeColors.panelBorder },
            ]}
          >
            <Text
              style={[
                styles.title,
                { color: activeColors.textPrimary, fontFamily: "Inter-Bold" },
              ]}
            >
              Settings
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text
                style={{
                  color: activeColors.textSecondary,
                  fontFamily: "Inter-Medium",
                }}
              >
                Done
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollContent}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {/* Appearance Section */}
            <View style={styles.section}>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: activeColors.textSecondary,
                    fontFamily: "Inter-Medium",
                  },
                ]}
              >
                APPEARANCE
              </Text>

              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: activeColors.panel,
                    borderColor: activeColors.panelBorder,
                  },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.row,
                    {
                      borderBottomColor: activeColors.panelBorder,
                      borderBottomWidth: 1,
                    },
                  ]}
                  onPress={() => setTheme("midnight", isPremium)}
                >
                  <Text
                    style={{
                      color: activeColors.textPrimary,
                      fontFamily: "Inter-Regular",
                    }}
                  >
                    Midnight (Deep Navy)
                  </Text>
                  {theme === "midnight" && (
                    <Text style={{ color: activeColors.accent }}>✓</Text>
                  )}
                </TouchableOpacity>

                <PremiumFeature fallbackMessage="Unlock the Obsidian OLED theme with Beam Premium.">
                  <TouchableOpacity
                    style={styles.row}
                    onPress={() => setTheme("obsidian", isPremium)}
                  >
                    <Text
                      style={{
                        color: activeColors.textPrimary,
                        fontFamily: "Inter-Regular",
                      }}
                    >
                      Obsidian (OLED Black)
                    </Text>
                    {theme === "obsidian" && (
                      <Text style={{ color: activeColors.accent }}>✓</Text>
                    )}
                  </TouchableOpacity>
                </PremiumFeature>
              </View>
            </View>

            {/* Interaction Section */}
            <View style={styles.section}>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: activeColors.textSecondary,
                    fontFamily: "Inter-Medium",
                  },
                ]}
              >
                INTERACTION
              </Text>

              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: activeColors.panel,
                    borderColor: activeColors.panelBorder,
                  },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.row,
                    {
                      borderBottomColor: activeColors.panelBorder,
                      borderBottomWidth: 1,
                    },
                  ]}
                  onPress={() => setNavigation("standard", isPremium)}
                >
                  <View>
                    <Text
                      style={{
                        color: activeColors.textPrimary,
                        fontFamily: "Inter-Regular",
                      }}
                    >
                      Standard UI
                    </Text>
                    <Text
                      style={{
                        color: activeColors.textSecondary,
                        fontSize: 12,
                        marginTop: 4,
                        fontFamily: "Inter-Regular",
                      }}
                    >
                      Familiar button layout
                    </Text>
                  </View>
                  {navigation === "standard" && (
                    <Text style={{ color: activeColors.accent }}>✓</Text>
                  )}
                </TouchableOpacity>

                <PremiumFeature fallbackMessage="Unlock the invisible swipe canvas navigation with Beam Premium.">
                  <TouchableOpacity
                    style={styles.row}
                    onPress={() => setNavigation("swipe_canvas", isPremium)}
                  >
                    <View>
                      <Text
                        style={{
                          color: activeColors.textPrimary,
                          fontFamily: "Inter-Regular",
                        }}
                      >
                        Swipe Canvas
                      </Text>
                      <Text
                        style={{
                          color: activeColors.textSecondary,
                          fontSize: 12,
                          marginTop: 4,
                          fontFamily: "Inter-Regular",
                        }}
                      >
                        Invisible gesture-based navigation
                      </Text>
                    </View>
                    {navigation === "swipe_canvas" && (
                      <Text style={{ color: activeColors.accent }}>✓</Text>
                    )}
                  </TouchableOpacity>
                </PremiumFeature>
              </View>
            </View>

            {/* Connection Section */}
            <View style={styles.section}>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: activeColors.textSecondary,
                    fontFamily: "Inter-Medium",
                  },
                ]}
              >
                DEVICE CONNECTION
              </Text>

              {activeDevice && (
                <View
                  style={[
                    styles.deviceInfoCard,
                    {
                      backgroundColor: activeColors.panel,
                      borderColor: activeColors.panelBorder,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.deviceName,
                      { color: activeColors.textPrimary },
                    ]}
                  >
                    {activeDevice.name}
                  </Text>
                  <Text
                    style={[
                      styles.deviceMeta,
                      { color: activeColors.textSecondary },
                    ]}
                  >
                    Model: {activeDevice.model}
                  </Text>
                  <Text
                    style={[
                      styles.deviceMeta,
                      { color: activeColors.textSecondary },
                    ]}
                  >
                    IP: {activeDevice.ip}
                  </Text>
                  <Text
                    style={[
                      styles.deviceMeta,
                      {
                        color: activeColors.textSecondary,
                        textTransform: "capitalize",
                      },
                    ]}
                  >
                    Platform: {activeDevice.platform}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.disconnectBtn,
                  { backgroundColor: activeColors.danger },
                ]}
                onPress={() => {
                  onClose();
                  onDisconnect();
                }}
              >
                <Text style={{ color: "#FFFFFF", fontFamily: "Inter-Bold" }}>
                  Disconnect Device
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 24 : 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    borderBottomWidth: 1,
  },
  title: { fontSize: 20 },
  closeBtn: { paddingVertical: 8, paddingLeft: 16 },
  scrollContent: { flex: 1, padding: 24 },
  section: { marginBottom: 32 },
  sectionTitle: {
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 12,
    textTransform: "uppercase",
  },
  card: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  deviceInfoCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  deviceName: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  deviceMeta: { fontSize: 13, marginBottom: 4 },
  disconnectBtn: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
});
