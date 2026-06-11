import React, { useEffect, useState, useRef } from "react";
import { Animated, Text, StyleSheet, DeviceEventEmitter } from "react-native";

export type ToastCategory = "error" | "info" | "success";

export const ToastController = () => {
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState<ToastCategory>("info");
  const translateY = useRef(new Animated.Value(-100)).current;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      "SHOW_TOAST",
      (event: { message: string; type?: ToastCategory }) => {
        setMessage(event.message);
        setCategory(event.type || "info");

        // Slide In
        Animated.spring(translateY, {
          toValue: 50,
          useNativeDriver: true,
        }).start();

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        // Auto-hide after 3 seconds
        timeoutRef.current = setTimeout(() => {
          Animated.timing(translateY, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }, 3000);
      },
    );

    return () => {
      subscription.remove();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const getBackgroundColor = () => {
    switch (category) {
      case "error":
        return "#FF5252";
      case "success":
        return "#4CAF50";
      case "info":
      default:
        return "#2196F3";
    }
  };

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        { transform: [{ translateY }], backgroundColor: getBackgroundColor() },
      ]}
      pointerEvents="none"
    >
      <Text style={styles.toastText}>
        {category === "error" ? "⚠️ " : ""}
        {message}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: "absolute",
    top: 0,
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    zIndex: 9999,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  toastText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
});
