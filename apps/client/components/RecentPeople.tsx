import { View } from "@/components/Themed";
import { Person } from "@/types/person";
import { PersonCard } from "./PersonCard";
import { LegendList, LegendListRenderItemProps } from "@legendapp/list";

interface RecentPeopleProps {
  people: Person[];
}

export function RecentPeople({ people }: RecentPeopleProps) {
  const renderItem = ({ item }: LegendListRenderItemProps<Person>) => {
    return <PersonCard person={item} />;
  };

  return (
    <View
      style={{
        backgroundColor: "#D9D9D9",
        gap: 10,
        width: "100%",
      }}
    >
      <LegendList
        data={people}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 10 }}
      />
    </View>
  );
}
