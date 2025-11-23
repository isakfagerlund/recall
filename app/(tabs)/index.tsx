import { View, useThemeColor } from '@/components/Themed';
import {
  Button,
  CircularProgress,
  Host,
  HStack,
  TextField,
  TextFieldRef,
  VStack,
} from '@expo/ui/swift-ui';

import { format } from 'date-fns';

import React, { useRef, useState } from 'react';
import { glassEffect, padding } from '@expo/ui/swift-ui/modifiers';
import { apple } from '@react-native-ai/apple';
import { generateObject } from 'ai';
import { generatePersonSchema, Person } from '@/types/person';
import {
  ActionSheetIOS,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
} from 'react-native';
import { KeyboardToolbar } from 'react-native-keyboard-controller';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import * as Crypto from 'expo-crypto';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { db } from '@/db';
import { people as peopleTable, PersonRow } from '@/db/schema';
import { desc, eq, isNull } from 'drizzle-orm';

export default function TabOneScreen() {
  const fieldRef = useRef<TextFieldRef>(null);
  const [value, setValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Use Live Query to reactively fetch people from database
  // Drizzle's mode: 'timestamp' automatically converts timestamps to Date objects
  // Filter out soft-deleted persons
  const { data: peopleData } = useLiveQuery(
    db
      .select()
      .from(peopleTable)
      .where(isNull(peopleTable.deletedAt))
      .orderBy(desc(peopleTable.createdAt))
  );

  // Convert database rows to Person type
  // Drizzle's mode: 'timestamp' converts timestamps to Date objects
  const people: Person[] =
    peopleData?.map((row: PersonRow) => ({
      id: row.id,
      name: row.name,
      description: row.description ?? '',
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
      setError('Please enter a person description');
      return;
    }

    setIsLoading(true);
    setError('');

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
        createdAt: now,
        updatedAt: null,
      });

      setValue('');
      Keyboard.dismiss();
      console.log('Saved person to database:', personId);
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
    <>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: '#D9D9D9' }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#D9D9D9',
            paddingTop: 72,
            paddingBottom: 124,
            paddingHorizontal: 18,
            gap: 18,
          }}
        >
          <ScrollView keyboardShouldPersistTaps="handled">
            {people.length > 0 && <RecentPeople people={people} />}
          </ScrollView>
          <Host matchContents style={{ width: '100%', height: 300 }}>
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
      </KeyboardAvoidingView>
      <KeyboardToolbar enabled={Platform.OS === 'ios'}>
        <KeyboardToolbar.Done onPress={() => Keyboard.dismiss()} />
      </KeyboardToolbar>
    </>
  );
}

const RecentPeople = ({ people }: { people: Person[] }) => {
  return (
    <View style={{ backgroundColor: '#D9D9D9', gap: 10, width: '100%' }}>
      {people.map((person) => (
        <PersonCard key={person.id} person={person} />
      ))}
    </View>
  );
};

const PersonCard = ({ person }: { person: Person }) => {
  const scale = useSharedValue(1);
  const backgroundColor = useThemeColor({}, 'background');

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handleLongPress = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Delete'],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            handleDeletePerson(person.id);
          }
        }
      );
    } else {
      Alert.alert(
        'Delete Person',
        `Are you sure you want to delete ${person.name}?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => handleDeletePerson(person.id),
          },
        ]
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
      style={{ width: '100%' }}
    >
      <Animated.View
        style={[
          {
            gap: 6,
            padding: 12,
            borderRadius: 18,
            backgroundColor,
            width: '100%',
          },
          animatedStyle,
        ]}
      >
        <Text style={{ fontWeight: 'bold' }}>{person.name}</Text>
        <Text>{person.description}</Text>
        <Text style={{ fontSize: 12 }}>
          {format(person.createdAt, 'MMM do pp')}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

const handleDeletePerson = async (personId: string): Promise<void> => {
  try {
    const now = new Date();
    await db
      .update(peopleTable)
      .set({ deletedAt: now, updatedAt: now })
      .where(eq(peopleTable.id, personId));
    console.log('Soft deleted person:', personId);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to delete person';
    console.error('Error deleting person:', err);
    Alert.alert('Error', message);
  }
};
