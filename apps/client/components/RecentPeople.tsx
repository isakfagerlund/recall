import { View } from '@/components/Themed';
import { Person } from '@/types/person';
import { PersonCard } from './PersonCard';

interface RecentPeopleProps {
  people: Person[];
}

export function RecentPeople({ people }: RecentPeopleProps) {
  return (
    <View style={{ backgroundColor: '#D9D9D9', gap: 10, width: '100%' }}>
      {people.map((person) => (
        <PersonCard key={person.id} person={person} />
      ))}
    </View>
  );
}

