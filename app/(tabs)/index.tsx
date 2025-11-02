import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import { Link } from 'expo-router';
import { createStyles } from '@/theme/styles';

export default function TabOneScreen() {
  return (
    <View style={createStyles.flexCenter}>
      <Text style={createStyles.textTitle}>Tab One</Text>
      <Link href="/modal">Open</Link>
      <View
        style={createStyles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      <EditScreenInfo path="app/(tabs)/index.tsx" />
    </View>
  );
}
