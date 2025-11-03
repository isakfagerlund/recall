import { View } from '@/components/Themed';
import { createStyles } from '@/theme/styles';

import PersonForm from '@/components/PersonForm';

export default function TabOneScreen() {
  return (
    <View style={createStyles.flexCenter}>
      <PersonForm />
    </View>
  );
}
