import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  Text,
  Pressable,
  View,
  Animated,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useFocusEffect, router } from "expo-router";

import { db } from "@/db";
import { people as peopleTable } from "@/db/schema";
import { desc } from "drizzle-orm";
import { getSyncKey } from "@/lib/sync/key";
import { performSync } from "@/lib/sync/sync";
import { CalendarSettingsSection } from "@/components/CalendarSettingsSection";

export default function SettingsScreen() {
  const [syncKey, setSyncKeyState] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copied, setCopied] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const loadSyncKey = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const key = await getSyncKey();
      setSyncKeyState(key);
    } catch (err) {
      console.error("Error loading sync key", err);
      setError("Failed to load sync key");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadLastSync = useCallback(async () => {
    try {
      const result = await db
        .select()
        .from(peopleTable)
        .orderBy(desc(peopleTable.syncedAt))
        .limit(1);

      if (result.length > 0 && result[0].syncedAt) {
        const value = result[0].syncedAt;
        const date = value instanceof Date ? value : new Date(value);
        if (!isNaN(date.getTime())) {
          setLastSync(date);
        }
      }
    } catch (err) {
      console.error("Error loading last sync:", err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSyncKey();
      loadLastSync();
    }, [loadSyncKey, loadLastSync]),
  );

  const handleCopyKey = async () => {
    if (!syncKey || isLoading) return;

    try {
      await Clipboard.setStringAsync(syncKey);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      setCopied(true);
      fadeAnim.setValue(0);

      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.delay(1500),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCopied(false);
      });
    } catch (err) {
      console.error("Error copying key", err);
    }
  };

  const handleSync = async () => {
    if (!syncKey) {
      setError("No sync key available");
      return;
    }
    setIsSyncing(true);
    setError(null);
    try {
      await performSync(syncKey);
      await loadLastSync();
      Alert.alert("Success", "Sync completed successfully");
    } catch (err) {
      console.error("Sync failed", err);
      const message = err instanceof Error ? err.message : "Sync failed";
      setError(message);
      Alert.alert("Sync Failed", message);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#D9D9D9" }}
      contentContainerStyle={{
        paddingHorizontal: 14,
        gap: 16,
        paddingBottom: 40,
      }}
    >
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>Settings</Text>

      <View style={{ gap: 8 }}>
        <Text style={{ fontSize: 16, fontWeight: "600" }}>Sync Key</Text>
        <Pressable
          onPress={handleCopyKey}
          disabled={isLoading || !syncKey}
          style={{
            backgroundColor: "#f0f0f0",
            padding: 12,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#ddd",
            minHeight: 50,
            justifyContent: "center",
            opacity: isLoading || !syncKey ? 0.6 : 1,
          }}
        >
          {isLoading ? (
            <ActivityIndicator />
          ) : (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
                  flex: 1,
                }}
                numberOfLines={2}
              >
                {syncKey ?? "Not available"}
              </Text>
              {copied && (
                <Animated.View
                  style={{
                    opacity: fadeAnim,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#34C759",
                      fontWeight: "600",
                    }}
                  >
                    ✓
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#34C759",
                      fontWeight: "600",
                    }}
                  >
                    Copied
                  </Text>
                </Animated.View>
              )}
            </View>
          )}
        </Pressable>
        <Text style={{ fontSize: 12, color: "#666" }}>
          Tap the sync key to copy it.
        </Text>
        <Pressable
          onPress={() => router.push("/change-sync-key")}
          style={{
            backgroundColor: "#007AFF",
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 8,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>
            Change sync key
          </Text>
        </Pressable>
      </View>

      {lastSync && (
        <Text style={{ fontSize: 12, color: "#666" }}>
          Last synced: {lastSync.toLocaleString()}
        </Text>
      )}

      <Pressable
        onPress={handleSync}
        disabled={isSyncing || isLoading || !syncKey}
        style={{
          backgroundColor:
            isSyncing || isLoading || !syncKey ? "#ccc" : "#007AFF",
          paddingVertical: 16,
          borderRadius: 10,
          alignItems: "center",
        }}
      >
        {isSyncing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: "#fff", fontWeight: "700" }}>Sync Now</Text>
        )}
      </Pressable>

      <CalendarSettingsSection />

      {error && (
        <View
          style={{
            backgroundColor: "#fee",
            padding: 12,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#fcc",
          }}
        >
          <Text style={{ color: "#c00", fontSize: 12 }}>{error}</Text>
        </View>
      )}
    </ScrollView>
  );
}
