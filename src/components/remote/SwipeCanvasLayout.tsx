import React, { useRef } from "react";
import { View, Text, PanResponder, StyleSheet } from "react-native";
import { UniversalKey } from "../../network/adapters/UniversalAdapter";
import { ThemeColors } from "../../theme/Colors";

interface CanvasProps {
  handlePress: (key: UniversalKey) => void;
  colors: ThemeColors;
}

export const SwipeCanvasLayout: React.FC<CanvasProps> = ({
  handlePress,
  colors,
}) => {
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderRelease: (evt, gestureState) => {
        const { dx, dy } = gestureState;

        // Tap threshold
        if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
          handlePress(UniversalKey.SELECT);
          return;
        }

        // Horizontal vs Vertical dominance
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
    <View style={styles.container}>
      <View
        {...panResponder.panHandlers}
        style={[
          styles.canvas,
          { backgroundColor: colors.panel, borderColor: colors.panelBorder },
        ]}
      >
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center" },
  canvas: {
    flex: 0.8,
    borderRadius: 32,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapper: { position: "absolute", alignSelf: "center" },
  helperText: { position: "absolute", bottom: 32, fontSize: 14 },
});
