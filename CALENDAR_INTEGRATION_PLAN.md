# Calendar Integration Plan

## Overview
Integrate native calendar access to track which calendar event a contact was added during. This will help users associate contacts with specific meetings, events, or time periods.

## Goals
- When a contact is added, automatically detect and store the current calendar event (if any)
- Display the calendar event information alongside each contact
- Handle edge cases (no calendar event, multiple events, permissions)

## Technical Requirements

### 1. Dependencies
- **expo-calendar**: Native calendar access for iOS and Android
- Already have: `expo-contacts`, `expo-sqlite`, `drizzle-orm`

### 2. Permissions
- iOS: `NSCalendarsUsageDescription` in `Info.plist` (via app.json)
- Android: `READ_CALENDAR` permission in `AndroidManifest.xml` (via app.json)

### 3. Database Schema Changes

#### Add to `people` table:
```sql
ALTER TABLE people ADD COLUMN calendar_event_id TEXT;
ALTER TABLE people ADD COLUMN calendar_event_title TEXT;
ALTER TABLE people ADD COLUMN calendar_event_start_date INTEGER;
ALTER TABLE people ADD COLUMN calendar_event_end_date INTEGER;
```

#### Update Drizzle schema (`db/schema.ts`):
- Add `calendarEventId`, `calendarEventTitle`, `calendarEventStartDate`, `calendarEventEndDate` fields
- Add index on `calendar_event_id` for efficient queries

#### Update TypeScript types (`types/person.ts`):
- Add optional calendar event fields to `personSchema` and `Person` type

### 4. Implementation Steps

#### Step 1: Install and Configure expo-calendar
1. Install: `bun add expo-calendar`
2. Add plugin to `app.json`:
   ```json
   {
     "plugins": [
       ["expo-calendar", {
         "calendarPermission": "Allow $(PRODUCT_NAME) to access your calendar."
       }]
     ]
   }
   ```
3. Add permissions to `app.json`:
   - iOS: Add `NSCalendarsUsageDescription` to `ios.infoPlist`
   - Android: Add `READ_CALENDAR` to `android.permissions`

#### Step 2: Create Calendar Service Utility
Create `lib/calendar.ts`:
- `requestCalendarPermissions()`: Request and check permissions
- `getCurrentCalendarEvent()`: Get the calendar event happening now (or within a small time window)
- `getCalendarEventById(id)`: Fetch a specific calendar event by ID
- Handle timezone considerations
- Handle multiple calendars (use default calendar or allow selection)

**Logic for detecting current event:**
- Query events that:
  - Start before or at current time
  - End after current time
  - Or started within last 5 minutes (to catch events that just started)
- If multiple events overlap, prefer:
  1. Events that started most recently
  2. Events with shorter duration (more specific)
  3. User's default calendar

#### Step 3: Update Database Schema
1. Update `db/schema.ts`:
   - Add calendar event fields to `people` table
   - Add index on `calendar_event_id`
2. Update `db/index.ts`:
   - Add migration logic in `initializeDatabase()` to add new columns
   - Handle existing databases gracefully
3. Update `types/person.ts`:
   - Add calendar event fields to schemas and types

#### Step 4: Integrate Calendar Detection
Update `app/(tabs)/index.tsx`:
- In `handlePersonSubmit()`:
  1. Before inserting person, call `getCurrentCalendarEvent()`
  2. If event found, store:
     - `calendarEventId`: Native calendar event ID
     - `calendarEventTitle`: Event title
     - `calendarEventStartDate`: Event start timestamp
     - `calendarEventEndDate`: Event end timestamp
  3. Handle permission errors gracefully (don't block contact creation)
  4. Handle no-event case (store null values)

#### Step 5: Display Calendar Event Information
Update `PersonCard` component in `app/(tabs)/index.tsx`:
- Show calendar event title if available
- Show event time range (formatted nicely)
- Use subtle styling (smaller text, muted color)
- Consider adding calendar icon

**UI Design:**
```
┌─────────────────────────────────┐
│ John Doe                        │
│ Met at conference, interested   │
│ in AI solutions                 │
│                                 │
│ 📅 Team Meeting                 │
│   2:00 PM - 3:00 PM            │
│                                 │
│ Dec 15, 2:30 PM                │
└─────────────────────────────────┘
```

#### Step 6: Handle Edge Cases
- **No calendar permission**: Silently skip calendar detection, don't show error
- **No current event**: Store null, don't show calendar info
- **Multiple overlapping events**: Use selection logic (most recent, shortest)
- **Event deleted from calendar**: Show stored title but indicate it may be outdated
- **Timezone changes**: Store UTC timestamps, display in local timezone

### 5. Code Structure

```
apps/client/
├── lib/
│   └── calendar.ts              # Calendar service utilities
├── db/
│   ├── schema.ts                # Updated with calendar fields
│   └── index.ts                 # Migration logic
├── types/
│   └── person.ts                # Updated Person type
└── app/
    └── (tabs)/
        └── index.tsx            # Updated to capture and display events
```

### 6. Calendar Service API Design

```typescript
// lib/calendar.ts

interface CalendarEvent {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  calendarId: string;
}

/**
 * Request calendar permissions
 * @returns true if granted, false otherwise
 */
export async function requestCalendarPermissions(): Promise<boolean>

/**
 * Get the calendar event currently happening (or just started)
 * @param timeWindowMinutes - How many minutes back to look for events that just started (default: 5)
 * @returns CalendarEvent if found, null otherwise
 */
export async function getCurrentCalendarEvent(
  timeWindowMinutes?: number
): Promise<CalendarEvent | null>

/**
 * Get calendar event by ID
 * @param eventId - Native calendar event ID
 * @returns CalendarEvent if found, null otherwise
 */
export async function getCalendarEventById(
  eventId: string
): Promise<CalendarEvent | null>
```

### 7. Testing Considerations

- Test with calendar permission granted/denied
- Test with no calendar events
- Test with single overlapping event
- Test with multiple overlapping events
- Test with event that just started
- Test with event that's ending soon
- Test timezone handling
- Test on both iOS and Android

### 8. Future Enhancements (Out of Scope)

- Allow manual selection of calendar event if multiple overlap
- Allow editing/updating calendar event association
- Show calendar event details in a detail view
- Filter contacts by calendar event
- Sync calendar event changes (if event is renamed/deleted)

## Implementation Order

1. ✅ Install expo-calendar and configure permissions
2. ✅ Create calendar service utility (`lib/calendar.ts`)
3. ✅ Update database schema (schema.ts, index.ts, types)
4. ✅ Integrate calendar detection in contact creation flow
5. ✅ Update UI to display calendar event information
6. ✅ Test edge cases and error handling
7. ✅ Test on both iOS and Android devices

## Notes

- Calendar event IDs are platform-specific and may not persist across devices
- Store event title and dates as backup in case event is deleted
- Consider privacy: calendar data is sensitive, handle permissions carefully
- Performance: Calendar queries should be fast, but cache if needed
