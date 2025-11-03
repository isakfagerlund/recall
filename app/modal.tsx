import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';

import { Text, View } from '@/components/Themed';
import { createStyles } from '@/theme/styles';

export default function ModalScreen() {
  return (
    <View style={createStyles.flexCenter}>
      <Text style={createStyles.textTitle}>Modal</Text>
      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}
