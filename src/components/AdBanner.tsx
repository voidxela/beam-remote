import React from "react";
import { View, Platform } from "react-native";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";

// 1. Resolve the correct ID based on the OS, falling back to a Test ID for local dev
const adUnitId = __DEV__
  ? TestIds.BANNER
  : Platform.select({
      ios: "ca-app-pub-5426776073908385/6796559397",
      android: "ca-app-pub-5426776073908385/9670134742",
      default: "",
    });

export const AdBanner = () => {
  // Fail safely if somehow the ID didn't resolve
  if (!adUnitId) return null;

  return (
    <View style={{ width: "100%", alignItems: "center" }}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          // Ensure personalized ads are requested only if the user consented (ATT on iOS)
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdFailedToLoad={(error) => {
          console.error("Ad failed to load: ", error);
        }}
      />
    </View>
  );
};
