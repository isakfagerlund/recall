import ContactsComponent from '@/components/Contacts';
import { Text, View } from '@/components/Themed';
import { createStyles } from '@/theme/styles';

export default function TabTwoScreen() {
  return (
    <View style={createStyles.flexCenter}>
      <Text style={createStyles.textTitle}>Contacts</Text>
      <ContactsComponent />
    </View>
  );
}
