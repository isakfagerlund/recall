import * as Calendar from 'expo-calendar';

export interface CalendarEvent {
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
export async function requestCalendarPermissions(): Promise<boolean> {
  try {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting calendar permissions:', error);
    return false;
  }
}

/**
 * Check if calendar permissions are granted
 * @returns true if granted, false otherwise
 */
export async function hasCalendarPermissions(): Promise<boolean> {
  try {
    const { status } = await Calendar.getCalendarPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error checking calendar permissions:', error);
    return false;
  }
}

/**
 * Get the default calendar ID
 */
async function getDefaultCalendarId(): Promise<string | null> {
  try {
    const calendars = await Calendar.getCalendarsAsync(
      Calendar.EntityTypes.EVENT
    );
    
    if (calendars.length === 0) {
      return null;
    }

    // Prefer the default calendar or the first writable calendar
    const defaultCalendar = calendars.find((cal) => cal.isPrimary) ?? calendars[0];
    return defaultCalendar.id;
  } catch (error) {
    console.error('Error getting default calendar:', error);
    return null;
  }
}

/**
 * Get the calendar event currently happening (or just started)
 * @param timeWindowMinutes - How many minutes back to look for events that just started (default: 5)
 * @returns CalendarEvent if found, null otherwise
 */
export async function getCurrentCalendarEvent(
  timeWindowMinutes: number = 5
): Promise<CalendarEvent | null> {
  try {
    // Check permissions first
    const hasPermission = await hasCalendarPermissions();
    if (!hasPermission) {
      const granted = await requestCalendarPermissions();
      if (!granted) {
        return null;
      }
    }

    const now = new Date();
    const startDate = new Date(now.getTime() - timeWindowMinutes * 60 * 1000);
    const endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Look ahead 24 hours

    // Get default calendar
    const defaultCalendarId = await getDefaultCalendarId();
    if (!defaultCalendarId) {
      return null;
    }

    // Fetch events from the default calendar
    const events = await Calendar.getEventsAsync(
      [defaultCalendarId],
      startDate,
      endDate
    );

    if (events.length === 0) {
      return null;
    }

    // Filter events that are currently happening or just started
    const currentEvents = events.filter((event) => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      
      // Event is current if:
      // 1. It started before or at now AND ends after now (currently happening)
      // 2. It started within the time window (just started)
      return (
        (eventStart <= now && eventEnd > now) ||
        (eventStart >= startDate && eventStart <= now)
      );
    });

    if (currentEvents.length === 0) {
      return null;
    }

    // If multiple events, prefer:
    // 1. Events that started most recently
    // 2. Events with shorter duration (more specific)
    const sortedEvents = currentEvents.sort((a, b) => {
      const aStart = new Date(a.startDate).getTime();
      const bStart = new Date(b.startDate).getTime();
      const aDuration = new Date(a.endDate).getTime() - aStart;
      const bDuration = new Date(b.endDate).getTime() - bStart;

      // Prefer more recent start time
      if (Math.abs(aStart - bStart) > 60000) {
        // More than 1 minute difference
        return bStart - aStart; // Most recent first
      }

      // If start times are close, prefer shorter duration
      return aDuration - bDuration;
    });

    const selectedEvent = sortedEvents[0];

    return {
      id: selectedEvent.id,
      title: selectedEvent.title ?? 'Untitled Event',
      startDate: new Date(selectedEvent.startDate),
      endDate: new Date(selectedEvent.endDate),
      calendarId: selectedEvent.calendarId ?? defaultCalendarId,
    };
  } catch (error) {
    console.error('Error getting current calendar event:', error);
    return null;
  }
}

/**
 * Get calendar event by ID
 * @param eventId - Native calendar event ID
 * @returns CalendarEvent if found, null otherwise
 */
export async function getCalendarEventById(
  eventId: string
): Promise<CalendarEvent | null> {
  try {
    const hasPermission = await hasCalendarPermissions();
    if (!hasPermission) {
      return null;
    }

    // Note: expo-calendar doesn't have a direct getEventById method
    // We need to search for it by querying a time range
    // For now, we'll return null and rely on stored data
    // In a production app, you might want to store more event metadata
    return null;
  } catch (error) {
    console.error('Error getting calendar event by ID:', error);
    return null;
  }
}
