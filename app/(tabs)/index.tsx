import { View } from '@/components/Themed';
import {
  Button,
  Host,
  HStack,
  TextField,
  TextFieldRef,
  VStack,
} from '@expo/ui/swift-ui';

import React, { useRef, useState } from 'react';
import { glassEffect, padding } from '@expo/ui/swift-ui/modifiers';
import { FlatList, Text } from 'react-native';

export default function TabOneScreen() {
  const fieldRef = useRef<TextFieldRef>(null);
  const [value, setValue] = useState('');
  const [items, setItems] = useState<Array<string>>(['Cool', 'Sick']);

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#D9D9D9',
        paddingTop: 72,
        paddingBottom: 124,
      }}
    >
      <FlatList
        style={{ width: '100%' }}
        data={items}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <View
            style={{ padding: 16, borderBottomWidth: 1, borderColor: '#eee' }}
          >
            <Text>{item}</Text>
          </View>
        )}
      />
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
              defaultValue="Hey"
            />
          </VStack>
          <Button
            systemImage="checkmark"
            variant="glassProminent"
            onPress={() => {
              setItems((prev) => [...prev, value]);
              setValue('');
              fieldRef.current?.setText('');
            }}
          />
        </HStack>
      </Host>
    </View>
  );
}
