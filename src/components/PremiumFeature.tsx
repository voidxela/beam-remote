import React, { useState } from "react";
import { View, TouchableOpacity, Modal, Text, StyleSheet } from "react-native";
import { useMonetizationStore } from "../store/useMonetizationStore";

interface PremiumFeatureProps {
  children: React.ReactNode;
  fallbackMessage?: string;
}

export const PremiumFeature: React.FC<PremiumFeatureProps> = ({
  children,
  fallbackMessage,
}) => {
  const { isPremium } = useMonetizationStore();
  const [showPaywall, setShowPaywall] = useState(false);

  // If they paid, render the children normally without any wrappers
  if (isPremium) {
    return <>{children}</>;
  }

  // If free tier, intercept the touch event
  return (
    <>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setShowPaywall(true)}
      >
        {/* pointerEvents="none" prevents the child buttons from receiving the tap */}
        <View pointerEvents="none">{children}</View>
      </TouchableOpacity>

      <Modal visible={showPaywall} transparent={true} animationType="slide">
        <View style={styles.paywallOverlay}>
          <View style={styles.paywallContent}>
            <Text style={styles.paywallTitle}>Beam Premium</Text>
            <Text style={styles.paywallText}>
              {fallbackMessage ||
                "Unlock this feature, remove ads, and access universal controls with Beam Premium."}
            </Text>

            <TouchableOpacity
              style={styles.subscribeButton}
              onPress={() => {
                // Future integration: RevenueCat trigger goes here
                setShowPaywall(false);
              }}
            >
              <Text style={styles.subscribeButtonText}>View Plans</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowPaywall(false)}
            >
              <Text style={styles.closeButtonText}>Not right now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  paywallOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  paywallContent: {
    backgroundColor: "#1A1A1A",
    padding: 32,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    alignItems: "center",
  },
  paywallTitle: {
    color: "#FFD700",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  paywallText: {
    color: "#CCCCCC",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  subscribeButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 24,
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
  },
  subscribeButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  closeButton: { padding: 12 },
  closeButtonText: { color: "#888888", fontSize: 14 },
});
