import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { UniversalKey, TVApp } from "../../network/adapters/UniversalAdapter";
import { ThemeColors } from "../../theme/Colors";
import { PremiumFeature } from "../PremiumFeature";
import { AppIcon } from "./AppIcon";
import { SwipeCanvasLayout } from "./SwipeCanvasLayout";

interface StandardLayoutProps {
  handlePress: (key: UniversalKey) => void;
  isSupported: (key: UniversalKey) => boolean;
  colors: ThemeColors;
  onOpenKeyboard: () => void;
  apps: TVApp[];
  onLaunchApp: (appId: string) => void;
  navigationStyle: "standard" | "swipe_canvas";
}

export const StandardLayout: React.FC<StandardLayoutProps> = ({
  handlePress,
  isSupported,
  colors,
  onOpenKeyboard,
  apps,
  onLaunchApp,
  navigationStyle,
}) => {
  const [isCanvasExpanded, setIsCanvasExpanded] = useState(false);

  return (
    <>
      <View style={styles.container}>
        <View style={styles.topControlRow}>
          <TouchableOpacity
            style={[
              styles.powerButton,
              { backgroundColor: colors.danger },
              !isSupported(UniversalKey.POWER) && styles.disabledButton,
            ]}
            onPress={() => handlePress(UniversalKey.POWER)}
            disabled={!isSupported(UniversalKey.POWER)}
          >
            <Feather name="power" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <PremiumFeature fallbackMessage="Unlock the native keyboard to type directly on your TV.">
            <TouchableOpacity
              style={[
                styles.premiumToolButton,
                { backgroundColor: colors.accentMuted },
              ]}
              onPress={onOpenKeyboard}
            >
              <MaterialCommunityIcons
                name="keyboard"
                size={18}
                color={colors.accent}
                style={{ marginRight: 8 }}
              />
              <Text style={{ color: colors.accent, fontFamily: "Inter-Bold" }}>
                Keyboard
              </Text>
            </TouchableOpacity>
          </PremiumFeature>
        </View>

        <View style={styles.appLauncherSection}>
          <PremiumFeature fallbackMessage="Unlock the App Launcher with Beam Premium.">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.appLauncherScroll}
              contentContainerStyle={styles.appLauncherContent}
            >
              {apps.map((app) => (
                <AppIcon
                  key={app.id}
                  app={app}
                  onPress={onLaunchApp}
                  colors={colors}
                />
              ))}
            </ScrollView>
          </PremiumFeature>
        </View>

        <View style={styles.row}>
          <TouchableOpacity
            style={[
              styles.pillButton,
              { backgroundColor: colors.panel },
              !isSupported(UniversalKey.BACK) && styles.disabledButton,
            ]}
            onPress={() => handlePress(UniversalKey.BACK)}
            disabled={!isSupported(UniversalKey.BACK)}
          >
            <Feather name="arrow-left" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.pillButton,
              { backgroundColor: colors.panel },
              !isSupported(UniversalKey.HOME) && styles.disabledButton,
            ]}
            onPress={() => handlePress(UniversalKey.HOME)}
            disabled={!isSupported(UniversalKey.HOME)}
          >
            <Feather name="home" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.dpadContainer}>
          {navigationStyle === "swipe_canvas" ? (
            <SwipeCanvasLayout
              isExpanded={false}
              onToggleExpand={() => setIsCanvasExpanded(true)}
              handlePress={handlePress}
              colors={colors}
            />
          ) : (
            <>
              <TouchableOpacity
                style={[
                  styles.dpadButton,
                  styles.dpadUpButton,
                  { backgroundColor: colors.panel },
                  !isSupported(UniversalKey.UP) && styles.disabledButton,
                ]}
                onPress={() => handlePress(UniversalKey.UP)}
                disabled={!isSupported(UniversalKey.UP)}
              >
                <Feather name="chevron-up" size={36} color={colors.textPrimary} />
              </TouchableOpacity>

              <View style={styles.dpadMiddleRow}>
                <TouchableOpacity
                  style={[
                    styles.dpadButton,
                    { backgroundColor: colors.panel },
                    !isSupported(UniversalKey.LEFT) && styles.disabledButton,
                  ]}
                  onPress={() => handlePress(UniversalKey.LEFT)}
                  disabled={!isSupported(UniversalKey.LEFT)}
                >
                  <Feather name="chevron-left" size={36} color={colors.textPrimary} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.okButton,
                    { backgroundColor: colors.accentMuted },
                    !isSupported(UniversalKey.SELECT) && styles.disabledButton,
                  ]}
                  onPress={() => handlePress(UniversalKey.SELECT)}
                  disabled={!isSupported(UniversalKey.SELECT)}
                >
                  <Text
                    style={{
                      color: colors.textPrimary,
                      fontFamily: "Inter-Bold",
                      fontSize: 18,
                    }}
                  >
                    OK
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.dpadButton,
                    { backgroundColor: colors.panel },
                    !isSupported(UniversalKey.RIGHT) && styles.disabledButton,
                  ]}
                  onPress={() => handlePress(UniversalKey.RIGHT)}
                  disabled={!isSupported(UniversalKey.RIGHT)}
                >
                  <Feather
                    name="chevron-right"
                    size={36}
                    color={colors.textPrimary}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.dpadButton,
                  styles.dpadDownButton,
                  { backgroundColor: colors.panel },
                  !isSupported(UniversalKey.DOWN) && styles.disabledButton,
                ]}
                onPress={() => handlePress(UniversalKey.DOWN)}
                disabled={!isSupported(UniversalKey.DOWN)}
              >
                <Feather name="chevron-down" size={36} color={colors.textPrimary} />
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={[styles.mediaIsland, { backgroundColor: colors.panel }]}>
          <TouchableOpacity
            style={[
              styles.mediaBtn,
              !isSupported(UniversalKey.REWIND) && styles.disabledButton,
            ]}
            onPress={() => handlePress(UniversalKey.REWIND)}
            disabled={!isSupported(UniversalKey.REWIND)}
          >
            <Feather name="rewind" size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.mediaBtn,
              styles.playPauseBtn,
              { backgroundColor: colors.accentMuted },
              !isSupported(UniversalKey.PLAY) && styles.disabledButton,
            ]}
            onPress={() => handlePress(UniversalKey.PLAY)}
            disabled={!isSupported(UniversalKey.PLAY)}
          >
            <MaterialCommunityIcons
              name="play-pause"
              size={24}
              color={colors.textPrimary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.mediaBtn,
              !isSupported(UniversalKey.FORWARD) && styles.disabledButton,
            ]}
            onPress={() => handlePress(UniversalKey.FORWARD)}
            disabled={!isSupported(UniversalKey.FORWARD)}
          >
            <Feather name="fast-forward" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={[styles.volumeRockerRow, { backgroundColor: colors.panel }]}>
          <TouchableOpacity
            style={[
              styles.volumeButton,
              !isSupported(UniversalKey.VOL_DOWN) && styles.disabledButton,
            ]}
            onPress={() => handlePress(UniversalKey.VOL_DOWN)}
            disabled={!isSupported(UniversalKey.VOL_DOWN)}
          >
            <Feather name="volume-1" size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.muteButton,
              { borderColor: colors.background },
              !isSupported(UniversalKey.MUTE) && styles.disabledButton,
            ]}
            onPress={() => handlePress(UniversalKey.MUTE)}
            disabled={!isSupported(UniversalKey.MUTE)}
          >
            <Feather name="volume-x" size={22} color={colors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.volumeButton,
              !isSupported(UniversalKey.VOL_UP) && styles.disabledButton,
            ]}
            onPress={() => handlePress(UniversalKey.VOL_UP)}
            disabled={!isSupported(UniversalKey.VOL_UP)}
          >
            <Feather name="volume-2" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {navigationStyle === "swipe_canvas" && (
        <Modal visible={isCanvasExpanded} animationType="slide" transparent={true}>
          <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: 48, paddingBottom: 24, paddingHorizontal: 8 }}>
            <SwipeCanvasLayout
              isExpanded={true}
              onToggleExpand={() => setIsCanvasExpanded(false)}
              handlePress={handlePress}
              colors={colors}
            />
          </View>
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "flex-end" },

  appLauncherSection: {
    marginBottom: 16,
    minHeight: 64,
    justifyContent: "center",
  },
  appLauncherScroll: {},
  appLauncherContent: { paddingVertical: 4 },

  topControlRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  powerButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  premiumToolButton: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  pillButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 24,
    flex: 0.45,
    alignItems: "center",
  },

  dpadContainer: { alignItems: "center", marginBottom: 32 },
  dpadMiddleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dpadButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  dpadUpButton: {
    marginBottom: 12,
  },
  dpadDownButton: {
    marginTop: 12,
  },
  okButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 12,
  },

  mediaIsland: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 32,
    marginBottom: 16,
    padding: 8,
  },
  mediaBtn: { flex: 1, paddingVertical: 16, alignItems: "center" },
  playPauseBtn: { borderRadius: 24, marginHorizontal: 8, paddingVertical: 12 },

  volumeRockerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 32,
    marginBottom: 16,
    padding: 8,
  },
  volumeButton: { flex: 1, paddingVertical: 16, alignItems: "center" },
  muteButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: { opacity: 0.3 },
});
