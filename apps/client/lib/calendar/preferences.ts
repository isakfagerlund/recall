import * as SecureStore from "expo-secure-store";

const SELECTED_CALENDARS_KEY = "recall_selected_calendar_ids";

export async function getSelectedCalendarIds(): Promise<string[]> {
  try {
    const raw = await SecureStore.getItemAsync(SELECTED_CALENDARS_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map((id) => String(id)) : [];
  } catch (err) {
    console.error("Error loading selected calendars:", err);
    return [];
  }
}

export async function setSelectedCalendarIds(ids: string[]): Promise<void> {
  try {
    await SecureStore.setItemAsync(
      SELECTED_CALENDARS_KEY,
      JSON.stringify(ids),
    );
  } catch (err) {
    console.error("Error saving selected calendars:", err);
  }
}

export async function clearSelectedCalendarIds(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(SELECTED_CALENDARS_KEY);
  } catch (err) {
    console.error("Error clearing selected calendars:", err);
  }
}
