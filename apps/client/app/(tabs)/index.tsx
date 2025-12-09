import { View } from "@/components/Themed";
import React, { useEffect, useState } from "react";
import { apple } from "@react-native-ai/apple";
import { generateObject } from "ai";
import { generatePersonSchema, Person } from "@/types/person";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useVoiceToText } from "@/components/useVoiceToText";
import { KeyboardToolbar } from "react-native-keyboard-controller";
import * as Crypto from "expo-crypto";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { db } from "@/db";
import { people as peopleTable, PersonRow } from "@/db/schema";
import { desc, isNull } from "drizzle-orm";
import { RecentPeople } from "@/components/RecentPeople";
import { PeopleInput } from "@/components/PeopleInput";

export default function TabOneScreen() {
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [keyboardOpen, setKeyobardOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const {
    isRecording,
    isTranscribing,
    error: voiceError,
    startRecording,
    stopRecording,
  } = useVoiceToText();

  // Use Live Query to reactively fetch people from database
  // Drizzle's mode: 'timestamp' automatically converts timestamps to Date objects
  // Filter out soft-deleted persons
  const { data: peopleData } = useLiveQuery(
    db
      .select()
      .from(peopleTable)
      .where(isNull(peopleTable.deletedAt))
      .orderBy(desc(peopleTable.createdAt)),
  );

  // Convert database rows to Person type
  // Drizzle's mode: 'timestamp' converts timestamps to Date objects
  const people: Person[] =
    peopleData?.map((row: PersonRow) => ({
      id: row.id,
      name: row.name,
      description: row.description ?? "",
      input: row.input,
      createdAt:
        row.createdAt instanceof Date ? row.createdAt : new Date(row.createdAt),
      updatedAt:
        row.updatedAt instanceof Date
          ? row.updatedAt
          : row.updatedAt
            ? new Date(row.updatedAt)
            : undefined,
      deletedAt:
        row.deletedAt instanceof Date
          ? row.deletedAt
          : row.deletedAt
            ? new Date(row.deletedAt)
            : undefined,
    })) ?? [];

  const handlePersonSubmit = async (): Promise<void> => {
    if (!value.trim()) {
      setError("Please enter a person description");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await generateObject<typeof generatePersonSchema>({
        model: apple(),
        prompt: `
      You are extracting structured info about ONE person.
      
      Generate a well structured sentence in the description field from all the different inputs you get. Don not include the name in the description field.
      
      If you cant figure out a description just pass an empty string. do not make up info from data that is not passed. I don't want any description that is not based on the input

      Input:
      ${value}
      `,
        schema: generatePersonSchema,
      });

      const now = new Date();
      const personId = Crypto.randomUUID();

      // Insert into database
      await db.insert(peopleTable).values({
        id: personId,
        name: result.object.name,
        description: result.object.description || null,
        input: value.trim(),
        createdAt: now,
        updatedAt: null,
      });

      setValue("");
      Keyboard.dismiss();
      console.log("Saved person to database:", personId);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to generate person data";
      setError(message);
      console.error("Error generating person:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceRecording = async (): Promise<void> => {
    try {
      setError(""); // Clear any previous errors
      if (isRecording) {
        // Stop recording and transcribe
        const transcribedText = await stopRecording();
        if (transcribedText) {
          setValue(transcribedText);
        } else {
          // If transcription failed, error is already set by the hook
          if (!voiceError) {
            setError("Failed to transcribe audio. Please try again.");
          }
        }
      } else {
        // Start recording
        await startRecording();
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to record audio";
      setError(message);
      console.error("Error with voice recording:", err);
    }
  };

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, () =>
      setKeyobardOpen(true),
    );
    const hideSub = Keyboard.addListener(hideEvent, () =>
      setKeyobardOpen(false),
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Sync voice errors to main error state
  useEffect(() => {
    if (voiceError) {
      setError(voiceError);
    }
  }, [voiceError]);

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "#D9D9D9", paddingHorizontal: 14 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
      >
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#D9D9D9",
            paddingTop: insets.top + 24,
            paddingBottom: (keyboardOpen ? 72 : 124) + insets.bottom,
            gap: 18,
          }}
        >
          <ScrollView
            style={{ width: "100%" }}
            keyboardShouldPersistTaps="handled"
          >
            {people.length > 0 && <RecentPeople people={people} />}
          </ScrollView>
          {error ? (
            <View
              style={{
                flex: 1,
                width: "100%",
                padding: 12,
                backgroundColor: "#FF3B30",
                borderRadius: 8,
                marginBottom: 8,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 14 }}>{error}</Text>
            </View>
          ) : null}

          <PeopleInput
            value={value}
            onChangeText={setValue}
            isRecording={isRecording}
            isTranscribing={isTranscribing}
            isLoading={isLoading}
            onVoiceRecording={handleVoiceRecording}
            onSubmit={handlePersonSubmit}
          />
        </View>
      </KeyboardAvoidingView>
      <KeyboardToolbar enabled={Platform.OS === "ios"}>
        <KeyboardToolbar.Done onPress={() => Keyboard.dismiss()} />
      </KeyboardToolbar>
    </>
  );
}
