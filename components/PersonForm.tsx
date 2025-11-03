import { View, Text, Button, Pressable, Alert } from 'react-native';
import { apple } from '@react-native-ai/apple';
import { generateObject, generateText } from 'ai';
import { useState } from 'react';
import { createStyles } from '@/theme/styles';
import z from 'zod/v4';

const personSchema = z.object({
  name: z.string(),
  interests: z.array(z.string()),
  extras: z.string(),
});

export default function PersonForm() {
  // const [generatedText, setGeneratedText] = useState();
  const [loading, setLoading] = useState(false);

  const handlePersonSubmit = async (personSummary: string) => {
    setLoading(true);
    const result = await generateObject({
      model: apple(),
      prompt: `
      Summarize the person from the input in a clean structure

      Make it short and concise.
      
      Input: ${personSummary}
      `,
      schema: personSchema,
    });

    console.log(result.object);
    setLoading(false);
  };

  return (
    <View>
      <Text>Form here</Text>
      <Pressable
        style={createStyles.buttonPrimary}
        onPress={() =>
          handlePersonSubmit(
            'uhh okay so like… craig right, craig umm he’s that guy who’s super into cats — like not just normal cats but like he follows cat accounts, you know? — and then he’s always talking about his board game nights like it’s the olympics or something, and uh yeah he also, apparently, runs marathons which is crazy because like… have you seen the size of his forehead? i swear you could project the race map on it. anyway yeah that’s craig, cats, cardboard, cardio, and a comically large cranial situation.'
          )
        }
      >
        <Text>Generate</Text>
      </Pressable>
      <Text>{loading ? 'Loading...' : ''}</Text>
    </View>
  );
}
