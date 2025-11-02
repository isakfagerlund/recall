import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';
import * as Contacts from 'expo-contacts';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ContactsComponent() {
  const [contacts, setContacts] = useState<Contacts.Contact[]>([]);

  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.Emails],
        });

        if (data.length > 0) {
          const contact = data[0];
          console.log(contact);
          setContacts(data);
        }
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contacts Module Example</Text>
      {contacts.map((contact, i) => (
        <Text key={`${contact.name} ${i}`}>{contact.name}</Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
  },
});
