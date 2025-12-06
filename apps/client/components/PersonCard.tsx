import { useThemeColor, Text } from "@/components/Themed";
import { Person } from "@/types/person";
import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import { ActionSheetIOS, Alert, Platform, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useCalendarEvents } from "./useCalendarEvents";
import { getCalendarContext } from "@/utils/calendarMatch";
import { db } from "@/db";
import { people as peopleTable } from "@/db/schema";
import { eq } from "drizzle-orm";

interface PersonCardProps {
  person: Person;
}

const handleDeletePerson = async (personId: string): Promise<void> => {
  try {
    const now = new Date();
    await db
      .update(peopleTable)
      .set({ deletedAt: now, updatedAt: now })
      .where(eq(peopleTable.id, personId));
    console.log("Soft deleted person:", personId);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to delete person";
    console.error("Error deleting person:", err);
    Alert.alert("Error", message);
  }
};

export function PersonCard({ person }: PersonCardProps) {
  const scale = useSharedValue(1);
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  const { getEventsForTime, hasPermission } = useCalendarEvents();
  const [calendarContext, setCalendarContext] = useState<string | null>(null);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  // Fetch calendar context when component mounts
  useEffect(() => {
    if (hasPermission !== false) {
      getCalendarContext(person.createdAt, getEventsForTime)
        .then(setCalendarContext)
        .catch((err) => {
          console.error("Error fetching calendar context:", err);
        });
    }
  }, [person.createdAt, getEventsForTime, hasPermission]);

  const handleLongPress = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Delete"],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            handleDeletePerson(person.id);
          }
        },
      );
    } else {
      Alert.alert(
        "Delete Person",
        `Are you sure you want to delete ${person.name}?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => handleDeletePerson(person.id),
          },
        ],
      );
    }
  };

  const handlePressIn = () => {
    scale.value = withTiming(0.95, { duration: 400 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 400 });
  };

  return (
    <Pressable
      onLongPress={handleLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={{ width: "100%" }}
    >
      <Animated.View
        style={[
          {
            gap: 6,
            padding: 12,
            borderRadius: 18,
            backgroundColor,
            width: "100%",
          },
          animatedStyle,
        ]}
      >
        <Text style={{ fontWeight: "bold", color: textColor }}>
          {person.name}
        </Text>
        {person.description ? (
          <Text style={{ color: textColor }}>{person.description}</Text>
        ) : null}
        {calendarContext ? (
          <Text
            style={{
              fontSize: 12,
              fontStyle: "italic",
              color: textColor,
            }}
          >
            {calendarContext}
          </Text>
        ) : null}
        <Text style={{ fontSize: 12, color: textColor }}>
          {format(person.createdAt, "MMM do pp")}
        </Text>
      </Animated.View>
    </Pressable>
  );
}
