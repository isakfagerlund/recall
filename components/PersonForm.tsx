import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { apple } from '@react-native-ai/apple';
import { generateObject } from 'ai';
import { useState } from 'react';
import { createStyles } from '@/theme/styles';
import { personSchema, type Person } from '@/types/person';

export default function PersonForm() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedPerson, setGeneratedPerson] = useState<Person | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePersonSubmit = async (): Promise<void> => {
    if (!input.trim()) {
      setError('Please enter a person description');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await generateObject<typeof personSchema>({
        model: apple(),
        prompt: `
        Summarize the person from the input in a clean structure

        Make it short and concise.

        Input: ${input}
        `,
        schema: personSchema,
      });

      const person: Person = result.object;
      setGeneratedPerson(person);
      setInput('');
      console.log('Generated person:', person);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to generate person data';
      setError(message);
      console.error('Error generating person:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-end' }}>
        <TextInput
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: '#e5e7eb',
            borderRadius: 8,
            padding: 12,
            fontSize: 16,
            minHeight: 100,
          }}
          placeholder="Describe the person..."
          placeholderTextColor="#9ca3af"
          value={input}
          onChangeText={setInput}
          editable={!loading}
          multiline
          numberOfLines={4}
        />

        <Pressable
          style={[
            createStyles.buttonPrimary,
            {
              borderRadius: 50,
              width: 50,
              height: 50,
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            },
          ]}
          onPress={handlePersonSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ fontSize: 24 }}>✓</Text>
          )}
        </Pressable>
      </View>

      {error && <Text style={{ color: 'red', marginTop: 10 }}>{error}</Text>}

      {generatedPerson && (
        <View style={{ marginTop: 20 }}>
          <Text>Name: {generatedPerson.name}</Text>
          <Text>Interests: {generatedPerson.interests.join(', ')}</Text>
          <Text>Extras: {generatedPerson.extras}</Text>
        </View>
      )}
    </View>
  );
}
