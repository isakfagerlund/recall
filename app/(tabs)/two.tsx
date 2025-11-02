import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import { createStyles } from '@/theme/styles';

export default function TabTwoScreen() {
  return (
    <View style={createStyles.flexCenter}>
      <Text style={createStyles.textTitle}>Tab Two</Text>
      <View
        style={createStyles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      <EditScreenInfo path="app/(tabs)/two.tsx" />
    </View>
  );
}
