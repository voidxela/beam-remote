import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { TVApp } from "../../network/adapters/UniversalAdapter";
import { ThemeColors } from "../../theme/Colors";

interface AppIconProps {
  app: TVApp;
  onPress: (appId: string) => void;
  colors: ThemeColors;
}

export const AppIcon: React.FC<AppIconProps> = ({ app, onPress, colors }) => {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(app.id)}
    >
      {imageFailed ? (
        <View style={[styles.fallback, { backgroundColor: colors.panel }]}>
          <Text style={[styles.fallbackText, { color: colors.textPrimary }]}>
            {app.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      ) : (
        <Image
          source={{ uri: app.iconUrl }}
          style={[styles.image, { backgroundColor: colors.panel }]}
          onError={() => setImageFailed(true)}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 56,
    height: 56,
    borderRadius: 14,
    overflow: "hidden",
    marginRight: 12,
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: 14,
  },
  fallback: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  fallbackText: {
    fontFamily: "Inter-Bold",
    fontSize: 20,
  },
});
