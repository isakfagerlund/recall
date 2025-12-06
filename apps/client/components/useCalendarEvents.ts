import { useState, useCallback, useEffect } from "react";
import * as Calendar from "expo-calendar";

interface UseCalendarEventsReturn {
  hasPermission: boolean | null;
  requestPermission: () => Promise<boolean>;
  getEventsForTime: (
    timestamp: Date,
    windowHours?: number,
  ) => Promise<Calendar.Event[]>;
}

/**
 * Hook for managing calendar permissions and fetching events
 */
export function useCalendarEvents(): UseCalendarEventsReturn {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Check permission status on mount
  useEffect(() => {
    checkPermissionStatus();
  }, []);

  const checkPermissionStatus = useCallback(async () => {
    try {
      const { status } = await Calendar.getCalendarPermissionsAsync();
      setHasPermission(status === "granted");
    } catch (err) {
      console.error("Error checking calendar permissions:", err);
      setHasPermission(false);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      const granted = status === "granted";
      setHasPermission(granted);
      return granted;
    } catch (err) {
      console.error("Error requesting calendar permissions:", err);
      setHasPermission(false);
      return false;
    }
  }, []);

  const getEventsForTime = useCallback(
    async (
      timestamp: Date,
      windowHours: number = 1,
    ): Promise<Calendar.Event[]> => {
      // If permission not granted, return empty array
      if (hasPermission === false) {
        return [];
      }

      // Request permission if not yet checked
      if (hasPermission === null) {
        const granted = await requestPermission();
        if (!granted) {
          return [];
        }
      }

      try {
        // Get all calendars
        const calendars = await Calendar.getCalendarsAsync(
          Calendar.EntityTypes.EVENT,
        );
        const calendarIds = calendars.map((cal) => cal.id);

        if (calendarIds.length === 0) {
          return [];
        }

        // Calculate time window (±windowHours)
        const startDate = new Date(timestamp);
        startDate.setHours(startDate.getHours() - windowHours);

        const endDate = new Date(timestamp);
        endDate.setHours(endDate.getHours() + windowHours);

        // Fetch events in the time window
        const events = await Calendar.getEventsAsync(
          calendarIds,
          startDate,
          endDate,
        );

        return events;
      } catch (err) {
        console.error("Error fetching calendar events:", err);
        return [];
      }
    },
    [hasPermission, requestPermission],
  );

  return {
    hasPermission,
    requestPermission,
    getEventsForTime,
  };
}
