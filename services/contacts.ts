import * as Contacts from 'expo-contacts';
import { Contact, ContactWithNote } from '@/types';
import { getNoteByContactId } from './database';

export async function requestContactsPermission(): Promise<boolean> {
  try {
    const { status } = await Contacts.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Failed to request contacts permission:', error);
    return false;
  }
}

export async function checkContactsPermission(): Promise<boolean> {
  try {
    const { status } = await Contacts.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Failed to check contacts permission:', error);
    return false;
  }
}

function mapContact(contact: Contacts.Contact): Contact {
  return {
    id: (contact as any).id || '',
    name: contact.name || 'Unknown',
    firstName: contact.firstName,
    lastName: contact.lastName,
    phoneNumbers: contact.phoneNumbers,
    emails: contact.emails,
    imageAvailable: contact.imageAvailable,
  };
}

export async function getAllContacts(): Promise<Contact[]> {
  try {
    const { data } = await Contacts.getContactsAsync({
      fields: [
        Contacts.Fields.FirstName,
        Contacts.Fields.LastName,
        Contacts.Fields.PhoneNumbers,
        Contacts.Fields.Emails,
        Contacts.Fields.ImageAvailable,
      ],
      sort: Contacts.SortTypes.FirstName,
    });

    return data.map(mapContact);
  } catch (error) {
    console.error('Failed to get contacts:', error);
    throw error;
  }
}

export async function getContactById(contactId: string): Promise<Contact | null> {
  try {
    const contact = await Contacts.getContactByIdAsync(contactId, [
      Contacts.Fields.FirstName,
      Contacts.Fields.LastName,
      Contacts.Fields.PhoneNumbers,
      Contacts.Fields.Emails,
      Contacts.Fields.ImageAvailable,
    ]);

    if (!contact) return null;
    return mapContact(contact);
  } catch (error) {
    console.error('Failed to get contact:', error);
    throw error;
  }
}

export async function getContactWithNote(contactId: string): Promise<ContactWithNote | null> {
  try {
    const contact = await getContactById(contactId);
    if (!contact) return null;

    const note = await getNoteByContactId(contactId);
    return {
      ...contact,
      note: note || undefined,
    };
  } catch (error) {
    console.error('Failed to get contact with note:', error);
    throw error;
  }
}

export async function searchContacts(query: string): Promise<Contact[]> {
  try {
    const allContacts = await getAllContacts();
    const lowerQuery = query.toLowerCase();

    return allContacts.filter((contact) => {
      return (
        contact.name.toLowerCase().includes(lowerQuery) ||
        contact.firstName?.toLowerCase().includes(lowerQuery) ||
        contact.lastName?.toLowerCase().includes(lowerQuery)
      );
    });
  } catch (error) {
    console.error('Failed to search contacts:', error);
    throw error;
  }
}
