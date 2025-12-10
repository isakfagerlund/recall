import { useCallback, useEffect, useRef, useState } from "react";
import * as Calendar from "expo-calendar";

import {
  getSelectedCalendarIds,
  setSelectedCalendarIds,
} from "@/lib/calendar/preferences";

interface UseCalendarEventsReturn {
  hasPermission: boolean | null;
  requestPermission: () => Promise<boolean>;
  getEventsForTime: (
    timestamp: Date,
    windowHours?: number,
  ) => Promise<Calendar.Event[]>;
  calendars: Calendar.Calendar[];
  isLoadingCalendars: boolean;
  refreshCalendars: () => Promise<void>;
  selectedCalendarIds: string[];
  updateSelectedCalendarIds: (ids: string[]) => Promise<void>;
}

/**
 * Hook for managing calendar permissions and fetching events
 */
export function useCalendarEvents(): UseCalendarEventsReturn {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [calendars, setCalendars] = useState<Calendar.Calendar[]>([]);
  const [isLoadingCalendars, setIsLoadingCalendars] = useState(false);
  const [selectedCalendarIds, setSelectedCalendarIdsState] = useState<
    string[]
  >([]);
  const selectedCalendarIdsRef = useRef<string[]>([]);

  const syncSelectedCalendars = useCallback(async (): Promise<string[]> => {
    try {
      const saved = await getSelectedCalendarIds();
      setSelectedCalendarIdsState(saved);
      selectedCalendarIdsRef.current = saved;
      return saved;
    } catch (err) {
      console.error("Error syncing selected calendars:", err);
      return [];
    }
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

  // Check permission status on mount
  useEffect(() => {
    checkPermissionStatus();
    syncSelectedCalendars();
  }, [checkPermissionStatus, syncSelectedCalendars]);

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

  const refreshCalendars = useCallback(async (): Promise<void> => {
    setIsLoadingCalendars(true);
    try {
      const permission = hasPermission ?? (await requestPermission());
      if (!permission) {
        setCalendars([]);
        return;
      }

      const allCalendars = await Calendar.getCalendarsAsync(
        Calendar.EntityTypes.EVENT,
      );
      setCalendars(allCalendars);
    } catch (err) {
      console.error("Error loading calendars:", err);
      setCalendars([]);
    } finally {
      setIsLoadingCalendars(false);
    }
  }, [hasPermission, requestPermission]);

  const updateSelectedCalendarIds = useCallback(
    async (ids: string[]): Promise<void> => {
      try {
        setSelectedCalendarIdsState(ids);
        selectedCalendarIdsRef.current = ids;
        await setSelectedCalendarIds(ids);
      } catch (err) {
        console.error("Error updating selected calendars:", err);
        const message =
          err instanceof Error
            ? err.message
            : "Failed to save calendar selection";
        throw new Error(message);
      }
    },
    [],
  );

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
        // Refresh selection so we use the latest saved choice
        const activeSelection = await syncSelectedCalendars();

        // Get all calendars
        const availableCalendars = await Calendar.getCalendarsAsync(
          Calendar.EntityTypes.EVENT,
        );
        const filteredCalendars =
          activeSelection.length > 0
            ? availableCalendars.filter((cal) =>
                activeSelection.includes(cal.id),
              )
            : availableCalendars;

        const calendarIds = filteredCalendars.map((cal) => cal.id);

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
    [hasPermission, requestPermission, syncSelectedCalendars],
  );

  return {
    hasPermission,
    requestPermission,
    getEventsForTime,
    calendars,
    isLoadingCalendars,
    refreshCalendars,
    selectedCalendarIds,
    updateSelectedCalendarIds,
  };
}
