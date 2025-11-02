import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';

export default function TabsLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: 'house', selected: 'house.fill' }} />
        <Label>Home</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="two">
        <Icon sf={{ default: 'person', selected: 'person.fill' }} />
        <Label>Contacts</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
