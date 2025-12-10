import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";

import { useCalendarEvents } from "@/components/useCalendarEvents";
import { Host, Switch, VStack } from "@expo/ui/swift-ui";
import { padding } from "@expo/ui/swift-ui/modifiers";

export function CalendarSettingsSection() {
  const [calendarError, setCalendarError] = useState<string | null>(null);
  const [isSavingCalendars, setIsSavingCalendars] = useState(false);
  const [pendingSelectedCalendars, setPendingSelectedCalendars] = useState<
    string[]
  >([]);

  const {
    hasPermission: calendarPermission,
    requestPermission: requestCalendarPermission,
    refreshCalendars,
    calendars,
    isLoadingCalendars,
    selectedCalendarIds,
    updateSelectedCalendarIds,
  } = useCalendarEvents();

  useFocusEffect(
    useCallback(() => {
      refreshCalendars();
    }, [refreshCalendars]),
  );

  useEffect(() => {
    setPendingSelectedCalendars(selectedCalendarIds);
  }, [selectedCalendarIds]);

  const handleRequestCalendarPermission = async () => {
    setCalendarError(null);
    const granted = await requestCalendarPermission();
    if (!granted) {
      setCalendarError(
        "Calendar permission is required to choose which calendars to use.",
      );
      return;
    }
    await refreshCalendars();
  };

  const handleToggleCalendar = (calendarId: string) => {
    setPendingSelectedCalendars((prev) => {
      const exists = prev.includes(calendarId);
      return exists
        ? prev.filter((id) => id !== calendarId)
        : [...prev, calendarId];
    });
  };

  const handleUseAllCalendars = () => {
    setPendingSelectedCalendars([]);
  };

  const handleSaveCalendars = async () => {
    setIsSavingCalendars(true);
    setCalendarError(null);
    try {
      await updateSelectedCalendarIds(pendingSelectedCalendars);

      Alert.alert("Calendar preference saved", "Restart app to see changes");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save calendar choice";
      setCalendarError(message);
      Alert.alert("Calendar selection", message);
      refreshCalendars();
    } finally {
      setIsSavingCalendars(false);
    }
  };

  return (
    <View style={{ gap: 8 }}>
      <Text style={{ fontSize: 16, fontWeight: "600" }}>Calendars</Text>
      <Text style={{ fontSize: 12, color: "#666" }}>
        Choose which calendars should be used when fetching event context.
      </Text>
      {calendarPermission ? (
        <View style={{ flex: 1, gap: 12 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            {isLoadingCalendars ? <ActivityIndicator /> : null}
          </View>

          {isLoadingCalendars ? (
            <ActivityIndicator />
          ) : calendars.length === 0 ? (
            <Text style={{ fontSize: 12, color: "#666" }}>
              No calendars found
            </Text>
          ) : (
            <View style={{ gap: 6 }}>
              <Host matchContents>
                <VStack
                  spacing={24}
                  modifiers={[padding({ horizontal: 4, vertical: 20 })]}
                >
                  <Switch
                    value={pendingSelectedCalendars.length === 0}
                    onValueChange={() => handleUseAllCalendars()}
                    label="Use all calendars"
                    variant="switch"
                  />
                  {calendars.map((calendar) => {
                    const isSelected = pendingSelectedCalendars.includes(
                      calendar.id,
                    );

                    return (
                      <Switch
                        key={calendar.id}
                        value={isSelected}
                        onValueChange={() => handleToggleCalendar(calendar.id)}
                        label={calendar.title}
                        variant="switch"
                      />
                    );
                  })}
                </VStack>
              </Host>
            </View>
          )}

          <Pressable
            onPress={handleSaveCalendars}
            disabled={
              isSavingCalendars ||
              isLoadingCalendars ||
              calendarPermission === null
            }
            style={{
              backgroundColor:
                isSavingCalendars ||
                isLoadingCalendars ||
                calendarPermission === null
                  ? "#ccc"
                  : "#007AFF",
              paddingVertical: 14,
              borderRadius: 10,
              alignItems: "center",
            }}
          >
            {isSavingCalendars ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontWeight: "700" }}>
                Save calendar choice
              </Text>
            )}
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={handleRequestCalendarPermission}
          style={{
            backgroundColor: "#007AFF",
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 8,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>
            Enable calendar access
          </Text>
        </Pressable>
      )}

      {calendarError ? (
        <View
          style={{
            backgroundColor: "#fee",
            padding: 12,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#fcc",
          }}
        >
          <Text style={{ color: "#c00", fontSize: 12 }}>{calendarError}</Text>
        </View>
      ) : null}
    </View>
  );
}
