import { View } from '@/components/Themed';
import {
  Button,
  CircularProgress,
  Host,
  HStack,
  TextField,
  TextFieldRef,
  VStack,
} from '@expo/ui/swift-ui';

import { format, intlFormat } from 'date-fns';

import React, { useRef, useState } from 'react';
import { glassEffect, padding } from '@expo/ui/swift-ui/modifiers';
import { apple } from '@react-native-ai/apple';
import { generateObject } from 'ai';
import { generatePersonSchema, Person } from '@/types/person';
import { Text } from 'react-native';
import * as Crypto from 'expo-crypto';

export default function TabOneScreen() {
  const fieldRef = useRef<TextFieldRef>(null);
  const [value, setValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [people, setPeople] = useState<Person[]>();
  const [error, setError] = useState('');

  const handlePersonSubmit = async (): Promise<void> => {
    if (!value.trim()) {
      setError('Please enter a person description');
      return;
    }

    setIsLoading(true);

    try {
      const result = await generateObject<typeof generatePersonSchema>({
        model: apple(),
        prompt: `
      You are extracting structured info about ONE person.
      
      Generate a well structured sentence in the description field from all the different inputs you get. Don not include the name in the description field.
      
      Input:
      ${value}
      `,
        schema: generatePersonSchema,
      });

      const person: Person = {
        ...result.object,
        id: Crypto.randomUUID(),
        createdAt: new Date(),
      };
      setPeople((prev) => (prev ? [...prev, person] : [person]));
      setValue('');
      console.log('Generated person:', person);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to generate person data';
      setError(message);
      console.error('Error generating person:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#D9D9D9',
        paddingTop: 72,
        paddingBottom: 124,
        paddingHorizontal: 18,
      }}
    >
      {people && <RecentPeople people={people} />}
      <Host matchContents style={{ width: 300, height: 300 }}>
        <HStack spacing={12}>
          <VStack
            modifiers={[
              glassEffect({
                shape: 'capsule',
                glass: {
                  interactive: true,
                  variant: 'clear',
                },
              }),
            ]}
          >
            <TextField
              ref={fieldRef}
              modifiers={[padding({ horizontal: 12, vertical: 6 })]}
              autocorrection={false}
              onChangeText={setValue}
            />
          </VStack>
          <Button
            systemImage={isLoading ? undefined : 'checkmark'}
            variant="glassProminent"
            onPress={async () => {
              await handlePersonSubmit();
              setValue('');
              fieldRef.current?.setText('');
            }}
          >
            <CircularProgress color="#fff" />
          </Button>
        </HStack>
      </Host>
    </View>
  );
}

const RecentPeople = ({ people }: { people: Person[] }) => {
  return (
    <View style={{ backgroundColor: '#D9D9D9', gap: 10 }}>
      {people.map((person) => (
        <PersonCard key={person.id} person={person} />
      ))}
    </View>
  );
};

const PersonCard = ({ person }: { person: Person }) => {
  return (
    <View
      style={{
        gap: 6,
        padding: 12,
        borderRadius: 18,
      }}
    >
      <Text style={{ fontWeight: 'bold' }}>{person.name}</Text>
      <Text>{person.description}</Text>
      <Text style={{ fontSize: 12 }}>
        {format(person.createdAt, 'MMM do pp')}
      </Text>
    </View>
  );
};
