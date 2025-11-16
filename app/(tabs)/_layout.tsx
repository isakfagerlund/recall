import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';

export default function TabsLayout() {
  const navigation = useNavigation();

  useEffect(() => {
    const unsub = navigation.addListener('state', () => {
      Haptics.selectionAsync().catch(console.error);
    });
    return unsub;
  }, [navigation]);

  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: 'house', selected: 'house.fill' }} />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      {/* 
      <NativeTabs.Trigger name="two">
        <Icon sf={{ default: 'person', selected: 'person.fill' }} />
        <Label>Contacts</Label>
      </NativeTabs.Trigger> */}
    </NativeTabs>
  );
}
