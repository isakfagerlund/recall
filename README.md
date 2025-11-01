# Recall - Contact Notes App

Recall is an iOS app that helps you remember important details about the people in your life by allowing you to take notes on your contacts.

## Features

- **Access iOS Contacts**: Read contacts directly from your device (synced via iCloud)
- **Take Notes**: Write and save notes for any contact
- **Search Contacts**: Quickly find contacts with built-in search
- **View All Notes**: Browse all your notes in one place
- **Local Storage**: All notes are stored locally on your device using SQLite

## Tech Stack

- **React Native** with **Expo SDK 54**
- **Expo Router** for file-based navigation
- **expo-contacts** for iOS Contacts access
- **expo-sqlite** for local database storage
- **TypeScript** for type safety

## Architecture (V0 - Local-Only)

### Data Strategy
1. **Contacts**: Read-only access from iOS CNContactStore (iCloud already syncs)
2. **Notes**: Stored locally in SQLite database
3. **No Sync**: Local device only (sync can be added later)

### Database Schema
```sql
CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  contactId TEXT NOT NULL,
  content TEXT NOT NULL,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
);
CREATE INDEX idx_contactId ON notes(contactId);
```

## Project Structure

```
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          # Contacts list screen
│   │   └── explore.tsx        # All notes screen
│   ├── contact/
│   │   └── [id].tsx          # Contact detail + notes editor
│   └── _layout.tsx           # Root layout with navigation
├── services/
│   ├── contacts.ts           # iOS Contacts API service
│   └── database.ts           # SQLite database service
├── types/
│   └── index.ts              # TypeScript type definitions
├── components/               # Reusable UI components
└── constants/
    └── theme.ts              # App theme and colors
```

## Getting Started

### Prerequisites
- Node.js 18+
- iOS Simulator or iOS device
- Expo CLI

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on iOS:
```bash
npm run ios
```

Or press `i` in the terminal after running `npm start`.

## Permissions

The app requires the following iOS permission:
- **Contacts** (`NSContactsUsageDescription`): To read your contacts and help you take notes about them

Permission is requested on first launch.

## Future Enhancements

### Sync Options
- **CloudKit** (iOS-only): Native iCloud sync for Apple ecosystem
- **Supabase/Backend** (Cross-platform): For iOS + Android support

### Features
- Rich text notes with formatting
- Tags and categories
- Reminders and notifications
- Export functionality
- Note attachments (photos, files)
- Note sharing

## Development Commands

- `npm start` - Start Expo development server
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint

## License

Private project
