// applib/utils/date-utils.ts
import {
  formatDistanceToNow,
  format,
  parseISO,
  isValid,
  formatRelative,
  formatDistance
} from 'date-fns';

/**
 * Format a date relative to now (e.g., "5 minutes ago")
 */
export function formatRelativeTime(date: string | Date): string {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(parsedDate)) {
      throw new Error('Invalid date');
    }
    return formatDistanceToNow(parsedDate, { addSuffix: true });
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'Invalid date';
  }
}

/**
 * Format a date relative to another date
 */
export function formatRelativeDate(date: string | Date, baseDate: Date = new Date()): string {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(parsedDate)) {
      throw new Error('Invalid date');
    }
    return formatRelative(parsedDate, baseDate);
  } catch (error) {
    console.error('Error formatting relative date:', error);
    return 'Invalid date';
  }
}

/**
 * Format a date to a specific format
 */
export function formatDateTime(
  date: string | Date,
  formatStr: string = 'PPP'
): string {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(parsedDate)) {
      throw new Error('Invalid date');
    }
    return format(parsedDate, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}

/**
 * Format the distance between two dates
 */
export function formatDateDistance(
  date: string | Date,
  baseDate: string | Date = new Date()
): string {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    const parsedBaseDate = typeof baseDate === 'string' ? parseISO(baseDate) : baseDate;

    if (!isValid(parsedDate) || !isValid(parsedBaseDate)) {
      throw new Error('Invalid date');
    }

    return formatDistance(parsedDate, parsedBaseDate, { addSuffix: true });
  } catch (error) {
    console.error('Error formatting date distance:', error);
    return 'Invalid date';
  }
}

/**
 * Convert an ISO string to a Date object
 */
export function toDate(date: string | Date): Date {
  if (date instanceof Date) {
    return date;
  }
  try {
    const parsedDate = parseISO(date);
    if (!isValid(parsedDate)) {
      throw new Error('Invalid date');
    }
    return parsedDate;
  } catch (error) {
    console.error('Error parsing date:', error);
    return new Date(); // Return current date as fallback
  }
}

/**
 * Get a human-readable timestamp for comments/posts
 */
export function getTimestamp(date: string | Date): string {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(parsedDate)) {
      throw new Error('Invalid date');
    }

    const now = new Date();
    const diffInHours = (now.getTime() - parsedDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return formatDistanceToNow(parsedDate, { addSuffix: true });
    } else if (diffInHours < 48) {
      return format(parsedDate, "'Yesterday at' h:mm a");
    } else if (diffInHours < 168) { // 7 days
      return format(parsedDate, "EEEE 'at' h:mm a");
    } else {
      return format(parsedDate, "MMM d, yyyy 'at' h:mm a");
    }
  } catch (error) {
    console.error('Error getting timestamp:', error);
    return 'Invalid date';
  }
}