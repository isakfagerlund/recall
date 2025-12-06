import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { getSyncKey, hasSyncKey } from "@/lib/sync/key";
import { performSync } from "@/lib/sync/sync";
import { db } from "@/db";
import { people as peopleTable } from "@/db/schema";
import { desc } from "drizzle-orm";
import * as Clipboard from "expo-clipboard";

export default function SyncButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncKey, setSyncKey] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    loadSyncKey();
    loadLastSync();
  }, []);

  const loadSyncKey = async () => {
    try {
      // Always call getSyncKey so it generates and stores one if missing
      const key = await getSyncKey();
      setSyncKey(key);
    } catch (err) {
      console.error("Error loading sync key", err);
      setError("Failed to load sync key");
    }
  };

  const loadLastSync = async () => {
    try {
      // Get the most recent updated_at timestamp as a proxy for last sync
      const result = await db
        .select()
        .from(peopleTable)
        .orderBy(desc(peopleTable.updatedAt))
        .limit(1);

      if (result.length > 0 && result[0].updatedAt) {
        const updatedAt =
          result[0].updatedAt instanceof Date
            ? result[0].updatedAt
            : new Date(result[0].updatedAt);
        setLastSync(updatedAt);
      }
    } catch (err) {
      console.error("Error loading last sync:", err);
    }
  };

  const handleSync = async () => {
    if (!syncKey) {
      Alert.alert("Error", "No sync key found. Please restart the app.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await performSync(syncKey);
      await loadLastSync();
      Alert.alert("Success", "Sync completed successfully");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to sync";
      setError(message);
      Alert.alert("Sync Failed", message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyKey = async () => {
    if (!syncKey) return;

    if (Platform.OS === "web") {
      await navigator.clipboard.writeText(syncKey);
    } else {
      await Clipboard.setStringAsync(syncKey);
    }

    Alert.alert("Copied", "Sync key copied to clipboard");
  };

  if (!syncKey) {
    return (
      <View style={{ padding: 16, alignItems: "center" }}>
        <Text style={{ color: "#666" }}>Generating sync key...</Text>
      </View>
    );
  }

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <View style={{ gap: 8 }}>
        <Text style={{ fontSize: 16, fontWeight: "bold" }}>Sync Key</Text>
        <Pressable onPress={handleCopyKey}>
          <View
            style={{
              backgroundColor: "#f0f0f0",
              padding: 12,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#ddd",
            }}
          >
            <Text
              style={{ fontSize: 12, fontFamily: "monospace" }}
              numberOfLines={2}
            >
              {syncKey}
            </Text>
          </View>
        </Pressable>
        <Text style={{ fontSize: 12, color: "#666" }}>
          Tap to copy. Save this key to restore your data!
        </Text>
      </View>

      {lastSync && (
        <Text style={{ fontSize: 12, color: "#666" }}>
          Last synced: {lastSync.toLocaleString()}
        </Text>
      )}

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

      <Pressable
        onPress={handleSync}
        disabled={isLoading}
        style={{
          backgroundColor: isLoading ? "#ccc" : "#007AFF",
          padding: 16,
          borderRadius: 8,
          alignItems: "center",
        }}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Sync Now</Text>
        )}
      </Pressable>
    </View>
  );
}
