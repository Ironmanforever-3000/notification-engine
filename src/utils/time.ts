import { DateTime } from "luxon";

/**
 * Checks if the current moment (in the user's timezone) falls inside quiet hours.
 * Handles both normal intervals (09:00–17:00) and overnight intervals (22:00–07:00).
 */
export function isInsideQuietHours(
  timezone: string,
  start: string, // "HH:MM" format
  end: string    // "HH:MM" format
): boolean {
  const now = DateTime.now().setZone(timezone);
  const currentMinutes = now.hour * 60 + now.minute;

  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);

  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  // Normal interval: 09:00 → 17:00
  if (startMinutes < endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }

  // Overnight interval: 22:00 → 07:00
  return currentMinutes >= startMinutes || currentMinutes < endMinutes;
}
