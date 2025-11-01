export interface ContactNote {
  id: string;
  contactId: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface Contact {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phoneNumbers?: Array<{ label?: string; number?: string }>;
  emails?: Array<{ label?: string; email?: string }>;
  imageAvailable?: boolean;
}

export interface ContactWithNote extends Contact {
  note?: ContactNote;
}
