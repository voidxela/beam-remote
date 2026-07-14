import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Modal,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useMonetizationStore } from "../store/useMonetizationStore";
import { PurchasesPackage } from "react-native-purchases";

interface PremiumFeatureProps {
  children: React.ReactNode;
  fallbackMessage?: string;
}

export const PremiumFeature: React.FC<PremiumFeatureProps> = ({
  children,
  fallbackMessage,
}) => {
  const {
    isPremium,
    packages,
    isPurchasing,
    fetchOfferings,
    purchasePackage,
    restorePurchases,
  } = useMonetizationStore();
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    if (showPaywall) {
      fetchOfferings();
    }
  }, [showPaywall, fetchOfferings]);

  const handleRestore = async () => {
    await restorePurchases();
    setShowPaywall(false);
  };

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

            {packages.length === 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#FFD700" />
                <Text style={styles.loadingText}>Loading plans...</Text>
              </View>
            ) : (
              packages.map((pkg: PurchasesPackage) => {
                const buttonLabel = () => {
                  if (isPurchasing) return null;

                  if (pkg.packageType === "ANNUAL") {
                    return (
                      <View style={styles.subscribeButtonContent}>
                        <View style={styles.trialBadge}>
                          <Text style={styles.trialBadgeText}>
                            7-DAY FREE TRIAL
                          </Text>
                        </View>
                        <Text style={styles.subscribeButtonText}>
                          Then {pkg.product.priceString} / year
                        </Text>
                      </View>
                    );
                  }

                  if (pkg.packageType === "LIFETIME") {
                    return (
                      <Text style={styles.subscribeButtonText}>
                        {pkg.product.priceString} One-Time Payment
                      </Text>
                    );
                  }

                  return (
                    <Text style={styles.subscribeButtonText}>
                      {pkg.product.title} – {pkg.product.priceString}
                    </Text>
                  );
                };

                return (
                  <TouchableOpacity
                    key={pkg.identifier}
                    style={[
                      styles.subscribeButton,
                      isPurchasing && styles.buttonDisabled,
                    ]}
                    onPress={() => purchasePackage(pkg)}
                    disabled={isPurchasing}
                  >
                    {isPurchasing ? (
                      <Text style={styles.subscribeButtonText}>
                        Processing...
                      </Text>
                    ) : (
                      buttonLabel()
                    )}
                  </TouchableOpacity>
                );
              })
            )}

            <TouchableOpacity
              style={[styles.restoreButton, isPurchasing && styles.buttonDisabled]}
              onPress={handleRestore}
              disabled={isPurchasing}
            >
              <Text style={styles.restoreButtonText}>Restore Purchases</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.closeButton, isPurchasing && styles.buttonDisabled]}
              onPress={() => setShowPaywall(false)}
              disabled={isPurchasing}
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
  loadingContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  loadingText: {
    color: "#888888",
    fontSize: 14,
    marginTop: 8,
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
  subscribeButtonContent: {
    alignItems: "center",
    gap: 6,
  },
  trialBadge: {
    backgroundColor: "#2E7D32",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  trialBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  restoreButton: { padding: 12, marginBottom: 8 },
  restoreButtonText: { color: "#FFD700", fontSize: 14 },
  buttonDisabled: { opacity: 0.5 },
  closeButton: { padding: 12 },
  closeButtonText: { color: "#888888", fontSize: 14 },
});
