import React, { useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  PanResponder,
  StyleSheet,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { UniversalKey } from "../../network/adapters/UniversalAdapter";
import { ThemeColors } from "../../theme/Colors";

interface CanvasProps {
  handlePress: (key: UniversalKey) => void;
  colors: ThemeColors;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const SwipeCanvasLayout: React.FC<CanvasProps> = ({
  handlePress,
  colors,
  isExpanded,
  onToggleExpand,
}) => {
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderRelease: (evt, gestureState) => {
        const { dx, dy } = gestureState;

        if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
          handlePress(UniversalKey.SELECT);
          return;
        }

        if (Math.abs(dx) > Math.abs(dy)) {
          if (dx > 0) handlePress(UniversalKey.RIGHT);
          else handlePress(UniversalKey.LEFT);
        } else {
          if (dy > 0) handlePress(UniversalKey.DOWN);
          else handlePress(UniversalKey.UP);
        }
      },
    }),
  ).current;

  return (
    <View style={[styles.container, isExpanded && styles.containerExpanded]}>
      <View
        style={[
          styles.canvas,
          { backgroundColor: colors.panel, borderColor: colors.panelBorder },
          isExpanded && styles.canvasExpanded,
        ]}
      >
        {/* 1. Visual Elements Layer */}
        <View style={styles.iconWrapper}>
          <Text
            style={{ color: colors.textSecondary, fontSize: 48, opacity: 0.2 }}
          >
            ✛
          </Text>
        </View>
        <Text
          style={[
            styles.helperText,
            { color: colors.textSecondary, fontFamily: "Inter-Regular" },
          ]}
        >
          Swipe to navigate. Tap to select.
        </Text>

        {/* 2. Gesture Receiver Layer (Absolute Fill to capture swipes, sits UNDER the button) */}
        <View {...panResponder.panHandlers} style={StyleSheet.absoluteFill} />

        {/* 3. Interactive UI Layer (Absolute position, sits OVER the gesture receiver) */}
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={onToggleExpand}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialCommunityIcons
            name={isExpanded ? "arrow-collapse-all" : "arrow-expand-all"}
            size={24}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: "center", width: "100%" },
  containerExpanded: { flex: 1, padding: 24, justifyContent: "center" },
  canvas: {
    width: "100%",
    height: 264,
    borderRadius: 32,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  canvasExpanded: { flex: 1 },
  toggleButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapper: { position: "absolute", alignSelf: "center" },
  helperText: { position: "absolute", bottom: 32, fontSize: 14 },
});
