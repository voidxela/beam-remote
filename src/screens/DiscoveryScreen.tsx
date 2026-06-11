import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  RefreshControl,
} from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { discoverRokus } from "../network/discovery";
import { UniversalDevice } from "../network/adapters/UniversalAdapter";
import { useBeamStore } from "../store/useBeamStore";

export const DiscoveryScreen = () => {
  const {
    activeIp,
    discoveredDevices,
    savedDevices,
    setActiveIp,
    upsertDiscoveredDevice,
    saveDeviceToRoster,
    clearDiscovery,
  } = useBeamStore();

  const [isSearching, setIsSearching] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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

  // Network Swap Listener
  useEffect(() => {
    let networkSettleTimeout: NodeJS.Timeout;

    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.type === "wifi") {
        clearTimeout(networkSettleTimeout);
        networkSettleTimeout = setTimeout(() => {
          setRefreshTrigger((prev) => prev + 1);
        }, 1500);
      }
    });

    return () => {
      unsubscribe();
      clearTimeout(networkSettleTimeout);
    };
  }, []);

  const handleDeviceSelection = (item: UniversalDevice) => {
    saveDeviceToRoster(item);
    setActiveIp(item.ip);
  };

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
            onRefresh={() => setRefreshTrigger((prev) => prev + 1)}
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
};

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
});
