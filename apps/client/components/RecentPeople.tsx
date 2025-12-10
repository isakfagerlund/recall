import { Person } from "@/types/person";
import { PersonCard } from "./PersonCard";
import {
  LegendList,
  LegendListRef,
  LegendListRenderItemProps,
} from "@legendapp/list";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform } from "react-native";
import { useEffect, useRef } from "react";

interface RecentPeopleProps {
  people: Person[];
}

export function RecentPeople({ people }: RecentPeopleProps) {
  const listRef = useRef<LegendListRef | null>(null);
  const insets = useSafeAreaInsets();
  const renderItem = ({ item }: LegendListRenderItemProps<Person>) => {
    return <PersonCard person={item} />;
  };

  useEffect(() => {
    listRef.current?.scrollToEnd();
  }, [people.length]);

  return (
    <LegendList
      ref={listRef}
      data={people}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{
        gap: 10,
        paddingBottom: 50,
      }}
      style={{ width: "100%", flex: 1 }}
      contentInsetAdjustmentBehavior={
        Platform.OS === "ios" ? "automatic" : undefined
      }
      scrollIndicatorInsets={
        Platform.OS === "ios" ? { top: insets.top } : undefined
      }
    />
  );
}
