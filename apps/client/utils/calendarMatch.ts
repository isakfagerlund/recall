import * as Calendar from "expo-calendar";
import { format } from "date-fns";

/**
 * Find the best matching calendar event for a given timestamp
 * Returns the event closest to the timestamp, or null if none found
 */
export function findBestMatchingEvent(
  events: Calendar.Event[],
  timestamp: Date,
): Calendar.Event | null {
  if (events.length === 0) {
    return null;
  }

  // Find the event with the start time closest to the contact creation time
  let bestMatch: Calendar.Event | null = null;
  let smallestDiff = Infinity;

  for (const event of events) {
    const eventStart = new Date(event.startDate);
    const diff = Math.abs(eventStart.getTime() - timestamp.getTime());

    if (diff < smallestDiff) {
      smallestDiff = diff;
      bestMatch = event;
    }
  }

  return bestMatch;
}

/**
 * Format a calendar event into a contextual description
 * Example: "Met during Church 12:30 service"
 */
export function formatEventDescription(event: Calendar.Event): string {
  const eventStart = new Date(event.startDate);
  const timeStr = format(eventStart, "h:mm a");
  const title = event.title ?? "event";

  return `Met during ${title} ${timeStr}`;
}

/**
 * Get calendar event context for a contact creation timestamp
 * Returns a formatted description if a matching event is found, null otherwise
 */
export async function getCalendarContext(
  timestamp: Date,
  getEventsForTime: (
    timestamp: Date,
    windowHours?: number,
  ) => Promise<Calendar.Event[]>,
): Promise<string | null> {
  try {
    const events = await getEventsForTime(timestamp, 1);
    const matchingEvent = findBestMatchingEvent(events, timestamp);

    if (!matchingEvent) {
      return null;
    }

    return formatEventDescription(matchingEvent);
  } catch (err) {
    console.error("Error getting calendar context:", err);
    return null;
  }
}
