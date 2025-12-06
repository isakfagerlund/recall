import React, { useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  Text,
  TextInput,
  Pressable,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { db } from "@/db";
import { people as peopleTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PersonRow } from "@/db/schema";

export default function PersonEditModal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load person data on mount
  useEffect(() => {
    if (!id) {
      setError("Person ID is required");
      return;
    }

    const loadPerson = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await db
          .select()
          .from(peopleTable)
          .where(eq(peopleTable.id, id))
          .limit(1);

        if (result.length === 0) {
          setError("Person not found");
          return;
        }

        const person = result[0] as PersonRow;
        setName(person.name);
        setDescription(person.description ?? "");
      } catch (err) {
        console.error("Error loading person", err);
        const message =
          err instanceof Error ? err.message : "Failed to load person";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadPerson();
  }, [id]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (!id) {
      setError("Person ID is required");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const now = new Date();
      await db
        .update(peopleTable)
        .set({
          name: name.trim(),
          description: description.trim() || null,
          updatedAt: now,
        })
        .where(eq(peopleTable.id, id));

      router.back();
    } catch (err) {
      console.error("Error saving person", err);
      const message =
        err instanceof Error ? err.message : "Failed to save person";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <>
        <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
        <View
          style={{
            flex: 1,
            backgroundColor: "#D9D9D9",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <Text style={{ fontSize: 16 }}>Loading...</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
      <ScrollView
        style={{ flex: 1, backgroundColor: "#D9D9D9" }}
        contentContainerStyle={{ padding: 20, gap: 16 }}
      >
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>Edit Person</Text>

        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: "600" }}>Name</Text>
          <TextInput
            value={name}
            onChangeText={(text) => {
              setName(text);
              setError(null);
            }}
            placeholder="Enter name"
            style={{
              backgroundColor: "#fff",
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#ccc",
              paddingHorizontal: 12,
              paddingVertical: 10,
              fontSize: 16,
            }}
            autoCapitalize="words"
            autoCorrect={false}
            editable={!isSaving}
          />
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: "600" }}>Description</Text>
          <TextInput
            value={description}
            onChangeText={(text) => {
              setDescription(text);
              setError(null);
            }}
            placeholder="Enter description (optional)"
            style={{
              backgroundColor: "#fff",
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#ccc",
              paddingHorizontal: 12,
              paddingVertical: 10,
              minHeight: 100,
              fontSize: 16,
            }}
            multiline
            autoCapitalize="sentences"
            autoCorrect={true}
            editable={!isSaving}
          />
        </View>

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

        <View style={{ flexDirection: "row", gap: 12 }}>
          <Pressable
            onPress={handleCancel}
            disabled={isSaving}
            style={{
              flex: 1,
              backgroundColor: "#fff",
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 8,
              alignItems: "center",
              opacity: isSaving ? 0.6 : 1,
            }}
          >
            <Text style={{ color: "#007AFF", fontWeight: "600" }}>Cancel</Text>
          </Pressable>
          <Pressable
            onPress={handleSave}
            disabled={isSaving || !name.trim()}
            style={{
              flex: 1,
              backgroundColor:
                isSaving || !name.trim() ? "#ccc" : "#007AFF",
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>
              {isSaving ? "Saving..." : "Save"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}

